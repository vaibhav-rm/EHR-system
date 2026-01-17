import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const userRole = (auth?.user as any)?.role;

            if (isOnDashboard) {
                if (isLoggedIn) {
                    // Role-Based Redirects
                    if (userRole === 'patient' && nextUrl.pathname.startsWith('/dashboard/doctor')) {
                        return Response.redirect(new URL('/dashboard/patient', nextUrl));
                    }
                    if (userRole === 'doctor' && nextUrl.pathname.startsWith('/dashboard/patient')) {
                        return Response.redirect(new URL('/dashboard/doctor', nextUrl));
                    }
                    return true;
                }
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn && nextUrl.pathname === '/login') {
                // Smart redirect based on role
                if (userRole === 'doctor') return Response.redirect(new URL('/dashboard/doctor', nextUrl));
                if (userRole === 'patient') return Response.redirect(new URL('/dashboard/patient', nextUrl));
                if (userRole === 'admin') return Response.redirect(new URL('/dashboard/hospital', nextUrl));
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
        // Add role to session
        async session({ session, token }) {
            if (token.role && session.user) {
                (session.user as any).role = token.role;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
            }
            return token;
        }
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
