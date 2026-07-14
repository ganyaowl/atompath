'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, Landmark, ShieldAlert, UserRound, UserPlus } from 'lucide-react';
import { register } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { experienceOptions } from '@/lib/data';
import type { UserRole } from '@/lib/types';

type FieldErrors = Record<string, string[]>;

const roles = [
  { id: 'resident', label: 'Соискатель', icon: UserRound },
  { id: 'company', label: 'Работодатель', icon: Building2 },
  { id: 'region', label: 'Регион', icon: Landmark },
] as const;

const inputClass = 'w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-4 py-3 text-sm text-[#1F2933] focus:border-[#00A3E0] focus:ring-2 focus:ring-[#00A3E0]/20 focus:outline-none transition-all';

export function RegisterForm() {
  const [role, setRole] = useState<UserRole>('resident');
  const [experience, setExperience] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  function changeRole(nextRole: UserRole) {
    setRole(nextRole);
    setError(null);
    setErrors({});
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setErrors({});
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    formData.set('role', role);
    if (role === 'resident') formData.set('experience', experience);

    try {
      const result = await register(formData);
      if (!result.success) {
        setError(result.error);
        setErrors(result.fieldErrors ?? {});
        setLoading(false);
      }
    } catch {
      setError('Произошла непредвиденная ошибка');
      setLoading(false);
    }
  }

  const nameLabel = role === 'resident'
    ? 'Ваше полное имя (ФИО)'
    : role === 'company'
      ? 'Название работодателя / организации'
      : 'Название региональной администрации';

  return (
    <div className="w-full max-w-xl">
      <Card className="shadow-xl rounded-2xl border-none">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-bold text-[#0B2A4A] flex items-center justify-center gap-2">
            <UserPlus className="h-6 w-6 text-[#00A3E0]" />
            Регистрация
          </CardTitle>
          <p className="text-sm text-[#1F2933]/60 mt-1">Выберите тип аккаунта и заполните основные данные</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 bg-[#0B2A4A]/5 p-1 rounded-xl mb-6" aria-label="Тип аккаунта">
            {roles.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => changeRole(id)}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  role === id ? 'bg-white text-[#0B2A4A] shadow-sm' : 'text-[#1F2933]/60 hover:text-[#0B2A4A]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[#D64545]/10 border border-[#D64545]/20 text-[#D64545] rounded-lg text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {role !== 'resident' && (
            <div className="mb-4 p-3 bg-[#F5A623]/10 border border-[#F5A623]/20 text-[#7A5310] rounded-lg text-xs">
              Демо-режим: аккаунт организации создается сразу, без проверки документов и полномочий.
            </div>
          )}

          <form key={role} onSubmit={handleSubmit} className="space-y-4">
            <Field label={nameLabel} name="name" error={errors.name}>
              <input id="name" type="text" name="name" required placeholder={role === 'resident' ? 'Иван Иванов' : 'Название организации'} className={inputClass} />
            </Field>
            <Field label="Электронная почта" name="email" error={errors.email}>
              <input id="email" type="email" name="email" autoComplete="email" required placeholder="name@example.com" className={inputClass} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Пароль" name="password" error={errors.password}>
                <input id="password" type="password" name="password" autoComplete="new-password" required minLength={8} placeholder="Минимум 8 символов" className={inputClass} />
              </Field>
              <Field label="Повторите пароль" name="confirmPassword" error={errors.confirmPassword}>
                <input id="confirmPassword" type="password" name="confirmPassword" autoComplete="new-password" required minLength={8} placeholder="Повторите пароль" className={inputClass} />
              </Field>
            </div>

            {role === 'resident' ? (
              <div className="space-y-4 pt-2 border-t border-[#0B2A4A]/5">
                <h3 className="text-sm font-semibold text-[#0B2A4A]">Профессиональный профиль</h3>
                <Field label="Текущая специальность / профессия" name="currentPosition" error={errors.currentPosition}>
                  <input id="currentPosition" type="text" name="currentPosition" placeholder="например, Монтажник, Электрик" className={inputClass} />
                </Field>
                <Select label="Опыт работы" options={experienceOptions} value={experience} onChange={setExperience} placeholder="Выберите ваш стаж" />
                <Field label="Район / регион" name="region" error={errors.region}>
                  <input id="region" type="text" name="region" placeholder="например, Ташкентская область" className={inputClass} />
                </Field>
                <Field label="Текущие навыки (через запятую)" name="skills" error={errors.skills}>
                  <input id="skills" type="text" name="skills" placeholder="например, Чертежи, Монтаж кабелей" className={inputClass} />
                </Field>
              </div>
            ) : (
              <Field label={role === 'company' ? 'Территория / регион работы' : 'Регион / территория'} name="region" error={errors.region}>
                <input id="region" type="text" name="region" required placeholder="например, Ташкентская область" className={inputClass} />
              </Field>
            )}

            <Button type="submit" disabled={loading} variant="primary" className="w-full mt-4">
              {loading ? 'Создание аккаунта...' : 'Зарегистрироваться'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-[#1F2933]/60">
            Уже зарегистрированы?{' '}
            <Link href="/login" className="font-medium text-[#00A3E0] hover:underline">Войти</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-[#1F2933] mb-1">{label}</label>
      {children}
      {error?.[0] && <p className="mt-1 text-xs text-[#D64545]">{error[0]}</p>}
    </div>
  );
}
