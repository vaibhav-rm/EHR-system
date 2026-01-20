"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DoctorSidebar from "@/components/DoctorSidebar";
import { Doctor, Appointment, Patient } from "@/lib/types";
import { Calendar, Users, FileText, Clock, TrendingUp, Activity } from "lucide-react";
import { getDoctorDashboardData } from "@/app/actions/clinical";

export default function DoctorDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<(Appointment & { patient: Patient })[]>([]);
  const [stats, setStats] = useState({
    todayCount: 0,
    totalPatients: 0,
    totalReports: 0,
    completedToday: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    // Check if user is actually a doctor
    if (session?.user && (session.user as any).role !== 'doctor') {
      // Optional: redirect to patient dashboard if strict
      // router.push("/dashboard"); 
    }

    const userId = session?.user?.id;
    if (userId) {
      // Set doctor basic info from session
      const user = session.user as any;
      setDoctor({
        id: user.id,
        name: user.name || "Doctor",
        hospital: "Medanta Hospital",
        specialization: "General Physician",
        email: user.email || "",
        role: "doctor"
      } as any);

      const fetchDashboardData = async (doctorId: string) => {
        try {
          const data = await getDoctorDashboardData(doctorId);

          setTodayAppointments(data.appointments as any);
          setStats(data.stats);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDashboardData(userId);
    } else {
      // Fallback if no user ID found but authenticated (shouldn't happen, but prevent infinite load)
      setIsLoading(false);
    }
  }, [session, status, router]);

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "N/A";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d9488]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <DoctorSidebar doctorName={doctor?.name} specialization={doctor?.specialization} />

      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#09090b]">Welcome back, {doctor?.name}</h1>
            <p className="text-[#71717a] mt-1">{doctor?.hospital} • {doctor?.specialization}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-[#e4e4e7] p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0d9488]/10 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-[#0d9488]" />
                </div>
                <div>
                  <p className="text-sm text-[#71717a]">Today&apos;s Appointments</p>
                  <p className="text-2xl font-bold text-[#09090b]">{stats.todayCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e4e4e7] p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-[#71717a]">Total Patients</p>
                  <p className="text-2xl font-bold text-[#09090b]">{stats.totalPatients}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e4e4e7] p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-[#71717a]">Reports Added</p>
                  <p className="text-2xl font-bold text-[#09090b]">{stats.totalReports}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e4e4e7] p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <Activity className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-[#71717a]">Completed Today</p>
                  <p className="text-2xl font-bold text-[#09090b]">{stats.completedToday}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-[#e4e4e7] p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[#09090b]">Today&apos;s Schedule</h2>
                <button
                  onClick={() => router.push("/doctor/appointments")}
                  className="text-sm text-[#0d9488] hover:underline"
                >
                  View All
                </button>
              </div>

              {todayAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-[#d4d4d8] mx-auto mb-4" />
                  <p className="text-[#71717a]">No appointments scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.slice(0, 5).map((apt: any) => (
                    <div
                      key={apt.id}
                      className="flex items-center gap-4 p-4 bg-[#fafafa] rounded-xl hover:bg-[#f4f4f5] transition-colors cursor-pointer"
                      onClick={() => router.push(`/doctor/attend/${apt.id}`)}
                    >
                      <div className="w-12 h-12 bg-[#0d9488]/10 rounded-full flex items-center justify-center">
                        <span className="text-[#0d9488] font-semibold text-sm">
                          {apt.patient?.name?.split(" ").map((n: string) => n[0]).join("") || "P"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#09090b] truncate">{apt.patient?.name}</p>
                        <p className="text-sm text-[#71717a] truncate">{apt.description || "Routine Checkup"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#09090b]">{formatTime(apt.start)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${apt.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : apt.status === "in_progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}>
                          {apt.status === "booked" ? "Confirmed" : apt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-[#e4e4e7] p-6">
              <h2 className="text-lg font-semibold text-[#09090b] mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => router.push("/doctor/add-report")}
                  className="flex flex-col items-center gap-3 p-6 bg-[#fafafa] rounded-xl hover:bg-[#f4f4f5] transition-colors border border-transparent hover:border-[#0d9488]/20"
                >
                  <div className="w-12 h-12 bg-[#0d9488]/10 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-[#0d9488]" />
                  </div>
                  <span className="text-sm font-medium text-[#09090b]">Add Report</span>
                </button>

                <button
                  onClick={() => router.push("/doctor/appointments")}
                  className="flex flex-col items-center gap-3 p-6 bg-[#fafafa] rounded-xl hover:bg-[#f4f4f5] transition-colors border border-transparent hover:border-[#0d9488]/20"
                >
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-[#09090b]">View Appointments</span>
                </button>

                <button
                  onClick={() => router.push("/doctor/patients")}
                  className="flex flex-col items-center gap-3 p-6 bg-[#fafafa] rounded-xl hover:bg-[#f4f4f5] transition-colors border border-transparent hover:border-[#0d9488]/20"
                >
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-500" />
                  </div>
                  <span className="text-sm font-medium text-[#09090b]">My Patients</span>
                </button>

                <button
                  onClick={() => {
                    if (todayAppointments.length > 0) {
                      const nextApt = todayAppointments.find(a => a.status === "booked" || a.status === "scheduled");
                      if (nextApt) router.push(`/doctor/attend/${nextApt.id}`);
                    }
                  }}
                  className="flex flex-col items-center gap-3 p-6 bg-[#fafafa] rounded-xl hover:bg-[#f4f4f5] transition-colors border border-transparent hover:border-[#0d9488]/20"
                >
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-green-500" />
                  </div>
                  <span className="text-sm font-medium text-[#09090b]">Next Patient</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
