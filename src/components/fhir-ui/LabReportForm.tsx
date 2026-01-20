'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DiagnosticReportSchema, DiagnosticReportFormData } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface LabReportFormProps {
  patientId: string;
  onSuccess?: () => void;
}

export function LabReportForm({ patientId, onSuccess }: LabReportFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<DiagnosticReportFormData>({
    resolver: zodResolver(DiagnosticReportSchema),
    defaultValues: {
      resourceType: 'DiagnosticReport',
      status: 'final',
      code: {
          coding: [{ system: 'http://loinc.org', code: '', display: '' }],
          text: ''
      },
      subject: { reference: `Patient/${patientId}` },
      effectiveDateTime: new Date().toISOString()
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: DiagnosticReportFormData) => {
      const res = await fetch('/api/fhir/DiagnosticReport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to upload report');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Lab report uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  function onSubmit(data: DiagnosticReportFormData) {
      if (data.code.coding?.[0]) {
          data.code.text = data.code.coding[0].display;
      }
      
      const payload = {
          ...data,
          effectiveDateTime: new Date().toISOString()
      };
      mutation.mutate(payload);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <FormField
            control={form.control}
            name="code.coding.0.display"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Lab Test Name</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. Complete Blood Count (CBC)" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Uploading...' : 'Upload Result'}
        </Button>
      </form>
    </Form>
  );
}
