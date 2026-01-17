
'use client';

import { useQuery } from '@tanstack/react-query';
import { Practitioner, Bundle } from 'fhir/r4';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, User } from 'lucide-react';

async function fetchPractitioners(): Promise<Practitioner[]> {
  const res = await fetch('/api/fhir/Practitioner');
  if (!res.ok) throw new Error('Failed to fetch practitioners');
  const bundle: Bundle = await res.json();
  return (bundle.entry?.map(e => e.resource as Practitioner) || []);
}

export function PractitionerList() {
  const { data: doctors, isLoading, error } = useQuery({
    queryKey: ['practitioners'],
    queryFn: fetchPractitioners
  });

  if (isLoading) return <div>Loading doctors...</div>;
  if (error) return <div className="text-red-500">Error loading doctors</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {doctors?.map((doc) => {
        const name = doc.name?.[0];
        const fullName = `${name?.prefix ? name.prefix.join(' ') + ' ' : ''}${name?.given?.join(' ')} ${name?.family}`;
        
        return (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                {fullName}
                </CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground mt-2 flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                {doc.telecom?.[0]?.value || 'No contact info'}
                </p>
            </CardContent>
            </Card>
        );
      })}
    </div>
  );
}
