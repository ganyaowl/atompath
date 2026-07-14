'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, LogIn, ShieldAlert } from 'lucide-react';
import { login } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(new FormData(event.currentTarget));
      if (!result.success) {
        setError(result.error);
        setLoading(false);
      }
    } catch {
      setError('Произошла непредвиденная ошибка');
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <Card className="shadow-xl rounded-2xl border-none">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-bold text-[#0B2A4A] flex items-center justify-center gap-2">
            <LogIn className="h-6 w-6 text-[#00A3E0]" />
            Вход в платформу
          </CardTitle>
          <p className="text-sm text-[#1F2933]/60 mt-1">
            Введите email и пароль — кабинет откроется по роли аккаунта
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-[#D64545]/10 border border-[#D64545]/20 text-[#D64545] rounded-lg text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1F2933] mb-1">
                Электронная почта
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="name@example.com"
                className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-4 py-3 text-sm text-[#1F2933] focus:border-[#00A3E0] focus:ring-2 focus:ring-[#00A3E0]/20 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1F2933] mb-1">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                name="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-4 py-3 text-sm text-[#1F2933] focus:border-[#00A3E0] focus:ring-2 focus:ring-[#00A3E0]/20 focus:outline-none transition-all"
              />
            </div>
            <Button type="submit" disabled={loading} variant="primary" className="w-full mt-2">
              {loading ? 'Вход...' : 'Войти'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-[#1F2933]/60">
            Нет учетной записи?{' '}
            <Link href="/register" className="font-medium text-[#00A3E0] hover:underline">
              Зарегистрироваться
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
