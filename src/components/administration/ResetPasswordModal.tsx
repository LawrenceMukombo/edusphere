// src/components/administration/ResetPasswordModal.tsx — Enterprise Admin Password Reset Modal
'use client';

import { useState } from 'react';
import {
  KeyRound,
  X,
  Check,
  Copy,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';

interface ResetPasswordModalProps {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function ResetPasswordModal({
  userId,
  userName,
  userEmail,
  userRole,
  isOpen,
  onClose,
  onSuccess,
}: ResetPasswordModalProps) {
  const [mode, setMode] = useState<'AUTO_OTP' | 'MANUAL'>('AUTO_OTP');
  const [manualPassword, setManualPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [issuedPassword, setIssuedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Real-time password complexity validation
  const hasLength = manualPassword.length >= 10;
  const hasUpper = /[A-Z]/.test(manualPassword);
  const hasLower = /[a-z]/.test(manualPassword);
  const hasNumber = /[0-9]/.test(manualPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(manualPassword);
  const isMatch = manualPassword === confirmPassword && manualPassword.length > 0;
  const isManualValid = hasLength && hasUpper && hasLower && hasNumber && hasSpecial && isMatch;

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (mode === 'MANUAL' && !isManualValid) {
      setError('Please ensure password satisfies all institutional complexity requirements and matches.');
      return;
    }

    setBusy(true);

    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          newPassword: mode === 'MANUAL' ? manualPassword : undefined,
        }),
      });

      const data = await res.json();
      setBusy(false);

      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to reset password.');
        return;
      }

      setIssuedPassword(data.temporaryPassword);
      onSuccess(`Password for ${userName} (${userEmail}) was successfully reset.`);
    } catch {
      setBusy(false);
      setError('Network communication failed while resetting password.');
    }
  }

  function handleCopy() {
    if (!issuedPassword) return;
    navigator.clipboard.writeText(issuedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  function handleFinish() {
    setIssuedPassword(null);
    setManualPassword('');
    setConfirmPassword('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Administrative Password Reset</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {userName} ({userEmail})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Issued Password View (Success State) */}
        {issuedPassword ? (
          <div className="mt-4 space-y-4 animate-in zoom-in-95">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-900">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Password Reset Successfully!</span>
              </div>
              <p className="mt-1 text-[11px] text-emerald-700 leading-relaxed">
                Provide this temporary password securely to the user. The user will be <strong>forced to rotate it</strong> immediately upon their next login.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Temporary One-Time Password (OTP)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-xl border border-indigo-200 bg-indigo-50/50 px-3.5 py-2.5 font-mono text-sm font-black text-indigo-900 select-all tracking-wider text-center">
                  {issuedPassword}
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-xl bg-indigo-700 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-indigo-800 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">• Mandatory 90-day rotation initiated</p>
              <p className="text-slate-500">• All previous active sessions for this user have been terminated</p>
              <p className="text-slate-500">• Event recorded in cryptographic institutional audit ledger</p>
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Done & Return to Directory
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="mt-4 space-y-4">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 font-semibold flex items-start gap-2">
                <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Mode Tabs */}
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 text-xs">
              <button
                type="button"
                onClick={() => setMode('AUTO_OTP')}
                className={`rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
                  mode === 'AUTO_OTP'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <Sparkles size={13} className="text-indigo-600" />
                  <span>Auto-Generate OTP</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setMode('MANUAL')}
                className={`rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
                  mode === 'MANUAL'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <Lock size={13} className="text-indigo-600" />
                  <span>Set Manual Password</span>
                </span>
              </button>
            </div>

            {mode === 'AUTO_OTP' ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 leading-relaxed space-y-2">
                <p className="font-semibold text-slate-800">
                  The system will generate a high-entropy, military-grade 12-character one-time password (OTP).
                </p>
                <p className="text-[11px] text-slate-500">
                  The password will be displayed on screen for you to copy. The user will be automatically prompted to configure their own private password upon signing in.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={manualPassword}
                    onChange={(e) => setManualPassword(e.target.value)}
                    placeholder="Enter new password (min 10 chars)"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                {/* Password Strength Checklist */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-[10px] space-y-1">
                  <span className="block font-bold text-slate-700 mb-1">Institutional Complexity Policy:</span>
                  <div className="grid grid-cols-2 gap-1 text-slate-600">
                    <span className={hasLength ? 'text-emerald-700 font-bold flex items-center gap-1' : 'text-slate-400 flex items-center gap-1'}>
                      {hasLength ? '✓' : '•'} Min 10 characters
                    </span>
                    <span className={hasUpper ? 'text-emerald-700 font-bold flex items-center gap-1' : 'text-slate-400 flex items-center gap-1'}>
                      {hasUpper ? '✓' : '•'} At least 1 uppercase (A-Z)
                    </span>
                    <span className={hasLower ? 'text-emerald-700 font-bold flex items-center gap-1' : 'text-slate-400 flex items-center gap-1'}>
                      {hasLower ? '✓' : '•'} At least 1 lowercase (a-z)
                    </span>
                    <span className={hasNumber ? 'text-emerald-700 font-bold flex items-center gap-1' : 'text-slate-400 flex items-center gap-1'}>
                      {hasNumber ? '✓' : '•'} At least 1 digit (0-9)
                    </span>
                    <span className={hasSpecial ? 'text-emerald-700 font-bold flex items-center gap-1' : 'text-slate-400 flex items-center gap-1'}>
                      {hasSpecial ? '✓' : '•'} Special char (!@#$%&*)
                    </span>
                    <span className={isMatch ? 'text-emerald-700 font-bold flex items-center gap-1' : 'text-slate-400 flex items-center gap-1'}>
                      {isMatch ? '✓' : '•'} Passwords match
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy || (mode === 'MANUAL' && !isManualValid)}
                className="rounded-xl bg-indigo-700 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-800 transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                {busy && <RefreshCw size={13} className="animate-spin" />}
                <span>{mode === 'AUTO_OTP' ? 'Generate OTP & Reset' : 'Set New Password'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
