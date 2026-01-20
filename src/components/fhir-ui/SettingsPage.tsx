'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SettingsPage() {
  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      toast.success('Profile updated successfully');
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

       <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your contact details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="grid gap-4">
               <div className="grid gap-2">
                 <Label htmlFor="name">Full Name</Label>
                 <Input id="name" defaultValue="John Doe" />
               </div>
               <div className="grid gap-2">
                 <Label htmlFor="email">Email</Label>
                 <Input id="email" defaultValue="user@example.com" disabled />
               </div>
               <div className="grid gap-2">
                 <Label htmlFor="phone">Phone</Label>
                 <Input id="phone" defaultValue="+1 (555) 000-0000" />
               </div>
               <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Change your password.
            </CardDescription>
          </CardHeader>
           <CardContent>
            <div className="grid gap-4">
                 <div className="grid gap-2">
                 <Label htmlFor="current">Current Password</Label>
                 <Input id="current" type="password" />
               </div>
               <div className="grid gap-2">
                 <Label htmlFor="new">New Password</Label>
                 <Input id="new" type="password" />
               </div>
               <Button variant="outline">Update Password</Button>
            </div>
           </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                    Manage how you receive alerts and updates.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="grid gap-4">
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="email-notifs" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                        <Label htmlFor="email-notifs">Email Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="sms-notifs" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <Label htmlFor="sms-notifs">SMS Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="appt-reminders" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                        <Label htmlFor="appt-reminders">Appointment Reminders</Label>
                    </div>
                    <Button variant="outline" type="button" onClick={() => toast.success('Notification preferences updated')}>Save Preferences</Button>
                </form>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
