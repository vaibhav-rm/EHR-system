'use client';

import { useQuery } from '@tanstack/react-query';
import { Invoice } from 'fhir/r4';
import { Loader2, DollarSign } from 'lucide-react';
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

interface InvoiceListProps {
    patientId?: string; // If null, show all (for hospital)
}

async function fetchInvoices(patientId?: string) {
  const params = new URLSearchParams();
  if (patientId) params.append('patient', `Patient/${patientId}`);
  
  const res = await fetch(`/api/fhir/Invoice?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch invoices');
  const data = await res.json();
  return (data.entry?.map((e: any) => e.resource) || []) as Invoice[];
}

export function InvoiceList({ patientId }: InvoiceListProps) {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', patientId],
    queryFn: () => fetchInvoices(patientId),
  });

  if (isLoading) {
    return <div className="p-4 flex justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>;
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                No invoices found.
              </TableCell>
            </TableRow>
          ) : (
            invoices?.map((inv) => {
               const description = inv.lineItem?.[0]?.chargeItemCodeableConcept?.text || inv.lineItem?.[0]?.chargeItemCodeableConcept?.coding?.[0]?.display || 'Medical Service';
               const amount = inv.totalNet ? `${inv.totalNet.value} ${inv.totalNet.currency}` : 'N/A';
               const date = inv.date ? format(new Date(inv.date), 'PPP') : 'N/A';
               
               return (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{date}</TableCell>
                  <TableCell>{description}</TableCell>
                  <TableCell>{amount}</TableCell>
                  <TableCell>
                      <Badge variant={inv.status === 'issued' ? 'destructive' : 'secondary'} className="capitalize">
                        {inv.status}
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
