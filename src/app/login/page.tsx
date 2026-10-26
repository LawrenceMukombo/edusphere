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



  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');

    // Abort controller with 15-second timeout to prevent UI hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const payload = await response.json();
      setBusy(false);

      if (!response.ok) {
        setError(payload.message ?? 'Sign-in failed. Please verify credentials.');
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
      clearTimeout(timeoutId);
      setBusy(false);
      if (err.name === 'AbortError') {
        setError('Connection timed out. The server took too long to respond. Please try again.');
      } else {
        setError('Network communication failed. Please check your connectivity and retry.');
      }
    }
  }

  return (
    <div className="w-full max-w-lg">
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
