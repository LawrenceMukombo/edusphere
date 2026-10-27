'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Edit3, Settings, Eye, CheckCircle2, LayoutDashboard } from 'lucide-react';

interface EditorialBarProps {
  userCanEdit: boolean;
  user: {
    name: string;
    email: string;
    role: string;
    isSuperAdmin?: boolean;
  } | null;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  cardCount?: number;
}

export function EditorialBar({
  userCanEdit,
  user,
  isEditMode,
  onToggleEditMode,
  cardCount = 18,
}: EditorialBarProps) {
  if (!userCanEdit || !user) return null;

  return (
    <div className="sticky top-0 z-50 bg-[#0b2545] border-b-2 border-sky-400 text-white shadow-lg py-2.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Role & Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-sky-500/20 border border-sky-400/40 px-2.5 py-1 text-xs font-bold text-sky-200">
            <ShieldCheck className="h-4 w-4 text-sky-400" />
            <span>Institutional CMS Controls</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-300">
            <span className="font-semibold text-white">{user.name}</span>
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-mono text-lime-300 font-bold">
              {user.isSuperAdmin ? 'SUPER ADMIN (OVERRIDE)' : user.role}
            </span>
          </div>
        </div>

        {/* Center / Right: Live Edit Switch & Section Links */}
        <div className="flex items-center gap-4">
          {/* Live Edit Mode Switch */}
          <button
            type="button"
            onClick={onToggleEditMode}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer ${
              isEditMode
                ? 'bg-[#8DC63F] text-slate-950 hover:bg-[#72a330]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Live Edit Mode: {isEditMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Direct link to Command Centre */}
          <Link
            href="/portal/executive"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white transition"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Executive Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
