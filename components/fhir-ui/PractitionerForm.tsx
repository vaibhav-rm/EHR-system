
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PractitionerSchema, PractitionerFormData } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Practitioner } from 'fhir/r4';

export function PractitionerForm() {
  const queryClient = useQueryClient();
  const form = useForm<PractitionerFormData>({
    resolver: zodResolver(PractitionerSchema),
    defaultValues: {
      resourceType: 'Practitioner',
      name: [{ family: '', given: [''] }],
      telecom: [{ system: 'email', value: '' }]
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: PractitionerFormData) => {
      const res = await fetch('/api/fhir/Practitioner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create practitioner');
      return res.json() as Promise<Practitioner>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practitioners'] });
      form.reset();
    }
  });

  function onSubmit(data: PractitionerFormData) {
    mutation.mutate(data);
  }

  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Register New Doctor</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name.0.given.0"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="name.0.family"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="doctor@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Registering...' : 'Register Doctor'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
