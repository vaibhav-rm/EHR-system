import { InvoiceList } from '@/components/fhir-ui/InvoiceList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

export default function PatientBillingPage() {
    const patientId = 'pat1'; 

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Insurance</h1>
        <p className="text-muted-foreground">
          View your invoices and insurance details.
        </p>
      </div>

        <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-6 w-6" />
                        Insurance Card
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                    <div className="text-sm opacity-80">Provider</div>
                    <div className="text-xl font-bold">National Health Insurance</div>
                    <div className="mt-4 flex justify-between">
                         <div>
                            <div className="text-sm opacity-80">Policy No</div>
                            <div className="font-semibold">NHS-8829-1029</div>
                         </div>
                         <div className="text-right">
                             <div className="text-sm opacity-80">Valid Thru</div>
                             <div className="font-semibold">12/30</div>
                         </div>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Outstanding Balance</CardTitle>
                    <CardDescription>Total amount due</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-primary">$0.00</div>
                    <p className="text-sm text-muted-foreground mt-2">No pending payments.</p>
                </CardContent>
            </Card>
        </div>

       <Card>
        <CardHeader>
            <CardTitle>Invoice History</CardTitle>
            <CardDescription>
                Past transactions and visits.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <InvoiceList patientId={patientId} />
        </CardContent>
    </Card>
    </div>
  );
}
