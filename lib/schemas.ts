
import { z } from 'zod';

export const OrganizationSchema = z.object({
    resourceType: z.literal('Organization'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    type: z.array(z.object({
        coding: z.array(z.object({
            system: z.string().optional(),
            code: z.string().optional(),
            display: z.string().optional()
        })).optional(),
        text: z.string().optional()
    })).optional(),
    telecom: z.array(z.object({
        system: z.enum(['phone', 'fax', 'email', 'pager', 'url', 'sms', 'other']),
        value: z.string(),
        use: z.enum(['home', 'work', 'temp', 'old', 'mobile']).optional()
    })).optional()
});

export const PractitionerSchema = z.object({
    resourceType: z.literal('Practitioner'),
    name: z.array(z.object({
        use: z.enum(['official', 'usual', 'common']).optional(),
        family: z.string().min(1, 'Family name is required'),
        given: z.array(z.string()).min(1, 'Given name is required'),
        prefix: z.array(z.string()).optional()
    })).min(1, 'Name is required'),
    telecom: z.array(z.object({
        system: z.enum(['phone', 'email', 'pager', 'other']),
        value: z.string().min(1, 'Contact value is required'),
        use: z.enum(['home', 'work', 'mobile']).optional()
    })).optional()
});

export const PatientSchema = z.object({
    resourceType: z.literal('Patient'),
    name: z.array(z.object({
        use: z.enum(['official', 'usual', 'old']).optional(),
        family: z.string().min(1, 'Family name is required'),
        given: z.array(z.string()).min(1, 'Given name is required')
    })).min(1, 'Name is required'),
    gender: z.enum(['male', 'female', 'other', 'unknown']),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    telecom: z.array(z.object({
        system: z.enum(['phone', 'email', 'mobile']).optional(),
        value: z.string().optional()
    })).optional()
});

export const ConditionSchema = z.object({
    resourceType: z.literal('Condition'),
    subject: z.object({
        reference: z.string().min(1, 'Patient reference is required')
    }),
    code: z.object({
        coding: z.array(z.object({
            system: z.string().optional(),
            code: z.string().optional(),
            display: z.string().min(1, 'Display text is required')
        })).optional(),
        text: z.string().optional()
    }).optional(),
    clinicalStatus: z.object({
        coding: z.array(z.object({
            code: z.enum(['active', 'recurrence', 'relapse', 'inactive', 'remission', 'resolved'])
        }))
    }).optional(),
    onsetDateTime: z.string().optional()
});

export const ObservationSchema = z.object({
    resourceType: z.literal('Observation'),
    status: z.enum(['registered', 'preliminary', 'final', 'amended']),
    code: z.object({
        coding: z.array(z.object({
            system: z.string().optional(),
            code: z.string().optional(),
            display: z.string().min(1, 'Display text is required')
        })).optional(),
        text: z.string().optional()
    }),
    subject: z.object({
        reference: z.string().min(1, 'Patient reference is required')
    }),
    valueQuantity: z.object({
        value: z.number(),
        unit: z.string(),
        system: z.string().optional(),
        code: z.string().optional()
    }).optional(),
    valueString: z.string().optional(),
    effectiveDateTime: z.string().optional()
});

export const DiagnosticReportSchema = z.object({
    resourceType: z.literal('DiagnosticReport'),
    status: z.enum(['registered', 'partial', 'preliminary', 'final']),
    code: z.object({
        coding: z.array(z.object({
            system: z.string().optional(),
            code: z.string().optional(),
            display: z.string().min(1, 'Display text is required')
        })).optional(),
        text: z.string().optional()
    }),
    subject: z.object({
        reference: z.string().min(1, 'Patient reference is required')
    }),
    result: z.array(z.object({
        reference: z.string()
    })).optional(),
    effectiveDateTime: z.string().optional()
});

export type OrganizationFormData = z.infer<typeof OrganizationSchema>;
export type PractitionerFormData = z.infer<typeof PractitionerSchema>;
export type PatientFormData = z.infer<typeof PatientSchema>;
export type ConditionFormData = z.infer<typeof ConditionSchema>;
export type ObservationFormData = z.infer<typeof ObservationSchema>;
export type DiagnosticReportFormData = z.infer<typeof DiagnosticReportSchema>;


export const AppointmentSchema = z.object({
    resourceType: z.literal('Appointment'),
    status: z.enum(['proposed', 'pending', 'booked', 'arrived', 'fulfilled', 'cancelled', 'noshow', 'entered-in-error', 'checked-in', 'waitlist']),
    description: z.string().min(1, 'Description is required'),
    start: z.string().min(1, 'Start time is required'),
    end: z.string().min(1, 'End time is required'),
    participant: z.array(z.object({
        actor: z.object({
            reference: z.string().min(1, 'Actor reference is required'),
            display: z.string().optional()
        }),
        status: z.enum(['accepted', 'declined', 'tentative', 'needs-action'])
    })).min(1, 'At least one participant is required')
});

export const MedicationRequestSchema = z.object({
    resourceType: z.literal('MedicationRequest'),
    status: z.enum(['active', 'on-hold', 'cancelled', 'completed', 'entered-in-error', 'stopped', 'draft', 'unknown']),
    intent: z.enum(['proposal', 'plan', 'order', 'original-order', 'reflex-order', 'filler-order', 'instance-order', 'option']),
    medicationCodeableConcept: z.object({
        coding: z.array(z.object({
            system: z.string().optional(),
            code: z.string().optional(),
            display: z.string().min(1, 'Medication name is required')
        })).optional(),
        text: z.string().optional()
    }),
    subject: z.object({
        reference: z.string().min(1, 'Patient reference is required')
    }),
    dosageInstruction: z.array(z.object({
        text: z.string().min(1, 'Dosage instructions are required'),
        timing: z.object({
            repeat: z.object({
                frequency: z.number().optional(),
                period: z.number().optional(),
                periodUnit: z.enum(['s', 'min', 'h', 'd', 'wk', 'mo', 'a']).optional()
            }).optional()
        }).optional()
    })).optional(),
    authoredOn: z.string().optional(),
    requester: z.object({
        reference: z.string().optional(),
        display: z.string().optional()
    }).optional()
});

export type MedicationRequestFormData = z.infer<typeof MedicationRequestSchema>;

export const InvoiceSchema = z.object({
    resourceType: z.literal('Invoice'),
    status: z.enum(['draft', 'issued', 'balanced', 'cancelled', 'entered-in-error']),
    subject: z.object({
        reference: z.string().min(1, 'Patient reference is required')
    }),
    date: z.string().optional(),
    totalNet: z.object({
        value: z.number().min(0, 'Amount must be positive'),
        currency: z.string().default('USD')
    }).optional(),
    lineItem: z.array(z.object({
        chargeItemCodeableConcept: z.object({
            coding: z.array(z.object({
                code: z.string().optional(),
                display: z.string().optional()
            })).optional(),
            text: z.string().optional()
        }).optional()
    })).optional()
});

export type InvoiceFormData = z.infer<typeof InvoiceSchema>;

export type AppointmentFormData = z.infer<typeof AppointmentSchema>;
