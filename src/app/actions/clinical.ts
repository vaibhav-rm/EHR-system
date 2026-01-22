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

    // Enrich with Doctor Names and Calc Status
    const enriched = await Promise.all(appointments.map(async (appt: any) => {
        let doctorName = 'Unknown Doctor';
        const docRef = appt.participant.find((p: any) => p.actor.reference.startsWith('Practitioner'));
        if (docRef) {
            const docId = docRef.actor.reference.split('/')[1];
            // Helper to get resource by ID (we can implement a get method or search by id)
            const docs = await fhirStore.search('Practitioner', (item: any) => item.id === docId);
            const doc = docs[0] as Practitioner | undefined;
            if (doc && doc.name) doctorName = `Dr. ${doc.name[0].family}`;
        }

        const status = (() => {
            if (appt.status === 'booked' || appt.status === 'scheduled') {
                const apptTime = new Date(appt.start).getTime();
                const now = new Date().getTime();
                if (apptTime < now) return 'missed';
            }
            return appt.status;
        })();

        return { ...appt, doctorName, status };
    }));

    return enriched.sort((a: any, b: any) => new Date(b.start).getTime() - new Date(a.start).getTime());
}

export async function getDoctorAppointments(doctorId: string) {
    if (!doctorId) return [];
    const appointments = await fhirStore.search('Appointment', (item: any) =>
        item.participant?.some((p: any) => p.actor?.reference === `Practitioner/${doctorId}`)
    );
    // Enrich with Patient Details
    const enriched = await Promise.all(appointments.map(async (appt: any) => {
        const patRef = appt.participant.find((p: any) => p.actor.reference.startsWith('Patient'));
        if (patRef) {
            const patId = patRef.actor.reference.split('/')[1];
            const pats = await fhirStore.search('Patient', (item: any) => item.id === patId);
            const pat = pats[0] as Patient | undefined;

            // Construct patient object matching frontend expectations
            const patientData = pat ? {
                name: pat.name?.[0] ? `${pat.name[0].given?.[0] || ''} ${pat.name[0].family || ''}`.trim() : 'Unknown Patient',
                patient_id: pat.id,
                blood_type: (pat as any).blood_type || 'N/A',
                gender: pat.gender,
                date_of_birth: pat.birthDate,
                phone: pat.telecom?.find((t: any) => t.system === 'phone')?.value,
                allergies: (pat as any).allergies || [],
                chronic_conditions: (pat as any).chronic_conditions || []
            } : undefined;

            return {
                ...appt,
                // Map FHIR fields to frontend props where direct mapping isn't enough
                scheduled_date: appt.start?.split('T')[0],
                scheduled_time: appt.start?.split('T')[1]?.substring(0, 5),
                duration_minutes: 30, // Default or calc from start/end
                reason: appt.description,
                status: (() => {
                    if (appt.status === 'booked' || appt.status === 'scheduled') {
                        const apptTime = new Date(appt.start).getTime();
                        const now = new Date().getTime();
                        // If 30 mins past start time and still booked, mark as missed/no-show
                        // Or just if start time is past. Let's say if start time is past by 15 mins.
                        if (apptTime < now) return 'missed';
                    }
                    return appt.status;
                })(),
                patient: patientData,
                patientName: patientData?.name
            };
        }
        return appt;
    }));

    return enriched.sort((a: any, b: any) => new Date(b.start).getTime() - new Date(a.start).getTime());
}

// --- PRESCRIPTIONS ---

// --- PRESCRIPTIONS ---

const PrescriptionSchema = z.object({
    patientId: z.string(),
    medicationName: z.string(),
    dosageAmount: z.string(),
    dosageUnit: z.string(),
    frequency: z.string(),
    route: z.string(),
    durationDays: z.string().optional(),
    instructions: z.string().optional(),
    doctorId: z.string(),
});

export async function createPrescription(prevState: any, formData: FormData) {
    try {
        const validatedFields = PrescriptionSchema.safeParse({
            patientId: formData.get('patientId'),
            medicationName: formData.get('medicationName'),
            dosageAmount: formData.get('dosageAmount'),
            dosageUnit: formData.get('dosageUnit'),
            frequency: formData.get('frequency'),
            route: formData.get('route'),
            durationDays: formData.get('durationDays') || undefined,
            instructions: formData.get('instructions') || undefined,
            doctorId: formData.get('doctorId'),
        });

        if (!validatedFields.success) {
            return { message: 'Invalid inputs', errors: validatedFields.error.flatten().fieldErrors };
        }

        const { patientId, medicationName, dosageAmount, dosageUnit, frequency, route, durationDays, instructions, doctorId } = validatedFields.data;

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
                    text: instructions || frequency, // Fallback/Summary text
                    timing: {
                        code: { text: frequency }
                    },
                    route: {
                        text: route
                    },
                    doseAndRate: [{
                        doseQuantity: {
                            value: Number(dosageAmount) || 0,
                            unit: dosageUnit
                        }
                    }],
                    // Storing duration if possible, FHIR uses 'timing.repeat.duration' but let's just stick to easy shim
                    additionalInstruction: [
                        { text: durationDays ? `${durationDays} days` : undefined }
                    ]
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
    // Enrich with Doctor Name and map to Medicine interface
    return Promise.all(meds.map(async (m: any) => {
        const docRef = m.requester?.reference;
        let doctorName = 'Unknown Doctor';
        if (docRef) {
            const docId = docRef.split('/')[1];
            const docs = await fhirStore.search('Practitioner', (item: any) => item.id === docId);
            const doc = docs[0] as Practitioner | undefined;
            if (doc && doc.name) doctorName = `Dr. ${doc.name[0].family}`;
        }

        // Map FHIR MedicationRequest to Medicine interface
        const dosageInstr = m.dosageInstruction?.[0];
        const doseQty = dosageInstr?.doseAndRate?.[0]?.doseQuantity;

        return {
            id: m.id,
            patient_id: patientId,
            doctor_id: m.requester?.reference?.split('/')[1],
            medicine_name: m.medicationCodeableConcept?.text || "Unknown Medicine",
            dosage: doseQty?.value ? doseQty.value.toString() : (dosageInstr?.doseAndRate?.[0]?.type?.text || ""), // Fallback to old text field
            dosage_unit: doseQty?.unit || "",
            frequency: dosageInstr?.timing?.code?.text || "",
            route: dosageInstr?.route?.text || "",
            instructions: dosageInstr?.text || "",
            // Extract duration from additionalInstruction shim or text
            duration_days: dosageInstr?.additionalInstruction?.[0]?.text ? parseInt(dosageInstr.additionalInstruction[0].text) : undefined,

            // Booleans not stored currently, default to false
            morning_dose: false,
            afternoon_dose: false,
            evening_dose: false,
            night_dose: false,
            before_food: false,
            is_active: m.status === 'active',
            created_at: m.authoredOn || new Date().toISOString(),
            doctorName
        };
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

export async function getPatientReports(patientId: string) {
    if (!patientId) return [];
    return fhirStore.search('DiagnosticReport', (item: any) =>
        item.subject?.reference === `Patient/${patientId}`
    );
}

// --- NEW ACTIONS FOR REFACTORING ---

export async function getAppointment(appointmentId: string) {
    if (!appointmentId) return null;
    const appts = await fhirStore.search('Appointment', (item: any) => item.id === appointmentId);
    const appt = appts[0];
    if (!appt) return null;

    // Enrich with Patient
    const patRef = appt.participant?.find((p: any) => p.actor?.reference?.startsWith('Patient'));
    let patient = null;
    if (patRef) {
        const patId = patRef.actor.reference.split('/')[1];
        const pats = await fhirStore.search('Patient', (item: any) => item.id === patId);
        const p = pats[0];
        if (p) {
            patient = {
                name: p.name?.[0] ? `${p.name[0].given?.[0] || ''} ${p.name[0].family || ''}`.trim() : 'Unknown Patient',
                patient_id: p.id,
                date_of_birth: p.birthDate,
                gender: p.gender,
                blood_type: 'N/A', // Placeholder
                phone: p.telecom?.find((t: any) => t.system === 'phone')?.value,
                allergies: [], // Would need to fetch AllergyIntolerance resources
                chronic_conditions: [] // Would need Condition resources
            };
        }
    }

    return {
        ...appt,
        patient_id: patient?.patient_id,
        patient,
        scheduled_date: appt.start?.split('T')[0],
        scheduled_time: appt.start?.split('T')[1]?.substring(0, 5),
        reason: appt.description,
        summary: appt.comment // Map comment to summary
    };
}

export async function updateAppointment(appointmentId: string, updates: any) {
    const existing = await getAppointment(appointmentId);
    if (!existing) return { error: 'Appointment not found' };

    const updatedResource = {
        ...existing,
        status: updates.status || existing.status,
        comment: updates.summary || existing.comment, // Map summary to comment
    };

    // Remove enriched fields before saving back if they confuse the store (though store mostly ignores extras or we can strip them)
    // Ideally we should fetch the raw resource, update it, and save.
    // For now, let's assume fhirStore.update handles it or we re-fetch raw.
    // Re-fetch raw to be safe:
    const rawAppts = await fhirStore.search('Appointment', (item: any) => item.id === appointmentId);
    if (!rawAppts[0]) return { error: 'Appointment not found' };

    const toSave = {
        ...rawAppts[0],
        status: updates.status || rawAppts[0].status,
        comment: updates.summary || rawAppts[0].comment
    };

    await fhirStore.update(appointmentId, toSave);
    revalidatePath(`/doctor/attend/${appointmentId}`);
    return { success: true };
}

export async function createReport(reportData: any) {
    try {
        console.log("[createReport] Called with:", JSON.stringify(reportData, null, 2));

        // Fetch doctor details to enrich the report
        let doctorName = 'Unknown Doctor';
        let hospitalName = 'MedSense Hospital';

        if (reportData.doctor_id) {
            console.log(`[createReport] Searching for doctor: ${reportData.doctor_id}`);
            const doctors = await fhirStore.search('Practitioner', (p: any) => p.id === reportData.doctor_id);
            const doc = doctors[0];
            if (doc) {
                console.log("[createReport] Doctor found:", doc.name?.[0]?.family);
                doctorName = doc.name?.[0] ? `${doc.name[0].given?.[0] || ''} ${doc.name[0].family || ''}`.trim() : 'Unknown Doctor';
                hospitalName = (doc as any).hospital || 'MedSense Hospital';
            } else {
                console.warn("[createReport] Doctor NOT found for ID:", reportData.doctor_id);
            }
        } else {
            console.warn("[createReport] No doctor_id provided in reportData");
        }

        const report = {
            resourceType: 'DiagnosticReport',
            status: 'final',
            code: { text: reportData.report_type },
            subject: { reference: `Patient/${reportData.patient_id}` },
            // Metadata for frontend display
            resultsInterpreter: [{
                reference: `Practitioner/${reportData.doctor_id}`,
                display: `Dr. ${doctorName}`
            }],
            performer: [{
                display: hospitalName
            }],
            effectiveDateTime: reportData.report_date,
            conclusion: reportData.summary,
            presentedForm: [{
                contentType: 'application/json',
                data: Buffer.from(JSON.stringify(reportData.ehr_data)).toString('base64'),
                title: reportData.original_file_name
            }]
        };

        console.log("[createReport] Saving resource:", JSON.stringify(report, null, 2));
        await fhirStore.create(report);

        revalidatePath('/dashboard/doctor/patients');
        revalidatePath('/records'); // Revalidate records page specifically

        return { success: true };
    } catch (e) {
        console.error("Failed to create report", e);
        return { error: 'Failed to create report' };
    }
}



// --- RISK SCORING (KARMA POINTS) ---

function calculateRiskScore(patient: any, totalVisits: number = 0) {
    let score = 0;
    const factors: string[] = [];

    // Age
    if (patient.birthDate) {
        const age = new Date().getFullYear() - new Date(patient.birthDate).getFullYear();
        if (age > 65) {
            score += 20;
            factors.push('Age > 65 (+20)');
        } else if (age > 50) {
            score += 10;
            factors.push('Age > 50 (+10)');
        }
    }

    // Chronic Conditions (assuming we have them in the patient object or passed in)
    // Note: In searchPatient/getDoctorPatients we construct the patient obj. 
    // We might need to fetch conditions if they are not on the patient resource directly (usually they are Condition resources).
    // For now, let's use the 'chronic_conditions' array we populate in the frontend-friendly object.
    if (patient.chronic_conditions?.length) {
        const points = patient.chronic_conditions.length * 10;
        score += points;
        factors.push(`Conditions: ${patient.chronic_conditions.length} (+${points})`);
    }

    // Allergies
    if (patient.allergies?.length) {
        const points = patient.allergies.length * 5;
        score += points;
        factors.push(`Allergies: ${patient.allergies.length} (+${points})`);
    }

    // Visit History
    if (totalVisits > 0) {
        const points = totalVisits * 5;
        score += points;
        factors.push(`Visits: ${totalVisits} (+${points})`);
    }

    let level: 'low' | 'medium' | 'high' = 'low';
    if (score >= 40) level = 'high';
    else if (score >= 20) level = 'medium';

    return {
        score,
        level,
        last_assessed: new Date().toISOString(),
        factors
    };
}

export async function searchPatient(query: string) {
    if (!query) return null;
    // Search by ID (exact) or Name (contains)
    // fhirStore.search is simple filter.
    const patients = await fhirStore.search('Patient', (item: any) =>
        item.id === query ||
        item.name?.[0]?.family?.toLowerCase().includes(query.toLowerCase()) ||
        item.name?.[0]?.given?.some((g: string) => g.toLowerCase().includes(query.toLowerCase()))
    );

    const p = patients[0];
    if (!p) return null;

    const patientObj = {
        id: p.id,
        patient_id: p.id,
        name: p.name?.[0] ? `${p.name[0].given?.[0] || ''} ${p.name[0].family || ''}`.trim() : 'Unknown Patient',
        date_of_birth: p.birthDate,
        gender: p.gender,
        blood_type: (p as any).blood_type || 'N/A',
        phone: p.telecom?.find((t: any) => t.system === 'phone')?.value,
        allergies: (p as any).allergies || [],
        chronic_conditions: (p as any).chronic_conditions || []
    };

    return {
        ...patientObj,
        risk_profile: calculateRiskScore(patientObj)
    };
}

export async function getDoctorReports(doctorId: string) {
    if (!doctorId) return [];
    return fhirStore.search('DiagnosticReport', (item: any) =>
        item.performer?.some((p: any) => p.reference === `Practitioner/${doctorId}`)
    );
}

export async function getDoctorPatients(doctorId: string) {
    if (!doctorId) return [];

    // Parallel fetch of all interactions
    const [appointments, prescriptions, reports] = await Promise.all([
        getDoctorAppointments(doctorId),
        getDoctorPrescriptions(doctorId),
        getDoctorReports(doctorId)
    ]);

    const patientMap = new Map<string, any>();

    // Helper to merge patient data
    const mergePatient = (patientId: string, source: string, date: string, patientObj: any) => {
        if (!patientId) return;

        // If we have a robust patient object from appointment (enriched), prefer that
        // Otherwise use what we have or placeholder

        let existing = patientMap.get(patientId);

        if (!existing) {
            existing = {
                id: patientId,
                patient_id: patientId,
                total_visits: 0,
                last_visit_date: null,
                first_visit_date: null,
                patient: patientObj || { name: 'Loading...', patient_id: patientId } // Fallback
            };
            patientMap.set(patientId, existing);
        }

        // If we found a better patient object (e.g. from Appointment which is enriched), update it
        if (patientObj && (!existing.patient.name || existing.patient.name === 'Loading...')) {
            existing.patient = patientObj;
        }

        // Update stats based on interaction type
        if (source === 'appointment') {
            existing.total_visits++;
            if (date) {
                if (!existing.last_visit_date || new Date(date) > new Date(existing.last_visit_date)) {
                    existing.last_visit_date = date;
                }
                if (!existing.first_visit_date || new Date(date) < new Date(existing.first_visit_date)) {
                    existing.first_visit_date = date;
                }
            }
        }
    };

    // Process Appointments
    appointments.forEach((appt: any) => {
        const pid = appt.patient?.patient_id;
        if (pid) {
            mergePatient(pid, 'appointment', appt.scheduled_date, appt.patient);
        }
    });

    // Process Prescriptions
    prescriptions.forEach((rx: any) => {
        const pid = rx.subject?.reference?.split('/')[1];
        // We might not have full patient details here if getDoctorPrescriptions doesn't enrich them fully 
        // (it enriches patientName but not full object). 
        // We'll rely on fetching missing details later if needed, or hope they have an appointment.
        if (pid) mergePatient(pid, 'prescription', rx.authoredOn, null);
    });

    // Process Reports
    reports.forEach((rpt: any) => {
        const pid = rpt.subject?.reference?.split('/')[1];
        if (pid) mergePatient(pid, 'report', rpt.effectiveDateTime, null);
    });

    // Fetch missing patient details for those who only had Rx or Reports (no enriched appointment)
    // This is expensive if there are many, but necessary.
    const patients = Array.from(patientMap.values());
    await Promise.all(patients.map(async (p) => {
        // If name is loading OR if we are missing key fields like phone/blood_type and we want to try fetching them again
        // (sometimes appointment patient obj is minimal)
        if (!p.patient.name || p.patient.name === 'Loading...' || p.patient.blood_type === 'N/A') {
            const pats = await fhirStore.search('Patient', (item: any) => item.id === p.id);
            const pat = pats[0];
            if (pat) {
                p.patient = {
                    name: pat.name?.[0] ? `${pat.name[0].given?.[0] || ''} ${pat.name[0].family || ''}`.trim() : 'Unknown Patient',
                    patient_id: pat.id,
                    date_of_birth: pat.birthDate,
                    gender: pat.gender,
                    blood_type: (pat as any).blood_type || p.patient.blood_type || 'N/A', // Try to find it or keep existing
                    phone: pat.telecom?.find((t: any) => t.system === 'phone')?.value || p.patient.phone || 'N/A',
                    allergies: (pat as any).allergies || [],
                    chronic_conditions: (pat as any).chronic_conditions || []
                };
            }
        }

        // Calculate Risk Score
        if (p.patient) {
            p.patient.risk_profile = calculateRiskScore(p.patient, p.total_visits);
        }
    }));

    return patients;
}

// --- DOCTOR MANAGEMENT ---

export async function getDoctors() {
    // Fetch all practitioners
    const practitioners = await fhirStore.search('Practitioner', () => true);

    // Transform to frontend Doctor type
    // Note: We might want to filter by active status or role if we had that distinction clearly
    const doctors = practitioners.map((p: any) => ({
        id: p.id,
        doctor_id: p.id,
        name: p.name?.[0] ? `${p.name[0].given?.[0] || ''} ${p.name[0].family || ''}`.trim() : 'Unknown Doctor',
        email: p.telecom?.find((t: any) => t.system === 'email')?.value || '',
        specialization: p.qualification?.[0]?.code?.text || 'General Physician',
        qualification: p.qualification?.[0]?.identifier?.[0]?.value || 'MBBS',
        hospital: (p as any).hospital || 'Unknown Hospital',
        phone: p.telecom?.find((t: any) => t.system === 'phone')?.value || '',
        profile_image_url: p.photo?.[0]?.url || '',
        years_of_experience: (p as any).years_of_experience || 0,
        fee: (p as any).fee || 0,
        rating: (p as any).rating || 0,
    }));

    return doctors;
}

const UpdateDoctorProfileSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    specialization: z.string(),
    qualification: z.string(),
    hospital: z.string(),
    phone: z.string().optional(),
    fee: z.number().optional(),
    years_of_experience: z.number().optional(),
});

// Helper to get a single doctor profile by ID (can be auth ID or resource ID)
export async function getDoctorProfile(userId: string) {
    if (!userId) return null;

    // We assume the Practitioner resource ID matches the User ID.
    // If not, we'd need to search by an identifier or tag.
    // For this implementation, we enforce ID parity.
    const practitioners = await fhirStore.search('Practitioner', (p: any) => p.id === userId);
    const p = practitioners[0];

    if (!p) return null;

    // Use extensions for custom fields if we decide to store them properly in FHIR
    // For now, we are just mapping what we have.
    // If we want to persist 'hospital', 'fee', etc. strictly in FHIR, we need to add them to the resource 
    // when saving (updateDoctorProfile) and read them back here.
    // Let's assume we store them in `extension` or just top-level custom props (shimmed).

    return {
        id: p.id,
        name: p.name?.[0] ? `${p.name[0].given?.[0] || ''} ${p.name[0].family || ''}`.trim() : 'Unknown Doctor',
        email: p.telecom?.find((t: any) => t.system === 'email')?.value || '',
        specialization: p.qualification?.[0]?.code?.text || '',
        qualification: p.qualification?.[0]?.identifier?.[0]?.value || '',
        hospital: (p as any).hospital || 'Medanta Hospital', // Custom field shim
        phone: p.telecom?.find((t: any) => t.system === 'phone')?.value || '',
        fee: (p as any).fee || 500, // Custom field shim
        years_of_experience: (p as any).years_of_experience || 0, // Custom field shim
        profile_image_url: p.photo?.[0]?.url || '',
    };
}

export async function updateDoctorProfile(prevState: any, formData: FormData) {
    try {
        const rawData = {
            id: formData.get('id')?.toString() || '',
            name: formData.get('name')?.toString() || '',
            specialization: formData.get('specialization')?.toString() || '',
            qualification: formData.get('qualification')?.toString() || '',
            hospital: formData.get('hospital')?.toString() || '',
            phone: formData.get('phone')?.toString() || '',
            fee: Number(formData.get('fee')) || 0,
            years_of_experience: Number(formData.get('years_of_experience')) || 0,
        };

        const validated = UpdateDoctorProfileSchema.safeParse(rawData);

        if (!validated.success) {
            console.error("Validation Errors:", validated.error.flatten().fieldErrors);
            return {
                message: 'Invalid input data. Please check all fields.',
                errors: validated.error.flatten().fieldErrors,
                success: false
            };
        }

        const data = validated.data;

        // Fetch existing practitioner
        const existing = await fhirStore.search('Practitioner', (p: any) => p.id === data.id);
        const practitioner = existing[0];

        if (!practitioner) {
            // If strictly using FHIR and it's missing, we must create it.
            // This happens on first login if we didn't create a profile yet.
            const newPractitioner = {
                resourceType: 'Practitioner',
                id: data.id,
                active: true,
                name: [{
                    use: 'official',
                    family: data.name.split(' ').slice(-1)[0] || '',
                    given: data.name.split(' ').slice(0, -1)
                }],
                telecom: [
                    { system: 'phone', value: data.phone, use: 'work' },
                    // We might not have email in form, but user session has it. 
                    // ideally we pass it in or fetch from auth. For now, rely on existing or omit.
                ],
                qualification: [{
                    code: { text: data.specialization },
                    identifier: [{ value: data.qualification }]
                }],
                // Custom fields (Shimming into resource for simplicity as requested "use info inside fhir_resources")
                hospital: data.hospital,
                fee: data.fee,
                years_of_experience: data.years_of_experience,
                // We don't have profile image url in form unless we handle file upload. 
                // Assuming it's passed or we keep existing.
                photo: practitioner?.photo || []
            };

            await fhirStore.create(newPractitioner);
            return { success: true, message: 'Profile created successfully' };
        }

        // Update FHIR resource
        const updatedPractitioner = {
            ...practitioner,
            name: [{
                use: 'official',
                family: data.name.split(' ').slice(-1)[0] || '',
                given: data.name.split(' ').slice(0, -1)
            }],
            telecom: [
                ...(practitioner.telecom || []).filter((t: any) => t.system !== 'phone'),
                { system: 'phone', value: data.phone, use: 'work' }
            ],
            qualification: [{
                code: { text: data.specialization },
                identifier: [{ value: data.qualification }]
            }],
            // Shim custom fields directly onto the resource JSON
            hospital: data.hospital,
            fee: data.fee,
            years_of_experience: data.years_of_experience,
        };

        await fhirStore.update(data.id, updatedPractitioner);

        revalidatePath('/doctor/profile');
        revalidatePath('/book-appointment');

        return { success: true, message: 'Profile updated successfully' };
    } catch (e) {
        console.error("Profile Update Error", e);
        return { message: 'Failed to update profile', success: false };
    }
}
