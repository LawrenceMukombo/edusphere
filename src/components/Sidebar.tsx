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
  Building,
  FileSpreadsheet,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/admissions', label: 'Admissions & SIS', icon: Users },
  { href: '/academics', label: 'Academics & Reports', icon: GraduationCap },
  { href: '/teacher', label: 'Teacher Workspace', icon: ClipboardCheck },
  { href: '/finance', label: 'Fees & Finance', icon: CreditCard },
  { href: '/parent', label: 'Parent Portal', icon: HeartHandshake },
  { href: '/hr', label: 'Staff & TCZ Registry', icon: Briefcase },
  { href: '/admin', label: 'Platform Admin', icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <span className="px-3 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            School Workspaces
          </span>
          <nav className="mt-2 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-bold'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Zambia Compliance Badge */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl p-3.5 border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Zambia Compliant</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Aligned with Education (Amendment) Act 2026, Data Protection Act 2021 & TCZ regulations.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
        EduSphere SMIS v1.0.0 Enterprise
      </div>
    </aside>
  );
}
