"use client";

import React, { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Calendar, Clock, MapPin, Video, Plus, ChevronLeft, ChevronRight, MoreHorizontal, X, FileText, Pill, CalendarCheck, Search, User } from "lucide-react";
import { useAppointments, Appointment } from "@/lib/appointments-context";

export default function AppointmentsPage() {
  const { appointments, pastAppointments } = useAppointments();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const allAppointments = [...appointments, ...pastAppointments];

  const filteredUpcoming = appointments.filter((apt) => {
    const query = searchQuery.toLowerCase();
    return (
      apt.doctor.toLowerCase().includes(query) ||
      apt.specialty.toLowerCase().includes(query) ||
      apt.location.toLowerCase().includes(query) ||
      apt.date.includes(query)
    );
  });

  const filteredPast = pastAppointments.filter((apt) => {
    const query = searchQuery.toLowerCase();
    return (
      apt.doctor.toLowerCase().includes(query) ||
      apt.specialty.toLowerCase().includes(query) ||
      apt.location.toLowerCase().includes(query) ||
      apt.date.includes(query)
    );
  });

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar />
      <div className="flex-1 ml-64 transition-all duration-300">
        <Navbar />
        <main className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#09090b]">Appointments</h1>
              <p className="text-sm text-[#71717a] mt-1">Manage your upcoming and past appointments</p>
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
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
                <h2 className="text-lg font-semibold text-[#09090b] mb-4">Upcoming Appointments</h2>
                {filteredUpcoming.length === 0 ? (
                  <div className="text-center py-8 text-[#71717a]">
                    <Calendar className="h-12 w-12 text-[#e4e4e7] mx-auto mb-4" />
                    <p>{searchQuery ? "No appointments match your search." : "No upcoming appointments."}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredUpcoming.map((apt) => (
                      <div
                        key={apt.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#fafafa] rounded-2xl border border-[#e4e4e7] hover:border-[#0d9488]/30 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                            {apt.doctor.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-[#09090b]">{apt.doctor}</h4>
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                ['confirmed', 'booked', 'arrived', 'checked-in'].includes(apt.status) 
                                  ? "bg-teal-50 text-teal-600" 
                                  : "bg-orange-50 text-orange-600"
                              }`}>
                                {apt.status}
                              </span>
                            </div>
                            <p className="text-xs text-[#71717a]">{apt.specialty}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-[#a1a1aa]">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {apt.date}
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
                        <div className="flex items-center gap-2 mt-4 sm:mt-0">
                          <button className="px-4 py-2 border border-[#e4e4e7] rounded-xl text-sm font-medium text-[#52525b] hover:bg-[#f4f4f5] transition-colors">
                            Reschedule
                          </button>
                          <button className="p-2 hover:bg-[#f4f4f5] rounded-lg transition-colors">
                            <MoreHorizontal className="h-4 w-4 text-[#71717a]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
                <h2 className="text-lg font-semibold text-[#09090b] mb-4">Past Appointments</h2>
                {filteredPast.length === 0 ? (
                  <div className="text-center py-8 text-[#71717a]">
                    <p>{searchQuery ? "No past appointments match your search." : "No past appointments."}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPast.map((apt) => (
                      <div
                        key={apt.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#fafafa] rounded-2xl border border-[#e4e4e7] opacity-75"
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
                                <Calendar className="h-3 w-3" /> {apt.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {apt.time}
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
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[#09090b]">December 2024</h3>
                  <div className="flex items-center gap-1">
                    <button className="p-1 hover:bg-[#f4f4f5] rounded-lg">
                      <ChevronLeft className="h-4 w-4 text-[#71717a]" />
                    </button>
                    <button className="p-1 hover:bg-[#f4f4f5] rounded-lg">
                      <ChevronRight className="h-4 w-4 text-[#71717a]" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day} className="py-2 text-[#a1a1aa] font-medium">{day}</div>
                  ))}
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <button
                      key={day}
                      className={`py-2 rounded-lg text-sm transition-colors ${
                        day === 20 || day === 22 || day === 28
                          ? "bg-[#0d9488] text-white font-semibold"
                          : day === 18
                          ? "bg-[#f4f4f5] text-[#09090b] font-medium"
                          : "text-[#52525b] hover:bg-[#f4f4f5]"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
                <h3 className="font-semibold text-[#09090b] mb-2">Quick Stats</h3>
                <p className="text-sm text-[#71717a] mb-4">This month</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#71717a]">Total Appointments</span>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                <div className="text-center py-8 text-[#71717a]">
                  <p>No summary available for this appointment.</p>
                </div>
              )}

              <button
                onClick={() => setSelectedAppointment(null)}
                className="w-full py-3 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl font-semibold transition-colors"
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
