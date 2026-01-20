import { NextResponse } from 'next/server';
import { fhirStore } from '@/lib/fhir-store';
import { Condition } from 'fhir/r4';
import { auth } from '@/auth';
import { AuditLogger } from '@/lib/audit';

// Helper for unauthorized response
const unauthorized = () => NextResponse.json(
    { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'forbidden', diagnostics: 'Unauthorized access' }] },
    { status: 403 }
);

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return unauthorized();

        const body: Condition = await request.json();

        // Basic validation
        if (body.resourceType !== 'Condition') {
            return NextResponse.json(
                { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'invalid', diagnostics: 'Invalid resource type' }] },
                { status: 400 }
            );
        }

        // Security: Who can create a Condition?
        // Typically Doctors. Patients usually don't self-diagnose in EHRs, but we might allow "Reported" conditions.
        // Rule: If Patient, Subject MUST refer to themselves.
        if (session.user.role === 'patient') {
            const subjectRef = body.subject?.reference;
            if (!subjectRef?.includes(session.user.id)) return unauthorized();
        }

        const created = await fhirStore.create<Condition>(body);

        await AuditLogger.log('CREATE', 'Condition', created.id || 'new', session.user.id);

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
        const session = await auth();
        if (!session?.user?.id) return unauthorized();

        const { searchParams } = new URL(request.url);
        const patient = searchParams.get('patient') || searchParams.get('subject');

        // Security: Filter Enforcement
        // If Patient, FORCE filtering by their ID.
        let securePatientRef = patient;
        if (session.user.role === 'patient') {
            // They can ONLY see their own conditions
            securePatientRef = session.user.id;
        }

        const conditions = await fhirStore.search<Condition>('Condition', (c) => {
            // If Patient, enforce subject check
            if (session.user.role === 'patient') {
                const ref = c.subject?.reference;
                if (!ref?.includes(session.user.id)) return false;
            }

            // General filtering if requested (and allowed)
            if (securePatientRef) {
                const ref = c.subject?.reference;
                if (!ref?.includes(securePatientRef)) return false;
            }

            return true;
        });

        await AuditLogger.log('SEARCH', 'Condition', null, session.user.id, { count: conditions.length });

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
