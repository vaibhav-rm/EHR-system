'use client';

import { useQuery } from '@tanstack/react-query';
import { MedicationRequest } from 'fhir/r4';
import { Loader2, Pill } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface PrescriptionListProps {
    patientId: string;
}

async function fetchPrescriptions(patientId: string) {
  const params = new URLSearchParams();
  params.append('patient', `Patient/${patientId}`);
  
  const res = await fetch(`/api/fhir/MedicationRequest?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch prescriptions');
  const data = await res.json();
  return (data.entry?.map((e: any) => e.resource) || []) as MedicationRequest[];
}

export function PrescriptionList({ patientId }: PrescriptionListProps) {
  const { data: meds, isLoading } = useQuery({
    queryKey: ['medications', patientId],
    queryFn: () => fetchPrescriptions(patientId),
  });

  if (isLoading) {
    return <div className="p-4 flex justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>;
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Medication</TableHead>
            <TableHead>Dosage</TableHead>
            <TableHead>Date Prescribed</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meds?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                No active prescriptions.
              </TableCell>
            </TableRow>
          ) : (
            meds?.map((med) => {
               const name = med.medicationCodeableConcept?.text || med.medicationCodeableConcept?.coding?.[0]?.display || 'Unknown Drug';
               const instructions = med.dosageInstruction?.[0]?.text || 'As directed';
               const date = med.authoredOn ? format(new Date(med.authoredOn), 'PPP') : 'N/A';
               
               return (
                <TableRow key={med.id}>
                  <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4 text-blue-500" />
                        {name}
                      </div>
                  </TableCell>
                  <TableCell>{instructions}</TableCell>
                  <TableCell>{date}</TableCell>
                  <TableCell>
                      <Badge variant={med.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                        {med.status}
                      </Badge>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
