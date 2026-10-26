'use client';

import { useState, useEffect } from 'react';
import {
  UsersRound,
  X,
  Check,
  ShieldCheck,
  Lock,
  KeyRound,
  AlertTriangle,
  Building,
  UserCheck,
  UserX,
  FileCheck2,
} from 'lucide-react';

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  campus: string;
  mfaStatus: 'ENFORCED' | 'PENDING';
  lastLogin: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

interface AdminUserCrudModalProps {
  user: AdminUserRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (saved: AdminUserRecord) => void;
  onDelete?: (id: string) => void;
  mode: 'CREATE' | 'EDIT';
}

export function AdminUserCrudModal({
  user,
  isOpen,
  onClose,
  onSave,
  onDelete,
  mode,
}: AdminUserCrudModalProps) {
  const [formData, setFormData] = useState<AdminUserRecord>({
    id: '',
    name: '',
    email: '',
    role: 'ADMISSIONS_OFFICER',
    department: 'Academic Affairs & Registry',
    campus: 'Manyama Main Campus',
    mfaStatus: 'ENFORCED',
    lastLogin: 'Never',
    status: 'ACTIVE',
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({
        id: `USR-${Date.now()}`,
        name: '',
        email: '',
        role: 'ADMISSIONS_OFFICER',
        department: 'Academic Affairs & Registry',
        campus: 'Manyama Main Campus',
        mfaStatus: 'ENFORCED',
        lastLogin: 'Pending initial login',
        status: 'ACTIVE',
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(formData);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl transition-all sm:p-8 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-800">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                Administration & Settings • RBAC Controls
              </span>
              <h3 className="text-lg font-black text-slate-900">
                {mode === 'CREATE' ? 'Provision New Staff Account' : `Manage Permissions — ${formData.name}`}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Staff Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dr. Mwila Chileshe"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Official College Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. registrar@nwuchas.edu.zm"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">System Role (RBAC)</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
              >
                <option value="INSTITUTION_ADMIN">INSTITUTION_ADMIN (Executive Principal)</option>
                <option value="REGISTRAR">REGISTRAR (Academic & Council Indexing)</option>
                <option value="BURSAR">BURSAR (Finance & Fee Ledger)</option>
                <option value="ADMISSIONS_OFFICER">ADMISSIONS_OFFICER (Offers & Enrollment)</option>
                <option value="EXAMINATIONS_OFFICER">EXAMINATIONS_OFFICER (OSCE & CBT)</option>
                <option value="PAYROLL_PREPARER">PAYROLL_PREPARER (HR & Statutory Rules)</option>
                <option value="PAYROLL_APPROVER">PAYROLL_APPROVER (Separation of Powers)</option>
                <option value="IT_ADMIN">IT_ADMIN (Enterprise Infrastructure)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">MFA Enforcement</label>
              <select
                value={formData.mfaStatus}
                onChange={(e) => setFormData({ ...formData, mfaStatus: e.target.value as any })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
              >
                <option value="ENFORCED">ENFORCED (TOTP Authenticator Required)</option>
                <option value="PENDING">PENDING (Grace Period for Onboarding)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Department / Directorate</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Academic Affairs & Examinations"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Campus Assignment</label>
              <select
                value={formData.campus}
                onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
              >
                <option value="Manyama Main Campus">Manyama Main Campus (North-Western)</option>
                <option value="Solwezi Clinical Annex">Solwezi Clinical Annex</option>
                <option value="All Campuses (Enterprise)">All Campuses (Enterprise Institutional Scope)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Account Authorization Status</label>
            <div className="mt-1 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'ACTIVE' })}
                className={`flex-1 rounded-xl p-2.5 text-xs font-bold transition flex items-center justify-center gap-2 ${
                  formData.status === 'ACTIVE'
                    ? 'border border-emerald-300 bg-emerald-50 text-emerald-800'
                    : 'border border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <UserCheck className="h-4 w-4 text-emerald-600" /> Active Account
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'SUSPENDED' })}
                className={`flex-1 rounded-xl p-2.5 text-xs font-bold transition flex items-center justify-center gap-2 ${
                  formData.status === 'SUSPENDED'
                    ? 'border border-rose-300 bg-rose-50 text-rose-800'
                    : 'border border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <UserX className="h-4 w-4 text-rose-600" /> Suspended / Locked
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-cyan-800 transition"
            >
              <Check className="h-4 w-4" /> Save User Permissions
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
