'use client';

import { useQuery } from '@tanstack/react-query';
import { Practitioner } from 'fhir/r4';
import { Loader2, Mail, Phone, UserCog } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

async function fetchStaff() {
  const res = await fetch('/api/fhir/Practitioner');
  if (!res.ok) throw new Error('Failed to fetch staff');
  const data = await res.json();
  return (data.entry?.map((e: any) => e.resource) || []) as Practitioner[];
}

export function HospitalStaffList() {
  const { data: staff, isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: fetchStaff,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Staff Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                No staff members registered.
              </TableCell>
            </TableRow>
          ) : (
            staff?.map((person) => {
               const name = person.name?.[0];
               const fullName = `${name?.given?.join(' ')} ${name?.family}`;
               const email = person.telecom?.find(t => t.system === 'email')?.value;
               const initials = `${name?.given?.[0]?.[0] || ''}${name?.family?.[0] || ''}`;

               return (
                <TableRow key={person.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        {fullName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <UserCog className="h-4 w-4 text-muted-foreground" />
                        <span>General Practitioner</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {email || '-'}
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">On Duty</Badge>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
