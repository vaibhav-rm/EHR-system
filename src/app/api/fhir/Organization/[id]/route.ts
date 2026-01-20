
import { NextResponse } from 'next/server';
import { fhirStore } from '@/lib/fhir-store';
import { Organization } from 'fhir/r4';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const org = await fhirStore.read<Organization>('Organization', id);

    if (!org) {
        return NextResponse.json(
            { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'not-found', diagnostics: 'Organization not found' }] },
            { status: 404 }
        );
    }

    return NextResponse.json(org);
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body: Organization = await request.json();
        if (body.resourceType !== 'Organization' || body.id !== id) {
            return NextResponse.json(
                { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'invalid', diagnostics: 'Id mismatch or invalid type' }] },
                { status: 400 }
            );
        }

        const updated = await fhirStore.update<Organization>(body);
        return NextResponse.json(updated);

    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        return NextResponse.json(
            { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'not-found', diagnostics: 'Resource not found or error updating' }] },
            { status: 404 }
        );
    }
}
