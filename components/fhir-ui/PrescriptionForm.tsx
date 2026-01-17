'use client';

import { useFormStatus } from 'react-dom';
import { createPrescription } from '@/app/actions/clinical';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Mock Patient List (In real app, doctor searches for patient)
const PATIENTS = [
    { id: 'patient-123', name: 'John Doe' },
    { id: 'patient-456', name: 'Jane Smith' },
    { id: 'patient-789', name: 'Robert Brown' },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Sending...' : 'Send Prescription'}
    </Button>
  );
}

export function PrescriptionForm({ doctorId }: { doctorId: string }) {
    
    async function clientAction(formData: FormData) {
        const result = await createPrescription(null, formData);
        if (result?.errors) {
            toast.error("Please fix the errors");
        } else if (result?.success) {
            toast.success(result.message);
            // reset form logic here if needed (e.g. by key change or ref)
        } else if (result?.message) {
             toast.error(result.message);
        }
    }

    return (
        <form action={clientAction} className="space-y-4">
            <input type="hidden" name="doctorId" value={doctorId} />
            
            <div className="space-y-2">
                <Label>Select Patient</Label>
                <Select name="patientId" required>
                    <SelectTrigger>
                        <SelectValue placeholder="Search patient..." />
                    </SelectTrigger>
                    <SelectContent>
                        {PATIENTS.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                                {p.name} (ID: {p.id.slice(0,4)})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Medication Name</Label>
                <Input name="medicationName" placeholder="e.g. Amoxicillin" required />
            </div>

            <div className="flex gap-4">
                <div className="space-y-2 flex-1">
                    <Label>Dosage</Label>
                    <Input name="dosage" placeholder="500mg" required />
                </div>
                {/* Could add Frequency here */}
            </div>

            <div className="space-y-2">
                <Label>Instructions</Label>
                <Textarea 
                    name="instructions" 
                    placeholder="Take one tablet three times a day after food..." 
                    required 
                />
            </div>

            <SubmitButton />
        </form>
    );
}
