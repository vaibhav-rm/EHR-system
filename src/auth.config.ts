import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnDoctorPortal = nextUrl.pathname.startsWith('/doctor');
            const userRole = (auth?.user as any)?.role;

            // Protect Dashboard (Patient) & Doctor Portal
            if (isOnDashboard || isOnDoctorPortal) {
                if (isLoggedIn) {
                    // Role-Based Access Control
                    // If Patient tries to access Doctor portal -> Redirect to Patient Dashboard
                    if (userRole === 'patient' && isOnDoctorPortal) {
                        return Response.redirect(new URL('/dashboard', nextUrl));
                    }
                    // If Doctor tries to access Patient Dashboard -> Redirect to Doctor Portal
                    // (Assuming /dashboard is strictly for patients, or shared? Usually safer to separate)
                    if (userRole === 'doctor' && isOnDashboard) {
                        return Response.redirect(new URL('/doctor', nextUrl));
                    }
                    return true;
                }
                return false; // Redirect unauthenticated to login
            } else if (isLoggedIn) {
                // Redirect authenticated users away from Login/Landing pages if they try to visit them?
                // Specifically /login
                if (nextUrl.pathname === '/login') {
                    if (userRole === 'doctor') return Response.redirect(new URL('/doctor', nextUrl));
                    return Response.redirect(new URL('/dashboard', nextUrl));
                }
            }
            return true;
        },
        // Add role to session
        async session({ session, token }) {
            if (session.user) {
                if (token.sub) {
                    session.user.id = token.sub;
                }
                if (token.role) {
                    (session.user as any).role = token.role;
                }
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
