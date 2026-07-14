import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'AtomPath — Sustainable Employment for Nuclear Regions',
  description:
    'AtomPath predicts future workforce demand, evaluates your skills, and creates a personalized pathway from construction work to long-term employment.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <body className="min-h-full flex flex-col antialiased font-sans">{children}</body>
    </html>
  );
}
