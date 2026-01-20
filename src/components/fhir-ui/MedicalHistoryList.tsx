'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Condition } from 'fhir/r4';
import { Loader2, Activity, Plus } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { toast } from 'sonner';

async function fetchConditions() {
  const res = await fetch('/api/fhir/Condition');
  if (!res.ok) throw new Error('Failed to fetch medical history');
  const data = await res.json();
  return (data.entry?.map((e: any) => e.resource) || []) as Condition[];
}

export function MedicalHistoryList() {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        condition: '', // code.text
        status: 'active', // clinicalStatus
        date: '', // onsetDateTime
    });

  const { data: conditions, isLoading } = useQuery({
    queryKey: ['conditions'],
    queryFn: fetchConditions,
  });

  const mutation = useMutation({
    mutationFn: async (newCondition: any) => {
        const res = await fetch('/api/fhir/Condition', {
            method: 'POST',
            body: JSON.stringify(newCondition),
            headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Failed to add condition');
        return res.json();
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['conditions'] });
        setOpen(false);
        setFormData({ condition: '', status: 'active', date: '' });
        toast.success("Medical record added successfully");
    },
    onError: () => {
        toast.error("Failed to add record");
    }

  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.condition || !formData.date) {
        toast.error("Please fill in all required fields");
        return;
    }

    const newCondition: Condition = {
        resourceType: 'Condition',
        code: { text: formData.condition },
        clinicalStatus: { coding: [{ code: formData.status, system: 'http://terminology.hl7.org/CodeSystem/condition-clinical' }] },
        onsetDateTime: formData.date,
        subject: { reference: 'Patient/current' } // In real app, use actual ID
    };

    mutation.mutate(newCondition);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
        <div className="flex justify-end">
            <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Add Record
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Add Medical History</DialogTitle>
                <DialogDescription>
                    Add a past or current condition to your medical record.
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="condition" className="text-right">Condition</Label>
                            <Input
                                id="condition"
                                value={formData.condition}
                                onChange={(e) => setFormData({...formData, condition: e.target.value})}
                                className="col-span-3"
                                placeholder="e.g. Hypertension"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">Onset Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                className="col-span-3"
                            />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val) => setFormData({...formData, status: val})}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Saving..." : "Save Record"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
            </Dialog>
        </div>

    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Condition</TableHead>
            <TableHead>Clinical Status</TableHead>
            <TableHead>Onset Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {conditions?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                No active conditions recorded.
              </TableCell>
            </TableRow>
          ) : (
            conditions?.map((cond) => {
               const name = cond.code?.text || cond.code?.coding?.[0]?.display || 'Unknown Condition';
               const status = cond.clinicalStatus?.coding?.[0]?.code || 'unknown';
               
               let statusColor = "bg-gray-100 text-gray-800";
               if (status === 'active') statusColor = "bg-red-50 text-red-700 border-red-200";
               if (status === 'resolved') statusColor = "bg-green-50 text-green-700 border-green-200";

               return (
                <TableRow key={cond.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        {name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColor}>
                        {status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {cond.onsetDateTime || 'N/A'}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
    </div>
  );
}
