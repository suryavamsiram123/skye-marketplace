import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, CheckCircle, DollarSign, MessageCircle, Briefcase, MapPin } from 'lucide-react';
import type { Notification } from '../lib/supabase';

type Props = {
  notifications: Notification[];
  unreadCount: number;
  theme: 'dark' | 'light';
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
};

const iconMap: Record<Notification['type'], React.ReactNode> = {
  new_gig: <Briefcase className="w-4 h-4 text-cyan-500" />,
  gig_match: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  gig_accepted: <CheckCircle className="w-4 h-4 text-blue-500" />,
  escrow_release: <DollarSign className="w-4 h-4 text-amber-500" />,
  message: <MessageCircle className="w-4 h-4 text-slate-400" />,
  payment: <DollarSign className="w-4 h-4 text-emerald-500" />,
};

export function NotificationBell({
  notifications,
  unreadCount,
  theme,
  onMarkAsRead,
  onMarkAllAsRead,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-all ${
          isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
        }`}
      >
        <Bell className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute right-0 top-full mt-2 w-80 max-h-96 overflow-hidden rounded-xl shadow-2xl z-50 ${
          isDark
            ? 'bg-slate-900 border border-slate-700'
            : 'bg-white border border-gray-200'
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${
            isDark ? 'border-slate-800' : 'border-gray-200'
          }`}>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-cyan-500 hover:text-cyan-400 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-72">
            {notifications.length === 0 ? (
              <div className={`px-4 py-8 text-center ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.read) onMarkAsRead(n.id);
                  }}
                  className={`w-full text-left px-4 py-3 border-b transition-all ${
                    isDark
                      ? `border-slate-800 ${n.read ? 'bg-transparent' : 'bg-slate-800/50'} hover:bg-slate-800`
                      : `border-gray-100 ${n.read ? 'bg-transparent' : 'bg-cyan-50'} hover:bg-gray-50`
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isDark ? 'bg-slate-800' : 'bg-gray-100'
                    }`}>
                      {iconMap[n.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium truncate ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 line-clamp-2 ${
                        isDark ? 'text-slate-400' : 'text-gray-600'
                      }`}>
                        {n.content}
                      </p>
                      <p className={`text-xs mt-1 ${
                        isDark ? 'text-slate-600' : 'text-gray-400'
                      }`}>
                        {formatDate(n.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
