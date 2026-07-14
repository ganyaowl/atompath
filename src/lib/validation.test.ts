import { describe, expect, it } from 'vitest';
import { assessmentSchema, loginSchema, registrationSchema } from './validation';

describe('authentication validation', () => {
  it('logs in without a client-selected role', () => {
    expect(loginSchema.safeParse({ email: 'user@example.com', password: 'password' }).success).toBe(true);
  });

  it.each([
    ['resident', { currentPosition: '', experience: '', region: '', skills: '' }],
    ['company', { region: 'Ташкент' }],
    ['region', { region: 'Ташкентская область' }],
  ] as const)('accepts a valid %s registration', (role, roleFields) => {
    const result = registrationSchema.safeParse({
      role,
      name: role === 'resident' ? 'Иван Иванов' : 'Организация',
      email: `${role}@example.com`,
      password: 'secure-password',
      confirmPassword: 'secure-password',
      ...roleFields,
    });
    expect(result.success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = registrationSchema.safeParse({
      role: 'company',
      name: 'Работодатель',
      email: 'company@example.com',
      password: 'secure-password',
      confirmPassword: 'another-password',
      region: 'Ташкент',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirmPassword).toContain('Пароли не совпадают');
    }
  });

  it('requires an organization territory', () => {
    const result = registrationSchema.safeParse({
      role: 'region',
      name: 'Администрация',
      email: 'region@example.com',
      password: 'secure-password',
      confirmPassword: 'secure-password',
      region: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('resident validation', () => {
  it('accepts only normalized skill levels from zero to four', () => {
    const result = assessmentSchema.safeParse({
      currentPosition: 'Электрик', experience: '3 года', region: 'Северный', certifications: '',
      responses: [{ skillId: 1, level: 5 }],
    });
    expect(result.success).toBe(false);
  });
});
