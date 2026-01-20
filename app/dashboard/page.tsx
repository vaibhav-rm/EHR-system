import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Building2, Stethoscope, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || 'User'}</h1>
        <p className="text-muted-foreground">
          Select a portal to manage your healthcare services.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Link href="/dashboard/doctor">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
                <Stethoscope className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Doctor Portal</CardTitle>
                <CardDescription>
                Manage appointments, patients, and prescriptions.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="ghost" className="p-0">Go to Portal <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </CardContent>
            </Card>
        </Link>

        <Link href="/dashboard/hospital">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
                <Building2 className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Hospital Admin</CardTitle>
                <CardDescription>
                Manage staff, departments, and resources.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="ghost" className="p-0">Go to Portal <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </CardContent>
            </Card>
        </Link>

        <Link href="/dashboard/patient">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
                <User className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Patient Portal</CardTitle>
                <CardDescription>
                View health records, test results, and history.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="ghost" className="p-0">Go to Portal <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </CardContent>
            </Card>
        </Link>
      </div>
    </div>
  );
}
