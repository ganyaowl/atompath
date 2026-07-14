import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AtomPath — карьерные маршруты для атомных регионов',
  description:
    'Оценка навыков, обучение и карьерные маршруты для устойчивой занятости в атомных регионах.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full">
      <body className="min-h-full flex flex-col antialiased font-sans">{children}</body>
    </html>
  );
}
