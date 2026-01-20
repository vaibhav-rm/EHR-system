"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ShoppingCart,
  Search,
  Phone,
  CheckCircle2,
  Clock,
  User,
  Package,
  Wallet,
  Plus,
  Minus,
  Trash2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  ClipboardList
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useMetaMask } from "@/hooks/use-metamask";

// --- DATA ---
const MEDICINES = [
  {
    id: "med-1",
    name: "Paracetamol 500mg",
    category: "Pain Relief",
    price: 60,
    description: "Effective relief from headache, toothache, and fever.",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80",
  },
  {
    id: "med-2",
    name: "Vitamin C 1000mg",
    category: "Vitamins",
    price: 150,
    description: "Supports immune system health and reduces tiredness.",
    image: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=500&q=80",
  },
  {
    id: "med-3",
    name: "Amoxicillin 250mg",
    category: "Antibiotics",
    price: 180,
    description: "Antibiotic used to treat a number of bacterial infections.",
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&q=80",
  },
  {
    id: "med-4",
    name: "Cough Syrup",
    category: "Cold & Flu",
    price: 120,
    description: "Relief from dry and tickly coughs.",
    image: "https://images.unsplash.com/photo-1512069772995-ec65ed456d32?w=500&q=80",
  },
];

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  fee: number;
  total: number;
  status: 'pending' | 'processing' | 'collected' | 'cancelled';
  date: string;
  requestedCall?: boolean;
}

export default function PharmacyStore() {
  const { account, lockAmount, refundAmount } = useMetaMask();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [requestCall, setRequestCall] = useState(false);
  const [activeTab, setActiveTab] = useState("shop");

  // Load orders from localStorage
  useEffect(() => {
    const savedOrders = localStorage.getItem('med_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  // Save orders to localStorage
  useEffect(() => {
    localStorage.setItem('med_orders', JSON.stringify(orders));
  }, [orders]);

  const addToCart = (med: typeof MEDICINES[0]) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === med.id);
      if (existing) {
        return prev.map(i => i.id === med.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: med.id, name: med.name, price: med.price, quantity: 1 }];
    });
    toast.success(`Added ${med.name} to cart`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const fee = subtotal * 0.05;
    const total = subtotal + fee;
    return { subtotal, fee, total };
  };

  const placeOrder = () => {
    if (!account) {
      toast.error("Connect Wallet First", { description: "You need to connect MetaMask to place an order with bond security." });
      return;
    }

    const { subtotal, fee, total } = calculateTotals();
    const bondAmount = 100;

    lockAmount(bondAmount);

    const newOrder: Order = {
      id: Math.random().toString(36).substring(7).toUpperCase(),
      items: [...cart],
      subtotal,
      fee,
      total,
      status: 'pending',
      date: new Date().toISOString(),
      requestedCall: requestCall
    };

    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setRequestCall(false);
    toast.success("Order Placed Successfully", {
      description: requestCall
        ? "₹100 bond locked. Pharmacist will call you shortly."
        : "₹100 bond locked. Payment awaiting confirmation."
    });
    setActiveTab("merchant");
  };

  // --- MERCHANT ACTIONS ---
  const handleProcessOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'processing' } : o));
    toast.info("Order Accepted", { description: "Order status moved to processing." });
  };

  const handleConfirmPayment = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'collected' } : o));
    refundAmount(100);
    toast.success("Payment Received", { description: "Order completed. ₹100 bond refunded to patient." });
  };

  return (
    <div className="flex flex-1 flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Pharmacy Store</h1>
          <p className="text-zinc-500 font-medium">Browse medications or manage orders.</p>
        </div>

        <div className="flex gap-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-zinc-100 p-1 rounded-xl">
            <TabsList className="bg-transparent h-auto p-0">
              <TabsTrigger value="shop" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Shop</TabsTrigger>
              <TabsTrigger value="merchant" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Merchant Portal</TabsTrigger>
            </TabsList>
          </Tabs>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl px-6 h-11 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Cart ({cart.length})
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-w-md">
              <DialogHeader>
                <DialogTitle>Your Shopping Cart</DialogTitle>
                <DialogDescription>Review items and place order with bond.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 my-4 max-h-[40vh] overflow-y-auto pr-2">
                {cart.length === 0 ? (
                  <p className="text-center py-8 text-zinc-500">Cart is empty</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <div>
                        <p className="font-bold text-sm">{item.name}</p>
                        <p className="text-xs text-zinc-500">₹{item.price} each</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg p-1">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-teal-600"><Minus className="h-3 w-3" /></button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-teal-600"><Plus className="h-3 w-3" /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-zinc-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <Checkbox id="reqCall" checked={requestCall} onCheckedChange={(c) => setRequestCall(c as boolean)} />
                    <Label htmlFor="reqCall" className="text-xs font-medium cursor-pointer">Call me before confirming order</Label>
                  </div>

                  <div className="p-4 bg-zinc-900 text-white rounded-2xl space-y-2">
                    <div className="flex justify-between text-xs opacity-60">
                      <span>Subtotal</span>
                      <span>₹{calculateTotals().subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs opacity-60">
                      <span>Platform Fee (5%)</span>
                      <span>₹{calculateTotals().fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-black text-lg pt-2 border-t border-white/10 uppercase tracking-tighter">
                      <span>PAYABLE</span>
                      <span className="text-teal-400 text-xl font-black tracking-tight">₹{calculateTotals().total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-amber-50 rounded-2xl flex justify-between items-center text-[10px] font-black uppercase text-amber-700 tracking-wider">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-3 w-3" /> SECURITY BOND
                    </div>
                    <span>- ₹100.00 (REFUNDABLE)</span>
                  </div>

                  <Button onClick={placeOrder} className="w-full bg-teal-600 hover:bg-teal-700 h-14 rounded-2xl text-lg font-black uppercase tracking-widest shadow-lg shadow-teal-100">
                    Place Order
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} className="flex-1">
        <TabsContent value="shop" className="m-0 focus-visible:ring-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12">
            {MEDICINES.map((med) => (
              <Card key={med.id} className="group rounded-3xl overflow-hidden border-zinc-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 bg-white">
                <div className="relative h-64 w-full overflow-hidden bg-zinc-100">
                  <Image
                    src={med.image}
                    alt={med.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 backdrop-blur-md text-zinc-900 border-none px-4 py-1.5 rounded-full font-bold shadow-sm shadow-black/5 uppercase tracking-wider text-[10px]">
                      {med.category}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-zinc-900 text-white px-3 py-1.5 rounded-full font-black text-xs">
                      ₹{med.price}.00
                    </div>
                  </div>
                </div>
                <CardHeader className="p-6">
                  <CardTitle className="text-2xl font-black text-zinc-900 tracking-tight leading-tight">{med.name}</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0 flex-1">
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed italic">
                    {med.description}
                  </p>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button
                    onClick={() => addToCart(med)}
                    className="w-full bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-900 border-none h-12 rounded-xl font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="merchant" className="m-0 focus-visible:ring-0">
          <div className="grid grid-cols-1 gap-6 pb-12">
            {orders.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-zinc-100">
                <ClipboardList className="h-12 w-12 text-zinc-200 mx-auto mb-4" />
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">No active orders found</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">ORDER #{order.id}</span>
                          <Badge className={
                            order.status === 'collected' ? 'bg-green-100 text-green-700' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                'bg-amber-100 text-amber-700'
                          }>
                            {order.status.toUpperCase()}
                          </Badge>
                          {order.requestedCall && order.status === 'pending' && (
                            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-100 animate-pulse text-[10px] uppercase font-black px-3">
                              <Phone className="h-3 w-3 mr-1" /> Call Requested
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 font-medium">{new Date(order.date).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-zinc-900 tracking-tighter">₹{order.total.toFixed(2)}</p>
                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">₹100 Bond Active</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 italic">
                          <Package className="h-5 w-5 text-zinc-400" />
                          <p className="text-xs font-bold text-zinc-700">{item.name} <span className="text-zinc-400 ml-1">x{item.quantity}</span></p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:w-64 bg-zinc-50 rounded-3xl p-6 flex flex-col justify-center gap-3">
                    {order.status === 'pending' && (
                      <>
                        <Button onClick={() => toast.info("Calling Patient...")} className="w-full bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-100 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                          <Phone className="h-4 w-4 mr-2" /> Call User
                        </Button>
                        <Button onClick={() => handleProcessOrder(order.id)} className="w-full bg-teal-600 hover:bg-teal-700 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-teal-100">
                          <CheckCircle2 className="h-4 w-4 mr-2" /> Place Order
                        </Button>
                      </>
                    )}

                    {order.status === 'processing' && (
                      <Button onClick={() => handleConfirmPayment(order.id)} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-zinc-100">
                        <ShieldCheck className="h-4 w-4 mr-2" /> Confirm Payment
                      </Button>
                    )}

                    {order.status === 'collected' && (
                      <div className="text-center space-y-2 py-4">
                        <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto" />
                        <p className="font-black text-[10px] uppercase tracking-widest text-green-700">Bond Refunded</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
