import { NextResponse } from 'next/server';
import { fhirStore } from '@/lib/fhir-store';
import { DiagnosticReport } from 'fhir/r4';

export async function POST(request: Request) {
    try {
        const body: DiagnosticReport = await request.json();

        if (body.resourceType !== 'DiagnosticReport') {
            return NextResponse.json(
                { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'invalid', diagnostics: 'Invalid resource type' }] },
                { status: 400 }
            );
        }

        const created = await fhirStore.create<DiagnosticReport>(body);
        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        console.error('Error creating DiagnosticReport:', error);
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

        const reports = await fhirStore.search<DiagnosticReport>('DiagnosticReport', (r) => {
            if (patient) {
                const ref = r.subject?.reference;
                if (!ref?.includes(patient)) return false;
            }
            return true;
        });

        return NextResponse.json({
            resourceType: 'Bundle',
            type: 'searchset',
            total: reports.length,
            entry: reports.map(r => ({ resource: r }))
        });
    } catch (error) {
        console.error('Error searching DiagnosticReports:', error);
        return NextResponse.json(
            { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'exception', diagnostics: 'Internal Server Error' }] },
            { status: 500 }
        );
    }
}
