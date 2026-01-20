
import { NextResponse } from 'next/server';
import { fhirStore } from '@/lib/fhir-store';
import { Patient } from 'fhir/r4';

export async function POST(request: Request) {
    try { // eslint-disable-line no-useless-catch
        const body: Patient = await request.json();

        // Basic validation
        if (body.resourceType !== 'Patient') {
            return NextResponse.json(
                { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'invalid', diagnostics: 'Invalid resource type' }] },
                { status: 400 }
            );
        }

        const created = await fhirStore.create<Patient>(body);
        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        console.error('Error creating Patient:', error);
        return NextResponse.json(
            { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'exception', diagnostics: 'Internal Server Error' }] },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');

        const patients = await fhirStore.search<Patient>('Patient', (p) => {
            if (name) {
                const fullName = p.name?.map(n => `${n.given?.join(' ')} ${n.family}`).join(' ').toLowerCase();
                if (!fullName?.includes(name.toLowerCase())) return false;
            }
            return true;
        });

        return NextResponse.json({
            resourceType: 'Bundle',
            type: 'searchset',
            total: patients.length,
            entry: patients.map(p => ({ resource: p }))
        });
    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        return NextResponse.json(
            { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'exception', diagnostics: 'Internal Server Error' }] },
            { status: 500 }
        );
    }
}
