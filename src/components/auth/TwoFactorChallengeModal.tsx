'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Smartphone,
  Mail,
  KeyRound,
  RotateCw,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { NwuchasEmblemSvg } from '@/components/NwuchasLogo';
import { getSensitiveModulePolicy } from '@/lib/sensitiveModules';

interface TwoFactorChallengeModalProps {
  isOpen: boolean;
  targetModule: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function TwoFactorChallengeModal({
  isOpen,
  targetModule,
  onSuccess,
  onCancel,
}: TwoFactorChallengeModalProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [maskedPhone, setMaskedPhone] = useState<string>('+260 96***0051');
  const [maskedEmail, setMaskedEmail] = useState<string>('p****l@nwuchas.edu.zm');
  const [expiresIn, setExpiresIn] = useState<number>(300);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const policy = getSensitiveModulePolicy(targetModule);
  const moduleTitle = policy?.name || targetModule.toUpperCase();

  // Request new challenge when modal opens
  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setErrorMessage(null);
      setSuccessMessage(null);
      initiateChallenge();
    }
  }, [isOpen, targetModule]);

  // Countdown timer for challenge expiry
  useEffect(() => {
    if (!isOpen || expiresIn <= 0) return;
    const interval = setInterval(() => {
      setExpiresIn((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, expiresIn]);

  // Auto-focus first input when challenge loads
  useEffect(() => {
    if (challengeId && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [challengeId]);

  const initiateChallenge = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/auth/2fa/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetModule }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to initiate 2FA verification.');
      }
      setChallengeId(data.data.challengeId);
      setMaskedPhone(data.data.maskedPhone || '+260 96***0051');
      setMaskedEmail(data.data.maskedEmail || 'user@nwuchas.edu.zm');
      setExpiresIn(data.data.expiresInSeconds || 300);
      if (data.data.demoCodeHint) {
        setDemoCode(data.data.demoCodeHint);
      } else {
        setDemoCode(null);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error generating verification challenge.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }

    // Single digit entry
    const char = clean[clean.length - 1];
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    setErrorMessage(null);

    // Auto-advance
    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify if all 6 digits entered
    if (index === 5 && next.every((d) => d.length === 1)) {
      submitVerification(next.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!paste) return;
    const next = [...digits];
    for (let i = 0; i < paste.length; i++) {
      next[i] = paste[i];
    }
    setDigits(next);
    const targetIdx = Math.min(paste.length, 5);
    inputRefs.current[targetIdx]?.focus();

    if (paste.length === 6) {
      submitVerification(paste);
    }
  };

  const handleFillDemoCode = () => {
    if (!demoCode) return;
    const chars = demoCode.split('');
    setDigits(chars);
    submitVerification(demoCode);
  };

  const submitVerification = async (codeOverride?: string) => {
    const code = codeOverride || digits.join('');
    if (code.length < 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    if (!challengeId) {
      setErrorMessage('No active challenge found. Please click "Resend Code".');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, code }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid verification code.');
      }

      setSuccessMessage('Verification confirmed. Unlocking module...');
      setTimeout(() => {
        onSuccess();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  const minutes = Math.floor(expiresIn / 60);
  const seconds = expiresIn % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
        {/* Close / Cancel Button */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel verification"
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition p-1 rounded-lg hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        )}

        {/* Institutional Security Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <NwuchasEmblemSvg size={42} />
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-2.5 py-0.5 text-[10px] font-bold text-cyan-800 uppercase tracking-wider">
                <Lock size={10} /> 2FA Step-up Security
              </span>
              <span className="text-xs font-semibold text-slate-500">NWUCHAS-CMIS</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Two-Factor Authentication Required
            </h2>
          </div>
        </div>

        {/* Target Module Notice Banner */}
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5">
          <div className="flex items-start gap-2.5">
            <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950">
              <p className="font-semibold text-amber-900">
                Accessing Protected Module: <span className="underline">{moduleTitle}</span>
              </p>
              <p className="mt-0.5 text-amber-800 leading-relaxed text-[11px]">
                {policy?.mfaReason ||
                  'This operational workspace contains sensitive institutional assets, financial accounts, or student personal records. Dual-factor authorization is mandatory.'}
              </p>
            </div>
          </div>
        </div>

        {/* Dispatch Notification Details */}
        <div className="mt-4 space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Smartphone size={14} className="text-cyan-700" /> Mobile SMS OTP:
            </span>
            <span className="font-mono font-semibold text-slate-900">{maskedPhone}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Mail size={14} className="text-cyan-700" /> Email Security Dispatch:
            </span>
            <span className="font-mono font-semibold text-slate-900">{maskedEmail}</span>
          </div>
        </div>

        {/* 6-Digit PIN Boxes */}
        <div className="mt-6">
          <label className="block text-center text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Enter 6-Digit Verification Code
          </label>
          <div className="flex justify-center gap-2 sm:gap-3">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                disabled={isLoading || isVerifying}
                className={`h-12 w-11 sm:h-14 sm:w-13 rounded-xl border-2 text-center font-mono text-xl sm:text-2xl font-bold shadow-xs transition outline-none ${
                  errorMessage
                    ? 'border-red-400 bg-red-50 text-red-900'
                    : digit
                    ? 'border-cyan-600 bg-cyan-50/50 text-cyan-950 ring-2 ring-cyan-100'
                    : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Demo Code Quick-Fill Helper for Testing & Evaluation (Displayed only in dev or transitional fallback) */}
        {demoCode && (
          <div className="mt-4 flex items-center justify-center">
            <button
              type="button"
              onClick={handleFillDemoCode}
              disabled={isVerifying}
              className="group flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600 hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-900 transition shadow-2xs"
              title="Institutional Zambian hotline bypass code for testing and evaluation"
            >
              <Sparkles size={12} className="text-amber-500 group-hover:scale-110" />
              <span>Institution Hotline Demo Code:</span>
              <span className="font-mono font-bold text-cyan-700 underline">{demoCode}</span>
              <span className="text-[10px] text-slate-400">(Click to auto-fill)</span>
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 animate-in fade-in">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 animate-in fade-in">
            <ShieldCheck size={16} className="shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Verification Expiration & Resend */}
        <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
          <span>
            Code valid for:{' '}
            <strong className={`font-mono ${expiresIn < 60 ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
              {timeFormatted}
            </strong>
          </span>
          <button
            type="button"
            onClick={initiateChallenge}
            disabled={isLoading || isVerifying || expiresIn > 240}
            className="flex items-center gap-1 text-cyan-700 hover:text-cyan-900 font-semibold disabled:text-slate-400 disabled:cursor-not-allowed transition"
          >
            <RotateCw size={12} className={isLoading ? 'animate-spin' : ''} />
            <span>Resend Code</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isVerifying}
              className="w-full sm:w-auto flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel & Exit
            </button>
          )}
          <button
            type="button"
            onClick={() => submitVerification()}
            disabled={isVerifying || digits.some((d) => !d)}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#007B99] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#00627a] disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md shadow-cyan-900/10 transition"
          >
            {isVerifying ? (
              <>
                <RotateCw size={14} className="animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <KeyRound size={14} />
                <span>Verify & Access {targetModule ? targetModule.toUpperCase() : 'Module'}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>

        <p className="mt-4 text-center text-[10px] text-slate-400">
          Protected under Zambian Statutory Regulations & NWUCHAS IT Security Framework.
        </p>
      </div>
    </div>
  );
}
