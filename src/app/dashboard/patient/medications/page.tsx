"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Pill,
    ShoppingCart,
    Clock,
    Wallet,
    Plus,
    Volume2,
    Trash2,
    CheckCircle2,
    Trash,
    ArrowRight,
    MapPin,
    Star,
    Zap,
    ShieldCheck,
    Languages,
    Phone
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useMetaMask } from "@/hooks/use-metamask";

// --- TYPES ---
interface Medicine {
    id: string;
    name: string;
    price: number;
    category: string;
    requiresPrescription: boolean;
    dosage: string;
    packSize: string;
    image: string;
}

interface Reminder {
    id: string;
    medicineName: string;
    time: string; // "HH:MM"
    dosage: string;
    enabled: boolean;
}

interface CartItem {
    medicine: Medicine;
    quantityType: 'half' | 'full' | 'double';
}

interface Order {
    id: string;
    items: CartItem[];
    total: number;
    status: 'pending' | 'collected' | 'cancelled';
    date: string;
    isUnlocked?: boolean;
    requestedCall?: boolean;
}

const SUPPORTED_LANGUAGES = [
    { code: 'en-US', name: 'English', msg: 'Time to take your medication: ' },
    { code: 'hi-IN', name: 'Hindi', msg: 'आपकी दवा लेने का समय हो गया है: ' },
    { code: 'es-ES', name: 'Spanish', msg: 'Es hora de tomar su medicamento: ' },
    { code: 'fr-FR', name: 'French', msg: 'Il est temps de prendre vos médicaments : ' },
];

const MOCK_MEDICINES: Medicine[] = [
    { id: '1', name: 'Amoxicillin', price: 120, category: 'Antibiotic', requiresPrescription: true, dosage: '500mg', packSize: '10 Capsules', image: '💊' },
    { id: '2', name: 'Paracetamol', price: 45, category: 'Pain Relief', requiresPrescription: false, dosage: '650mg', packSize: '15 Tablets', image: '🌡️' },
    { id: '3', name: 'Metformin', price: 85, category: 'Diabetes', requiresPrescription: true, dosage: '500mg', packSize: '30 Tablets', image: '🍬' },
    { id: '4', name: 'Atorvastatin', price: 150, category: 'Cholesterol', requiresPrescription: true, dosage: '10mg', packSize: '10 Tablets', image: '❤️' },
    { id: '5', name: 'Cetirizine', price: 30, category: 'Allergy', requiresPrescription: false, dosage: '10mg', packSize: '10 Tablets', image: '🤧' },
    { id: '6', name: 'Vitamin D3', price: 200, category: 'Supplements', requiresPrescription: false, dosage: '60K IU', packSize: '4 Capsules', image: '☀️' },
];

const MOCK_PHARMACIES = [
    { id: '1', name: 'Apollo Pharmacy', address: 'Block A, Sector 62, Noida', rating: 4.8, distance: '1.2 km', open: true },
    { id: '2', name: 'Guardian LifeCare', address: 'Market Square, Indirapuram', rating: 4.5, distance: '2.5 km', open: true },
    { id: '3', name: 'Wellness Forever', address: 'Cyber City, Gurgaon', rating: 4.9, distance: '0.5 km', open: true },
];

export default function MedicationsPage() {
    const { account, balance, lockedAmount, connectWallet, lockAmount, refundAmount } = useMetaMask();

    // --- STATE ---
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [selectedLang, setSelectedLang] = useState(SUPPORTED_LANGUAGES[0]);
    const [activeTab, setActiveTab] = useState("list");
    const [requestCall, setRequestCall] = useState(false);

    // Reminder Modal State
    const [newReminder, setNewReminder] = useState({ medicineName: '', time: '08:00', dosage: '1 Tablet' });
    const [isReminderOpen, setIsReminderOpen] = useState(false);

    // --- LOAD PERSISTENCE ---
    useEffect(() => {
        const savedCart = localStorage.getItem('med_cart');
        const savedOrders = localStorage.getItem('med_orders');
        const savedReminders = localStorage.getItem('med_reminders');
        const savedLang = localStorage.getItem('med_lang');

        if (savedCart) setCart(JSON.parse(savedCart));
        if (savedOrders) setOrders(JSON.parse(savedOrders));
        if (savedReminders) setReminders(JSON.parse(savedReminders));
        if (savedLang) {
            const found = SUPPORTED_LANGUAGES.find(l => l.code === savedLang);
            if (found) setSelectedLang(found);
        }
    }, []);

    // --- SAVE PERSISTENCE ---
    useEffect(() => {
        localStorage.setItem('med_cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem('med_orders', JSON.stringify(orders));
    }, [orders]);

    useEffect(() => {
        localStorage.setItem('med_reminders', JSON.stringify(reminders));
    }, [reminders]);

    useEffect(() => {
        localStorage.setItem('med_lang', selectedLang.code);
    }, [selectedLang]);

    // --- VOICE REMINDER LOGIC ---
    const triggerAlarm = useCallback((reminder: Reminder) => {
        // 1. Audio Chime
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // High A
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);

        // 2. Voice Synthesis
        setTimeout(() => {
            const speech = new SpeechSynthesisUtterance();
            speech.text = selectedLang.msg + reminder.medicineName + ". Dosage: " + reminder.dosage;
            speech.lang = selectedLang.code;
            speech.rate = 0.9;
            window.speechSynthesis.speak(speech);

            toast.info(`MEDICATION REMINDER`, {
                description: `Time to take ${reminder.medicineName} (${reminder.dosage})`,
                icon: <Volume2 className="h-4 w-4" />,
            });
        }, 600);
    }, [selectedLang]);

    // --- TICKER LOOP ---
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            reminders.forEach(r => {
                if (r.enabled && r.time === currentTime && now.getSeconds() === 0) {
                    triggerAlarm(r);
                }
            });
        }, 1000); // Check every second for precision
        return () => clearInterval(interval);
    }, [reminders, triggerAlarm]);

    // --- ACTIONS ---
    const addToCart = (medicine: Medicine, quantityType: CartItem['quantityType']) => {
        setCart(prev => [...prev, { medicine, quantityType }]);
        toast.success(`Added to cart`, {
            description: `${medicine.name} (${quantityType} sheet)`
        });
    };

    const removeFromCart = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const calculateDetailedTotal = () => {
        const subtotal = cart.reduce((total, item) => {
            let multiplier = 1;
            if (item.quantityType === 'half') multiplier = 0.5;
            if (item.quantityType === 'double') multiplier = 2;
            return total + (item.medicine.price * multiplier);
        }, 0);
        const fee = subtotal * 0.05;
        return { subtotal, fee, total: subtotal + fee };
    };

    const placeOrder = () => {
        if (!account) {
            toast.error("Wallet not connected", { description: "Please connect your MetaMask to place orders with bond security." });
            return;
        }

        const { total } = calculateDetailedTotal();
        const bondAmount = 100; // Deducted from wallet

        lockAmount(bondAmount);

        const newOrder: Order = {
            id: Math.random().toString(36).substring(7).toUpperCase(),
            items: [...cart],
            total: Number(total.toFixed(2)),
            status: 'pending',
            date: new Date().toISOString(),
            requestedCall: requestCall
        };

        setOrders(prev => [newOrder, ...prev]);
        setCart([]);
        setRequestCall(false);
        toast.success("Order Placed Successfully", {
            description: requestCall
                ? `Security deposit of ₹${bondAmount} locked. Pharmacist will call you shortly.`
                : `Security deposit of ₹${bondAmount} locked in bond.`
        });
        setActiveTab("orders");
    };

    const confirmPayment = (orderId: string) => {
        setOrders(prev => prev.map(o => {
            if (o.id === orderId) {
                refundAmount(100);
                return { ...o, status: 'collected' };
            }
            return o;
        }));
        toast.success("Payment Confirmed", { description: "Pharmacist has confirmed receipt. ₹100 bond has been refunded to your wallet." });
    };

    const addReminder = () => {
        if (!newReminder.medicineName) return;
        const reminder: Reminder = {
            id: Date.now().toString(),
            medicineName: newReminder.medicineName,
            time: newReminder.time,
            dosage: newReminder.dosage,
            enabled: true
        };
        setReminders(prev => [...prev, reminder]);
        setIsReminderOpen(false);
        toast.success("Reminder Set", { description: `You will be alerted at ${newReminder.time}` });
    };

    const deleteReminder = (id: string) => {
        setReminders(prev => prev.filter(r => r.id !== id));
    };

    const toggleReminder = (id: string) => {
        setReminders(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-1 sm:p-2 lg:p-4">
            {/* Header with Wallet */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Pill className="w-32 h-32 rotate-12" />
                </div>

                <div className="relative">
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
                        Medications & <span className="text-teal-600">Health Shop</span>
                    </h1>
                    <p className="text-zinc-500 font-medium mt-1">Smart reminders, blockchain security, and instant delivery.</p>
                </div>

                <div className="flex items-center gap-3 relative">
                    {!account ? (
                        <Button
                            onClick={connectWallet}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 h-12 shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105"
                        >
                            <Wallet className="mr-2 h-5 w-5" />
                            Connect MetaMask
                        </Button>
                    ) : (
                        <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
                                <Wallet className="h-5 w-5" />
                            </div>
                            <div className="text-sm pr-4">
                                <p className="font-bold text-zinc-900 dark:text-white">₹{balance}</p>
                                <p className="text-[10px] text-zinc-500 font-mono truncate w-24">{account}</p>
                            </div>
                            {lockedAmount > 0 && (
                                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 py-1">
                                    ₹{lockedAmount} Bonded
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <TabsList className="bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl h-auto flex-wrap">
                        <TabsTrigger value="list" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm">Medicines</TabsTrigger>
                        <TabsTrigger value="pharmacies" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm">Pharmacies</TabsTrigger>
                        <TabsTrigger value="timings" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm">Voice Reminders</TabsTrigger>
                        <TabsTrigger value="orders" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm">Order History</TabsTrigger>
                    </TabsList>

                    {cart.length > 0 && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-6 h-12 shadow-lg shadow-teal-100 relative group overflow-hidden transition-all hover:scale-105">
                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    <ShoppingCart className="mr-2 h-5 w-5" />
                                    Cart ({cart.length})
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] rounded-3xl">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold">Your Checkout</DialogTitle>
                                    <DialogDescription>Review your items and security bond deposit.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 my-4 max-h-[40vh] overflow-y-auto pr-2">
                                    {cart.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                            <div>
                                                <p className="font-bold text-zinc-900 dark:text-white capitalize">{item.medicine.name}</p>
                                                <p className="text-xs text-zinc-500">{item.quantityType} sheet • ₹{item.medicine.price}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-teal-600">₹{item.quantityType === 'half' ? item.medicine.price * 0.5 : item.quantityType === 'double' ? item.medicine.price * 2 : item.medicine.price}</span>
                                                <Button variant="ghost" size="icon" onClick={() => removeFromCart(idx)} className="h-8 w-8 text-zinc-400 hover:text-red-500 rounded-full">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center space-x-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 mb-2">
                                    <Checkbox
                                        id="requestCall"
                                        checked={requestCall}
                                        onCheckedChange={(checked) => setRequestCall(checked as boolean)}
                                        className="h-5 w-5 rounded-md border-zinc-300 text-teal-600 focus:ring-teal-500"
                                    />
                                    <Label
                                        htmlFor="requestCall"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-zinc-700 dark:text-zinc-300"
                                    >
                                        I want the pharmacist to call me before confirming my order
                                    </Label>
                                </div>
                                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl space-y-2 mb-2">
                                    <div className="flex justify-between text-sm text-zinc-500">
                                        <span>Medicines Subtotal</span>
                                        <span>₹{calculateDetailedTotal().subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-zinc-500">
                                        <span>Platform Fee (5%)</span>
                                        <span>₹{calculateDetailedTotal().fee.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-black pt-2 border-t border-zinc-200 dark:border-zinc-700">
                                        <span>Order Total</span>
                                        <span className="text-teal-600">₹{calculateDetailedTotal().total.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl flex justify-between items-center text-sm mb-4">
                                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                        <Wallet className="h-4 w-4" />
                                        <span className="font-bold">Security Bond</span>
                                    </div>
                                    <span className="font-black text-amber-700 dark:text-amber-400">- ₹100.00 (From Wallet)</span>
                                </div>
                                <DialogFooter className="mt-2">
                                    <Button onClick={placeOrder} className="w-full bg-teal-600 hover:bg-teal-700 h-12 rounded-xl text-lg font-bold">
                                        Place Order with Bond
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <TabsContent value="list" className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {MOCK_MEDICINES.map((med) => (
                            <Card key={med.id} className="rounded-3xl border-zinc-200 dark:border-zinc-800 hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-300 group hover:-translate-y-2 bg-white dark:bg-zinc-900">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="text-4xl p-2 bg-zinc-100 dark:bg-zinc-800 rounded-2xl group-hover:scale-110 transition-transform">{med.image}</div>
                                        <div className="flex flex-col items-end gap-1">
                                            <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg">{med.category}</Badge>
                                            {med.requiresPrescription && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg">Rx Required</Badge>}
                                        </div>
                                    </div>
                                    <CardTitle className="text-2xl font-bold mt-4 text-zinc-900 dark:text-white">{med.name}</CardTitle>
                                    <CardDescription className="font-semibold text-teal-600">{med.dosage} • {med.packSize}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-zinc-900 dark:text-white">₹{med.price}</span>
                                        <span className="text-zinc-500 text-sm">/ Full Sheet</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex gap-2 p-4 pt-0">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="flex-1 rounded-xl h-12 border-zinc-200 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 transition-colors">Buy</Button>
                                        </DialogTrigger>
                                        <DialogContent className="rounded-3xl">
                                            <DialogHeader>
                                                <DialogTitle>Select Quantity for {med.name}</DialogTitle>
                                                <DialogDescription>Flexible purchasing for patient convenience.</DialogDescription>
                                            </DialogHeader>
                                            <div className="grid grid-cols-3 gap-4 my-4">
                                                {(['half', 'full', 'double'] as const).map((type) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => {
                                                            addToCart(med, type);
                                                        }}
                                                        className="p-4 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-teal-500 transition-all text-center space-y-1 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                                                    >
                                                        <p className="font-bold capitalize text-zinc-900 dark:text-white">{type}</p>
                                                        <p className="text-xs text-teal-600 font-bold">₹{type === 'half' ? med.price * 0.5 : type === 'double' ? med.price * 2 : med.price}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                    <Button
                                        variant="ghost"
                                        className="h-12 w-12 rounded-xl border border-zinc-200 p-0 text-zinc-400 hover:text-teal-600 hover:bg-teal-50"
                                        onClick={() => {
                                            setNewReminder(prev => ({ ...prev, medicineName: med.name }));
                                            setActiveTab("timings");
                                            setIsReminderOpen(true);
                                        }}
                                    >
                                        <Clock className="h-5 w-5" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="pharmacies" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {MOCK_PHARMACIES.map(pharmacy => (
                            <Card key={pharmacy.id} className="rounded-3xl bg-white dark:bg-zinc-900 overflow-hidden group">
                                <div className="h-2 bg-gradient-to-r from-teal-500 to-indigo-500"></div>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl font-bold">{pharmacy.name}</CardTitle>
                                            <p className="text-sm text-zinc-500 flex items-center gap-1 mt-1">
                                                <MapPin className="h-3 w-3" /> {pharmacy.address}
                                            </p>
                                        </div>
                                        <div className="p-2 rounded-xl bg-teal-50 text-teal-600 flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-teal-600" />
                                            <span className="text-xs font-bold">{pharmacy.rating}</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl">
                                        <Badge variant="outline" className="bg-white border-zinc-200 text-teal-600">{pharmacy.distance}</Badge>
                                        <span className="text-xs font-bold text-green-500">● Open Now</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="gap-2">
                                    <Button variant="outline" className="flex-1 rounded-xl border-zinc-200 h-11" asChild>
                                        <a href="tel:+918800123456">
                                            <Phone className="h-4 w-4 mr-2" /> Call
                                        </a>
                                    </Button>
                                    <Button className="flex-[2] rounded-xl bg-zinc-900 dark:bg-white dark:text-zinc-900 group-hover:bg-teal-600 group-hover:text-white transition-all h-11">
                                        View Directions <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="timings" className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <Volume2 className="h-6 w-6 text-indigo-600" />
                                    Multi-language Reminders
                                </h2>
                                <p className="text-zinc-500">Set voice alarms for your medication in your preferred language.</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl">
                                    <Languages className="ml-2 h-4 w-4 text-zinc-500" />
                                    <Select value={selectedLang.code} onValueChange={(val) => {
                                        const l = SUPPORTED_LANGUAGES.find(x => x.code === val);
                                        if (l) setSelectedLang(l);
                                    }}>
                                        <SelectTrigger className="w-[140px] border-none bg-transparent focus:ring-0 h-9 font-medium">
                                            <SelectValue placeholder="Language" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            {SUPPORTED_LANGUAGES.map(l => (
                                                <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Dialog open={isReminderOpen} onOpenChange={setIsReminderOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 h-12 shadow-lg shadow-indigo-100 transition-all hover:scale-105">
                                            <Plus className="mr-2 h-5 w-5" />
                                            Add Alert
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="rounded-3xl">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-bold">New Medication Alert</DialogTitle>
                                            <DialogDescription>We will use voice synthesis to remind you at exactly this time.</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-6 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="medName" className="font-bold text-zinc-700">Medicine Name</Label>
                                                <Input
                                                    id="medName"
                                                    placeholder="e.g. Paracetamol"
                                                    value={newReminder.medicineName}
                                                    onChange={(e) => setNewReminder({ ...newReminder, medicineName: e.target.value })}
                                                    className="rounded-xl h-12 border-zinc-200 focus:ring-teal-500"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="time" className="font-bold text-zinc-700">Reminder Time</Label>
                                                    <Input
                                                        id="time"
                                                        type="time"
                                                        value={newReminder.time}
                                                        onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                                                        className="rounded-xl h-12 border-zinc-200"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="dosage" className="font-bold text-zinc-700">Dosage</Label>
                                                    <Input
                                                        id="dosage"
                                                        placeholder="e.g. 1 Tablet"
                                                        value={newReminder.dosage}
                                                        onChange={(e) => setNewReminder({ ...newReminder, dosage: e.target.value })}
                                                        className="rounded-xl h-12 border-zinc-200"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={addReminder} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl font-bold">Save Reminder</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {reminders.length === 0 ? (
                                <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-800/30 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                                    <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                        <Clock className="w-8 h-8 text-zinc-300" />
                                    </div>
                                    <p className="text-zinc-500 font-medium">No reminders active. Add one to stay healthy!</p>
                                </div>
                            ) : (
                                reminders.map((r) => (
                                    <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 group hover:border-indigo-400 hover:bg-white dark:hover:bg-zinc-800 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="h-16 w-16 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-zinc-100 dark:border-zinc-700 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                {r.time}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-zinc-900 dark:text-white">{r.medicineName}</h3>
                                                <p className="text-zinc-500 font-medium">{r.dosage}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                            <div className="flex items-center gap-2 pr-4 border-r border-zinc-200">
                                                <Label htmlFor={`rem-${r.id}`} className="text-xs font-bold text-zinc-500">{r.enabled ? 'ENABLED' : 'MUTED'}</Label>
                                                <Switch
                                                    id={`rem-${r.id}`}
                                                    checked={r.enabled}
                                                    onCheckedChange={() => toggleReminder(r.id)}
                                                    className="data-[state=checked]:bg-indigo-600"
                                                />
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => triggerAlarm(r)} className="h-10 w-10 text-indigo-600 hover:bg-indigo-50 rounded-xl">
                                                <Volume2 className="h-5 w-5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => deleteReminder(r.id)} className="h-10 w-10 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl">
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="orders" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="rounded-3xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                            <CardHeader>
                                <CardTitle className="text-2xl font-extrabold flex items-center gap-2">
                                    <Zap className="h-6 w-6 text-amber-500" /> Web3 Security Bonds
                                </CardTitle>
                                <CardDescription>How our blockchain deposit system protects your orders.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl space-y-3">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center shrink-0">
                                            <ShieldCheck className="h-5 w-5 text-teal-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-zinc-900 dark:text-white">The Bond Lock</h4>
                                            <p className="text-sm text-zinc-500">Every order locks ₹100 from your wallet. This ensures the pharmacy prepares your bespoke medicine.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-zinc-900 dark:text-white">Smart Verification</h4>
                                            <p className="text-sm text-zinc-500">When you collect the medicine, the smart contract automatically releases the refund to your address.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <h3 className="text-lg font-black text-zinc-900 dark:text-white pl-4">Past Transactions</h3>
                            {orders.length === 0 ? (
                                <div className="text-center py-20 bg-zinc-100 dark:bg-zinc-800/20 rounded-3xl border-zinc-200 dark:border-zinc-800">
                                    <ShoppingCart className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
                                    <p className="text-zinc-500 font-medium">No order history found.</p>
                                </div>
                            ) : (
                                orders.map((order) => (
                                    <div key={order.id} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-zinc-400">ORDER #{order.id}</span>
                                                    <Badge variant={order.status === 'collected' ? 'secondary' : 'default'} className={order.status === 'collected' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                                                        {order.status.toUpperCase()}
                                                    </Badge>
                                                    {order.requestedCall && (
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 py-0.5">
                                                            <Phone className="h-3 w-3" /> Call Requested
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-zinc-500 mt-1">{new Date(order.date).toLocaleDateString()}</p>
                                            </div>
                                            <p className="text-xl font-black text-zinc-900 dark:text-white">₹{order.total}</p>
                                        </div>
                                        <div className="space-y-2 mb-4">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="text-sm text-zinc-600 flex justify-between">
                                                    <span>{item.medicine.name} ({item.quantityType})</span>
                                                    <span className="font-bold">₹{item.quantityType === 'half' ? item.medicine.price * 0.5 : item.quantityType === 'double' ? item.medicine.price * 2 : item.medicine.price}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {order.status === 'pending' && (
                                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800 flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                                    <span className="text-xs font-bold text-amber-700">Awaiting Pharmacist Confirmation</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs >
        </div >
    );
}
