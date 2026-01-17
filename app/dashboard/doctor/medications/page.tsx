'use client';

import { PrescriptionForm } from '@/components/fhir-ui/PrescriptionForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { PrescriptionList } from '@/components/fhir-ui/PrescriptionList';

export default function DoctorMedicationsPage() {
  const [patientId, setPatientId] = useState('');
  const [confirmedPatientId, setConfirmedPatientId] = useState('');
  const doctorId = 'doc1'; // Mock doctor ID

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">e-Prescriptions</h1>
        <p className="text-muted-foreground">
          Issue new prescriptions and view active medications.
        </p>
      </div>

        {!confirmedPatientId ? (
             <Card className="max-w-md">
                <CardHeader>
                    <CardTitle>Select Patient</CardTitle>
                    <CardDescription>Enter Patient ID to prescribe medication.</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                    <div className="grid gap-2 flex-1">
                        <Label htmlFor="pid">Patient ID</Label>
                        <Input 
                            id="pid" 
                            placeholder="e.g. pat1" 
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                        />
                    </div>
                    <div className="flex items-end">
                        <Button onClick={() => setConfirmedPatientId(patientId)} disabled={!patientId}>
                            <Search className="h-4 w-4 mr-2" />
                            Find
                        </Button>
                    </div>
                </CardContent>
            </Card>
        ) : (
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>New Prescription</CardTitle>
                        <CardDescription>
                            Issuing for Patient: {confirmedPatientId}
                            <Button variant="link" className="p-0 h-auto ml-2" onClick={() => setConfirmedPatientId('')}>Change</Button>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PrescriptionForm patientId={confirmedPatientId} doctorId={doctorId} />
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Active Medications</CardTitle>
                        <CardDescription>
                            Current list for this patient.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PrescriptionList patientId={confirmedPatientId} />
                    </CardContent>
                </Card>
            </div>
        )}
    </div>
  );
}
