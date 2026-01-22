"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { User, Bell, Shield, Palette, Globe, ChevronRight, Camera, Mail, Phone, MapPin, Save } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("notifications");

  const tabs = [
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "privacy", name: "Privacy & Security", icon: Shield },
    { id: "appearance", name: "Appearance", icon: Palette },
    { id: "language", name: "Language & Region", icon: Globe },
  ];

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar />
      <div className="flex-1 ml-64 transition-all duration-300">
        <Navbar />
        <main className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#09090b]">Settings</h1>
            <p className="text-sm text-[#71717a] mt-1">Manage your account preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#e4e4e7]">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? "bg-[#0d9488] text-white"
                          : "text-[#52525b] hover:bg-[#f4f4f5]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <tab.icon className="h-4 w-4" />
                        {tab.name}
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            <div className="lg:col-span-3">

              {activeTab === "notifications" && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
                  <h2 className="text-lg font-semibold text-[#09090b] mb-6">Notification Preferences</h2>
                  <div className="space-y-6">
                    {[
                      { title: "Appointment Reminders", desc: "Get notified about upcoming appointments" },
                      { title: "Medication Reminders", desc: "Daily reminders to take your medications" },
                      { title: "Lab Results", desc: "Notifications when new results are available" },
                      { title: "Bill Reminders", desc: "Alerts for pending payments" },
                      { title: "Health Tips", desc: "Weekly health and wellness tips" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-[#fafafa] rounded-2xl">
                        <div>
                          <h4 className="text-sm font-semibold text-[#09090b]">{item.title}</h4>
                          <p className="text-xs text-[#71717a]">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={idx < 3} />
                          <div className="w-11 h-6 bg-[#e4e4e7] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0d9488]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "privacy" && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
                  <h2 className="text-lg font-semibold text-[#09090b] mb-6">Privacy & Security</h2>
                  <div className="space-y-6">
                    <div className="p-4 bg-[#fafafa] rounded-2xl">
                      <h4 className="text-sm font-semibold text-[#09090b] mb-2">Change Password</h4>
                      <p className="text-xs text-[#71717a] mb-4">Update your password regularly for security</p>
                      <button className="px-4 py-2 border border-[#e4e4e7] rounded-xl text-sm font-medium text-[#52525b] hover:bg-white transition-colors">
                        Update Password
                      </button>
                    </div>
                    <div className="p-4 bg-[#fafafa] rounded-2xl">
                      <h4 className="text-sm font-semibold text-[#09090b] mb-2">Two-Factor Authentication</h4>
                      <p className="text-xs text-[#71717a] mb-4">Add an extra layer of security to your account</p>
                      <button className="px-4 py-2 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl text-sm font-semibold transition-colors">
                        Enable 2FA
                      </button>
                    </div>
                    <div className="p-4 bg-[#fafafa] rounded-2xl">
                      <h4 className="text-sm font-semibold text-[#09090b] mb-2">Data Sharing</h4>
                      <p className="text-xs text-[#71717a] mb-4">Control who can access your medical records</p>
                      <button className="px-4 py-2 border border-[#e4e4e7] rounded-xl text-sm font-medium text-[#52525b] hover:bg-white transition-colors">
                        Manage Access
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "appearance" && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
                  <h2 className="text-lg font-semibold text-[#09090b] mb-6">Appearance</h2>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-[#09090b] mb-4">Theme</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {["Light", "Dark", "System"].map((theme) => (
                          <button
                            key={theme}
                            className={`p-4 rounded-2xl border-2 text-sm font-medium transition-colors ${
                              theme === "Light"
                                ? "border-[#0d9488] bg-teal-50/50"
                                : "border-[#e4e4e7] hover:border-[#a1a1aa]"
                            }`}
                          >
                            {theme}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "language" && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
                  <h2 className="text-lg font-semibold text-[#09090b] mb-6">Language & Region</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-[#52525b] mb-2">Language</label>
                      <select className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] bg-white">
                        <option>English (US)</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#52525b] mb-2">Timezone</label>
                      <select className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] bg-white">
                        <option>Eastern Time (ET)</option>
                        <option>Pacific Time (PT)</option>
                        <option>Central Time (CT)</option>
                        <option>Mountain Time (MT)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#52525b] mb-2">Date Format</label>
                      <select className="w-full px-4 py-3 border border-[#e4e4e7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] bg-white">
                        <option>MM/DD/YYYY</option>
                        <option>DD/MM/YYYY</option>
                        <option>YYYY-MM-DD</option>
                      </select>
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