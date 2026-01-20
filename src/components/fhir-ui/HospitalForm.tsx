
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OrganizationSchema, OrganizationFormData } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Organization } from 'fhir/r4';

export function HospitalForm() {
  const queryClient = useQueryClient();
  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(OrganizationSchema),
    defaultValues: {
      resourceType: 'Organization',
      name: '',
      telecom: [{ system: 'phone', value: '' }]
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: OrganizationFormData) => {
      const res = await fetch('/api/fhir/Organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create organization');
      return res.json() as Promise<Organization>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      form.reset();
    }
  });

  function onSubmit(data: OrganizationFormData) {
    // Ensure array structure is correct for FHIR
    const fhirData = {
        ...data,
        active: true,
        type: [{ text: 'Hospital' }]
    };
    mutation.mutate(fhirData);
  }

  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Register New Hospital</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hospital Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. General Hospital" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

           <FormField
            control={form.control}
            name="telecom.0.value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1 555-0123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Registering...' : 'Register Hospital'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
