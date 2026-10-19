// src/components/admin/PasswordPolicyManager.tsx
// Institutional Password Policy, Monthly Rotation Period & 2FA Governance
'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  KeyRound,
  Sliders,
  Check,
  X,
  Smartphone,
} from 'lucide-react';
import {
  PasswordPolicyConfig,
  loadPasswordPolicy,
  savePasswordPolicy,
  DEFAULT_PASSWORD_POLICY,
  evaluatePasswordStrength,
} from '@/lib/authPermissions';
import { saveAdminAuditLogs } from '@/lib/appSettings';

export function PasswordPolicyManager() {
  const [policy, setPolicy] = useState<PasswordPolicyConfig>(() => loadPasswordPolicy());
  const [testPassword, setTestPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const testStrength = evaluatePasswordStrength(testPassword, policy);

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    savePasswordPolicy(policy);

    saveAdminAuditLogs([
      {
        id: `aud-pol-${Date.now()}`,
        timestamp: new Date().toLocaleString('en-GB') + ' CAT',
        adminName: 'Platform Security Administrator',
        action: 'SECURITY_POLICY_UPDATE',
        module: 'Security Governance',
        details: `Updated enterprise password policy: Rotation ${policy.rotationPeriodDays} days, MinLength: ${policy.minLength}, 2FA Finance: ${policy.enforce2FAForFinance}.`,
        status: 'SUCCESS',
        ipAddress: '192.168.10.4 (Security Officer Terminal)',
      },
    ]);

    setTimeout(() => {
      setIsSaving(false);
      showToast('Institutional security & password policy updated successfully! 🛡️');
    }, 300);
  };

  const handleReset = () => {
    setPolicy(DEFAULT_PASSWORD_POLICY);
    savePasswordPolicy(DEFAULT_PASSWORD_POLICY);
    showToast('Reset policy to default enterprise standard (30-day rotation).');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-top-4 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Policy Form */}
      <form onSubmit={handleSavePolicy} className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="w-6 h-6 text-blue-900" />
              <h2 className="text-lg font-black text-slate-900">
                Institutional Password Policy & 2FA Controls
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Enforce cryptographic complexity, mandatory monthly password rotation, and two-factor authentication for financial modules.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Defaults</span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5 text-amber-300" />
              <span>{isSaving ? 'Applying Policy...' : 'Save & Enforce Policy'}</span>
            </button>
          </div>
        </div>

        {/* Policy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          
          {/* Column 1: Complexity Requirements */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
              1. Complexity & Length
            </span>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Minimum Password Length</label>
              <select
                value={policy.minLength}
                onChange={(e) => setPolicy({ ...policy, minLength: Number(e.target.value) })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold font-mono"
              >
                <option value={8}>8 Characters (Basic)</option>
                <option value={10}>10 Characters (Enterprise Standard)</option>
                <option value={12}>12 Characters (High Security)</option>
                <option value={16}>16 Characters (Military-Grade)</option>
              </select>
            </div>

            <div className="space-y-2.5 pt-2">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={policy.requireUppercase}
                  onChange={(e) => setPolicy({ ...policy, requireUppercase: e.target.checked })}
                  className="rounded text-blue-900 focus:ring-blue-600 w-4 h-4"
                />
                <span>Require Uppercase Letters (A-Z)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={policy.requireLowercase}
                  onChange={(e) => setPolicy({ ...policy, requireLowercase: e.target.checked })}
                  className="rounded text-blue-900 focus:ring-blue-600 w-4 h-4"
                />
                <span>Require Lowercase Letters (a-z)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={policy.requireNumbers}
                  onChange={(e) => setPolicy({ ...policy, requireNumbers: e.target.checked })}
                  className="rounded text-blue-900 focus:ring-blue-600 w-4 h-4"
                />
                <span>Require Numeric Digits (0-9)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={policy.requireSpecialChars}
                  onChange={(e) => setPolicy({ ...policy, requireSpecialChars: e.target.checked })}
                  className="rounded text-blue-900 focus:ring-blue-600 w-4 h-4"
                />
                <span>Require Special Symbols (!@#$%)</span>
              </label>
            </div>
          </div>

          {/* Column 2: Mandatory Rotation (Strict 30-Day Monthly) */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
              2. Staff Password Rotation & Lifespan
            </span>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Mandatory Staff Password Rotation Period
              </label>
              <select
                value={policy.rotationPeriodDays}
                onChange={(e) => setPolicy({ ...policy, rotationPeriodDays: Number(e.target.value) })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
              >
                <option value={30}>Every 30 Days (Strict Monthly Staff Reset)</option>
                <option value={60}>Every 60 Days (Bi-Monthly)</option>
                <option value={90}>Every 90 Days (Quarterly)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Staff accounts will be flagged as expired once their password age exceeds {policy.rotationPeriodDays} days.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password History Memory</label>
              <select
                value={policy.preventReuseCount}
                onChange={(e) => setPolicy({ ...policy, preventReuseCount: Number(e.target.value) })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
              >
                <option value={3}>Prevent reusing last 3 passwords</option>
                <option value={5}>Prevent reusing last 5 passwords</option>
              </select>
            </div>
          </div>

          {/* Column 3: 2FA & Lockout Rules */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
              3. Finance 2FA & Account Lockout
            </span>

            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
              <label className="flex items-start gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={policy.enforce2FAForFinance}
                  onChange={(e) => setPolicy({ ...policy, enforce2FAForFinance: e.target.checked })}
                  className="rounded text-blue-900 focus:ring-blue-600 w-4 h-4 mt-0.5"
                />
                <div>
                  <span>Enforce 2FA for Finance & Assets</span>
                  <p className="text-[10px] text-slate-500 font-normal mt-0.5">
                    Requires bursars and directors to verify via TOTP/SMS before inspecting fee ledgers or capital assets.
                  </p>
                </div>
              </label>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Max Failed Attempts Before Lockout</label>
              <select
                value={policy.maxFailedAttempts}
                onChange={(e) => setPolicy({ ...policy, maxFailedAttempts: Number(e.target.value) })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
              >
                <option value={3}>3 Attempts</option>
                <option value={5}>5 Attempts (Standard)</option>
                <option value={10}>10 Attempts</option>
              </select>
            </div>
          </div>

        </div>

        {/* Live Policy Interactive Sandbox / Strength Tester */}
        <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-blue-700" />
              <span>Live Interactive Policy Verification Sandbox</span>
            </span>
            <span className="text-slate-500 text-[11px]">Type a test password to verify against active rules</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <input
              type="text"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              placeholder="Test any password here e.g. Solwezi@2026!"
              className="p-3 bg-white border border-blue-300 rounded-xl font-mono text-xs focus:outline-hidden"
            />

            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">Compliance:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    testStrength.meetsPolicy
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {testStrength.meetsPolicy ? 'Compliant ✓' : 'Non-Compliant ✕'}
                </span>
              </div>
              <span className={`font-black ${testStrength.color}`}>{testStrength.label}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
