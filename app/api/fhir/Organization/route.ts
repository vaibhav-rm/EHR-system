
import { NextResponse } from 'next/server';
import { fhirStore } from '@/lib/fhir-store';
import { Organization } from 'fhir/r4';

export async function POST(request: Request) {
    try { // eslint-disable-line no-useless-catch
        const body: Organization = await request.json();

        // Basic validation
        if (body.resourceType !== 'Organization') {
            return NextResponse.json(
                { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'invalid', diagnostics: 'Invalid resource type' }] },
                { status: 400 }
            );
        }

        const created = await fhirStore.create<Organization>(body);
        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        console.error('Error creating Organization:', error);
        return NextResponse.json(
            { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'exception', diagnostics: 'Internal Server Error' }] },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try { // eslint-disable-line no-useless-catch
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');

        const orgs = await fhirStore.search<Organization>('Organization', (org) => {
            if (name && !org.name?.toLowerCase().includes(name.toLowerCase())) {
                return false;
            }
            return true;
        });

        // Return a Bundle
        return NextResponse.json({
            resourceType: 'Bundle',
            type: 'searchset',
            total: orgs.length,
            entry: orgs.map(org => ({ resource: org }))
        });
    } catch (error) {
        console.error('Error fetching Organizations:', error);
        return NextResponse.json(
            { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'exception', diagnostics: 'Internal Server Error' }] },
            { status: 500 }
        );
    }
}
