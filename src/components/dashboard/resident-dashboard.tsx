'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  Clock,
  BookOpen,
  Building2,
  CheckCircle2,
  Circle,
  Star,
  RefreshCw,
  LogOut,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { 
  updateProfile, 
  enrollCourse, 
  applyInternship, 
  logout 
} from '@/app/actions';
import { professions, experienceOptions } from '@/lib/data';

interface ResidentDashboardProps {
  user: any;
  courses: any[];
  internships: any[];
  professionsList: any[];
}

export function ResidentDashboard({ 
  user, 
  courses: initialCourses, 
  internships: initialInternships,
  professionsList 
}: ResidentDashboardProps) {
  const [courses, setCourses] = useState(initialCourses);
  const [internships, setInternships] = useState(initialInternships);
  const [profile, setProfile] = useState(user);
  
  // Edit Profile Mode
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name || '');
  const [editPos, setEditPos] = useState(profile.current_position || '');
  const [editExp, setEditExp] = useState(profile.experience || '');
  const [editRegion, setEditRegion] = useState(profile.region || '');
  const [editSkills, setEditSkills] = useState(profile.skills || '');

  // Assessment Selection
  const [selectedProf, setSelectedProf] = useState('');
  const [selectedExp, setSelectedExp] = useState('');

  // Extract skills array
  const userSkills: string[] = profile.skills
    ? profile.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  // Skill Gap metrics based on skills
  const requiredSkills = [
    { name: 'Программирование ПЛК', has: userSkills.some((s: string) => s.toLowerCase().includes('плк') || s.toLowerCase().includes('plc')), baseVal: 35 },
    { name: 'Промышленная автоматизация', has: userSkills.some((s: string) => s.toLowerCase().includes('автомат')), baseVal: 50 },
    { name: 'Цифровая диагностика', has: userSkills.some((s: string) => s.toLowerCase().includes('диагн') || s.toLowerCase().includes('цифр')), baseVal: 20 },
    { name: 'Технический английский', has: userSkills.some((s: string) => s.toLowerCase().includes('англ') || s.toLowerCase().includes('eng')), baseVal: 60 },
  ];

  // Calculate current gaps based on course progress + base values
  const currentGaps = requiredSkills.map(skill => {
    // Check if user has enrolled in related courses
    let courseBonus = 0;
    if (skill.name === 'Программирование ПЛК') {
      const plcCourse = courses.find(c => c.title.includes('ПЛК'));
      if (plcCourse) courseBonus = Math.floor(plcCourse.progress * 0.65);
    } else if (skill.name === 'Промышленная автоматизация') {
      const safetyCourse = courses.find(c => c.title.includes('безопасност'));
      if (safetyCourse) courseBonus = Math.floor(safetyCourse.progress * 0.5);
    } else if (skill.name === 'Цифровая диагностика') {
      const diagCourse = courses.find(c => c.title.includes('Цифровое'));
      if (diagCourse) courseBonus = Math.floor(diagCourse.progress * 0.8);
    }

    const currentPercent = skill.has ? 100 : Math.min(skill.baseVal + courseBonus, 100);
    return {
      name: skill.name,
      current: currentPercent,
    };
  });

  // Calculate overall readiness
  const avgReadiness = Math.round(
    currentGaps.reduce((acc, curr) => acc + curr.current, 0) / currentGaps.length
  );

  // Roadmap calculation dynamically
  const isAssessmentCompleted = true;
  const isLearningInProgress = courses.some(c => c.progress > 0 && c.progress < 100);
  const isCertified = courses.every(c => c.progress === 100) && courses.length > 0;
  const isAppliedInternship = internships.some(i => i.applied);

  const roadmap = [
    { step: 1, title: 'Оценка навыков', status: 'completed', desc: 'Первичный профиль заполнен и оценен' },
    { step: 2, title: 'Программы обучения', status: isLearningInProgress ? 'in-progress' : (isCertified ? 'completed' : 'upcoming'), desc: 'Изучение курсов автоматизации' },
    { step: 3, title: 'Сертификация', status: isCertified ? 'completed' : 'upcoming', desc: 'Получение допуска к ядерным системам' },
    { step: 4, title: 'Стажировка', status: isAppliedInternship ? 'in-progress' : 'planned', desc: 'Подана заявка в Центр ядерных операций' },
    { step: 5, title: 'Трудоустройство', status: avgReadiness > 85 ? 'planned' : 'target', desc: 'Переход на постоянную позицию' },
  ];

  // Circle progress calculation
  const readinessPercent = avgReadiness;
  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (readinessPercent / 100) * circumference;

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', editName);
    formData.append('currentPosition', editPos);
    formData.append('experience', editExp);
    formData.append('region', editRegion);
    formData.append('skills', editSkills);

    const res = await updateProfile(formData);
    if (res && res.success) {
      setProfile({
        ...profile,
        name: editName,
        current_position: editPos,
        experience: editExp,
        region: editRegion,
        skills: editSkills
      });
      setIsEditing(false);
    }
  };

  const handleQuickAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProf) return;
    
    // Simulate updating current profession and experience
    const formData = new FormData();
    formData.append('name', profile.name);
    formData.append('currentPosition', selectedProf);
    formData.append('experience', selectedExp || profile.experience);
    formData.append('region', profile.region);
    formData.append('skills', profile.skills);

    const res = await updateProfile(formData);
    if (res && res.success) {
      setProfile({
        ...profile,
        current_position: selectedProf,
        experience: selectedExp || profile.experience
      });
      setSelectedProf('');
      setSelectedExp('');
    }
  };

  const handleEnroll = async (courseId: number) => {
    const res = await enrollCourse(courseId);
    if (res && res.success) {
      // Update UI state
      setCourses(prev => 
        prev.map(c => {
          if (c.id === courseId) {
            const nextProgress = Math.min(c.progress + 20, 100);
            return { ...c, progress: nextProgress || 20 };
          }
          return c;
        })
      );
    }
  };

  const handleApply = async (internshipId: number) => {
    const res = await applyInternship(internshipId);
    if (res && res.success) {
      setInternships(prev =>
        prev.map(i => i.id === internshipId ? { ...i, applied: true, appStatus: 'Заявка подана' } : i)
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0B2A4A]">
            Здравствуйте, {profile.name}.
          </h1>
          <p className="text-[#1F2933]/60 mt-2">
            Ваша готовность к трудоустройству составляет {readinessPercent}%.
          </p>
        </div>
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 px-4 py-2 border border-[#D64545]/20 text-[#D64545] hover:bg-[#D64545]/5 rounded-lg text-sm transition-colors cursor-pointer w-fit"
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Profile Card */}
          <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
            <CardContent className="pt-6">
              {!isEditing ? (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-full bg-[#00A3E0]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-[#00A3E0]">
                        {profile.name ? profile.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'AP'}
                      </span>
                    </div>

                    {/* Profile Details */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-[#0B2A4A]">
                          {profile.name}
                        </h2>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => {
                            setEditName(profile.name || '');
                            setEditPos(profile.current_position || '');
                            setEditExp(profile.experience || '');
                            setEditRegion(profile.region || '');
                            setEditSkills(profile.skills || '');
                            setIsEditing(true);
                          }}
                        >
                          Редактировать
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center gap-2 text-sm text-[#1F2933]/60">
                          <Briefcase className="w-4 h-4 text-[#00A3E0]" />
                          <span>{profile.current_position || 'Не указана'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#1F2933]/60">
                          <Clock className="w-4 h-4 text-[#00A3E0]" />
                          <span>{profile.experience || 'Не указан'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#1F2933]/60">
                          <MapPin className="w-4 h-4 text-[#00A3E0]" />
                          <span>{profile.region || 'Не указан'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div>
                    <p className="text-sm font-medium text-[#0B2A4A] mb-2.5">
                      Ваши навыки
                    </p>
                    {userSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {userSkills.map((skill) => (
                          <Badge key={skill} variant="accent">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#1F2933]/40">Навыки еще не добавлены. Заполните профиль.</p>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#0B2A4A]">Редактирование профиля</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#1F2933] mb-1">ФИО</label>
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#00A3E0] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#1F2933] mb-1">Специальность</label>
                      <input 
                        type="text" 
                        value={editPos}
                        onChange={(e) => setEditPos(e.target.value)}
                        className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#00A3E0] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#1F2933] mb-1">Опыт работы</label>
                      <input 
                        type="text" 
                        value={editExp}
                        onChange={(e) => setEditExp(e.target.value)}
                        placeholder="например, 6 лет"
                        className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#00A3E0] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#1F2933] mb-1">Регион / Район</label>
                      <input 
                        type="text" 
                        value={editRegion}
                        onChange={(e) => setEditRegion(e.target.value)}
                        className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#00A3E0] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1F2933] mb-1">Ваши навыки (через запятую)</label>
                    <input 
                      type="text" 
                      value={editSkills}
                      onChange={(e) => setEditSkills(e.target.value)}
                      placeholder="Чертежи, Монтаж кабелей, Безопасность"
                      className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#00A3E0] focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">Сохранить</Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => setIsEditing(false)}>Отмена</Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Skill Gap Card */}
          <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
            <CardHeader>
              <CardTitle>Анализ дефицита навыков</CardTitle>
              <p className="text-sm text-[#1F2933]/60">
                Соответствие требуемым компетенциям для роли: <strong>Техник промышленной автоматизации</strong>
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {currentGaps.map((gap) => {
                  let colorClass = 'bg-[#00A3E0]';
                  if (gap.current < 40) {
                    colorClass = 'bg-[#D64545]'; // Success or warning colors
                  } else if (gap.current < 70) {
                    colorClass = 'bg-[#F5A623]';
                  } else {
                    colorClass = 'bg-[#3FAE5A]';
                  }

                  return (
                    <Progress
                      key={gap.name}
                      label={gap.name}
                      value={gap.current}
                      colorClass={colorClass}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Personalized Career Roadmap */}
          <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
            <CardHeader>
              <CardTitle>Карьерная дорожная карта</CardTitle>
              <p className="text-sm text-[#1F2933]/60">
                Индивидуальные шаги к постоянному трудоустройству
              </p>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-[#0B2A4A]/10 ml-3 pl-8 space-y-8">
                {roadmap.map((step) => {
                  const isCompleted = step.status === 'completed';
                  const isInProgress = step.status === 'in-progress';

                  return (
                    <div key={step.step} className="relative">
                      {/* Timeline Dot */}
                      <span className={`absolute -left-11 top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white ${
                        isCompleted 
                          ? 'border-[#3FAE5A] text-[#3FAE5A]' 
                          : isInProgress 
                          ? 'border-[#00A3E0] text-[#00A3E0]' 
                          : 'border-[#0B2A4A]/20 text-[#0B2A4A]/20'
                      }`}>
                        {isCompleted ? (
                          <Check className="h-3 w-3 stroke-[3]" />
                        ) : (
                          <span className={`h-1.5 w-1.5 rounded-full ${isInProgress ? 'bg-[#00A3E0] animate-ping' : 'bg-[#0B2A4A]/20'}`} />
                        )}
                      </span>

                      {/* Content */}
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-[#0B2A4A]">{step.title}</h4>
                          <Badge variant={isCompleted ? 'success' : (isInProgress ? 'accent' : 'default')}>
                            {isCompleted ? 'Завершено' : (isInProgress ? 'В процессе' : 'Ожидается')}
                          </Badge>
                        </div>
                        <p className="text-sm text-[#1F2933]/60 mt-1">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Courses */}
          <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
            <CardHeader>
              <CardTitle>Рекомендуемые учебные программы</CardTitle>
              <p className="text-sm text-[#1F2933]/60">
                Пройдите обучение, чтобы устранить выявленный дефицит навыков
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => {
                  const hasProgress = course.progress > 0;
                  const isFinished = course.progress === 100;

                  return (
                    <div key={course.id} className="border border-[#0B2A4A]/10 rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h4 className="font-semibold text-[#0B2A4A] leading-tight">
                            {course.title}
                          </h4>
                          {isFinished && (
                            <Badge variant="success" className="flex-shrink-0">
                              Изучен
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-[#1F2933]/50 mb-3">{course.provider}</p>
                        
                        <div className="flex gap-4 text-xs text-[#1F2933]/60 mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {course.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            6 модулей
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 mt-auto">
                        {hasProgress && (
                          <Progress value={course.progress} showPercentage colorClass="bg-[#3FAE5A]" />
                        )}
                        <Button 
                          onClick={() => handleEnroll(course.id)}
                          variant={isFinished ? 'secondary' : 'primary'}
                          className="w-full text-xs h-9 cursor-pointer"
                          disabled={isFinished}
                        >
                          {isFinished ? 'Завершено' : (hasProgress ? 'Продолжить обучение' : 'Начать обучение')}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          
          {/* Circular Readiness */}
          <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-[#0B2A4A] to-[#00A3E0]" />
            <CardContent className="pt-6 text-center">
              <h3 className="font-semibold text-[#0B2A4A] mb-4 text-lg">Готовность к трудоустройству</h3>
              
              <div className="w-32 h-32 mx-auto relative mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="#0B2A4A10"
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
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[#0B2A4A]">
                    {readinessPercent}%
                  </span>
                </div>
              </div>

              <p className="text-sm text-[#1F2933]/60 px-2 leading-relaxed">
                {readinessPercent > 80 
                  ? 'Отличный показатель! Вы полностью готовы к подаче заявок на вакансии.' 
                  : 'Завершите рекомендованные курсы по ПЛК и диагностике, чтобы повысить готовность и открыть вакансии.'}
              </p>
            </CardContent>
          </Card>

          {/* Internships Recommended */}
          <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
            <CardHeader>
              <CardTitle>Рекомендуемые стажировки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {internships.map((internship) => (
                <div key={internship.id} className="border border-[#0B2A4A]/10 rounded-xl p-4 space-y-3">
                  <div>
                    <h4 className="font-semibold text-[#0B2A4A] text-sm leading-snug">
                      {internship.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-[#1F2933]/60 mt-1">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{internship.company}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#1F2933]/60 mt-0.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{internship.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#0B2A4A]/5">
                    <Badge variant="success">
                      {internship.match_pct}% Совпадение
                    </Badge>
                    
                    <Button 
                      onClick={() => handleApply(internship.id)}
                      variant={internship.applied ? 'secondary' : 'primary'} 
                      size="sm"
                      className="text-[11px] h-8 cursor-pointer"
                      disabled={internship.applied}
                    >
                      {internship.applied ? 'Заявка подана' : 'Подать заявку'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Assessment Form */}
          <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
            <CardHeader>
              <CardTitle>Быстрая оценка</CardTitle>
              <p className="text-xs text-[#1F2933]/60">Сгенерируйте новые рекомендации, выбрав профессию</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQuickAssessment} className="space-y-4">
                <Select
                  label="Целевая профессия"
                  options={professions}
                  value={selectedProf}
                  onChange={setSelectedProf}
                  placeholder="Выберите профессию"
                />
                <Select
                  label="Опыт работы"
                  options={experienceOptions}
                  value={selectedExp}
                  onChange={setSelectedExp}
                  placeholder="Ваш стаж"
                />
                <Button type="submit" className="w-full text-xs h-10 mt-2">
                  Подобрать траекторию
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
