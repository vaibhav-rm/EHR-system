'use client';

import React from 'react';
import { Notification } from '@/lib/types';
import { Bell, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface NotificationListProps {
  notifications: Notification[];
}

export default function NotificationList({ notifications }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
        <p className="text-gray-500 mt-1">You're all caught up!</p>
      </div>
    );
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-100';
      case 'warning': return 'bg-yellow-50 border-yellow-100';
      case 'error': return 'bg-red-50 border-red-100';
      default: return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex gap-4 p-4 rounded-xl border ${getBgColor(notification.type)} transition-all hover:shadow-md`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(notification.type)}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{notification.message}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
              </span>
              {notification.link && (
                <>
                  <span className="text-gray-300">•</span>
                  <Link href={notification.link} className="text-xs font-medium text-[#0d9488] hover:underline">
                    View Details
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
