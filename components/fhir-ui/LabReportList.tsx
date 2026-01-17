'use client';

import { useQuery } from '@tanstack/react-query';
import { DiagnosticReport } from 'fhir/r4';
import { Loader2, FileText, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface LabReportListProps {
    patientId: string;
}

async function fetchReports(patientId: string) {
  const params = new URLSearchParams();
  params.append('patient', `Patient/${patientId}`);
  
  const res = await fetch(`/api/fhir/DiagnosticReport?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  const data = await res.json();
  return (data.entry?.map((e: any) => e.resource) || []) as DiagnosticReport[];
}

export function LabReportList({ patientId }: LabReportListProps) {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports', patientId],
    queryFn: () => fetchReports(patientId),
  });

  if (isLoading) {
    return <div className="p-4 flex justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>;
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Test Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                No reports found.
              </TableCell>
            </TableRow>
          ) : (
            reports?.map((rep) => {
               const name = rep.code?.text || rep.code?.coding?.[0]?.display || 'Unknown Report';
               const date = rep.effectiveDateTime ? format(new Date(rep.effectiveDateTime), 'PPP') : 'N/A';
               
               return (
                <TableRow key={rep.id}>
                  <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-orange-500" />
                        {name}
                      </div>
                  </TableCell>
                  <TableCell>{date}</TableCell>
                  <TableCell>
                      <Badge variant={rep.status === 'final' ? 'default' : 'secondary'} className="capitalize">
                        {rep.status}
                      </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-1" /> PDF
                      </Button>
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
