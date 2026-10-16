// src/components/Navbar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Building2,
  Calendar,
  Bell,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';

export function Navbar() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & School Badge */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-base font-black text-slate-900 tracking-tight">EduSphere <span className="text-blue-600">SMIS</span></span>
                <span className="block text-[10px] font-semibold text-slate-400 tracking-widest uppercase">Zambia Enterprise</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-2 ml-6 pl-6 border-l border-slate-200">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/60">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Kabulonga Combined Academy (EDS-ZM-001)</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200/60">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>2026 Term 1 • Week 8</span>
              </span>
            </div>
          </div>

          {/* Quick Links & Active User */}
          <div className="flex items-center gap-3">
            <Link
              href="/parent"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <span>Parent Portal</span>
            </Link>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition"
            >
              <span>Super Admin</span>
            </Link>

            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                AM
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">Agnes Mwanza</p>
                <p className="text-[10px] text-slate-500">Headteacher & Principal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
