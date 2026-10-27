// src/components/administration/ChangeUserStatusModal.tsx — Enterprise User Lifecycle State Modal
'use client';

import { useState } from 'react';
import {
  UserX,
  Lock,
  Unlock,
  AlertTriangle,
  X,
  CheckCircle2,
  Calendar,
  FileText,
  Trash2,
  ShieldAlert,
  RefreshCw,
  Archive,
} from 'lucide-react';
import { UserLifecycleStatus } from '@/server/services/userManagement.service';

interface ChangeUserStatusModalProps {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  currentStatus: UserLifecycleStatus;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newStatus: UserLifecycleStatus, message: string) => void;
}

export function ChangeUserStatusModal({
  userId,
  userName,
  userEmail,
  userRole,
  currentStatus,
  isOpen,
  onClose,
  onSuccess,
}: ChangeUserStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<UserLifecycleStatus>(
    currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
  );
  const [reason, setReason] = useState('');
  const [suspendedUntil, setSuspendedUntil] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!reason || reason.trim().length < 3) {
      setError('Please provide a descriptive reason for this institutional status change.');
      return;
    }

    setBusy(true);

    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedStatus,
          reason: reason.trim(),
          suspendedUntil: selectedStatus === 'SUSPENDED' && suspendedUntil ? suspendedUntil : null,
        }),
      });

      const data = await res.json();
      setBusy(false);

      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to update user lifecycle status.');
        return;
      }

      onSuccess(selectedStatus, data.message || `Account status updated to ${selectedStatus}.`);
      onClose();
    } catch {
      setBusy(false);
      setError('Network communication failed while saving user status.');
    }
  }

  const getStatusMeta = (status: UserLifecycleStatus) => {
    switch (status) {
      case 'ACTIVE':
        return {
          title: 'Reactivate Account',
          desc: 'Restore full system access, clear security flags, and allow login.',
          color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
          badge: 'bg-emerald-600 text-white',
          icon: Unlock,
        };
      case 'SUSPENDED':
        return {
          title: 'Suspend Account',
          desc: 'Temporarily halt access pending administrative review, sabbatical, or leave.',
          color: 'text-amber-800 bg-amber-50 border-amber-200',
          badge: 'bg-amber-600 text-white',
          icon: UserX,
        };
      case 'LOCKED':
        return {
          title: 'Security Lockout',
          desc: 'Impose strict security block due to policy breach or credential compromise.',
          color: 'text-rose-800 bg-rose-50 border-rose-200',
          badge: 'bg-rose-600 text-white',
          icon: Lock,
        };
      case 'DELETED':
        return {
          title: 'Archive / Soft-Delete',
          desc: 'Permanently revoke login and hide from active rosters while preserving all audit and financial history.',
          color: 'text-slate-800 bg-slate-100 border-slate-300',
          badge: 'bg-slate-700 text-white',
          icon: Archive,
        };
    }
  };

  const activeMeta = getStatusMeta(selectedStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`h-9 w-9 rounded-xl border flex items-center justify-center ${activeMeta.color}`}>
              <activeMeta.icon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900">Manage Account Lifecycle</h3>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-600">
                  Current: {currentStatus}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {userName} ({userEmail}) • <span className="font-bold text-slate-700">{userRole}</span>
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 font-semibold flex items-start gap-2">
              <AlertTriangle size={15} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Status Selection Cards */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Target Lifecycle State
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['ACTIVE', 'SUSPENDED', 'LOCKED', 'DELETED'] as const).map((st) => {
                const meta = getStatusMeta(st);
                const isSelected = selectedStatus === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatus(st)}
                    className={`text-left rounded-xl border p-2.5 transition cursor-pointer ${
                      isSelected
                        ? `${meta.color} ring-2 ring-cyan-600/30 font-extrabold shadow-2xs`
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{meta.title}</span>
                      <meta.icon size={14} className={isSelected ? 'text-inherit' : 'text-slate-400'} />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-2">{meta.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notice banner depending on status */}
          <div className={`rounded-xl border p-3 text-xs leading-relaxed ${activeMeta.color}`}>
            <p className="font-bold">{activeMeta.title} Notice:</p>
            <p className="text-[11px] mt-0.5">{activeMeta.desc}</p>
            {selectedStatus === 'DELETED' && (
              <p className="mt-1.5 text-[10px] font-semibold text-slate-600 border-t border-slate-300/40 pt-1">
                🔒 <strong>Zero Data Loss Guarantee:</strong> Soft-delete revokes authentication credentials, but leaves historical records, grades, clinic logbook signs, and financial transactions fully intact in accordance with statutory guidelines.
              </p>
            )}
          </div>

          {/* Optional: Suspension Duration */}
          {selectedStatus === 'SUSPENDED' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Suspended Until Date (Optional)
              </label>
              <input
                type="date"
                value={suspendedUntil}
                onChange={(e) => setSuspendedUntil(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-amber-600 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Leave empty for indefinite suspension pending investigation.</p>
            </div>
          )}

          {/* Mandatory Reason */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-700">
                Mandatory Institutional Reason & Justification <span className="text-rose-600">*</span>
              </label>
              <span className="text-[10px] text-slate-400">Recorded in audit log</span>
            </div>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Sabbatical study leave granted by Academic Senate, or Security block due to unrecognized login from unexpected IP address."
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
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
              disabled={busy}
              className={`rounded-xl px-4 py-2 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                selectedStatus === 'ACTIVE'
                  ? 'bg-emerald-700 hover:bg-emerald-800'
                  : selectedStatus === 'SUSPENDED'
                  ? 'bg-amber-700 hover:bg-amber-800'
                  : selectedStatus === 'LOCKED'
                  ? 'bg-rose-700 hover:bg-rose-800'
                  : 'bg-slate-800 hover:bg-slate-900'
              }`}
            >
              {busy && <RefreshCw size={13} className="animate-spin" />}
              <span>Confirm {activeMeta.title}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
