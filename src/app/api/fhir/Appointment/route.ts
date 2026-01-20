import { NextRequest, NextResponse } from 'next/server';
import { fhirStore } from '@/lib/fhir-store';
import { AppointmentSchema } from '@/lib/schemas';
import { v4 as uuidv4 } from 'uuid';
import { Appointment } from 'fhir/r4';

// POST /api/fhir/Appointment
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validationResult = AppointmentSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid Appointment data', details: validationResult.error.format() },
                { status: 400 }
            );
        }

        const appointmentData: Appointment = {
            ...validationResult.data,
            id: uuidv4(),
        } as Appointment; // Type assertion as Schema is subset of full FHIR resource

        const newAppointment = await fhirStore.create(appointmentData);
        return NextResponse.json(newAppointment, { status: 201 });
    } catch (error) {
        console.error('Error creating Appointment:', error);
        return NextResponse.json(
            { error: 'Failed to create Appointment' },
            { status: 500 }
        );
    }
}

// GET /api/fhir/Appointment?patient=Patient/123&practitioner=Practitioner/456&status=booked
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const patientRef = searchParams.get('patient');
        const practitionerRef = searchParams.get('practitioner');
        const status = searchParams.get('status');

        const appointments = await fhirStore.search('Appointment', (appt: Appointment) => {
            if (status && appt.status !== status) return false;
            return true;
        });

        let filteredAppointments = appointments;

        // Manual filtering for participants (Patient/Practitioner) 
        // (This remains valid as additional filtering over the result set)
        if (patientRef || practitionerRef) {
            filteredAppointments = filteredAppointments.filter((apt: any) => {
                if (!apt.participant) return false;
                return apt.participant.some((p: any) => {
                    const ref = p.actor?.reference;
                    if (patientRef && ref?.includes(patientRef)) return true;
                    if (practitionerRef && ref?.includes(practitionerRef)) return true;
                    return false;
                });
            });
        }

        // Wrap in Bundle
        const bundle = {
            resourceType: 'Bundle',
            type: 'searchset',
            total: filteredAppointments.length,
            entry: filteredAppointments.map((resource) => ({
                resource,
            })),
        };

        return NextResponse.json(bundle);
    } catch (error) {
        console.error('Error fetching Appointments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch Appointments' },
            { status: 500 }
        );
    }
}
