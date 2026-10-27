'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  FileCheck2,
  DollarSign,
  Users,
  X,
  ExternalLink,
  CheckCheck,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  actor?: string;
  actionCode?: string;
  category: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
  read: boolean;
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diffMin = Math.round((now.getTime() - d.getTime()) / 60000);
      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Institutional Notifications"
        className="relative grid h-9 w-9 place-items-center rounded-lg border border-slate-300 text-slate-600 hover:border-[#007B99] hover:text-[#007B99] hover:bg-sky-50/50 transition cursor-pointer"
        title="Institutional Notifications & Action Logs"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#EC008C] px-1 text-[10px] font-black text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs text-slate-800">Activity &amp; Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold text-cyan-800 border border-cyan-200">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#007B99] hover:underline cursor-pointer"
                >
                  <CheckCheck size={13} />
                  <span>Mark read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* List of Notifications */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 text-xs">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell size={28} className="mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-xs">No new notifications</p>
                <p className="text-[10px] mt-1 text-slate-400">System actions and alerts will appear here in real-time.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 hover:bg-slate-50 transition flex items-start gap-3 ${
                    !item.read ? 'bg-sky-50/20' : ''
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {item.type === 'success' ? (
                      <div className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                        <FileCheck2 size={15} />
                      </div>
                    ) : item.type === 'warning' ? (
                      <div className="grid h-7 w-7 place-items-center rounded-lg bg-amber-100 text-amber-700">
                        <ShieldAlert size={15} />
                      </div>
                    ) : item.category === 'INSTITUTIONAL_NOTICE' ? (
                      <div className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-100 text-indigo-700">
                        <Info size={15} />
                      </div>
                    ) : (
                      <div className="grid h-7 w-7 place-items-center rounded-lg bg-cyan-100 text-cyan-700">
                        <CheckCircle2 size={15} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-bold text-[11px] text-slate-800 truncate">{item.title}</p>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {formatTime(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    {item.actor && (
                      <p className="text-[10px] text-cyan-700 font-semibold mt-1">
                        By: {item.actor}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Link */}
          <div className="border-t border-slate-100 bg-slate-50/80 p-2 text-center">
            <span className="text-[10px] text-slate-500 font-medium">
              Enterprise Audit &amp; Event Stream • Active
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
