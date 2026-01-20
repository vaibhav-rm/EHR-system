"use client";

import React, { useState, useEffect } from "react";
import {
    Wallet,
    CreditCard,
    History,
    ArrowUpRight,
    ArrowDownLeft,
    ShieldCheck,
    Clock,
    BadgeCent,
    Receipt,
    ExternalLink
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMetaMask } from "@/hooks/use-metamask";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CartItem {
    name: string;
    price: number;
    quantity: number;
}

interface Order {
    id: string;
    items: CartItem[];
    total: number;
    status: 'pending' | 'processing' | 'collected' | 'cancelled';
    date: string;
    requestedCall?: boolean;
}

export default function PatientBillingPage() {
    const { account, balance, lockedAmount, connectWallet } = useMetaMask();
    const [orders, setOrders] = useState<Order[]>([]);
    const [calculatedLocked, setCalculatedLocked] = useState(0);

    useEffect(() => {
        const savedOrders = localStorage.getItem('medsense_orders');
        if (savedOrders) {
            const parsed = JSON.parse(savedOrders);
            setOrders(parsed);

            // Calculate locked bonds: 100 per active (not collected) order
            const activeBonds = parsed.filter((o: Order) => o.status !== 'collected').length * 100;
            setCalculatedLocked(activeBonds);
        }
    }, []);

    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 tracking-tight leading-none mb-3">Billing & Wallet</h1>
                    <p className="text-zinc-500 font-medium">Manage your smart contract bonds and transaction history.</p>
                </div>
                {!account && (
                    <Button onClick={connectWallet} className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl px-6 h-12 font-bold shadow-lg shadow-zinc-100 transition-all active:scale-95">
                        Connect MetaMask
                    </Button>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* WALLET CARD */}
                <Card className="md:col-span-2 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white border-0 shadow-2xl relative overflow-hidden group rounded-[2rem]">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <Wallet className="h-40 w-40" />
                    </div>
                    <CardHeader className="p-8 pb-0">
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center gap-3 text-zinc-400 uppercase tracking-[0.2em] text-xs font-black">
                                Connected Wallet
                            </CardTitle>
                            <Badge className="bg-teal-500/20 text-teal-400 border-none px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                                {account ? 'Active' : 'Disconnected'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-1 mb-8">
                            <div className="text-sm font-bold text-zinc-500 uppercase tracking-tighter">Current Balance</div>
                            <div className="text-5xl font-black tracking-tighter">₹{balance.toLocaleString()}</div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                            <div>
                                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Wallet Address</div>
                                <div className="font-mono text-sm bg-white/5 px-4 py-2 rounded-xl flex items-center gap-3 border border-white/5">
                                    {account ? `${account.substring(0, 10)}...${account.substring(account.length - 4)}` : 'Connect Wallet'}
                                    {account && <ExternalLink className="h-3 w-3 text-zinc-500" />}
                                </div>
                            </div>
                            <div className="h-10 w-px bg-white/10 hidden sm:block" />
                            <div>
                                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Network</div>
                                <div className="text-sm font-bold">HealthID Mainnet</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* BOND CARD */}
                <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800 shadow-sm rounded-[2rem] flex flex-col justify-between overflow-hidden relative">
                    <div className="absolute -right-4 -bottom-4 opacity-5">
                        <ShieldCheck className="h-32 w-32" />
                    </div>
                    <CardHeader className="p-8">
                        <CardTitle className="text-xs font-black text-amber-600 uppercase tracking-[0.2em]">Security Bonds</CardTitle>
                        <CardDescription className="text-amber-700/60 font-medium">Bonds currently locked in escrow.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-0">
                        <div className="text-5xl font-black text-amber-700 tracking-tighter">₹{calculatedLocked}.00</div>
                    </CardContent>
                    <CardFooter className="p-8">
                        <div className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-amber-200 w-full">
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest leading-relaxed">
                                {calculatedLocked > 0
                                    ? "Funds will be rebonded (refunded) once the pharmacist confirms your order collection."
                                    : "No active bonds at the moment. Bonds are required for pharmacy orders."}
                            </p>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* TRANSACTION HISTORY */}
            <h2 className="text-2xl font-black text-zinc-900 mt-4 flex items-center gap-3">
                <History className="h-6 w-6 text-zinc-400" /> Transaction History
            </h2>

            <div className="space-y-4">
                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-zinc-100">
                        <Receipt className="h-12 w-12 text-zinc-100 mx-auto mb-4" />
                        <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">No transactions found</p>
                    </div>
                ) : (
                    orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((order) => (
                        <div key={order.id} className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex items-center justify-between hover:border-zinc-300 transition-all group">
                            <div className="flex items-center gap-6">
                                <div className={`p-4 rounded-2xl ${order.status === 'collected' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                    {order.status === 'collected' ? <ArrowDownLeft className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                                </div>
                                <div>
                                    <div className="flex align-center gap-2 mb-1">
                                        <span className="font-black text-zinc-900 group-hover:text-teal-600 transition-colors">Medicine Purchase</span>
                                        <Badge variant="outline" className="text-[9px] font-black uppercase py-0 tracking-tighter px-2 h-4">
                                            #{order.id}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">{new Date(order.date).toLocaleDateString()} • {order.items.length} items</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-12">
                                <div className="text-right hidden md:block">
                                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">Bond Status</p>
                                    {order.status === 'collected' ? (
                                        <Badge className="bg-green-100 text-green-700 border-none font-bold">REFUNDED</Badge>
                                    ) : (
                                        <Badge className="bg-amber-100 text-amber-700 border-none font-bold">LOCKED</Badge>
                                    )}
                                </div>
                                <div className="text-right min-w-[100px]">
                                    <p className="text-xl font-black text-zinc-900 tracking-tighter">- ₹{order.total.toFixed(2)}</p>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Settled via Web3</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
