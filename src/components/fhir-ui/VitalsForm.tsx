'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ObservationSchema, ObservationFormData } from '@/lib/schemas';
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

interface VitalsFormProps {
  patientId: string;
  onSuccess?: () => void;
}

// Simplified schema for the form UI (wrapper around the complex raw Observation schema)
// In a real app we might construct multiple Observations from one form submission
// For this demo, we will let the user select ONE type of observation to enter

const VITAL_TYPES = [
    { code: '85354-9', display: 'Blood Pressure', unit: 'mmHg' },
    { code: '8867-4', display: 'Heart Rate', unit: 'bpm' },
    { code: '8310-5', display: 'Body Temperature', unit: 'degF' },
    { code: '9279-1', display: 'Respiratory Rate', unit: 'breaths/min' },
    { code: '29463-7', display: 'Body Weight', unit: 'kg' },
];

export function VitalsForm({ patientId, onSuccess }: VitalsFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<ObservationFormData>({
    resolver: zodResolver(ObservationSchema),
    defaultValues: {
      resourceType: 'Observation',
      status: 'final',
      code: {
          coding: [{ system: 'http://loinc.org', code: '', display: '' }],
          text: ''
      },
      subject: { reference: `Patient/${patientId}` },
      valueQuantity: { value: 0, unit: '', system: 'http://unitsofmeasure.org', code: '' },
      effectiveDateTime: new Date().toISOString() // Default to now
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ObservationFormData) => {
      const res = await fetch('/api/fhir/Observation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to save vitals');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Vitals recorded successfully');
      queryClient.invalidateQueries({ queryKey: ['observations'] });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  function onSubmit(data: ObservationFormData) {
      // Ensure date provided is ISO
      const payload = {
          ...data,
          effectiveDateTime: new Date().toISOString()
      };
      mutation.mutate(payload);
  }

  // Helper to update the coding + unit based on selection
  const handleTypeChange = (codeValue: string) => {
      const selected = VITAL_TYPES.find(t => t.code === codeValue);
      if (selected) {
          form.setValue('code.coding.0.code', selected.code);
          form.setValue('code.coding.0.display', selected.display);
          form.setValue('code.text', selected.display);
          form.setValue('valueQuantity.unit', selected.unit);
          form.setValue('valueQuantity.code', selected.unit); 
      }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <FormField
            control={form.control}
            name="code.coding.0.code"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Vital Sign Type</FormLabel>
                <Select onValueChange={(val) => {
                    field.onChange(val);
                    handleTypeChange(val);
                }}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select vital sign" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {VITAL_TYPES.map(t => (
                            <SelectItem key={t.code} value={t.code}>{t.display}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
        />

        <div className="flex gap-4 items-end">
            <FormField
            control={form.control}
            name="valueQuantity.value"
            render={({ field }) => (
                <FormItem className="flex-1">
                <FormLabel>Value</FormLabel>
                <FormControl>
                    {/* Zod expects number, so simple cast on change */}
                    <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value))} 
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            
            <div className="pb-3 text-sm font-medium text-muted-foreground">
                {form.watch('valueQuantity.unit') || 'Unit'}
            </div>
        </div>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : 'Record Vitals'}
        </Button>
      </form>
    </Form>
  );
}
