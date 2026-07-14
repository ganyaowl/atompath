import 'server-only';

import { getDb } from '@/lib/db';
import { calculateReadiness, rankProfessions, type ProfessionCandidate } from '@/lib/matching';
import type {
  AssessmentResult,
  AssessmentDraft,
  CourseRecommendation,
  InternshipRecommendation,
  ProfessionMatch,
  ResidentDashboardData,
  RoadmapStep,
  SessionUser,
  Skill,
} from '@/lib/types';

interface AssessmentRow {
  id: number;
  completed_at: string;
}

export async function getSkills(): Promise<Skill[]> {
  const db = await getDb();
  return db.all<Skill[]>('SELECT id, name, category FROM skills WHERE active = 1 ORDER BY category, name');
}

export async function getAssessmentDraft(userId: number): Promise<AssessmentDraft | null> {
  const db = await getDb();
  const draft = await db.get<{
    id: number;
    current_position: string;
    experience: string;
    region: string;
    certifications: string;
  }>("SELECT id, current_position, experience, region, certifications FROM assessments WHERE user_id = ? AND status = 'draft' ORDER BY id DESC LIMIT 1", userId);
  if (!draft) return null;
  const responses = await db.all<Array<{ skill_id: number; level: number }>>(
    'SELECT skill_id, level FROM assessment_responses WHERE assessment_id = ?',
    draft.id,
  );
  return {
    currentPosition: draft.current_position,
    experience: draft.experience,
    region: draft.region,
    certifications: draft.certifications,
    levels: Object.fromEntries(responses.map((response) => [response.skill_id, response.level])),
  };
}

async function getLatestAssessment(userId: number): Promise<{ result: AssessmentResult; levels: Map<number, number> } | null> {
  const db = await getDb();
  const assessment = await db.get<AssessmentRow>(
    "SELECT id, completed_at FROM assessments WHERE user_id = ? AND status = 'completed' ORDER BY completed_at DESC, id DESC LIMIT 1",
    userId,
  );
  if (!assessment) return null;

  const responses = await db.all<Array<{ skill_id: number; level: number }>>(
    'SELECT skill_id, level FROM assessment_responses WHERE assessment_id = ?',
    assessment.id,
  );
  const levels = new Map(responses.map((item) => [item.skill_id, item.level]));
  const matches = rankProfessions(await getProfessionCandidates(), levels).slice(0, 3);
  return {
    levels,
    result: { assessmentId: assessment.id, completedAt: assessment.completed_at, matches },
  };
}

async function getProfessionCandidates(): Promise<ProfessionCandidate[]> {
  const db = await getDb();
  const rows = await db.all<Array<{
    profession_id: number;
    title: string;
    salary_growth: string;
    transition_time: string;
    skill_id: number;
    skill_name: string;
    required_level: number;
    weight: number;
  }>>(`
    SELECT p.id profession_id, p.title, p.salary_growth, p.transition_time,
           s.id skill_id, s.name skill_name, ps.required_level, ps.weight
    FROM professions p
    JOIN profession_skills ps ON ps.profession_id = p.id
    JOIN skills s ON s.id = ps.skill_id
    ORDER BY p.id, ps.weight DESC
  `);

  const candidates = new Map<number, ProfessionCandidate>();
  for (const row of rows) {
    const candidate = candidates.get(row.profession_id) ?? {
      professionId: row.profession_id,
      title: row.title,
      salaryGrowth: row.salary_growth,
      transitionTime: row.transition_time,
      requirements: [],
    };
    candidate.requirements.push({
      skillId: row.skill_id,
      name: row.skill_name,
      requiredLevel: row.required_level,
      weight: row.weight,
    });
    candidates.set(row.profession_id, candidate);
  }
  return Array.from(candidates.values());
}

async function getCourseRecommendations(userId: number, selected: ProfessionMatch | null): Promise<CourseRecommendation[]> {
  if (!selected) return [];
  const db = await getDb();
  const rows = await db.all<Array<{
    id: number;
    title: string;
    duration: string;
    provider: string;
    progress: number;
    enrolled: number;
    skill_id: number | null;
    skill_name: string | null;
    coverage: number | null;
  }>>(`
    SELECT c.id, c.title, c.duration, c.provider, IFNULL(uc.progress, 0) progress,
           CASE WHEN uc.user_id IS NULL THEN 0 ELSE 1 END enrolled,
           s.id skill_id, s.name skill_name, cs.coverage
    FROM courses c
    LEFT JOIN user_courses uc ON uc.course_id = c.id AND uc.user_id = ?
    LEFT JOIN course_skills cs ON cs.course_id = c.id
    LEFT JOIN skills s ON s.id = cs.skill_id
    ORDER BY c.id
  `, userId);

  const gapBySkill = new Map(selected.gaps.map((gap) => [gap.skillId, gap]));
  const courses = new Map<number, CourseRecommendation>();
  for (const row of rows) {
    const item = courses.get(row.id) ?? {
      id: row.id,
      title: row.title,
      duration: row.duration,
      provider: row.provider,
      progress: row.progress,
      enrolled: Boolean(row.enrolled),
      relevanceScore: 0,
      addresses: [],
    };
    if (row.skill_id && row.skill_name && gapBySkill.has(row.skill_id)) {
      const gap = gapBySkill.get(row.skill_id)!;
      item.relevanceScore += (gap.requiredLevel - gap.currentLevel) * gap.weight * (row.coverage ?? 1);
      item.addresses.push(row.skill_name);
    }
    courses.set(row.id, item);
  }
  return Array.from(courses.values())
    .filter((course) => course.progress < 100 && course.relevanceScore > 0)
    .map((course) => ({ ...course, relevanceScore: Math.round(course.relevanceScore * 10) }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

async function getInternshipRecommendations(
  userId: number,
  region: string,
  levels: Map<number, number>,
): Promise<InternshipRecommendation[]> {
  const db = await getDb();
  const rows = await db.all<Array<{
    id: number;
    title: string;
    company: string;
    location: string;
    skill_id: number | null;
    skill_name: string | null;
    required_level: number | null;
    weight: number | null;
    application_status: string | null;
  }>>(`
    SELECT i.id, i.title, i.company, i.location, ins.skill_id, s.name skill_name,
           ins.required_level, ins.weight, a.status application_status
    FROM internships i
    LEFT JOIN internship_skills ins ON ins.internship_id = i.id
    LEFT JOIN skills s ON s.id = ins.skill_id
    LEFT JOIN applications a ON a.internship_id = i.id AND a.user_id = ?
    ORDER BY i.id
  `, userId);

  const grouped = new Map<number, InternshipRecommendation & { earned: number; total: number }>();
  for (const row of rows) {
    const item = grouped.get(row.id) ?? {
      id: row.id,
      title: row.title,
      company: row.company,
      location: row.location,
      matchScore: 0,
      missingSkills: [],
      applied: Boolean(row.application_status),
      applicationStatus: row.application_status ?? '',
      earned: 0,
      total: 0,
    };
    if (row.skill_id && row.required_level && row.weight) {
      const level = levels.get(row.skill_id) ?? 0;
      item.earned += Math.min(level / row.required_level, 1) * row.weight;
      item.total += row.weight;
      if (level < row.required_level && row.skill_name) item.missingSkills.push(row.skill_name);
    }
    grouped.set(row.id, item);
  }

  return Array.from(grouped.values()).map(({ earned, total, ...item }) => {
    const skillScore = total ? (earned / total) * 95 : 0;
    const locationBoost = item.location.toLowerCase().includes('удален') ||
      (region && item.location.toLowerCase().includes(region.toLowerCase())) ? 5 : 0;
    return { ...item, matchScore: Math.min(100, Math.round(skillScore + locationBoost)) };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

export async function getResidentDashboard(user: SessionUser): Promise<ResidentDashboardData> {
  const db = await getDb();
  const latest = await getLatestAssessment(user.id);
  const pathway = await db.get<{ profession_id: number }>('SELECT profession_id FROM user_pathways WHERE user_id = ?', user.id);
  const selected = latest?.result.matches.find((item) => item.professionId === pathway?.profession_id) ?? null;
  const courses = await getCourseRecommendations(user.id, selected);
  const internships = latest ? await getInternshipRecommendations(user.id, user.region, latest.levels) : [];
  const application = internships.find((item) => item.applicationStatus === 'Одобрено')
    ?? internships.find((item) => item.applicationStatus === 'Заявка подана');
  const readiness = selected
    ? calculateReadiness(selected.score, courses.map((item) => item.progress), application?.applicationStatus ?? null)
    : 0;

  const roadmap: RoadmapStep[] = [
    { step: 1, title: 'Оценка навыков', description: latest ? 'Оценка завершена' : 'Заполните анкету навыков', status: latest ? 'completed' : 'in-progress' },
    { step: 2, title: 'Карьерная цель', description: selected?.title ?? 'Выберите подходящую профессию', status: selected ? 'completed' : latest ? 'in-progress' : 'upcoming' },
    { step: 3, title: 'Обучение', description: 'Закройте ключевые дефициты навыков', status: courses.some((item) => item.progress > 0) ? 'in-progress' : selected ? 'upcoming' : 'planned' },
    { step: 4, title: 'Стажировка', description: application?.applicationStatus ?? 'Подайте заявку на практику', status: application ? 'in-progress' : 'planned' },
    { step: 5, title: 'Трудоустройство', description: 'Переход на постоянную позицию', status: application?.applicationStatus === 'Одобрено' ? 'planned' : 'target' },
  ];

  return {
    user,
    skills: await getSkills(),
    hasCompletedAssessment: Boolean(latest),
    assessment: latest?.result ?? null,
    selectedProfession: selected,
    courses,
    internships,
    readiness,
    roadmap,
  };
}
