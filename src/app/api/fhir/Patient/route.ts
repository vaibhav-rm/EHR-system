import { NextResponse } from 'next/server';
import { fhirStore } from '@/lib/fhir-store';
import { Patient } from 'fhir/r4';
import { auth } from '@/auth'; // Adjust import path if needed (e.g. src/auth)
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

        const body: Patient = await request.json();

        // Security: Ensure user can only create a Patient resource for THEMSELVES (or if doctor/admin logic applies)
        // Ideally, Patient creation happens at Signup. 
        // If a user tries to create a Patient with an ID different from their session ID, deny it?
        // For simplicity: Force ID to match Session ID
        body.id = session.user.id;

        if (body.resourceType !== 'Patient') {
            return NextResponse.json(
                { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'invalid', diagnostics: 'Invalid resource type' }] },
                { status: 400 }
            );
        }

        const created = await fhirStore.create<Patient>(body);

        await AuditLogger.log('CREATE', 'Patient', created.id || 'new', session.user.id);

        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        console.error('Error creating Patient:', error);
        return NextResponse.json(
            { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'exception', diagnostics: 'Internal Server Error' }] },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return unauthorized();

        const body: Patient = await request.json();

        if (body.resourceType !== 'Patient' || !body.id) {
            return NextResponse.json(
                { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'invalid', diagnostics: 'Invalid resource or missing ID' }] },
                { status: 400 }
            );
        }

        // Security: IDOR Check
        // If user is a Patient, they can ONLY update themselves.
        if (session.user.role === 'patient' && body.id !== session.user.id) {
            await AuditLogger.log('UPDATE', 'Patient', body.id, session.user.id, { outcome: 'DENIED_IDOR' });
            return unauthorized();
        }

        // If doctor, they might be able to key-in updates? For now, we assume doctors update usage flows elsewhere.
        // But let's allow it if authorized.

        const updated = await fhirStore.update<Patient>(body.id, body);
        if (!updated) {
            return NextResponse.json(
                { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'not-found', diagnostics: 'Patient not found' }] },
                { status: 404 }
            );
        }

        await AuditLogger.log('UPDATE', 'Patient', body.id, session.user.id);

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error('Error updating Patient:', error);
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
        const name = searchParams.get('name');
        const id = searchParams.get('id') || searchParams.get('_id');
        const email = searchParams.get('email');

        // Security: Filter Enforcement
        // If Patient, force ID to match Session ID
        let secureId = id;
        if (session.user.role === 'patient') {
            secureId = session.user.id;
            // Also if they search by email, ensure it matches
            if (email && email !== session.user.email) return unauthorized();
        }

        const patients = await fhirStore.search<Patient>('Patient', (p) => {
            if (secureId && p.id !== secureId) return false;

            // Allow doctors to search by name/email freely
            // But Patients restricted by secureId above

            if (name) {
                const fullName = p.name?.map(n => `${n.given?.join(' ')} ${n.family}`).join(' ').toLowerCase();
                if (!fullName?.includes(name.toLowerCase())) return false;
            }
            if (email) {
                const pEmail = p.telecom?.find(t => t.system === 'email')?.value;
                if (pEmail !== email) return false;
            }
            return true;
        });

        // Audit Log for Search (Batch or Single)
        // If it's a specific ID access, log it as READ
        if (secureId) {
            await AuditLogger.log('READ', 'Patient', secureId, session.user.id);
        } else {
            await AuditLogger.log('SEARCH', 'Patient', null, session.user.id, { count: patients.length });
        }

        return NextResponse.json({
            resourceType: 'Bundle',
            type: 'searchset',
            total: patients.length,
            entry: patients.map(p => ({ resource: p }))
        });
    } catch (error) {
        console.error('Error searching Patients:', error);
        return NextResponse.json(
            { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'exception', diagnostics: 'Internal Server Error' }] },
            { status: 500 }
        );
    }
}
