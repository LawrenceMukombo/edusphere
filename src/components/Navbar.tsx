// src/components/Navbar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Building2,
  Calendar,
  Sparkles,
  MapPin,
  CheckCircle2,
  Bed,
  Sun,
  Layers,
} from 'lucide-react';
import { useCampus, CampusId } from './CampusContext';

import { LegacyLogo } from './LegacyLogo';
import { OfflineIndicator } from './OfflineIndicator';

export function Navbar() {
  const { selectedCampus, setSelectedCampus, campusInfo } = useCampus();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & School Identity from Official Emblem */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center hover:opacity-95 transition">
              <LegacyLogo variant="compact" size="md" />
            </Link>
          </div>

          {/* Center: Campus Switcher (Management Control) */}
          <div className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shadow-inner shrink-0">
            <button
              type="button"
              onClick={() => setSelectedCampus('ALL')}
              className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                selectedCampus === 'ALL'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xl:inline">All Campuses (Consolidated)</span>
              <span className="xl:hidden">All Campuses</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCampus('MUSHITALA')}
              className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                selectedCampus === 'MUSHITALA' || selectedCampus === 'KANSANSHI'
                  ? 'bg-indigo-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bed className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden 2xl:inline">Mushitala Campus (Near Kansanshi)</span>
              <span className="2xl:hidden">Mushitala Campus</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCampus('URBAN')}
              className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                selectedCampus === 'URBAN'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sun className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden 2xl:inline">Urban Campus (Solwezi Central)</span>
              <span className="2xl:hidden">Urban Campus</span>
            </button>
          </div>

          {/* Quick Links & Active User */}
          <div className="flex items-center gap-3">
            <OfflineIndicator />

            <div className="hidden md:flex flex-col text-right">
              <span className="inline-flex items-center justify-end gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                2026 Term 1 • Week 8
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                Stand # S/SOLWE/3177178, Kansanshi Rd
              </span>
            </div>

            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-blue-900 text-amber-300 font-bold text-xs flex items-center justify-center ring-2 ring-blue-100 shadow-xs">
                EM
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">Mr. Emmanuel Mwansa</p>
                <p className="text-[10px] text-slate-500">School Director & Principal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Campus Selector */}
        <div className="lg:hidden pb-3 flex items-center justify-between border-t border-slate-100 pt-2 gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Campus View:</span>
          <select
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value as CampusId)}
            className="text-xs font-bold bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Campuses (Consolidated)</option>
            <option value="MUSHITALA">Mushitala Campus (Near Kansanshi - Boarding)</option>
            <option value="URBAN">Urban Campus (Solwezi Central - ECE & Primary)</option>
          </select>
        </div>
      </div>
    </header>
  );
}
