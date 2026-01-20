import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, DollarSign, BedDouble, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HospitalDashboard() {
  // Mock Data
  const stats = [
    {
      title: "Total Patients",
      value: "12,345",
      change: "+180 from last month",
      icon: Users,
    },
    {
      title: "Bed Occupancy",
      value: "84%",
      change: "+4% from last week",
      icon: BedDouble,
    },
    {
      title: "Active Staff",
      value: "142",
      change: "12 on leave",
      icon: Activity,
    },
    {
      title: "Revenue (Mtd)",
      value: "$1.2M",
      change: "+12% from last month",
      icon: DollarSign,
    },
  ];

  const alerts = [
    { id: 1, message: "ICU Capacity at 90%", type: "critical" },
    { id: 2, message: "Dr. Sharma (Cardiology) on emergency leave", type: "warning" },
    { id: 3, message: "Oxygen supply shipment delayed", type: "warning" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hospital Administration</h1>
          <p className="text-muted-foreground">Overview of hospital operations and status.</p>
        </div>
        <div className="flex gap-2">
            <Button>Generate Report</Button>
            <Button variant="outline">Manage Staff</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Department Activity</CardTitle>
            <CardDescription>
              Patient intake by department this week.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                {/* Placeholder for a Chart */}
                [Bar Chart: Cardiology, Ortho, Neuro, Peds]
             </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Operational Alerts</CardTitle>
            <CardDescription>
                Critical updates and notifications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {alerts.map(alert => (
                    <div key={alert.id} className="flex items-start gap-4 border-b last:border-0 pb-4 last:pb-0">
                        <AlertCircle className={`h-5 w-5 ${alert.type === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                        <div>
                            <p className="text-sm font-medium leading-none">
                                {alert.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Just now
                            </p>
                        </div>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
