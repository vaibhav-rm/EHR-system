'use client';

import { useQuery } from '@tanstack/react-query';
import { Patient, Condition } from 'fhir/r4';
import { Loader2, Search, FileText, Pill, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

async function fetchPatients(search: string) {
  const params = new URLSearchParams();
  if (search) params.append('name', search);
  
  const res = await fetch(`/api/fhir/Patient?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch patients');
  const data = await res.json();
  return (data.entry?.map((e: any) => e.resource) || []) as Patient[];
}

export function DoctorPatientTable() {
  const [search, setSearch] = useState('');
  
  const { data: patients, isLoading, error } = useQuery({
    queryKey: ['patients', search],
    queryFn: () => fetchPatients(search),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search patients..." 
                className="pl-8" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        <Button>Add Patient</Button>
      </div>

      <div className="border rounded-md">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>DOB</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {isLoading ? (
                <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
                </TableRow>
            ) : patients?.length === 0 ? (
                <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No patients found.
                </TableCell>
                </TableRow>
            ) : (
                patients?.map((patient) => {
                const name = patient.name?.[0];
                const fullName = `${name?.given?.join(' ')} ${name?.family}`;
                
                return (
                    <TableRow key={patient.id}>
                    <TableCell className="font-medium">{fullName}</TableCell>
                    <TableCell className="capitalize">{patient.gender}</TableCell>
                    <TableCell>{patient.birthDate}</TableCell>
                    <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Active
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" /> View Records
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Pill className="mr-2 h-4 w-4" /> Prescribe Meds
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    </TableRow>
                );
                })
            )}
            </TableBody>
        </Table>
      </div>
    </div>
  );
}
