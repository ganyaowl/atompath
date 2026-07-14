import { describe, expect, it } from 'vitest';
import { assessmentSchema, registrationSchema } from './validation';

describe('resident validation', () => {
  it('requires a secure-enough password and valid email', () => {
    const result = registrationSchema.safeParse({
      name: 'Иван Иванов', email: 'invalid', password: 'short',
      currentPosition: '', experience: '', region: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts only normalized skill levels from zero to four', () => {
    const result = assessmentSchema.safeParse({
      currentPosition: 'Электрик', experience: '3 года', region: 'Северный', certifications: '',
      responses: [{ skillId: 1, level: 5 }],
    });
    expect(result.success).toBe(false);
  });
});
