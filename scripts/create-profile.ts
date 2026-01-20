import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Fix path to .env.local assuming script is run from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function createProfile() {
    const targetEmail = 'rathodvaibhav401@gmail.com';
    console.log(`Searching for ${targetEmail}...`);

    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    const user = users.find(u => u.email === targetEmail);

    if (!user) {
        console.log(`User ${targetEmail} not found. Cannot create profile.`);
        return;
    }

    console.log(`Found user ID: ${user.id}`);

    // Create FHIR Patient Resource
    const resource = {
        resourceType: 'Patient',
        id: user.id, // Link ID
        active: true,
        name: [{ use: 'official', text: 'Vaibhav Rathod', family: 'Rathod', given: ['Vaibhav'] }],
        telecom: [{ system: 'email', value: targetEmail, use: 'work' }]
    };

    console.log('Inserting FHIR resource...');

    const { error: insertError } = await supabaseAdmin
        .from('fhir_resources')
        .upsert({
            id: resource.id,
            resource_type: 'Patient',
            resource: resource
        });

    if (insertError) {
        console.error('Failed to create FHIR profile:', insertError);
    } else {
        console.log('Successfully created FHIR Patient profile for Vaibhav Rathod.');
    }
}

createProfile().catch(console.error);
