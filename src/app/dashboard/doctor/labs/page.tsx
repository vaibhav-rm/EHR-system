'use client';

import { LabReportForm } from '@/components/fhir-ui/LabReportForm';
import { LabReportList } from '@/components/fhir-ui/LabReportList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function DoctorLabsPage() {
  const [patientId, setPatientId] = useState('');
  const [confirmedPatientId, setConfirmedPatientId] = useState('');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lab Reports</h1>
        <p className="text-muted-foreground">
          Upload and view diagnostic test results.
        </p>
      </div>

       {!confirmedPatientId ? (
             <Card className="max-w-md">
                <CardHeader>
                    <CardTitle>Select Patient</CardTitle>
                    <CardDescription>Enter Patient ID to manage labs.</CardDescription>
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
                        <CardTitle>Upload Report</CardTitle>
                        <CardDescription>
                            Create a new result for {confirmedPatientId}.
                            <Button variant="link" className="p-0 h-auto ml-2" onClick={() => setConfirmedPatientId('')}>Change Patient</Button>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LabReportForm patientId={confirmedPatientId} />
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Recent Results</CardTitle>
                        <CardDescription>
                            History for {confirmedPatientId}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LabReportList patientId={confirmedPatientId} />
                    </CardContent>
                </Card>
            </div>
        )}
    </div>
  );
}
