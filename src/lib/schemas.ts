import { z } from "zod";

export const AppointmentSchema = z.object({
    resourceType: z.literal("Appointment"),
    status: z.enum(["booked", "arrived", "fulfilled", "cancelled", "noshow", "entered-in-error", "checked-in", "waitlist"]),
    start: z.string().datetime(),
    end: z.string().datetime(),
    participant: z.array(z.object({
        actor: z.object({
            reference: z.string(),
            display: z.string().optional()
        }),
        status: z.enum(["accepted", "declined", "tentative", "needs-action"])
    })).optional(),
    description: z.string().optional()
});

export const MedicationRequestSchema = z.object({
    resourceType: z.literal("MedicationRequest"),
    status: z.enum(["active", "on-hold", "cancelled", "completed", "entered-in-error", "stopped", "draft", "unknown"]),
    intent: z.enum(["proposal", "plan", "order", "original-order", "reflex-order", "filler-order", "instance-order", "option"]),
    medicationCodeableConcept: z.object({
        text: z.string().optional(),
        coding: z.array(z.object({
            system: z.string().optional(),
            code: z.string().optional(),
            display: z.string().optional()
        })).optional()
    }).optional(),
    subject: z.object({
        reference: z.string()
    }).optional(),
    requester: z.object({
        reference: z.string()
    }).optional()
});

export const InvoiceSchema = z.object({
    resourceType: z.literal("Invoice"),
    status: z.enum(["draft", "issued", "balanced", "cancelled", "entered-in-error"]),
    date: z.string().datetime().optional(),
    totalGross: z.object({
        value: z.number(),
        currency: z.string().optional()
    }).optional()
});
