"use client";

import { DoctorProvider } from "@/lib/doctor-context";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DoctorProvider>
      {children}
    </DoctorProvider>
  );
}
