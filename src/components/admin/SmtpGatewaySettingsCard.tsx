// src/components/admin/SmtpGatewaySettingsCard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  ShieldCheck,
  Send,
  Lock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

export function SmtpGatewaySettingsCard() {
  const [host, setHost] = useState('smtp.hostinger.com');
  const [port, setPort] = useState(465);
  const [user, setUser] = useState('noreply@nwuc.edu.zm');
  const [pass, setPass] = useState('');
  const [fromName, setFromName] = useState('North Western University College');
  const [showPassword, setShowPassword] = useState(false);

  const [testRecipient, setTestRecipient] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const [statusInfo, setStatusInfo] = useState<{
    isConfigured: boolean;
    source: 'DATABASE' | 'ENV' | 'NONE';
    hasPasswordSet: boolean;
    lastUpdated?: string | null;
  } | null>(null);

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/settings/smtp');
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusInfo(data.data);
        if (data.data.host) setHost(data.data.host);
        if (data.data.port) setPort(data.data.port);
        if (data.data.user) setUser(data.data.user);
        if (data.data.fromName) setFromName(data.data.fromName);
      }
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleTestConnection = async () => {
    setIsTestingConn(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/settings/smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TEST_CONNECTION',
          host,
          port,
          user,
          pass,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: data.message });
      } else {
        setFeedback({ type: 'error', message: data.message || 'Connection test failed.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Error communicating with server.' });
    } finally {
      setIsTestingConn(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/settings/smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE',
          host,
          port,
          user,
          pass,
          fromName,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: data.message });
        setPass(''); // Clear sensitive password from form memory
        await loadStatus();
      } else {
        setFeedback({ type: 'error', message: data.message || 'Failed to save SMTP configuration.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Error saving SMTP configuration.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testRecipient || !testRecipient.includes('@')) {
      setFeedback({ type: 'error', message: 'Please provide a valid recipient email address for testing.' });
      return;
    }

    setIsSendingTest(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/settings/smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SEND_TEST_EMAIL',
          recipientEmail: testRecipient.trim(),
          host,
          port,
          user,
          pass,
          fromName,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: data.message });
      } else {
        setFeedback({ type: 'error', message: data.message || 'Could not send test email.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Error dispatching test email.' });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Overview Status Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-[#007B99] border border-cyan-100 shadow-xs">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Institutional Email &amp; Communications Gateway</h2>
              <p className="text-xs text-slate-500">
                Outbound SMTP gateway for automated Two-Factor Authentication (2FA) OTP codes, admission offers, and receipts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {statusInfo?.isConfigured ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 shadow-2xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Gateway Active ({statusInfo.source})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200 shadow-2xs">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                <span>Not Configured (Demo Fallback Active)</span>
              </span>
            )}
            <button
              type="button"
              onClick={loadStatus}
              disabled={isLoading}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              title="Refresh status"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`mt-4 flex items-start gap-2.5 rounded-xl p-3.5 text-xs font-medium animate-in fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border border-rose-200 text-rose-900'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">{feedback.message}</div>
          </div>
        )}

        {/* Form Configuration */}
        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Server className="h-3.5 w-3.5 text-slate-500" />
                SMTP Host Server
              </label>
              <input
                type="text"
                required
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="e.g. smtp.hostinger.com"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 font-mono focus:border-[#007B99] focus:outline-none focus:ring-1 focus:ring-[#007B99]"
              />
              <p className="text-[10px] text-slate-400 mt-1">Hostinger VPS / cPanel mail server domain</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-slate-500" />
                SMTP Port
              </label>
              <select
                value={port}
                onChange={(e) => setPort(parseInt(e.target.value, 10))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 font-mono focus:border-[#007B99] focus:outline-none focus:ring-1 focus:ring-[#007B99]"
              >
                <option value={465}>Port 465 (SSL / Secure Direct — Recommended)</option>
                <option value={587}>Port 587 (TLS / STARTTLS)</option>
                <option value={25}>Port 25 (Standard Unencrypted)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">Port 465 provides immediate high-grade SSL transport</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-500" />
                Sender Mailbox Address (Username)
              </label>
              <input
                type="email"
                required
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="noreply@nwuc.edu.zm"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 font-mono focus:border-[#007B99] focus:outline-none focus:ring-1 focus:ring-[#007B99]"
              />
              <p className="text-[10px] text-slate-400 mt-1">Institutional mailbox configured in your domain mail suite</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-slate-500" />
                  Mailbox Password
                </span>
                {statusInfo?.hasPasswordSet && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                    Encrypted Key Saved
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder={statusInfo?.hasPasswordSet ? '•••••••••••••••• (Leave blank to keep current)' : 'Enter mailbox password'}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 pr-9 text-xs text-slate-900 font-mono focus:border-[#007B99] focus:outline-none focus:ring-1 focus:ring-[#007B99]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Encrypted with AES-256-GCM before storage in database</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
                From Name (Display Header)
              </label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="North Western University College"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-[#007B99] focus:outline-none focus:ring-1 focus:ring-[#007B99]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTestingConn || (!pass && !statusInfo?.hasPasswordSet)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition disabled:opacity-40"
              title="Test handshake with mail server without sending an email"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isTestingConn ? 'animate-spin' : ''}`} />
              <span>{isTestingConn ? 'Testing Handshake...' : 'Test Connection Handshake'}</span>
            </button>

            <button
              type="submit"
              disabled={isSaving || (!pass && !statusInfo?.hasPasswordSet)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#007B99] hover:bg-[#00627a] shadow-sm transition disabled:opacity-40"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>{isSaving ? 'Encrypting & Saving...' : 'Save & Activate Email Gateway'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Live Dispatch Tester */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-[#8DC63F]" />
          <h3 className="text-sm font-bold text-slate-900">Send Live Test Verification Email</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Verify end-to-end delivery by sending a formatted test email to your personal or administrative inbox.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="email"
            value={testRecipient}
            onChange={(e) => setTestRecipient(e.target.value)}
            placeholder="e.g. principal@nwuc.edu.zm or personal inbox"
            className="w-full sm:flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono focus:border-[#007B99] focus:outline-none focus:ring-1 focus:ring-[#007B99]"
          />
          <button
            type="button"
            onClick={handleSendTestEmail}
            disabled={isSendingTest || (!statusInfo?.hasPasswordSet && !pass)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#8DC63F] hover:bg-[#7cb333] transition disabled:opacity-40 shadow-xs"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isSendingTest ? 'Dispatching Test...' : 'Send Verification Email'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
