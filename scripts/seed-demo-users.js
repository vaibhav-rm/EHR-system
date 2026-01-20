const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('Missing environment variables!');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function seedUser(email, password, name, role) {
    console.log(`Creating ${role} account: ${email}`);

    // Check if user already exists in auth
    const { data: listUsers } = await supabaseAdmin.auth.admin.listUsers();
    let existingUser = listUsers.users.find(u => u.email === email);
    let userId;

    if (existingUser) {
        console.log(`Auth user already exists: ${email}`);
        userId = existingUser.id;
    } else {
        // Create Auth User
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: name,
                role: role
            }
        });

        if (authError) {
            console.error(`Error creating auth user (${email}):`, authError.message);
            return;
        }
        userId = authData.user.id;
        console.log(`Auth User created for ${email}. ID: ${userId}`);
    }

    // Create FHIR Resource
    const resourceType = role === 'doctor' ? 'Practitioner' : 'Patient';
    const resource = {
        resourceType: resourceType,
        id: userId,
        active: true,
        name: [{
            use: 'official',
            text: name,
            family: name.split(' ').pop(),
            given: name.split(' ').slice(0, -1)
        }],
        telecom: [{
            system: 'email',
            value: email,
            use: 'work'
        }]
    };

    const { error: dbError } = await supabaseAdmin
        .from('fhir_resources')
        .upsert({
            id: userId,
            resource_type: resourceType,
            resource: resource
        });

    if (dbError) {
        console.error(`Error creating ${resourceType} resource:`, dbError.message);
    } else {
        console.log(`${resourceType} FHIR resource created/updated successfully.`);
    }
}

async function run() {
    await seedUser('patient@example.com', 'patient123', 'John Patient', 'patient');
    await seedUser('doctor@example.com', 'doctor123', 'Dr. Jane Doctor', 'doctor');
    process.exit(0);
}

run().catch(console.error);
