import type { ProfessionMatch, SkillGap } from '@/lib/types';

export interface SkillRequirement {
  skillId: number;
  name: string;
  requiredLevel: number;
  weight: number;
}

export interface ProfessionCandidate {
  professionId: number;
  title: string;
  salaryGrowth: string;
  transitionTime: string;
  requirements: SkillRequirement[];
}

export function scoreProfession(
  candidate: ProfessionCandidate,
  levels: Map<number, number>,
): ProfessionMatch {
  const totalWeight = candidate.requirements.reduce((sum, item) => sum + item.weight, 0);
  const weightedScore = candidate.requirements.reduce((sum, item) => {
    const level = levels.get(item.skillId) ?? 0;
    return sum + Math.min(level / item.requiredLevel, 1) * item.weight;
  }, 0);

  const gaps: SkillGap[] = candidate.requirements
    .filter((item) => (levels.get(item.skillId) ?? 0) < item.requiredLevel)
    .map((item) => ({
      skillId: item.skillId,
      name: item.name,
      currentLevel: levels.get(item.skillId) ?? 0,
      requiredLevel: item.requiredLevel,
      weight: item.weight,
    }))
    .sort((a, b) => (b.requiredLevel - b.currentLevel) * b.weight - (a.requiredLevel - a.currentLevel) * a.weight);

  const strengths = candidate.requirements
    .filter((item) => (levels.get(item.skillId) ?? 0) >= item.requiredLevel)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map((item) => item.name);

  return {
    professionId: candidate.professionId,
    title: candidate.title,
    score: totalWeight === 0 ? 0 : Math.round((weightedScore / totalWeight) * 100),
    salaryGrowth: candidate.salaryGrowth,
    transitionTime: candidate.transitionTime,
    strengths,
    gaps: gaps.slice(0, 4),
  };
}

export function rankProfessions(
  candidates: ProfessionCandidate[],
  levels: Map<number, number>,
): ProfessionMatch[] {
  return candidates
    .map((candidate) => scoreProfession(candidate, levels))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'ru'));
}

export function calculateReadiness(
  skillFit: number,
  courseProgress: number[],
  applicationStatus: string | null,
): number {
  const learning = courseProgress.length
    ? courseProgress.reduce((sum, value) => sum + value, 0) / courseProgress.length
    : 0;
  const applicationPoints = applicationStatus === 'Одобрено' ? 10 : applicationStatus === 'Заявка подана' ? 5 : 0;
  return Math.round(skillFit * 0.7 + learning * 0.2 + applicationPoints);
}
