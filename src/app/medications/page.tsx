"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Pill, Clock, Plus, Check, AlertCircle, RefreshCw, ShoppingCart, Search, Star, Package, X, Minus, Trash2 } from "lucide-react";



const schedule = [
  { time: "8:00 AM", meds: ["Lisinopril 10mg", "Metformin 500mg"], taken: true },
  { time: "9:00 AM", meds: ["Vitamin D3 2000 IU"], taken: true },
  { time: "8:00 PM", meds: ["Metformin 500mg"], taken: false },
];

const pharmacyMedicines = [
  {
    id: 1,
    name: "Paracetamol",
    brand: "Crocin",
    dosage: "500mg",
    packSize: "15 tablets",
    price: 30,
    originalPrice: 35,
    category: "Pain Relief",
    prescription: false,
    rating: 4.8,
    reviews: 2340,
    image: "💊",
  },
  {
    id: 2,
    name: "Cetirizine",
    brand: "Zyrtec",
    dosage: "10mg",
    packSize: "10 tablets",
    price: 85,
    originalPrice: 100,
    category: "Allergy",
    prescription: false,
    rating: 4.6,
    reviews: 1890,
    image: "💊",
  },
  {
    id: 3,
    name: "Omeprazole",
    brand: "Omez",
    dosage: "20mg",
    packSize: "15 capsules",
    price: 120,
    originalPrice: 145,
    category: "Digestive Health",
    prescription: false,
    rating: 4.7,
    reviews: 3210,
    image: "💊",
  },
  {
    id: 4,
    name: "Azithromycin",
    brand: "Azithral",
    dosage: "500mg",
    packSize: "3 tablets",
    price: 180,
    originalPrice: 210,
    category: "Antibiotics",
    prescription: true,
    rating: 4.5,
    reviews: 1560,
    image: "💊",
  },
  {
    id: 5,
    name: "Ibuprofen",
    brand: "Brufen",
    dosage: "400mg",
    packSize: "10 tablets",
    price: 45,
    originalPrice: 55,
    category: "Pain Relief",
    prescription: false,
    rating: 4.7,
    reviews: 4120,
    image: "💊",
  },
  {
    id: 6,
    name: "Vitamin B Complex",
    brand: "Becosules",
    dosage: "Standard",
    packSize: "20 capsules",
    price: 35,
    originalPrice: 42,
    category: "Vitamins",
    prescription: false,
    rating: 4.9,
    reviews: 5670,
    image: "💊",
  },
  {
    id: 7,
    name: "Metformin",
    brand: "Glycomet",
    dosage: "500mg",
    packSize: "20 tablets",
    price: 65,
    originalPrice: 80,
    category: "Diabetes",
    prescription: true,
    rating: 4.6,
    reviews: 2890,
    image: "💊",
  },
  {
    id: 8,
    name: "Amlodipine",
    brand: "Amlong",
    dosage: "5mg",
    packSize: "15 tablets",
    price: 95,
    originalPrice: 115,
    category: "Blood Pressure",
    prescription: true,
    rating: 4.8,
    reviews: 3450,
    image: "💊",
  },
];

const categories = ["All", "Pain Relief", "Allergy", "Digestive Health", "Antibiotics", "Vitamins", "Diabetes", "Blood Pressure"];

interface CartItem {
  id: number;
  name: string;
  brand: string;
  dosage: string;
  price: number;
  quantity: number;
}

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { addDays, format } from 'date-fns';

export default function MedicationsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"my-meds" | "pharmacy">("pharmacy");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const { data: bundle } = useQuery({
    queryKey: ['medications', session?.user?.email],
    queryFn: async () => {
        const res = await fetch('/api/fhir/MedicationRequest?status=active');
        if (!res.ok) throw new Error("Failed to fetch medications");
        return res.json();
    },
    enabled: !!session
  });

  const medications = (bundle?.entry || []).map((e: any) => {
      const r = e.resource;
      const dosage = r.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.value 
        ? `${r.dosageInstruction[0].doseAndRate[0].doseQuantity.value} ${r.dosageInstruction[0].doseAndRate[0].doseQuantity.unit || ''}`
        : 'Standard';
      
      return {
          id: r.id,
          name: r.medicationCodeableConcept?.text || "Unknown Med",
          dosage: dosage,
          frequency: r.dosageInstruction?.[0]?.text || "As directed",
          time: "8:00 AM", // Placeholder
          purpose: "Treatment", // Placeholder
          refillDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'), // Placeholder
          adherence: 90 + Math.floor(Math.random() * 10), // Mock
          status: r.status,
          instructions: r.dosageInstruction?.[0]?.text || "Follow doctor's advice."
      };
  });

  const filteredMedicines = pharmacyMedicines.filter((med) => {
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || med.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (medicine: typeof pharmacyMedicines[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === medicine.id);
      if (existing) {
        return prev.map((item) =>
          item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: medicine.id, name: medicine.name, brand: medicine.brand, dosage: medicine.dosage, price: medicine.price, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter((item) => item.quantity > 0);
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar />
      <div className="flex-1 ml-64 transition-all duration-300">
        <Navbar />
        <main className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#09090b]">Medications</h1>
              <p className="text-sm text-[#71717a] mt-1">Track prescriptions & buy medicines online</p>
            </div>
            <div className="flex items-center gap-3">
<div className="flex bg-white rounded-xl border border-[#e4e4e7] p-1">
                  <button
                    onClick={() => setActiveTab("pharmacy")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === "pharmacy" ? "bg-[#0d9488] text-white" : "text-[#52525b] hover:bg-[#f4f4f5]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Buy Medicines
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("my-meds")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === "my-meds" ? "bg-[#0d9488] text-white" : "text-[#52525b] hover:bg-[#f4f4f5]"
                    }`}
                  >
                    My Medications
                  </button>
                </div>
              {activeTab === "pharmacy" && (
                <button
                  onClick={() => setShowCart(true)}
                  className="relative inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Cart
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}
              {activeTab === "my-meds" && (
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl text-sm font-semibold transition-colors">
                  <Plus className="h-4 w-4" />
                  Add Medication
                </button>
              )}
            </div>
          </div>

          {activeTab === "my-meds" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
                  <h2 className="text-lg font-semibold text-[#09090b] mb-4">Active Medications</h2>
                  <div className="space-y-4">
                    {medications.map((med: any) => (
                      <div
                        key={med.id}
                        className="p-5 bg-[#fafafa] rounded-2xl border border-[#e4e4e7] hover:border-[#0d9488]/30 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-2xl bg-teal-50 text-teal-600">
                              <Pill className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-bold text-[#09090b]">{med.name}</h4>
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-600">
                                  {med.status}
                                </span>
                              </div>
                              <p className="text-sm text-[#71717a] mt-0.5">{med.dosage} • {med.frequency}</p>
                              <p className="text-xs text-[#a1a1aa] mt-1">{med.purpose}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[#09090b]">{med.adherence}%</p>
                            <p className="text-xs text-[#71717a]">Adherence</p>
                          </div>
                        </div>

                        <div className="mt-4 h-2 bg-[#e4e4e7] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0d9488] rounded-full transition-all"
                            style={{ width: `${med.adherence}%` }}
                          />
                        </div>

                        <div className="mt-4 p-3 bg-white rounded-xl border border-[#e4e4e7]">
                          <p className="text-xs text-[#52525b]">{med.instructions}</p>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#e4e4e7]">
                          <div className="flex items-center gap-4 text-xs text-[#a1a1aa]">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {med.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <RefreshCw className="h-3 w-3" />
                              Refill: {med.refillDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => setActiveTab("pharmacy")}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg text-sm font-medium transition-colors"
                            >
                              <ShoppingCart className="h-3.5 w-3.5" />
                              Reorder
                            </button>
                            <button className="text-sm font-semibold text-[#0d9488] hover:text-[#0f766e]">
                              Log Dose
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
                  <h3 className="font-semibold text-[#09090b] mb-4">Today&apos;s Schedule</h3>
                  <div className="space-y-4">
                    {schedule.map((slot, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border ${
                          slot.taken
                            ? "bg-teal-50/50 border-teal-100"
                            : "bg-orange-50/50 border-orange-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-[#09090b]">{slot.time}</span>
                          {slot.taken ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-teal-600">
                              <Check className="h-3 w-3" /> Taken
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-medium text-orange-600">
                              <AlertCircle className="h-3 w-3" /> Pending
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          {slot.meds.map((med, i) => (
                            <p key={i} className="text-xs text-[#52525b]">{med}</p>
                          ))}
                        </div>
                        {!slot.taken && (
                          <button className="mt-3 w-full py-2 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-semibold rounded-xl transition-colors">
                            Mark as Taken
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
                  <h3 className="font-semibold text-[#09090b] mb-2">Monthly Summary</h3>
                  <p className="text-sm text-[#71717a] mb-4">December 2024</p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#71717a]">Overall Adherence</span>
                      <span className="text-lg font-bold text-[#0d9488]">92%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#71717a]">Doses Taken</span>
                      <span className="text-lg font-bold text-[#09090b]">87/94</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#71717a]">Missed Doses</span>
                      <span className="text-lg font-bold text-orange-500">7</span>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-3xl p-6 border border-orange-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-orange-100">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-800 text-sm">Refill Reminder</h4>
                      <p className="text-xs text-orange-700 mt-1">
                        Lisinopril needs to be refilled by January 15, 2025. Contact your pharmacy or order online.
                      </p>
                      <button
                        onClick={() => setActiveTab("pharmacy")}
                        className="mt-2 text-xs font-semibold text-orange-600 hover:text-orange-700"
                      >
                        Order Now →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
                    <input
                      type="text"
                      placeholder="Search medicines by name, brand, or category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2.5 border border-[#e4e4e7] rounded-xl text-sm bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-[#0d9488]" />
                    <span className="text-sm text-[#71717a]">Free delivery on orders above ₹500</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-4">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                          ? "bg-[#0d9488] text-white"
                          : "bg-[#f4f4f5] text-[#52525b] hover:bg-[#e4e4e7]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredMedicines.map((medicine) => (
                  <div
                    key={medicine.id}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-[#e4e4e7] hover:border-[#0d9488]/30 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{medicine.image}</span>
                      {medicine.prescription && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                          Rx Required
                        </span>
                      )}
                    </div>
                    <div className="mb-3">
                      <h4 className="font-bold text-[#09090b]">{medicine.name}</h4>
                      <p className="text-sm text-[#71717a]">{medicine.brand} • {medicine.dosage}</p>
                      <p className="text-xs text-[#a1a1aa] mt-1">{medicine.packSize}</p>
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-[#09090b]">{medicine.rating}</span>
                      <span className="text-xs text-[#a1a1aa]">({medicine.reviews.toLocaleString()})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-[#09090b]">₹{medicine.price}</span>
                        <span className="text-sm text-[#a1a1aa] line-through ml-2">₹{medicine.originalPrice}</span>
                      </div>
                      <button
                        onClick={() => addToCart(medicine)}
                        className="p-2 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredMedicines.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[#71717a]">No medicines found matching your search.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {showCart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50">
          <div className="bg-white h-full w-full max-w-md shadow-xl overflow-y-auto">
            <div className="p-6 border-b border-[#e4e4e7] flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-[#09090b]">Shopping Cart</h2>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-[#f4f4f5] rounded-xl transition-colors"
              >
                <X className="h-5 w-5 text-[#71717a]" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-[#e4e4e7] mx-auto mb-4" />
                  <p className="text-[#71717a]">Your cart is empty</p>
                  <button
                    onClick={() => setShowCart(false)}
                    className="mt-4 text-sm font-semibold text-[#0d9488] hover:text-[#0f766e]"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-[#fafafa] rounded-2xl">
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#09090b]">{item.name}</h4>
                        <p className="text-sm text-[#71717a]">{item.brand} • {item.dosage}</p>
                        <p className="text-sm font-bold text-[#09090b] mt-1">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1.5 bg-white border border-[#e4e4e7] rounded-lg hover:bg-[#f4f4f5]"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1.5 bg-white border border-[#e4e4e7] rounded-lg hover:bg-[#f4f4f5]"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-[#e4e4e7] pt-4 mt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#71717a]">Subtotal</span>
                      <span className="font-medium">₹{cartTotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#71717a]">Delivery</span>
                      <span className="font-medium text-[#0d9488]">{cartTotal >= 500 ? "FREE" : "₹50"}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-[#e4e4e7]">
                      <span>Total</span>
                      <span>₹{cartTotal >= 500 ? cartTotal : cartTotal + 50}</span>
                    </div>
                  </div>

                  <button className="w-full py-3 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl font-semibold transition-colors mt-4">
                    Proceed to Checkout
                  </button>
                  <p className="text-xs text-center text-[#a1a1aa] mt-2">
                    Prescription medicines require valid prescription upload during checkout
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
