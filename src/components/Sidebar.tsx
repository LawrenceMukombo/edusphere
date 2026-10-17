// src/components/Sidebar.tsx
'use client';

import React from 'react';
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
  Building2,
  DollarSign,
} from 'lucide-react';
import { useCampus } from './CampusContext';

const NAV_ITEMS = [
  { href: '/', label: 'Executive Dashboard', icon: LayoutDashboard },
  { href: '/attendance', label: 'Operations & Attendance', icon: CalendarCheck, badge: 'Live' },
  { href: '/finance', label: 'Fees & Expenditures', icon: DollarSign, badge: 'Ledger' },
  { href: '/hr', label: 'Staff & HR Suite', icon: Briefcase, badge: 'TCZ' },
  { href: '/gis', label: 'Solwezi Campuses & GIS', icon: Compass },
  { href: '/admissions', label: 'Admissions & SIS', icon: Users },
  { href: '/academics', label: 'Academics & Reports', icon: GraduationCap },
  { href: '/teacher', label: 'Teacher Workspace', icon: ClipboardCheck },
  { href: '/parent', label: 'Parent Portal', icon: HeartHandshake },
  { href: '/admin', label: 'Platform Admin', icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  const { campusInfo } = useCampus();

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
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-sm shadow-blue-900/30 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-amber-400 text-slate-900'
                          : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                      }`}
                    >
                      {item.badge}
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
