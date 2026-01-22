"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import DashboardHeader from "@/components/sections/DashboardHeader";
import StatsOverview from "@/components/sections/StatsOverview";
import AlertBanner from "@/components/sections/AlertBanner";
import AppointmentsAndMeds from "@/components/sections/AppointmentsAndMeds";
import useSWR from 'swr';
import { fetcher } from '@/lib/utils';

import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();

  const { data: patientData } = useSWR(
      session?.user?.id ? `/api/fhir/Patient?id=${session.user.id}` : null,
      fetcher
  );

  const realName = patientData?.entry?.[0]?.resource?.name?.[0] 
     ? `${patientData.entry[0].resource.name[0].given?.join(' ') || ''} ${patientData.entry[0].resource.name[0].family || ''}`.trim()
     : null;

  const userName = realName || session?.user?.name || "User";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <main className="p-6 space-y-6">
          <DashboardHeader userName={userName} />
          <StatsOverview />
          <AlertBanner />
          <AppointmentsAndMeds />
        </main>
      </div>
    </div>
  );
}
