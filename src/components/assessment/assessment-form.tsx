'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveAssessmentDraft, submitAssessment } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AssessmentDraft, SessionUser, Skill } from '@/lib/types';

const LEVELS = [
  { value: 0, label: 'Не знаком' },
  { value: 1, label: 'Базовый' },
  { value: 2, label: 'Рабочий' },
  { value: 3, label: 'Продвинутый' },
  { value: 4, label: 'Эксперт' },
];

interface AssessmentFormProps {
  user: SessionUser;
  skills: Skill[];
  draft: AssessmentDraft | null;
}

export function AssessmentForm({ user, skills, draft }: AssessmentFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  const runAction = async (form: HTMLFormElement, complete: boolean) => {
    setPending(true);
    setMessage(null);
    const result = complete
      ? await submitAssessment(new FormData(form))
      : await saveAssessmentDraft(new FormData(form));
    if (!result.success) {
      setMessage({ kind: 'error', text: result.error });
      setPending(false);
      return;
    }
    setMessage({ kind: 'success', text: 'Черновик сохранен' });
    setPending(false);
    router.refresh();
  };

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        void runAction(event.currentTarget, true);
      }}
    >
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Профессиональный контекст</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <label className="text-sm font-medium">Текущая профессия
            <input name="currentPosition" required defaultValue={draft?.currentPosition ?? user.currentPosition} className="mt-2 w-full rounded-lg border border-[#0B2A4A]/15 px-4 py-3" />
          </label>
          <label className="text-sm font-medium">Опыт работы
            <input name="experience" required defaultValue={draft?.experience ?? user.experience} className="mt-2 w-full rounded-lg border border-[#0B2A4A]/15 px-4 py-3" />
          </label>
          <label className="text-sm font-medium">Регион
            <input name="region" required defaultValue={draft?.region ?? user.region} className="mt-2 w-full rounded-lg border border-[#0B2A4A]/15 px-4 py-3" />
          </label>
          <label className="text-sm font-medium">Сертификаты
            <input name="certifications" defaultValue={draft?.certifications ?? ''} placeholder="Через запятую, если есть" className="mt-2 w-full rounded-lg border border-[#0B2A4A]/15 px-4 py-3" />
          </label>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Оцените уровень навыков</CardTitle>
          <p className="text-sm text-[#1F2933]/60">Честная самооценка делает рекомендации точнее. Все поля обязательны для завершения.</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {skills.map((skill) => (
            <fieldset key={skill.id} className="rounded-xl border border-[#0B2A4A]/10 p-4">
              <legend className="px-2 font-semibold text-[#0B2A4A]">{skill.name}</legend>
              <p className="mb-3 text-xs text-[#1F2933]/50">{skill.category}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {LEVELS.map((level) => (
                  <label key={level.value} className="cursor-pointer rounded-lg border border-[#0B2A4A]/10 p-2 text-center text-xs has-[:checked]:border-[#00A3E0] has-[:checked]:bg-[#00A3E0]/10">
                    <input className="sr-only" type="radio" name={`skill_${skill.id}`} value={level.value} defaultChecked={draft?.levels[skill.id] === level.value} required />
                    {level.label}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </CardContent>
      </Card>

      {message && (
        <p className={`rounded-lg p-3 text-sm ${message.kind === 'error' ? 'bg-[#D64545]/10 text-[#D64545]' : 'bg-[#3FAE5A]/10 text-[#287d3d]'}`}>
          {message.text}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" disabled={pending} onClick={(event) => void runAction(event.currentTarget.form!, false)}>
          Сохранить черновик
        </Button>
        <Button type="submit" disabled={pending}>{pending ? 'Сохранение...' : 'Завершить оценку'}</Button>
      </div>
    </form>
  );
}
