import { redirect } from 'next/navigation';
import { Footer } from '@/components/shared/footer';
import { Header } from '@/components/shared/header';
import { LoginForm } from '@/components/auth/login-form';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  if (await getSession()) redirect('/dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FA]">
      <Header variant="landing" />
      <main className="flex-1 flex items-center justify-center pt-24 pb-16 px-4">
        <LoginForm />
      </main>
      <Footer />
    </div>
  );
}
