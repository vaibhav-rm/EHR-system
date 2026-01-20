'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { signupPatient, signupDoctor } from '@/app/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, User, Stethoscope } from 'lucide-react';

function SignupButton() {
    const { pending } = useFormStatus();
    return (
        <Button className="w-full" aria-disabled={pending}>
            {pending ? 'Creating Account...' : 'Create Account'}
        </Button>
    );
}

export default function SignupPage() {
    const [patientError, dispatchPatient] = useActionState(signupPatient, undefined);
    const [doctorError, dispatchDoctor] = useActionState(signupDoctor, undefined);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
             <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white dark:bg-gray-800">
                <Link className="flex items-center justify-center" href="/">
                    <Activity className="h-6 w-6 text-primary" />
                    <span className="ml-2 text-lg font-bold">National Health Stack</span>
                </Link>
            </header>
            
            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl">Create an Account</CardTitle>
                        <CardDescription>
                            Join the unified healthcare network.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="patient" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="patient">
                                    <User className="mr-2 h-4 w-4" /> Patient
                                </TabsTrigger>
                                <TabsTrigger value="doctor">
                                    <Stethoscope className="mr-2 h-4 w-4" /> Doctor
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="patient">
                                <form action={dispatchPatient} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="p-name">Full Name</Label>
                                        <Input id="p-name" name="name" placeholder="John Doe" required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="p-email">Email</Label>
                                        <Input id="p-email" name="email" type="email" placeholder="john@example.com" required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="p-phone">Phone Number</Label>
                                        <Input id="p-phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="p-password">Password</Label>
                                        <Input id="p-password" name="password" type="password" required />
                                    </div>
                                    <div className="pt-2">
                                         <SignupButton />
                                    </div>
                                    {patientError && <p className="text-sm text-red-500 text-center">{patientError}</p>}
                                </form>
                            </TabsContent>

                            <TabsContent value="doctor">
                                <form action={dispatchDoctor} className="space-y-4">
                                     <div className="grid gap-2">
                                        <Label htmlFor="d-name">Full Name (with credentials)</Label>
                                        <Input id="d-name" name="name" placeholder="Dr. Jane Doe, MD" required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="d-spec">Specialty</Label>
                                        <Input id="d-spec" name="specialty" placeholder="Cardiology" required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="d-email">Medical Email</Label>
                                        <Input id="d-email" name="email" type="email" placeholder="dr.jane@hospital.org" required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="d-password">Password</Label>
                                        <Input id="d-password" name="password" type="password" required />
                                    </div>
                                    <div className="pt-2">
                                        <SignupButton />
                                    </div>
                                    {doctorError && <p className="text-sm text-red-500 text-center">{doctorError}</p>}
                                </form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <div className="text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link href="/login" className="underline text-primary">
                                Log in
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
