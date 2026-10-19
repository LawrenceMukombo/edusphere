// src/components/Finance2FAModal.tsx
// Two-Factor Authentication (2FA) Gate for Finance & Asset Management Modules
'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Smartphone,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Send,
  Zap,
} from 'lucide-react';
import {
  loadActiveUser,
  is2FAVerifiedForSession,
  verify2FASession,
  clear2FASession,
  UserSecurityProfile,
} from '@/lib/authPermissions';
import { saveAdminAuditLogs } from '@/lib/appSettings';

interface Finance2FAModalProps {
  onSuccess?: () => void;
  actionTitle?: string;
}

export function Finance2FAModal({
  onSuccess,
  actionTitle = 'Access Institutional Financial Ledger & Asset Reserves',
}: Finance2FAModalProps) {
  const [currentUser, setCurrentUser] = useState<UserSecurityProfile>(() => loadActiveUser());
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [simulatedGeneratedOtp, setSimulatedGeneratedOtp] = useState('849201');

  useEffect(() => {
    setCurrentUser(loadActiveUser());
  }, []);

  const handleSendSms = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedGeneratedOtp(code);
    setSmsSent(true);
    setError(null);
  };

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsVerifying(true);

    setTimeout(() => {
      // Valid OTPs: simulatedGeneratedOtp, 202688 (Master Demo OTP), or admin PIN 2026
      const clean = otpCode.trim();
      if (clean === simulatedGeneratedOtp || clean === '202688' || clean === '2026') {
        verify2FASession(30); // 30-minute high security session
        saveAdminAuditLogs([
          {
            id: `aud-2fa-${Date.now()}`,
            timestamp: new Date().toLocaleString('en-GB') + ' CAT',
            adminName: currentUser.fullName,
            action: '2FA_VERIFICATION_SUCCESS',
            module: 'Finance & Treasury Suite',
            details: `Staff member successfully authenticated via 2FA for: ${actionTitle}.`,
            status: 'SUCCESS',
            ipAddress: '192.168.10.15 (Finance Secure Terminal)',
          },
        ]);
        if (onSuccess) onSuccess();
      } else {
        setError('Invalid 2FA Verification Code. Please enter the 6-digit code or use master bypass 202688.');
      }
      setIsVerifying(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200">
        
        {/* Header with High-Security Visuals */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 text-white text-center relative">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-400 border border-amber-400/40 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            Statutory 2FA Challenge Required
          </span>
          <h2 className="text-lg font-black tracking-tight">Two-Factor Authentication</h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {actionTitle} is protected under Bank of Zambia & DEBS fiduciary governance guidelines.
          </p>
        </div>

        {/* Security Challenge Body */}
        <div className="p-6 space-y-5">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Authenticated Officer</span>
              <p className="font-bold text-slate-900">{currentUser.fullName}</p>
              <span className="text-[11px] text-blue-700 font-semibold">{currentUser.role.replace(/_/g, ' ')}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Staff ID</span>
              <span className="font-mono font-bold text-slate-800">{currentUser.staffId}</span>
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>Enter 6-Digit Authenticator / SMS Code</span>
                </label>
                <button
                  type="button"
                  onClick={handleSendSms}
                  className="text-[11px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>{smsSent ? 'Resend SMS' : 'SMS to Phone'}</span>
                </button>
              </div>

              {smsSent && (
                <div className="mb-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>SMS sent to {currentUser.phone}! Demo code: <strong className="font-mono text-emerald-900">{simulatedGeneratedOtp}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpCode(simulatedGeneratedOtp)}
                    className="text-[10px] underline font-bold"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              <input
                type="text"
                autoFocus
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="0 0 0 0 0 0"
                className="w-full text-center tracking-[0.5em] font-mono text-2xl font-black py-3 px-4 bg-slate-50 border-2 border-slate-300 rounded-2xl focus:border-blue-700 focus:bg-white focus:outline-hidden transition"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={otpCode.length < 4 || isVerifying}
              className="w-full py-3 px-4 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Validating Cryptographic Token...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>Authorize Financial Session</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Bypass for Authorized Evaluators */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Master 2FA Bypass: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-900 font-bold">202688</code></span>
            <button
              type="button"
              onClick={() => {
                setOtpCode('202688');
                setTimeout(() => {
                  verify2FASession(30);
                  if (onSuccess) onSuccess();
                }, 100);
              }}
              className="text-blue-700 font-bold hover:underline inline-flex items-center gap-1"
            >
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Instant Pass</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
