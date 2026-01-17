import { auth } from "@/auth";
import { getDoctorAppointments } from "@/app/actions/clinical";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User as UserIcon, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function DoctorAppointmentsPage() {
  const session = await auth();
  const doctorId = session?.user?.id;
  
  const appointments = await getDoctorAppointments(doctorId || '');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Today's Schedule</h1>
          <p className="text-muted-foreground">Manage your upcoming patient visits.</p>
        </div>
        <div className="flex gap-2">
             <Button variant="outline">Sync Calendar</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {appointments.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                No appointments scheduled.
            </div>
        ) : (
            appointments.map((appt: any) => (
            <Card key={appt.id} className="overflow-hidden">
                <div className={`h-2 w-full ${appt.status === 'booked' ? 'bg-blue-500' : 'bg-green-500'}`} />
                <CardHeader className="pb-2">
                 <div className="flex justify-between items-start">
                    <Badge variant={appt.status === 'booked' ? 'default' : 'secondary'} className="uppercase text-[10px]">
                        {appt.status}
                    </Badge>
                     {/* Actions Placeholder */}
                     {appt.status === 'booked' && (
                         <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-100">
                                <CheckCircle className="h-4 w-4" />
                            </Button>
                        </div>
                     )}
                </div>
                <CardTitle className="text-lg flex items-center gap-2 mt-2">
                    <UserIcon className="h-4 w-4 text-primary" />
                    {appt.patientName}
                </CardTitle>
                <CardDescription>
                    {appt.description}
                </CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(appt.start).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="flex items-center gap-2 font-medium">
                    <Clock className="h-4 w-4 text-primary" />
                    {new Date(appt.start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </div>
                </CardContent>
            </Card>
            ))
        )}
      </div>
    </div>
  );
}
