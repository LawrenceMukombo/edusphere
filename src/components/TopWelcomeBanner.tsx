// src/components/TopWelcomeBanner.tsx
// Persistent Institutional Welcome Banner with Live Ticking Time, Full User Identity, Granular Role Badge & Security Status
'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  User,
  ChevronDown,
  Sparkles,
  KeyRound,
  Lock,
  RefreshCw,
  Award,
  AlertTriangle,
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
import { useCampus } from './CampusContext';

export function TopWelcomeBanner() {
  const { campusInfo } = useCampus();
  const [currentUser, setCurrentUser] = useState<UserSecurityProfile>(() => loadActiveUser());
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [is2FAActive, setIs2FAActive] = useState(false);

  // Live Clock Ticking Every Second
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync Active User & 2FA State
  useEffect(() => {
    const handleUserUpdate = () => {
      const u = loadActiveUser();
      setCurrentUser(u);
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

  // Formatted date and live ticking time
  const formattedDate = currentTime
    ? currentTime.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Mon, 19 Oct 2026';

  const formattedTime = currentTime
    ? currentTime.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }) + ' CAT'
    : '08:00:00 CAT';

  const handleSelectUser = (user: UserSecurityProfile) => {
    saveActiveUser(user);
    setCurrentUser(user);
    setShowRoleSwitcher(false);
  };

  return (
    <div className="w-full bg-slate-950 text-white border-b border-slate-800 text-xs py-2 px-4 sm:px-6 lg:px-8 select-none z-50 sticky top-0 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        {/* Left: Institutional Welcome & Full Logged-in User Identity */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse ring-4 ring-emerald-500/20" />
            <span className="font-semibold text-slate-400 hidden sm:inline">Welcome back,</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition text-slate-100 font-bold"
                title="Click to switch simulated staff role"
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-white text-xs">{currentUser.fullName}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-900 text-blue-200 uppercase font-black tracking-wider">
                  {currentUser.role.replace(/_/g, ' ')}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Role Switcher Dropdown */}
              {showRoleSwitcher && (
                <div className="absolute left-0 top-full mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 border-b border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-slate-200">Simulate Staff Account</span>
                    <span className="text-[10px] text-slate-400">RBAC Testing</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/60 py-1">
                    {INITIAL_SECURITY_USERS.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSelectUser(u)}
                        className={`w-full text-left p-2 rounded-xl transition flex items-center justify-between hover:bg-slate-800 ${
                          currentUser.id === u.id ? 'bg-blue-950/80 border border-blue-800/80' : ''
                        }`}
                      >
                        <div>
                          <p className="font-bold text-white text-xs">{u.fullName}</p>
                          <p className="text-[10px] text-slate-400">
                            {u.role.replace(/_/g, ' ')} • {u.staffId}
                          </p>
                        </div>
                        {u.role.includes('FINANCE') || u.role === 'BURSAR' || u.role === 'SUPER_ADMIN' ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                            2FA Req
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                  <div className="p-2 border-t border-slate-800 bg-slate-950/60 rounded-b-xl text-[10px] text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Granular permissions and 2FA adapt automatically based on role.</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Synthetic Demo Mode Indicator (SEC-001) */}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Synthetic Demo • Zero Real Data</span>
          </span>

          {/* Security & 2FA Indicator */}
          <div className="hidden lg:flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                currentUser.role.includes('FINANCE') || currentUser.role === 'BURSAR'
                  ? is2FAActive
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                    : 'bg-rose-950/80 text-rose-300 border-rose-700/80 animate-pulse'
                  : 'bg-blue-950/80 text-blue-300 border-blue-700/80'
              }`}
            >
              {currentUser.role.includes('FINANCE') || currentUser.role === 'BURSAR' ? (
                is2FAActive ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Finance 2FA Verified</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3 h-3 text-rose-400" />
                    <span>Finance 2FA Required</span>
                  </>
                )
              ) : (
                <>
                  <ShieldCheck className="w-3 h-3 text-blue-400" />
                  <span>Authenticated Session</span>
                </>
              )}
            </span>

            {/* Strict Password Expiry Pill */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                isExpired
                  ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                  : daysRemaining <= 5
                  ? 'bg-amber-950 text-amber-300 border-amber-700'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
              title={`Staff password rotation policy: 30 days. Last changed: ${new Date(
                currentUser.passwordLastChanged
              ).toLocaleDateString()}`}
            >
              <KeyRound className="w-3 h-3" />
              <span>
                {isExpired
                  ? 'Password Expired (Reset Req)'
                  : `Password: ${daysRemaining}d left`}
              </span>
            </span>
          </div>
        </div>

        {/* Right: Real-Time Live Ticking Date & Clock in CAT */}
        <div className="flex items-center gap-3 text-right">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold">{formattedDate}</span>
          </div>

          <span className="text-slate-600 hidden sm:inline">•</span>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/90 text-amber-300 border border-blue-800/80 font-mono font-black tracking-wider text-xs shadow-inner">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="tabular-nums">{formattedTime}</span>
          </div>

          <div className="hidden xl:flex items-center gap-1 text-[11px] text-slate-400 pl-2 border-l border-slate-800">
            <span>Term 1 Wk 8</span>
          </div>
        </div>

      </div>
    </div>
  );
}
