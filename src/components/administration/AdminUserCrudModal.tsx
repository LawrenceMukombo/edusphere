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
  SlidersHorizontal,
  Fingerprint,
  RefreshCw,
  LogOut,
  Mail,
  Phone,
  Briefcase,
  Layers,
  Sparkles,
  CheckSquare,
  Square,
  RotateCcw,
} from 'lucide-react';

import {
  UserStatus,
  MfaStatus,
  ModulePermissionSet,
  UserModulePermissions,
  AdminUserRecord,
  DEFAULT_PERMISSIONS,
  ROLE_PRESETS,
  MODULE_DEFINITIONS,
} from '@/lib/administrationRbac';

export type {
  UserStatus,
  MfaStatus,
  ModulePermissionSet,
  UserModulePermissions,
  AdminUserRecord,
};
export { DEFAULT_PERMISSIONS, ROLE_PRESETS, MODULE_DEFINITIONS };

export interface AdminUserCrudModalProps {
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
  const [activeTab, setActiveTab] = useState<'IDENTITY' | 'ROLE' | 'PERMISSIONS' | 'SECURITY'>('IDENTITY');
  const [formData, setFormData] = useState<AdminUserRecord>({
    id: '',
    staffNumber: '',
    name: '',
    email: '',
    phone: '+260977000000',
    role: 'ADMISSIONS_OFFICER',
    roleTitle: 'Admissions & Enrollment Officer',
    jobTitle: 'Admissions & Registry Officer',
    department: 'Academic Affairs & Registry',
    campus: 'Manyama Main Campus',
    mfaStatus: 'ENFORCED',
    lastLogin: 'Pending initial activation',
    lastLoginIp: '192.168.10.45',
    status: 'ACTIVE',
    permissions: JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS)),
  });

  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    if (user) {
      const preset = ROLE_PRESETS[user.role] || ROLE_PRESETS.REGISTRAR;
      setFormData({
        ...user,
        roleTitle: user.roleTitle || preset.label,
        jobTitle: user.jobTitle || preset.label,
        permissions: user.permissions || preset.perms,
      });
    } else {
      const preset = ROLE_PRESETS.ADMISSIONS_OFFICER;
      setFormData({
        id: `USR-${Date.now()}`,
        staffNumber: `NWU-STF-0${Math.floor(10 + Math.random() * 89)}`,
        name: '',
        email: '',
        phone: '+260977000000',
        role: 'ADMISSIONS_OFFICER',
        roleTitle: preset.label,
        jobTitle: preset.label,
        department: preset.dept,
        campus: 'Manyama Main Campus',
        mfaStatus: 'ENFORCED',
        lastLogin: 'Pending initial login',
        lastLoginIp: '127.0.0.1',
        status: 'ACTIVE',
        permissions: JSON.parse(JSON.stringify(preset.perms)),
      });
    }
    setActiveTab('IDENTITY');
  }, [user, isOpen]);

  if (!isOpen) return null;

  function handleRoleChange(newRole: string) {
    const preset = ROLE_PRESETS[newRole] || ROLE_PRESETS.REGISTRAR;
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      roleTitle: preset.label,
      jobTitle: prev.jobTitle || preset.label,
      department: prev.department || preset.dept,
      permissions: JSON.parse(JSON.stringify(preset.perms)),
    }));
  }

  function handlePermissionToggle(moduleKey: keyof UserModulePermissions, permKey: keyof ModulePermissionSet) {
    setFormData((prev) => {
      const currentMod = prev.permissions?.[moduleKey] || DEFAULT_PERMISSIONS[moduleKey];
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [moduleKey]: {
            ...currentMod,
            [permKey]: !currentMod[permKey],
          },
        } as UserModulePermissions,
      };
    });
  }

  function handleSelectAllPermissions(enabled: boolean) {
    setFormData((prev) => {
      const updated: any = {};
      MODULE_DEFINITIONS.forEach((mod) => {
        updated[mod.key] = {
          view: enabled,
          create: enabled,
          edit: enabled,
          delete: enabled,
          approve: enabled,
          export: enabled,
        };
      });
      return { ...prev, permissions: updated };
    });
  }

  function handleResetMfa() {
    setFormData((prev) => ({ ...prev, mfaStatus: 'PENDING' }));
    setToastMessage('TOTP Security Authenticator token reset. Officer must scan a new QR key on next sign-in.');
    setTimeout(() => setToastMessage(''), 4000);
  }

  function handleRevokeSessions() {
    setToastMessage('All active cryptographic JWT sessions terminated for this account across all devices.');
    setTimeout(() => setToastMessage(''), 4000);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(formData);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-2xl transition-all my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-800 shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-cyan-700">
                Administration & Settings • Enterprise User Governance
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

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-100 pt-3 pb-2 gap-2 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('IDENTITY')}
            className={`rounded-xl px-3.5 py-2 transition flex items-center gap-2 ${
              activeTab === 'IDENTITY'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UsersRound className="h-3.5 w-3.5" /> Identity & Dossier
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ROLE')}
            className={`rounded-xl px-3.5 py-2 transition flex items-center gap-2 ${
              activeTab === 'ROLE'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Role & Authority Tier
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PERMISSIONS')}
            className={`rounded-xl px-3.5 py-2 transition flex items-center gap-2 ${
              activeTab === 'PERMISSIONS'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Module Access Matrix
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SECURITY')}
            className={`rounded-xl px-3.5 py-2 transition flex items-center gap-2 ${
              activeTab === 'SECURITY'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Lock className="h-3.5 w-3.5" /> Security & 2FA
          </button>
        </div>

        {/* Dynamic Toast Feedback inside Modal */}
        {toastMessage && (
          <div className="mt-3 rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-xs font-bold text-cyan-900 flex items-center gap-2 animate-in fade-in duration-200">
            <Check className="h-4 w-4 text-cyan-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto mt-4 pr-1 space-y-4">
          {/* TAB 1: IDENTITY */}
          {activeTab === 'IDENTITY' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Full Official Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Mwila Chileshe"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Staff Employee ID (NWU-STF-XXX)
                  </label>
                  <input
                    type="text"
                    value={formData.staffNumber}
                    onChange={(e) => setFormData({ ...formData, staffNumber: e.target.value })}
                    placeholder="e.g. NWU-STF-001"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-mono font-semibold text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-cyan-700" /> Official College Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. registrar@nwuchas.edu.zm"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-cyan-700" /> Phone Contact (Zambian +260)
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +260977100001"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Briefcase className="h-3 w-3 text-cyan-700" /> Job Title / Designation
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="e.g. Academic Registrar & Council Secretary"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Building className="h-3 w-3 text-cyan-700" /> Department / Directorate
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                  >
                    <option value="Executive Directorate">Executive Directorate</option>
                    <option value="Academic Affairs & Registry">Academic Affairs & Registry</option>
                    <option value="Department of Nursing and Midwifery">Department of Nursing and Midwifery</option>
                    <option value="Department of Clinical Sciences">Department of Clinical Sciences</option>
                    <option value="Department of Public Health">Department of Public Health</option>
                    <option value="Finance & Accounts">Finance & Accounts</option>
                    <option value="Human Resources & Administration">Human Resources & Administration</option>
                    <option value="Clinical Training & Wards">Clinical Training & Wards</option>
                    <option value="ICT & Systems Engineering">ICT & Systems Engineering</option>
                    <option value="Campus Operations & Estates">Campus Operations & Estates</option>
                    <option value="Statutory Inspection & Audit">Statutory Inspection & Audit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Campus Jurisdiction / Scope
                </label>
                <select
                  value={formData.campus}
                  onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                >
                  <option value="Manyama Main Campus">Manyama Main Campus (North-Western Province)</option>
                  <option value="Solwezi Clinical Annex">Solwezi Clinical Annex (General Hospital Placements)</option>
                  <option value="All Campuses (Enterprise)">All Campuses (Enterprise Institutional Authority)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: ROLE & AUTHORITY */}
          {activeTab === 'ROLE' && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Select Primary System Role (RBAC Tier)
                </label>
                <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {Object.entries(ROLE_PRESETS).map(([roleKey, preset]) => {
                    const isSelected = formData.role === roleKey;
                    return (
                      <div
                        key={roleKey}
                        onClick={() => handleRoleChange(roleKey)}
                        className={`cursor-pointer rounded-2xl border p-3.5 transition ${
                          isSelected
                            ? 'border-cyan-600 bg-cyan-50/70 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-black text-cyan-900">
                            {roleKey}
                          </span>
                          <span
                            className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-cyan-600 bg-cyan-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="h-2.5 w-2.5" />}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-bold text-slate-900">{preset.label}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500 leading-normal">{preset.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PERMISSIONS MATRIX */}
          {activeTab === 'PERMISSIONS' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-xs font-bold text-slate-700">
                  Granular Module Access Matrix ({formData.roleTitle})
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectAllPermissions(true)}
                    className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectAllPermissions(false)}
                    className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                  >
                    Clear All
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const preset = ROLE_PRESETS[formData.role] || ROLE_PRESETS.REGISTRAR;
                      setFormData((p) => ({ ...p, permissions: JSON.parse(JSON.stringify(preset.perms)) }));
                    }}
                    className="rounded-lg bg-cyan-50 border border-cyan-200 px-2.5 py-1 text-[11px] font-bold text-cyan-800 hover:bg-cyan-100 flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" /> Reset to Role Default
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Module</th>
                      <th className="px-3 py-3 text-center">View</th>
                      <th className="px-3 py-3 text-center">Create</th>
                      <th className="px-3 py-3 text-center">Edit</th>
                      <th className="px-3 py-3 text-center">Delete</th>
                      <th className="px-3 py-3 text-center">Approve</th>
                      <th className="px-3 py-3 text-center">Export</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MODULE_DEFINITIONS.map((mod) => {
                      const p = formData.permissions?.[mod.key] || DEFAULT_PERMISSIONS[mod.key];
                      return (
                        <tr key={mod.key} className="hover:bg-slate-50/70">
                          <td className="px-4 py-2.5">
                            <p className="font-bold text-slate-900">{mod.label}</p>
                            <p className="text-[10px] text-slate-400">{mod.desc}</p>
                          </td>
                          {(['view', 'create', 'edit', 'delete', 'approve', 'export'] as const).map(
                            (action) => (
                              <td key={action} className="px-3 py-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handlePermissionToggle(mod.key, action)}
                                  className={`inline-flex h-6 w-6 items-center justify-center rounded-md border transition ${
                                    p[action]
                                      ? 'border-cyan-600 bg-cyan-600 text-white shadow-xs'
                                      : 'border-slate-300 bg-white text-transparent hover:border-slate-400'
                                  }`}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            )
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & MFA */}
          {activeTab === 'SECURITY' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
                      <Fingerprint className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Multi-Factor Authentication (TOTP)</h4>
                      <p className="text-[11px] text-slate-500">Google Authenticator, Microsoft Authenticator, or Yubikey</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetMfa}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-800 hover:bg-indigo-100 transition"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Reset TOTP Key
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      MFA Enforcement Policy
                    </label>
                    <select
                      value={formData.mfaStatus}
                      onChange={(e) => setFormData({ ...formData, mfaStatus: e.target.value as any })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
                    >
                      <option value="ENFORCED">ENFORCED (Hardware / App TOTP mandatory)</option>
                      <option value="PENDING">PENDING (Onboarding Grace Period)</option>
                      <option value="EXEMPT">EXEMPT (Emergency / Disaster Recovery)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Account Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
                    >
                      <option value="ACTIVE">ACTIVE (Authorized Full Access)</option>
                      <option value="SUSPENDED">SUSPENDED (Temporary Hold / Leave)</option>
                      <option value="LOCKED">LOCKED (Security Lockout - Failed Logins)</option>
                      <option value="PASSWORD_RESET_REQUIRED">PASSWORD_RESET_REQUIRED</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Active Session Security</p>
                    <p className="text-[11px] text-slate-500">Last login: {formData.lastLogin} from IP {formData.lastLoginIp}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRevokeSessions}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-800 hover:bg-rose-100 transition"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Revoke Active Sessions
                  </button>
                </div>
              </div>
            </div>
          )}

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
