"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FileText, Calendar, Pill, Shield, Database, Users, ArrowRight, Hospital, Lock, Share2, Sparkles, ChevronDown, AlertTriangle, Stethoscope, X, Loader2, ExternalLink } from "lucide-react";

const logoUrl = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/813fae0f-1657-45b7-a53b-049057aaddf7/image-removebg-preview-33-1768639294584.png?width=8000&height=8000&resize=contain";

const backgroundImages = [
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/813fae0f-1657-45b7-a53b-049057aaddf7/image-1768666816191.png?width=8000&height=8000&resize=contain",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/813fae0f-1657-45b7-a53b-049057aaddf7/image-1768666913848.png?width=8000&height=8000&resize=contain",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/813fae0f-1657-45b7-a53b-049057aaddf7/image-1768666939542.png?width=8000&height=8000&resize=contain",
];

import { signIn } from "next-auth/react";
import { signupUser } from "./actions/auth-actions";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");
  const [portalType, setPortalType] = useState<"patient" | "doctor">("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (authTab === 'signin') {
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (result?.error) {
          if (result.error.includes("Email not confirmed")) {
            setError("Please confirm your email before logging in.");
          } else {
            setError("Invalid email or password");
          }
        } else {
          if (portalType === 'doctor') {
            router.push("/doctor");
          } else {
            router.push("/dashboard");
          }
        }
      } else {
        // Sign Up
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('name', name);
        formData.append('role', portalType); // Use portalType for role

        const result = await signupUser(formData);
        if (result.error) {
          setError(result.error);
        } else {
          setAuthTab('signin');
          setError("Account created! Please sign in.");
          setPassword('');
        }
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b]">
      <header className="fixed top-0 left-0 right-0 bg-black/20 backdrop-blur-md z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src={logoUrl}
              alt="MedSense Logo"
              width={200}
              height={65}
              className="w-[180px] h-auto object-contain brightness-0 invert"
              priority
            />
          </Link>
          <nav className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm font-medium text-white/70 hover:text-white transition-colors uppercase tracking-widest">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-white/70 hover:text-white transition-colors uppercase tracking-widest">Impact</a>
            <a href="#about" className="text-sm font-medium text-white/70 hover:text-white transition-colors uppercase tracking-widest">About</a>
          </nav>
          <div className="flex items-center gap-6">
            <a href="#auth" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Log in</a>
            <a href="#auth" className="px-6 py-2.5 bg-white text-black hover:bg-white/90 rounded-sm text-sm font-bold transition-all uppercase tracking-tight">
              Get Started
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
          {backgroundImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentBgIndex ? "opacity-100" : "opacity-0"
                }`}
            >
              <Image
                src={img}
                alt={`Background ${index + 1}`}
                fill
                className="object-cover scale-105"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-black/60" />
            </div>
          ))}

          <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
            <div className="mb-10 inline-flex items-center gap-2 px-6 py-2 bg-[#f59e0b] text-black font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] rounded-sm animate-pulse">
              <AlertTriangle className="h-3 w-3 md:h-4 md:w-4" />
              <span>This is a conceptual prototype for demonstration purposes only. Not a real medical product.</span>
            </div>

            <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-white/60" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-medium">Unified EHR Intelligence</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-bold text-white leading-[1.1] tracking-tight mb-8">
              Accelerating Healthcare <br />
              with <span className="italic font-serif opacity-90">Unified Intelligence</span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed mb-12 font-light">
              A conceptual platform to support clinicians in exploring fragmented patient records across multiple hospitals, faster and more securely than ever before.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <a href="#auth" className="px-10 py-4 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-sm font-bold uppercase tracking-widest transition-all shadow-xl shadow-[#0d9488]/20 min-w-[240px]">
                Access Dashboard
              </a>
              <Link href="/dashboard/patient/store" className="px-10 py-4 border border-white/30 hover:bg-white/10 text-white rounded-sm font-bold uppercase tracking-widest transition-all min-w-[240px] backdrop-blur-sm flex items-center justify-center gap-2">
                Pharmacy Portal <ExternalLink className="h-4 w-4" />
              </Link>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
              <span className="text-[10px] uppercase tracking-[0.4em] text-white font-medium">View the workflow</span>
              <ChevronDown className="h-5 w-5 text-white animate-bounce" />
            </div>
          </div>

          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {backgroundImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBgIndex(index)}
                className={`h-1.5 transition-all duration-500 rounded-full ${index === currentBgIndex ? "bg-[#0d9488] w-10" : "bg-white/20 w-1.5 hover:bg-white/40"
                  }`}
              />
            ))}
          </div>
        </section>

        <section id="auth" className="py-32 bg-white relative">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-[#09090b] tracking-tight">
                Secure Access for <br />
                <span className="text-[#0d9488]">Patients & Providers</span>
              </h2>
              <p className="text-lg text-[#52525b] max-w-md leading-relaxed">
                Connect your medical accounts, manage appointments, and access your unified health records with military-grade encryption.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#0d9488]/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-[#0d9488]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#09090b]">HIPAA Compliant</h4>
                    <p className="text-sm text-[#71717a]">Your data is encrypted at rest and in transit.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Lock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#09090b]">Multi-Factor Auth</h4>
                    <p className="text-sm text-[#71717a]">Added layer of security for clinical access.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e4e4e7] shadow-2xl p-8 max-w-md mx-auto w-full relative">
              <div className="flex bg-[#f4f4f5] rounded-xl p-1 mb-6">
                <button
                  onClick={() => setPortalType("patient")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${portalType === "patient" ? "bg-white text-[#09090b] shadow-sm" : "text-[#71717a]"
                    }`}
                >
                  <Users className="h-4 w-4" />
                  Patient
                </button>
                <button
                  onClick={() => setPortalType("doctor")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${portalType === "doctor" ? "bg-white text-[#09090b] shadow-sm" : "text-[#71717a]"
                    }`}
                >
                  <Stethoscope className="h-4 w-4" />
                  Doctor
                </button>
              </div>

              {portalType === "patient" || portalType === "doctor" ? (
                <>
                  <div className="flex bg-[#f4f4f5] rounded-xl p-1 mb-8">
                    <button
                      onClick={() => setAuthTab("signin")}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${authTab === "signin" ? "bg-white text-[#09090b] shadow-sm" : "text-[#71717a]"
                        }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setAuthTab("signup")}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${authTab === "signup" ? "bg-white text-[#09090b] shadow-sm" : "text-[#71717a]"
                        }`}
                    >
                      Sign Up
                    </button>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    {authTab === "signup" && (
                      <div>
                        <label className="block text-sm font-medium text-[#09090b] mb-1.5 uppercase tracking-wider text-[10px]">Full Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your name"
                          className="w-full px-4 py-3 border border-[#e4e4e7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent bg-[#fafafa]"
                          required
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-[#09090b] mb-1.5 uppercase tracking-wider text-[10px]">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 border border-[#e4e4e7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent bg-[#fafafa]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#09090b] mb-1.5 uppercase tracking-wider text-[10px]">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 border border-[#e4e4e7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent bg-[#fafafa]"
                        required
                      />
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-lg font-bold uppercase tracking-widest text-[10px] transition-all mt-6 disabled:opacity-70"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {authTab === "signin" ? "Signing In..." : "Creating Account..."}
                        </>
                      ) : (
                        <>
                          {authTab === "signin" ? "Sign In" : "Create Account"} <ArrowRight className="h-3 w-3" />
                        </>
                      )}
                    </button>
                    {portalType === 'doctor' && authTab === 'signin' && (
                      <p className="text-xs text-center text-[#71717a] mt-4">
                        Demo credentials: <span className="font-mono bg-[#f4f4f5] px-2 py-0.5 rounded">doctor@example.com</span> / <span className="font-mono bg-[#f4f4f5] px-2 py-0.5 rounded">doctor123</span>
                      </p>
                    )}
                    {portalType === 'patient' && authTab === 'signin' && (
                      <p className="text-xs text-center text-[#71717a] mt-4">
                        Demo credentials: <span className="font-mono bg-[#f4f4f5] px-2 py-0.5 rounded">patient@example.com</span> / <span className="font-mono bg-[#f4f4f5] px-2 py-0.5 rounded">patient123</span>
                      </p>
                    )}
                  </form>
                </>
              ) : null}
            </div>
          </div>
        </section>

        <section id="features" className="py-24 bg-white border-t border-[#e4e4e7]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-[#0d9488] uppercase tracking-[0.3em]">System Capabilities</span>
              <h2 className="text-4xl font-bold text-[#09090b] mt-4">Integrated Health Network</h2>
              <p className="text-lg text-[#71717a] mt-4 max-w-2xl mx-auto">
                Our architecture handles the complexity of medical data so you can focus on patient care.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: FileText, title: "Universal EHR", desc: "Unified patient history synthesized from disparate hospital systems." },
                { icon: Calendar, title: "Global Scheduling", desc: "Coordinated appointments across all specialist networks." },
                { icon: Pill, title: "Pharmacy Sync", desc: "Real-time prescription tracking and medication interactions." },
                { icon: Database, title: "Secure Storage", desc: "Decentralized data nodes ensuring 99.9% availability." },
              ].map((feature, idx) => (
                <div key={idx} className="p-8 bg-white rounded-2xl border border-[#e4e4e7] hover:border-[#0d9488]/40 transition-all group hover:shadow-xl hover:shadow-[#0d9488]/5">
                  <div className="w-14 h-14 bg-[#fafafa] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#0d9488] transition-all duration-500">
                    <feature.icon className="h-6 w-6 text-[#0d9488] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-[#09090b] mb-3 text-lg">{feature.title}</h3>
                  <p className="text-sm text-[#71717a] leading-relaxed font-medium">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-32 bg-[#fafafa]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <span className="text-sm font-semibold text-[#0d9488] uppercase tracking-[0.3em]">Operational Flow</span>
              <h2 className="text-4xl font-bold text-[#09090b] mt-4">Unified EHR Workflow</h2>
            </div>

            <div className="relative max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                {[
                  { step: 1, icon: Hospital, title: "Data Ingestion", desc: "Records captured at point of care.", color: "bg-zinc-800" },
                  { step: 2, icon: Database, title: "Standardization", desc: "AI-driven conversion to FHIR standards.", color: "bg-zinc-800" },
                  { step: 3, icon: Users, title: "Synthesis", desc: "Unified view generated in real-time.", color: "bg-[#0d9488]" },
                  { step: 4, icon: Share2, title: "Peer Sharing", desc: "Encrypted handshake for clinician review.", color: "bg-zinc-800" },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center group">
                    <div className={`w-20 h-20 ${item.color} rounded-sm flex items-center justify-center mb-6 shadow-2xl transition-all duration-500 group-hover:-translate-y-2`}>
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-[#0d9488] uppercase tracking-[0.2em] mb-2">Phase {item.step}</span>
                    <h4 className="font-bold text-[#09090b] mb-2">{item.title}</h4>
                    <p className="text-xs text-[#71717a] leading-relaxed font-medium">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#09090b] text-white py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <Image
              src={logoUrl}
              alt="MedSense Logo"
              width={200}
              height={65}
              className="w-[160px] h-auto object-contain brightness-0 invert"
            />
            <div className="flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Security</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-12 text-center text-[10px] font-medium text-white/20 uppercase tracking-[0.3em]">
            © 2024 MedSense Clinical Systems. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
