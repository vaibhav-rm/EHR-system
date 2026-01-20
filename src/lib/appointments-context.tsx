"use client";

import React, { createContext, useContext, ReactNode, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useSession } from "next-auth/react";

export interface AppointmentSummary {
  diagnosis: string;
  notes: string;
  prescriptions: string[];
  followUp: string;
}

export interface Appointment {
  id: string; // Changed to string for FHIR compatibility
  doctor: string;
  specialty: string;
  location: string;
  date: string;
  time: string;
  type: "In-Person" | "Video";
  status: "confirmed" | "pending" | "completed" | "cancelled" | "booked" | "arrived" | "checked-in" | "waitlist" | "noshow" | "entered-in-error";
  avatar: string;
  summary?: AppointmentSummary;
}

interface AppointmentsContextType {
  appointments: Appointment[];
  pastAppointments: Appointment[];
  isLoading: boolean;
  addAppointment: (appointment: any) => void;
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const { data: bundle, isLoading } = useQuery({
    queryKey: ['appointments', session?.user?.email],
    queryFn: async () => {
        const res = await fetch('/api/fhir/Appointment');
        if (res.status === 403 || res.status === 401) {
             // Handle unauthorized explicitly to avoid retry loop if query was somehow enabled
             return { entry: [] };
        }
        if (!res.ok) throw new Error("Failed to fetch appointments");
        return res.json();
    },
    enabled: status === 'authenticated' && !!session?.user?.email,
    retry: (failureCount, error) => {
        // Don't retry on 403s
        return false;
    }
  });

  const allAppointments: Appointment[] = (bundle?.entry || []).map((entry: any) => {
    const r = entry.resource;
    let start = new Date();
    try {
        if (r.start) start = new Date(r.start);
    } catch (e) { console.error("Invalid date", r.start); }
    
    // Extract doctor name from participants
    const doctor = r.participant?.find((p: any) => p.actor?.reference?.startsWith('Practitioner'))?.actor?.display || 
                   r.participant?.find((p: any) => p.actor?.display)?.actor?.display || 
                   "Dr. Unassigned";

    return {
        id: r.id,
        doctor: doctor,
        specialty: r.serviceType?.[0]?.coding?.[0]?.display || "General Practice",
        location: "Medanta Hospital", // Placeholder
        date: format(start, "yyyy-MM-dd"),
        time: format(start, "h:mm a"),
        type: r.description?.includes("Video") ? "Video" : "In-Person",
        status: r.status,
        avatar: "", 
        summary: undefined 
    };
  });

  const appointments = allAppointments.filter(a => ['booked', 'arrived', 'checked-in', 'waitlist', 'pending', 'confirmed'].includes(a.status));
  const pastAppointments = allAppointments.filter(a => ['fulfilled', 'completed', 'cancelled', 'noshow', 'entered-in-error'].includes(a.status));

  const addAppointment = (appointment: any) => {
      console.log("Add appointment via API pending", appointment);
  };

  return (
    <AppointmentsContext.Provider value={{ appointments, pastAppointments, isLoading, addAppointment }}>
      {children}
    </AppointmentsContext.Provider>
  );
}

export function useAppointments() {
  const context = useContext(AppointmentsContext);
  if (context === undefined) {
    throw new Error("useAppointments must be used within an AppointmentsProvider");
  }
  return context;
}
