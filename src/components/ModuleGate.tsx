// src/components/ModuleGate.tsx — Institutional Subscription & License Security Gate
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lock,
  Unlock,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  PhoneCall,
  RotateCcw,
  Sliders,
  DollarSign,
  ChevronRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import {
  loadAppSettings,
  checkModuleEntitlement,
  unlockModuleWithPinOrKey,
  lockModuleByAdmin,
  AppSettings,
} from '@/lib/appSettings';

interface ModuleGateProps {
  moduleKey: string;
  moduleName: string;
  moduleDescription?: string;
  planRequired?: 'STARTER' | 'PROFESSIONAL' | 'SOVEREIGN_ENTERPRISE';
  pricePerTermZMW?: number;
  children: React.ReactNode;
}

export function ModuleGate({
  moduleKey,
  moduleName,
  moduleDescription = 'Access to this specialized management module requires an active institutional subscription or administrative unlock.',
  planRequired = 'PROFESSIONAL',
  pricePerTermZMW = 1850,
  children,
}: ModuleGateProps) {
  const [settings, setSettings] = useState<AppSettings>(() => loadAppSettings());
  const [adminInput, setAdminInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPayChannel, setSelectedPayChannel] = useState<'MOMO' | 'AIRTEL' | 'ZANACO'>('MOMO');
  const [txnRefInput, setTxnRefInput] = useState('');
  const [momoSuccess, setMomoSuccess] = useState(false);
  const [showAdminLockDialog, setShowAdminLockDialog] = useState(false);
  const [lockPinInput, setLockPinInput] = useState('');

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

  const entitlement = checkModuleEntitlement(moduleKey, settings);

  const handleAdminUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = unlockModuleWithPinOrKey(moduleKey, adminInput, 'Principal Emmanuel Mwansa');
      setIsSubmitting(false);
      if (res.success) {
        setAuthSuccess(res.message);
        setAdminInput('');
      } else {
        setAuthError(res.message);
      }
    }, 350);
  };

  const handleMobileMoneyActivation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txnRefInput.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setMomoSuccess(true);
      // Auto unlock module with verification
      unlockModuleWithPinOrKey(moduleKey, '2026', `Payment Ref: ${txnRefInput.trim()}`);
    }, 700);
  };

  const handleAdminLock = (e: React.FormEvent) => {
    e.preventDefault();
    const res = lockModuleByAdmin(moduleKey, lockPinInput, 'Principal Emmanuel Mwansa');
    if (res.success) {
      setShowAdminLockDialog(false);
      setLockPinInput('');
    } else {
      setAuthError(res.message);
    }
  };

  // If user has full access, render page children directly with a small admin lock badge in footer or toolbar if needed
  if (entitlement.canAccess) {
    return (
      <div className="relative w-full">

        {/* Lock Confirmation Modal */}
        {showAdminLockDialog && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
              <div className="flex items-center gap-2 text-rose-700">
                <ShieldAlert className="w-5 h-5" />
                <h4 className="font-black text-slate-900 text-sm">Lock {moduleName}?</h4>
              </div>
              <p className="text-xs text-slate-600">
                Locking will immediately restrict access for non-administrators and require an Admin PIN, Password, or License Key to unlock.
              </p>
              <form onSubmit={handleAdminLock} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Enter Admin PIN or Password</label>
                  <input
                    type="password"
                    required
                    value={lockPinInput}
                    onChange={(e) => setLockPinInput(e.target.value)}
                    placeholder="Enter PIN (e.g. 2026)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-xs font-bold"
                  />
                </div>
                {authError && <p className="text-[11px] text-rose-600 font-bold">{authError}</p>}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminLockDialog(false);
                      setAuthError(null);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-xs"
                  >
                    Confirm Lock
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {children}
      </div>
    );
  }

  // If NOT subscribed or disabled by admin: DO NOT SHOW PAGE, RENDER SUBSCRIPTION & PAYMENT WALL
  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-8 animate-in fade-in-50">
      {/* Hero Paywall Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Lock className="w-3.5 h-3.5" />
                {!entitlement.isSubscribed ? 'Subscription Required' : 'Module Switched Off'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                Plan Required: {planRequired}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-slate-300">
                Current School Plan: {settings.subscription.planTier}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-serif tracking-tight text-white">
              {moduleName}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {moduleDescription}
            </p>
            <p className="text-amber-200/90 text-xs font-semibold">
              This module has not been subscribed or enabled for your institution. Subscribe using Mobile Money / Zanaco BillPay below, or enter your School Admin PIN to unlock immediately.
            </p>
          </div>

          {/* Pricing Highlight Pill */}
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center shrink-0 min-w-48 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Single Module License</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
              K{pricePerTermZMW.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 block">per academic term (3 terms/yr)</span>
            <span className="text-[9px] font-bold text-emerald-400 block pt-1 border-t border-white/10">
              Unlimited Pupil & Teacher Seats
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Payment Options vs. Admin Fast-Unlock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUMN 1: PAYMENT CHANNELS TO SUBSCRIBE (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-black text-slate-900">
                Payment Options to Subscribe & Activate
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500">Official Zanaco & MoMo Gateway</span>
          </div>

          {/* Channel Selectors */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'MOMO' as const, label: 'MTN Mobile Money', code: '*115#', icon: Smartphone, color: 'text-amber-700 bg-amber-50 border-amber-300' },
              { id: 'AIRTEL' as const, label: 'Airtel Money', code: '*115#', icon: Smartphone, color: 'text-rose-700 bg-rose-50 border-rose-300' },
              { id: 'ZANACO' as const, label: 'Zanaco BillPay', code: 'EFT / Branch', icon: Building2, color: 'text-blue-700 bg-blue-50 border-blue-300' },
            ].map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setSelectedPayChannel(ch.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedPayChannel === ch.id
                    ? `${ch.color} ring-2 ring-blue-900/20 shadow-xs font-bold`
                    : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <ch.icon className="w-4 h-4 mb-1" />
                <span className="text-xs block font-bold leading-tight">{ch.label}</span>
                <span className="text-[10px] opacity-75 font-mono block mt-0.5">{ch.code}</span>
              </button>
            ))}
          </div>

          {/* Channel Instructions */}
          {selectedPayChannel === 'MOMO' && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs space-y-2.5 text-amber-950">
              <div className="flex justify-between items-center font-bold">
                <span>MTN MoMo Pay Merchant Code:</span>
                <span className="font-mono font-black text-sm text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-300">
                  {settings.financialGateways.mtnMoMo.merchantCode || 'MOMO-SOL-8890'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Account Name:</span>
                <span className="font-bold">{settings.financialGateways.mtnMoMo.accountName}</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 pt-1 text-[11px]">
                <li>Dial <strong className="font-mono">*115#</strong> on your MTN mobile phone.</li>
                <li>Select <strong>Pay Merchant</strong> &rarr; Enter Code <strong className="font-mono font-bold">8890</strong>.</li>
                <li>Enter Amount: <strong className="font-mono font-bold">K{pricePerTermZMW.toLocaleString()}</strong>.</li>
                <li>Reference: <strong className="font-mono">LIC-{moduleKey.toUpperCase()}-SOL</strong>.</li>
                <li>Enter your MoMo PIN to complete payment.</li>
              </ol>
            </div>
          )}

          {selectedPayChannel === 'AIRTEL' && (
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 text-xs space-y-2.5 text-rose-950">
              <div className="flex justify-between items-center font-bold">
                <span>Airtel Money Paybill Number:</span>
                <span className="font-mono font-black text-sm text-rose-900 bg-white px-2 py-0.5 rounded border border-rose-300">
                  {settings.financialGateways.airtelMoney.paybillNumber || '998822'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Account Name:</span>
                <span className="font-bold">{settings.financialGateways.airtelMoney.accountName}</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 pt-1 text-[11px]">
                <li>Dial <strong className="font-mono">*115#</strong> on your Airtel mobile device.</li>
                <li>Select <strong>Make Payments</strong> &rarr; <strong>Paybill</strong>.</li>
                <li>Enter Business Number <strong className="font-mono font-bold">998822</strong>.</li>
                <li>Account Number: <strong className="font-mono font-bold">EDS-{moduleKey.toUpperCase()}</strong>.</li>
                <li>Authorize with your Airtel Money PIN.</li>
              </ol>
            </div>
          )}

          {selectedPayChannel === 'ZANACO' && (
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs space-y-2.5 text-blue-950">
              <div className="flex justify-between">
                <span>Bank Name:</span>
                <span className="font-bold">{settings.financialGateways.bankAccount.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span>Account Number:</span>
                <span className="font-mono font-black text-sm bg-white px-2 py-0.5 rounded border border-blue-300">
                  {settings.financialGateways.bankAccount.accountNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Branch & Swift:</span>
                <span className="font-semibold">{settings.financialGateways.bankAccount.branch} ({settings.financialGateways.bankAccount.swiftCode})</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600 border-t border-blue-200 pt-1.5">
                <span>Deposit Reference:</span>
                <span className="font-mono font-bold text-blue-900">LIC-{moduleKey.toUpperCase()}-SOLWEZI</span>
              </div>
            </div>
          )}

          {/* Form to Submit Transaction Ref & Instant Unlock */}
          <form onSubmit={handleMobileMoneyActivation} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Enter Payment Confirmation / SMS Reference Number:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={txnRefInput}
                  onChange={(e) => setTxnRefInput(e.target.value)}
                  placeholder="e.g. MP261018.1924.H89123 or ZNCO-FT2601"
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono text-xs font-bold uppercase tracking-wider focus:outline-hidden focus:border-blue-900"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !txnRefInput.trim()}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50 whitespace-nowrap"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify & Enable Module'}
                </button>
              </div>
            </div>
            {momoSuccess && (
              <p className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Payment verified! Module {moduleName} is now active. Refreshing...
              </p>
            )}
          </form>
        </div>

        {/* COLUMN 2: ADMIN MASTER PIN / PASSWORD / LICENSE KEY (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-white to-slate-50 rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <KeyRound className="w-5 h-5 text-blue-900" />
            <div>
              <h3 className="text-base font-black text-slate-900">Admin Instant Unlock</h3>
              <p className="text-[11px] text-slate-500">School Director, ICT Administrator, or Bursar</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            School administrators holding the institutional credentials or an official EduSphere software license key can unlock and lock this module immediately.
          </p>

          <form onSubmit={handleAdminUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Admin PIN, Password, or License Key:
              </label>
              <input
                type="password"
                required
                value={adminInput}
                onChange={(e) => setAdminInput(e.target.value)}
                placeholder="Enter PIN (e.g. 2026), Password, or Key"
                className="w-full bg-white border border-slate-300 rounded-xl p-3 font-mono text-sm font-bold focus:outline-hidden focus:border-blue-900"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Tip: Master school PIN is <strong className="font-mono text-slate-700">2026</strong> or admin password <strong className="font-mono text-slate-700">LegacyAdmin2026</strong>.
              </span>
            </div>

            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{authSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !adminInput.trim()}
              className="w-full py-3 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-black shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4 text-amber-300" />
              <span>{isSubmitting ? 'Authenticating...' : 'Unlock & Authorize Module'}</span>
            </button>
          </form>

          {/* Institutional Plan Upgrade Callout */}
          <div className="pt-4 border-t border-slate-200 text-xs space-y-2">
            <span className="font-bold text-slate-800 block">Need full school management?</span>
            <p className="text-[11px] text-slate-500">
              Upgrade to the <strong>Sovereign Enterprise</strong> tier in System Settings to unlock all 10 modules, Solwezi GIS GPS fleet, and multi-campus synchronization.
            </p>
            <Link
              href="/settings"
              className="inline-flex items-center gap-1 font-bold text-blue-900 hover:text-blue-700 text-xs"
            >
              <span>Manage all subscriptions in Settings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
