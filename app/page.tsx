import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Activity, ShieldCheck, Users, Database, Globe, Zap, Heart } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen scroll-smooth">
      <header className="px-4 lg:px-8 h-16 flex items-center border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="#">
          <Activity className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-teal-500">
            National Health Stack
          </span>
        </Link>
        <nav className="ml-auto flex gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors hidden sm:block" href="#">
            Solutions
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors hidden sm:block" href="#">
            Platform
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors hidden sm:block" href="#">
            Developers
          </Link>
          <div className="flex gap-2 ml-4">
             <Link href="/login">
                <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/signup">
                <Button size="sm" className="bg-primary hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all">Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>
      <main className="flex-1">
        <section className="relative w-full py-20 md:py-32 overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] -z-10" />
          <div className="container px-4 md:px-6 relative z-10 mx-auto">
            <div className="flex flex-col items-center space-y-8 text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 shadow-sm animate-fade-in-up">
                 ✨ Next-Gen Healthcare Infrastructure
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-gray-900 dark:text-gray-100 animate-slide-up">
                Unified Healthcare <br/>
                <span className="text-primary">For the Nation</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 animate-slide-up delay-100">
                Seamlessly connecting patients, providers, and payers through a secure, open-standard digital health infrastructure. Built on FHIR.
              </p>
              <div className="space-x-4 animate-slide-up delay-200">
                <Link href="/signup">
                    <Button size="lg" className="h-12 px-8 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all bg-primary hover:bg-blue-700 text-primary-foreground">
                    Join the Network <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
                <Link href="/login">
                    <Button variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full border-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                    View Demo
                    </Button>
                </Link>
              </div>
            </div>
            
             <div className="mt-16 mx-auto max-w-5xl rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl lg:p-4 shadow-2xl animate-fade-in-up delay-300">
                <div className="rounded-md bg-white p-4 sm:p-10 shadow-inner dark:bg-gray-950">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="flex flex-col items-center text-center p-4">
                             <div className="h-12 w-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                                 <Users className="h-6 w-6" />
                             </div>
                             <h3 className="font-semibold text-lg mb-2">Patient Centric</h3>
                             <p className="text-sm text-gray-500">Complete control over personal health records and consent.</p>
                         </div>
                          <div className="flex flex-col items-center text-center p-4 border-l border-r border-gray-100 dark:border-gray-800">
                             <div className="h-12 w-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mb-4">
                                 <Activity className="h-6 w-6" />
                             </div>
                             <h3 className="font-semibold text-lg mb-2">Real-time Data</h3>
                             <p className="text-sm text-gray-500">Live vitals monitoring and instant lab report availability.</p>
                         </div>
                          <div className="flex flex-col items-center text-center p-4">
                             <div className="h-12 w-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                                 <Globe className="h-6 w-6" />
                             </div>
                             <h3 className="font-semibold text-lg mb-2">Universal Access</h3>
                             <p className="text-sm text-gray-500">Accessible by any authorized provider across the country.</p>
                         </div>
                    </div>
                </div>
            </div>

          </div>
        </section>

        <section className="w-full py-20 bg-white dark:bg-gray-900">
          <div className="container px-4 md:px-6 mx-auto">
             <div className="text-center mb-16">
                 <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Why Choose National Health Stack?</h2>
                 <p className="text-gray-500 max-w-2xl mx-auto">Built for scale, security, and interoperability. The foundation for the future of digital health.</p>
             </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="group relative overflow-hidden rounded-2xl border bg-background p-6 hover:shadow-lg transition-all duration-300">
                 <div className="p-3 w-fit rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 mb-4 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-6 w-6" />
                 </div>
                <h3 className="text-xl font-bold mb-2">Enterprise Security</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  HIPAA compliant, end-to-end encryption, and role-based access control ensuring patient data privacy is never compromised.
                </p>
              </div>
              <div className="group relative overflow-hidden rounded-2xl border bg-background p-6 hover:shadow-lg transition-all duration-300">
                <div className="p-3 w-fit rounded-lg bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300 mb-4 group-hover:scale-110 transition-transform">
                    <Database className="h-6 w-6" />
                 </div>
                <h3 className="text-xl font-bold mb-2">Interoperable (FHIR)</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Native support for HL7 FHIR standards allows seamless data exchange between disparate hospital systems and labs.
                </p>
              </div>
              <div className="group relative overflow-hidden rounded-2xl border bg-background p-6 hover:shadow-lg transition-all duration-300">
                 <div className="p-3 w-fit rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="h-6 w-6" />
                 </div>
                <h3 className="text-xl font-bold mb-2">Instant Onboarding</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Practitioners and patients can sign up and get verified instantly, reducing administrative overhead.
                </p>
              </div>
               <div className="group relative overflow-hidden rounded-2xl border bg-background p-6 hover:shadow-lg transition-all duration-300">
                 <div className="p-3 w-fit rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300 mb-4 group-hover:scale-110 transition-transform">
                    <Heart className="h-6 w-6" />
                 </div>
                <h3 className="text-xl font-bold mb-2">Better Outcomes</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Holistic view of patient history leads to better diagnosis, reduced errors, and improved health outcomes.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-8 bg-gray-50 dark:bg-gray-950 border-t">
          <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
                 <Activity className="h-5 w-5 text-gray-500" />
                 <p className="text-sm text-gray-500 dark:text-gray-400">© 2024 National Health Stack.</p>
            </div>
            <nav className="flex gap-6">
            <Link className="text-sm text-gray-500 hover:text-primary transition-colors" href="#">
                Terms
            </Link>
            <Link className="text-sm text-gray-500 hover:text-primary transition-colors" href="#">
                Privacy
            </Link>
             <Link className="text-sm text-gray-500 hover:text-primary transition-colors" href="#">
                Contact
            </Link>
            </nav>
        </div>
      </footer>
    </div>
  );
}
