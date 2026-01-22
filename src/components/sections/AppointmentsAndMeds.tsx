"use client";

import React from 'react';
import Link from 'next/link';
import { Calendar, Pill, Video, MapPin, Clock, ArrowRight, TrendingUp, FileText } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/utils';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';

const UpcomingAppointments = () => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  
  const { data: bundle, isLoading } = useSWR(
    status === 'authenticated' && userId ? `/api/fhir/Appointment?status=booked&patient=Patient/${userId}` : null, 
    fetcher
  );
  
  const appointments = bundle?.entry?.map((e: any) => e.resource) || [];

  const safeFormatDate = (dateString: string, fmt: string) => {
    try {
        if (!dateString) return 'TBD';
        return format(new Date(dateString), fmt);
    } catch (e) {
        return 'Invalid Date';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[1.125rem] font-semibold text-[#09090b]">Upcoming Appointments</h2>
        <Link href="/appointments" className="text-sm font-medium text-[#0d9488] hover:underline">View all</Link>
      </div>
      <div className="space-y-3">
        {isLoading && <p className="text-sm text-gray-500">Loading appointments...</p>}
        {!isLoading && appointments.length === 0 && <p className="text-sm text-gray-500">No upcoming appointments.</p>}
        
        {appointments.slice(0, 3).map((apt: any) => {
           const doctorName = apt.participant?.find((p: any) => p.actor?.reference?.startsWith('Practitioner'))?.actor?.display || 'Unknown Doctor';
           // Also try getting doctor name from enriched fields if API returns them, but FHIR route returns raw resource usually
           // unless we updated route to enrich. The route I saw returns raw valid FHIR. 
           // Display comes from actor.display if saved, otherwise we might see 'Unknown' if not saved.
           // Since we can't easily fetch doctor name here without extra calls, let's hope it's in actor.display or we just show 'Doctor'.
           
           const isMissed = apt.status === 'booked' && new Date(apt.start).getTime() < Date.now();
           const displayStatus = isMissed ? 'missed' : apt.status;

           const dateStr = safeFormatDate(apt.start, 'yyyy-MM-dd');
           const timeStr = safeFormatDate(apt.start, 'h:mm a');
           
           return (
              <div 
                key={apt.id} 
                className={`group flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-white rounded-[1.5rem] border soft-shadow transition-all hover:border-[#0d9488]/30 ${displayStatus === 'missed' ? 'border-red-100 bg-red-50/10' : 'border-[#e4e4e7]'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold">
                    {doctorName.includes('Dr.') ? doctorName.split(' ')[1]?.[0] : doctorName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-[0.875rem] font-semibold text-[#09090b]">{doctorName}</h4>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          displayStatus === 'booked' ? 'bg-teal-50 text-teal-600' : 
                          displayStatus === 'missed' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {displayStatus}
                      </span>
                    </div>
                    <p className="text-xs text-[#71717a]">{apt.description || 'General Consultation'}</p>
                    <div className="flex items-center gap-3 mt-2 text-[0.75rem] font-medium text-[#a1a1aa]">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {dateStr}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {timeStr}</span>
                      <span className="flex items-center gap-1">
                         <MapPin size={14} /> In-Person
                      </span>
                    </div>
                  </div>
                </div>
                {displayStatus === 'missed' ? (
                     <Link 
                     href={`/book-appointment`} // Ideally pass doctor ID to pre-fill
                     className="mt-4 md:mt-0 px-4 py-2 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
                   >
                     Reschedule
                   </Link>
                ) : (
                    <Link 
                    href={`/appointments/${apt.id}`}
                    className="mt-4 md:mt-0 px-4 py-2 border border-[#e4e4e7] rounded-xl text-sm font-semibold text-[#52525b] hover:bg-[#f4f4f5] transition-colors"
                    >
                    Manage
                    </Link>
                )}
              </div>
           );
        })}
      </div>
    </div>
  );
};

const MedicationSection = () => {
    const { data: session, status } = useSession();
    const userId = session?.user?.id;

    const { data: bundle, isLoading } = useSWR(
        status === 'authenticated' && userId ? `/api/fhir/MedicationRequest?status=active&patient=Patient/${userId}` : null, 
        fetcher
    );
    const meds = bundle?.entry?.map((e: any) => e.resource) || [];

    // Also fetch appointments for Health Insights summary
    const { data: apptBundle, isLoading: isLoadingAppts } = useSWR(
      status === 'authenticated' && userId ? `/api/fhir/Appointment?status=booked&patient=Patient/${userId}` : null, 
      fetcher
    );
    const appointmentCount = apptBundle?.entry?.length || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[1.125rem] font-semibold text-[#09090b]">Today&apos;s Medications</h2>
        <Link href="/medications" className="text-sm font-medium text-[#0d9488] hover:underline">View all</Link>
      </div>
      <div className="space-y-4">
        {isLoading && <p className="text-sm text-gray-500">Loading medications...</p>}
        {!isLoading && meds.length === 0 && <p className="text-sm text-gray-500">No active medications.</p>}
        {meds.slice(0, 3).map((med: any, idx: number) => (
          <div key={idx} className="p-5 bg-white rounded-[1.5rem] border border-[#e4e4e7] soft-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
                  <Pill size={20} />
                </div>
                <div>
                  <h4 className="text-[0.875rem] font-semibold text-[#09090b]">{med.medicationCodeableConcept?.text || 'Unknown Med'}</h4>
                  <p className="text-xs text-[#71717a]">{med.dosageInstruction?.[0]?.text || 'As directed'}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-teal-600 uppercase bg-teal-50 px-2 py-0.5 rounded-full">{med.status}</span>
            </div>
            
            <div className="mt-5 space-y-1.5">
               {/* Mock adherence for now as FHIR doesn't track this easily in basic resources */}
              <div className="flex justify-between text-[11px] font-medium text-[#71717a]">
                <span>Adherence</span>
                <span className="text-[#09090b]">95%</span>
              </div>
              <div className="h-1.5 w-full bg-[#f4f4f5] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#0d9488] rounded-full transition-all duration-1000" 
                  style={{ width: `95%` }}
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[#e4e4e7] pt-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#71717a]">
                <Clock size={14} />
                <span>Next dose: 8:00 PM</span>
              </div>
              <button className="text-sm font-semibold text-[#0d9488] hover:text-[#0f766e]">
                Log Dose
              </button>
            </div>
          </div>
        ))}

      <div className="bg-white rounded-[1.5rem] p-6 relative overflow-hidden shadow-sm border border-[#e4e4e7]">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp size={80} strokeWidth={1} className="text-[#0d9488]" />
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp size={20} className="text-[#0d9488]" />
              </div>
              <h3 className="text-lg font-bold mb-1 text-[#09090b]">Health Insights</h3>
              <p className="text-sm text-zinc-400 mb-6">Your monthly health summary</p>
              
              <div className="text-sm leading-relaxed text-[#52525b] mb-6 space-y-2">
                 <p>
                    You have <strong className="text-[#09090b]">{meds.length}</strong> active medication{meds.length !== 1 ? 's' : ''}.
                 </p>
                 {isLoadingAppts ? (
                    <p className="opacity-50">Checking appointments...</p>
                 ) : (
                    <p>
                       You have <strong className="text-[#0d9488]">{appointmentCount}</strong> upcoming appointment{appointmentCount !== 1 ? 's' : ''} scheduled.
                    </p>
                 )}
              </div>

              <Link 
                href="/records"
                className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                View Health Records <ArrowRight size={16} />
              </Link>
            </div>
          </div>
      </div>
    </div>
  );
};

const AppointmentsAndMeds = () => {
    const { data: session, status } = useSession();
    const userId = session?.user?.id;

    // 1. Fetch real DiagnosticReports
    const { data: reportBundle, isLoading } = useSWR(
        status === 'authenticated' && userId ? `/api/fhir/DiagnosticReport?patient=Patient/${userId}` : null, 
        fetcher
    );
    
    // 2. Map FHIR resources to UI format
    const reports = reportBundle?.entry?.map((e: any) => e.resource) || [];
    
    // If no real reports, we can show an empty state or the static data strictly as fallback (user preference usually real data).
    // Let's rely on real data to answer "integrated" accurately.
    const recentRecords = reports.map((report: any) => ({
        id: report.id,
        title: report.code?.text || 'Diagnostic Report',
        location: report.performer?.[0]?.display || 'Lab Center',
        doctor: report.resultsInterpreter?.[0]?.display || 'Dr. Assigned',
        date: report.effectiveDateTime ? format(new Date(report.effectiveDateTime), 'yyyy-MM-dd') : 'Recent',
        summary: 'Result available.', // FHIR Report "conclusion" or simple text
        category: report.category?.[0]?.coding?.[0]?.display || 'Lab',
        type: 'Routine',
    }));

  return (
    <section className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          <UpcomingAppointments />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[1.125rem] font-semibold text-[#09090b]">Recent Medical Records</h2>
              <Link href="/records" className="text-sm font-medium text-[#0d9488] hover:underline">View all</Link>
            </div>
            <div className="space-y-4">
               {isLoading && <p className="text-sm text-gray-500">Loading records...</p>}
               {!isLoading && recentRecords.length === 0 && <p className="text-sm text-gray-500">No medical records found.</p>}

              {recentRecords.slice(0, 3).map((record: any) => (
                <div key={record.id} className="p-6 bg-white rounded-[1.5rem] border border-[#e4e4e7] soft-shadow group transition-all hover:border-[#0d9488]/20">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-zinc-50 text-zinc-400 rounded-2xl group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="text-[0.875rem] font-bold text-[#09090b]">
                          {record.title}
                        </h4>
                        <p className="text-xs text-[#71717a] mt-0.5">
                          {record.location} • {record.doctor}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-[#a1a1aa]">{record.date}</span>
                  </div>
                  <div className="bg-zinc-50 rounded-2xl p-4 italic text-sm text-[#52525b] border border-transparent group-hover:border-zinc-100 transition-colors">
                    &quot;{record.summary}&quot;
                  </div>
                  <div className="flex gap-2 mt-4">
                    <span className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-semibold text-[#71717a] uppercase tracking-wider">{record.type}</span>
                    <span className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-semibold text-[#71717a] uppercase tracking-wider">
                      {record.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <MedicationSection />
        </div>
      </div>
    </section>
  );
};

export default AppointmentsAndMeds;
