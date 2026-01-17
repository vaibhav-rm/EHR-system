'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppointmentSchema, AppointmentFormData } from '@/lib/schemas';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface AppointmentFormProps {
  patientId: string; // The ID of the logged-in patient
  practitioners: { id: string, name: string }[];
  onSuccess?: () => void;
}

export function AppointmentForm({ patientId, practitioners, onSuccess }: AppointmentFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      resourceType: 'Appointment',
      status: 'booked',
      description: 'Routine Checkup',
      start: '',
      end: '',
      participant: [
        {
            actor: {
                reference: `Patient/${patientId}`,
                display: 'Patient'
            },
            status: 'accepted'
        },
         {
            actor: {
                reference: '', // Will be filled by doctor selection
                display: 'Doctor'
            },
            status: 'needs-action'
        }
      ]
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: AppointmentFormData) => {
      const res = await fetch('/api/fhir/Appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to book appointment');
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success('Appointment booked successfully!');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  function onSubmit(data: AppointmentFormData) {
    // Ensure dates are ISO strings if simple datetime-local input is used
    // HTML datetime-local gives 'YYYY-MM-DDTHH:mm', ISO expects seconds/timezone roughly
    // For simplicity in demo, we append ':00Z'
    
    const formattedData = {
        ...data,
        start: new Date(data.start).toISOString(),
        end: new Date(data.end).toISOString(),
    };
    mutation.mutate(formattedData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <FormField
            control={form.control}
            name="participant.1.actor.reference"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Select Doctor</FormLabel>
                <Select onValueChange={(val) => field.onChange(`Practitioner/${val}`)} defaultValue={field.value.replace('Practitioner/', '')}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Choose a specialist" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {practitioners.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Visit</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Headache, Annual Checkup..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="start"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                    <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="end"
            render={({ field }) => (
                <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                    <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Booking...' : 'Book Appointment'}
        </Button>
      </form>
    </Form>
  );
}
