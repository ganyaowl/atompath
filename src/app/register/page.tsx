'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { register } from '@/app/actions';
import { ArrowRight, UserPlus, ShieldAlert } from 'lucide-react';
import { experienceOptions } from '@/lib/data';

export default function RegisterPage() {
  const [role, setRole] = useState<'resident' | 'company' | 'region'>('resident');
  const [experience, setExperience] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append('role', role);
    if (role === 'resident') {
      formData.append('experience', experience);
    }

    try {
      const res = await register(formData);
      if (res && res.error) {
        setError(res.error);
        setLoading(false);
      }
    } catch (err: any) {
      setError('Произошла непредвиденная ошибка');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FA]">
      <Header variant="landing" />

      <main className="flex-1 flex items-center justify-center pt-24 pb-16 px-4">
        <div className="w-full max-w-lg">
          <Card className="shadow-xl rounded-2xl border-none">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-3xl font-bold text-[#0B2A4A] flex items-center justify-center gap-2">
                <UserPlus className="h-6 w-6 text-[#00A3E0]" />
                Регистрация
              </CardTitle>
              <p className="text-sm text-[#1F2933]/60 mt-1">
                Создайте аккаунт на платформе AtomPath
              </p>
            </CardHeader>

            <CardContent>
              {/* Role Select Tabs */}
              <div className="grid grid-cols-3 gap-2 bg-[#0B2A4A]/5 p-1 rounded-xl mb-6">
                {(
                  [
                    { id: 'resident', label: 'Житель' },
                    { id: 'company', label: 'Компания' },
                    { id: 'region', label: 'Регион' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setRole(tab.id)}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      role === tab.id
                        ? 'bg-white text-[#0B2A4A] shadow-sm'
                        : 'text-[#1F2933]/60 hover:text-[#0B2A4A]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-[#D64545]/10 border border-[#D64545]/20 text-[#D64545] rounded-lg text-sm flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1F2933] mb-1">
                    {role === 'resident'
                      ? 'Ваше полное имя (ФИО)'
                      : role === 'company'
                      ? 'Название организации / Предприятия'
                      : 'Название Администрации / Региона'}
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder={
                      role === 'resident'
                        ? 'Иван Иванов'
                        : role === 'company'
                        ? 'АО Сибирский Энергокомплекс'
                        : 'Администрация Атомного региона'
                    }
                    className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-4 py-3 text-sm text-[#1F2933] focus:border-[#00A3E0] focus:ring-2 focus:ring-[#00A3E0]/20 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F2933] mb-1">
                    Электронная почта
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@example.com"
                    className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-4 py-3 text-sm text-[#1F2933] focus:border-[#00A3E0] focus:ring-2 focus:ring-[#00A3E0]/20 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F2933] mb-1">
                    Пароль
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-4 py-3 text-sm text-[#1F2933] focus:border-[#00A3E0] focus:ring-2 focus:ring-[#00A3E0]/20 focus:outline-none transition-all"
                  />
                </div>

                {/* Resident Specific Fields */}
                {role === 'resident' && (
                  <div className="space-y-4 pt-2 border-t border-[#0B2A4A]/5">
                    <h3 className="text-sm font-semibold text-[#0B2A4A]">
                      Профессиональный профиль
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#1F2933] mb-1">
                        Текущая специальность / Профессия
                      </label>
                      <input
                        type="text"
                        name="currentPosition"
                        placeholder="например, Монтажник, Электрик"
                        className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-4 py-3 text-sm text-[#1F2933] focus:border-[#00A3E0] focus:ring-2 focus:ring-[#00A3E0]/20 focus:outline-none transition-all"
                      />
                    </div>

                    <Select
                      label="Опыт работы"
                      options={experienceOptions}
                      value={experience}
                      onChange={setExperience}
                      placeholder="Выберите ваш стаж"
                    />

                    <div>
                      <label className="block text-sm font-medium text-[#1F2933] mb-1">
                        Район / Регион
                      </label>
                      <input
                        type="text"
                        name="region"
                        placeholder="например, Атомный регион"
                        className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-4 py-3 text-sm text-[#1F2933] focus:border-[#00A3E0] focus:ring-2 focus:ring-[#00A3E0]/20 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1F2933] mb-1">
                        Ваши текущие навыки (через запятую)
                      </label>
                      <input
                        type="text"
                        name="skills"
                        placeholder="например, Чертежи, Монтаж кабелей, Безопасность"
                        className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-4 py-3 text-sm text-[#1F2933] focus:border-[#00A3E0] focus:ring-2 focus:ring-[#00A3E0]/20 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  className="w-full mt-4"
                >
                  {loading ? 'Создание аккаунта...' : 'Зарегистрироваться'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-[#1F2933]/60">
                Уже зарегистрированы?{' '}
                <Link
                  href="/login"
                  className="font-medium text-[#00A3E0] hover:underline"
                >
                  Войти
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
