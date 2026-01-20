'use client';
 
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/app/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useActionState } from 'react';
import Link from 'next/link';
import { Activity } from 'lucide-react';

function LoginButton() {
  const { pending } = useFormStatus();
 
  return (
    <Button className="w-full" aria-disabled={pending}>
      {pending ? 'Logging in...' : 'Log in'}
    </Button>
  );
}
 
export default function LoginPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);
 
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white dark:bg-gray-800 absolute w-full top-0">
         <Link className="flex items-center justify-center" href="/">
           <Activity className="h-6 w-6 text-primary" />
           <span className="ml-2 text-lg font-bold">National Health Stack</span>
         </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 pt-20">
        <Card className="w-full max-w-sm shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription>
            Enter your email below to login to your account.
            <br/>
            <span className="text-xs text-muted-foreground mt-2 block">
                Demo: <strong>admin@moh.gov.in</strong> / <strong>admin123</strong> (Full Access)<br/>
                Or sign up as a new Patient/Doctor.
            </span>
          </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={dispatch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  required
                />
              </div>
              <div className="flex flex-col gap-2 pt-2">
                  <LoginButton />
                  {errorMessage && (
                  <div
                      className="flex h-8 items-end space-x-1 justify-center"
                      aria-live="polite"
                      aria-atomic="true"
                  >
                      <p className="text-sm text-red-500">{errorMessage}</p>
                  </div>
                  )}
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 text-center">
               <div className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Link href="/signup" className="underline text-primary">
                      Sign up
                  </Link>
               </div>
               
               <div className="border-t pt-4 w-full">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Demo Credentials:</p>
                  <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground bg-gray-100 p-2 rounded dark:bg-gray-800">
                      <div><span className="font-semibold">Patient:</span> patient@example.com / patient123</div>
                      <div><span className="font-semibold">Doctor:</span> doctor@example.com / doctor123</div>
                  </div>
               </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
