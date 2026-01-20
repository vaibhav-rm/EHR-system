"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Doctor } from './types';

interface DoctorContextType {
  doctor: Doctor | null;
  setDoctor: (doctor: Doctor | null) => void;
  isLoading: boolean;
  logout: () => void;
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

export function DoctorProvider({ children }: { children: ReactNode }) {
  const [doctor, setDoctorState] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('doctor_session');
    if (stored) {
      try {
        setDoctorState(JSON.parse(stored));
      } catch {
        localStorage.removeItem('doctor_session');
      }
    }
    setIsLoading(false);
  }, []);

  const setDoctor = (doc: Doctor | null) => {
    setDoctorState(doc);
    if (doc) {
      localStorage.setItem('doctor_session', JSON.stringify(doc));
    } else {
      localStorage.removeItem('doctor_session');
    }
  };

  const logout = () => {
    setDoctor(null);
    window.location.href = '/';
  };

  return (
    <DoctorContext.Provider value={{ doctor, setDoctor, isLoading, logout }}>
      {children}
    </DoctorContext.Provider>
  );
}

export function useDoctor() {
  const context = useContext(DoctorContext);
  if (context === undefined) {
    throw new Error('useDoctor must be used within a DoctorProvider');
  }
  return context;
}
