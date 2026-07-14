import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getAssessmentDraft, getSkills } from '@/lib/resident-data';
import { AssessmentForm } from '@/components/assessment/assessment-form';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';

export const dynamic = 'force-dynamic';

export default async function AssessmentPage() {
  const user = await getSession();
  if (!user) redirect('/login');
  if (user.role !== 'resident') redirect('/dashboard');

  return (
    <div className="min-h-screen bg-[#F4F7FA]">
      <Header variant="dashboard" />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-24 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#00A3E0]">Карьерная диагностика</p>
          <h1 className="text-4xl font-bold text-[#0B2A4A]">Карта ваших навыков</h1>
          <p className="mt-3 text-[#1F2933]/65">Ответьте на вопросы, чтобы получить три объяснимых карьерных направления и персональный план развития.</p>
        </div>
        <AssessmentForm user={user} skills={await getSkills()} draft={await getAssessmentDraft(user.id)} />
      </main>
      <Footer />
    </div>
  );
}
