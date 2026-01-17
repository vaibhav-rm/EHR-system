'use server';

import { fhirStore } from '@/lib/fhir-store';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const BookAppointmentSchema = z.object({
    patientId: z.string(),
    doctorId: z.string(),
    date: z.string(), // ISO String
    reason: z.string(),
});

export async function bookAppointment(prevState: any, formData: FormData) {
    try {
        const validatedFields = BookAppointmentSchema.safeParse({
            patientId: formData.get('patientId'),
            doctorId: formData.get('doctorId'),
            date: formData.get('date'),
            reason: formData.get('reason'),
        });

        if (!validatedFields.success) {
            return {
                message: 'Invalid fields. Failed to book appointment.',
                errors: validatedFields.error.flatten().fieldErrors
            };
        }

        const { patientId, doctorId, date, reason } = validatedFields.data;

        // Create FHIR Appointment Resource
        const appointment = {
            resourceType: 'Appointment',
            status: 'booked',
            start: date,
            end: new Date(new Date(date).getTime() + 30 * 60000).toISOString(), // 30 min duration
            description: reason,
            participant: [
                {
                    actor: { reference: `Patient/${patientId}` },
                    status: 'accepted'
                },
                {
                    actor: { reference: `Practitioner/${doctorId}` },
                    status: 'needs-action'
                }
            ],
            created: new Date().toISOString(),
        };

        await fhirStore.createAppointment(appointment);

        revalidatePath('/dashboard/patient/appointments');
        revalidatePath('/dashboard/doctor/appointments');

        return { message: 'Appointment booked successfully!', success: true };
    } catch (error) {
        console.error('Failed to book appointment:', error);
        return { message: 'Database Error: Failed to book appointment.' };
    }
}

export async function getPatientAppointments(patientId: string) {
    if (!patientId) return [];
    const appointments = await fhirStore.findAppointmentsByPatient(patientId);

    // Enrich with Doctor Names
    const enriched = await Promise.all(appointments.map(async (appt: any) => {
        const docRef = appt.participant.find((p: any) => p.actor.reference.startsWith('Practitioner'));
        if (docRef) {
            const docId = docRef.actor.reference.split('/')[1];
            // In a real app we'd fetch the doctor details. For now we mock or query if possible
            // We can query the store for Practitioner if we had that method exposed properly or generic get
            const doc = await fhirStore.getResource('Practitioner', docId);
            return { ...appt, doctorName: doc ? `Dr. ${doc.name[0].family}` : 'Unknown Doctor' };
        }
        return appt;
    }));

    return enriched.sort((a: any, b: any) => new Date(b.start).getTime() - new Date(a.start).getTime());
}

export async function getDoctorAppointments(doctorId: string) {
    if (!doctorId) return [];
    const appointments = await fhirStore.findAppointmentsByPractitioner(doctorId);
    // Enrich with Patient Names
    const enriched = await Promise.all(appointments.map(async (appt: any) => {
        const patRef = appt.participant.find((p: any) => p.actor.reference.startsWith('Patient'));
        if (patRef) {
            const patId = patRef.actor.reference.split('/')[1];
            const pat = await fhirStore.getResource('Patient', patId);
            return { ...appt, patientName: pat ? pat.name[0].given[0] + ' ' + pat.name[0].family : 'Unknown Patient' };
        }
        return appt;
    }));

    return enriched.sort((a: any, b: any) => new Date(b.start).getTime() - new Date(a.start).getTime());
}
