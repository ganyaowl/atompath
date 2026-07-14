'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  Clock,
  Award,
  ChevronRight,
  BookOpen,
  Building2,
  TrendingUp,
  CheckCircle2,
  Circle,
  ArrowRight,
  Star,
} from 'lucide-react';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import {
  userProfile,
  skillGaps,
  careerRoadmap,
  recommendedCourses,
  recommendedInternships,
  demandChartData,
  professions,
  experienceOptions,
} from '@/lib/data';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function DashboardPage() {
  const [profession, setProfession] = useState('');
  const [experience, setExperience] = useState('');

  const readinessPercent = 82;
  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (readinessPercent / 100) * circumference;

  return (
    <div className="min-h-screen flex flex-col">
      <Header variant="dashboard" />

      <main className="flex-1 pt-20 bg-[#F4F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0B2A4A]">
              Здравствуйте, Алексей.
            </h1>
            <p className="text-[#1F2933]/60 mt-2">
              Ваша готовность к трудоустройству повышается.
            </p>
          </motion.div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* User Profile Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Avatar */}
                      <div className="w-20 h-20 rounded-full bg-[#00A3E0]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-[#00A3E0]">
                          AP
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-[#0B2A4A]">
                          {userProfile.name}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                          <div className="flex items-center gap-2 text-sm text-[#1F2933]/60">
                            <Briefcase className="w-4 h-4" />
                            <span>{userProfile.currentPosition}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#1F2933]/60">
                            <Clock className="w-4 h-4" />
                            <span>{userProfile.experience}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#1F2933]/60">
                            <MapPin className="w-4 h-4" />
                            <span>{userProfile.region}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Current Skills */}
                    <div className="mt-6">
                      <p className="text-sm font-medium text-[#0B2A4A] mb-2">
                        Текущие навыки
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.skills.map((skill: string) => (
                          <Badge key={skill} variant="accent">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Skill Gap Analysis */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Анализ дефицита навыков</CardTitle>
                    <p className="text-sm text-[#1F2933]/60">
                      Требуемые навыки для техника промышленной автоматизации
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-5">
                      {skillGaps.map((gap) => {
                        let colorClass = 'bg-[#00A3E0]';
                        if (gap.current < 30) {
                          colorClass = 'bg-[#D64545]';
                        } else if (gap.current < 50) {
                          colorClass = 'bg-[#F5A623]';
                        }

                        return (
                          <Progress
                            key={gap.name}
                            label={gap.name}
                            value={gap.current}
                            className={colorClass}
                          />
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Personalized Career Roadmap */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Дорожная карта карьеры</CardTitle>
                    <p className="text-sm text-[#1F2933]/60">
                      Ваш индивидуальный путь к трудоустройству
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-0">
                      {careerRoadmap.map((step, index) => {
                        const isLast = index === careerRoadmap.length - 1;

                        let iconElement: React.ReactNode;
                        let lineColor: string;
                        let badgeVariant: 'success' | 'accent' | 'warning' | 'default';
                        let badgeText: string;

                        switch (step.status) {
                          case 'completed':
                            iconElement = (
                              <CheckCircle2 className="w-6 h-6 text-[#3FAE5A]" />
                            );
                            lineColor = 'bg-[#3FAE5A]';
                            badgeVariant = 'success';
                            badgeText = 'Завершено';
                            break;
                          case 'in-progress':
                            iconElement = (
                              <div className="w-6 h-6 rounded-full border-2 border-[#00A3E0] flex items-center justify-center animate-pulse">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#00A3E0]" />
                              </div>
                            );
                            lineColor = 'bg-[#0B2A4A]/10';
                            badgeVariant = 'accent';
                            badgeText = 'В процессе';
                            break;
                          case 'upcoming':
                            iconElement = (
                              <Circle className="w-6 h-6 text-[#0B2A4A]/20" />
                            );
                            lineColor = 'bg-[#0B2A4A]/10';
                            badgeVariant = 'warning';
                            badgeText = 'Ожидается';
                            break;
                          case 'planned':
                            iconElement = (
                              <Circle className="w-6 h-6 text-[#0B2A4A]/20" />
                            );
                            lineColor = 'bg-[#0B2A4A]/10';
                            badgeVariant = 'default';
                            badgeText = 'Запланировано';
                            break;
                          case 'target':
                            iconElement = (
                              <Star className="w-6 h-6 text-[#0B2A4A]/20" />
                            );
                            lineColor = 'bg-[#0B2A4A]/10';
                            badgeVariant = 'default';
                            badgeText = 'Цель';
                            break;
                          default:
                            iconElement = (
                              <Circle className="w-6 h-6 text-[#0B2A4A]/20" />
                            );
                            lineColor = 'bg-[#0B2A4A]/10';
                            badgeVariant = 'default';
                            badgeText = step.status;
                        }

                        return (
                          <div key={step.title} className="flex gap-4">
                            {/* Left: icon + connector line */}
                            <div className="flex flex-col items-center">
                              <div className="flex-shrink-0">{iconElement}</div>
                              {!isLast && (
                                <div
                                  className={`w-0.5 flex-1 my-1 ${lineColor}`}
                                />
                              )}
                            </div>

                            {/* Right: content */}
                            <div className="pb-8">
                              <p className="font-medium text-[#0B2A4A]">
                                {step.title}
                              </p>
                              <p className="text-sm text-[#1F2933]/60 mt-1">
                                {step.description}
                              </p>
                              <Badge
                                variant={badgeVariant}
                                className="mt-2"
                              >
                                {badgeText}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recommended Courses */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Рекомендуемые курсы</CardTitle>
                    <p className="text-sm text-[#1F2933]/60">
                      Курсы, адаптированные под вашу траекторию развития
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recommendedCourses.map((course) => (
                        <div
                          key={course.title}
                          className="border border-[#0B2A4A]/10 rounded-lg p-4"
                        >
                          <h4 className="font-medium text-[#0B2A4A]">
                            {course.title}
                          </h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-[#1F2933]/60">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {course.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5" />
                              {course.provider}
                            </span>
                          </div>
                          {course.progress > 0 && (
                            <div className="mt-3">
                              <Progress
                                value={course.progress}
                                className="bg-[#00A3E0]"
                              />
                            </div>
                          )}
                          <div className="mt-3">
                            <Button
                              variant={
                                course.progress > 0 ? 'primary' : 'secondary'
                              }
                              size="sm"
                            >
                              {course.progress > 0 ? 'Продолжить' : 'Записаться'}
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Employment Readiness */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <Card>
                  <div className="h-2 bg-gradient-to-r from-[#0B2A4A] to-[#00A3E0] rounded-t-lg" />
                  <CardContent className="pt-6">
                    {/* Circular Progress Indicator */}
                    <div className="w-32 h-32 mx-auto relative">
                      <svg
                        className="w-full h-full -rotate-90"
                        viewBox="0 0 120 120"
                      >
                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          fill="none"
                          stroke="#0B2A4A1A"
                          strokeWidth="8"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          fill="none"
                          stroke="#00A3E0"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-[#0B2A4A]">
                          {readinessPercent}%
                        </span>
                      </div>
                    </div>

                    <p className="font-semibold text-[#0B2A4A] text-center mt-4">
                      Готов к трудоустройству
                    </p>
                    <p className="text-sm text-[#1F2933]/60 text-center mt-2">
                      Завершите курс по ПЛК и пройдите сертификацию, чтобы открыть рекомендуемые вакансии.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recommended Internships */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Стажировки</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recommendedInternships.map((internship) => (
                        <div
                          key={internship.title}
                          className="border border-[#0B2A4A]/10 rounded-lg p-4"
                        >
                          <h4 className="font-medium text-[#0B2A4A]">
                            {internship.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1.5 text-sm text-[#1F2933]/60">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{internship.company}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-[#1F2933]/60">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{internship.location}</span>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <Badge variant="success">
                              {internship.match}% совпадение
                            </Badge>
                            <Button variant="secondary" size="sm">
                              Подробнее
                              <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Demand Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Обзор спроса</CardTitle>
                    <p className="text-sm text-[#1F2933]/60">
                      Динамика спроса на техников автоматизации
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={demandChartData}>
                        <defs>
                          <linearGradient
                            id="demandGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#0B2A4A"
                              stopOpacity={0.1}
                            />
                            <stop
                              offset="100%"
                              stopColor="#0B2A4A"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="projectedGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#00A3E0"
                              stopOpacity={0.1}
                            />
                            <stop
                              offset="100%"
                              stopColor="#00A3E0"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#0B2A4A10"
                        />
                        <XAxis
                          dataKey="period"
                          tick={{ fontSize: 12, fill: '#1F293399' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #0B2A4A10',
                            borderRadius: '8px',
                            fontSize: '13px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="demand"
                          stroke="#0B2A4A"
                          fill="url(#demandGradient)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="projected"
                          stroke="#00A3E0"
                          fill="url(#projectedGradient)"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Assessment Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Быстрая оценка</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Select
                        label="Текущая профессия"
                        value={profession}
                        onChange={setProfession}
                        options={professions}
                        placeholder="Выберите профессию"
                      />
                      <Select
                        label="Опыт работы"
                        value={experience}
                        onChange={setExperience}
                        options={experienceOptions}
                        placeholder="Выберите опыт"
                      />
                      <Link href="/dashboard">
                        <Button variant="primary" className="w-full mt-4">
                          Создать карьерный путь
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
