import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function seedMeds() {
    const targetEmail = 'rathodvaibhav401@gmail.com';
    console.log(`Searching for ${targetEmail}...`);

    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error || !users) return;
    const user = users.find(u => u.email === targetEmail);

    if (!user) {
        console.log('User not found');
        return;
    }

    const meds = [
        {
            resourceType: 'MedicationRequest',
            status: 'active',
            intent: 'order',
            medicationCodeableConcept: { text: 'Lisinopril', coding: [{ display: 'Lisinopril' }] },
            subject: { reference: `Patient/${user.id}`, display: 'Vaibhav Rathod' },
            dosageInstruction: [{
                text: '10mg Once daily',
                timing: { repeat: { frequency: 1, period: 1, periodUnit: 'd' } },
                doseAndRate: [{ doseQuantity: { value: 10, unit: 'mg' } }]
            }],
            dispenseRequest: { expectedSupplyDuration: { value: 30, unit: 'days' } }
        },
        {
            resourceType: 'MedicationRequest',
            status: 'active',
            intent: 'order',
            medicationCodeableConcept: { text: 'Metformin', coding: [{ display: 'Metformin' }] },
            subject: { reference: `Patient/${user.id}`, display: 'Vaibhav Rathod' },
            dosageInstruction: [{
                text: '500mg Twice daily',
                timing: { repeat: { frequency: 2, period: 1, periodUnit: 'd' } },
                doseAndRate: [{ doseQuantity: { value: 500, unit: 'mg' } }]
            }]
        },
        {
            resourceType: 'MedicationRequest',
            status: 'active',
            intent: 'order',
            medicationCodeableConcept: { text: 'Vitamin D3', coding: [{ display: 'Vitamin D3' }] },
            subject: { reference: `Patient/${user.id}`, display: 'Vaibhav Rathod' },
            dosageInstruction: [{
                text: '2000 IU Once daily',
                timing: { repeat: { frequency: 1, period: 1, periodUnit: 'd' } },
                doseAndRate: [{ doseQuantity: { value: 2000, unit: 'IU' } }]
            }]
        }
    ];

    for (const med of meds) {
        const id = crypto.randomUUID();
        const resourceWithId = { ...med, id };

        const { error } = await supabaseAdmin
            .from('fhir_resources')
            .insert({
                id: id,
                resource_type: 'MedicationRequest',
                resource: resourceWithId
            });

        if (error) console.error('Error inserting med:', error);
        else console.log(`Inserted med: ${med.medicationCodeableConcept.text}`);
    }
}

seedMeds().catch(console.error);
