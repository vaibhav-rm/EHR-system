"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Search, Upload, X, FileText, CheckCircle, AlertCircle, Loader2, User, Calendar, Droplet, Phone, AlertTriangle } from "lucide-react";
import DoctorSidebar from "@/components/DoctorSidebar";
import { searchPatientById, saveDiagnosticReport } from "@/app/actions/clinical";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  email: string;
  role: "doctor";
}

const REPORT_TYPES = ["Lab Report", "Radiology", "Prescription", "Discharge Summary", "Other"] as const;
type ReportType = typeof REPORT_TYPES[number];

const generateMockEHRDataRaw = (type: string, patient: any, reportDate: string, labName: string) => {
  const baseData = {
    test_type: type,
    report_date: reportDate,
    patient_info: {
      name: patient?.name?.[0]?.text || "Unknown",
      patient_id: patient?.id,
      gender: patient?.gender,
    },
    lab_info: {
      name: labName || "MedSense Diagnostics Lab",
      report_id: `RPT${Date.now()}`,
    },
  };

  return {
    ...baseData,
    resourceType: "DiagnosticReport",
    status: "final",
    code: { text: type },
    effectiveDateTime: reportDate,
    conclusion: "Normal results (Simulated)",
  };
};

export default function AddReportPage() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patientId, setPatientId] = useState("");
  const [patient, setPatient] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [reportType, setReportType] = useState<ReportType>("Lab Report");
  const [reportDate, setReportDate] = useState(new Date().toISOString().split("T")[0]);
  const [labName, setLabName] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [ehrData, setEhrData] = useState<any | null>(null);
  const [success, setSuccess] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    const user = session?.user as any;
    if (user && user.role === 'doctor') {
      setDoctor({
        id: user.id,
        name: user.name || "Doctor",
        hospital: "Medanta Hospital",
        specialization: "General Physician",
        email: user.email || "",
        role: "doctor"
      });
    }
  }, [session, status, router]);

  const searchPatient = async () => {
    if (!patientId.trim()) return;

    setIsSearching(true);
    setSearchError("");
    setPatient(null);

    try {
      const data = await searchPatientById(patientId);

      if (!data) {
        setSearchError("Patient not found. Please check the Patient ID.");
        return;
      }

      setPatient(data);
    } catch {
      setSearchError("Error searching for patient.");
    } finally {
      setIsSearching(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
      setEhrData(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const processReport = async () => {
    if (!uploadedFile || !patient || !doctor) return;

    setIsProcessing(true);
    setProcessingStatus("Reading PDF...");

    try {
      // In this demo version, we simulate the OCR processing
      setTimeout(() => {
        setProcessingStatus("Converting to EHR format...");
        setTimeout(() => {
          setEhrData(generateMockEHRDataRaw(reportType, patient, reportDate, labName));
          setProcessingStatus("EHR conversion complete!");
          setIsProcessing(false);
        }, 1000);
      }, 1000);

      // In a real app, you'd fetch /api/doctor/process-report
    } catch (error) {
      console.error("Error processing report:", error);
      setProcessingStatus("Error processing report.");
      setIsProcessing(false);
    }
  };

  const saveReport = async () => {
    if (!patient || !doctor || !ehrData) return;

    setIsProcessing(true);
    setProcessingStatus("Saving report...");

    try {
      const result = await saveDiagnosticReport({
        patientId: patient.id,
        doctorId: doctor.id,
        type: reportType,
        ehrData: ehrData,
        reportDate: reportDate,
        labName: labName || "MedSense Diagnostics Lab"
      });

      if (!result.success) throw new Error(result.message);

      setSuccess(true);
      setProcessingStatus("Report saved successfully!");

      setTimeout(() => {
        setPatient(null);
        setPatientId("");
        setUploadedFile(null);
        setEhrData(null);
        setSuccess(false);
        setProcessingStatus("");
      }, 3000);
    } catch (error) {
      console.error("Error saving report:", error);
      setProcessingStatus("Error saving report");
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <DoctorSidebar doctorName={doctor?.name} specialization={doctor?.specialization} />

      <main className="ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#09090b]">Add Patient Report</h1>
            <p className="text-[#71717a] mt-1">Upload and convert medical reports to universal EHR format</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e4e4e7] p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#09090b] mb-4">Step 1: Find Patient</h2>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Patient ID (or Name Fragment)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    placeholder="e.g., patient-id"
                    className="w-full px-4 py-3 pr-12 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent bg-[#fafafa]"
                    onKeyDown={(e) => e.key === "Enter" && searchPatient()}
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#a1a1aa]" />
                </div>
              </div>
              <button
                onClick={searchPatient}
                disabled={isSearching || !patientId.trim()}
                className="px-6 py-3 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
              >
                {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : "Search"}
              </button>
            </div>

            {searchError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">{searchError}</span>
              </div>
            )}

            {patient && (
              <div className="mt-6 p-6 bg-[#fafafa] rounded-xl border border-[#e4e4e7]">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-[#0d9488]/10 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-[#0d9488]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-[#09090b]">
                        {patient.name?.[0]?.text || (patient.name?.[0]?.given?.[0] + " " + patient.name?.[0]?.family) || "Unknown"}
                      </h3>
                      <span className="px-2 py-0.5 bg-[#0d9488]/10 text-[#0d9488] text-xs font-medium rounded-full">
                        {patient.id.substring(0, 8)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-[#71717a]">
                        <Calendar className="h-4 w-4" />
                        <span>{patient.birthDate ? `${calculateAge(patient.birthDate)} years` : "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#71717a]">
                        <User className="h-4 w-4" />
                        <span>{patient.gender || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#71717a]">
                        <Phone className="h-4 w-4" />
                        <span>{patient.telecom?.[0]?.value || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setPatient(null)} className="text-[#a1a1aa] hover:text-[#71717a]">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {patient && (
            <>
              <div className="bg-white rounded-2xl border border-[#e4e4e7] p-6 mb-6">
                <h2 className="text-lg font-semibold text-[#09090b] mb-4">Step 2: Report Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#09090b] mb-1.5">Report Type</label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value as ReportType)}
                      className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent bg-[#fafafa]"
                    >
                      {REPORT_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#09090b] mb-1.5">Report Date</label>
                    <input
                      type="date"
                      value={reportDate}
                      onChange={(e) => setReportDate(e.target.value)}
                      className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent bg-[#fafafa]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#09090b] mb-1.5">Lab/Facility Name</label>
                    <input
                      type="text"
                      value={labName}
                      onChange={(e) => setLabName(e.target.value)}
                      placeholder="e.g., City Diagnostics"
                      className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent bg-[#fafafa]"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#e4e4e7] p-6 mb-6">
                <h2 className="text-lg font-semibold text-[#09090b] mb-4">Step 3: Upload Report PDF</h2>

                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive
                      ? "border-[#0d9488] bg-[#0d9488]/5"
                      : uploadedFile
                        ? "border-green-500 bg-green-50"
                        : "border-[#e4e4e7] hover:border-[#0d9488]/50"
                    }`}
                >
                  <input {...getInputProps()} />
                  {uploadedFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <FileText className="h-8 w-8 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-[#09090b]">{uploadedFile.name}</p>
                        <p className="text-sm text-[#71717a]">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFile(null);
                          setEhrData(null);
                        }}
                        className="text-sm text-red-500 hover:underline"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-[#fafafa] rounded-full flex items-center justify-center">
                        <Upload className="h-8 w-8 text-[#a1a1aa]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#09090b]">
                          {isDragActive ? "Drop the PDF here" : "Drag & drop PDF here"}
                        </p>
                        <p className="text-sm text-[#71717a]">or click to browse</p>
                      </div>
                    </div>
                  )}
                </div>

                {uploadedFile && !ehrData && (
                  <button
                    onClick={processReport}
                    disabled={isProcessing}
                    className="mt-4 w-full py-3 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {processingStatus}
                      </>
                    ) : (
                      <>
                        <FileText className="h-5 w-5" />
                        Convert to EHR Format (OCR)
                      </>
                    )}
                  </button>
                )}
              </div>

              {ehrData && (
                <div className="bg-white rounded-2xl border border-[#e4e4e7] p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#09090b]">Step 4: FHIR Resource Summary</h2>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Ready to Link
                    </span>
                  </div>

                  <div className="bg-[#fafafa] rounded-xl p-4 max-h-80 overflow-auto">
                    <pre className="text-sm text-[#52525b] whitespace-pre-wrap font-mono">
                      {JSON.stringify(ehrData, null, 2)}
                    </pre>
                  </div>

                  <button
                    onClick={saveReport}
                    disabled={isProcessing || success}
                    className={`mt-4 w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${success
                        ? "bg-green-500 text-white"
                        : "bg-[#0d9488] hover:bg-[#0f766e] text-white"
                      } disabled:opacity-50`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {processingStatus}
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Report Linked Successfully!
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Commit to National Health Stack
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
