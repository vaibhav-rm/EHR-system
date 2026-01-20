
'use client';

import { useQuery } from '@tanstack/react-query';
import { Organization, Bundle } from 'fhir/r4';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Building2 } from 'lucide-react';

async function fetchHospitals(): Promise<Organization[]> {
  const res = await fetch('/api/fhir/Organization');
  if (!res.ok) throw new Error('Failed to fetch hospitals');
  const bundle: Bundle = await res.json();
  return (bundle.entry?.map(e => e.resource as Organization) || []);
}

export function HospitalList() {
  const { data: hospitals, isLoading, error } = useQuery({
    queryKey: ['organizations'],
    queryFn: fetchHospitals
  });

  if (isLoading) return <div>Loading hospitals...</div>;
  if (error) return <div className="text-red-500">Error loading hospitals</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {hospitals?.map((org) => (
        <Card key={org.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {org.name}
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{org.type?.[0]?.text || 'Hospital'}</div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center">
              <Phone className="h-3 w-3 mr-1" />
              {org.telecom?.[0]?.value || 'No contact info'}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
