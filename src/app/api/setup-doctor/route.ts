import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { fhirStore } from '@/lib/fhir-store';

const DEMO_DOCTOR = {
    email: 'doctor@demo.com',
    password: 'Doctor@123',
    name: 'Demo Doctor',
    specialization: 'General Medicine',
    qualifications: 'MBBS, MD (General Medicine)'
};

export async function POST() {
    try {
        // 1. Check if auth user exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users.find(u => u.email === DEMO_DOCTOR.email);

        let userId: string;

        if (existingUser) {
            userId = existingUser.id;
            console.log('[Setup] Auth user already exists:', userId);
        } else {
            console.log('[Setup] Creating Supabase Auth user...');
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: DEMO_DOCTOR.email,
                password: DEMO_DOCTOR.password,
                email_confirm: true,
                user_metadata: {
                    full_name: DEMO_DOCTOR.name,
                    role: 'doctor',
                },
            });

            if (authError || !authData.user) {
                return NextResponse.json({ error: `Failed to create auth user: ${authError?.message}` }, { status: 500 });
            }

            userId = authData.user.id;
            console.log('[Setup] Auth user created:', userId);
        }

        // 2. Check if Practitioner FHIR resource exists
        const practitioners = await fhirStore.search('Practitioner', (p: any) => p.id === userId);

        if (practitioners.length > 0) {
            console.log('[Setup] Practitioner FHIR resource already exists');
        } else {
            console.log('[Setup] Creating Practitioner FHIR resource...');

            const practitioner = {
                resourceType: 'Practitioner',
                id: userId,
                active: true,
                name: [{
                    use: 'official',
                    text: DEMO_DOCTOR.name,
                    family: 'Doctor',
                    given: ['Demo']
                }],
                telecom: [
                    { system: 'email', value: DEMO_DOCTOR.email, use: 'work' },
                    { system: 'phone', value: '+91 98765 43210', use: 'work' }
                ],
                qualification: [{
                    code: { text: DEMO_DOCTOR.qualifications }
                }],
                // Custom fields for display
                hospital: 'MedSense Hospital',
                specialization: DEMO_DOCTOR.specialization,
                profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DemoDoctor'
            };

            await fhirStore.create(practitioner);
            console.log('[Setup] Practitioner resource created');
        }

        return NextResponse.json({
            success: true,
            message: 'Demo doctor account setup complete',
            credentials: {
                email: DEMO_DOCTOR.email,
                password: DEMO_DOCTOR.password
            }
        });

    } catch (error: any) {
        console.error('[Setup] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
