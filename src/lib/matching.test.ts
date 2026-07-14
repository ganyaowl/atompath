import { describe, expect, it } from 'vitest';
import { calculateReadiness, rankProfessions, scoreProfession, type ProfessionCandidate } from './matching';

const automation: ProfessionCandidate = {
  professionId: 1,
  title: 'Автоматизация',
  salaryGrowth: '+30%',
  transitionTime: '8 месяцев',
  requirements: [
    { skillId: 1, name: 'ПЛК', requiredLevel: 4, weight: 2 },
    { skillId: 2, name: 'Безопасность', requiredLevel: 2, weight: 1 },
  ],
};

describe('profession matching', () => {
  it('calculates a weighted score and explains strengths and gaps', () => {
    const result = scoreProfession(automation, new Map([[1, 2], [2, 2]]));
    expect(result.score).toBe(67);
    expect(result.strengths).toEqual(['Безопасность']);
    expect(result.gaps[0]).toMatchObject({ name: 'ПЛК', currentLevel: 2, requiredLevel: 4 });
  });

  it('ranks the strongest match first', () => {
    const safety = { ...automation, professionId: 2, title: 'Безопасность', requirements: [automation.requirements[1]] };
    const results = rankProfessions([automation, safety], new Map([[1, 0], [2, 2]]));
    expect(results.map((item) => item.professionId)).toEqual([2, 1]);
  });
});

describe('readiness', () => {
  it('combines skills, learning progress, and a pending application', () => {
    expect(calculateReadiness(80, [50, 100], 'Заявка подана')).toBe(76);
  });

  it('caps an accepted application at ten contribution points', () => {
    expect(calculateReadiness(100, [100], 'Одобрено')).toBe(100);
  });
});
