'use server';

import { supabase, supabaseAdmin } from '@/lib/supabase';
import { fhirStore } from '@/lib/fhir-store';

import { z } from 'zod';

const SignupSchema = z.object({
    email: z.string().email("Invalid email address").trim(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(1, "Name is required").trim(),
    role: z.enum(['patient', 'doctor']),
});

export async function signupUser(formData: FormData) {
    const rawData = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        name: formData.get('name') as string,
        role: formData.get('role') as string,
    };

    const validatedFields = SignupSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors.email?.[0] || validatedFields.error.flatten().fieldErrors.password?.[0] || "Invalid input" };
    }

    const { email, password, name, role } = validatedFields.data;

    // 1. Create Supabase Auth User (using Admin to auto-confirm email for prototype)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: name,
            role: role,
        },
    });

    if (authError) {
        return { error: authError.message };
    }

    if (!authData.user) {
        return { error: 'Failed to create user account' };
    }

    // 2. Create FHIR Resource (Patient or Practitioner)
    // We use the same ID as the Auth User for simplicity in linking
    const resourceType = role === 'doctor' ? 'Practitioner' : 'Patient';
    const resource = {
        resourceType: resourceType,
        id: authData.user.id, // Link ID
        active: true,
        name: [{ use: 'official', text: name, family: name.split(' ').pop(), given: name.split(' ').slice(0, -1) }],
        telecom: [{ system: 'email', value: email, use: 'work' }]
    };

    try {
        await fhirStore.create(resource);
    } catch (e) {
        console.error("Failed to create FHIR profile:", e);
        // Cleanup auth user? For now, we leave it, but in production we'd want a transaction.
        return { error: 'Account created but failed to create profile. Please contact support.' };
    }

    return { success: true };
}
