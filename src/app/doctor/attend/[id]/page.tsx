"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import DoctorSidebar from "@/components/DoctorSidebar";
import { ArrowLeft, User, Calendar, Droplet, Phone, AlertTriangle, FileText, Pill, Clock, Plus, CheckCircle, X, Loader2, Eye } from "lucide-react";
import { useSession } from "next-auth/react";
import { getAppointmentContextData, updateAppointmentSummary, createPrescription } from "@/app/actions/clinical";

export default function AttendPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [doctor, setDoctor] = useState<any | null>(null);
  const [appointment, setAppointment] = useState<any | null>(null);
  const [patient, setPatient] = useState<any | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [pastAppointments, setPastAppointments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"reports" | "medicines" | "history">("reports");
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState("");
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [showSummaryView, setShowSummaryView] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [newMedicine, setNewMedicine] = useState({
    medicine_name: "",
    dosage: "",
    dosage_unit: "mg",
    frequency: "Once daily",
    instructions: "",
  });

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (session?.user) {
      setDoctor(session.user);
      fetchData(resolvedParams.id, session.user.id);
    }
  }, [router, resolvedParams.id, session, status]);

  const fetchData = async (appointmentId: string, doctorId: string) => {
    setIsLoading(true);
    try {
      const data = await getAppointmentContextData(appointmentId, doctorId);
      if (data) {
        setAppointment(data.appointment);
        setPatient(data.patient);
        setReports(data.reports || []);
        setMedicines(data.medicines || []);
        setPastAppointments(data.pastAppointments || []);
        setSummary((data.appointment as any).note?.[0]?.text || "");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
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

  const handleAddMedicine = async () => {
    if (!appointment || !doctor || !newMedicine.medicine_name || !newMedicine.dosage) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("patientId", patient.id);
      formData.append("doctorId", doctor.id);
      formData.append("medicationName", newMedicine.medicine_name);
      formData.append("dosage", newMedicine.dosage + " " + newMedicine.dosage_unit);
      formData.append("instructions", newMedicine.frequency + ". " + newMedicine.instructions);

      const result = await createPrescription(null, formData);

      if (result.success) {
        // Re-fetch medicines
        fetchData(resolvedParams.id, doctor.id);
        setShowAddMedicine(false);
        setNewMedicine({
          medicine_name: "",
          dosage: "",
          dosage_unit: "mg",
          frequency: "Once daily",
          instructions: "",
        });
      }
    } catch (error) {
      console.error("Error adding medicine:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const saveSummaryAndEnd = async () => {
    if (!appointment || !doctor) return;

    setIsSaving(true);
    try {
      await updateAppointmentSummary(resolvedParams.id, summary);
      router.push("/doctor");
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d9488]"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <p className="text-[#71717a]">Appointment not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <DoctorSidebar doctorName={doctor?.name} specialization={doctor?.specialization} />

      <main className="ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#71717a] hover:text-[#09090b] mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Appointments
          </button>

          <div className="bg-white rounded-2xl border border-[#e4e4e7] p-6 mb-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-[#0d9488]/10 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-[#0d9488]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-[#09090b]">
                    {patient?.name?.[0]?.text || (patient?.name?.[0]?.given?.[0] + " " + patient?.name?.[0]?.family) || "Unknown Patient"}
                  </h1>
                  <span className="px-3 py-1 bg-[#0d9488]/10 text-[#0d9488] text-sm font-medium rounded-full">
                    {patient?.id?.substring(0, 8)}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-[#71717a]">
                    <Calendar className="h-4 w-4" />
                    <span>{patient?.birthDate ? `${calculateAge(patient.birthDate)} years` : "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#71717a]">
                    <User className="h-4 w-4" />
                    <span>{patient?.gender || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#71717a]">
                    <Droplet className="h-4 w-4" />
                    <span>{patient?.extension?.find((e: any) => e.url === 'http://example.org/fhir/blood-type')?.valueString || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#71717a]">
                    <Phone className="h-4 w-4" />
                    <span>{patient?.telecom?.[0]?.value || "N/A"}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#71717a]">Visit Reason</p>
                <p className="font-medium text-[#09090b]">{appointment.description || "General Consultation"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">
                <div className="flex border-b border-[#e4e4e7]">
                  {[
                    { id: "reports", label: "Reports", icon: FileText, count: reports.length },
                    { id: "medicines", label: "Medicines", icon: Pill, count: medicines.length },
                    { id: "history", label: "Past Appointments", icon: Clock, count: pastAppointments.length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${activeTab === tab.id
                        ? "text-[#0d9488] border-b-2 border-[#0d9488]"
                        : "text-[#71717a] hover:text-[#09090b]"
                        }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                      <span className="px-2 py-0.5 bg-[#f4f4f5] rounded-full text-xs">{tab.count}</span>
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {activeTab === "reports" && (
                    <div className="space-y-4">
                      {reports.length === 0 ? (
                        <p className="text-center text-[#71717a] py-8">No reports found</p>
                      ) : (
                        reports.map((report) => (
                          <div key={report.id} className="p-4 bg-[#fafafa] rounded-xl border border-[#e4e4e7]">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-[#09090b]">{report.report_type}</span>
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                    {report.status}
                                  </span>
                                </div>
                                <p className="text-sm text-[#71717a]">{report.lab_name || "MedSense Lab"}</p>
                                <p className="text-xs text-[#a1a1aa] mt-1">{formatDate(report.report_date)}</p>
                              </div>
                              <button className="p-2 hover:bg-[#e4e4e7] rounded-lg transition-colors">
                                <Eye className="h-4 w-4 text-[#71717a]" />
                              </button>
                            </div>
                            {report.summary && (
                              <p className="mt-3 text-sm text-[#52525b] border-t border-[#e4e4e7] pt-3">
                                {report.summary}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === "medicines" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-[#71717a]">Current Medications</p>
                        <button
                          onClick={() => setShowAddMedicine(true)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Add Medicine
                        </button>
                      </div>
                      <div className="space-y-3">
                        {medicines.length === 0 ? (
                          <p className="text-center text-[#71717a] py-8">No active medications</p>
                        ) : (
                          medicines.map((med) => (
                            <div key={med.id} className="p-4 bg-[#fafafa] rounded-xl border border-[#e4e4e7]">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-[#09090b]">{med.medicine_name}</span>
                                <span className="text-sm text-[#0d9488]">{med.dosage}</span>
                              </div>
                              <div className="flex flex-wrap gap-2 text-xs">
                                <span className="px-2 py-1 bg-[#e4e4e7] rounded">{med.frequency}</span>
                              </div>
                              {med.instructions && (
                                <p className="mt-2 text-xs text-[#71717a]">{med.instructions}</p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "history" && (
                    <div className="space-y-4">
                      {pastAppointments.length === 0 ? (
                        <p className="text-center text-[#71717a] py-8">No past appointments with this patient</p>
                      ) : (
                        pastAppointments.map((apt) => (
                          <div key={apt.id} className="p-4 bg-[#fafafa] rounded-xl border border-[#e4e4e7]">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-[#09090b]">{formatDate(apt.scheduled_date)}</span>
                              {apt.summary && (
                                <button
                                  onClick={() => setShowSummaryView(apt.summary || null)}
                                  className="text-sm text-[#0d9488] hover:underline"
                                >
                                  View Summary
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-[#71717a]">{apt.reason || "General Consultation"}</p>
                            {apt.summary && (
                              <p className="mt-2 text-sm text-[#52525b] line-clamp-2">{apt.summary}</p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#e4e4e7] p-6">
                <h3 className="font-semibold text-[#09090b] mb-4">Write Summary</h3>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Enter consultation summary, findings, and recommendations..."
                  className="w-full h-48 px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent resize-none"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={saveSummaryAndEnd}
                  disabled={isSaving}
                  className="w-full py-3 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle className="h-5 w-5" />
                  )}
                  End Session & Save
                </button>
                <button
                  onClick={() => router.back()}
                  className="w-full py-3 border border-[#e4e4e7] hover:bg-[#f4f4f5] text-[#71717a] rounded-xl font-medium transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showAddMedicine && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-[#e4e4e7] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#09090b]">Add Medicine</h3>
              <button onClick={() => setShowAddMedicine(false)} className="text-[#71717a] hover:text-[#09090b]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Medicine Name</label>
                <input
                  type="text"
                  value={newMedicine.medicine_name}
                  onChange={(e) => setNewMedicine({ ...newMedicine, medicine_name: e.target.value })}
                  placeholder="e.g., Amoxicillin"
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#09090b] mb-1.5">Dosage</label>
                  <input
                    type="text"
                    value={newMedicine.dosage}
                    onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
                    placeholder="e.g., 500"
                    className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#09090b] mb-1.5">Unit</label>
                  <select
                    value={newMedicine.dosage_unit}
                    onChange={(e) => setNewMedicine({ ...newMedicine, dosage_unit: e.target.value })}
                    className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                  >
                    <option value="mg">mg</option>
                    <option value="mcg">mcg</option>
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="IU">IU</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Frequency</label>
                <select
                  value={newMedicine.frequency}
                  onChange={(e) => setNewMedicine({ ...newMedicine, frequency: e.target.value })}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                >
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Three times daily">Three times daily</option>
                  <option value="Four times daily">Four times daily</option>
                  <option value="As needed">As needed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Instructions</label>
                <textarea
                  value={newMedicine.instructions}
                  onChange={(e) => setNewMedicine({ ...newMedicine, instructions: e.target.value })}
                  placeholder="Special instructions..."
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] resize-none h-20"
                />
              </div>
            </div>
            <div className="p-6 border-t border-[#e4e4e7] flex gap-3">
              <button
                onClick={() => setShowAddMedicine(false)}
                className="flex-1 py-3 border border-[#e4e4e7] hover:bg-[#f4f4f5] text-[#71717a] rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMedicine}
                disabled={isSaving || !newMedicine.medicine_name || !newMedicine.dosage}
                className="flex-1 py-3 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Medicine
              </button>
            </div>
          </div>
        </div>
      )}

      {showSummaryView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-[#e4e4e7] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#09090b]">Appointment Summary</h3>
              <button onClick={() => setShowSummaryView(null)} className="text-[#71717a] hover:text-[#09090b]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-[#52525b] whitespace-pre-wrap">{showSummaryView}</p>
            </div>
            <div className="p-6 border-t border-[#e4e4e7]">
              <button
                onClick={() => setShowSummaryView(null)}
                className="w-full py-3 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
