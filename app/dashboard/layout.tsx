import Link from "next/link"
import {
  Bell,
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  Search,
  ShoppingCart,
  Users,
  Activity,
  Building,
  User,
  Stethoscope
} from "lucide-react"
import { auth, signOut } from "@/auth"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { VoiceAgent } from "@/components/voice-agent"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Activity className="h-6 w-6 text-primary" />
              <span className="">National Health</span>
            </Link>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {/* DOCTOR LINKS */}
              {(user?.role === 'doctor' || user?.role === 'admin') && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Doctor Workspace
                  </div>
                  <Link
                    href="/dashboard/doctor"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  >
                    <Stethoscope className="h-4 w-4" />
                    Doctor Portal
                  </Link>
                  <Link
                    href="/dashboard/doctor/appointments"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ml-4"
                  >
                    <span className="text-lg">•</span>
                    Appointments
                  </Link>
                  <Link
                    href="/dashboard/doctor/clinical"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ml-4"
                  >
                    <span className="text-lg">•</span>
                    Clinical Docs
                  </Link>
                  <Link
                    href="/dashboard/doctor/medications"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ml-4"
                  >
                    <span className="text-lg">•</span>
                    Prescriptions
                  </Link>
                  <Link
                    href="/dashboard/doctor/labs"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ml-4"
                  >
                    <span className="text-lg">•</span>
                    Lab Results
                  </Link>
                  <Link
                    href="/dashboard/doctor/messages"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ml-4"
                  >
                    <span className="text-lg">•</span>
                    Messages
                  </Link>
                  <Link
                    href="/dashboard/doctor/settings"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ml-4"
                  >
                    <span className="text-lg">•</span>
                    Settings
                  </Link>
                  <Separator className="my-2" />
                </>
              )}

              {/* HOSPITAL ADMIN LINKS */}
              {(user?.role === 'admin' || user?.role === 'hospital_admin') && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Administration
                  </div>
                  <Link
                    href="/dashboard/hospital"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  >
                    <Building className="h-4 w-4" />
                    Hospital Admin
                  </Link>
                  <Link
                    href="/dashboard/hospital/billing"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ml-4"
                  >
                    <span className="text-lg">•</span>
                    Financials
                  </Link>
                  <Separator className="my-2" />
                </>
              )}

              {/* PATIENT LINKS */}
              {(user?.role === 'patient' || user?.role === 'admin') && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    My Health
                  </div>
                  <Link
                    href="/dashboard/patient"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  >
                    <User className="h-4 w-4" />
                    Patient Portal
                  </Link>
                  <Link
                    href="/dashboard/patient/appointments"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ml-4"
                  >
                    <span className="text-lg">•</span>
                    My Appointments
                  </Link>
                  <Link
                    href="/dashboard/patient/medications"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ml-4"
                  >
                    <span className="text-lg">•</span>
                    My Medications
                  </Link>
                  <Link
                    href="/dashboard/patient/labs"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ml-4"
                  >
                    <span className="text-lg">•</span>
                    Test Results
                  </Link>
                  <Link
                    href="/dashboard/patient/billing"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ml-4"
                  >
                    <span className="text-lg">•</span>
                    Billing & Insurance
                  </Link>
                  <Link
                    href="/dashboard/patient/messages"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ml-4"
                  >
                    <span className="text-lg">•</span>
                    Inbox
                  </Link>
                   <Link
                    href="/dashboard/patient/store"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ml-4"
                  >
                    <span className="text-lg">•</span>
                    Pharmacy Store
                  </Link>
                  <Link
                    href="/dashboard/patient/settings"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ml-4"
                  >
                    <span className="text-lg">•</span>
                    Settings
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="mt-auto p-4">
             {/* Footer content if needed */}
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="#"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Activity className="h-6 w-6" />
                  <span className="sr-only">National Health</span>
                </Link>
                 <Link
                    href="/dashboard/doctor"
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                    <Stethoscope className="h-5 w-5" />
                    Doctor Portal
                </Link>
                <Link
                    href="/dashboard/hospital"
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                    <Building className="h-5 w-5" />
                    Hospital Admin
                </Link>
                <Link
                    href="/dashboard/patient"
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                    <User className="h-5 w-5" />
                    Patient Portal
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
             <Breadcrumb className="hidden md:flex">
                <BreadcrumbList>
                    <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/dashboard">Dashboard</Link>
                    </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                    <BreadcrumbPage>Overview</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
          </div>
            <div className="flex items-center gap-2 mr-4">
                 <div className="flex flex-col items-end hidden md:flex">
                    <span className="text-sm font-medium">{user?.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{user?.role || 'User'}</span>
                 </div>
            </div>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>Settings</DropdownMenuItem>
              <DropdownMenuItem disabled>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                 <form
                    action={async () => {
                        'use server';
                        await signOut();
                    }}
                    >
                    <button className="w-full text-left">Logout</button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
      <VoiceAgent />
    </div>
  )
}
