"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { FileText, Download, Eye, Search, Calendar, Tag, X, Activity, Droplets, Heart, Building2 } from "lucide-react";



const categories = ["All", "Blood Work", "Imaging", "Cardiology", "General"];
const hospitals = ["All Hospitals", "Apollo Diagnostics", "Fortis Hospital", "SRL Diagnostics", "Max Healthcare", "Medanta Hospital", "AIIMS Delhi"];

const hospitalColors: Record<string, string> = {
  "Apollo": "bg-blue-100 text-blue-700 border-blue-200",
  "Fortis": "bg-purple-100 text-purple-700 border-purple-200",
  "SRL": "bg-amber-100 text-amber-700 border-amber-200",
  "Max": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Medanta": "bg-rose-100 text-rose-700 border-rose-200",
  "AIIMS": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Default": "bg-zinc-100 text-zinc-700 border-zinc-200"
};

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';

interface RecordType {
  id: string;
  title: string;
  date: string;
  doctor: string;
  hospital: string;
  hospitalTag: string;
  category: string;
  type: string;
  summary: string;
  results?: { [key: string]: { value: string; normal: string; status: string } };
  vitals?: { bp: string; pulse: string; bmi: string; temperature: string };
}

export default function RecordsPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedHospital, setSelectedHospital] = useState("All Hospitals");
  const [selectedRecord, setSelectedRecord] = useState<RecordType | null>(null);

  const { data: bundle, isLoading } = useQuery({
    queryKey: ['diagnostic-reports', session?.user?.email],
    queryFn: async () => {
        const res = await fetch('/api/fhir/DiagnosticReport');
        if (!res.ok) throw new Error("Failed to fetch records");
        return res.json();
    },
    enabled: !!session
  });

  const records: RecordType[] = (bundle?.entry || []).map((e: any) => {
    const r = e.resource;
    const hospitalName = r.performer?.[0]?.display || "Unknown Hospital";
    const hospitalTag = Object.keys(hospitalColors).find(tag => hospitalName.includes(tag)) || "Default";

    return {
        id: r.id,
        title: r.code?.text || "Unknown Test",
        date: r.effectiveDateTime ? format(new Date(r.effectiveDateTime), 'yyyy-MM-dd') : 'N/A',
        doctor: r.resultsInterpreter?.[0]?.display || "Dr. Unassigned",
        hospital: hospitalName,
        hospitalTag: hospitalTag,
        category: r.category?.[0]?.coding?.[0]?.display || "General",
        type: "Routine",
        summary: r.conclusion || "No summary provided.", 
    };
  });

  const filteredRecords = records.filter((record) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      record.title.toLowerCase().includes(query) ||
      record.doctor.toLowerCase().includes(query) ||
      record.hospital.toLowerCase().includes(query) ||
      record.category.toLowerCase().includes(query) ||
      record.summary.toLowerCase().includes(query) ||
      record.date.includes(query);
    const matchesCategory = selectedCategory === "All" || record.category === selectedCategory;
    const matchesHospital = selectedHospital === "All Hospitals" || record.hospital === selectedHospital;
    return matchesSearch && matchesCategory && matchesHospital;
  });

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar />
      <div className="flex-1 ml-64 transition-all duration-300">
        <Navbar />
        <main className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#09090b]">Medical Records</h1>
              <p className="text-sm text-[#71717a] mt-1">View records from all your hospitals in one place</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
                <input
                  type="text"
                  placeholder="Search by title, doctor, hospital..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-[#e4e4e7] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] w-72"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? "bg-[#0d9488] text-white"
                      : "bg-white border border-[#e4e4e7] text-[#52525b] hover:bg-[#f4f4f5]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="h-6 w-px bg-[#e4e4e7] hidden sm:block" />
            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="px-4 py-2 border border-[#e4e4e7] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488]"
            >
              {hospitals.map((hospital) => (
                <option key={hospital} value={hospital}>{hospital}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {isLoading && <p className="text-center py-12 text-[#71717a]">Loading records...</p>}
            {!isLoading && filteredRecords.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-[#e4e4e7]">
                <FileText className="h-12 w-12 text-[#e4e4e7] mx-auto mb-4" />
                <p className="text-[#71717a]">No records found matching your search.</p>
              </div>
            ) : (
              filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7] hover:border-[#0d9488]/30 transition-all group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-2xl bg-teal-50 text-teal-600 group-hover:bg-teal-100 transition-colors">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div>
                            <h3 className="text-base font-bold text-[#09090b]">{record.title}</h3>
                            <p className="text-sm text-[#71717a] mt-0.5">{record.doctor}</p>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${hospitalColors[record.hospitalTag]}`}>
                            <Building2 className="h-3 w-3" />
                            {record.hospital}
                          </span>
                        </div>
                        <div className="mt-3 p-4 bg-[#fafafa] rounded-2xl">
                          <p className="text-sm text-[#52525b] italic">&quot;{record.summary}&quot;</p>
                        </div>
                        <div className="flex items-center gap-3 mt-4 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-[#a1a1aa]">
                            <Calendar className="h-3 w-3" />
                            {record.date}
                          </span>
                          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-zinc-100 rounded-full text-[#71717a]">
                            <Tag className="h-3 w-3" />
                            {record.category}
                          </span>
                          <span className="text-xs px-2 py-1 bg-zinc-100 rounded-full text-[#71717a]">
                            {record.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                      <button 
                        onClick={() => setSelectedRecord(record)}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-[#e4e4e7] rounded-xl text-sm font-medium text-[#52525b] hover:bg-[#f4f4f5] transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      <button className="inline-flex items-center gap-2 px-4 py-2 border border-[#e4e4e7] rounded-xl text-sm font-medium text-[#52525b] hover:bg-[#f4f4f5] transition-colors">
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {filteredRecords.length > 0 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-[#71717a]">
                Showing {filteredRecords.length} of {records.length} records
              </p>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 border border-[#e4e4e7] rounded-xl text-sm font-medium text-[#52525b] hover:bg-[#f4f4f5] transition-colors">
                  Previous
                </button>
                <button className="px-4 py-2 bg-[#0d9488] text-white rounded-xl text-sm font-medium">1</button>
                <button className="px-4 py-2 border border-[#e4e4e7] rounded-xl text-sm font-medium text-[#52525b] hover:bg-[#f4f4f5] transition-colors">
                  Next
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b border-[#e4e4e7] sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#09090b]">{selectedRecord.title}</h2>
                  <p className="text-sm text-[#71717a] mt-1">{selectedRecord.date} • {selectedRecord.doctor}</p>
                </div>
                <button 
                  onClick={() => setSelectedRecord(null)}
                  className="p-2 hover:bg-[#f4f4f5] rounded-xl transition-colors"
                >
                  <X className="h-5 w-5 text-[#71717a]" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-[#fafafa] rounded-2xl">
                <div className="p-3 rounded-2xl bg-teal-50 text-teal-600">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#09090b]">{selectedRecord.hospital}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-teal-50 text-teal-600 rounded-full font-medium">
                      {selectedRecord.category}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-zinc-100 text-[#71717a] rounded-full">
                      {selectedRecord.type}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-[#09090b] mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#0d9488]" />
                  Summary
                </h3>
                <p className="text-sm text-[#52525b] leading-relaxed">{selectedRecord.summary}</p>
              </div>

              {selectedRecord.results && (
                <div>
                  <h3 className="font-semibold text-[#09090b] mb-3 flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-[#0d9488]" />
                    Test Results
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(selectedRecord.results).map(([key, data]) => {
                       const d = data as { value: string; normal: string; status: string };
                       return (
                      <div key={key} className="p-3 bg-[#fafafa] rounded-xl border border-[#e4e4e7]">
                        <p className="text-xs text-[#71717a] uppercase tracking-wide">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="text-lg font-bold text-[#09090b] mt-1">{d.value}</p>
                        <p className="text-xs text-[#a1a1aa] mt-1">Normal: {d.normal}</p>
                        <span className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full mt-2 ${
                          d.status === "normal" ? "bg-teal-50 text-teal-600" :
                          d.status === "borderline" ? "bg-yellow-50 text-yellow-600" :
                          "bg-red-50 text-red-600"
                        }`}>
                          {d.status}
                        </span>
                      </div>
                    );
                    })}
                  </div>
                </div>
              )}

              {selectedRecord.vitals && (
                <div>
                  <h3 className="font-semibold text-[#09090b] mb-3 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-[#0d9488]" />
                    Vitals
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-[#fafafa] rounded-xl border border-[#e4e4e7] text-center">
                      <p className="text-xs text-[#71717a]">Blood Pressure</p>
                      <p className="text-lg font-bold text-[#09090b] mt-1">{selectedRecord.vitals.bp}</p>
                    </div>
                    <div className="p-3 bg-[#fafafa] rounded-xl border border-[#e4e4e7] text-center">
                      <p className="text-xs text-[#71717a]">Pulse</p>
                      <p className="text-lg font-bold text-[#09090b] mt-1">{selectedRecord.vitals.pulse}</p>
                    </div>
                    <div className="p-3 bg-[#fafafa] rounded-xl border border-[#e4e4e7] text-center">
                      <p className="text-xs text-[#71717a]">BMI</p>
                      <p className="text-lg font-bold text-[#09090b] mt-1">{selectedRecord.vitals.bmi}</p>
                    </div>
                    <div className="p-3 bg-[#fafafa] rounded-xl border border-[#e4e4e7] text-center">
                      <p className="text-xs text-[#71717a]">Temperature</p>
                      <p className="text-lg font-bold text-[#09090b] mt-1">{selectedRecord.vitals.temperature}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-[#e4e4e7]">
                <button className="flex-1 py-3 border border-[#e4e4e7] rounded-xl font-semibold text-[#52525b] hover:bg-[#f4f4f5] transition-colors flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
                <button 
                  onClick={() => setSelectedRecord(null)}
                  className="flex-1 py-3 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
