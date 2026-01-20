import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Fix path to .env.local assuming script is run from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('Missing env vars:', { supabaseUrl: !!supabaseUrl, serviceKey: !!serviceKey });
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function deleteMike() {
    console.log('Searching for mike@gmail.com...');

    // List users to find the ID
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    console.log(`Found ${users.length} users:`, users.map(u => u.email));

    const mike = users.find(u => u.email === 'mike@gmail.com');

    if (!mike) {
        console.log('User mike@gmail.com not found.');
        return;
    }

    console.log(`Found mike@gmail.com (ID: ${mike.id}). Deleting...`);

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(mike.id);

    if (deleteError) {
        console.error('Error deleting user:', deleteError);
    } else {
        console.log('Successfully deleted mike@gmail.com. You can now sign up again.');
    }
}

deleteMike().catch(console.error);
