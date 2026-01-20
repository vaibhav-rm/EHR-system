'use server';

import { fhirStore } from '@/lib/fhir-store';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Patient, Practitioner } from 'fhir/r4';

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

        await fhirStore.create(appointment);

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
    const appointments = await fhirStore.search('Appointment', (item: any) =>
        item.participant?.some((p: any) => p.actor?.reference === `Patient/${patientId}`)
    );

    // Enrich with Doctor Names
    const enriched = await Promise.all(appointments.map(async (appt: any) => {
        const docRef = appt.participant.find((p: any) => p.actor.reference.startsWith('Practitioner'));
        if (docRef) {
            const docId = docRef.actor.reference.split('/')[1];
            // Helper to get resource by ID (we can implement a get method or search by id)
            const docs = await fhirStore.search('Practitioner', (item: any) => item.id === docId);
            const doc = docs[0] as Practitioner | undefined;
            return { ...appt, doctorName: doc && doc.name ? `Dr. ${doc.name[0].family}` : 'Unknown Doctor' };
        }
        return appt;
    }));

    return enriched.sort((a: any, b: any) => new Date(b.start).getTime() - new Date(a.start).getTime());
}

export async function getDoctorAppointments(doctorId: string) {
    if (!doctorId) return [];
    const appointments = await fhirStore.search('Appointment', (item: any) =>
        item.participant?.some((p: any) => p.actor?.reference === `Practitioner/${doctorId}`)
    );
    // Enrich with Patient Names
    const enriched = await Promise.all(appointments.map(async (appt: any) => {
        const patRef = appt.participant.find((p: any) => p.actor.reference.startsWith('Patient'));
        if (patRef) {
            const patId = patRef.actor.reference.split('/')[1];
            const pats = await fhirStore.search('Patient', (item: any) => item.id === patId);
            const pat = pats[0] as Patient | undefined;
            return { ...appt, patientName: pat && pat.name ? pat.name[0].given?.[0] + ' ' + pat.name[0].family : 'Unknown Patient' };
        }
        return appt;
    }));

    return enriched.sort((a: any, b: any) => new Date(b.start).getTime() - new Date(a.start).getTime());
}

// --- PRESCRIPTIONS ---

const PrescriptionSchema = z.object({
    patientId: z.string(),
    medicationName: z.string(),
    dosage: z.string(),
    instructions: z.string(),
    doctorId: z.string(),
});

export async function createPrescription(prevState: any, formData: FormData) {
    try {
        const validatedFields = PrescriptionSchema.safeParse({
            patientId: formData.get('patientId'),
            medicationName: formData.get('medicationName'),
            dosage: formData.get('dosage'),
            instructions: formData.get('instructions'),
            doctorId: formData.get('doctorId'),
        });

        if (!validatedFields.success) {
            return { message: 'Invalid inputs', errors: validatedFields.error.flatten().fieldErrors };
        }

        const { patientId, medicationName, dosage, instructions, doctorId } = validatedFields.data;

        // FHIR MedicationRequest
        const prescription = {
            resourceType: 'MedicationRequest',
            status: 'active',
            intent: 'order',
            medicationCodeableConcept: {
                text: medicationName
            },
            subject: { reference: `Patient/${patientId}` },
            requester: { reference: `Practitioner/${doctorId}` },
            dosageInstruction: [
                {
                    text: instructions,
                    doseAndRate: [{
                        type: { text: dosage }
                    }]
                }
            ],
            authoredOn: new Date().toISOString(),
        };

        await fhirStore.create(prescription);

        revalidatePath('/dashboard/doctor/medications');
        revalidatePath('/dashboard/patient/medications');
        revalidatePath('/dashboard/patient'); // Update dashboard list too

        return { message: 'Prescription sent successfully!', success: true };

    } catch (error) {
        console.error("Prescription Error:", error);
        return { message: 'Failed to create prescription' };
    }
}

export async function getPatientPrescriptions(patientId: string) {
    if (!patientId) return [];
    const meds = await fhirStore.search('MedicationRequest', (item: any) =>
        item.subject?.reference === `Patient/${patientId}`
    );
    // Enrich with Doctor Name
    return Promise.all(meds.map(async (m: any) => {
        const docRef = m.requester?.reference;
        let doctorName = 'Unknown Doctor';
        if (docRef) {
            const docId = docRef.split('/')[1];
            const docs = await fhirStore.search('Practitioner', (item: any) => item.id === docId);
            const doc = docs[0] as Practitioner | undefined;
            if (doc && doc.name) doctorName = `Dr. ${doc.name[0].family}`;
        }
        return { ...m, doctorName };
    }));
}

export async function getDoctorPrescriptions(doctorId: string) {
    if (!doctorId) return [];
    const meds = await fhirStore.search('MedicationRequest', (item: any) =>
        item.requester?.reference === `Practitioner/${doctorId}`
    );
    // Enrich with Patient Name
    return Promise.all(meds.map(async (m: any) => {
        const patRef = m.subject?.reference;
        let patientName = 'Unknown Patient';
        if (patRef) {
            const patId = patRef.split('/')[1];
            const pats = await fhirStore.search('Patient', (item: any) => item.id === patId);
            const pat = pats[0] as Patient | undefined;
            if (pat && pat.name) patientName = `${pat.name[0].given?.[0]} ${pat.name[0].family}`;
        }
        return { ...m, patientName };
    }));
}
