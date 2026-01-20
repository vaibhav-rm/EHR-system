'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { fhirStore } from '@/lib/fhir-store';
import { Patient, Practitioner } from 'fhir/r4';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

export async function signupPatient(prevState: string | undefined, formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const phone = formData.get('phone') as string;

    if (!email || !password || !name) return 'Missing fields';

    try {
        // 1. Create FHIR Patient
        const patient: Patient = {
            resourceType: 'Patient',
            name: [{ use: 'official', family: name.split(' ').pop(), given: name.split(' ').slice(0, -1) }],
            telecom: [{ system: 'email', value: email }, { system: 'phone', value: phone }]
        };
        const createdPatient = await fhirStore.create<Patient>(patient);

        // 2. Create User linked to Patient
        await fhirStore.createUser({
            name,
            email,
            password,
            role: 'patient',
            fhirId: createdPatient.id
        });

        // 3. Auto Login
        await signIn('credentials', formData);
    } catch (error: any) {
        if (error.message === 'User already exists') return 'Email already registered';
        // Rethrow Next.js Redirects
        if (error.digest?.includes('NEXT_REDIRECT') || error.message.includes('NEXT_REDIRECT')) throw error;
        if (error instanceof AuthError) throw error;
        return 'Signup failed: ' + error.message;
    }
}

export async function signupDoctor(prevState: string | undefined, formData: FormData) {
    const name = formData.get('name') as string;
    const specialty = formData.get('specialty') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password || !name) return 'Missing fields';

    try {
        // 1. Create FHIR Practitioner
        const practitioner: Practitioner = {
            resourceType: 'Practitioner',
            name: [{ use: 'official', family: name.split(' ').pop(), given: name.split(' ').slice(0, -1) }],
            telecom: [{ system: 'email', value: email }],
            qualification: [{ code: { text: specialty } }] // Simplified
        };
        const createdPractitioner = await fhirStore.create<Practitioner>(practitioner);

        // 2. Create User linked to Practitioner
        await fhirStore.createUser({
            name,
            email,
            password,
            role: 'doctor',
            fhirId: createdPractitioner.id
        });

        // 3. Auto Login
        await signIn('credentials', formData);
    } catch (error: any) {
        if (error.message === 'User already exists') return 'Email already registered';
        // Rethrow Next.js Redirects
        if (error.digest?.includes('NEXT_REDIRECT') || error.message.includes('NEXT_REDIRECT')) throw error;
        if (error instanceof AuthError) throw error;
        return 'Signup failed: ' + error.message;
    }
}
