
import { supabase, supabaseAdmin } from './supabase';

export const fhirStore = {
    search: async (resourceType: string, predicate: (item: any) => boolean) => {
        try {
            const { data, error } = await supabaseAdmin
                .from('fhir_resources')
                .select('resource')
                .eq('resource_type', resourceType);

            if (error) {
                console.error(`Supabase Search Error (${resourceType}):`, error);
                return [];
            }

            const items = data?.map(row => row.resource) || [];
            return items.filter(predicate);
        } catch (e) {
            console.error("FHIR Store Crash:", e);
            return [];
        }
    },

    create: async (resource: any) => {
        try {
            if (!resource.id) {
                resource.id = crypto.randomUUID();
            }

            const { data, error } = await supabaseAdmin
                .from('fhir_resources')
                .insert({
                    id: resource.id,
                    resource_type: resource.resourceType,
                    resource: resource
                })
                .select()
                .single();

            if (error) {
                console.error("Supabase Create Error:", error);
                throw error;
            }

            return data?.resource || resource;
        } catch (e) {
            console.error("FHIR Create Failed:", e);
            throw e;
        }
    },

    update: async <T = any>(id: string, resource: T): Promise<T | null> => {
        try {
            const { data, error } = await supabaseAdmin
                .from('fhir_resources')
                .update({ resource: resource })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error("Supabase Update Error:", error);
                throw error;
            }

            return data?.resource || null;
        } catch (e) {
            console.error("FHIR Update Failed:", e);
            throw e;
        }
    },

    findUserByEmail: async (email: string) => {
        // NOTE: This is a tricky part. Accessing 'auth.users' typically requires Service Role Key
        // (supabaseAdmin). Standard client cannot search users by email directly for security.
        // However, for this simplified prototype, we might rely on the frontend passing a valid session
        // OR we just use a 'Person' or 'Practitioner' resource in our FHIR store to represent the user profile.

        // Let's try to find a Practitioner or Patient with this email in our fhir_resources first
        // This allows us to store role info in the FHIR resource.

        const { data: practitionerData } = await supabaseAdmin
            .from('fhir_resources')
            .select('resource')
            .eq('resource_type', 'Practitioner')
            .contains('resource', { telecom: [{ system: 'email', value: email }] });

        if (practitionerData && practitionerData.length > 0) {
            const p = practitionerData[0].resource;
            return {
                id: p.id,
                fhirId: p.id,
                name: p.name?.[0]?.text || 'Doctor',
                email,
                role: 'doctor',
                // Note: We cannot retrieve the password hash from here to compare.
                // Verification must be done via supabase.auth.signInWithPassword in the detailed auth flow.
                // BUT, NextAuth Credentials provider expects us to verify here if we returned the user object.
                // Since we are moving to Supabase Auth, NextAuth is acting as a wrapper/session manager.
                // The `authorize` function in auth.ts should perform the Supabase Sign In.
            };
        }

        const { data: patientData } = await supabaseAdmin
            .from('fhir_resources')
            .select('resource')
            .eq('resource_type', 'Patient')
            .contains('resource', { telecom: [{ system: 'email', value: email }] });

        if (patientData && patientData.length > 0) {
            const p = patientData[0].resource;
            return {
                id: p.id,
                fhirId: p.id,
                name: p.name?.[0]?.text || 'Patient',
                email,
                role: 'patient'
            };
        }

        // 3. Try to find a 'User' resource (Compatibility for root/app signup)
        const { data: userData } = await supabaseAdmin
            .from('fhir_resources')
            .select('resource')
            .eq('resource_type', 'User')
            .contains('resource', { email: email });

        if (userData && userData.length > 0) {
            const u = userData[0].resource;
            return {
                id: u.id,
                fhirId: u.fhirId || u.id,
                name: u.name,
                email: email,
                role: u.role,
                password: u.password // Note: Plaintext or hashed depending on signup logic
            };
        }

        return null;
    },

    createUser: async (user: any) => {
        // Compatibility shim for existing signup actions
        // In this version, we store 'User' resources in the fhir_resources table
        return fhirStore.create({
            ...user,
            resourceType: 'User'
        });
    },

    // --- NEW METHODS FOR CLINICAL ACTIONS ---

    createAppointment: async (appointment: any) => {
        return fhirStore.create({
            ...appointment,
            resourceType: 'Appointment'
        });
    },

    findAppointmentsByPatient: async (patientId: string) => {
        return fhirStore.search('Appointment', (appt: any) =>
            appt.participant?.some((p: any) => p.actor?.reference === `Patient/${patientId}`)
        );
    },

    findAppointmentsByPractitioner: async (practitionerId: string) => {
        return fhirStore.search('Appointment', (appt: any) =>
            appt.participant?.some((p: any) => p.actor?.reference === `Practitioner/${practitionerId}`)
        );
    },

    createMedicationRequest: async (medication: any) => {
        return fhirStore.create({
            ...medication,
            resourceType: 'MedicationRequest'
        });
    },

    findMedicationsByPatient: async (patientId: string) => {
        return fhirStore.search('MedicationRequest', (m: any) =>
            m.subject?.reference === `Patient/${patientId}`
        );
    },

    findMedicationsByPractitioner: async (practitionerId: string) => {
        return fhirStore.search('MedicationRequest', (m: any) =>
            m.requester?.reference === `Practitioner/${practitionerId}`
        );
    },

    getResource: async (resourceType: string, id: string) => {
        try {
            const { data, error } = await supabaseAdmin
                .from('fhir_resources')
                .select('resource')
                .eq('id', id)
                .eq('resource_type', resourceType)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                console.error(`Supabase Get Resource Error (${resourceType}/${id}):`, error);
                return null;
            }

            return data?.resource || null;
        } catch (e) {
            console.error("FHIR Store Crash (getResource):", e);
            return null;
        }
    }
};

