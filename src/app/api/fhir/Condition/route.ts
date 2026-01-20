import { NextResponse } from 'next/server';
import { fhirStore } from '@/lib/fhir-store';
import { Condition } from 'fhir/r4';

export async function POST(request: Request) {
    try {
        const body: Condition = await request.json();

        // Basic validation
        if (body.resourceType !== 'Condition') {
            return NextResponse.json(
                { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'invalid', diagnostics: 'Invalid resource type' }] },
                { status: 400 }
            );
        }

        const created = await fhirStore.create<Condition>(body);
        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        console.error('Error creating Condition:', error);
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

        const conditions = await fhirStore.search<Condition>('Condition', (c) => {
            if (patient) {
                // Check if subject reference matches (e.g., "Patient/123" or just "123")
                const ref = c.subject?.reference;
                if (!ref?.includes(patient)) return false;
            }
            return true;
        });

        return NextResponse.json({
            resourceType: 'Bundle',
            type: 'searchset',
            total: conditions.length,
            entry: conditions.map(c => ({ resource: c }))
        });
    } catch (error) {
        console.error('Error searching Conditions:', error);
        return NextResponse.json(
            { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'exception', diagnostics: 'Internal Server Error' }] },
            { status: 500 }
        );
    }
}
