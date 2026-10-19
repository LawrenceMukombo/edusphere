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
    <div className="w-full bg-slate-950 text-white border-b border-slate-800 text-xs py-1.5 px-3 sm:px-6 lg:px-8 select-none z-30 relative shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left: Active Staff Profile & Role Switcher */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition text-slate-100 font-bold"
              title="Click to switch simulated staff role"
            >
              <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-white text-xs truncate max-w-[140px] sm:max-w-none">{currentUser.fullName}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-900 text-blue-200 uppercase font-black tracking-wider shrink-0">
                {currentUser.role.replace(/_/g, ' ')}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
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
              </div>
            )}
          </div>

          {/* Active Term Indicator */}
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/80 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            2026 Term 3 • Week 8
          </span>
        </div>

        {/* Right: Aligned Compact Date & Live Ticking Clock (Space Saving) */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex items-center gap-2 text-slate-300 font-mono text-[11px] sm:text-xs bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800 shadow-inner">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <span className="text-slate-600 font-sans">|</span>
            <div className="flex items-center gap-1.5 text-amber-300 font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
              <span className="tabular-nums">{formattedTime}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
