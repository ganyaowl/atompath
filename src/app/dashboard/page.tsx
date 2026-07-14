import React from 'react';
import { redirect } from 'next/navigation';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { ResidentDashboard } from '@/components/dashboard/resident-dashboard';
import { CompanyDashboard } from '@/components/dashboard/company-dashboard';
import { RegionDashboard } from '@/components/dashboard/region-dashboard';
import { getResidentDashboard } from '@/lib/resident-data';
import { 
  getCurrentUser, 
  getInternshipsList, 
  getProfessions,
  getCompanyApplicants,
  getDemands,
  getRegionStats
} from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const professionsList = user.role === 'resident' ? [] : await getProfessions();
  const internshipsList = user.role === 'resident' ? [] : await getInternshipsList();

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FA]">
      <Header variant="dashboard" />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {user.role === 'resident' && (
            <ResidentDashboard data={await getResidentDashboard(user)} />
          )}

          {user.role === 'company' && (
            <CompanyDashboard 
              user={user} 
              professionsList={professionsList}
              internshipsList={internshipsList}
              applicantsList={await getCompanyApplicants()}
              demandsList={await getDemands()}
            />
          )}

          {user.role === 'region' && (
            <RegionDashboard 
              user={user} 
              regionStats={await getRegionStats()}
              professionsList={professionsList}
              internshipsList={internshipsList}
            />
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
