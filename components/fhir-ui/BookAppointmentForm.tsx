'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { bookAppointment } from '@/app/actions/clinical';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Mock Doctors for Demo (In real app, we fetch this)
const DOCTORS = [
    { id: 'practitioner-1', name: 'Dr. Sarah Wilson', spec: 'General Physician' },
    { id: 'practitioner-2', name: 'Dr. James Chen', spec: 'Cardiologist' },
    { id: 'practitioner-3', name: 'Dr. Emily Brooks', spec: 'Pediatrician' },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Booking...' : 'Confirm Booking'}
    </Button>
  );
}

export function BookAppointmentForm({ patientId }: { patientId: string }) {
    // We need to handle the action result manually since useActionState isn't available in all next versions yet or used differently
    // Here we use a simple form action wrapper
    
    async function clientAction(formData: FormData) {
        const result = await bookAppointment(null, formData);
        if (result?.errors) {
            toast.error(result.message || "Failed to book");
        } else if (result?.success) {
            toast.success(result.message);
            // Close dialog? We might need a prop to close it.
        } else if (result?.message && !result.success) {
             toast.error(result.message);
        }
    }

    return (
        <form action={clientAction} className="space-y-4 py-4">
            <input type="hidden" name="patientId" value={patientId} />
            
            <div className="space-y-2">
                <Label>Select Doctor</Label>
                <Select name="doctorId" required>
                    <SelectTrigger>
                        <SelectValue placeholder="Choose a specialist" />
                    </SelectTrigger>
                    <SelectContent>
                        {DOCTORS.map(doc => (
                            <SelectItem key={doc.id} value={doc.id}>
                                {doc.name} - {doc.spec}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Date & Time</Label>
                <Input 
                    type="datetime-local" 
                    name="date" 
                    required 
                    min={new Date().toISOString().slice(0, 16)}
                />
            </div>

            <div className="space-y-2">
                <Label>Reason for Visit</Label>
                <Textarea 
                    name="reason" 
                    placeholder="Describe your symptoms (e.g., fever, headache)..." 
                    required 
                />
            </div>

            <SubmitButton />
        </form>
    );
}
