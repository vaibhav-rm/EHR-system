"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Calendar, Clock, MapPin, Video, ArrowLeft, User, Star, GraduationCap } from "lucide-react";
import { useAppointments } from "@/lib/appointments-context";

const doctors = [
  {
    name: "Dr. Vikram Singh",
    specialty: "Cardiologist",
    experience: "15+ years",
    rating: 4.9,
    fee: 1500,
  },
  {
    name: "Dr. Priya Menon",
    specialty: "General Physician",
    experience: "10+ years",
    rating: 4.8,
    fee: 800,
  },
  {
    name: "Dr. Amit Patel",
    specialty: "Dermatologist",
    experience: "12+ years",
    rating: 4.7,
    fee: 1200,
  },
  {
    name: "Dr. Sunita Reddy",
    specialty: "Orthopedic Surgeon",
    experience: "18+ years",
    rating: 4.9,
    fee: 1800,
  },
  {
    name: "Dr. Rajesh Sharma",
    specialty: "Neurologist",
    experience: "14+ years",
    rating: 4.8,
    fee: 1600,
  },
  {
    name: "Dr. Kavita Joshi",
    specialty: "Endocrinologist",
    experience: "11+ years",
    rating: 4.7,
    fee: 1400,
  },
];

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"
];

export default function BookAppointmentPage() {
  const router = useRouter();
  const { addAppointment } = useAppointments();
  const [selectedDoctor, setSelectedDoctor] = useState<typeof doctors[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState<"In-Person" | "Video">("In-Person");
  const [location, setLocation] = useState("Medanta Hospital, Gurugram");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedTime) return;

    addAppointment({
      doctor: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      location: appointmentType === "Video" ? "Virtual Consultation" : location,
      date: selectedDate,
      time: selectedTime,
      type: appointmentType,
      status: "pending",
      avatar: "",
    });

    router.push("/appointments");
  };

  const isFormValid = selectedDoctor && selectedDate && selectedTime;

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar />
      <div className="flex-1 ml-64 transition-all duration-300">
        <Navbar />
        <main className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-[#f4f4f5] rounded-xl transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-[#71717a]" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#09090b]">Book Appointment</h1>
              <p className="text-sm text-[#71717a] mt-1">Schedule a new appointment with your doctor</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
                <h2 className="text-lg font-semibold text-[#09090b] mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-[#0d9488]" />
                  Select Doctor
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {doctors.map((doctor) => (
                    <button
                      key={doctor.name}
                      type="button"
                      onClick={() => setSelectedDoctor(doctor)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
                        selectedDoctor?.name === doctor.name
                          ? "border-[#0d9488] bg-teal-50"
                          : "border-[#e4e4e7] hover:border-[#0d9488]/30"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {doctor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-[#09090b]">{doctor.name}</h4>
                        <p className="text-xs text-[#71717a]">{doctor.specialty}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-0.5 text-xs text-[#71717a]">
                            <GraduationCap className="h-3 w-3" />
                            {doctor.experience}
                          </span>
                          <span className="flex items-center gap-0.5 text-xs text-yellow-600">
                            <Star className="h-3 w-3 fill-yellow-400" />
                            {doctor.rating}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#0d9488] mt-1">₹{doctor.fee}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
                <h2 className="text-lg font-semibold text-[#09090b] mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#0d9488]" />
                  Select Date
                </h2>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full p-3 border border-[#e4e4e7] rounded-xl text-[#09090b] focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent"
                />
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
                <h2 className="text-lg font-semibold text-[#09090b] mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#0d9488]" />
                  Select Time
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-xl text-sm font-medium transition-all ${
                        selectedTime === time
                          ? "bg-[#0d9488] text-white"
                          : "border border-[#e4e4e7] text-[#52525b] hover:border-[#0d9488]/30"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
                <h2 className="text-lg font-semibold text-[#09090b] mb-4">Appointment Type</h2>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setAppointmentType("In-Person")}
                    className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                      appointmentType === "In-Person"
                        ? "border-[#0d9488] bg-teal-50 text-[#0d9488]"
                        : "border-[#e4e4e7] text-[#52525b] hover:border-[#0d9488]/30"
                    }`}
                  >
                    <MapPin className="h-5 w-5" />
                    <span className="font-medium">In-Person</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppointmentType("Video")}
                    className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                      appointmentType === "Video"
                        ? "border-[#0d9488] bg-teal-50 text-[#0d9488]"
                        : "border-[#e4e4e7] text-[#52525b] hover:border-[#0d9488]/30"
                    }`}
                  >
                    <Video className="h-5 w-5" />
                    <span className="font-medium">Video Call</span>
                  </button>
                </div>

                {appointmentType === "In-Person" && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-[#52525b] mb-2">Location</label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full p-3 border border-[#e4e4e7] rounded-xl text-[#09090b] focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent"
                    >
                      <option>Medanta Hospital, Gurugram</option>
                      <option>Apollo Hospital, Delhi</option>
                      <option>Max Healthcare, Saket</option>
                      <option>Fortis Hospital, Noida</option>
                      <option>AIIMS, New Delhi</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7] sticky top-24">
                <h3 className="font-semibold text-[#09090b] mb-4">Appointment Summary</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#71717a]">Doctor</span>
                    <span className="font-medium text-[#09090b]">
                      {selectedDoctor?.name || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71717a]">Specialty</span>
                    <span className="font-medium text-[#09090b]">
                      {selectedDoctor?.specialty || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71717a]">Date</span>
                    <span className="font-medium text-[#09090b]">
                      {selectedDate || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71717a]">Time</span>
                    <span className="font-medium text-[#09090b]">
                      {selectedTime || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71717a]">Type</span>
                    <span className="font-medium text-[#09090b]">{appointmentType}</span>
                  </div>
                  {appointmentType === "In-Person" && (
                    <div className="flex justify-between">
                      <span className="text-[#71717a]">Location</span>
                      <span className="font-medium text-[#09090b] text-right max-w-[150px]">
                        {location}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-[#e4e4e7] pt-3">
                    <div className="flex justify-between">
                      <span className="text-[#71717a]">Consultation Fee</span>
                      <span className="font-bold text-[#09090b]">
                        {selectedDoctor ? `₹${selectedDoctor.fee}` : "-"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-[#e4e4e7] mt-4 pt-4">
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      isFormValid
                        ? "bg-[#0d9488] hover:bg-[#0f766e] text-white"
                        : "bg-[#e4e4e7] text-[#a1a1aa] cursor-not-allowed"
                    }`}
                  >
                    Confirm Appointment
                  </button>
                  <p className="text-xs text-center text-[#a1a1aa] mt-2">
                    Payment will be collected at the clinic
                  </p>
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
