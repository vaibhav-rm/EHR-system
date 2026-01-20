import { NextRequest, NextResponse } from 'next/server';
import { fhirStore } from '@/lib/fhir-store';
import { InvoiceSchema } from '@/lib/schemas';
import { v4 as uuidv4 } from 'uuid';
import { Invoice } from 'fhir/r4';

// POST /api/fhir/Invoice
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validationResult = InvoiceSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid Invoice data', details: validationResult.error.format() },
                { status: 400 }
            );
        }

        const invoiceData: Invoice = {
            ...validationResult.data,
            id: uuidv4(),
        } as Invoice;

        const newInvoice = await fhirStore.create(invoiceData);
        return NextResponse.json(newInvoice, { status: 201 });
    } catch (error) {
        console.error('Error creating Invoice:', error);
        return NextResponse.json(
            { error: 'Failed to create Invoice' },
            { status: 500 }
        );
    }
}

// GET /api/fhir/Invoice?patient=Patient/123
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const patientRef = searchParams.get('patient'); // Filter by patient

        // If no patient filter, might return all (for Hospital Admin)

        const invoices = await fhirStore.search('Invoice', (inv: Invoice) => {
            if (patientRef && inv.subject?.reference !== patientRef) return false;
            return true;
        });

        const bundle = {
            resourceType: 'Bundle',
            type: 'searchset',
            total: invoices.length,
            entry: invoices.map((resource) => ({
                resource,
            })),
        };

        return NextResponse.json(bundle);
    } catch (error) {
        console.error('Error fetching Invoices:', error);
        return NextResponse.json(
            { error: 'Failed to fetch Invoices' },
            { status: 500 }
        );
    }
}
