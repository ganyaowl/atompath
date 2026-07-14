'use client';

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Briefcase, Building, Check, LogOut, PlusCircle, TrendingUp, Users, X } from 'lucide-react';
import { addInternship, handleApplicationAction, logout } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CompanyDashboardProps {
  user: { name: string };
  professionsList: ProfessionRow[];
  internshipsList: InternshipRow[];
  applicantsList: ApplicantRow[];
  demandsList: DemandRow[];
}

interface ProfessionRow {
  id?: number;
  title: string;
  requirements: string;
  salary_growth: string;
  transition_time: string;
}

interface InternshipRow {
  id?: number;
  title: string;
  company: string;
  location: string;
  match_pct: number;
}

interface ApplicantRow {
  applicationId: number;
  applicationStatus: string;
  residentName: string;
  residentEmail: string;
  residentSkills: string;
  internshipTitle: string;
}

interface DemandRow {
  year: string;
  automation: number;
  safety: number;
  digital: number;
  nuclear: number;
}

export function CompanyDashboard({
  user,
  professionsList,
  internshipsList: initialInternships,
  applicantsList: initialApplicants,
  demandsList,
}: CompanyDashboardProps) {
  const [internships, setInternships] = useState(initialInternships);
  const [applicants, setApplicants] = useState(initialApplicants);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleAddInternship(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMsg(null);

    const formData = new FormData();
    formData.set('title', title);
    formData.set('location', location);
    const result = await addInternship(formData);

    if (result.success) {
      setInternships((current) => [{ title, company: user.name, location, match_pct: 0 }, ...current]);
      setTitle('');
      setLocation('');
      setStatusMsg({ type: 'success', text: 'Стажировка опубликована.' });
      return;
    }
    setStatusMsg({ type: 'error', text: result.error });
  }

  async function handleApplicantAction(applicationId: number, action: 'Одобрить' | 'Отклонить') {
    const result = await handleApplicationAction(applicationId, action);
    if (result.success) {
      setApplicants((current) => current.map((applicant) => applicant.applicationId === applicationId
        ? { ...applicant, applicationStatus: action === 'Одобрить' ? 'Одобрено' : 'Отклонено' }
        : applicant));
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0B2A4A] flex items-center gap-2.5">
            <Building className="h-8 w-8 text-[#00A3E0]" />
            Кабинет работодателя — {user.name}
          </h1>
          <p className="text-[#1F2933]/60 mt-1">
            Публикуйте свои стажировки и обрабатывайте отклики кандидатов.
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
        <div className={`p-4 rounded-xl text-sm border ${statusMsg.type === 'success'
          ? 'bg-[#3FAE5A]/10 border-[#3FAE5A]/20 text-[#28793A]'
          : 'bg-[#D64545]/10 border-[#D64545]/20 text-[#D64545]'}`}
        >
          {statusMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Briefcase className="h-6 w-6 text-[#00A3E0]" />} value={professionsList.length} label="Профессий в общем каталоге" color="bg-[#00A3E0]/10" />
        <StatCard icon={<Building className="h-6 w-6 text-[#3FAE5A]" />} value={internships.length} label="Ваших стажировок" color="bg-[#3FAE5A]/10" />
        <StatCard
          icon={<Users className="h-6 w-6 text-[#F5A623]" />}
          value={applicants.filter((applicant) => applicant.applicationStatus === 'Заявка подана').length}
          label="Новых откликов"
          color="bg-[#F5A623]/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8 lg:col-span-1">
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
                  <label htmlFor="internship-title" className="block text-xs font-medium text-[#1F2933] mb-1">Название стажировки</label>
                  <input
                    id="internship-title"
                    type="text"
                    required
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="например, Младший техник ПЛК"
                    className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#00A3E0] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="company-name" className="block text-xs font-medium text-[#1F2933] mb-1">Работодатель</label>
                  <input
                    id="company-name"
                    type="text"
                    value={user.name}
                    readOnly
                    className="w-full rounded-lg border border-[#0B2A4A]/15 bg-[#F4F7FA] px-3 py-2 text-sm text-[#1F2933]/60 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="internship-location" className="block text-xs font-medium text-[#1F2933] mb-1">Город / регион</label>
                  <input
                    id="internship-location"
                    type="text"
                    required
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="например, Ташкент"
                    className="w-full rounded-lg border border-[#0B2A4A]/15 bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#00A3E0] focus:outline-none"
                  />
                </div>
                <Button type="submit" size="sm" className="w-full text-xs h-9 mt-2">Опубликовать</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Ваши стажировки</CardTitle>
            </CardHeader>
            <CardContent>
              {internships.length ? (
                <div className="divide-y divide-[#0B2A4A]/5">
                  {internships.map((internship, index) => (
                    <div key={internship.id ?? `${internship.title}-${index}`} className="py-3 first:pt-0 last:pb-0">
                      <p className="text-sm font-semibold text-[#0B2A4A]">{internship.title}</p>
                      <p className="text-xs text-[#1F2933]/60 mt-1">{internship.location}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#1F2933]/40 text-center py-3">Стажировок пока нет.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8 lg:col-span-2">
          <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
            <CardHeader>
              <CardTitle>Отклики на ваши стажировки</CardTitle>
              <p className="text-sm text-[#1F2933]/60">Здесь видны только кандидаты вашего работодателя.</p>
            </CardHeader>
            <CardContent>
              {applicants.length ? (
                <div className="divide-y divide-[#0B2A4A]/5">
                  {applicants.map((applicant) => (
                    <div key={applicant.applicationId} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-[#0B2A4A]">{applicant.residentName}</h4>
                          <span className="text-xs text-[#1F2933]/60">({applicant.residentEmail})</span>
                        </div>
                        <p className="text-xs text-[#1F2933]/70 mt-1">
                          Отклик на: <strong className="text-[#00A3E0]">{applicant.internshipTitle}</strong>
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {applicant.residentSkills.split(',').map((skill) => skill.trim()).filter(Boolean).map((skill) => (
                            <Badge key={skill} variant="default" className="text-[10px] py-0 px-2">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {applicant.applicationStatus === 'Заявка подана' ? (
                          <>
                            <button
                              onClick={() => handleApplicantAction(applicant.applicationId, 'Одобрить')}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3FAE5A]/10 text-[#28793A] hover:bg-[#3FAE5A]/20 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                            >
                              <Check className="h-3.5 w-3.5" /> Одобрить
                            </button>
                            <button
                              onClick={() => handleApplicantAction(applicant.applicationId, 'Отклонить')}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D64545]/10 text-[#D64545] hover:bg-[#D64545]/20 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                            >
                              <X className="h-3.5 w-3.5" /> Отклонить
                            </button>
                          </>
                        ) : (
                          <Badge variant={applicant.applicationStatus === 'Одобрено' ? 'success' : 'warning'}>{applicant.applicationStatus}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#1F2933]/40 py-4 text-center">Нет входящих откликов.</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#00A3E0]" />
                Общий прогноз спроса на кадры
              </CardTitle>
              <p className="text-sm text-[#1F2933]/60">Справочные данные, доступные только для просмотра.</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={demandsList}>
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

          <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
            <CardHeader>
              <CardTitle>Общий каталог востребованных профессий</CardTitle>
              <p className="text-sm text-[#1F2933]/60">Каталог доступен работодателю только для просмотра.</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {professionsList.map((profession) => (
                  <div key={profession.id ?? profession.title} className="border border-[#0B2A4A]/10 rounded-xl p-4 space-y-2">
                    <h4 className="font-semibold text-[#0B2A4A]">{profession.title}</h4>
                    <p className="text-xs text-[#1F2933]/60">
                      Срок подготовки: <strong>{profession.transition_time}</strong> | Зарплата: <strong className="text-[#28793A]">{profession.salary_growth}</strong>
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {profession.requirements.split(',').map((requirement) => requirement.trim()).filter(Boolean).map((requirement) => (
                        <Badge key={requirement} variant="default" className="text-[10px] py-0 px-2">{requirement}</Badge>
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

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: number; label: string; color: string }) {
  return (
    <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
      <CardContent className="pt-6 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-[#0B2A4A]">{value}</p>
          <p className="text-xs text-[#1F2933]/60">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
