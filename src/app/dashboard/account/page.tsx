"use client";

import React, { useState, useEffect } from "react";
import {
    User,
    Stethoscope,
    Activity,
    Heart,
    Settings,
    Camera,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Info,
    ShieldPlus,
    Briefcase,
    AlertTriangle,
    Zap,
    Globe,
    Bell,
    Sparkles
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function AccountPage() {
    const { data: session } = useSession();
    const [step, setStep] = useState(1);
    const totalSteps = 7;
    const isDoctor = session?.user?.role === 'doctor';

    // --- FORM STATE ---
    const [formData, setFormData] = useState<any>({
        // Step 1
        firstName: "", lastName: "", email: "",
        dob: "", gender: "", nationality: "", maritalStatus: "",
        phone: "", address: "", city: "", state: "", pincode: "",
        emergencyName: "", emergencyPhone: "", emergencyRelation: "",
        bloodGroup: "", height: "", weight: "",
        // Step 2
        allergies: "", currentMeds: "", chronicDiseases: "",
        pastMeds: "", injuries: "", surgeries: "",
        insuranceProvider: "", insurancePolicy: "",
        // Step 3
        smoking: "never", alcohol: "none",
        activityLevel: "moderate",
        nutrition: "mixed",
        occupation: "",
        // Step 4 (Doctor)
        title: "", specialization: "", department: "",
        experience: "", license: "", hospitalName: "", hospitalAddress: "",
        availableDays: [], preferredTime: "", consultationFees: "",
        // Step 5
        language: "English",
        commMethod: "App Notification",
        // Step 6
        photo: null
    });

    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    // Load progress
    useEffect(() => {
        const saved = localStorage.getItem('profile_completion');
        if (saved) {
            const parsed = JSON.parse(saved);
            setFormData(parsed.data || formData);
            setCompletedSteps(parsed.completed || []);
            // If they were at a step, reset to 1 for this flow
        }
    }, []);

    const saveProgress = () => {
        const newCompleted = [...new Set([...completedSteps, step])];
        setCompletedSteps(newCompleted);
        localStorage.setItem('profile_completion', JSON.stringify({
            data: formData,
            completed: newCompleted
        }));

        if (step < totalSteps) {
            setStep(step + 1);
            toast.success(`Step ${step} Saved`, { description: "Progress captured successfully." });
        }
    };

    const skipStep = () => {
        if (step < totalSteps) {
            setStep(step + 1);
            toast.info(`Step ${step} Skipped`, { description: "You can complete this later." });
        }
    };

    const updateField = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const calculateCompletion = () => {
        return Math.round((completedSteps.length / totalSteps) * 100);
    };

    const handleComplete = () => {
        const totalCompletion = calculateCompletion();
        const karmaPoints = totalCompletion === 100 ? 500 : Math.round(totalCompletion * 5);

        // Mark step 7 as complete
        const finalCompleted = [...new Set([...completedSteps, 7])];
        setCompletedSteps(finalCompleted);
        localStorage.setItem('profile_completion', JSON.stringify({
            data: formData,
            completed: finalCompleted
        }));

        toast.success("Profile Journey Complete!", {
            description: `Congratulations! You've earned ${karmaPoints} Karma Points!`,
            duration: 5000
        });

        // The summary view will now automatically show since all steps are complete
    };

    const resetJourney = () => {
        const confirmed = window.confirm("Are you sure you want to edit your profile? This will take you back to the step-by-step journey.");
        if (confirmed) {
            setStep(1);
        }
    };

    // Check if profile is complete
    const isProfileComplete = completedSteps.length === totalSteps;


    return (
        <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
            {isProfileComplete ? (
                /* COMPLETED PROFILE SUMMARY VIEW */
                <>
                    {/* Success Header */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Your <span className="text-teal-600">Health Profile</span></h1>
                                <p className="text-zinc-500 font-medium mt-1">Congratulations! Your profile journey is complete.</p>
                            </div>
                            <Button onClick={resetJourney} variant="outline" className="rounded-xl h-12 px-6 font-bold border-zinc-200 hover:bg-zinc-50">
                                Edit Profile
                            </Button>
                        </div>
                        <Progress value={100} className="h-3 rounded-full bg-zinc-100" />
                    </div>

                    {/* Karma Points Hero Card */}
                    <Card className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-teal-900 text-white border-0 shadow-2xl relative overflow-hidden rounded-[2.5rem]">
                        <div className="absolute -right-20 -top-20 opacity-10">
                            <Sparkles className="h-80 w-80" />
                        </div>
                        <CardHeader className="p-10">
                            <div className="flex items-center gap-3 mb-2">
                                <Zap className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                                <CardTitle className="text-2xl font-black uppercase tracking-widest">Karma Points Earned</CardTitle>
                            </div>
                            <CardDescription className="text-white/60 font-medium">Unlock exclusive benefits and premium features</CardDescription>
                        </CardHeader>
                        <CardContent className="px-10 pb-10">
                            <div className="flex items-baseline gap-4 mb-8">
                                <div className="text-8xl font-black tracking-tighter">500</div>
                                <Badge className="bg-yellow-500/20 text-yellow-400 border-none px-4 py-2 text-sm font-black tracking-widest">
                                    MAX BONUS
                                </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                                    <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Completion</div>
                                    <div className="text-2xl font-black">100%</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                                    <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Steps Done</div>
                                    <div className="text-2xl font-black">7 / 7</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                                    <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Tier Status</div>
                                    <div className="text-2xl font-black text-teal-400">Elite</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Profile Summary Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <Card className="rounded-[2rem] border-zinc-200 shadow-sm">
                            <CardHeader className="p-6 bg-zinc-50 border-b border-zinc-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-xl shadow-sm border border-zinc-100">
                                        <User className="h-5 w-5 text-teal-600" />
                                    </div>
                                    <CardTitle className="text-lg font-black">Personal Details</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {formData.firstName && (
                                    <div>
                                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Full Name</div>
                                        <div className="font-bold text-zinc-900">{formData.firstName} {formData.lastName}</div>
                                    </div>
                                )}
                                {formData.dob && (
                                    <div>
                                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Date of Birth</div>
                                        <div className="font-bold text-zinc-900">{formData.dob}</div>
                                    </div>
                                )}
                                {formData.bloodGroup && (
                                    <div>
                                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Blood Group</div>
                                        <div className="font-bold text-zinc-900">{formData.bloodGroup}</div>
                                    </div>
                                )}
                                {formData.nationality && (
                                    <div>
                                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Nationality</div>
                                        <div className="font-bold text-zinc-900">{formData.nationality}</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Medical History */}
                        <Card className="rounded-[2rem] border-zinc-200 shadow-sm">
                            <CardHeader className="p-6 bg-red-50 border-b border-red-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-xl shadow-sm border border-red-100">
                                        <ShieldPlus className="h-5 w-5 text-red-600" />
                                    </div>
                                    <CardTitle className="text-lg font-black">Medical History</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {formData.allergies && (
                                    <div>
                                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Allergies</div>
                                        <div className="font-bold text-zinc-900">{formData.allergies}</div>
                                    </div>
                                )}
                                {formData.currentMeds && (
                                    <div>
                                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Current Medications</div>
                                        <div className="font-bold text-zinc-900">{formData.currentMeds}</div>
                                    </div>
                                )}
                                {formData.chronicDiseases && (
                                    <div>
                                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Chronic Conditions</div>
                                        <div className="font-bold text-zinc-900">{formData.chronicDiseases}</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Lifestyle */}
                        <Card className="rounded-[2rem] border-zinc-200 shadow-sm">
                            <CardHeader className="p-6 bg-amber-50 border-b border-amber-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-xl shadow-sm border border-amber-100">
                                        <Activity className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <CardTitle className="text-lg font-black">Lifestyle & Habits</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {formData.smoking && (
                                        <div>
                                            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Smoking</div>
                                            <div className="font-bold text-zinc-900 capitalize">{formData.smoking}</div>
                                        </div>
                                    )}
                                    {formData.alcohol && (
                                        <div>
                                            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Alcohol</div>
                                            <div className="font-bold text-zinc-900 capitalize">{formData.alcohol}</div>
                                        </div>
                                    )}
                                </div>
                                {formData.activityLevel && (
                                    <div>
                                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Activity Level</div>
                                        <div className="font-bold text-zinc-900 capitalize">{formData.activityLevel}</div>
                                    </div>
                                )}
                                {formData.nutrition && (
                                    <div>
                                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Nutrition</div>
                                        <div className="font-bold text-zinc-900 capitalize">{formData.nutrition}</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Professional (if doctor) */}
                        {isDoctor && formData.title && (
                            <Card className="rounded-[2rem] border-zinc-200 shadow-sm">
                                <CardHeader className="p-6 bg-blue-50 border-b border-blue-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl shadow-sm border border-blue-100">
                                            <Briefcase className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <CardTitle className="text-lg font-black">Professional Details</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    {formData.title && (
                                        <div>
                                            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Title</div>
                                            <div className="font-bold text-zinc-900">{formData.title}</div>
                                        </div>
                                    )}
                                    {formData.specialization && (
                                        <div>
                                            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Specialization</div>
                                            <div className="font-bold text-zinc-900">{formData.specialization}</div>
                                        </div>
                                    )}
                                    {formData.license && (
                                        <div>
                                            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">License</div>
                                            <div className="font-bold text-zinc-900 font-mono text-xs">{formData.license}</div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </>
            ) : (
                /* JOURNEY MODE - STEP BY STEP */
                <>
                    {/* HEADER & PROGRESS */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Complete Your <span className="text-teal-600">Health Journey</span></h1>
                                <p className="text-zinc-500 font-medium mt-1">Capture your full profile to unlock premium healthcare features.</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-teal-600">{calculateCompletion()}%</div>
                                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Profile Completion</div>
                            </div>
                        </div>
                        <Progress value={calculateCompletion()} className="h-3 rounded-full bg-zinc-100" />
                    </div>

                    {/* STEP INDICATORS */}
                    <div className="flex justify-between overflow-x-auto pb-4 gap-4 no-scrollbar">
                        {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                            <div
                                key={s}
                                className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all shrink-0 ${step === s ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg' :
                                    completedSteps.includes(s) ? 'bg-teal-50 border-teal-200 text-teal-700' :
                                        'bg-white border-zinc-100 text-zinc-400'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step === s ? 'bg-white text-zinc-900' :
                                    completedSteps.includes(s) ? 'bg-teal-500 text-white' :
                                        'bg-zinc-100 text-zinc-400'
                                    }`}>
                                    {completedSteps.includes(s) ? <CheckCircle2 className="h-4 w-4" /> : s}
                                </div>
                                <span className="text-xs font-bold whitespace-nowrap">
                                    {s === 1 ? 'Personal' : s === 2 ? 'Medical' : s === 3 ? 'Lifestyle' : s === 4 ? 'Professional' : s === 5 ? 'Preferences' : s === 6 ? 'Photo' : 'Review'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* STEP CONTENT */}
                    <Card className="rounded-[2.5rem] border-zinc-200 shadow-xl shadow-zinc-200/50 overflow-hidden">
                        <CardHeader className="p-8 bg-zinc-50 border-b border-zinc-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-2xl shadow-sm border border-zinc-100">
                                    {step === 1 && <User className="h-6 w-6 text-teal-600" />}
                                    {step === 2 && <ShieldPlus className="h-6 w-6 text-red-600" />}
                                    {step === 3 && <Activity className="h-6 w-6 text-amber-600" />}
                                    {step === 4 && <Briefcase className="h-6 w-6 text-blue-600" />}
                                    {step === 5 && <Settings className="h-6 w-6 text-purple-600" />}
                                    {step === 6 && <Camera className="h-6 w-6 text-zinc-600" />}
                                    {step === 7 && <Sparkles className="h-6 w-6 text-yellow-600" />}
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-black">
                                        {step === 1 && "Identity & Personal Details"}
                                        {step === 2 && "Detailed Medical History"}
                                        {step === 3 && "Lifestyle & Daily Habits"}
                                        {step === 4 && "Professional Credentials"}
                                        {step === 5 && "Application Preferences"}
                                        {step === 6 && "Profile Photography"}
                                        {step === 7 && "Final Review & Karma Calculation"}
                                    </CardTitle>
                                    <CardDescription className="font-medium text-zinc-500">
                                        {step === 1 && "Start with the basics of who you are."}
                                        {step === 2 && "Critical information for clinical accuracy."}
                                        {step === 3 && "Habits that shape your overall health profile."}
                                        {step === 4 && "Certifications and workplace logistics."}
                                        {step === 5 && "Customize your digital experience."}
                                        {step === 6 && "A formal identity for your health passport."}
                                        {step === 7 && "Verify everything and claim your rewards."}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-10">
                            {step === 1 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Basic Information</h3>
                                        <div className="space-y-2">
                                            <Label>First Name</Label>
                                            <Input value={formData.firstName} onChange={(e) => updateField('firstName', e.target.value)} placeholder="John" className="rounded-xl h-12" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Last Name</Label>
                                            <Input value={formData.lastName} onChange={(e) => updateField('lastName', e.target.value)} placeholder="Doe" className="rounded-xl h-12" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Date of Birth</Label>
                                                <Input type="date" value={formData.dob} onChange={(e) => updateField('dob', e.target.value)} className="rounded-xl h-12" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Gender</Label>
                                                <Select value={formData.gender} onValueChange={(v) => updateField('gender', v)}>
                                                    <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                                                    <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Demographics & Vitals</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Nationality</Label>
                                                <Input value={formData.nationality} onChange={(e) => updateField('nationality', e.target.value)} placeholder="Indian" className="rounded-xl h-12" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Marital Status</Label>
                                                <Select value={formData.maritalStatus} onValueChange={(v) => updateField('maritalStatus', v)}>
                                                    <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="single">Single</SelectItem>
                                                        <SelectItem value="married">Married</SelectItem>
                                                        <SelectItem value="divorced">Divorced</SelectItem>
                                                        <SelectItem value="widowed">Widowed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Blood Group</Label>
                                                <Select value={formData.bloodGroup} onValueChange={(v) => updateField('bloodGroup', v)}>
                                                    <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="B+" /></SelectTrigger>
                                                    <SelectContent>
                                                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Emergency Phone</Label>
                                                <Input value={formData.emergencyPhone} onChange={(e) => updateField('emergencyPhone', e.target.value)} placeholder="+91..." className="rounded-xl h-12" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Height (cm)</Label>
                                                <Input type="number" value={formData.height} onChange={(e) => updateField('height', e.target.value)} placeholder="175" className="rounded-xl h-12" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Weight (kg)</Label>
                                                <Input type="number" value={formData.weight} onChange={(e) => updateField('weight', e.target.value)} placeholder="70" className="rounded-xl h-12" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Clinical Background</h3>
                                            <div className="space-y-2">
                                                <Label>Allergies</Label>
                                                <Input value={formData.allergies} onChange={(e) => updateField('allergies', e.target.value)} placeholder="Peanuts, Penicillin..." className="rounded-xl h-12" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Current Medications</Label>
                                                <Input value={formData.currentMeds} onChange={(e) => updateField('currentMeds', e.target.value)} placeholder="Metformin 500mg..." className="rounded-xl h-12" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Past Records</h3>
                                            <div className="space-y-2">
                                                <Label>Previous Injuries</Label>
                                                <Input value={formData.injuries} onChange={(e) => updateField('injuries', e.target.value)} placeholder="Knee fracture 2018" className="rounded-xl h-12" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Major Surgeries</Label>
                                                <Input value={formData.surgeries} onChange={(e) => updateField('surgeries', e.target.value)} placeholder="Appendix removal..." className="rounded-xl h-12" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-teal-50 rounded-3xl border border-teal-100 flex items-center gap-6">
                                        <Info className="h-10 w-10 text-teal-600 shrink-0" />
                                        <div className="space-y-2 flex-1">
                                            <h4 className="font-bold text-teal-900">Health Insurance Details</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input value={formData.insuranceProvider} onChange={(e) => updateField('insuranceProvider', e.target.value)} placeholder="Insurance Provider" className="bg-white rounded-xl h-10" />
                                                <Input value={formData.insurancePolicy} onChange={(e) => updateField('insurancePolicy', e.target.value)} placeholder="Policy Number" className="bg-white rounded-xl h-10" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Daily Routine</h3>
                                        <div className="space-y-2">
                                            <Label>Smoking Habits</Label>
                                            <Select value={formData.smoking} onValueChange={(v) => updateField('smoking', v)}>
                                                <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="never">Never</SelectItem>
                                                    <SelectItem value="former">Former Smoker</SelectItem>
                                                    <SelectItem value="occasional">Occasional</SelectItem>
                                                    <SelectItem value="regular">Regular</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Alcohol Consumption</Label>
                                            <Select value={formData.alcohol} onValueChange={(v) => updateField('alcohol', v)}>
                                                <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    <SelectItem value="social">Social</SelectItem>
                                                    <SelectItem value="regular">Regular</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Social Profile</h3>
                                        <div className="space-y-2">
                                            <Label>Physical Activity Level</Label>
                                            <Select value={formData.activityLevel} onValueChange={(v) => updateField('activityLevel', v)}>
                                                <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="sedentary">Sedentary (Low)</SelectItem>
                                                    <SelectItem value="active">Active (High)</SelectItem>
                                                    <SelectItem value="moderate">Moderate</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Nutrition Preferences</Label>
                                            <Select value={formData.nutrition} onValueChange={(v) => updateField('nutrition', v)}>
                                                <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="veg">Vegetarian</SelectItem>
                                                    <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                                                    <SelectItem value="vegan">Vegan</SelectItem>
                                                    <SelectItem value="mixed">Mixed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Occupation</Label>
                                            <Input value={formData.occupation} onChange={(e) => updateField('occupation', e.target.value)} placeholder="Software Engineer" className="rounded-xl h-12" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-8">
                                    {!isDoctor && (
                                        <div className="p-8 bg-zinc-100 rounded-[2rem] text-center border-2 border-dashed border-zinc-200">
                                            <AlertTriangle className="h-10 w-10 text-zinc-400 mx-auto mb-2" />
                                            <p className="font-bold text-zinc-500">Professional credentials are only required for Healthcare Providers.</p>
                                            <Button variant="link" onClick={skipStep} className="mt-2 text-teal-600 font-bold">Skip this step</Button>
                                        </div>
                                    )}
                                    {isDoctor && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Credentials</h3>
                                                <div className="space-y-2">
                                                    <Label>Professional Title</Label>
                                                    <Input value={formData.title} onChange={(e) => updateField('title', e.target.value)} placeholder="Surgeon, Physician..." className="rounded-xl h-12" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Specialization</Label>
                                                        <Input value={formData.specialization} onChange={(e) => updateField('specialization', e.target.value)} placeholder="Cardiology" className="rounded-xl h-12" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Department</Label>
                                                        <Input value={formData.department} onChange={(e) => updateField('department', e.target.value)} placeholder="Outpatient" className="rounded-xl h-12" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Medical License Number</Label>
                                                    <Input value={formData.license} onChange={(e) => updateField('license', e.target.value)} placeholder="MED-12345-IN" className="rounded-xl h-12" />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Practice Details</h3>
                                                <div className="space-y-2">
                                                    <Label>Hospital Name / Workplace</Label>
                                                    <Input value={formData.hospitalName} onChange={(e) => updateField('hospitalName', e.target.value)} placeholder="MedSense General..." className="rounded-xl h-12" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Preferred Consultation Time</Label>
                                                    <Input value={formData.preferredTime} onChange={(e) => updateField('preferredTime', e.target.value)} placeholder="9:00 AM - 5:00 PM" className="rounded-xl h-12" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Consultation Fees (₹)</Label>
                                                    <Input type="number" value={formData.consultationFees} onChange={(e) => updateField('consultationFees', e.target.value)} placeholder="1000" className="rounded-xl h-12" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 5 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <Globe className="h-6 w-6 text-zinc-400" />
                                            <div className="flex-1 space-y-2">
                                                <Label>Default Language</Label>
                                                <Select value={formData.language} onValueChange={(v) => updateField('language', v)}>
                                                    <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="English">English</SelectItem>
                                                        <SelectItem value="Hindi">Hindi (हिन्दी)</SelectItem>
                                                        <SelectItem value="Spanish">Spanish (Español)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <Bell className="h-6 w-6 text-zinc-400" />
                                            <div className="flex-1 space-y-2">
                                                <Label>Contact Preference</Label>
                                                <Select value={formData.commMethod} onValueChange={(v) => updateField('commMethod', v)}>
                                                    <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Email">Email Only</SelectItem>
                                                        <SelectItem value="SMS">SMS Notifications</SelectItem>
                                                        <SelectItem value="App Notification">In-App Alerts</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 6 && (
                                <div className="flex flex-col items-center justify-center space-y-8 py-10">
                                    <div className="relative group">
                                        <div className="w-56 h-56 rounded-full bg-zinc-100 border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden transition-all group-hover:scale-105">
                                            <Camera className="h-16 w-16 text-zinc-300" />
                                        </div>
                                        <button className="absolute bottom-4 right-4 p-4 bg-teal-600 text-white rounded-full shadow-lg hover:bg-teal-700 transition-colors">
                                            <Camera className="h-6 w-6" />
                                        </button>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <p className="font-black text-zinc-900">Upload a Professional Headshot</p>
                                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Max size 5MB • JPG or PNG</p>
                                    </div>
                                </div>
                            )}

                            {step === 7 && (
                                <div className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="p-8 bg-zinc-900 text-white rounded-[2rem] space-y-6 shadow-2xl shadow-zinc-900/40 relative overflow-hidden">
                                            <div className="absolute -right-10 -bottom-10 opacity-10">
                                                <Zap className="h-40 w-40" />
                                            </div>
                                            <h3 className="text-xl font-black flex items-center gap-3">
                                                <Zap className="h-6 w-6 text-yellow-500 fill-yellow-500" /> Karma Potential
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                                                    <span className="text-zinc-400 font-medium">Completion Multiplier</span>
                                                    <span className="font-bold text-teal-400">x5.0</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                                                    <span className="text-zinc-400 font-medium">Steps Captured</span>
                                                    <span className="font-bold">{completedSteps.length} / 7</span>
                                                </div>
                                                <div className="pt-4 border-t border-white/10">
                                                    <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">Estimated Karma Bonus</div>
                                                    <div className="text-5xl font-black text-white">
                                                        {calculateCompletion() === 100 ? 500 : Math.round(calculateCompletion() * 5)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h3 className="font-black text-zinc-900 uppercase tracking-[0.2em] text-xs">Journey Summary</h3>
                                            <div className="space-y-4">
                                                {[1, 2, 3, 4, 5, 6].map(i => (
                                                    <div key={i} className="flex items-center gap-4">
                                                        {completedSteps.includes(i) ? (
                                                            <CheckCircle2 className="h-5 w-5 text-teal-500" />
                                                        ) : (
                                                            <div className="h-5 w-5 rounded-full border-2 border-zinc-200" />
                                                        )}
                                                        <span className={`text-sm font-bold ${completedSteps.includes(i) ? 'text-zinc-900' : 'text-zinc-400'}`}>
                                                            {i === 1 && "Personal Identity Linked"}
                                                            {i === 2 && "Clinical History Mapped"}
                                                            {i === 3 && "Lifestyle Profile Analyzed"}
                                                            {i === 4 && "Work Credentials Verified"}
                                                            {i === 5 && "App Preferences Saved"}
                                                            {i === 6 && "Identity Photo Uploaded"}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {calculateCompletion() < 100 && (
                                        <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-center gap-4">
                                            <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
                                            <p className="text-sm text-amber-800 font-medium leading-relaxed">
                                                You haven't completed some steps. You can still finish the journey, but completing all steps grants a <strong>Max Karma Bonus of 500</strong>.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="p-8 bg-zinc-50 border-t border-zinc-100 flex justify-between gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => setStep(prev => Math.max(1, prev - 1))}
                                disabled={step === 1}
                                className="rounded-xl h-12 px-6 font-bold text-zinc-500 hover:bg-zinc-100 transition-all"
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                            </Button>

                            <div className="flex gap-3">
                                {step < totalSteps ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={skipStep}
                                            className="rounded-xl h-12 px-6 font-bold border-zinc-200 text-zinc-500 hover:bg-white transition-all shadow-sm"
                                        >
                                            Skip Step
                                        </Button>
                                        <Button
                                            onClick={saveProgress}
                                            className="rounded-xl h-12 px-10 font-bold bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-lg shadow-teal-100"
                                        >
                                            Save & Continue <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={handleComplete}
                                        className="rounded-xl h-12 px-10 font-black uppercase tracking-widest bg-zinc-900 hover:bg-zinc-800 text-white transition-all shadow-xl shadow-zinc-200"
                                    >
                                        Complete Journey <Sparkles className="ml-2 h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardFooter>
                    </Card>

                    <div className="text-center">
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Powered by Unified EHR Intelligence • Secure Health Cloud</p>
                    </div>
                </>
            )}
        </div>
    );
}
