import { PrescriptionList } from '@/components/fhir-ui/PrescriptionList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PatientMedicationsPage() {
    const patientId = 'pat1'; // Mock ID

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Medications</h1>
        <p className="text-muted-foreground">
          View your active prescriptions and history.
        </p>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Current Prescriptions</CardTitle>
            <CardDescription>
                Medications prescribed by your doctors.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <PrescriptionList patientId={patientId} />
        </CardContent>
    </Card>
    </div>
  );
}
