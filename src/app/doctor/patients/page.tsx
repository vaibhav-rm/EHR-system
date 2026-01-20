"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, User, Calendar, Droplet, Phone, Clock, FileText, ChevronRight } from "lucide-react";
import DoctorSidebar from "@/components/DoctorSidebar";
import { getDoctorPatients, getPatientDetailStats } from "@/app/actions/clinical";

interface PatientRelation {
  id: string;
  patient_id: string;
  doctor_id: string;
  last_visit_date: string;
  total_visits: number;
  first_visit_date?: string;
  patient?: any;
}

interface Doctor {
  id: string;
  name: string;
  hospital: string;
  specialization: string;
  email: string;
  role: "doctor";
}

export default function PatientsPage() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patients, setPatients] = useState<PatientRelation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientRelation | null>(null);
  const [patientReports, setPatientReports] = useState(0);
  const [patientAppointments, setPatientAppointments] = useState(0);
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
      fetchPatients(doctorData.id);
    }
  }, [session, status, router]);

  const fetchPatients = async (doctorId: string) => {
    setIsLoading(true);
    try {
      const data = await getDoctorPatients(doctorId);
      setPatients(data as any[]);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatientDetails = async (patientId: string) => {
    try {
      const { reportsCount, appointmentsCount } = await getPatientDetailStats(patientId, doctor?.id || '');
      setPatientReports(reportsCount || 0);
      setPatientAppointments(appointmentsCount || 0);
    } catch (error) {
      console.error("Error fetching patient details:", error);
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const formatDate = (date: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredPatients = patients.filter((rel) =>
    rel.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rel.patient_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectPatient = (rel: PatientRelation) => {
    setSelectedPatient(rel);
    fetchPatientDetails(rel.patient_id);
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <DoctorSidebar doctorName={doctor?.name} specialization={doctor?.specialization} />

      <main className="ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#09090b]">My Patients</h1>
            <p className="text-[#71717a] mt-1">All patients you have attended</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">
                <div className="p-4 border-b border-[#e4e4e7]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
                    <input
                      type="text"
                      placeholder="Search patients by name or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent"
                    />
                  </div>
                </div>

                {isLoading ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0d9488] mx-auto"></div>
                  </div>
                ) : filteredPatients.length === 0 ? (
                  <div className="p-12 text-center">
                    <User className="h-12 w-12 text-[#d4d4d8] mx-auto mb-4" />
                    <p className="text-[#71717a]">No patients found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#e4e4e7]">
                    {filteredPatients.map((rel) => (
                      <div
                        key={rel.id}
                        onClick={() => handleSelectPatient(rel)}
                        className={`p-4 hover:bg-[#fafafa] transition-colors cursor-pointer ${selectedPatient?.id === rel.id ? "bg-[#0d9488]/5 border-l-4 border-[#0d9488]" : ""
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#0d9488]/10 rounded-full flex items-center justify-center">
                            <span className="text-[#0d9488] font-semibold">
                              {rel.patient?.name?.split(" ").map((n: string) => n[0]).join("") || "P"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-[#09090b] truncate">{rel.patient?.name}</h3>
                              <span className="text-xs text-[#a1a1aa]">{rel.patient?.patient_id}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-[#71717a]">
                              <span>{rel.patient?.date_of_birth ? `${calculateAge(rel.patient.date_of_birth)} yrs` : "N/A"}</span>
                              <span>{rel.patient?.gender || "N/A"}</span>
                              <span>{rel.patient?.blood_type || "N/A"}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-[#71717a]">{rel.total_visits} visit{rel.total_visits !== 1 ? "s" : ""}</p>
                            <p className="text-xs text-[#a1a1aa]">Last: {rel.last_visit_date ? formatDate(rel.last_visit_date) : "N/A"}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-[#d4d4d8]" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              {selectedPatient ? (
                <div className="bg-white rounded-2xl border border-[#e4e4e7] p-6 sticky top-8">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-[#0d9488]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="h-10 w-10 text-[#0d9488]" />
                    </div>
                    <h2 className="text-xl font-semibold text-[#09090b]">{selectedPatient.patient?.name}</h2>
                    <p className="text-sm text-[#0d9488]">{selectedPatient.patient?.patient_id}</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-[#a1a1aa]" />
                      <span className="text-[#71717a]">Age:</span>
                      <span className="text-[#09090b] font-medium">
                        {selectedPatient.patient?.date_of_birth
                          ? `${calculateAge(selectedPatient.patient.date_of_birth)} years`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <User className="h-4 w-4 text-[#a1a1aa]" />
                      <span className="text-[#71717a]">Gender:</span>
                      <span className="text-[#09090b] font-medium">{selectedPatient.patient?.gender || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Droplet className="h-4 w-4 text-[#a1a1aa]" />
                      <span className="text-[#71717a]">Blood Type:</span>
                      <span className="text-[#09090b] font-medium">{selectedPatient.patient?.blood_type || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-[#a1a1aa]" />
                      <span className="text-[#71717a]">Phone:</span>
                      <span className="text-[#09090b] font-medium">{selectedPatient.patient?.phone || "N/A"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-[#fafafa] rounded-xl text-center">
                      <div className="flex items-center justify-center gap-2 text-[#0d9488] mb-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-2xl font-bold">{patientAppointments}</span>
                      </div>
                      <p className="text-xs text-[#71717a]">Appointments</p>
                    </div>
                    <div className="p-4 bg-[#fafafa] rounded-xl text-center">
                      <div className="flex items-center justify-center gap-2 text-[#0d9488] mb-1">
                        <FileText className="h-4 w-4" />
                        <span className="text-2xl font-bold">{patientReports}</span>
                      </div>
                      <p className="text-xs text-[#71717a]">Reports</p>
                    </div>
                  </div>

                  <div className="text-xs text-[#a1a1aa] pt-4 border-t border-[#e4e4e7]">
                    <p>First visit: {selectedPatient.first_visit_date ? formatDate(selectedPatient.first_visit_date) : "N/A"}</p>
                    <p>Last visit: {selectedPatient.last_visit_date ? formatDate(selectedPatient.last_visit_date) : "N/A"}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-[#e4e4e7] p-12 text-center">
                  <User className="h-12 w-12 text-[#d4d4d8] mx-auto mb-4" />
                  <p className="text-[#71717a]">Select a patient to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
