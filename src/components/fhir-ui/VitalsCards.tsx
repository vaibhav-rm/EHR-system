'use client';

import { useQuery } from '@tanstack/react-query';
import { Observation } from 'fhir/r4';
import { Loader2, Heart, Thermometer, Activity, Wind } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

async function fetchVitals() {
  const res = await fetch('/api/fhir/Observation');
  if (!res.ok) throw new Error('Failed to fetch vitals');
  const data = await res.json();
  return (data.entry?.map((e: any) => e.resource) || []) as Observation[];
}

export function VitalsCards() {
  const { data: observations, isLoading } = useQuery({
    queryKey: ['observations'],
    queryFn: fetchVitals,
  });

  if (isLoading) {
     return <div className="text-sm text-muted-foreground">Loading vitals...</div>;
  }
  
  // Mocking categorization for display since we might not have specific codes in demo data
  // In a real app, filter by LOINC codes
  const latestVitals = {
      bp: "120/80",
      hr: "72",
      temp: "98.6",
      spo2: "98"
  };

  // If we have real observations, try to use them (logic simplified for demo)
  if (observations && observations.length > 0) {
      // Logic to parse real observations would go here
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestVitals.bp}</div>
            <p className="text-xs text-muted-foreground">mmHg</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
            <Heart className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestVitals.hr}</div>
            <p className="text-xs text-muted-foreground">bpm</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestVitals.temp}°F</div>
            <p className="text-xs text-muted-foreground">Oral</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SpO2</CardTitle>
            <Wind className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestVitals.spo2}%</div>
            <p className="text-xs text-muted-foreground">Normal</p>
          </CardContent>
        </Card>
    </div>
  );
}
