import { redirect } from 'next/navigation';
import { RegisterForm } from '@/components/auth/register-form';
import { Footer } from '@/components/shared/footer';
import { Header } from '@/components/shared/header';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  if (await getSession()) redirect('/dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FA]">
      <Header variant="landing" />
      <main className="flex-1 flex items-center justify-center pt-24 pb-16 px-4">
        <RegisterForm />
      </main>
      <Footer />
    </div>
  );
}
