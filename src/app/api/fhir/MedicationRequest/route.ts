import { NextRequest, NextResponse } from 'next/server';
import { fhirStore } from '@/lib/fhir-store';
import { MedicationRequestSchema } from '@/lib/schemas';
import { v4 as uuidv4 } from 'uuid';
import { MedicationRequest } from 'fhir/r4';

// POST /api/fhir/MedicationRequest
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validationResult = MedicationRequestSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid Prescription data', details: validationResult.error.format() },
                { status: 400 }
            );
        }

        const prescriptionData: MedicationRequest = {
            ...validationResult.data,
            id: uuidv4(),
        } as MedicationRequest;

        const newPrescription = await fhirStore.create(prescriptionData);
        return NextResponse.json(newPrescription, { status: 201 });
    } catch (error) {
        console.error('Error creating Prescription:', error);
        return NextResponse.json(
            { error: 'Failed to create Prescription' },
            { status: 500 }
        );
    }
}

// GET /api/fhir/MedicationRequest?patient=Patient/123
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const patientRef = searchParams.get('patient');
        const status = searchParams.get('status');

        const prescriptions = await fhirStore.search('MedicationRequest', (req: MedicationRequest) => {
            if (status && req.status !== status) return false;
            if (patientRef && req.subject?.reference !== patientRef) return false;
            return true;
        });

        const bundle = {
            resourceType: 'Bundle',
            type: 'searchset',
            total: prescriptions.length,
            entry: prescriptions.map((resource) => ({
                resource,
            })),
        };

        return NextResponse.json(bundle);
    } catch (error) {
        console.error('Error fetching Prescriptions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch Prescriptions' },
            { status: 500 }
        );
    }
}
