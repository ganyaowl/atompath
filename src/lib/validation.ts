import { z } from 'zod';

export const roleSchema = z.enum(['resident', 'company', 'region']);

export const loginSchema = z.object({
  email: z.string().trim().email('Введите корректный email').max(254),
  password: z.string().min(1, 'Введите пароль').max(128),
  role: roleSchema,
});

export const registrationSchema = z.object({
  name: z.string().trim().min(2, 'Введите имя').max(120),
  email: z.string().trim().email('Введите корректный email').max(254),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов').max(128),
  currentPosition: z.string().trim().max(120).default(''),
  experience: z.string().trim().max(80).default(''),
  region: z.string().trim().max(120).default(''),
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
