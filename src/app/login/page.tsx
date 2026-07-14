'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { login } from '@/app/actions';
import { ArrowRight, LogIn, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const [role, setRole] = useState<'resident' | 'company' | 'region'>('resident');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append('role', role);

    try {
      const res = await login(formData);
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
        <div className="w-full max-w-md">
          <Card className="shadow-xl rounded-2xl border-none">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-3xl font-bold text-[#0B2A4A] flex items-center justify-center gap-2">
                <LogIn className="h-6 w-6 text-[#00A3E0]" />
                Вход в платформу
              </CardTitle>
              <p className="text-sm text-[#1F2933]/60 mt-1">
                Выберите вашу роль для входа в кабинет
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

                <Button
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  className="w-full mt-2"
                >
                  {loading ? 'Вход...' : 'Войти'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-[#1F2933]/60">
                Нет учетной записи?{' '}
                <Link
                  href="/register"
                  className="font-medium text-[#00A3E0] hover:underline"
                >
                  Зарегистрироваться
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
