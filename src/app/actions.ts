'use server';

import { redirect } from 'next/navigation';
import { refresh } from 'next/cache';
import { createSession, destroySession, getSession, requireAnyRole, requireRole } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/password';
import { getSkills } from '@/lib/resident-data';
import { getEmployerApplicants, getEmployerInternships, updateEmployerApplication } from '@/lib/employer-data';
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
    'SELECT id, password_hash FROM users WHERE email = ? COLLATE NOCASE',
    parsed.data.email,
  );
  if (!user?.password_hash || !(await verifyPassword(parsed.data.password, user.password_hash))) {
    return failure('Неверный email или пароль');
  }

  await createSession(user.id);
  redirect('/dashboard');
}

export async function register(formData: FormData): Promise<ActionResult<never>> {
  const values = formDataObject(formData);
  const parsed = registrationSchema.safeParse({
    ...values,
    currentPosition: values.currentPosition ?? '',
    experience: values.experience ?? '',
    region: values.region ?? '',
    skills: values.skills ?? '',
  });
  if (!parsed.success) return failure('Проверьте введенные данные', fieldErrors(parsed.error));

  const currentPosition = parsed.data.role === 'resident' ? parsed.data.currentPosition : '';
  const experience = parsed.data.role === 'resident' ? parsed.data.experience : '';
  const skills = parsed.data.role === 'resident' ? parsed.data.skills : '';

  const db = await getDb();
  const existingUser = await db.get(
    'SELECT 1 FROM users WHERE email = ? COLLATE NOCASE',
    parsed.data.email,
  );
  if (existingUser) return failure('Пользователь с таким email уже существует');

  try {
    const result = await db.run(
      `INSERT INTO users (email, password_hash, role, name, current_position, experience, region, skills)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parsed.data.email.toLowerCase(),
        await hashPassword(parsed.data.password),
        parsed.data.role,
        parsed.data.name,
        currentPosition,
        experience,
        parsed.data.region,
        skills,
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

export async function getProfessions() {
  await requireAnyRole(['company', 'region']);
  return (await getDb()).all('SELECT * FROM professions ORDER BY title');
}

export async function getCoursesList() {
  const user = await getSession();
  const db = await getDb();
  return db.all(`SELECT c.*, IFNULL(uc.progress, 0) progress FROM courses c
    LEFT JOIN user_courses uc ON uc.course_id = c.id AND uc.user_id = ?`, user?.id ?? -1);
}

export async function getInternshipsList() {
  const user = await requireAnyRole(['company', 'region']);
  const db = await getDb();
  if (user.role === 'company') {
    return getEmployerInternships(user.id);
  }
  return db.all('SELECT * FROM internships ORDER BY id DESC');
}

export async function getDemands() {
  await requireAnyRole(['company', 'region']);
  return (await getDb()).all('SELECT * FROM demands ORDER BY year');
}

export async function getRegionStats() {
  await requireRole('region');
  return (await getDb()).all('SELECT * FROM region_stats ORDER BY district');
}

export async function getCompanyApplicants() {
  const user = await requireRole('company');
  return getEmployerApplicants(user.id);
}

export async function handleApplicationAction(appId: number, action: 'Одобрить' | 'Отклонить'): Promise<ActionResult<undefined>> {
  const user = await requireRole('company');
  if (!Number.isInteger(appId) || appId <= 0 || (action !== 'Одобрить' && action !== 'Отклонить')) {
    return failure('Некорректное действие');
  }
  const status = action === 'Одобрить' ? 'Одобрено' : 'Отклонено';
  const result = await updateEmployerApplication(user.id, appId, status);
  if (!result.changes) return failure('Заявка не найдена или недоступна');
  return { success: true, data: undefined };
}
