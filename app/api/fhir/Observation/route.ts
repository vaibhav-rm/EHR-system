import { NextResponse } from 'next/server';
import { fhirStore } from '@/lib/fhir-store';
import { Observation } from 'fhir/r4';

export async function POST(request: Request) {
    try {
        const body: Observation = await request.json();

        if (body.resourceType !== 'Observation') {
            return NextResponse.json(
                { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'invalid', diagnostics: 'Invalid resource type' }] },
                { status: 400 }
            );
        }

        const created = await fhirStore.create<Observation>(body);
        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        console.error('Error creating Observation:', error);
        return NextResponse.json(
            { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'exception', diagnostics: 'Internal Server Error' }] },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const patient = searchParams.get('patient') || searchParams.get('subject');

        const observations = await fhirStore.search<Observation>('Observation', (o) => {
            if (patient) {
                const ref = o.subject?.reference;
                if (!ref?.includes(patient)) return false;
            }
            return true;
        });

        return NextResponse.json({
            resourceType: 'Bundle',
            type: 'searchset',
            total: observations.length,
            entry: observations.map(o => ({ resource: o }))
        });
    } catch (error) {
        console.error('Error searching Observations:', error);
        return NextResponse.json(
            { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'exception', diagnostics: 'Internal Server Error' }] },
            { status: 500 }
        );
    }
}
