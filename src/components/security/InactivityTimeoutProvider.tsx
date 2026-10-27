'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Lock,
  Clock,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  LogOut,
  Sparkles,
  X,
  CheckCircle2,
} from 'lucide-react';

export const TIMEOUT_OPTIONS = [
  { sec: 15, label: '15 seconds (Test / Instant Lock)' },
  { sec: 30, label: '30 seconds' },
  { sec: 45, label: '45 seconds' },
  { sec: 60, label: '60 seconds (1 min)' },
  { sec: 300, label: '5 minutes' },
  { sec: 600, label: '10 minutes' },
  { sec: 900, label: '15 minutes (Institutional Standard)' },
  { sec: 1800, label: '30 minutes' },
];

interface InactivityTimeoutContextType {
  timeoutSec: number;
  setTimeoutSec: (sec: number) => void;
  resetTimer: () => void;
  openPinSetupModal: () => void;
  hasPin: boolean;
}

const InactivityTimeoutContext = createContext<InactivityTimeoutContextType | null>(null);

export function useInactivityTimeout() {
  const ctx = useContext(InactivityTimeoutContext);
  if (!ctx) {
    throw new Error('useInactivityTimeout must be used within InactivityTimeoutProvider');
  }
  return ctx;
}

export function InactivityTimeoutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/apply') ||
    pathname.startsWith('/login') ||
    pathname === '/offline.html';

  const [timeoutSec, setTimeoutSecState] = useState<number>(900); // Default 15 mins
  const [secondsRemaining, setSecondsRemaining] = useState<number>(900);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [hasPin, setHasPin] = useState<boolean>(false);

  // Quick PIN unlock state inside timeout warning
  const [unlockPin, setUnlockPin] = useState<string>('');
  const [unlockError, setUnlockError] = useState<string>('');
  const [unlockBusy, setUnlockBusy] = useState<boolean>(false);

  // Setup PIN state
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [currentPwd, setCurrentPwd] = useState<string>('');
  const [setupNotice, setSetupNotice] = useState<string>('');
  const [setupError, setSetupError] = useState<string>('');
  const [setupBusy, setSetupBusy] = useState<boolean>(false);

  const lastActivityRef = useRef<number>(Date.now());
  const warningThresholdSec = timeoutSec <= 30 ? 10 : 20;

  // Hydrate timeout preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nwuchas_inactivity_timeout_sec');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) {
          setTimeoutSecState(parsed);
          setSecondsRemaining(parsed);
        }
      }
    } catch {}

    // Check if user has PIN
    if (!isPublicRoute) {
      fetch('/api/auth/pin')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.success && data.hasPin) {
            setHasPin(true);
          }
        })
        .catch(() => {});
    }
  }, [isPublicRoute]);

  const updateTimeoutSec = (sec: number) => {
    setTimeoutSecState(sec);
    setSecondsRemaining(sec);
    lastActivityRef.current = Date.now();
    try {
      localStorage.setItem('nwuchas_inactivity_timeout_sec', String(sec));
    } catch {}
  };

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setSecondsRemaining(timeoutSec);
    if (showWarningModal) {
      setShowWarningModal(false);
      setUnlockPin('');
      setUnlockError('');
    }
  }, [timeoutSec, showWarningModal]);

  // Global activity listener
  useEffect(() => {
    if (isPublicRoute) return;

    let throttleTimer: NodeJS.Timeout | null = null;
    const handleUserActivity = () => {
      if (!throttleTimer) {
        throttleTimer = setTimeout(() => {
          lastActivityRef.current = Date.now();
          throttleTimer = null;
        }, 800);
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [isPublicRoute]);

  // Main countdown interval (checks every 1s)
  useEffect(() => {
    if (isPublicRoute) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, timeoutSec - elapsed);
      setSecondsRemaining(remaining);

      // Warning phase
      if (remaining <= warningThresholdSec && remaining > 0) {
        setShowWarningModal(true);
      } else if (remaining > warningThresholdSec && showWarningModal) {
        setShowWarningModal(false);
      }

      // Expired: Trigger auto-logout
      if (remaining <= 0) {
        clearInterval(interval);
        handleAutoLogout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeoutSec, warningThresholdSec, isPublicRoute, showWarningModal]);

  const handleAutoLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setShowWarningModal(false);
    router.push('/login?reason=timeout');
  };

  const handleQuickUnlockWithPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockBusy(true);
    setUnlockError('');

    try {
      // In session, verify PIN
      const res = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', pin: unlockPin, email: 'current' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setUnlockError(data.message || 'Incorrect PIN. Please re-enter or log out.');
        setUnlockBusy(false);
        return;
      }

      // Success
      resetTimer();
    } catch (err: any) {
      setUnlockError(err.message || 'Verification error');
    } finally {
      setUnlockBusy(false);
    }
  };

  const handleSavePinSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupBusy(true);
    setSetupError('');
    setSetupNotice('');

    if (newPin !== confirmPin) {
      setSetupError('PIN confirmation does not match.');
      setSetupBusy(false);
      return;
    }

    if (!/^\d{4,6}$/.test(newPin)) {
      setSetupError('PIN must consist of 4 to 6 numbers (0-9).');
      setSetupBusy(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setup',
          pin: newPin,
          currentPassword: currentPwd,
          timeoutSec,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setSetupError(data.message || 'Failed to save PIN.');
        setSetupBusy(false);
        return;
      }

      setHasPin(true);
      setSetupNotice('Quick Login PIN configured successfully!');
      setTimeout(() => {
        setShowPinModal(false);
        setNewPin('');
        setConfirmPin('');
        setCurrentPwd('');
        setSetupNotice('');
      }, 1500);
    } catch (err: any) {
      setSetupError(err.message || 'Network error');
    } finally {
      setSetupBusy(false);
    }
  };

  return (
    <InactivityTimeoutContext.Provider
      value={{
        timeoutSec,
        setTimeoutSec: updateTimeoutSec,
        resetTimer,
        openPinSetupModal: () => setShowPinModal(true),
        hasPin,
      }}
    >
      {children}

      {/* 1. INACTIVITY WARNING & PIN UNLOCK MODAL */}
      {showWarningModal && !isPublicRoute && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-amber-400/40 bg-white p-6 shadow-2xl text-slate-900">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-700 animate-pulse shrink-0">
                <ShieldAlert size={26} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Session Inactivity Lock</h3>
                <p className="text-xs text-slate-500">Security watchdog active</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                Session Auto-Terminating In:
              </span>
              <div className="mt-2 text-4xl font-black font-mono text-amber-950 tracking-tight">
                00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}
              </div>
              <p className="mt-2 text-xs text-amber-800">
                To prevent unauthorized campus terminal access, this workstation will be logged out unless activity is confirmed.
              </p>
            </div>

            {/* Quick PIN Unlock Option */}
            {hasPin && (
              <form onSubmit={handleQuickUnlockWithPin} className="mt-4 space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Quick Unlock with PIN (4-6 digits)
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    maxLength={6}
                    value={unlockPin}
                    onChange={(e) => setUnlockPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-center text-lg font-mono tracking-widest focus:border-cyan-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={unlockBusy || unlockPin.length < 4}
                    className="rounded-xl bg-cyan-700 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-800 transition disabled:opacity-50"
                  >
                    Unlock
                  </button>
                </div>
                {unlockError && <p className="text-[11px] text-rose-600 font-semibold">{unlockError}</p>}
              </form>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={resetTimer}
                className="w-full flex-1 rounded-xl bg-[#007B99] py-2.5 text-xs font-bold text-white hover:bg-[#006077] transition shadow-xs cursor-pointer"
              >
                I Am Active (Stay Logged In)
              </button>
              <button
                type="button"
                onClick={handleAutoLogout}
                className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <LogOut size={14} className="inline mr-1" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. SETUP QUICK LOGIN PIN MODAL */}
      {showPinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-teal-100 text-teal-800">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Quick Login PIN Setup</h3>
                  <p className="text-[10px] text-slate-500">Fast authentication for campus terminals</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X size={18} />
              </button>
            </div>

            {setupNotice ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center text-xs text-emerald-900 flex items-center justify-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span className="font-bold">{setupNotice}</span>
              </div>
            ) : (
              <form onSubmit={handleSavePinSetup} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Current Password (for security verification)
                  </label>
                  <input
                    type="password"
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      New PIN (4-6 Digits)
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      required
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 2026"
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-center text-base font-mono tracking-widest text-slate-900 focus:border-cyan-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Confirm PIN
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      required
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 2026"
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-center text-base font-mono tracking-widest text-slate-900 focus:border-cyan-600 focus:outline-none"
                    />
                  </div>
                </div>

                {setupError && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-800 text-[11px] font-semibold">
                    {setupError}
                  </div>
                )}

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600">
                  <p className="font-semibold text-slate-800">Why configure a Quick PIN?</p>
                  <p className="mt-0.5">
                    Your Quick PIN enables rapid session unlocking on shared hospital wards and campus computers without typing lengthy passwords.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowPinModal(false)}
                    className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={setupBusy || newPin.length < 4}
                    className="rounded-xl bg-[#007B99] px-5 py-2 font-bold text-white hover:bg-[#006077] transition disabled:opacity-50"
                  >
                    {setupBusy ? 'Saving PIN...' : 'Save Quick PIN'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </InactivityTimeoutContext.Provider>
  );
}

/**
 * Top Navbar Inactivity Security Widget with Configurable Dropdown
 */
export function InactivityAutoLockWidget() {
  const { timeoutSec, setTimeoutSec, openPinSetupModal, hasPin } = useInactivityTimeout();
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const currentOption = TIMEOUT_OPTIONS.find((o) => o.sec === timeoutSec) || TIMEOUT_OPTIONS[6];

  return (
    <div className="relative" ref={widgetRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:border-[#007B99] hover:bg-sky-50/50 transition cursor-pointer"
        title="Configurable Session Inactivity Lockout"
      >
        <Lock size={12} className="text-[#007B99]" />
        <span className="hidden sm:inline">Auto-Lock:</span>
        <span className="font-mono text-cyan-800">
          {timeoutSec < 60 ? `${timeoutSec}s` : `${Math.floor(timeoutSec / 60)}m`}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl z-50 text-xs text-slate-900 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-600">
              Security Inactivity Auto-Lock
            </span>
            <button type="button" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-700">
              <X size={14} />
            </button>
          </div>

          <p className="text-[11px] text-slate-500 mb-2.5 leading-relaxed">
            Automatically lock institutional terminal if no mouse, keyboard, or touch input is detected:
          </p>

          <div className="space-y-1">
            {TIMEOUT_OPTIONS.map((opt) => {
              const isSelected = opt.sec === timeoutSec;
              return (
                <button
                  key={opt.sec}
                  type="button"
                  onClick={() => {
                    setTimeoutSec(opt.sec);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-50 font-bold text-cyan-900 border border-cyan-200'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <CheckCircle2 size={13} className="text-cyan-700" />}
                </button>
              );
            })}
          </div>

          <div className="mt-3 border-t border-slate-100 pt-2.5">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openPinSetupModal();
              }}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-teal-300 bg-teal-50/70 py-1.5 text-[11px] font-bold text-teal-900 hover:bg-teal-100 transition cursor-pointer"
            >
              <KeyRound size={13} className="text-teal-700" />
              <span>{hasPin ? 'Change Quick Login PIN' : 'Set Up Quick Login PIN'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 1-Click Top Navbar Quick PIN Setup / Change Button
 */
export function QuickPinTopBarButton() {
  const { openPinSetupModal, hasPin } = useInactivityTimeout();
  return (
    <button
      type="button"
      onClick={openPinSetupModal}
      className="inline-flex items-center gap-1.5 rounded-full border border-teal-300 bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-800 hover:bg-teal-100 transition shadow-2xs cursor-pointer"
      title="Setup or Change your 4-6 Digit Quick Login PIN"
    >
      <KeyRound size={12} className="text-teal-700" />
      <span className="hidden sm:inline">{hasPin ? 'PIN Active' : 'Setup PIN'}</span>
    </button>
  );
}
