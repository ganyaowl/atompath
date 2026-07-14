import { z } from 'zod';

export const roleSchema = z.enum(['resident', 'company', 'region']);

export const loginSchema = z.object({
  email: z.string().trim().email('Введите корректный email').max(254),
  password: z.string().min(1, 'Введите пароль').max(128),
});

const registrationCredentials = {
  email: z.string().trim().email('Введите корректный email').max(254),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов').max(128),
  confirmPassword: z.string().min(1, 'Повторите пароль').max(128),
};

const residentRegistrationSchema = z.object({
  role: z.literal('resident'),
  name: z.string().trim().min(2, 'Введите имя').max(120),
  ...registrationCredentials,
  currentPosition: z.string().trim().max(120).default(''),
  experience: z.string().trim().max(80).default(''),
  region: z.string().trim().max(120).default(''),
  skills: z.string().trim().max(500).default(''),
});

const organizationRegistrationSchema = (role: 'company' | 'region') => z.object({
  role: z.literal(role),
  name: z.string().trim().min(2, 'Введите название').max(120),
  ...registrationCredentials,
  region: z.string().trim().min(2, 'Введите территорию').max(120),
});

export const registrationSchema = z.discriminatedUnion('role', [
  residentRegistrationSchema,
  organizationRegistrationSchema('company'),
  organizationRegistrationSchema('region'),
]).refine((values) => values.password === values.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  currentPosition: z.string().trim().max(120),
  experience: z.string().trim().max(80),
  region: z.string().trim().max(120),
});

export const assessmentSchema = z.object({
  currentPosition: z.string().trim().min(2).max(120),
  experience: z.string().trim().min(1).max(80),
  region: z.string().trim().min(2).max(120),
  certifications: z.string().trim().max(500),
  responses: z.array(z.object({
    skillId: z.number().int().positive(),
    level: z.number().int().min(0).max(4),
  })).min(1),
});

export function formDataObject(formData: FormData): Record<string, string> {
  return Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [key, String(value)]),
  );
}

export function fieldErrors(error: z.ZodError): Record<string, string[]> {
  return error.flatten().fieldErrors as Record<string, string[]>;
}
