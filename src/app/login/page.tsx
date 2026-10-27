'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LogIn, ShieldCheck, ArrowLeft, KeyRound, AlertCircle, CheckCircle2, HeartPulse } from 'lucide-react';
import { NwuchasLogo, NwuchasEmblemSvg, NWUCHAS_IDENTITY } from '@/components/NwuchasLogo';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Forced 90-Day (3-Month) Password Rotation State for College Owner / Super Admin
  const [showForceChangeModal, setShowForceChangeModal] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [currentPwdForChange, setCurrentPwdForChange] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeError, setChangeError] = useState('');
  const [changeSuccess, setChangeSuccess] = useState('');
  const [changeBusy, setChangeBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');

    const cleanEmail = email.trim();

    async function executeLoginAttempt(attempt: number): Promise<{ ok: boolean; payload: any }> {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        let payload: any = {};
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          payload = await response.json();
        } else {
          const rawText = await response.text();
          payload = { message: rawText || 'Server responded with non-JSON format.' };
        }

        return { ok: response.ok, payload };
      } catch (err: any) {
        clearTimeout(timeoutId);
        // Automatic retry once on network disconnect or server cold boot
        if (attempt === 1 && err.name !== 'AbortError') {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          return executeLoginAttempt(2);
        }
        throw err;
      }
    }

    try {
      const { ok, payload } = await executeLoginAttempt(1);
      setBusy(false);

      if (!ok) {
        setError(payload.message ?? 'Sign-in failed. Please verify credentials.');
        return;
      }

      // If mandatory 90-day rotation is due, prompt immediately
      if (payload.mustChangePassword) {
        setPendingUser(payload.data?.user);
        setCurrentPwdForChange(password);
        setShowForceChangeModal(true);
        return;
      }

      // Determine proper destination: redirect query param -> user defaultRoute -> /portal/executive
      let destination = '/portal/executive';
      if (redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
        destination = redirectParam;
      } else if (payload.data?.user?.defaultRoute) {
        destination = payload.data.user.defaultRoute;
      }

      router.push(destination);
      router.refresh();
    } catch (err: any) {
      setBusy(false);
      if (err.name === 'AbortError') {
        setError('Connection timed out. The server took too long to compile or respond. Please retry.');
      } else if (err.message && err.message.includes('Failed to fetch')) {
        setError('Unable to reach authentication server on port 3025. Please verify the local server is running and retry.');
      } else {
        setError(`Network communication error (${err.message || 'connection failed'}). Please retry.`);
      }
    }
  }

  async function handleRotatePassword(e: React.FormEvent) {
    e.preventDefault();
    setChangeError('');
    setChangeSuccess('');
    setChangeBusy(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentPwdForChange,
          newPassword,
          confirmPassword,
        }),
      });

      const payload = await res.json();
      setChangeBusy(false);

      if (!res.ok) {
        setChangeError(payload.message || 'Failed to update password.');
        return;
      }

      setChangeSuccess('Password updated successfully! Redirecting...');
      setTimeout(() => {
        let destination = '/portal/executive';
        if (redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
          destination = redirectParam;
        } else if (pendingUser?.defaultRoute) {
          destination = pendingUser.defaultRoute;
        }
        router.push(destination);
        router.refresh();
      }, 1000);
    } catch {
      setChangeBusy(false);
      setChangeError('Error connecting to password rotation service.');
    }
  }

  return (
    <div className="w-full max-w-lg">
      {/* Forced 90-Day Password Rotation Modal */}
      {showForceChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl text-slate-800 animate-in zoom-in-95">
            <div className="flex items-center gap-2.5 pb-3 border-b border-rose-100">
              <div className="h-9 w-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Mandatory 3-Month Password Rotation</h3>
                <p className="text-[11px] text-rose-700 font-bold">College Owner & Super Admin Security Policy</p>
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              Your account security policy requires rotating your password every <strong>90 days (3 months)</strong> to protect institutional controls and college override privileges.
            </p>

            {changeError && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 font-medium">
                {changeError}
              </div>
            )}

            {changeSuccess && (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                <CheckCircle2 size={15} />
                <span>{changeSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRotatePassword} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPwdForChange}
                  onChange={(e) => setCurrentPwdForChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#007B99] focus:outline-none"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">New Password (Min 10 chars, Upper, Lower, Number, Special)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#007B99] focus:outline-none"
                  placeholder="Create new military-grade password"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#007B99] focus:outline-none"
                  placeholder="Re-enter new password"
                />
              </div>

              <button
                type="submit"
                disabled={changeBusy}
                className="w-full mt-2 rounded-xl bg-gradient-to-r from-[#007B99] to-[#0b2545] py-2.5 text-xs font-black text-white hover:brightness-110 transition shadow-md disabled:opacity-50"
              >
                {changeBusy ? 'Rotating Password...' : 'Update Password & Activate New 90-Day Cycle'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Top Brand Banner */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#007B99] transition">
            <ArrowLeft size={16} />
            <span>Return to College Portal</span>
          </Link>
          <div className="flex items-center gap-1.5 rounded-full bg-[#EC008C]/10 border border-[#EC008C]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#EC008C]">
            <HeartPulse size={12} className="animate-pulse" />
            <span>Healthcare CMIS</span>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center text-center">
          <NwuchasLogo variant="crest" size="md" />
        </div>
      </div>

      {/* Main Login Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md relative overflow-hidden">
        {/* Accent Top Border Ribbon: Teal-blue, Lime-green, Pink */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex">
          <div className="h-full flex-1 bg-[#007B99]" />
          <div className="h-full flex-1 bg-[#8DC63F]" />
          <div className="h-full w-12 bg-[#EC008C]" />
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">Staff & Student Sign-In</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Integrated Campus Management Information System
            </p>
          </div>
          <span className="rounded-full bg-[#8DC63F]/15 border border-[#8DC63F]/40 px-2.5 py-1 text-[11px] font-extrabold text-[#5c8426]">
            Secure RBAC
          </span>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-[#EC008C]/30 bg-[#EC008C]/10 p-3.5 text-xs font-semibold text-[#c70076] flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 text-[#EC008C] mt-0.5" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
              Institutional Email
            </label>
            <input
              required
              type="email"
              placeholder="e.g. it.admin@nwuchas.edu.zm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#007B99] focus:ring-2 focus:ring-[#007B99]/20 focus:outline-none transition shadow-2xs font-medium"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <span className="text-[11px] text-slate-400">Institutional credentials</span>
            </div>
            <input
              required
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#007B99] focus:ring-2 focus:ring-[#007B99]/20 focus:outline-none transition shadow-2xs font-medium"
            />
          </div>

          {/* Submit Button with Mandated Teal-Blue */}
          <button
            type="submit"
            disabled={busy}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#007B99] px-5 py-3 text-xs font-extrabold text-white shadow-md hover:bg-[#00627a] active:bg-[#004f63] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {busy ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Authenticating with NWUCHAS Directory…</span>
              </>
            ) : (
              <>
                <LogIn size={15} />
                <span>Sign in to NWUCHAS-CMIS</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Sign-in Shortcuts for Demonstration Personas */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
              Quick Sign-in (Local Demonstration)
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">Click to prefill</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setEmail('principal@nwuchas.edu.zm');
                setPassword('NWUCHAS-DEV-ONLY-CHANGE-ME');
                setError('');
              }}
              className="text-left rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 hover:border-[#007B99] hover:bg-sky-50/50 transition cursor-pointer"
            >
              <div className="font-extrabold text-[11px] text-slate-800">Executive Principal</div>
              <div className="text-[10px] text-slate-500 truncate">principal@nwuchas.edu.zm</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('owner@nwuchas.edu.zm');
                setPassword('NWUCHAS-Owner-2026!');
                setError('');
              }}
              className="text-left rounded-lg border border-amber-200 bg-amber-50/40 px-2.5 py-1.5 hover:border-amber-400 hover:bg-amber-100/50 transition cursor-pointer"
            >
              <div className="font-extrabold text-[11px] text-amber-900 flex items-center gap-1">
                <span>College Owner</span>
                <span className="rounded bg-amber-200 text-amber-900 px-1 text-[9px] font-black">Super Admin</span>
              </div>
              <div className="text-[10px] text-amber-700 truncate">owner@nwuchas.edu.zm</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('registrar@nwuchas.edu.zm');
                setPassword('NWUCHAS-DEV-ONLY-CHANGE-ME');
                setError('');
              }}
              className="text-left rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 hover:border-[#007B99] hover:bg-sky-50/50 transition cursor-pointer"
            >
              <div className="font-extrabold text-[11px] text-slate-800">Academic Registrar</div>
              <div className="text-[10px] text-slate-500 truncate">registrar@nwuchas.edu.zm</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('it.admin@nwuchas.edu.zm');
                setPassword('NWUCHAS-DEV-ONLY-CHANGE-ME');
                setError('');
              }}
              className="text-left rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 hover:border-[#007B99] hover:bg-sky-50/50 transition cursor-pointer"
            >
              <div className="font-extrabold text-[11px] text-slate-800">IT Administrator</div>
              <div className="text-[10px] text-slate-500 truncate">it.admin@nwuchas.edu.zm</div>
            </button>
          </div>
        </div>



        {/* Institutional Trust Footer */}
        <div className="mt-6 border-t border-slate-100 pt-4 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <ShieldCheck size={14} className="text-[#007B99]" />
            <span>Protected by Institutional Access Controls & Role Gating</span>
          </div>
          <p className="text-[10px] text-slate-400">
            North Western University College of Health and Applied Sciences • {NWUCHAS_IDENTITY.address}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-lime-50/20 flex flex-col justify-between">
      <main className="flex-1 px-4 py-12 flex items-center justify-center">
        <Suspense fallback={
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 shadow-sm">
            Loading NWUCHAS Authentication Portal…
          </div>
        }>
          <LoginForm />
        </Suspense>
      </main>

      {/* Authentic Signature Lime Green Footer Bar Matching nwuc.edu.zm - Static/Sticky Bottom Bar */}
      <footer className="sticky bottom-0 z-30 bg-[#8DC63F] text-slate-950 py-2.5 px-4 text-xs font-bold border-t border-[#7ab332] shadow-[0_-4px_16px_rgba(0,0,0,0.12)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[11px] sm:text-xs">
          <span className="text-center sm:text-left">
            © 2026 North Western University College of Health and Applied Sciences. All rights reserved.
          </span>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-2.5 gap-y-1 font-semibold text-slate-900">
            <span>Plot 511/518 Shilenda Road, Manyama, Lumwana, Zambia</span>
            <span className="hidden sm:inline">•</span>
            <span>Hotlines: <strong>0964240051 / 0955550051 / 0979000051 / 0974896096 / 0974240051</strong></span>
            <span className="hidden sm:inline">•</span>
            <span>WhatsApp: <strong>0955550051 / 0964240051 / 0979000051 / 0974896096 / 0974240051</strong></span>
            <span className="hidden sm:inline">•</span>
            <a href="mailto:info@nwuc.edu.zm" className="underline hover:text-slate-950">info@nwuc.edu.zm</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
