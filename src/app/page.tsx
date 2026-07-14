'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ClipboardCheck,
  GitBranch,
  Rocket,
  Zap,
  Flame,
  HardHat,
  ArrowRight,
  ArrowDown,
  TrendingUp,
  Target,
  BookOpen,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  howItWorksSteps,
  careerTransitions,
  forecastData,
  kpiStats,
} from '@/lib/data';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

/* ------------------------------------------------------------------ */
/*  Animation helper                                                   */
/* ------------------------------------------------------------------ */
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5 },
};

/* ------------------------------------------------------------------ */
/*  Icon map for data-driven rendering                                 */
/* ------------------------------------------------------------------ */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ClipboardCheck,
  GitBranch,
  Rocket,
  Zap,
  Flame,
  HardHat,
  Target,
  BookOpen,
  TrendingUp,
  MapPin,
};

/* ------------------------------------------------------------------ */
/*  Landing Page                                                       */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <Header variant="landing" />

      {/* ── Hero Section ───────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#0B2A4A] via-[#0B2A4A] to-[#2F5D7C] text-white pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left ------------------------------------------------- */}
            <motion.div {...fadeIn}>
              <Badge variant="accent" className="mb-6">
                Платформа устойчивой занятости
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold leading-tight">
                Постройте свою следующую карьеру до окончания текущей работы.
              </h1>

              <p className="text-lg text-white/70 max-w-xl mt-6">
                AtomPath прогнозирует будущий спрос на рабочую силу, оценивает ваши
                навыки и создает индивидуальный путь от строительных работ к долгосрочной занятости.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link href="/dashboard">
                  <Button variant="primary" size="lg">
                    Пройти оценку
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>

                <a href="#forecast">
                  <Button
                    variant="outline"
                    size="lg"
                  >
                    Посмотреть прогноз вакансий
                  </Button>
                </a>
              </div>
            </motion.div>

            {/* Right – dashboard preview mockup ---------------------- */}
            <motion.div
              className="hidden lg:block"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-6 space-y-4">
                {/* Career Readiness card */}
                <div className="bg-white rounded-xl p-5 shadow-xl">
                  <h3 className="text-sm font-semibold text-[#0B2A4A] text-center">
                    Готовность к карьере
                  </h3>

                  {/* Circular progress ring */}
                  <div className="w-24 h-24 mx-auto my-4 relative">
                    <svg
                      className="w-full h-full -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#F4F7FA"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#00A3E0"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 42 * 0.82} ${2 * Math.PI * 42 * 0.18}`}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-[#0B2A4A]">
                      82%
                    </span>
                  </div>

                  <p className="text-xs text-center text-[#3FAE5A] font-medium">
                    Готов к трудоустройству
                  </p>

                  <div className="flex justify-between mt-4 text-xs text-[#1F2933]/60">
                    <span>Навыки: 12</span>
                    <span>Курсы: 3</span>
                    <span>Совпадение: 92%</span>
                  </div>
                </div>

                {/* Skill bars card */}
                <div className="bg-white rounded-xl p-5 shadow-xl space-y-3">
                  <h4 className="text-xs font-semibold text-[#0B2A4A]">
                    Ключевые навыки
                  </h4>
                  {[
                    { label: 'Соблюдение безопасности', pct: 90, color: '#3FAE5A' },
                    { label: 'Технический чертеж', pct: 72, color: '#00A3E0' },
                    { label: 'Управление проектами', pct: 65, color: '#2F5D7C' },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="flex justify-between text-[10px] text-[#1F2933]/60 mb-1">
                        <span>{s.label}</span>
                        <span>{s.pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#F4F7FA]">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${s.pct}%`,
                            backgroundColor: s.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-[#F4F7FA] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="text-center">
            <h2 className="text-4xl font-bold text-[#0B2A4A]">
              Как это работает
            </h2>
            <p className="text-[#1F2933]/60 mt-3">
              Три шага к вашей новой карьере
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 relative">
            {howItWorksSteps.map(
              (
                step: {
                  icon: string;
                  title: string;
                  description: string;
                },
                idx: number,
              ) => {
                const Icon = iconMap[step.icon];
                return (
                  <React.Fragment key={step.title}>
                    <motion.div {...fadeIn} transition={{ duration: 0.5, delay: idx * 0.15 }} className="h-full">
                      <Card className="h-full flex flex-col">
                        <CardHeader>
                          <Badge variant="default" className="w-fit mb-3">
                            Шаг {idx + 1}
                          </Badge>
                          {Icon && (
                            <Icon className="h-8 w-8 text-[#00A3E0] mb-2" />
                          )}
                          <CardTitle>{step.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <CardDescription>{step.description}</CardDescription>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Connector arrow (desktop only, between cards) */}
                    {idx < howItWorksSteps.length - 1 && (
                      <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 items-center justify-center"
                        style={{ left: `${((idx + 1) / howItWorksSteps.length) * 100}%`, transform: 'translate(-50%, -50%)' }}
                      >
                        <ChevronRight className="h-6 w-6 text-[#00A3E0]" />
                      </div>
                    )}
                  </React.Fragment>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* ── Career Transition Examples ─────────────────────────────── */}
      <section id="career-paths" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="text-center">
            <h2 className="text-4xl font-bold text-[#0B2A4A]">
              Примеры смены карьеры
            </h2>
            <p className="text-[#1F2933]/60 mt-3">
              Реальные траектории от строительства к долгосрочной карьере
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {careerTransitions.map(
              (
                t: {
                  icon: string;
                  currentRole: string;
                  futureRole: string;
                  transitionTime: string;
                  salaryGrowth: string;
                },
                idx: number,
              ) => {
                const Icon = iconMap[t.icon];
                return (
                  <motion.div
                    key={t.currentRole}
                    {...fadeIn}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                  >
                    <Card>
                      <CardContent className="pt-6">
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-xl bg-[#00A3E0]/10 flex items-center justify-center mb-5">
                          {Icon && (
                            <Icon className="h-6 w-6 text-[#00A3E0]" />
                          )}
                        </div>

                        {/* Current role */}
                        <span className="text-xs text-[#1F2933]/40 uppercase tracking-wider">
                          Текущая специальность
                        </span>
                        <p className="font-medium text-[#1F2933]">
                          {t.currentRole}
                        </p>

                        {/* Connector */}
                        <div className="flex flex-col items-center my-3">
                          <div className="w-px h-4 border-l border-dashed border-[#00A3E0]" />
                          <ArrowDown className="h-4 w-4 text-[#00A3E0]" />
                          <div className="w-px h-4 border-l border-dashed border-[#00A3E0]" />
                        </div>

                        {/* Future role */}
                        <span className="text-xs text-[#1F2933]/40 uppercase tracking-wider">
                          Будущая специальность
                        </span>
                        <p className="font-semibold text-[#0B2A4A] text-lg">
                          {t.futureRole}
                        </p>

                        {/* Meta row */}
                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#F4F7FA]">
                          <span className="text-xs text-[#1F2933]/60">
                            {t.transitionTime}
                          </span>
                          <span className="text-xs font-semibold text-[#3FAE5A] flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {t.salaryGrowth}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* ── Workforce Demand Forecast ──────────────────────────────── */}
      <section id="forecast" className="bg-[#F4F7FA] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="text-center">
            <h2 className="text-4xl font-bold text-[#0B2A4A]">
              Прогноз спроса на рабочую силу
            </h2>
            <p className="text-[#1F2933]/60 mt-3">
              Прогнозируемое количество вакансий в ключевых секторах (2025–2029)
            </p>
          </motion.div>

          <motion.div {...fadeIn} className="mt-12">
            <Card>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={forecastData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#0B2A4A10"
                    />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '0.5rem',
                        boxShadow:
                          '0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1)',
                        border: 'none',
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="automation"
                      name="Инженеры по автоматизации"
                      fill="#00A3E0"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="safety"
                      name="Специалисты по безопасности"
                      fill="#0B2A4A"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="digital"
                      name="Цифровое строительство"
                      fill="#2F5D7C"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="nuclear"
                      name="Обслуживание ядерных объектов"
                      fill="#3FAE5A"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ── KPI / Platform Impact ──────────────────────────────────── */}
      <section id="about" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="text-center">
            <h2 className="text-4xl font-bold text-[#0B2A4A]">
              Эффективность платформы
            </h2>
            <p className="text-[#1F2933]/60 mt-3">
              Измеримые результаты, способствующие трансформации рынка труда
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {kpiStats.map(
              (
                kpi: {
                  icon: string;
                  value: string;
                  label: string;
                },
                idx: number,
              ) => {
                const Icon = iconMap[kpi.icon];
                return (
                  <motion.div
                    key={kpi.label}
                    {...fadeIn}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                  >
                    <Card className="text-center p-8">
                      <div className="w-14 h-14 rounded-full bg-[#00A3E0]/10 mx-auto flex items-center justify-center">
                        {Icon && (
                          <Icon className="h-6 w-6 text-[#00A3E0]" />
                        )}
                      </div>
                      <p className="text-4xl font-bold text-[#0B2A4A] mt-4">
                        {kpi.value}
                      </p>
                      <p className="text-sm text-[#1F2933]/60 mt-1">
                        {kpi.label}
                      </p>
                    </Card>
                  </motion.div>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <Footer />
    </main>
  );
}
