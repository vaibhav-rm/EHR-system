import { LabReportList } from '@/components/fhir-ui/LabReportList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PatientLabsPage() {
    const patientId = 'pat1'; // Mock ID

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Test Results</h1>
        <p className="text-muted-foreground">
          View and download your diagnostic reports.
        </p>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Lab Reports</CardTitle>
            <CardDescription>
                Blood work, imaging, and other test results.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <LabReportList patientId={patientId} />
        </CardContent>
    </Card>
    </div>
  );
}
