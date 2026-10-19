// src/components/Sidebar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardCheck,
  CreditCard,
  Briefcase,
  HeartHandshake,
  ShieldCheck,
  Compass,
  CalendarCheck,
  Calendar,
  Building2,
  DollarSign,
  Bed,
  Sliders,
  Lock,
  Boxes,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { useCampus } from './CampusContext';
import { loadAppSettings, checkModuleEntitlement, AppSettings } from '@/lib/appSettings';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: string;
  moduleKey?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Executive Dashboard', icon: LayoutDashboard },
  { href: '/messages', label: 'In-App Messaging', icon: MessageSquare, badge: 'WhatsApp' },
  { href: '/documents', label: 'Document Generator', icon: FileText, badge: 'Letters' },
  { href: '/attendance', label: 'Operations & Attendance', icon: CalendarCheck, badge: 'Live', moduleKey: 'attendance' },
  { href: '/calendar', label: 'School Calendar & Birthdays', icon: Calendar, badge: '2026', moduleKey: 'calendar' },
  { href: '/boarding', label: 'Boarding Houses & Village', icon: Bed, badge: 'Village', moduleKey: 'boarding' },
  { href: '/finance', label: 'Fees & Expenditures', icon: DollarSign, badge: 'Ledger', moduleKey: 'fees' },
  { href: '/assets', label: 'School Asset Manager', icon: Boxes, badge: 'Capital', moduleKey: 'assets' },
  { href: '/hr', label: 'Staff & HR Suite', icon: Briefcase, badge: 'TCZ', moduleKey: 'hr' },
  { href: '/gis', label: 'Solwezi Campuses & GIS', icon: Compass, moduleKey: 'gis' },
  { href: '/admissions', label: 'Admissions & SIS', icon: Users, moduleKey: 'admissions' },
  { href: '/academics', label: 'Academics & Reports', icon: GraduationCap, moduleKey: 'academics' },
  { href: '/teacher', label: 'Teacher Workspace', icon: ClipboardCheck, moduleKey: 'teacher' },
  { href: '/parent', label: 'Parent Portal', icon: HeartHandshake, moduleKey: 'parentPortal' },
  { href: '/settings', label: 'System Settings', icon: Sliders, badge: 'Config' },
  { href: '/admin', label: 'Platform Admin', icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  const { campusInfo } = useCampus();
  const [settings, setSettings] = useState<AppSettings>(() => loadAppSettings());

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(loadAppSettings());
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('edusphere:settings-updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('edusphere:settings-updated', handleUpdate);
    };
  }, []);

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-4 min-h-[calc(100vh-5rem)]">
      <div className="space-y-6">
        {/* Active Campus Status Badge */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
            <Building2 className="w-3.5 h-3.5 text-blue-700" />
            <span className="truncate">{campusInfo.name}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">{campusInfo.type}</p>
          <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-slate-600 border-t border-slate-200/60 pt-1.5">
            <span>Enrolled: <strong className="text-blue-900">{campusInfo.enrolled}</strong></span>
            <span>Capacity: <strong className="text-slate-800">{campusInfo.capacity}</strong></span>
          </div>
        </div>

        <div>
          <span className="px-3 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            Management Workspaces
          </span>
          <nav className="mt-2 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              let badgeText = item.badge;
              let isUnsubscribed = false;
              let isDisabled = false;

              if (item.moduleKey) {
                const entitlement = checkModuleEntitlement(item.moduleKey, settings);
                if (!entitlement.isSubscribed) {
                  isUnsubscribed = true;
                  badgeText = 'Upgrade';
                } else if (!entitlement.isEnabled) {
                  isDisabled = true;
                  badgeText = 'Off';
                }
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-sm shadow-blue-900/30 font-bold'
                      : isUnsubscribed || isDisabled
                      ? 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : isUnsubscribed || isDisabled ? 'text-slate-300' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {badgeText && (
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-amber-400 text-slate-900'
                          : isUnsubscribed
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 font-extrabold'
                          : isDisabled
                          ? 'bg-slate-100 text-slate-500 border border-slate-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                      }`}
                    >
                      {badgeText}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Solwezi Mining Corridor Infrastructure Compliance */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-950 rounded-xl p-3.5 text-white text-xs shadow-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Solwezi Operations Online</span>
          </div>
          <p className="text-[10px] text-blue-100 mt-1 leading-relaxed">
            Kansanshi Boarding & Mushitala Day linked via high-speed failover. 250kVA generator standby active.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center">
        EduSphere SMIS • Legacy School Solwezi
      </div>
    </aside>
  );
}
