import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('--- Supabase Diagnostic ---');
console.log('URL:', supabaseUrl ? supabaseUrl.slice(0, 20) + '...' : 'MISSING');
console.log('Service Key:', serviceKey ? 'Present (' + serviceKey.slice(0, 5) + '...)' : 'MISSING');

if (!supabaseUrl || !serviceKey) {
    console.error('CRITICAL: Missing environment variables!');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function diagnose() {
    // 1. Check Auth Users
    console.log('\nChecking Auth Users...');
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
        console.error('Error listing auth users:', authError.message);
    } else {
        console.log(`Found ${users.length} users in Auth system.`);
        users.forEach(u => console.log(` - ${u.email} (ID: ${u.id})`));
    }

    // 2. Check fhir_resources table
    console.log('\nChecking fhir_resources table...');
    const { count, error: dbError } = await supabaseAdmin
        .from('fhir_resources')
        .select('*', { count: 'exact', head: true });

    if (dbError) {
        console.error('Error accessing fhir_resources:', dbError.message);
        if (dbError.code === '42P01') console.error('HINT: Table "fhir_resources" might not exist.');
    } else {
        console.log(`Found ${count} rows in fhir_resources.`);
    }

    // 3. List first 3 resources to verify content
    const { data: resources } = await supabaseAdmin
        .from('fhir_resources')
        .select('resource_type, id')
        .limit(3);

    if (resources && resources.length > 0) {
        console.log('Sample rows:', resources);
    }
}

diagnose().catch(console.error);
