"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { 
  User, Heart, Activity, Briefcase, Settings, Camera, CheckCircle,
  ArrowRight, ArrowLeft, Save, SkipForward, ChevronRight,
  Stethoscope, AlertCircle
} from "lucide-react";

type UserRole = "patient" | "doctor";

interface ProfileData {
  personal: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    emergencyContact: string;
    emergencyPhone: string;
    avatar?: string;
  };
  medical: {
    bloodGroup: string;
    height: string;
    weight: string;
    allergies: string;
    chronicConditions: string;
    currentMedications: string;
    pastSurgeries: string;
    familyHistory: string;
  };
  lifestyle: {
    smokingStatus: string;
    alcoholConsumption: string;
    exerciseFrequency: string;
    dietType: string;
    sleepHours: string;
    stressLevel: string;
    occupation: string;
    workEnvironment: string;
  };
  professional: {
    licenseNumber: string;
    specialization: string;
    qualification: string;
    experience: string;
    hospitalAffiliation: string;
    consultationFee: string;
    availableDays: string[];
    availableHours: string;
  };
  preferences: {
    language: string;
    notifications: boolean;
    emailUpdates: boolean;
    smsAlerts: boolean;
    appointmentReminders: boolean;
    healthTips: boolean;
    dataSharing: boolean;
    theme: string;
  };
  photo: {
    url: string;
  };
}

const steps = [
  { id: 1, name: "Personal", icon: User, description: "Basic information" },
  { id: 2, name: "Medical", icon: Heart, description: "Health details" },
  { id: 3, name: "Lifestyle", icon: Activity, description: "Daily habits" },
  { id: 4, name: "Professional", icon: Briefcase, description: "Work info" },
  { id: 5, name: "Preferences", icon: Settings, description: "App settings" },
  { id: 6, name: "Photo", icon: Camera, description: "Profile picture" },
  { id: 7, name: "Review", icon: CheckCircle, description: "Confirm details" },
];

const initialProfileData: ProfileData = {
  personal: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    emergencyContact: "",
    emergencyPhone: "",
  },
  medical: {
    bloodGroup: "",
    height: "",
    weight: "",
    allergies: "",
    chronicConditions: "",
    currentMedications: "",
    pastSurgeries: "",
    familyHistory: "",
  },
  lifestyle: {
    smokingStatus: "",
    alcoholConsumption: "",
    exerciseFrequency: "",
    dietType: "",
    sleepHours: "",
    stressLevel: "",
    occupation: "",
    workEnvironment: "",
  },
  professional: {
    licenseNumber: "",
    specialization: "",
    qualification: "",
    experience: "",
    hospitalAffiliation: "",
    consultationFee: "",
    availableDays: [],
    availableHours: "",
  },
  preferences: {
    language: "English",
    notifications: true,
    emailUpdates: true,
    smsAlerts: true,
    appointmentReminders: true,
    healthTips: true,
    dataSharing: false,
    theme: "light",
  },
  photo: {
    url: "",
  },
};

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [userRole, setUserRole] = useState<UserRole>("patient");
  const [profileData, setProfileData] = useState<ProfileData>(initialProfileData);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [skippedSteps, setSkippedSteps] = useState<number[]>([]);

  useEffect(() => {
    if ((session?.user as any)?.role) {
        setUserRole((session?.user as any).role);
    }
  }, [session]);

  // Fetch Profile
  const { data: patientBundle, isLoading } = useQuery({
    queryKey: ['patient-profile', session?.user?.email],
    queryFn: async () => {
      if (!session?.user?.email) return null;
      const res = await fetch(`/api/fhir/Patient?email=${encodeURIComponent(session.user.email)}`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: !!session?.user?.email
  });
  
  const patientResource = patientBundle?.entry?.[0]?.resource;
  
  useEffect(() => {
    if (patientResource) {
        setProfileData(prev => ({
            ...prev,
            personal: {
                ...prev.personal,
                firstName: patientResource.name?.[0]?.given?.[0] || "",
                lastName: patientResource.name?.[0]?.family || "",
                email: patientResource.telecom?.find((t: any) => t.system === 'email')?.value || prev.personal.email,
                phone: patientResource.telecom?.find((t: any) => t.system === 'phone')?.value || "",
                dateOfBirth: patientResource.birthDate || "",
                gender: patientResource.gender || "",
                address: patientResource.address?.[0]?.text || "",
                city: patientResource.address?.[0]?.city || "",
                state: patientResource.address?.[0]?.state || "",
                pincode: patientResource.address?.[0]?.postalCode || "",
            },
            // Other sections would require custom extensions or specific mapping logic not standard in basic Patient resource
        }));
    }
  }, [patientResource]);

  const updateField = (section: keyof ProfileData, field: string, value: string | boolean | string[]) => {
    setProfileData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    if (skippedSteps.includes(currentStep)) {
      setSkippedSteps(skippedSteps.filter((s) => s !== currentStep));
    }
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (!skippedSteps.includes(currentStep) && !completedSteps.includes(currentStep)) {
      setSkippedSteps([...skippedSteps, currentStep]);
    }
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };


  const handleSave = async () => {
    if (!patientResource?.id) {
        alert("No patient profile found to update.");
        return;
    }

    const updatedPatient = {
        ...patientResource,
        resourceType: "Patient",
        id: patientResource.id,
        name: [{
            use: "official",
            family: profileData.personal.lastName,
            given: [profileData.personal.firstName]
        }],
        telecom: [
            { system: "email", value: profileData.personal.email },
            { system: "phone", value: profileData.personal.phone }
        ],
        gender: profileData.personal.gender,
        birthDate: profileData.personal.dateOfBirth,
        photo: profileData.personal.avatar ? [{ url: profileData.personal.avatar }] : patientResource.photo,
        address: [{
            text: profileData.personal.address,
            city: profileData.personal.city,
            state: profileData.personal.state,
            postalCode: profileData.personal.pincode,
            country: "India" // Default
        }]
    };

    try {
        const res = await fetch('/api/fhir/Patient', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedPatient)
        });

        if (res.ok) {
            alert("Profile saved successfully!");
            window.location.href = "/dashboard";
        } else {
            alert("Failed to save profile.");
        }
    } catch (e) {
        console.error(e);
        alert("An error occurred while saving.");
    }
  };

  const completionPercentage = Math.round(((completedSteps.length) / 7) * 100);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">First Name *</label>
                <input
                  type="text"
                  value={profileData.personal.firstName}
                  onChange={(e) => updateField("personal", "firstName", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Last Name *</label>
                <input
                  type="text"
                  value={profileData.personal.lastName}
                  onChange={(e) => updateField("personal", "lastName", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Email *</label>
                <input
                  type="email"
                  value={profileData.personal.email}
                  onChange={(e) => updateField("personal", "email", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Phone *</label>
                <input
                  type="tel"
                  value={profileData.personal.phone}
                  onChange={(e) => updateField("personal", "phone", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={profileData.personal.dateOfBirth}
                  onChange={(e) => updateField("personal", "dateOfBirth", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Gender</label>
                <select
                  value={profileData.personal.gender}
                  onChange={(e) => updateField("personal", "gender", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#09090b] mb-1.5">Address</label>
              <textarea
                value={profileData.personal.address}
                onChange={(e) => updateField("personal", "address", e.target.value)}
                className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                rows={2}
                placeholder="Enter your address"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">City</label>
                <input
                  type="text"
                  value={profileData.personal.city}
                  onChange={(e) => updateField("personal", "city", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">State</label>
                <input
                  type="text"
                  value={profileData.personal.state}
                  onChange={(e) => updateField("personal", "state", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Pincode</label>
                <input
                  type="text"
                  value={profileData.personal.pincode}
                  onChange={(e) => updateField("personal", "pincode", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                  placeholder="Pincode"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Emergency Contact Name</label>
                <input
                  type="text"
                  value={profileData.personal.emergencyContact}
                  onChange={(e) => updateField("personal", "emergencyContact", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                  placeholder="Emergency contact name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Emergency Contact Phone</label>
                <input
                  type="tel"
                  value={profileData.personal.emergencyPhone}
                  onChange={(e) => updateField("personal", "emergencyPhone", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                  placeholder="Emergency contact phone"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Blood Group</label>
                <select
                  value={profileData.medical.bloodGroup}
                  onChange={(e) => updateField("medical", "bloodGroup", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Height (cm)</label>
                <input
                  type="number"
                  value={profileData.medical.height}
                  onChange={(e) => updateField("medical", "height", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                  placeholder="e.g., 175"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Weight (kg)</label>
                <input
                  type="number"
                  value={profileData.medical.weight}
                  onChange={(e) => updateField("medical", "weight", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                  placeholder="e.g., 70"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#09090b] mb-1.5">Known Allergies</label>
              <textarea
                value={profileData.medical.allergies}
                onChange={(e) => updateField("medical", "allergies", e.target.value)}
                className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                rows={2}
                placeholder="List any allergies (medications, food, etc.)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#09090b] mb-1.5">Chronic Conditions</label>
              <textarea
                value={profileData.medical.chronicConditions}
                onChange={(e) => updateField("medical", "chronicConditions", e.target.value)}
                className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                rows={2}
                placeholder="Any chronic conditions (diabetes, hypertension, etc.)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#09090b] mb-1.5">Current Medications</label>
              <textarea
                value={profileData.medical.currentMedications}
                onChange={(e) => updateField("medical", "currentMedications", e.target.value)}
                className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                rows={2}
                placeholder="List current medications and dosages"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#09090b] mb-1.5">Past Surgeries</label>
              <textarea
                value={profileData.medical.pastSurgeries}
                onChange={(e) => updateField("medical", "pastSurgeries", e.target.value)}
                className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                rows={2}
                placeholder="List any past surgeries with dates"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#09090b] mb-1.5">Family Medical History</label>
              <textarea
                value={profileData.medical.familyHistory}
                onChange={(e) => updateField("medical", "familyHistory", e.target.value)}
                className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                rows={2}
                placeholder="Relevant family medical history"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Smoking Status</label>
                <select
                  value={profileData.lifestyle.smokingStatus}
                  onChange={(e) => updateField("lifestyle", "smokingStatus", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                >
                  <option value="">Select</option>
                  <option value="never">Never smoked</option>
                  <option value="former">Former smoker</option>
                  <option value="occasional">Occasional smoker</option>
                  <option value="regular">Regular smoker</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Alcohol Consumption</label>
                <select
                  value={profileData.lifestyle.alcoholConsumption}
                  onChange={(e) => updateField("lifestyle", "alcoholConsumption", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                >
                  <option value="">Select</option>
                  <option value="never">Never</option>
                  <option value="occasional">Occasional</option>
                  <option value="moderate">Moderate</option>
                  <option value="heavy">Heavy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Exercise Frequency</label>
                <select
                  value={profileData.lifestyle.exerciseFrequency}
                  onChange={(e) => updateField("lifestyle", "exerciseFrequency", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                >
                  <option value="">Select</option>
                  <option value="sedentary">Sedentary (no exercise)</option>
                  <option value="light">Light (1-2 times/week)</option>
                  <option value="moderate">Moderate (3-4 times/week)</option>
                  <option value="active">Active (5+ times/week)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Diet Type</label>
                <select
                  value={profileData.lifestyle.dietType}
                  onChange={(e) => updateField("lifestyle", "dietType", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                >
                  <option value="">Select</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="non-vegetarian">Non-Vegetarian</option>
                  <option value="eggetarian">Eggetarian</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Average Sleep (hours/day)</label>
                <select
                  value={profileData.lifestyle.sleepHours}
                  onChange={(e) => updateField("lifestyle", "sleepHours", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                >
                  <option value="">Select</option>
                  <option value="less-5">Less than 5 hours</option>
                  <option value="5-6">5-6 hours</option>
                  <option value="7-8">7-8 hours</option>
                  <option value="more-8">More than 8 hours</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Stress Level</label>
                <select
                  value={profileData.lifestyle.stressLevel}
                  onChange={(e) => updateField("lifestyle", "stressLevel", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                >
                  <option value="">Select</option>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                  <option value="very-high">Very High</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Occupation</label>
                <input
                  type="text"
                  value={profileData.lifestyle.occupation}
                  onChange={(e) => updateField("lifestyle", "occupation", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                  placeholder="Your occupation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Work Environment</label>
                <select
                  value={profileData.lifestyle.workEnvironment}
                  onChange={(e) => updateField("lifestyle", "workEnvironment", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                >
                  <option value="">Select</option>
                  <option value="office">Office/Desk job</option>
                  <option value="remote">Work from home</option>
                  <option value="field">Field work</option>
                  <option value="physical">Physical labor</option>
                  <option value="healthcare">Healthcare setting</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        return userRole === "doctor" ? (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6">
              <div className="flex items-center gap-2 text-blue-700">
                <Stethoscope className="h-5 w-5" />
                <span className="font-medium">Doctor Professional Details</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">This information will be visible to patients</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Medical License Number *</label>
                <input
                  type="text"
                  value={profileData.professional.licenseNumber}
                  onChange={(e) => updateField("professional", "licenseNumber", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                  placeholder="e.g., MCI-12345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Specialization *</label>
                <select
                  value={profileData.professional.specialization}
                  onChange={(e) => updateField("professional", "specialization", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                >
                  <option value="">Select specialization</option>
                  <option value="general">General Physician</option>
                  <option value="cardiology">Cardiologist</option>
                  <option value="dermatology">Dermatologist</option>
                  <option value="neurology">Neurologist</option>
                  <option value="orthopedics">Orthopedist</option>
                  <option value="pediatrics">Pediatrician</option>
                  <option value="psychiatry">Psychiatrist</option>
                  <option value="gynecology">Gynecologist</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Qualification</label>
                <input
                  type="text"
                  value={profileData.professional.qualification}
                  onChange={(e) => updateField("professional", "qualification", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                  placeholder="e.g., MBBS, MD (Medicine)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Years of Experience</label>
                <input
                  type="number"
                  value={profileData.professional.experience}
                  onChange={(e) => updateField("professional", "experience", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                  placeholder="e.g., 10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Hospital Affiliation</label>
                <input
                  type="text"
                  value={profileData.professional.hospitalAffiliation}
                  onChange={(e) => updateField("professional", "hospitalAffiliation", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                  placeholder="e.g., Apollo Hospital, Delhi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Consultation Fee (₹)</label>
                <input
                  type="number"
                  value={profileData.professional.consultationFee}
                  onChange={(e) => updateField("professional", "consultationFee", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                  placeholder="e.g., 500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#09090b] mb-1.5">Available Days</label>
              <div className="flex flex-wrap gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      const days = profileData.professional.availableDays;
                      if (days.includes(day)) {
                        updateField("professional", "availableDays", days.filter((d) => d !== day));
                      } else {
                        updateField("professional", "availableDays", [...days, day]);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      profileData.professional.availableDays.includes(day)
                        ? "bg-[#0d9488] text-white"
                        : "bg-[#f4f4f5] text-[#52525b] hover:bg-[#e4e4e7]"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#09090b] mb-1.5">Available Hours</label>
              <input
                type="text"
                value={profileData.professional.availableHours}
                onChange={(e) => updateField("professional", "availableHours", e.target.value)}
                className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                placeholder="e.g., 9:00 AM - 5:00 PM"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-[#f0fdfa] rounded-xl border border-[#99f6e4] mb-6">
              <div className="flex items-center gap-2 text-[#0d9488]">
                <Briefcase className="h-5 w-5" />
                <span className="font-medium">Patient Professional Details</span>
              </div>
              <p className="text-sm text-[#0d9488]/80 mt-1">Optional information for better healthcare</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Occupation</label>
                <input
                  type="text"
                  value={profileData.lifestyle.occupation}
                  onChange={(e) => updateField("lifestyle", "occupation", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                  placeholder="Your current occupation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Work Environment</label>
                <select
                  value={profileData.lifestyle.workEnvironment}
                  onChange={(e) => updateField("lifestyle", "workEnvironment", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                >
                  <option value="">Select</option>
                  <option value="office">Office/Desk job</option>
                  <option value="remote">Work from home</option>
                  <option value="field">Field work</option>
                  <option value="physical">Physical labor</option>
                </select>
              </div>
            </div>
            <p className="text-sm text-[#71717a]">
              This information helps doctors understand potential occupational health risks and provide better care.
            </p>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#09090b] mb-1.5">Preferred Language</label>
              <select
                value={profileData.preferences.language}
                onChange={(e) => updateField("preferences", "language", e.target.value)}
                className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
                <option value="Bengali">Bengali</option>
                <option value="Marathi">Marathi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#09090b] mb-1.5">Theme</label>
              <select
                value={profileData.preferences.theme}
                onChange={(e) => updateField("preferences", "theme", e.target.value)}
                className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-[#09090b]">Notification Preferences</h4>
              {[
                { key: "notifications", label: "Push Notifications" },
                { key: "emailUpdates", label: "Email Updates" },
                { key: "smsAlerts", label: "SMS Alerts" },
                { key: "appointmentReminders", label: "Appointment Reminders" },
                { key: "healthTips", label: "Health Tips & Articles" },
              ].map((pref) => (
                <label key={pref.key} className="flex items-center justify-between p-4 bg-[#fafafa] rounded-xl cursor-pointer hover:bg-[#f4f4f5] transition-colors">
                  <span className="text-sm text-[#09090b]">{pref.label}</span>
                  <input
                    type="checkbox"
                    checked={profileData.preferences[pref.key as keyof typeof profileData.preferences] as boolean}
                    onChange={(e) => updateField("preferences", pref.key, e.target.checked)}
                    className="w-5 h-5 rounded border-[#e4e4e7] text-[#0d9488] focus:ring-[#0d9488]"
                  />
                </label>
              ))}
            </div>
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-orange-800">Allow Data Sharing</span>
                  <p className="text-xs text-orange-600 mt-0.5">Share anonymized data for medical research</p>
                </div>
                <input
                  type="checkbox"
                  checked={profileData.preferences.dataSharing}
                  onChange={(e) => updateField("preferences", "dataSharing", e.target.checked)}
                  className="w-5 h-5 rounded border-orange-200 text-orange-500 focus:ring-orange-500"
                />
              </label>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-[#0d9488] to-[#0f766e] flex items-center justify-center mb-6 shadow-lg">
                {profileData.photo.url ? (
                  <img src={profileData.photo.url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="h-20 w-20 text-white" />
                )}
                <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-[#f4f4f5] transition-colors">
                  <Camera className="h-5 w-5 text-[#0d9488]" />
                </button>
              </div>
              <p className="text-sm text-[#71717a] text-center mb-6">
                Upload a professional photo for your profile
              </p>
              <div className="w-full max-w-sm">
                <label className="block text-sm font-medium text-[#09090b] mb-1.5">Photo URL</label>
                <input
                  type="url"
                  value={profileData.photo.url}
                  onChange={(e) => updateField("photo", "url", e.target.value)}
                  className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-white"
                  placeholder="Paste image URL here"
                />
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="p-4 bg-[#f0fdfa] rounded-xl border border-[#99f6e4]">
              <div className="flex items-center gap-2 text-[#0d9488]">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Review Your Profile</span>
              </div>
              <p className="text-sm text-[#0d9488]/80 mt-1">Please review your information before saving</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-5 border border-[#e4e4e7]">
                <h4 className="font-semibold text-[#09090b] mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-[#0d9488]" /> Personal Information
                </h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-[#71717a]">Name:</span> {profileData.personal.firstName} {profileData.personal.lastName}</p>
                  <p><span className="text-[#71717a]">Email:</span> {profileData.personal.email}</p>
                  <p><span className="text-[#71717a]">Phone:</span> {profileData.personal.phone}</p>
                  <p><span className="text-[#71717a]">Gender:</span> {profileData.personal.gender || "Not specified"}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#e4e4e7]">
                <h4 className="font-semibold text-[#09090b] mb-3 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-[#0d9488]" /> Medical Information
                </h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-[#71717a]">Blood Group:</span> {profileData.medical.bloodGroup || "Not specified"}</p>
                  <p><span className="text-[#71717a]">Height:</span> {profileData.medical.height ? `${profileData.medical.height} cm` : "Not specified"}</p>
                  <p><span className="text-[#71717a]">Weight:</span> {profileData.medical.weight ? `${profileData.medical.weight} kg` : "Not specified"}</p>
                  <p><span className="text-[#71717a]">Allergies:</span> {profileData.medical.allergies || "None specified"}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#e4e4e7]">
                <h4 className="font-semibold text-[#09090b] mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#0d9488]" /> Lifestyle
                </h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-[#71717a]">Smoking:</span> {profileData.lifestyle.smokingStatus || "Not specified"}</p>
                  <p><span className="text-[#71717a]">Exercise:</span> {profileData.lifestyle.exerciseFrequency || "Not specified"}</p>
                  <p><span className="text-[#71717a]">Diet:</span> {profileData.lifestyle.dietType || "Not specified"}</p>
                  <p><span className="text-[#71717a]">Sleep:</span> {profileData.lifestyle.sleepHours || "Not specified"}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#e4e4e7]">
                <h4 className="font-semibold text-[#09090b] mb-3 flex items-center gap-2">
                  <Settings className="h-4 w-4 text-[#0d9488]" /> Preferences
                </h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-[#71717a]">Language:</span> {profileData.preferences.language}</p>
                  <p><span className="text-[#71717a]">Theme:</span> {profileData.preferences.theme}</p>
                  <p><span className="text-[#71717a]">Notifications:</span> {profileData.preferences.notifications ? "Enabled" : "Disabled"}</p>
                </div>
              </div>
            </div>

            {skippedSteps.length > 0 && (
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                <div className="flex items-center gap-2 text-orange-700">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Skipped Steps</span>
                </div>
                <p className="text-sm text-orange-600 mt-1">
                  You skipped: {skippedSteps.map((s) => steps[s - 1].name).join(", ")}. You can go back to complete them.
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar />
      <div className="flex-1 ml-64 transition-all duration-300">
        <Navbar />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#09090b]">Profile Management</h1>
            <p className="text-sm text-[#71717a] mt-1">Complete your profile to get personalized healthcare</p>
          </div>



          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#09090b]">Profile Completion</span>
              <span className="text-sm font-bold text-[#0d9488]">{completionPercentage}%</span>
            </div>
            <div className="h-2 bg-[#e4e4e7] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0d9488] to-[#14b8a6] rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  currentStep === step.id
                    ? "bg-[#0d9488] text-white shadow-lg"
                    : completedSteps.includes(step.id)
                    ? "bg-[#f0fdfa] text-[#0d9488] border border-[#99f6e4]"
                    : skippedSteps.includes(step.id)
                    ? "bg-orange-50 text-orange-600 border border-orange-100"
                    : "bg-white text-[#52525b] border border-[#e4e4e7] hover:border-[#0d9488]/30"
                }`}
              >
                <step.icon className="h-4 w-4" />
                {step.name}
                {completedSteps.includes(step.id) && <CheckCircle className="h-3 w-3" />}
                {skippedSteps.includes(step.id) && <SkipForward className="h-3 w-3" />}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#e4e4e7] mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0d9488] to-[#14b8a6] rounded-xl flex items-center justify-center">
                {React.createElement(steps[currentStep - 1].icon, { className: "h-6 w-6 text-white" })}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#09090b]">{steps[currentStep - 1].name}</h2>
                <p className="text-sm text-[#71717a]">{steps[currentStep - 1].description}</p>
              </div>
              <div className="ml-auto flex items-center gap-1 text-sm text-[#71717a]">
                Step {currentStep} of 7
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>

            {renderStepContent()}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                currentStep === 1
                  ? "bg-[#f4f4f5] text-[#a1a1aa] cursor-not-allowed"
                  : "bg-white border border-[#e4e4e7] text-[#09090b] hover:bg-[#f4f4f5]"
              }`}
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </button>

            <div className="flex items-center gap-3">
              {currentStep < 7 && (
                <button
                  onClick={handleSkip}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-[#71717a] hover:text-[#09090b] hover:bg-[#f4f4f5] transition-colors"
                >
                  <SkipForward className="h-4 w-4" /> Skip
                </button>
              )}

              {currentStep === 7 ? (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl font-semibold transition-colors shadow-lg"
                >
                  <Save className="h-4 w-4" /> Save Profile
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl font-semibold transition-colors"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
