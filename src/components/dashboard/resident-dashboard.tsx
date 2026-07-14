'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, BriefcaseBusiness, Check, LogOut, MapPin, Target } from 'lucide-react';
import { applyInternship, enrollCourse, logout, selectPathway, updateCourseProgress, updateProfile } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { ResidentDashboardData } from '@/lib/types';

export function ResidentDashboard({ data }: { data: ResidentDashboardData }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const mutate = async (key: string, action: () => Promise<{ success: boolean; error?: string }>) => {
    setPending(key);
    setMessage(null);
    const result = await action();
    if (!result.success) setMessage(result.error ?? 'Не удалось выполнить действие');
    setPending(null);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-[#0B2A4A] p-7 text-white shadow-xl sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_260px] lg:items-center">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#7ad7f5]">Личный карьерный маршрут</p>
            <h1 className="text-3xl font-bold sm:text-4xl">Здравствуйте, {data.user.name}</h1>
            <p className="mt-3 max-w-2xl text-white/65">
              {data.selectedProfession
                ? `Цель: ${data.selectedProfession.title}. Следующий шаг рассчитан по вашей оценке и фактическому прогрессу.`
                : 'Пройдите оценку и выберите карьерную цель, чтобы открыть персональные рекомендации.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/assessment"><Button variant="primary">{data.hasCompletedAssessment ? 'Пройти оценку заново' : 'Начать оценку'}<ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <button onClick={() => logout()} className="flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10">
                <LogOut className="h-4 w-4" /> Выйти
              </button>
            </div>
          </div>
          <div className="mx-auto flex h-44 w-44 flex-col items-center justify-center rounded-full border-[12px] border-white/10 bg-white/5 text-center shadow-inner">
            <span className="text-4xl font-bold text-[#7ad7f5]">{data.readiness}%</span>
            <span className="mt-1 text-xs text-white/55">готовность</span>
          </div>
        </div>
      </section>

      {message && <p className="rounded-xl bg-[#D64545]/10 p-4 text-sm text-[#D64545]">{message}</p>}

      <section className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Профиль</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setEditing((value) => !value)}>{editing ? 'Отмена' : 'Изменить'}</Button>
          </CardHeader>
          <CardContent>
            {editing ? (
              <form className="space-y-3" onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                void mutate('profile', async () => {
                  const result = await updateProfile(new FormData(form));
                  if (result.success) setEditing(false);
                  return result;
                });
              }}>
                <input name="name" defaultValue={data.user.name} required className="w-full rounded-lg border p-3 text-sm" />
                <input name="currentPosition" defaultValue={data.user.currentPosition} className="w-full rounded-lg border p-3 text-sm" placeholder="Текущая профессия" />
                <input name="experience" defaultValue={data.user.experience} className="w-full rounded-lg border p-3 text-sm" placeholder="Опыт" />
                <input name="region" defaultValue={data.user.region} className="w-full rounded-lg border p-3 text-sm" placeholder="Регион" />
                <Button type="submit" disabled={pending === 'profile'}>Сохранить</Button>
              </form>
            ) : (
              <dl className="space-y-4 text-sm">
                <div><dt className="text-[#1F2933]/45">Текущая профессия</dt><dd className="mt-1 font-semibold text-[#0B2A4A]">{data.user.currentPosition || 'Не указана'}</dd></div>
                <div><dt className="text-[#1F2933]/45">Опыт</dt><dd className="mt-1 font-semibold text-[#0B2A4A]">{data.user.experience || 'Не указан'}</dd></div>
                <div><dt className="text-[#1F2933]/45">Регион</dt><dd className="mt-1 font-semibold text-[#0B2A4A]">{data.user.region || 'Не указан'}</dd></div>
              </dl>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Карьерные совпадения</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {!data.assessment ? (
              <div className="rounded-xl border border-dashed border-[#00A3E0]/40 bg-[#00A3E0]/5 p-6 text-center">
                <Target className="mx-auto h-8 w-8 text-[#00A3E0]" />
                <p className="mt-3 font-semibold text-[#0B2A4A]">Результаты появятся после оценки</p>
              </div>
            ) : data.assessment.matches.map((match) => {
              const selected = data.selectedProfession?.professionId === match.professionId;
              return (
                <div key={match.professionId} className={`rounded-xl border p-5 ${selected ? 'border-[#00A3E0] bg-[#00A3E0]/5' : 'border-[#0B2A4A]/10'}`}>
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div><h3 className="font-semibold text-[#0B2A4A]">{match.title}</h3><p className="mt-1 text-xs text-[#1F2933]/55">Переход {match.transitionTime} · рост {match.salaryGrowth}</p></div>
                    <Badge variant={selected ? 'success' : 'accent'}>{match.score}% совпадение</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {match.gaps.slice(0, 3).map((gap) => <span key={gap.skillId} className="rounded-full bg-[#F5A623]/10 px-3 py-1 text-xs text-[#8a5a0a]">Развить: {gap.name}</span>)}
                    {match.strengths.slice(0, 2).map((strength) => <span key={strength} className="rounded-full bg-[#3FAE5A]/10 px-3 py-1 text-xs text-[#287d3d]">Сильная сторона: {strength}</span>)}
                  </div>
                  {!selected && <Button className="mt-4" size="sm" variant="secondary" disabled={pending === `path-${match.professionId}`} onClick={() => void mutate(`path-${match.professionId}`, () => selectPathway(match.professionId))}>Выбрать направление</Button>}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader><CardTitle>Дорожная карта</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          {data.roadmap.map((step) => (
            <div key={step.step} className="rounded-xl border border-[#0B2A4A]/10 p-4">
              <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step.status === 'completed' ? 'bg-[#3FAE5A] text-white' : step.status === 'in-progress' ? 'bg-[#00A3E0] text-white' : 'bg-[#0B2A4A]/8 text-[#0B2A4A]'}`}>
                {step.status === 'completed' ? <Check className="h-4 w-4" /> : step.step}
              </div>
              <h3 className="text-sm font-semibold text-[#0B2A4A]">{step.title}</h3>
              <p className="mt-1 text-xs text-[#1F2933]/55">{step.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-[#00A3E0]" />Рекомендуемое обучение</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {data.courses.length === 0 && <p className="text-sm text-[#1F2933]/55">Выберите карьерную цель, чтобы получить рекомендации.</p>}
            {data.courses.map((course) => (
              <div key={course.id} className="rounded-xl border border-[#0B2A4A]/10 p-4">
                <h3 className="font-semibold text-[#0B2A4A]">{course.title}</h3>
                <p className="mt-1 text-xs text-[#1F2933]/55">{course.provider} · {course.duration}</p>
                <p className="mt-3 text-xs text-[#1F2933]/65">Закрывает: {course.addresses.join(', ')}</p>
                {course.enrolled && <div className="mt-4"><Progress value={course.progress} showPercentage /></div>}
                <Button className="mt-4" size="sm" disabled={pending === `course-${course.id}`} onClick={() => void mutate(`course-${course.id}`, () => course.enrolled ? updateCourseProgress(course.id, Math.min(100, course.progress + 25)) : enrollCourse(course.id))}>
                  {course.enrolled ? 'Отметить прогресс +25%' : 'Записаться'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BriefcaseBusiness className="h-5 w-5 text-[#00A3E0]" />Стажировки</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {data.internships.length === 0 && <p className="text-sm text-[#1F2933]/55">Завершите оценку, чтобы увидеть совпадения.</p>}
            {data.internships.map((internship) => (
              <div key={internship.id} className="rounded-xl border border-[#0B2A4A]/10 p-4">
                <div className="flex items-start justify-between gap-3"><h3 className="font-semibold text-[#0B2A4A]">{internship.title}</h3><Badge variant="accent">{internship.matchScore}%</Badge></div>
                <p className="mt-2 text-xs text-[#1F2933]/55">{internship.company}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-[#1F2933]/55"><MapPin className="h-3 w-3" />{internship.location}</p>
                {internship.missingSkills.length > 0 && <p className="mt-3 text-xs text-[#8a5a0a]">Не хватает: {internship.missingSkills.join(', ')}</p>}
                <Button className="mt-4" size="sm" disabled={internship.applied || pending === `intern-${internship.id}`} onClick={() => void mutate(`intern-${internship.id}`, () => applyInternship(internship.id))}>
                  {internship.applied ? internship.applicationStatus : 'Подать заявку'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
