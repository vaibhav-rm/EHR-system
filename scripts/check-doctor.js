const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually load .env.local
try {
    const envPath = path.join(__dirname, '../.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^"|"$/g, '');
            process.env[key] = value;
        }
    });
} catch (e) { }

async function check() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const email = 'doctor@example.com';
    const { data: practitionerData, error } = await supabaseAdmin
        .from('fhir_resources')
        .select('*')
        .eq('resource_type', 'Practitioner')
        .contains('resource', { telecom: [{ system: 'email', value: email }] });

    console.log('Practitioner Data:', JSON.stringify(practitionerData, null, 2));
    if (error) console.error('Error:', error);

    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const user = authUsers.users.find(u => u.email === email);
    console.log('Auth User:', user ? { id: user.id, email: user.email, metadata: user.user_metadata } : 'Not found');
}

check().catch(console.error);
