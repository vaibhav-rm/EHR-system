"use client";

import React from 'react';
import Link from 'next/link';
import { History, Plus } from 'lucide-react';

interface DashboardHeaderProps {
  userName?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName = "User" }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <div className="flex flex-col">
        <h1 
          className="text-lg font-semibold tracking-tight"
          style={{ 
            fontSize: '1.125rem', 
            fontWeight: 600, 
            lineHeight: '1.75rem', 
            color: '#09090b' 
          }}
        >
          {getGreeting()}, {userName}
        </h1>
        <p 
          className="text-sm text-zinc-500"
          style={{ 
            fontSize: '0.875rem', 
            lineHeight: '1.25rem', 
            color: '#71717a' 
          }}
        >
          Here&apos;s your health overview for today
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/records"
          className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-all outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] border bg-white shadow-xs hover:bg-zinc-100 text-zinc-900 border-zinc-200 h-8 px-3 gap-1.5 rounded-lg text-xs"
          style={{
            fontSize: '0.75rem',
            paddingLeft: '0.75rem',
            paddingRight: '0.75rem',
            height: '2rem',
          }}
        >
          <History className="h-3.5 w-3.5" />
          History
        </Link>

        <Link
          href="/book-appointment"
          className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-all outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] shadow-xs h-8 px-3 gap-1.5 rounded-lg bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs"
          style={{
            fontSize: '0.75rem',
            paddingLeft: '0.75rem',
            paddingRight: '0.75rem',
            height: '2rem',
            fontWeight: 500,
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Book Appointment
        </Link>
      </div>
    </div>
  );
};

export default DashboardHeader;
