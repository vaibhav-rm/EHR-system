"use client";

import React, { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Calendar as CalendarIcon, Clock, MapPin, Video, Plus, MoreHorizontal, X, FileText, Pill, CalendarCheck, Search } from "lucide-react";
import { useAppointments, Appointment } from "@/lib/appointments-context";
import { Calendar } from "@/components/ui/calendar"; // Import shadcn Calendar
import { format, isSameDay, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export default function AppointmentsPage() {
  const { appointments, pastAppointments } = useAppointments();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());

  const allAppointments = [...appointments, ...pastAppointments];

  // Filter based on Search AND Selected Date
  const filterAppointments = (list: Appointment[]) => {
    return list.filter((apt) => {
      const matchesSearch = 
        searchQuery === "" ||
        apt.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.location.toLowerCase().includes(searchQuery.toLowerCase());

      const aptDate = parseISO(apt.date); // Assuming apt.date is YYYY-MM-DD string
      const matchesDate = date ? isSameDay(aptDate, date) : true;

      return matchesSearch && matchesDate;
    });
  };

  const filteredUpcoming = filterAppointments(appointments);
  const filteredPast = filterAppointments(pastAppointments);

  // Helper to highlight days with appointments in the calendar
  const modifiers = {
    booked: (d: Date) => allAppointments.some(apt => isSameDay(parseISO(apt.date), d)),
  };
  
  const modifiersStyles = {
    booked: { fontWeight: 'bold', textDecoration: 'underline', color: 'var(--primary)' }
  };

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar />
      <div className="flex-1 ml-64 transition-all duration-300">
        <Navbar />
        <main className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#09090b]">Appointments</h1>
              <p className="text-sm text-[#71717a] mt-1">
                {date ? `Schedule for ${format(date, "MMMM do, yyyy")}` : "Manage your appointments"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-[#e4e4e7] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] w-64"
                />
              </div>
              <Link
                href="/book-appointment"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl text-sm font-semibold transition-colors"
              >
                <Plus className="h-4 w-4" />
                Book Appointment
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming Section */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#09090b]">
                        {date ? " appointments" : "Upcoming Appointments"}
                    </h2>
                    {date && (
                        <button onClick={() => setDate(undefined)} className="text-xs text-[#0d9488] hover:underline">
                            Clear Date Filter
                        </button>
                    )}
                </div>
                
                {filteredUpcoming.length === 0 ? (
                  <div className="text-center py-12 text-[#71717a]">
                    <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CalendarIcon className="h-8 w-8 text-gray-300" />
                    </div>
                    <p className="font-medium">No upcoming appointments found</p>
                    <p className="text-xs mt-1 text-gray-400">
                        {date ? `for ${format(date, "MMM dd, yyyy")}` : "Try adjusting your search"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredUpcoming.map((apt) => (
                      <div
                        key={apt.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#fafafa] rounded-2xl border border-[#e4e4e7] hover:border-[#0d9488]/30 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:shadow-md transition-all">
                            {apt.doctor.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-[#09090b]">{apt.doctor}</h4>
                              <span className={cn(
                                "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                                ['confirmed', 'booked', 'arrived', 'checked-in'].includes(apt.status) 
                                  ? "bg-teal-50 text-teal-600" 
                                  : "bg-orange-50 text-orange-600"
                              )}>
                                {apt.status}
                              </span>
                            </div>
                            <p className="text-xs text-[#71717a]">{apt.specialty}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-[#a1a1aa]">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" /> {apt.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {apt.time}
                              </span>
                              <span className="flex items-center gap-1">
                                {apt.type === "Video" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                                {apt.type}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4 sm:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="px-3 py-1.5 border border-[#e4e4e7] rounded-lg text-xs font-medium text-[#52525b] hover:bg-[#f4f4f5] transition-colors">
                            Reschedule
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Past Section - Only show if no date selected or if date has past appointments */}
              {(!date || filteredPast.length > 0) && (
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
                    <h2 className="text-lg font-semibold text-[#09090b] mb-4">Past Appointments</h2>
                    {filteredPast.length === 0 ? (
                      <div className="text-center py-8 text-[#71717a]">
                        <p>{searchQuery ? "No past appointments match your search." : "No past appointments recorded."}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredPast.map((apt) => (
                          <div
                            key={apt.id}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#fafafa] rounded-2xl border border-[#e4e4e7] opacity-75 hover:opacity-100 transition-opacity"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-400 flex items-center justify-center text-white font-bold text-lg">
                                {apt.doctor.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-semibold text-[#09090b]">{apt.doctor}</h4>
                                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500">
                                    {apt.status}
                                  </span>
                                </div>
                                <p className="text-xs text-[#71717a]">{apt.specialty}</p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-[#a1a1aa]">
                                  <span className="flex items-center gap-1">
                                    <CalendarIcon className="h-3 w-3" /> {apt.date}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => setSelectedAppointment(apt)}
                              className="mt-4 sm:mt-0 px-4 py-2 text-sm font-medium text-[#0d9488] hover:underline"
                            >
                              View Summary
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Calendar Widget */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7] flex flex-col items-center">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md"
                    modifiers={modifiers}
                    modifiersStyles={modifiersStyles}
                />
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
                <h3 className="font-semibold text-[#09090b] mb-2">Quick Stats</h3>
                <p className="text-sm text-[#71717a] mb-4">You have {appointments.length} upcoming</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#71717a]">Total Activity</span>
                    <span className="text-lg font-bold text-[#09090b]">{allAppointments.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#71717a]">Completed</span>
                    <span className="text-lg font-bold text-[#0d9488]">{pastAppointments.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#71717a]">Upcoming</span>
                    <span className="text-lg font-bold text-orange-500">{appointments.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b border-[#e4e4e7]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#09090b]">Appointment Summary</h2>
                <button 
                  onClick={() => setSelectedAppointment(null)}
                  className="p-2 hover:bg-[#f4f4f5] rounded-xl transition-colors"
                >
                  <X className="h-5 w-5 text-[#71717a]" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xl">
                  {selectedAppointment.doctor.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-semibold text-[#09090b]">{selectedAppointment.doctor}</h3>
                  <p className="text-sm text-[#71717a]">{selectedAppointment.specialty}</p>
                  <p className="text-xs text-[#a1a1aa] mt-1">
                    {selectedAppointment.date} at {selectedAppointment.time}
                  </p>
                </div>
              </div>

              {selectedAppointment.summary ? (
                <div className="space-y-4">
                  <div className="bg-[#fafafa] rounded-2xl p-4 border border-[#e4e4e7]">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-[#0d9488]" />
                      <h4 className="font-semibold text-sm text-[#09090b]">Diagnosis</h4>
                    </div>
                    <p className="text-sm text-[#52525b]">{selectedAppointment.summary.diagnosis}</p>
                  </div>

                  <div className="bg-[#fafafa] rounded-2xl p-4 border border-[#e4e4e7]">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-[#0d9488]" />
                      <h4 className="font-semibold text-sm text-[#09090b]">Doctor&apos;s Notes</h4>
                    </div>
                    <p className="text-sm text-[#52525b]">{selectedAppointment.summary.notes}</p>
                  </div>

                  <div className="bg-[#fafafa] rounded-2xl p-4 border border-[#e4e4e7]">
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="h-4 w-4 text-[#0d9488]" />
                      <h4 className="font-semibold text-sm text-[#09090b]">Prescriptions</h4>
                    </div>
                    <ul className="space-y-2">
                      {selectedAppointment.summary.prescriptions.map((prescription, index) => (
                        <li key={index} className="text-sm text-[#52525b] flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-[#0d9488] rounded-full"></span>
                          {prescription}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#fafafa] rounded-2xl p-4 border border-[#e4e4e7]">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarCheck className="h-4 w-4 text-[#0d9488]" />
                      <h4 className="font-semibold text-sm text-[#09090b]">Follow-up</h4>
                    </div>
                    <p className="text-sm text-[#52525b]">{selectedAppointment.summary.followUp}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-[#71717a] bg-zinc-50 rounded-2xl">
                  <p>No medical summary available yet.</p>
                </div>
              )}

              <button
                onClick={() => setSelectedAppointment(null)}
                className="w-full py-3 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl font-semibold transition-colors"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
