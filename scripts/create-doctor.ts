import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('Missing environment variables!');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function createDoctor() {
    const email = 'doctor@demo.com';
    const password = 'Doctor@123';
    const name = 'Dr. Demo Doctor';

    console.log(`Creating Doctor account: ${email}`);

    // 1. Create Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: password,
        email_confirm: true,
        user_metadata: {
            full_name: name,
            role: 'doctor'
        }
    });

    if (authError) {
        console.error('Error creating auth user:', authError.message);
        return;
    }

    const userId = authData.user.id;
    console.log(`Auth User created. ID: ${userId}`);

    // 2. Create FHIR Practitioner (using the SAME ID)
    const doctorResource = {
        resource_type: 'Practitioner',
        id: userId, // CRITICAL: Link Auth ID to Resource ID
        resource: {
            resourceType: 'Practitioner',
            id: userId,
            active: true,
            name: [{
                use: 'official',
                text: name,
                family: 'Doctor',
                given: ['Demo']
            }],
            telecom: [{
                system: 'email',
                value: email,
                use: 'work'
            }],
            qualification: [{
                code: {
                    text: 'MBBS, MD (General Medicine)'
                }
            }]
        }
    };

    const { error: dbError } = await supabaseAdmin
        .from('fhir_resources')
        .insert(doctorResource);

    if (dbError) {
        console.error('Error creating Practitioner resource:', dbError.message);
    } else {
        console.log('Practitioner FHIR resource created successfully.');
        console.log('\n-----------------------------------');
        console.log('LOGIN CREDENTIALS:');
        console.log(`Email:    ${email}`);
        console.log(`Password: ${password}`);
        console.log('-----------------------------------');
    }
}

createDoctor().catch(console.error);
