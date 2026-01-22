"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getDoctorAppointments } from "@/app/actions/clinical";
import { Search, Calendar, Clock, ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import DoctorSidebar from "@/components/DoctorSidebar";

interface Appointment {
  id: string;
  patient?: {
    name: string;
    patient_id: string;
    blood_type?: string;
  };
  reason: string;
  scheduled_time: string;
  duration_minutes: number;
  status: string;
  // ... other fields
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  email: string;
  role: "doctor";
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
        router.push("/");
        return;
    }
    
    const user = session?.user as any;
    if (user && user.role === 'doctor') {
        const doctorData = {
            id: user.id,
            name: user.name || "Doctor",
            hospital: "Medanta Hospital",
            specialization: "General Physician",
            email: user.email || "",
            role: "doctor" as const
        };
        setDoctor(doctorData);
        fetchAppointments(doctorData.id, selectedDate);
    }
  }, [session, status, router, selectedDate]);

  const fetchAppointments = async (doctorId: string, date: string) => {
    setIsLoading(true);
    try {
      // Use the server action to get appointments from FHIR store
      const allAppointments = await getDoctorAppointments(doctorId);
      
      // Filter by selected date
      const daysAppointments = allAppointments.filter((apt: any) => 
        apt.scheduled_date === date
      );

      setAppointments(daysAppointments || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${minutes} ${ampm}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const navigateDate = (direction: "prev" | "next") => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + (direction === "next" ? 1 : -1));
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    const matchesSearch = !searchQuery || 
      apt.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700";
      case "in_progress": return "bg-blue-100 text-blue-700";
      case "cancelled": return "bg-red-100 text-red-700";
      case "missed": return "bg-red-50 text-red-600 border border-red-200";
      case "no_show": return "bg-gray-100 text-gray-700";
      default: return "bg-amber-100 text-amber-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <DoctorSidebar doctorName={doctor?.name} specialization={doctor?.specialization} />
      
      <main className="ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#09090b]">Appointments</h1>
            <p className="text-[#71717a] mt-1">Manage your scheduled patient visits</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e4e4e7] p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigateDate("prev")}
                  className="p-2 hover:bg-[#f4f4f5] rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-[#71717a]" />
                </button>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-[#0d9488]" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-lg font-semibold text-[#09090b] bg-transparent border-none focus:outline-none cursor-pointer"
                  />
                </div>
                <button
                  onClick={() => navigateDate("next")}
                  className="p-2 hover:bg-[#f4f4f5] rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-[#71717a]" />
                </button>
                <button
                  onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                  className="px-3 py-1 text-sm text-[#0d9488] hover:bg-[#0d9488]/10 rounded-lg transition-colors"
                >
                  Today
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-[#e4e4e7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent w-48"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-[#e4e4e7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fafafa]">
              <p className="text-sm font-medium text-[#71717a]">
                {formatDate(selectedDate)} • {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? "s" : ""}
              </p>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0d9488] mx-auto"></div>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="h-12 w-12 text-[#d4d4d8] mx-auto mb-4" />
                <p className="text-[#71717a]">No appointments found for this date</p>
              </div>
            ) : (
              <div className="divide-y divide-[#e4e4e7]">
                {filteredAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-6 hover:bg-[#fafafa] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#0d9488]/10 rounded-full flex items-center justify-center">
                          <span className="text-[#0d9488] font-semibold">
                            {apt.patient?.name?.split(" ").map(n => n[0]).join("") || "P"}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-[#09090b]">{apt.patient?.name}</h3>
                            <span className="text-xs text-[#a1a1aa]">{apt.patient?.patient_id}</span>
                          </div>
                          <p className="text-sm text-[#71717a]">{apt.reason || "General consultation"}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-[#a1a1aa]">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(apt.scheduled_time)} • {apt.duration_minutes} min
                            </span>
                            {apt.patient?.blood_type && (
                              <span>Blood: {apt.patient.blood_type}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                          {apt.status === "scheduled" ? "Upcoming" : apt.status.replace("_", " ")}
                        </span>
                        <button
                          onClick={() => router.push(`/doctor/attend/${apt.id}`)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <PlayCircle className="h-4 w-4" />
                          Attend Patient
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
