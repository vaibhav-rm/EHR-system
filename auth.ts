import NextAuth from 'next-auth';
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

                    // Admin Override for Demo (Always available)
                    if (email === 'admin@moh.gov.in' && password === 'admin123') {
                        return { id: 'admin', name: 'System Admin', email: 'admin@moh.gov.in', role: 'admin' };
                    }

                    // Check DB
                    const { fhirStore } = await import('@/lib/fhir-store');
                    const user = await fhirStore.findUserByEmail(email) as any;

                    if (user && user.password === password) {
                        return {
                            id: user.fhirId || user.id, // Use FHIR ID if linked, else User ID
                            name: user.name,
                            email: user.email,
                            role: user.role
                        };
                    }
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});
