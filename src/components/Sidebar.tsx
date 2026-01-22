"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Plus,
  House,
  Calendar,
  FileText,
  Pill,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const logoAsset = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/813fae0f-1657-45b7-a53b-049057aaddf7/image-removebg-preview-33-1768639294584.png?width=8000&height=8000&resize=contain";

  const handleSignOut = () => {
    // Ideally use signOut() from next-auth which handles redirection naturally
    // but preserving custom flow for now with router
    router.push("/");
  };

  const overviewLinks = [
    { name: "Dashboard", icon: House, href: "/dashboard" },
    { name: "Appointments", icon: Calendar, href: "/appointments" },
    { name: "Medical Records", icon: FileText, href: "/records" },
    { name: "Medications", icon: Pill, href: "/medications" },
  ];

  const accountLinks = [
    { name: "Profile", icon: User, href: "/profile" },
    { name: "Billing", icon: CreditCard, href: "/billing" },
    { name: "Settings", icon: Settings, href: "/settings" },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const showCollapsed = mounted && collapsed;

  return (
      <div className={`flex flex-col h-screen border-r border-[#e4e4e7] bg-white fixed left-0 top-0 z-20 transition-all duration-300 ${showCollapsed ? "w-20" : "w-64"}`}>
        <div className="flex items-center border-b border-[#e4e4e7] h-16 relative overflow-hidden justify-center px-2">
          {!showCollapsed ? (
            <Image
              src={logoAsset}
              alt="MedSense Logo"
              width={200}
              height={65}
              className="w-[200px] h-auto object-contain"
              priority
            />
          ) : (
          <div className="w-10 h-10 bg-[#0d9488] rounded-xl flex items-center justify-center text-white font-bold text-lg">M</div>
        )}
      </div>

      <div className="p-3">
        <Link
          href="/book-appointment"
          className={`inline-flex items-center justify-center whitespace-nowrap text-sm transition-all outline-none shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] px-4 py-2 w-full bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl h-11 gap-2 font-semibold ${showCollapsed ? "px-0" : ""}`}
        >
          <Plus className="h-4 w-4" />
          {!showCollapsed && "Book Appointment"}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        <div className="space-y-1">
          {!showCollapsed && (
            <p className="px-3 text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-2">
              Overview
            </p>
          )}
          {overviewLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative group ${showCollapsed ? "justify-center" : ""} ${
                isActive(link.href)
                  ? "bg-[#0d9488] text-white"
                  : "text-[#52525b] hover:bg-[#f4f4f5] hover:text-[#09090b]"
              }`}
            >
              <link.icon
                className={`h-5 w-5 shrink-0 ${
                  isActive(link.href) ? "text-white" : "text-[#a1a1aa] group-hover:text-[#71717a]"
                }`}
              />
              {!showCollapsed && <span className="truncate">{link.name}</span>}
              {isActive(link.href) && !showCollapsed && (
                <div className="absolute right-2 h-2 w-2 rounded-full bg-white/80"></div>
              )}
            </Link>
          ))}
        </div>

        <div className="space-y-1">
          {!showCollapsed && (
            <p className="px-3 text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-2">
              Account
            </p>
          )}
          {accountLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative group ${showCollapsed ? "justify-center" : ""} ${
                isActive(link.href)
                  ? "bg-[#0d9488] text-white"
                  : "text-[#52525b] hover:bg-[#f4f4f5] hover:text-[#09090b]"
              }`}
            >
              <link.icon className={`h-5 w-5 shrink-0 ${isActive(link.href) ? "text-white" : "text-[#a1a1aa] group-hover:text-[#71717a]"}`} />
              {!showCollapsed && <span className="truncate">{link.name}</span>}
            </Link>
          ))}
        </div>
      </nav>

<div className="p-3 border-t border-[#e4e4e7]">
          <button 
            onClick={handleSignOut}
            className={`inline-flex items-center whitespace-nowrap text-sm font-medium transition-all outline-none px-4 py-2 w-full gap-3 text-[#71717a] hover:text-[#ef4444] hover:bg-[#fef2f2] rounded-xl h-10 group ${showCollapsed ? "justify-center px-0" : "justify-start"}`}
          >
            <LogOut className="h-5 w-5" />
            {!showCollapsed && "Sign Out"}
          </button>
        </div>

      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all outline-none size-9 absolute -right-3 top-20 h-6 w-6 rounded-full border border-[#e4e4e7] bg-white shadow-md hover:bg-[#fafafa] z-30"
      >
        {showCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </div>
  );
}