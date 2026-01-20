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

async function confirmUser() {
    const targetEmail = 'rathodvaibhav401@gmail.com';
    console.log(`Searching for ${targetEmail}...`);

    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    const user = users.find(u => u.email === targetEmail);

    if (!user) {
        console.log(`User ${targetEmail} not found.`);
        return;
    }

    console.log(`Found user (ID: ${user.id}). Status: ${user.email_confirmed_at ? 'Confirmed' : 'Unconfirmed'}`);

    if (!user.email_confirmed_at) {
        console.log('Confirming email now...');
        const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { email_confirm: true }
        );

        if (updateError) {
            console.error('Failed to confirm user:', updateError);
        } else {
            console.log('Successfully confirmed user email! You should be able to login now.');
        }
    } else {
        console.log('User is already confirmed. If login fails, check password.');
        // Optional: Reset password if needed, but let's just confirm first.
    }
}

confirmUser().catch(console.error);
