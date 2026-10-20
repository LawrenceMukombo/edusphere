// src/components/admin/BreakGlassGuardModal.tsx
// Emergency Break-Glass Authorization Modal enforcing Separation of Powers
// Blocks unauthorized administrator access to operational school duties unless authorized with mandatory justification
'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Lock,
  KeyRound,
  Send,
  X,
  CheckCircle2,
  Phone,
  Mail,
  User,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  OperationalSchoolTask,
  OPERATIONAL_TASK_DEFINITIONS,
  EXECUTIVE_DISPATCH_RECIPIENTS,
  executeBreakGlassEmergencyOverride,
  BreakGlassIncident,
} from '@/lib/separationOfPowers';
import { loadActiveUser } from '@/lib/authPermissions';

interface BreakGlassGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskType: OperationalSchoolTask;
  taskDescription: string;
  targetEntityId?: string;
  onOverrideSuccess: (incident: BreakGlassIncident) => void;
}

export function BreakGlassGuardModal({
  isOpen,
  onClose,
  taskType,
  taskDescription,
  targetEntityId,
  onOverrideSuccess,
}: BreakGlassGuardModalProps) {
  const [justification, setJustification] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const taskMeta = OPERATIONAL_TASK_DEFINITIONS[taskType];
  const activeUser = loadActiveUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!acknowledged) {
      setError('You must acknowledge that this emergency action will be instantly communicated to the School Manager and CEO.');
      return;
    }

    if (justification.trim().length < 15) {
      setError('A comprehensive emergency justification is mandatory (minimum 15 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = executeBreakGlassEmergencyOverride({
        adminUser: activeUser,
        taskType,
        taskDescription,
        targetEntityId,
        justification: justification.trim(),
        verificationPinOrPass: adminPin,
      });

      if (!result.success || !result.incident) {
        setError(result.message);
        setIsSubmitting(false);
        return;
      }

      // Success
      setIsSubmitting(false);
      onOverrideSuccess(result.incident);
    } catch (err: any) {
      setError(err.message || 'An error occurred during break-glass authorization.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border-2 border-rose-500 max-h-[92vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in-95">
        {/* Header Alert Banner */}
        <div className="flex items-start justify-between pb-3 border-b border-rose-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200 shadow-sm">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-full">
                  Administrative Access Notice
                </span>
                <span className="text-xs text-rose-600 font-bold font-mono">Emergency Authorization</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                Restricted Operational Task
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Policy Notice */}
        <div className="p-3.5 bg-rose-50/80 rounded-2xl border border-rose-200 text-xs text-rose-950 space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>System Administrators are restricted from direct school operations:</strong>
              <p className="text-slate-700 mt-1">
                You are attempting to execute: <span className="font-bold text-slate-950">{taskMeta.title}</span>.
                Under institutional governance policy, this responsibility is assigned to{' '}
                <span className="font-bold text-rose-900">{taskMeta.intendedRole}</span>.
              </p>
            </div>
          </div>
          <div className="text-[11px] text-slate-600 bg-white/70 p-2.5 rounded-xl border border-rose-100">
            {taskMeta.riskDescription}
          </div>
        </div>

        {/* Executive Notification Dispatch Target */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
            Instant Executive Incident Dispatch Recipients:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {EXECUTIVE_DISPATCH_RECIPIENTS.map((rec) => (
              <div
                key={rec.role}
                className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{rec.name}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">{rec.title}</span>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Instant SMS & Alert
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form: Mandatory Justification & Verification */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Mandatory Emergency Reason / Valid Justification <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="e.g. Bursar Mrs. Phiri is on emergency sick leave; authorized by CEO via verbal memo #2026-44 to post clearance receipt for provincial sports trip."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500">
              Minimum 15 characters. This justification will be transmitted verbatim to the School Manager and CEO.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Admin Verification PIN / Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="Enter Master PIN or Password"
                  className="w-full px-3 py-2 pl-9 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none font-mono"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Logged Administrator
              </label>
              <div className="px-3 py-2 bg-slate-100 rounded-xl font-medium text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                <span>{activeUser.fullName} ({activeUser.role})</span>
              </div>
            </div>
          </div>

          {/* Acknowledgement Checkbox */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 rounded border-amber-400 text-rose-600 focus:ring-rose-500"
              />
              <span className="text-[11px] text-amber-950 font-semibold leading-tight">
                I certify that this is a valid operational requirement. I understand that this action will be permanently recorded in the administrative audit log and immediately communicated to the School Manager and CEO.
              </span>
            </label>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-100 border border-rose-300 text-rose-900 rounded-xl font-bold text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Sending Executive Notice...' : 'Authorize Administrative Override'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
