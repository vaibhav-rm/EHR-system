/**
 * Setup script to create/verify demo doctor account
 * Run with: npx tsx src/scripts/setup-demo-doctor.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { supabaseAdmin } from '../lib/supabase';
import { fhirStore } from '../lib/fhir-store';

const DEMO_DOCTOR = {
    email: 'doctor@demo.com',
    password: 'Doctor@123',
    name: 'Demo Doctor',
    specialization: 'General Medicine',
    qualifications: 'MBBS, MD (General Medicine)'
};

async function setupDemoDoctor() {
    console.log('🔍 Checking for demo doctor account...');

    try {
        // 1. Check if auth user exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users.find(u => u.email === DEMO_DOCTOR.email);

        let userId: string;

        if (existingUser) {
            console.log('✅ Auth user already exists:', existingUser.id);
            userId = existingUser.id;
        } else {
            console.log('📝 Creating Supabase Auth user...');
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
                throw new Error(`Failed to create auth user: ${authError?.message}`);
            }

            userId = authData.user.id;
            console.log('✅ Auth user created:', userId);
        }

        // 2. Check if Practitioner FHIR resource exists
        const practitioners = await fhirStore.search('Practitioner', (p: any) => p.id === userId);

        if (practitioners.length > 0) {
            console.log('✅ Practitioner FHIR resource already exists');
            console.log('   Name:', practitioners[0].name?.[0]?.text);
        } else {
            console.log('📝 Creating Practitioner FHIR resource...');

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
            console.log('✅ Practitioner resource created');
        }

        console.log('\n🎉 Demo doctor setup complete!');
        console.log('\n📋 Login Credentials:');
        console.log('   Email:', DEMO_DOCTOR.email);
        console.log('   Password:', DEMO_DOCTOR.password);
        console.log('\n✨ You can now log in as a doctor!');

    } catch (error) {
        console.error('❌ Error setting up demo doctor:', error);
        throw error;
    }
}

// Run the setup
setupDemoDoctor()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
