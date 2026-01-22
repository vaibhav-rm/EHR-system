"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateDoctorProfile, getDoctorProfile } from "@/app/actions/clinical";
import DoctorSidebar from "@/components/DoctorSidebar";
import { User, Stethoscope, Building2, Phone, GraduationCap, DollarSign, Clock, Save, Loader2, Award } from "lucide-react";
import { toast } from "sonner";

export default function DoctorProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    specialization: "",
    qualification: "",
    hospital: "Medanta Hospital",
    phone: "",
    fee: 500,
    years_of_experience: 0,
    profile_image_url: ""
  });

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    const fetchDoctor = async () => {
        if (!session?.user?.id) return;
        
        try {
            // Fetch from FHIR store via server action
            const data = await getDoctorProfile(session.user.id);

            if (data) {
                setProfile({
                    id: data.id,
                    name: data.name || session.user.name || "",
                    email: data.email || session.user.email || "",
                    specialization: data.specialization || "",
                    qualification: data.qualification || "",
                    hospital: data.hospital || "Medanta Hospital",
                    phone: data.phone || "",
                    fee: data.fee || 500,
                    years_of_experience: data.years_of_experience || 0,
                    profile_image_url: data.profile_image_url || session.user.image || ""
                });
            } else {
                 // Initialize with session data if no doctor record found (will be created on save)
                 setProfile(prev => ({
                     ...prev,
                     id: session.user.id,
                     name: session.user.name || "",
                     email: session.user.email || "",
                     profile_image_url: session.user.image || ""
                 }));
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            // Ensure ID is set even on error
            setProfile(prev => ({ ...prev, id: session.user.id }));
            toast.error("Failed to load profile");
        } finally {
            setIsLoading(false);
        }
    };

    fetchDoctor();
  }, [session, status, router]);

  const handleSave = async () => {
    if (!profile.name.trim()) {
        toast.error("Name is required");
        return;
    }
    
    setIsSaving(true);
    try {
        const formData = new FormData();
        formData.append("id", profile.id || session?.user?.id || ""); 
        formData.append("name", profile.name);
        formData.append("specialization", profile.specialization);
        formData.append("qualification", profile.qualification);
        formData.append("hospital", profile.hospital);
        formData.append("phone", profile.phone);
        formData.append("fee", profile.fee.toString());
        formData.append("years_of_experience", profile.years_of_experience.toString());

        const result = await updateDoctorProfile(null, formData);

        if (result.success) {
            toast.success(result.message);
            // No need to manual update 'doctors' table anymore as instructed by user
        } else {
            toast.error(result.message || "Failed to update profile");
            if (result.errors) {
                const firstError = Object.values(result.errors).flat()[0];
                if (firstError) toast.error(String(firstError));
            }
        }
    } catch (error) {
        console.error("Save error:", error);
        toast.error("An unexpected error occurred");
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0d9488]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <DoctorSidebar doctorName={profile.name} specialization={profile.specialization} />
      
      <main className="ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#09090b]">My Profile</h1>
              <p className="text-[#71717a] mt-1">Manage your professional details and settings</p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Image & Basic Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#e4e4e7] p-6 text-center">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 overflow-hidden relative group cursor-pointer">
                  {profile.profile_image_url ? (
                      <img src={profile.profile_image_url} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                      <span>{profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs">Change</p>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-[#09090b]">{profile.name}</h2>
                <p className="text-[#0d9488] font-medium">{profile.specialization}</p>
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#71717a]">
                  <Building2 className="h-4 w-4" />
                  {profile.hospital}
                </div>
              </div>
            </div>

            {/* Right Column - Edit Form */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-[#e4e4e7] p-6">
                <h3 className="text-lg font-semibold text-[#09090b] mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-[#0d9488]" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#09090b] mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#09090b] mb-1.5">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-2.5 border border-[#e4e4e7] rounded-xl text-sm bg-[#f4f4f5] text-[#71717a] cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#09090b] mb-1.5">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#e4e4e7] p-6">
                <h3 className="text-lg font-semibold text-[#09090b] mb-6 flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#0d9488]" />
                  Professional Details
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[#09090b] mb-1.5">Specialization</label>
                        <div className="relative">
                        <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
                        <input
                            type="text"
                            value={profile.specialization}
                            onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                        />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#09090b] mb-1.5">Qualification</label>
                        <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
                        <input
                            type="text"
                            value={profile.qualification}
                            onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                        />
                        </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#09090b] mb-1.5">Hospital / Clinic</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
                      <input
                        type="text"
                        value={profile.hospital}
                        onChange={(e) => setProfile({ ...profile, hospital: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[#09090b] mb-1.5">Consultation Fee (₹)</label>
                        <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
                        <input
                            type="number"
                            value={profile.fee}
                            onChange={(e) => setProfile({ ...profile, fee: Number(e.target.value) })}
                            className="w-full pl-10 pr-4 py-2.5 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                        />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#09090b] mb-1.5">Experience (Years)</label>
                        <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
                        <input
                            type="number"
                            value={profile.years_of_experience}
                            onChange={(e) => setProfile({ ...profile, years_of_experience: Number(e.target.value) })}
                            className="w-full pl-10 pr-4 py-2.5 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                        />
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
