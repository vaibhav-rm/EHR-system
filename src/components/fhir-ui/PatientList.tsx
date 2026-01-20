'use client';

import { useQuery } from '@tanstack/react-query';
import { Patient } from 'fhir/r4';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

async function fetchPatients() {
  const res = await fetch('/api/fhir/Patient');
  if (!res.ok) throw new Error('Failed to fetch patients');
  const data = await res.json();
  return (data.entry?.map((e: any) => e.resource) || []) as Patient[];
}

export function PatientList() {
  const { data: patients, isLoading, error } = useQuery({
    queryKey: ['patients'],
    queryFn: fetchPatients,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive p-4">Error loading patients</div>;
  }

  return (
    <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Registered Patients</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Birth Date</TableHead>
            <TableHead>Contact</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                No patients registered yet.
              </TableCell>
            </TableRow>
          ) : (
            patients?.map((patient) => {
               const name = patient.name?.[0];
               const fullName = `${name?.given?.join(' ')} ${name?.family}`;
               const email = patient.telecom?.find(t => t.system === 'email')?.value;
               
               return (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{fullName}</TableCell>
                  <TableCell className="capitalize">{patient.gender}</TableCell>
                  <TableCell>{patient.birthDate}</TableCell>
                  <TableCell>{email || '-'}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
