'use client';

import { useQuery } from '@tanstack/react-query';
import { Appointment } from 'fhir/r4';
import { Loader2, Calendar, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface AppointmentListProps {
    queryType: 'patient' | 'practitioner';
    referenceId: string; // ID of the patient or practitioner
}

async function fetchAppointments(type: string, id: string) {
  const params = new URLSearchParams();
  params.append(type, `${type === 'patient' ? 'Patient' : 'Practitioner'}/${id}`);
  
  const res = await fetch(`/api/fhir/Appointment?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch appointments');
  const data = await res.json();
  return (data.entry?.map((e: any) => e.resource) || []) as Appointment[];
}

export function AppointmentList({ queryType, referenceId }: AppointmentListProps) {
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', queryType, referenceId],
    queryFn: () => fetchAppointments(queryType, referenceId),
  });

  if (isLoading) {
    return <div className="text-center p-4"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></div>;
  }

  if (!appointments || appointments.length === 0) {
      return (
          <div className="text-center p-8 border rounded-lg bg-muted/20">
              <p className="text-muted-foreground">No upcoming appointments found.</p>
          </div>
      );
  }

  return (
    <div className="grid gap-4 md:grid-cols-1">
        {appointments.map(apt => {
            const start = new Date(apt.start || new Date());
            const dateStr = format(start, 'PPP'); // Apr 29, 2023
            const timeStr = format(start, 'p'); // 5:00 PM
            const doctor = apt.participant.find(p => p.actor?.reference?.startsWith('Practitioner'))?.actor?.display || 'Unknown Doctor';
            const patient = apt.participant.find(p => p.actor?.reference?.startsWith('Patient'))?.actor?.display || 'Unknown Patient';
            const otherParty = queryType === 'patient' ? doctor : patient;

            return (
                <Card key={apt.id} className="flex flex-row items-center justify-between p-4">
                    <div className="flex flex-col gap-1">
                        <h4 className="font-semibold text-lg">{apt.description}</h4>
                        <div className="flex items-center text-sm text-muted-foreground gap-4">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {dateStr}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeStr}</span>
                            <span className="flex items-center gap-1"><User className="h-3 w-3" /> With: {otherParty}</span>
                        </div>
                    </div>
                    <div>
                        <Badge variant={apt.status === 'booked' ? 'default' : 'secondary'} className="capitalize">
                            {apt.status}
                        </Badge>
                    </div>
                </Card>
            )
        })}
    </div>
  );
}
