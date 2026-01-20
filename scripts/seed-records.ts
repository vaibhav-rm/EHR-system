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

async function seedRecords() {
    const targetEmail = 'rathodvaibhav401@gmail.com';
    console.log(`Searching for ${targetEmail}...`);

    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error || !users) return;
    const user = users.find(u => u.email === targetEmail);

    if (!user) {
        console.log('User not found');
        return;
    }

    const records = [
        {
            resourceType: 'DiagnosticReport',
            status: 'final',
            code: { text: 'Complete Blood Count (CBC)' },
            subject: { reference: `Patient/${user.id}`, display: 'Vaibhav Rathod' },
            effectiveDateTime: new Date().toISOString(),
            performer: [{ display: 'Apollo Diagnostics' }],
            resultsInterpreter: [{ display: 'Dr. Rajesh Sharma' }],
            category: [{ coding: [{ display: 'Blood Work' }] }],
            conclusion: 'Blood test results are within normal limits. Haemoglobin: 14.2 g/dL.'
        },
        {
            resourceType: 'DiagnosticReport',
            status: 'final',
            code: { text: 'Lipid Profile' },
            subject: { reference: `Patient/${user.id}`, display: 'Vaibhav Rathod' },
            effectiveDateTime: new Date(Date.now() - 86400000 * 5).toISOString(),
            performer: [{ display: 'SRL Diagnostics' }],
            resultsInterpreter: [{ display: 'Dr. Amit Patel' }],
            category: [{ coding: [{ display: 'Blood Work' }] }],
            conclusion: 'Total Cholesterol: 210 mg/dL (borderline high). LDL: 142 mg/dL.'
        }
    ];

    for (const rec of records) {
        const id = crypto.randomUUID();
        const resourceWithId = { ...rec, id };

        const { error } = await supabaseAdmin
            .from('fhir_resources')
            .insert({
                id: id,
                resource_type: 'DiagnosticReport',
                resource: resourceWithId
            });

        if (error) console.error('Error inserting record:', error);
        else console.log(`Inserted record: ${rec.code.text}`);
    }
}

seedRecords().catch(console.error);
