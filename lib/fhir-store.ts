
import fs from 'fs/promises';
import path from 'path';
import { Resource } from 'fhir/r4';

const DB_PATH = path.join(process.cwd(), 'data', 'fhir-db.json');

type FhirDatabase = Record<string, Record<string, Resource>>;

async function ensureDb() {
    try {
        await fs.access(DB_PATH);
    } catch {
        await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
        await fs.writeFile(DB_PATH, JSON.stringify({}, null, 2));
    }
}

async function readDb(): Promise<FhirDatabase> {
    await ensureDb();
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
}

async function writeDb(data: FhirDatabase) {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

export const fhirStore = {
    async create<T extends Resource>(resource: T): Promise<T> {
        const db = await readDb();
        const type = resource.resourceType;
        if (!db[type]) db[type] = {};

        // Simple ID generation
        if (!resource.id) {
            resource.id = crypto.randomUUID();
        }

        db[type][resource.id] = resource;
        await writeDb(db);
        return resource;
    },

    async read<T extends Resource>(type: string, id: string): Promise<T | null> {
        const db = await readDb();
        return (db[type]?.[id] as T) || null;
    },

    async search<T extends Resource>(type: string, query?: (r: T) => boolean): Promise<T[]> {
        const db = await readDb();
        const resources = Object.values(db[type] || {}) as T[];
        if (query) {
            return resources.filter(query);
        }
        return resources;
    },

    async update<T extends Resource>(resource: T): Promise<T> {
        if (!resource.id) throw new Error('Resource ID required for update');
        const db = await readDb();
        const type = resource.resourceType;
        if (!db[type] || !db[type][resource.id]) {
            throw new Error('Resource not found');
        }
        db[type][resource.id] = resource;
        await writeDb(db);
        return resource;
    },

    // User Management Helpers
    async createUser(user: any) {
        const db = await readDb();
        if (!db['User']) db['User'] = {};

        // Simple duplicate check
        const existing = Object.values(db['User']).find((u: any) => u.email === user.email);
        if (existing) throw new Error('User already exists');

        if (!user.id) user.id = crypto.randomUUID();
        db['User'][user.id] = user;
        await writeDb(db);
        return user;
    },

    async findUserByEmail(email: string) {
        const db = await readDb();
        return Object.values(db['User'] || {}).find((u: any) => u.email === email);
    },

    // --- APPOINTMENTS ---
    async createAppointment(appointment: any) {
        const db = await readDb();
        if (!db['Appointment']) db['Appointment'] = {};

        if (!appointment.id) appointment.id = crypto.randomUUID();
        if (!appointment.status) appointment.status = 'booked';

        db['Appointment'][appointment.id] = appointment;
        await writeDb(db);
        return appointment;
    },

    async findAppointmentsByPatient(patientId: string) {
        const db = await readDb();
        const appointments = Object.values(db['Appointment'] || {});
        // Search in participant list for the patient reference
        return appointments.filter((appt: any) =>
            appt.participant?.some((p: any) => p.actor?.reference === `Patient/${patientId}`)
        );
    },

    async findAppointmentsByPractitioner(practitionerId: string) {
        const db = await readDb();
        const appointments = Object.values(db['Appointment'] || {});
        // Search in participant list for the practitioner reference
        return appointments.filter((appt: any) =>
            appt.participant?.some((p: any) => p.actor?.reference === `Practitioner/${practitionerId}`)
        );
    },

    // --- MEDICATIONS ---
    async createMedicationRequest(medication: any) {
        const db = await readDb();
        if (!db['MedicationRequest']) db['MedicationRequest'] = {};

        if (!medication.id) medication.id = crypto.randomUUID();
        if (!medication.status) medication.status = 'active';

        db['MedicationRequest'][medication.id] = medication;
        await writeDb(db);
        return medication;
    },

    async findMedicationsByPatient(patientId: string) {
        const db = await readDb();
        const meds = Object.values(db['MedicationRequest'] || {});
        return meds.filter((m: any) => m.subject?.reference === `Patient/${patientId}`);
    },

    async findMedicationsByPractitioner(practitionerId: string) {
        const db = await readDb();
        const meds = Object.values(db['MedicationRequest'] || {});
        return meds.filter((m: any) => m.requester?.reference === `Practitioner/${practitionerId}`);
    },

    // --- GENERIC GET ---
    async getResource(type: string, id: string) {
        const db = await readDb();
        return db[type]?.[id] || null;
    }
};
