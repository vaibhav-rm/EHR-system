'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MedicationRequestSchema, MedicationRequestFormData } from '@/lib/schemas';
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

interface PrescriptionFormProps {
  patientId: string;
  doctorId: string; // The ID of the prescribing doctor
  onSuccess?: () => void;
}

export function PrescriptionForm({ patientId, doctorId, onSuccess }: PrescriptionFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<MedicationRequestFormData>({
    resolver: zodResolver(MedicationRequestSchema),
    defaultValues: {
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: {
          coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '', display: '' }],
          text: ''
      },
      subject: { reference: `Patient/${patientId}` },
      requester: { reference: `Practitioner/${doctorId}` },
      dosageInstruction: [
          {
              text: '',
              timing: { repeat: { frequency: 1, period: 1, periodUnit: 'd' } }
          }
      ],
      authoredOn: new Date().toISOString()
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: MedicationRequestFormData) => {
      const res = await fetch('/api/fhir/MedicationRequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to create prescription');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Prescription sent successfully');
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  function onSubmit(data: MedicationRequestFormData) {
      // Ensure coding display matches text if simplified
      if (data.medicationCodeableConcept.coding?.[0]) {
          data.medicationCodeableConcept.text = data.medicationCodeableConcept.coding[0].display;
      }
      
      const payload = {
          ...data,
          authoredOn: new Date().toISOString()
      };
      mutation.mutate(payload);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <FormField
            control={form.control}
            name="medicationCodeableConcept.coding.0.display"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Medication Name</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. Amoxicillin 500mg" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />

        <div className="grid grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="dosageInstruction.0.text"
                render={({ field }) => (
                    <FormItem className="col-span-2">
                    <FormLabel>Dosage Instructions</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. Take 1 tablet every 8 hours" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Sending...' : 'Issue Prescription'}
        </Button>
      </form>
    </Form>
  );
}
