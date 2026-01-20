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

async function seedAppointments() {
    const targetEmail = 'rathodvaibhav401@gmail.com';
    console.log(`Searching for ${targetEmail}...`);

    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error || !users) {
        console.error('Error listing users', error);
        return;
    }
    const user = users.find(u => u.email === targetEmail);

    if (!user) {
        console.log(`User ${targetEmail} not found. Cannot seed.`);
        return;
    }

    // Define some appointments
    const appointmentsResults = [];
    const baseAppointments = [
        {
            resourceType: 'Appointment',
            status: 'booked',
            start: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days later
            end: new Date(Date.now() + 86400000 * 2 + 1800000).toISOString(),
            description: 'General Checkup - In-Person',
            serviceType: [{ coding: [{ display: 'General Practice' }] }],
            participant: [
                { actor: { reference: `Patient/${user.id}`, display: 'Vaibhav Rathod' }, status: 'accepted' },
                { actor: { reference: 'Practitioner/dr-smith', display: 'Dr. John Smith' }, status: 'accepted' }
            ]
        },
        {
            resourceType: 'Appointment',
            status: 'booked',
            start: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days later
            end: new Date(Date.now() + 86400000 * 5 + 1800000).toISOString(),
            description: 'Follow-up - Video',
            serviceType: [{ coding: [{ display: 'Cardiology' }] }],
            participant: [
                { actor: { reference: `Patient/${user.id}`, display: 'Vaibhav Rathod' }, status: 'accepted' },
                { actor: { reference: 'Practitioner/dr-vikram', display: 'Dr. Vikram Singh' }, status: 'accepted' }
            ]
        },
        {
            resourceType: 'Appointment',
            status: 'fulfilled',
            start: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
            end: new Date(Date.now() - 86400000 * 10 + 1800000).toISOString(),
            description: 'Consultation',
            serviceType: [{ coding: [{ display: 'Dermatology' }] }],
            participant: [
                { actor: { reference: `Patient/${user.id}`, display: 'Vaibhav Rathod' }, status: 'accepted' },
                { actor: { reference: 'Practitioner/dr-amit', display: 'Dr. Amit Patel' }, status: 'accepted' }
            ]
        }
    ];

    for (const apt of baseAppointments) {
        const id = crypto.randomUUID();
        const resourceWithId = { ...apt, id };

        const { error: insertError } = await supabaseAdmin
            .from('fhir_resources')
            .insert({
                id: id,
                resource_type: 'Appointment',
                resource: resourceWithId
            });

        if (insertError) console.error('Error inserting apt:', insertError);
        else console.log(`Inserted appointment: ${apt.description} with ID ${id}`);
    }
}

seedAppointments().catch(console.error);
