'use client';

import { useQuery } from '@tanstack/react-query';
import { Observation } from 'fhir/r4';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from 'date-fns';

async function fetchObservations() {
  const res = await fetch('/api/fhir/Observation');
  if (!res.ok) throw new Error('Failed to fetch observations');
  const data = await res.json();
  return (data.entry?.map((e: any) => e.resource) || []) as Observation[];
}

export function VitalsHistory() {
  const { data: observations, isLoading } = useQuery({
    queryKey: ['observations'],
    queryFn: fetchObservations,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filter for only vital signs (simple heuristic)
  // In real app, check category code
  const vitals = observations?.filter(o => o.valueQuantity); 

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Vital Sign</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vitals?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                No vitals recorded yet.
              </TableCell>
            </TableRow>
          ) : (
            vitals?.map((obs) => {
               const name = obs.code?.text || obs.code?.coding?.[0]?.display || 'Unknown';
               const value = `${obs.valueQuantity?.value} ${obs.valueQuantity?.unit}`;
               const date = obs.effectiveDateTime ? format(new Date(obs.effectiveDateTime), 'PPP p') : 'N/A';

               return (
                <TableRow key={obs.id}>
                  <TableCell className="font-medium">{date}</TableCell>
                  <TableCell>{name}</TableCell>
                  <TableCell>{value}</TableCell>
                  <TableCell className="capitalize text-muted-foreground">{obs.status}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
