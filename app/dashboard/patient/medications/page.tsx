import { auth } from "@/auth";
import { getPatientPrescriptions } from "@/app/actions/clinical";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill, Calendar, UserCheck } from "lucide-react";

export default async function PatientMedicationsPage() {
  const session = await auth();
  const patientId = session?.user?.id;
  const prescriptions = await getPatientPrescriptions(patientId || '');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Medications</h1>
        <p className="text-muted-foreground">Current active prescriptions and dosage instructions.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {prescriptions.length === 0 ? (
             <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                You have no active prescriptions.
            </div>
        ) : (
            prescriptions.map((script: any) => (
            <Card key={script.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Pill className="h-5 w-5 text-blue-600" />
                        {script.medicationCodeableConcept?.text}
                    </CardTitle>
                    <Badge className={script.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                        {script.status}
                    </Badge>
                </div>
                <CardDescription className="flex items-center gap-2 mt-1">
                     <UserCheck className="h-3 w-3" /> Prescribed by {script.doctorName}
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                    <div className="bg-muted p-3 rounded-md text-sm">
                        <p className="font-semibold text-foreground">Instructions:</p>
                        <p className="text-muted-foreground">{script.dosageInstruction?.[0]?.text}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <span className="font-medium">Dosage:</span>
                            {script.dosageInstruction?.[0]?.doseAndRate?.[0]?.type?.text || 'As directed'}
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(script.authoredOn).toLocaleDateString()}
                        </div>
                    </div>
                </CardContent>
            </Card>
            ))
        )}
      </div>
    </div>
  );
}
