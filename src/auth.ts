import NextAuth, { CredentialsSignin } from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;

                    // 1. Authenticate with Supabase Auth
                    const { supabase } = await import('@/lib/supabase');
                    const { data, error } = await supabase.auth.signInWithPassword({
                        email,
                        password,
                    });

                    if (error || !data.user) {
                        console.error("Supabase Auth Failed:", error?.message);
                        // Optional: Fallback to Admin Override for demo if auth fails
                        if (email === 'admin@moh.gov.in' && password === 'admin123') {
                            return { id: 'admin', name: 'System Admin', email: 'admin@moh.gov.in', role: 'admin' };
                        }

                        if (error?.message?.includes("Email not confirmed")) {
                            throw new CredentialsSignin("Email not confirmed");
                        }
                        // Throw specific error for invalid credentials
                        throw new CredentialsSignin("Invalid credentials");
                    }

                    // 2. Fetch User Profile / Role from FHIR Store (Optional but good for role mapping)
                    // We assume the user exists in our FHIR store as Patient or Practitioner if they have an account.
                    const { fhirStore } = await import('@/lib/fhir-store');
                    const fhirUser = await fhirStore.findUserByEmail(email) as any;

                    if (fhirUser) {
                        return {
                            id: data.user.id, // Use Supabase Auth ID
                            fhirId: fhirUser.id,
                            name: fhirUser.name,
                            email: email,
                            role: fhirUser.role
                        };
                    } else {
                        // Default fallback if no FHIR resource found but Auth passed
                        return {
                            id: data.user.id,
                            name: email.split('@')[0],
                            email: email,
                            role: 'patient' // Default role
                        };
                    }
                }

                console.log('Invalid credentials format');
                throw new CredentialsSignin("Invalid email or password format");
            },
        }),
    ],
});
