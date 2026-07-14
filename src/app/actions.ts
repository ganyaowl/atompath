'use server';

import { redirect } from 'next/navigation';
import { refresh } from 'next/cache';
import { createSession, destroySession, getSession, requireRole } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/password';
import { getSkills } from '@/lib/resident-data';
import type { ActionResult } from '@/lib/types';
import {
  assessmentSchema,
  fieldErrors,
  formDataObject,
  loginSchema,
  profileSchema,
  registrationSchema,
} from '@/lib/validation';

function failure(error: string, fields?: Record<string, string[]>): ActionResult<never> {
  return { success: false, error, fieldErrors: fields };
}

export async function login(formData: FormData): Promise<ActionResult<never>> {
  const parsed = loginSchema.safeParse(formDataObject(formData));
  if (!parsed.success) return failure('Проверьте введенные данные', fieldErrors(parsed.error));

  const db = await getDb();
  const user = await db.get<{ id: number; password_hash: string | null }>(
    'SELECT id, password_hash FROM users WHERE email = ? COLLATE NOCASE AND role = ?',
    [parsed.data.email, parsed.data.role],
  );
  if (!user?.password_hash || !(await verifyPassword(parsed.data.password, user.password_hash))) {
    return failure('Неверный email, пароль или роль');
  }

  await createSession(user.id);
  redirect('/dashboard');
}

export async function registerResident(formData: FormData): Promise<ActionResult<never>> {
  const values = formDataObject(formData);
  const parsed = registrationSchema.safeParse({
    ...values,
    currentPosition: values.currentPosition ?? '',
    experience: values.experience ?? '',
    region: values.region ?? '',
  });
  if (!parsed.success) return failure('Проверьте введенные данные', fieldErrors(parsed.error));
  if (values.role && values.role !== 'resident') return failure('Публичная регистрация доступна только жителям');

  const db = await getDb();
  try {
    const result = await db.run(
      `INSERT INTO users (email, password_hash, role, name, current_position, experience, region, skills)
       VALUES (?, ?, 'resident', ?, ?, ?, ?, '')`,
      [
        parsed.data.email.toLowerCase(),
        await hashPassword(parsed.data.password),
        parsed.data.name,
        parsed.data.currentPosition,
        parsed.data.experience,
        parsed.data.region,
      ],
    );
    await createSession(result.lastID!);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return failure('Пользователь с таким email уже существует');
    }
    return failure('Не удалось создать учетную запись');
  }
  redirect('/dashboard');
}

export const register = registerResident;

export async function logout(): Promise<never> {
  await destroySession();
  redirect('/');
}

export async function getCurrentUser() {
  return getSession();
}

export async function updateProfile(formData: FormData): Promise<ActionResult<undefined>> {
  const user = await requireRole('resident');
  const parsed = profileSchema.safeParse(formDataObject(formData));
  if (!parsed.success) return failure('Проверьте профиль', fieldErrors(parsed.error));

  const db = await getDb();
  await db.run(
    'UPDATE users SET name = ?, current_position = ?, experience = ?, region = ? WHERE id = ?',
    [parsed.data.name, parsed.data.currentPosition, parsed.data.experience, parsed.data.region, user.id],
  );
  refresh();
  return { success: true, data: undefined };
}

function parseAssessment(formData: FormData) {
  const values = formDataObject(formData);
  const responses = Array.from(formData.entries())
    .filter(([key]) => key.startsWith('skill_'))
    .map(([key, value]) => ({ skillId: Number(key.slice(6)), level: Number(value) }));
  return assessmentSchema.safeParse({ ...values, responses });
}

async function persistAssessment(formData: FormData, status: 'draft' | 'completed'): Promise<ActionResult<{ assessmentId: number }>> {
  const user = await requireRole('resident');
  const parsed = parseAssessment(formData);
  if (!parsed.success) return failure('Заполните профиль и оценки навыков', fieldErrors(parsed.error));

  const activeSkills = await getSkills();
  const submittedIds = new Set(parsed.data.responses.map((item) => item.skillId));
  if (status === 'completed' && activeSkills.some((skill) => !submittedIds.has(skill.id))) {
    return failure('Оцените каждый навык перед завершением');
  }

  const db = await getDb();
  await db.exec('BEGIN IMMEDIATE');
  try {
    const existing = await db.get<{ id: number }>(
      "SELECT id FROM assessments WHERE user_id = ? AND status = 'draft' ORDER BY id DESC LIMIT 1",
      user.id,
    );
    let assessmentId = existing?.id;
    if (assessmentId) {
      await db.run(
        `UPDATE assessments SET status = ?, current_position = ?, experience = ?, region = ?, certifications = ?,
         completed_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND user_id = ?`,
        [status, parsed.data.currentPosition, parsed.data.experience, parsed.data.region, parsed.data.certifications, status, assessmentId, user.id],
      );
    } else {
      const result = await db.run(
        `INSERT INTO assessments (user_id, status, current_position, experience, region, certifications, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END)`,
        [user.id, status, parsed.data.currentPosition, parsed.data.experience, parsed.data.region, parsed.data.certifications, status],
      );
      assessmentId = result.lastID!;
    }

    for (const response of parsed.data.responses) {
      await db.run(
        `INSERT INTO assessment_responses (assessment_id, skill_id, level) VALUES (?, ?, ?)
         ON CONFLICT(assessment_id, skill_id) DO UPDATE SET level = excluded.level`,
        [assessmentId, response.skillId, response.level],
      );
    }
    await db.run(
      'UPDATE users SET current_position = ?, experience = ?, region = ? WHERE id = ?',
      [parsed.data.currentPosition, parsed.data.experience, parsed.data.region, user.id],
    );
    if (status === 'completed') await db.run('DELETE FROM user_pathways WHERE user_id = ?', user.id);
    await db.exec('COMMIT');
    return { success: true, data: { assessmentId } };
  } catch (error) {
    await db.exec('ROLLBACK');
    if (error instanceof Error && error.message.includes('FOREIGN KEY')) return failure('Обнаружен неизвестный навык');
    return failure('Не удалось сохранить оценку');
  }
}

export async function saveAssessmentDraft(formData: FormData) {
  return persistAssessment(formData, 'draft');
}

export async function submitAssessment(formData: FormData) {
  const result = await persistAssessment(formData, 'completed');
  if (result.success) redirect('/dashboard');
  return result;
}

export async function selectPathway(professionId: number): Promise<ActionResult<undefined>> {
  const user = await requireRole('resident');
  if (!Number.isInteger(professionId) || professionId <= 0) return failure('Некорректная профессия');
  const db = await getDb();
  const allowed = await db.get(
    `SELECT 1 FROM profession_skills ps
     WHERE ps.profession_id = ? AND EXISTS (
       SELECT 1 FROM assessments WHERE user_id = ? AND status = 'completed'
     )`,
    [professionId, user.id],
  );
  if (!allowed) return failure('Профессия недоступна для выбора');
  await db.run(
    `INSERT INTO user_pathways (user_id, profession_id) VALUES (?, ?)
     ON CONFLICT(user_id) DO UPDATE SET profession_id = excluded.profession_id, selected_at = CURRENT_TIMESTAMP`,
    [user.id, professionId],
  );
  refresh();
  return { success: true, data: undefined };
}

export async function enrollCourse(courseId: number): Promise<ActionResult<undefined>> {
  const user = await requireRole('resident');
  if (!Number.isInteger(courseId) || courseId <= 0) return failure('Некорректный курс');
  const db = await getDb();
  const course = await db.get('SELECT 1 FROM courses WHERE id = ?', courseId);
  if (!course) return failure('Курс не найден');
  await db.run('INSERT OR IGNORE INTO user_courses (user_id, course_id, progress) VALUES (?, ?, 0)', [user.id, courseId]);
  refresh();
  return { success: true, data: undefined };
}

export async function updateCourseProgress(courseId: number, progress: number): Promise<ActionResult<undefined>> {
  const user = await requireRole('resident');
  if (!Number.isInteger(progress) || progress < 0 || progress > 100) return failure('Прогресс должен быть от 0 до 100');
  const db = await getDb();
  const current = await db.get<{ progress: number }>('SELECT progress FROM user_courses WHERE user_id = ? AND course_id = ?', [user.id, courseId]);
  if (!current) return failure('Сначала запишитесь на курс');
  if (progress < current.progress) return failure('Прогресс нельзя уменьшить');
  await db.run('UPDATE user_courses SET progress = ? WHERE user_id = ? AND course_id = ?', [progress, user.id, courseId]);
  refresh();
  return { success: true, data: undefined };
}

export async function applyInternship(internshipId: number): Promise<ActionResult<undefined>> {
  const user = await requireRole('resident');
  if (!Number.isInteger(internshipId) || internshipId <= 0) return failure('Некорректная стажировка');
  const db = await getDb();
  const internship = await db.get('SELECT 1 FROM internships WHERE id = ?', internshipId);
  if (!internship) return failure('Стажировка не найдена');
  await db.run(
    "INSERT OR IGNORE INTO applications (user_id, internship_id, status) VALUES (?, ?, 'Заявка подана')",
    [user.id, internshipId],
  );
  refresh();
  return { success: true, data: undefined };
}

export async function addProfession(formData: FormData): Promise<ActionResult<undefined>> {
  await requireRole('company');
  const title = String(formData.get('title') ?? '').trim();
  const requirements = String(formData.get('requirements') ?? '').trim();
  if (!title || !requirements) return failure('Заполните название и требования');
  const db = await getDb();
  await db.run(
    'INSERT INTO professions (title, requirements, salary_growth, transition_time) VALUES (?, ?, ?, ?)',
    [title, requirements, String(formData.get('salaryGrowth') || '+25%'), String(formData.get('transitionTime') || '6 месяцев')],
  );
  return { success: true, data: undefined };
}

export async function addInternship(formData: FormData): Promise<ActionResult<undefined>> {
  const user = await requireRole('company');
  const title = String(formData.get('title') ?? '').trim();
  const location = String(formData.get('location') ?? '').trim();
  if (!title || !location) return failure('Заполните название и место');
  const db = await getDb();
  await db.run(
    'INSERT INTO internships (title, company, location, match_pct, company_id) VALUES (?, ?, ?, 0, ?)',
    [title, user.name, location, user.id],
  );
  return { success: true, data: undefined };
}

export async function updateDemand(formData: FormData): Promise<ActionResult<undefined>> {
  await requireRole('company');
  const year = String(formData.get('year') ?? '').trim();
  if (!/^\d{4}$/.test(year)) return failure('Введите год в формате ГГГГ');
  const values = ['automation', 'safety', 'digital', 'nuclear'].map((key) => Number(formData.get(key) ?? 0));
  if (values.some((value) => !Number.isInteger(value) || value < 0)) return failure('Значения спроса должны быть неотрицательными числами');
  const db = await getDb();
  await db.run(
    `INSERT INTO demands (year, automation, safety, digital, nuclear) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(year) DO UPDATE SET automation=excluded.automation, safety=excluded.safety,
     digital=excluded.digital, nuclear=excluded.nuclear`,
    [year, ...values],
  );
  return { success: true, data: undefined };
}

export async function getProfessions() {
  return (await getDb()).all('SELECT * FROM professions ORDER BY title');
}

export async function getCoursesList() {
  const user = await getSession();
  const db = await getDb();
  return db.all(`SELECT c.*, IFNULL(uc.progress, 0) progress FROM courses c
    LEFT JOIN user_courses uc ON uc.course_id = c.id AND uc.user_id = ?`, user?.id ?? -1);
}

export async function getInternshipsList() {
  const user = await getSession();
  const db = await getDb();
  return db.all(`SELECT i.*, CASE WHEN a.id IS NULL THEN 0 ELSE 1 END applied,
    IFNULL(a.status, '') appStatus FROM internships i
    LEFT JOIN applications a ON a.internship_id = i.id AND a.user_id = ?`, user?.id ?? -1);
}

export async function getDemands() {
  return (await getDb()).all('SELECT * FROM demands ORDER BY year');
}

export async function getRegionStats() {
  return (await getDb()).all('SELECT * FROM region_stats ORDER BY district');
}

export async function getCompanyApplicants() {
  const user = await requireRole('company');
  return (await getDb()).all(`
    SELECT a.id applicationId, a.status applicationStatus, u.name residentName,
           u.email residentEmail, u.current_position residentPos, u.experience residentExp,
           u.skills residentSkills, i.title internshipTitle
    FROM applications a JOIN users u ON u.id = a.user_id
    JOIN internships i ON i.id = a.internship_id
    WHERE i.company_id = ? ORDER BY a.created_at DESC
  `, user.id);
}

export async function handleApplicationAction(appId: number, action: 'Одобрить' | 'Отклонить'): Promise<ActionResult<undefined>> {
  const user = await requireRole('company');
  const status = action === 'Одобрить' ? 'Одобрено' : 'Отклонено';
  const result = await (await getDb()).run(
    `UPDATE applications SET status = ? WHERE id = ? AND internship_id IN
     (SELECT id FROM internships WHERE company_id = ?)`,
    [status, appId, user.id],
  );
  if (!result.changes) return failure('Заявка не найдена или недоступна');
  return { success: true, data: undefined };
}
