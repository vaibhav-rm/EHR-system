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
            const doc = await fhirStore.getResource('Practitioner', docId) as Practitioner | null;
            return { ...appt, doctorName: doc && doc.name ? `Dr. ${doc.name[0].family}` : 'Unknown Doctor' };
        }
        return appt;
    }));

    return enriched.sort((a: any, b: any) => new Date(b.start).getTime() - new Date(a.start).getTime());
}

export async function getDoctorAppointments(doctorId: string, date?: string) {
    if (!doctorId) return [];
    let appointments = await fhirStore.findAppointmentsByPractitioner(doctorId);

    if (date) {
        appointments = appointments.filter((appt: any) => appt.start.startsWith(date));
    }

    // Enrich with Patient Names
    const enriched = await Promise.all(appointments.map(async (appt: any) => {
        const patRef = appt.participant?.find((p: any) => p.actor.reference.startsWith('Patient'));
        if (patRef) {
            const patId = patRef.actor.reference.split('/')[1];
            const pat = await fhirStore.getResource('Patient', patId) as any | null;
            return {
                ...appt,
                patient: {
                    name: pat && pat.name ? (pat.name[0].text || `${pat.name[0].given?.[0]} ${pat.name[0].family}`) : 'Unknown Patient',
                    patient_id: patId,
                    blood_type: pat?.extension?.find((e: any) => e.url === 'http://example.org/fhir/blood-type')?.valueString || 'N/A'
                },
                patientName: pat && pat.name ? (pat.name[0].text || `${pat.name[0].given?.[0]} ${pat.name[0].family}`) : 'Unknown Patient'
            };
        }
        return appt;
    }));

    return enriched.sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime());
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

        await fhirStore.createMedicationRequest(prescription);

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
    const meds = await fhirStore.findMedicationsByPatient(patientId);
    // Enrich with Doctor Name
    return Promise.all(meds.map(async (m: any) => {
        const docRef = m.requester?.reference;
        let doctorName = 'Unknown Doctor';
        if (docRef) {
            const docId = docRef.split('/')[1];
            const doc = await fhirStore.getResource('Practitioner', docId) as Practitioner | null;
            if (doc && doc.name) doctorName = `Dr. ${doc.name[0].family}`;
        }
        return { ...m, doctorName };
    }));
}

export async function getDoctorPrescriptions(doctorId: string) {
    if (!doctorId) return [];
    const meds = await fhirStore.findMedicationsByPractitioner(doctorId);
    // Enrich with Patient Name
    return Promise.all(meds.map(async (m: any) => {
        const patRef = m.subject?.reference;
        let patientName = 'Unknown Patient';
        if (patRef) {
            const patId = patRef.split('/')[1];
            const pat = await fhirStore.getResource('Patient', patId) as Patient | null;
            if (pat && pat.name) patientName = `${pat.name[0].given?.[0]} ${pat.name[0].family}`;
        }
        return { ...m, patientName };
    }));
}
export async function getDoctorDashboardData(doctorId: string) {
    if (!doctorId) return { stats: { todayCount: 0, totalPatients: 0, totalReports: 0, completedToday: 0 }, appointments: [] };

    const appointments = await fhirStore.findAppointmentsByPractitioner(doctorId);
    const today = new Date().toISOString().split('T')[0];

    const todayAppts = appointments.filter((a: any) => a.start.startsWith(today));
    const completedToday = todayAppts.filter((a: any) => a.status === 'completed').length;

    // Fetch unique patients for this doctor
    const uniquePatientIds = new Set();
    appointments.forEach((a: any) => {
        const patRef = a.participant.find((p: any) => p.actor.reference.startsWith('Patient'));
        if (patRef) uniquePatientIds.add(patRef.actor.reference.split('/')[1]);
    });

    // Also check medications prescribed by this doctor to find patients
    const meds = await fhirStore.findMedicationsByPractitioner(doctorId);
    meds.forEach((m: any) => {
        if (m.subject?.reference?.startsWith('Patient/')) {
            uniquePatientIds.add(m.subject.reference.split('/')[1]);
        }
    });

    // Enrich today's appointments with patient names
    const enrichedToday = await Promise.all(todayAppts.map(async (appt: any) => {
        const patRef = appt.participant.find((p: any) => p.actor.reference.startsWith('Patient'));
        if (patRef) {
            const patId = patRef.actor.reference.split('/')[1];
            const pat = await fhirStore.getResource('Patient', patId) as Patient | null;
            return {
                ...appt,
                patient: {
                    name: pat && pat.name ? `${pat.name[0].given?.[0]} ${pat.name[0].family}` : 'Unknown Patient',
                    id: patId
                }
            };
        }
        return appt;
    }));

    return {
        stats: {
            todayCount: todayAppts.length,
            totalPatients: uniquePatientIds.size,
            totalReports: meds.length, // Using prescriptions as a proxy for "reports/actions" for now
            completedToday
        },
        appointments: enrichedToday.sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime())
    };
}

export async function getDoctorPatients(doctorId: string) {
    if (!doctorId) return [];

    // Synthesize patients from appointments and prescriptions
    const appointments = await fhirStore.findAppointmentsByPractitioner(doctorId);
    const meds = await fhirStore.findMedicationsByPractitioner(doctorId);

    const patientMap = new Map();

    const processPatient = async (patientRef: string, date: string) => {
        if (!patientRef || !patientRef.startsWith('Patient/')) return;
        const patientId = patientRef.split('/')[1];

        if (!patientMap.has(patientId)) {
            const pat = await fhirStore.getResource('Patient', patientId) as Patient | null;
            patientMap.set(patientId, {
                id: patientId,
                patientId: patientId, // FHIR id
                name: pat && pat.name?.[0] ? `${pat.name[0].given?.[0] || ''} ${pat.name[0].family || ''}` : 'Unknown Patient',
                gender: (pat as any)?.gender || 'N/A',
                blood_type: 'N/A',
                phone: pat?.telecom?.find(t => t.system === 'phone')?.value || 'N/A',
                date_of_birth: (pat as any)?.birthDate || null,
                total_visits: 0,
                last_visit_date: date,
                first_visit_date: date,
            });
        }

        const p = patientMap.get(patientId);
        p.total_visits += 1;
        if (new Date(date) > new Date(p.last_visit_date)) p.last_visit_date = date;
        if (new Date(date) < new Date(p.first_visit_date)) p.first_visit_date = date;
    };

    for (const appt of appointments) {
        const patRef = appt.participant?.find((p: any) => p.actor.reference.startsWith('Patient'))?.actor.reference;
        if (patRef) await processPatient(patRef, appt.start);
    }

    for (const m of meds) {
        if (m.subject?.reference) await processPatient(m.subject.reference, m.authoredOn || m.created || new Date().toISOString());
    }

    return Array.from(patientMap.values()).map(p => ({
        id: p.id,
        patient_id: p.id,
        doctor_id: doctorId,
        last_visit_date: p.last_visit_date,
        first_visit_date: p.first_visit_date,
        total_visits: p.total_visits,
        patient: {
            name: p.name,
            patient_id: p.id.substring(0, 8),
            gender: p.gender,
            blood_type: p.blood_type,
            phone: p.phone,
            date_of_birth: p.date_of_birth
        }
    }));
}

export async function getPatientDetailStats(patientId: string, doctorId: string) {
    const appointments = await fhirStore.findAppointmentsByPractitioner(doctorId);
    const meds = await fhirStore.findMedicationsByPatient(patientId);

    const patientAppts = appointments.filter(a => a.participant?.some((p: any) => p.actor.reference === `Patient/${patientId}`));

    return {
        reportsCount: meds.length,
        appointmentsCount: patientAppts.length
    };
}
export async function searchPatientById(patientIdentifier: string) {
    if (!patientIdentifier) return null;

    // In our simplified store, patientIdentifier is usually the resource ID or part of it
    // Let's try to find by ID exactly or search
    const results = await fhirStore.search('Patient', (p: any) =>
        p.id === patientIdentifier ||
        p.identifier?.some((id: any) => id.value === patientIdentifier) ||
        p.id.startsWith(patientIdentifier.toLowerCase())
    );

    return results.length > 0 ? results[0] : null;
}

export async function saveDiagnosticReport(data: {
    patientId: string,
    doctorId: string,
    type: string,
    ehrData: any,
    reportDate: string,
    labName: string
}) {
    const report = {
        resourceType: 'DiagnosticReport',
        status: 'final',
        category: [{
            coding: [{
                system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
                code: 'LAB',
                display: 'Laboratory'
            }]
        }],
        code: {
            text: data.type
        },
        subject: { reference: `Patient/${data.patientId}` },
        performer: [{ reference: `Practitioner/${data.doctorId}` }],
        effectiveDateTime: data.reportDate,
        issued: new Date().toISOString(),
        conclusion: data.ehrData.impression || data.ehrData.conclusion || 'Report processed',
        result: [], // Would hold observations in a full implementation
        extension: [
            {
                url: 'http://example.org/fhir/lab-name',
                valueString: data.labName
            }
        ],
        // Store the raw ehrData in a contained resource or just as a part of this resource
        text: {
            status: 'generated',
            div: `<div xmlns="http://www.w3.org/1999/xhtml">${JSON.stringify(data.ehrData)}</div>`
        }
    };

    try {
        await fhirStore.create(report);
        revalidatePath(`/dashboard/patient/labs`);
        return { success: true, message: 'Report saved successfully' };
    } catch (e) {
        console.error("Save Report Error:", e);
        return { success: false, message: 'Failed to save report' };
    }
}
export async function getAppointmentContextData(appointmentId: string, doctorId: string) {
    if (!appointmentId) return null;

    const appointment = await fhirStore.getResource('Appointment', appointmentId);
    if (!appointment) return null;

    const patRef = (appointment as any).participant?.find((p: any) => p.actor.reference.startsWith('Patient'))?.actor.reference;
    if (!patRef) return { appointment };

    const patientId = patRef.split('/')[1];
    const patient = await fhirStore.getResource('Patient', patientId);

    // Fetch reports
    const reports = await fhirStore.search('DiagnosticReport', (r: any) => r.subject?.reference === `Patient/${patientId}`);

    // Fetch medications
    const meds = await fhirStore.findMedicationsByPatient(patientId);

    // Fetch past appointments
    const allDocAppts = await fhirStore.findAppointmentsByPractitioner(doctorId);
    const pastAppointments = allDocAppts.filter((a: any) =>
        a.id !== appointmentId &&
        a.status === 'completed' &&
        a.participant?.some((p: any) => p.actor.reference === `Patient/${patientId}`)
    );

    return {
        appointment,
        patient,
        reports: reports.map((r: any) => ({
            id: r.id,
            report_type: r.code?.text || 'Lab Report',
            status: r.status,
            lab_name: r.extension?.find((e: any) => e.url === 'http://example.org/fhir/lab-name')?.valueString || 'MedSense Lab',
            report_date: r.effectiveDateTime,
            summary: r.conclusion
        })),
        medicines: meds.map((m: any) => ({
            id: m.id,
            medicine_name: m.medicationCodeableConcept?.text || 'Unknown Medicine',
            dosage: m.dosageInstruction?.[0]?.doseAndRate?.[0]?.type?.text || 'N/A',
            dosage_unit: '',
            frequency: m.dosageInstruction?.[0]?.text || 'N/A',
            instructions: m.dosageInstruction?.[0]?.patientInstruction || ''
        })),
        pastAppointments: pastAppointments.map((a: any) => ({
            id: a.id,
            scheduled_date: a.start,
            reason: a.description,
            summary: a.note?.[0]?.text
        }))
    };
}

export async function updateAppointmentSummary(appointmentId: string, summary: string) {
    const appointment = await fhirStore.getResource('Appointment', appointmentId);
    if (!appointment) return { success: false };

    const updated = {
        ...appointment,
        status: 'completed',
        note: [{ text: summary }]
    };

    try {
        await fhirStore.update(appointmentId, updated);
        revalidatePath(`/doctor/attend/${appointmentId}`);
        revalidatePath(`/doctor`);
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}
