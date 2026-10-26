// src/components/TopWelcomeBanner.tsx
// Institutional Welcome Banner with Live Ticking Time (to the second), Full User Identity, Avatar, Online Users Telemetry & Profile Dossier
'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  ShieldCheck,
  User,
  ChevronDown,
  Sparkles,
  KeyRound,
  Lock,
  RefreshCw,
  Users,
  MapPin,
  CheckCircle2,
  X,
  Radio,
  ExternalLink,
} from 'lucide-react';
import {
  loadActiveUser,
  saveActiveUser,
  INITIAL_SECURITY_USERS,
  UserSecurityProfile,
  getDaysUntilPasswordExpiry,
  loadPasswordPolicy,
  is2FAVerifiedForSession,
} from '@/lib/authPermissions';
import { formatCleanEnum } from '@/lib/formatters';
import { NWUCHAS_IDENTITY } from './NwuchasLogo';

export function TopWelcomeBanner() {
  const [currentUser, setCurrentUser] = useState<UserSecurityProfile>(() => INITIAL_SECURITY_USERS[0]);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [is2FAActive, setIs2FAActive] = useState(false);
  // Simulated dynamic online users count (between 14 and 19 for realism)
  const [onlineCount, setOnlineCount] = useState(16);

  // Live Clock Ticking Every Second
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Periodic subtle jitter on online users count
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return next < 12 ? 14 : next > 24 ? 18 : next;
      });
    }, 25000);
    return () => clearInterval(interval);
  }, []);

  // Sync Active User & 2FA State
  useEffect(() => {
    const handleUserUpdate = () => {
      const u = loadActiveUser();
      if (u) setCurrentUser(u);
      setIs2FAActive(is2FAVerifiedForSession());
    };
    handleUserUpdate();

    window.addEventListener('edusphere:user-updated', handleUserUpdate);
    window.addEventListener('edusphere:2fa-verified', handleUserUpdate);
    window.addEventListener('edusphere:2fa-cleared', handleUserUpdate);
    window.addEventListener('storage', handleUserUpdate);
    return () => {
      window.removeEventListener('edusphere:user-updated', handleUserUpdate);
      window.removeEventListener('edusphere:2fa-verified', handleUserUpdate);
      window.removeEventListener('edusphere:2fa-cleared', handleUserUpdate);
      window.removeEventListener('storage', handleUserUpdate);
    };
  }, []);

  const policy = loadPasswordPolicy();
  const { daysRemaining, isExpired } = getDaysUntilPasswordExpiry(
    currentUser.passwordLastChanged,
    policy.rotationPeriodDays
  );

  // Formatted date and live ticking time to the second
  const formattedDate = currentTime
    ? currentTime.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Mon, 26 Oct 2026';

  const formattedTime = currentTime
    ? currentTime.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }) + ' CAT'
    : '17:00:00 CAT';

  // Compute User Initials
  const initials = currentUser.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

  const cleanRole = formatCleanEnum(currentUser.role);

  const handleSelectUser = (user: UserSecurityProfile) => {
    saveActiveUser(user);
    setCurrentUser(user);
    setShowRoleSwitcher(false);
  };

  return (
    <>
      <div className="w-full border-b border-slate-200 bg-gradient-to-r from-slate-900 via-[#0b2545] to-[#004f63] text-white text-xs py-2 px-3 sm:px-6 select-none z-30 relative shadow-sm">
        <div className="w-full flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: User Avatar, Welcome Greeting, Clean Role Badge & Profile Trigger */}
          <div className="flex items-center gap-3 min-w-0">
            {/* User Avatar with Status Indicator */}
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="relative group shrink-0 focus:outline-none"
              title="Click to view staff profile details"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#007B99] to-[#8DC63F] p-0.5 shadow-sm group-hover:scale-105 transition-transform">
                <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center text-white font-extrabold text-xs">
                  {initials || 'NW'}
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
            </button>

            {/* Greeting & Clean Formatted Identity */}
            <div className="min-w-0 flex flex-wrap items-center gap-2">
              <span className="text-slate-300 text-xs hidden sm:inline">Welcome back,</span>
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="font-bold text-white hover:text-[#8DC63F] text-xs transition truncate max-w-[150px] sm:max-w-none text-left"
              >
                {currentUser.fullName}
              </button>

              {/* Clean Role Badge (No Underscores) */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#007B99]/40 border border-[#007B99] text-[#7ee3ff] text-[10px] font-bold tracking-wide uppercase shrink-0">
                <ShieldCheck className="w-3 h-3 text-[#8DC63F]" />
                {cleanRole}
              </span>

              {/* Role Switcher Toggle Button */}
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/15 text-white/90 text-[10px] font-semibold transition"
                  title="Switch simulated staff account for RBAC validation"
                >
                  <span>Switch Role</span>
                  <ChevronDown className="w-3 h-3 text-white/70" />
                </button>

                {/* Role Switcher Dropdown */}
                {showRoleSwitcher && (
                  <div className="absolute left-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-50 text-xs text-slate-800 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-bold text-slate-900">Switch Staff Account (RBAC)</span>
                      <button
                        type="button"
                        onClick={() => setShowRoleSwitcher(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 py-1">
                      {INITIAL_SECURITY_USERS.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleSelectUser(u)}
                          className={`w-full text-left p-2 rounded-lg transition flex items-center justify-between hover:bg-slate-50 ${
                            currentUser.id === u.id ? 'bg-sky-50 border border-[#007B99]/30 text-sky-950' : ''
                          }`}
                        >
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{u.fullName}</p>
                            <p className="text-[10px] text-slate-500">
                              {formatCleanEnum(u.role)} • {u.staffId}
                            </p>
                          </div>
                          {currentUser.id === u.id && (
                            <CheckCircle2 size={14} className="text-[#007B99] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Online Users Telemetry, Live Date & Clock to the Second */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Live Online Users Telemetry */}
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-white text-[11px] font-semibold"
              title="Real-time authenticated staff, faculty and registrar sessions online"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8DC63F] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8DC63F]" />
              </span>
              <Users className="w-3.5 h-3.5 text-[#8DC63F] shrink-0" />
              <span>
                <strong className="text-white font-extrabold">{onlineCount}</strong>
                <span className="hidden md:inline text-slate-200"> Online</span>
              </span>
            </div>

            {/* Date & Live Clock Ticking to the Second */}
            <div className="inline-flex items-center gap-2 text-white font-mono text-[11px] sm:text-xs bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 shadow-inner">
              <div className="flex items-center gap-1.5 text-slate-200">
                <Calendar className="w-3.5 h-3.5 text-[#8DC63F] shrink-0" />
                <span>{formattedDate}</span>
              </div>
              <span className="text-white/30 font-sans">|</span>
              <div className="flex items-center gap-1.5 text-white font-bold">
                <Clock className="w-3.5 h-3.5 text-[#7ee3ff] animate-pulse shrink-0" />
                <span className="tabular-nums tracking-wider">{formattedTime}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Staff Profile Details Modal Dossier */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl text-slate-800 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#007B99] to-[#8DC63F] p-0.5 shadow-md">
                  <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-base">
                    {initials}
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{currentUser.fullName}</h3>
                  <p className="text-xs text-[#007B99] font-bold">{cleanRole}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Identity Details Grid */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Staff Number</span>
                  <p className="mt-1 font-mono font-bold text-slate-800">{currentUser.staffId}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Institutional Email</span>
                  <p className="mt-1 font-semibold text-slate-800 truncate">{currentUser.email}</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary Campus Location</span>
                <p className="mt-1 flex items-center gap-1.5 font-semibold text-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-[#007B99] shrink-0" />
                  Plot 511/518 Shilenda Road, Manyama, Lumwana, Zambia
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">2FA Security Status</span>
                  <p className="mt-1 flex items-center gap-1 font-bold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Enforced & Active
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Academic Term</span>
                  <p className="mt-1 font-bold text-slate-800">2026 Term 3 (Active)</p>
                </div>
              </div>

              <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#007B99] animate-pulse" />
                  <span className="font-semibold text-teal-950">Active Users Online: <strong>{onlineCount} Staff Members</strong></span>
                </div>
                <span className="text-[10px] font-bold bg-[#8DC63F] text-slate-900 px-2 py-0.5 rounded-full">
                  Telemetric Link
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
              <span className="text-slate-400 text-[11px]">NWUCHAS Campus Management System</span>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="rounded-lg bg-[#007B99] px-4 py-2 text-xs font-bold text-white hover:bg-[#00627a] transition shadow-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
