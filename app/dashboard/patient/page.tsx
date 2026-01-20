import { MedicalHistoryList } from '@/components/fhir-ui/MedicalHistoryList';
import { VitalsHistory } from '@/components/fhir-ui/VitalsHistory';
import { LabReportList } from '@/components/fhir-ui/LabReportList';
import { PrescriptionList } from '@/components/fhir-ui/PrescriptionList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button';
import { FileDown, Share2 } from 'lucide-react';
import { auth } from '@/auth';

export default async function PatientDashboard() {
  const session = await auth();
  const user = session?.user;
  // Fallback for demo if no specific patient ID is found in session (mock behavior)
  const patientId = user?.id || 'pat1'; 

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">My Health Record</h1>
            <p className="text-muted-foreground">
            View your medical history, test results, and vitals.
            </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" /> Share Record
            </Button>
             <Button>
                <FileDown className="mr-2 h-4 w-4" /> Download PDF
            </Button>
        </div>
      </div>

      <Card>
          <CardHeader>
              <CardTitle>Vitals History</CardTitle>
              <CardDescription>
                  Your recorded vital signs over time.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <VitalsHistory />
          </CardContent>
      </Card>

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
            <TabsTrigger value="history">Medical History</TabsTrigger>
            <TabsTrigger value="reports">Lab Reports</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
        </TabsList>
        <TabsContent value="history" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Conditions & Diagnoses</CardTitle>
                    <CardDescription>
                        A timeline of your diagnosed conditions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MedicalHistoryList />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="reports">
            <Card>
                <CardHeader>
                    <CardTitle>Diagnostic Reports</CardTitle>
                    <CardDescription>
                        Results from your recent lab tests and imaging.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <LabReportList patientId={patientId} />
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="medications">
            <Card>
                <CardHeader>
                    <CardTitle>Current Medications</CardTitle>
                    <CardDescription>
                        Active prescriptions and dosage instructions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <PrescriptionList patientId={patientId} />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
