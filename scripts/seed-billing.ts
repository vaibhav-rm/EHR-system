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

async function seedInvoices() {
    const targetEmail = 'rathodvaibhav401@gmail.com';
    console.log(`Searching for ${targetEmail}...`);

    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error || !users) return;
    const user = users.find(u => u.email === targetEmail);

    if (!user) {
        console.log('User not found');
        return;
    }

    const invoices = [
        {
            resourceType: 'Invoice',
            status: 'issued',
            date: new Date().toISOString(),
            subject: { reference: `Patient/${user.id}`, display: 'Vaibhav Rathod' },
            totalNet: { value: 1500, currency: 'INR' },
            totalGross: { value: 1500, currency: 'INR' },
            lineItem: [{
                chargeItemCodeableConcept: { text: "Cardiology Consultation" },
                priceComponent: [{ type: "base", amount: { value: 1500, currency: "INR" } }]
            }]
        },
        {
            resourceType: 'Invoice',
            status: 'balanced', // Paid
            date: new Date(Date.now() - 86400000 * 10).toISOString(),
            subject: { reference: `Patient/${user.id}`, display: 'Vaibhav Rathod' },
            totalNet: { value: 850, currency: 'INR' },
            lineItem: [{
                chargeItemCodeableConcept: { text: "Blood Test" },
                priceComponent: [{ type: "base", amount: { value: 850, currency: "INR" } }]
            }]
        }
    ];

    for (const inv of invoices) {
        const id = crypto.randomUUID();
        const resourceWithId = { ...inv, id };

        const { error } = await supabaseAdmin
            .from('fhir_resources')
            .insert({
                id: id,
                resource_type: 'Invoice',
                resource: resourceWithId
            });

        if (error) console.error('Error inserting invoice:', error);
        else console.log(`Inserted invoice: ${inv.lineItem[0].chargeItemCodeableConcept.text}`);
    }
}

seedInvoices().catch(console.error);
