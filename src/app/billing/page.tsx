"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { CreditCard, Download, Calendar, FileText, CheckCircle, Clock, AlertCircle, IndianRupee } from "lucide-react";

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export default function BillingPage() {
  const { data: session } = useSession();

  const { data: bundle } = useQuery({
    queryKey: ['invoices', session?.user?.email],
    queryFn: async () => {
        const res = await fetch('/api/fhir/Invoice');
        if (!res.ok) throw new Error("Failed to fetch invoices");
        return res.json();
    },
    enabled: !!session
  });

  const bills = (bundle?.entry || []).map((e: any) => {
    const r = e.resource;
    const isPaid = r.status === 'balanced' || r.status === 'completed';
    return {
        id: r.id,
        description: r.lineItem?.[0]?.chargeItemCodeableConcept?.text || "Medical Service",
        provider: "Medanta Hospital", // Placeholder as Provider ref might be complex
        date: r.date?.split('T')[0] || "N/A",
        amount: r.totalNet?.value || 0,
        status: isPaid ? "paid" : "pending",
        invoiceId: r.id.substring(0, 8).toUpperCase(),
    };
  });

const paymentMethods = [
  { id: 1, type: "HDFC Bank", last4: "4242", expiry: "12/26", isDefault: true },
  { id: 2, type: "SBI Card", last4: "8888", expiry: "08/25", isDefault: false },
];

  const totalPending = bills.filter((b: any) => b.status === "pending").reduce((acc: number, b: any) => acc + b.amount, 0);
  const totalPaid = bills.filter((b: any) => b.status === "paid").reduce((acc: number, b: any) => acc + b.amount, 0);

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar />
      <div className="flex-1 ml-64 transition-all duration-300">
        <Navbar />
        <main className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#09090b]">Billing</h1>
              <p className="text-sm text-[#71717a] mt-1">Manage your payments and invoices</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-orange-50 text-orange-600">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-[#71717a]">Pending</span>
              </div>
              <p className="text-3xl font-bold text-[#09090b]">₹{totalPending.toLocaleString('en-IN')}</p>
              <p className="text-xs text-[#a1a1aa] mt-1">2 unpaid bills</p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-teal-50 text-teal-600">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-[#71717a]">Paid This Month</span>
              </div>
              <p className="text-3xl font-bold text-[#09090b]">₹{totalPaid.toLocaleString('en-IN')}</p>
              <p className="text-xs text-[#a1a1aa] mt-1">2 completed payments</p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                  <IndianRupee className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-[#71717a]">Insurance Coverage</span>
              </div>
              <p className="text-3xl font-bold text-[#09090b]">80%</p>
              <p className="text-xs text-[#a1a1aa] mt-1">Average this year</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
                <h2 className="text-lg font-semibold text-[#09090b] mb-4">Recent Bills</h2>
                <div className="space-y-4">
                  {bills.map((bill: any) => (
                    <div
                      key={bill.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#fafafa] rounded-2xl border border-[#e4e4e7] hover:border-[#0d9488]/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${bill.status === "paid" ? "bg-teal-50 text-teal-600" : "bg-orange-50 text-orange-600"}`}>
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-[#09090b]">{bill.description}</h4>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                              bill.status === "paid" ? "bg-teal-50 text-teal-600" : "bg-orange-50 text-orange-600"
                            }`}>
                              {bill.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#71717a]">{bill.provider}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-[#a1a1aa]">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {bill.date}
                            </span>
                            <span>{bill.invoiceId}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-4 sm:mt-0">
                        <p className="text-lg font-bold text-[#09090b]">₹{bill.amount.toLocaleString('en-IN')}</p>
                        {bill.status === "pending" ? (
                          <button className="px-4 py-2 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl text-sm font-semibold transition-colors">
                            Pay Now
                          </button>
                        ) : (
                          <button className="px-4 py-2 border border-[#e4e4e7] rounded-xl text-sm font-medium text-[#52525b] hover:bg-[#f4f4f5] transition-colors flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Receipt
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
                <h3 className="font-semibold text-[#09090b] mb-4">Payment Methods</h3>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`p-4 rounded-2xl border ${method.isDefault ? "border-[#0d9488] bg-teal-50/30" : "border-[#e4e4e7]"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-white border border-[#e4e4e7]">
                            <CreditCard className="h-4 w-4 text-[#52525b]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#09090b]">{method.type} •••• {method.last4}</p>
                            <p className="text-xs text-[#a1a1aa]">Expires {method.expiry}</p>
                          </div>
                        </div>
                        {method.isDefault && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-600">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full py-2 border border-dashed border-[#e4e4e7] rounded-xl text-sm font-medium text-[#71717a] hover:bg-[#f4f4f5] transition-colors">
                  + Add Payment Method
                </button>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
                <h3 className="font-semibold text-[#09090b] mb-2">Insurance Info</h3>
                <p className="text-sm text-[#71717a] mb-4">Star Health Insurance</p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#71717a]">Policy Number</span>
                    <span className="font-medium text-[#09090b]">SHI-2024-78456</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71717a]">Sum Insured</span>
                    <span className="font-medium text-[#09090b]">₹5,00,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71717a]">Claimed This Year</span>
                    <span className="font-medium text-[#0d9488]">₹45,000 / ₹5,00,000</span>
                  </div>
                </div>
              </div>

              {totalPending > 0 && (
                <div className="bg-orange-50 rounded-3xl p-6 border border-orange-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-orange-100">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-800 text-sm">Payment Due</h4>
                      <p className="text-xs text-orange-700 mt-1">
                        You have ₹{totalPending.toLocaleString('en-IN')} in pending bills. Earliest due date is December 25, 2024.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
