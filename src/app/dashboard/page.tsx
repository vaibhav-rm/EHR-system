"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import DashboardHeader from "@/components/sections/DashboardHeader";
import StatsOverview from "@/components/sections/StatsOverview";
import AlertBanner from "@/components/sections/AlertBanner";
import AppointmentsAndMeds from "@/components/sections/AppointmentsAndMeds";

import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "User";

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
