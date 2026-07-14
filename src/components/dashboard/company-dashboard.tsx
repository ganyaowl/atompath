'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  addProfession, 
  addInternship, 
  updateDemand, 
  handleApplicationAction, 
  logout 
} from '@/app/actions';
import { 
  PlusCircle, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Building, 
  MapPin, 
  Check, 
  X, 
  LogOut, 
  ShieldCheck 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CompanyDashboardProps {
  user: any;
  professionsList: any[];
  internshipsList: any[];
  applicantsList: any[];
  demandsList: any[];
}

export function CompanyDashboard({
  user,
  professionsList: initialProfessions,
  internshipsList: initialInternships,
  applicantsList: initialApplicants,
  demandsList: initialDemands
}: CompanyDashboardProps) {
  const [professions, setProfessions] = useState(initialProfessions);
  const [internships, setInternships] = useState(initialInternships);
  const [applicants, setApplicants] = useState(initialApplicants);
  const [demands, setDemands] = useState(initialDemands);

  // Form states
  const [profTitle, setProfTitle] = useState('');
  const [profReqs, setProfReqs] = useState('');
  const [profSalary, setProfSalary] = useState('');
  const [profTime, setProfTime] = useState('');

  const [intTitle, setIntTitle] = useState('');
  const [intCompany, setIntCompany] = useState(user.name || '');
  const [intLocation, setIntLocation] = useState('');
  const [intMatch, setIntMatch] = useState('85');

  const [demYear, setDemYear] = useState('');
  const [demAutomation, setDemAutomation] = useState('');
  const [demSafety, setDemSafety] = useState('');
  const [demDigital, setDemDigital] = useState('');
  const [demNuclear, setDemNuclear] = useState('');

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleAddProfession = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    const formData = new FormData();
    formData.append('title', profTitle);
    formData.append('requirements', profReqs);
    formData.append('salaryGrowth', profSalary);
    formData.append('transitionTime', profTime);

    const res = await addProfession(formData);
    if (res && res.success) {
      setProfessions(prev => [...prev, {
        title: profTitle,
        requirements: profReqs,
        salary_growth: profSalary || '+25%',
        transition_time: profTime || '6 месяцев'
      }]);
      setProfTitle('');
      setProfReqs('');
      setProfSalary('');
      setProfTime('');
      setStatusMsg({ type: 'success', text: 'Профессия успешно добавлена!' });
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Ошибка добавления' });
    }
  };

  const handleAddInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    const formData = new FormData();
    formData.append('title', intTitle);
    formData.append('company', intCompany);
    formData.append('location', intLocation);
    formData.append('matchPct', intMatch);

    const res = await addInternship(formData);
    if (res && res.success) {
      setInternships(prev => [...prev, {
        title: intTitle,
        company: intCompany,
        location: intLocation,
        match_pct: parseInt(intMatch, 10)
      }]);
      setIntTitle('');
      setIntLocation('');
      setStatusMsg({ type: 'success', text: 'Стажировка успешно добавлена!' });
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Ошибка добавления' });
    }
  };

  const handleAddDemand = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    const formData = new FormData();
    formData.append('year', demYear);
    formData.append('automation', demAutomation);
    formData.append('safety', demSafety);
    formData.append('digital', demDigital);
    formData.append('nuclear', demNuclear);

    const res = await updateDemand(formData);
    if (res && res.success) {
      const yearIdx = demands.findIndex(d => d.year === demYear);
      const newEntry = {
        year: demYear,
        automation: parseInt(demAutomation || '0', 10),
        safety: parseInt(demSafety || '0', 10),
        digital: parseInt(demDigital || '0', 10),
        nuclear: parseInt(demNuclear || '0', 10)
      };

      if (yearIdx > -1) {
        setDemands(prev => prev.map((d, idx) => idx === yearIdx ? newEntry : d));
      } else {
        setDemands(prev => [...prev, newEntry].sort((a, b) => a.year.localeCompare(b.year)));
      }

      setDemYear('');
      setDemAutomation('');
      setDemSafety('');
      setDemDigital('');
      setDemNuclear('');
      setStatusMsg({ type: 'success', text: 'Прогноз кадров обновлен!' });
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Ошибка обновления' });
    }
  };

  const handleApplicantAction = async (appId: number, action: 'Одобрить' | 'Отклонить') => {
    const res = await handleApplicationAction(appId, action);
    if (res && res.success) {
      setApplicants(prev =>
        prev.map(app => 
          app.applicationId === appId 
            ? { ...app, applicationStatus: action === 'Одобрить' ? 'Одобрено' : 'Отклонено' } 
            : app
        )
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0B2A4A] flex items-center gap-2.5">
            <Building className="h-8 w-8 text-[#00A3E0]" />
            Кабинет предприятия — {user.name}
          </h1>
          <p className="text-[#1F2933]/60 mt-1">
            Публикуйте стажировки, управляйте вакансиями и просматривайте статистику соискателей.
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

      {statusMsg && (
        <div className={`p-4 rounded-xl text-sm border ${
          statusMsg.type === 'success' 
            ? 'bg-[#3FAE5A]/10 border-[#3FAE5A]/20 text-[#3FAE5A]' 
            : 'bg-[#D64545]/10 border-[#D64545]/20 text-[#D64545]'
        }`}>
          {statusMsg.text}
        </div>
      )}

      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-[#00A3E0]/10 rounded-xl">
              <Briefcase className="h-6 w-6 text-[#00A3E0]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0B2A4A]">{professions.length}</p>
              <p className="text-xs text-[#1F2933]/60">Созданных профессий</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-[#3FAE5A]/10 rounded-xl">
              <Building className="h-6 w-6 text-[#3FAE5A]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0B2A4A]">{internships.length}</p>
              <p className="text-xs text-[#1F2933]/60">Активных стажировок</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-[#F5A623]/10 rounded-xl">
              <Users className="h-6 w-6 text-[#F5A623]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0B2A4A]">
                {applicants.filter(a => a.applicationStatus === 'Заявка подана').length}
              </p>
              <p className="text-xs text-[#1F2933]/60">Новых откликов жителей</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Forms column */}
        <div className="space-y-8 lg:col-span-1">
          {/* Post Internship */}
          <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-[#00A3E0]" />
                Опубликовать стажировку
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddInternship} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#1F2933] mb-1">Название стажировки</label>
                  <input
                    type="text"
                    required
                    value={intTitle}
                    onChange={(e) => setIntTitle(e.target.value)}
                    placeholder="например, Младший техник ПЛК"
                    className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#00A3E0] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1F2933] mb-1">Компания</label>
                  <input
                    type="text"
                    required
                    value={intCompany}
                    onChange={(e) => setIntCompany(e.target.value)}
                    className="w-full rounded-lg border border-[#0B2A4A]/15 bg-[#F4F7FA] px-3 py-2 text-sm text-[#1F2933]/60 focus:outline-none"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1F2933] mb-1">Город / Регион</label>
                  <input
                    type="text"
                    required
                    value={intLocation}
                    onChange={(e) => setIntLocation(e.target.value)}
                    placeholder="например, Сосновый Бор"
                    className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#00A3E0] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1F2933] mb-1">Минимальный процент совпадения (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={intMatch}
                    onChange={(e) => setIntMatch(e.target.value)}
                    className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#00A3E0] focus:outline-none"
                  />
                </div>
                <Button type="submit" size="sm" className="w-full text-xs h-9 mt-2">Опубликовать</Button>
              </form>
            </CardContent>
          </Card>

          {/* Add Profession */}
          <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-[#00A3E0]" />
                Создать профессию
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProfession} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#1F2933] mb-1">Название специальности</label>
                  <input
                    type="text"
                    required
                    value={profTitle}
                    onChange={(e) => setProfTitle(e.target.value)}
                    placeholder="например, Оператор БПЛА"
                    className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#00A3E0] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1F2933] mb-1">Требования к навыкам (через запятую)</label>
                  <input
                    type="text"
                    required
                    value={profReqs}
                    onChange={(e) => setProfReqs(e.target.value)}
                    placeholder="Управление БПЛА, Электроника"
                    className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#00A3E0] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1F2933] mb-1">Рост зарплаты (%)</label>
                  <input
                    type="text"
                    value={profSalary}
                    onChange={(e) => setProfSalary(e.target.value)}
                    placeholder="например, +25%"
                    className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#00A3E0] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1F2933] mb-1">Срок переобучения</label>
                  <input
                    type="text"
                    value={profTime}
                    onChange={(e) => setProfTime(e.target.value)}
                    placeholder="например, 6 месяцев"
                    className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#00A3E0] focus:outline-none"
                  />
                </div>
                <Button type="submit" size="sm" className="w-full text-xs h-9 mt-2">Добавить в реестр</Button>
              </form>
            </CardContent>
          </Card>

          {/* Hiring Forecast Demand Form */}
          <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#00A3E0]" />
                Прогноз потребности в кадрах
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddDemand} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#1F2933] mb-1">Год прогноза</label>
                  <input
                    type="text"
                    required
                    value={demYear}
                    onChange={(e) => setDemYear(e.target.value)}
                    placeholder="например, 2030"
                    className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#00A3E0] focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-[#1F2933] mb-1">Автоматизация</label>
                    <input
                      type="number"
                      value={demAutomation}
                      onChange={(e) => setDemAutomation(e.target.value)}
                      className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-2 py-1 text-xs text-[#1F2933] focus:border-[#00A3E0] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-[#1F2933] mb-1">Безопасность</label>
                    <input
                      type="number"
                      value={demSafety}
                      onChange={(e) => setDemSafety(e.target.value)}
                      className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-2 py-1 text-xs text-[#1F2933] focus:border-[#00A3E0] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-[#1F2933] mb-1">Цифровые тех.</label>
                    <input
                      type="number"
                      value={demDigital}
                      onChange={(e) => setDemDigital(e.target.value)}
                      className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-2 py-1 text-xs text-[#1F2933] focus:border-[#00A3E0] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-[#1F2933] mb-1">Ядерное обслуж.</label>
                    <input
                      type="number"
                      value={demNuclear}
                      onChange={(e) => setDemNuclear(e.target.value)}
                      className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-2 py-1 text-xs text-[#1F2933] focus:border-[#00A3E0] focus:outline-none"
                    />
                  </div>
                </div>
                <Button type="submit" size="sm" className="w-full text-xs h-9 mt-2">Сохранить прогноз</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right 2 columns (Applicants and Statistics) */}
        <div className="space-y-8 lg:col-span-2">
          {/* Candidates / Applicants tracker */}
          <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
            <CardHeader>
              <CardTitle>Отклики на стажировки</CardTitle>
              <p className="text-sm text-[#1F2933]/60">Кандидаты, подавшие заявки на стажировки вашего предприятия</p>
            </CardHeader>
            <CardContent>
              {applicants.length > 0 ? (
                <div className="divide-y divide-[#0B2A4A]/5">
                  {applicants.map((app) => (
                    <div key={app.applicationId} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-[#0B2A4A]">{app.residentName}</h4>
                          <span className="text-xs text-[#1F2933]/60">({app.residentEmail})</span>
                        </div>
                        <p className="text-xs text-[#1F2933]/70 mt-1">
                          Подал заявку на: <strong className="text-[#00A3E0]">{app.internshipTitle}</strong>
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {app.residentSkills.split(',').map((skill: string) => (
                            <Badge key={skill} variant="default" className="text-[10px] py-0 px-2">
                              {skill.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {app.applicationStatus === 'Заявка подана' ? (
                          <>
                            <button
                              onClick={() => handleApplicantAction(app.applicationId, 'Одобрить')}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3FAE5A]/10 text-[#3FAE5A] hover:bg-[#3FAE5A]/20 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Одобрить
                            </button>
                            <button
                              onClick={() => handleApplicantAction(app.applicationId, 'Отклонить')}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D64545]/10 text-[#D64545] hover:bg-[#D64545]/20 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                              Отклонить
                            </button>
                          </>
                        ) : (
                          <Badge variant={app.applicationStatus === 'Одобрено' ? 'success' : 'warning'}>
                            {app.applicationStatus === 'Одобрено' ? 'Одобрено' : 'Отклонено'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#1F2933]/40 py-4 text-center">Нет входящих заявок на стажировки.</p>
              )}
            </CardContent>
          </Card>

          {/* Dynamic aggregate statistics chart */}
          <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
            <CardHeader>
              <CardTitle>Динамика спроса на кадры (Прогноз)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={demands}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0B2A4A10" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="automation" name="Автоматизация" fill="#00A3E0" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="safety" name="Безопасность" fill="#0B2A4A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="digital" name="Цифровое строительство" fill="#2F5D7C" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="nuclear" name="Ядерное обслуживание" fill="#3FAE5A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* List of active professions */}
          <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
            <CardHeader>
              <CardTitle>Список востребованных профессий предприятия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {professions.map((prof) => (
                  <div key={prof.id || prof.title} className="border border-[#0B2A4A]/10 rounded-xl p-4 space-y-2">
                    <h4 className="font-semibold text-[#0B2A4A]">{prof.title}</h4>
                    <p className="text-xs text-[#1F2933]/60">
                      Срок подготовки: <strong>{prof.transition_time}</strong> | Зарплата: <strong className="text-[#3FAE5A]">{prof.salary_growth}</strong>
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {prof.requirements.split(',').map((req: string) => (
                        <Badge key={req} variant="default" className="text-[10px] py-0 px-2">
                          {req.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
