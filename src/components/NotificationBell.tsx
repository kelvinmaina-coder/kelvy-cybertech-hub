import React, { useState, useEffect } from 'react';
import { Bell, BellDot, X } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load mock notifications for demo
    const mockNotifications: Notification[] = [
      { id: 1, title: 'Security Alert', message: 'New threat detected', is_read: false, created_at: new Date().toISOString() },
      { id: 2, title: 'Scan Complete', message: 'Nmap scan finished', is_read: false, created_at: new Date().toISOString() },
      { id: 3, title: 'Ticket Updated', message: 'Ticket #123 was resolved', is_read: true, created_at: new Date().toISOString() },
    ];
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.is_read).length);
  }, []);

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 hover:bg-accent rounded-md transition-colors">
        {unreadCount > 0 ? <BellDot className="w-5 h-5 text-yellow-500" /> : <Bell className="w-5 h-5" />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-gray-900 rounded-lg shadow-xl border border-gray-700 z-50 overflow-hidden">
            <div className="flex justify-between items-center p-3 border-b border-gray-700">
              <h3 className="font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-blue-400 hover:underline">Mark all read</button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-400">No notifications</div>
              ) : (
                notifications.map(notif => (
                  <div key={notif.id} className={`p-3 border-b border-gray-700 cursor-pointer ${!notif.is_read ? 'bg-blue-900/20' : ''}`} onClick={() => markAsRead(notif.id)}>
                    <p className="text-sm font-medium text-white">{notif.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(notif.created_at).toLocaleTimeString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
