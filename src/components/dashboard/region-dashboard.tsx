'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { logout } from '@/app/actions';
import { 
  Users, 
  Map, 
  MapPin, 
  TrendingUp, 
  Award, 
  CheckCircle, 
  LogOut, 
  BarChart2, 
  ShieldCheck 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface RegionDashboardProps {
  user: any;
  regionStats: any[];
  professionsList: any[];
  internshipsList: any[];
}

export function RegionDashboard({
  user,
  regionStats,
  professionsList,
  internshipsList
}: RegionDashboardProps) {

  // Aggregate totals
  const totalTrained = regionStats.reduce((acc, curr) => acc + curr.trained, 0);
  const totalEmployed = regionStats.reduce((acc, curr) => acc + curr.employed, 0);
  const totalDistricts = regionStats.length;
  
  // Employment rate
  const employmentRate = totalTrained > 0 ? Math.round((totalEmployed / totalTrained) * 100) : 0;

  // Chart data for districts
  const districtChartData = regionStats.map(d => ({
    name: d.district.split(' ')[0], // just the first word
    'Обучено': d.trained,
    'Трудоустроено': d.employed
  }));

  // Pie chart data for skill gaps
  const skillGapSummaryData = [
    { name: 'Программирование ПЛК', value: 45 },
    { name: 'Промышленная автоматизация', value: 30 },
    { name: 'Цифровая диагностика', value: 15 },
    { name: 'Технический английский', value: 10 },
  ];

  const COLORS = ['#0B2A4A', '#00A3E0', '#2F5D7C', '#3FAE5A'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0B2A4A] flex items-center gap-2.5">
            <Map className="h-8 w-8 text-[#00A3E0]" />
            Кабинет региона — {user.name}
          </h1>
          <p className="text-[#1F2933]/60 mt-1">
            Аналитика по районам, мониторинг дефицита навыков и статистика занятости населения.
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

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-[#0B2A4A]/10 rounded-xl">
              <MapPin className="h-6 w-6 text-[#0B2A4A]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0B2A4A]">{totalDistricts}</p>
              <p className="text-xs text-[#1F2933]/60">Районов в ведении</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-[#00A3E0]/10 rounded-xl">
              <Award className="h-6 w-6 text-[#00A3E0]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0B2A4A]">{totalTrained}</p>
              <p className="text-xs text-[#1F2933]/60">Обучено жителей</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-[#3FAE5A]/10 rounded-xl">
              <CheckCircle className="h-6 w-6 text-[#3FAE5A]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0B2A4A]">{totalEmployed}</p>
              <p className="text-xs text-[#1F2933]/60">Трудоустроено жителей</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-[#F5A623]/10 rounded-xl">
              <TrendingUp className="h-6 w-6 text-[#F5A623]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0B2A4A]">{employmentRate}%</p>
              <p className="text-xs text-[#1F2933]/60">Эффективность трудоустройства</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Table statistics by districts */}
          <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
            <CardHeader>
              <CardTitle>Статистика занятости и дефицита навыков по районам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#0B2A4A]/10 text-[#0B2A4A] font-semibold">
                      <th className="py-3 px-4">Район</th>
                      <th className="py-3 px-4">Число обученных</th>
                      <th className="py-3 px-4">Трудоустроено</th>
                      <th className="py-3 px-4">Дефицит навыков</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0B2A4A]/5">
                    {regionStats.map((stat) => (
                      <tr key={stat.id} className="hover:bg-[#F4F7FA]/50 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-[#0B2A4A]">{stat.district}</td>
                        <td className="py-3.5 px-4">{stat.trained}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-[#3FAE5A]">{stat.employed}</span>
                          <span className="text-xs text-[#1F2933]/40 ml-1">
                            ({Math.round((stat.employed / stat.trained) * 100)}%)
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#1F2933]/70">{stat.skill_gap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* District Comparison Chart */}
          <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
            <CardHeader>
              <CardTitle>Сравнение районов по обучению и трудоустройству</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={districtChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0B2A4A10" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Обучено" fill="#00A3E0" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Трудоустроено" fill="#3FAE5A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column */}
        <div className="space-y-8 lg:col-span-1">
          {/* Skill gaps distribution */}
          <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
            <CardHeader>
              <CardTitle>Структура дефицита навыков в регионе</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={skillGapSummaryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {skillGapSummaryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="w-full space-y-2 mt-4">
                {skillGapSummaryData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-[#1F2933]/70">{item.name}</span>
                    </div>
                    <span className="font-semibold text-[#0B2A4A]">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Region Action Cards / Summary */}
          <Card className="rounded-xl border border-[#0B2A4A]/8 shadow-sm">
            <CardHeader>
              <CardTitle>Реестр востребованности</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border border-[#0B2A4A]/10 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-[#0B2A4A] text-sm">Профессий на мониторинге</h4>
                  <p className="text-xs text-[#1F2933]/60 mt-0.5">Включены в дорожные карты жителей</p>
                </div>
                <Badge variant="accent" className="text-sm px-2.5 py-1">
                  {professionsList.length}
                </Badge>
              </div>

              <div className="border border-[#0B2A4A]/10 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-[#0B2A4A] text-sm">Активных стажировок</h4>
                  <p className="text-xs text-[#1F2933]/60 mt-0.5">Размещено ядерными объектами</p>
                </div>
                <Badge variant="success" className="text-sm px-2.5 py-1">
                  {internshipsList.length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
