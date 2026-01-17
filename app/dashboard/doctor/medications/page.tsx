import { auth } from "@/auth";
import { getDoctorPrescriptions } from "@/app/actions/clinical";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PrescriptionForm } from "@/components/fhir-ui/PrescriptionForm";
import { Pill, User } from "lucide-react";

export default async function DoctorMedicationsPage() {
  const session = await auth();
  const doctorId = session?.user?.id;
  const prescriptions = await getDoctorPrescriptions(doctorId || '');

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* WRITE PRESCRIPTION COLUMN */}
      <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
            <p className="text-muted-foreground">Issue e-prescriptions to your patients.</p>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>New Prescription</CardTitle>
                <CardDescription>Select a patient and prescribe medication.</CardDescription>
            </CardHeader>
            <CardContent>
                <PrescriptionForm doctorId={doctorId || ''} />
            </CardContent>
        </Card>
      </div>

      {/* HISTORY COLUMN */}
      <div className="space-y-6">
        <div>
            <h2 className="text-xl font-semibold">Recent Prescriptions</h2>
            <p className="text-sm text-muted-foreground">History of meds you have prescribed.</p>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {prescriptions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                    No history found.
                </div>
            ) : (
                prescriptions.map((script: any) => (
                    <Card key={script.id}>
                        <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                    <Pill className="h-4 w-4 text-blue-500" />
                                    {script.medicationCodeableConcept?.text}
                                </CardTitle>
                                <Badge variant="outline" className="text-[10px] uppercase">
                                    {script.status}
                                </Badge>
                            </div>
                            <CardDescription className="text-xs flex items-center gap-1">
                                <User className="h-3 w-3" /> {script.patientName}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-2 text-sm text-gray-600 dark:text-gray-300">
                            <p><strong>Dosage:</strong> {script.dosageInstruction?.[0]?.doseAndRate?.[0]?.type?.text || 'Standard'}</p>
                            <p className="mt-1"><strong>Instructions:</strong> {script.dosageInstruction?.[0]?.text}</p>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
      </div>
    </div>
  );
}
