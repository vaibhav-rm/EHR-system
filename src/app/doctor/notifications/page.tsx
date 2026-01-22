import React from 'react';
import DoctorSidebar from '@/components/DoctorSidebar';
import Navbar from '@/components/Navbar';
import { getUserNotifications } from '@/app/actions/notifications';
import NotificationList from '@/components/NotificationList';

export default async function DoctorNotificationsPage() {
  const notifications = await getUserNotifications();

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <DoctorSidebar />
      <div className="flex-1 ml-64 transition-all duration-300">
        <Navbar />
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[#09090b]">Notifications</h1>
              <p className="text-sm text-[#71717a] mt-1">Updates on patient activities and appointments</p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e4e4e7]">
              <NotificationList notifications={notifications} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
