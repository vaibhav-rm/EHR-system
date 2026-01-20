
import { NextResponse } from 'next/server';
import { fhirStore } from '@/lib/fhir-store';
import { Practitioner } from 'fhir/r4';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const p = await fhirStore.read<Practitioner>('Practitioner', id);

    if (!p) {
        return NextResponse.json(
            { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'not-found', diagnostics: 'Practitioner not found' }] },
            { status: 404 }
        );
    }

    return NextResponse.json(p);
}
