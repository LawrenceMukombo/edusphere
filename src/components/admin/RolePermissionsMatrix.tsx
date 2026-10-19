// src/components/admin/RolePermissionsMatrix.tsx
// Granular Module Permission Matrix & RBAC Console for EduSphere / Legacy School Solwezi
'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Check,
  X,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
  Edit,
  Trash2,
  FileCheck,
  Download,
  Info,
} from 'lucide-react';
import {
  UserRole,
  ModulePermissionKey,
  PermissionAction,
  RolePermissions,
  ALL_PERMISSION_ACTIONS,
  ALL_PERMISSION_MODULES,
  loadRolePermissions,
  saveRolePermissions,
  DEFAULT_ROLE_PERMISSIONS,
} from '@/lib/authPermissions';
import { saveAdminAuditLogs } from '@/lib/appSettings';

const ACTION_LABELS: Record<PermissionAction, { label: string; desc: string }> = {
  view: { label: 'View', desc: 'Read-only access to records & dashboards' },
  create: { label: 'Create', desc: 'Create new entries, invoices, vouchers, or roll-calls' },
  edit: { label: 'Edit', desc: 'Modify existing operational data' },
  delete: { label: 'Delete', desc: 'Soft-delete or void transactions' },
  approve: { label: 'Approve', desc: 'Sign-off marks, leaves, vouchers, or exeat passes' },
  audit: { label: 'Audit', desc: 'Inspect statutory audit logs & provenance records' },
  export: { label: 'Export', desc: 'Download CSV, Excel, or PDF reports' },
};

export function RolePermissionsMatrix() {
  const [matrix, setMatrix] = useState<Record<UserRole, RolePermissions>>(() => loadRolePermissions());
  const [selectedRole, setSelectedRole] = useState<UserRole>('BURSAR');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setMatrix(loadRolePermissions());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentRoleConfig = matrix[selectedRole];

  const handleTogglePermission = (modKey: ModulePermissionKey, action: PermissionAction) => {
    if (selectedRole === 'SUPER_ADMIN') {
      showToast('Super Admin maintains permanent enterprise access across all actions.');
      return;
    }

    const currentVal = currentRoleConfig.permissions[modKey]?.[action] ?? false;
    const updatedRole: RolePermissions = {
      ...currentRoleConfig,
      permissions: {
        ...currentRoleConfig.permissions,
        [modKey]: {
          ...currentRoleConfig.permissions[modKey],
          [action]: !currentVal,
        },
      },
    };

    setMatrix({
      ...matrix,
      [selectedRole]: updatedRole,
    });
  };

  const handleToggleAllForModule = (modKey: ModulePermissionKey, enableAll: boolean) => {
    if (selectedRole === 'SUPER_ADMIN') return;

    const newModulePerms: any = {};
    for (const act of ALL_PERMISSION_ACTIONS) {
      newModulePerms[act] = enableAll;
    }

    const updatedRole: RolePermissions = {
      ...currentRoleConfig,
      permissions: {
        ...currentRoleConfig.permissions,
        [modKey]: newModulePerms,
      },
    };

    setMatrix({
      ...matrix,
      [selectedRole]: updatedRole,
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    saveRolePermissions(matrix);
    saveAdminAuditLogs([
      {
        id: `aud-rbac-${Date.now()}`,
        timestamp: new Date().toLocaleString('en-GB') + ' CAT',
        adminName: 'Platform Administrator',
        action: 'RBAC_PERMISSIONS_UPDATE',
        module: 'System Administration',
        details: `Updated granular access control permissions for role: ${currentRoleConfig.roleName}.`,
        status: 'SUCCESS',
        ipAddress: '192.168.10.4 (Admin Console)',
      },
    ]);

    setTimeout(() => {
      setIsSaving(false);
      showToast(`Granular permissions for ${currentRoleConfig.roleName} saved securely! 🔒`);
    }, 300);
  };

  const handleResetDefaults = () => {
    if (confirm(`Reset all permissions for ${currentRoleConfig.roleName} back to institutional standard?`)) {
      setMatrix({
        ...matrix,
        [selectedRole]: DEFAULT_ROLE_PERMISSIONS[selectedRole],
      });
      showToast(`Permissions reset to standard for ${currentRoleConfig.roleName}.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-top-4 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Role Selector Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-900" />
              <h2 className="text-lg font-black text-slate-900">
                Granular Role-Based Access Control (RBAC)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Define discrete permissions (View, Create, Edit, Delete, Approve, Audit, Export) per module for each institutional role.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Defaults</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving Matrix...' : 'Save Granular Permissions'}</span>
            </button>
          </div>
        </div>

        {/* Role Pills Carousel */}
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Select Role to Configure:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {Object.values(matrix).map((r) => {
              const isSelected = selectedRole === r.role;
              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => setSelectedRole(r.role)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-blue-900 text-white border-blue-900 shadow-md ring-2 ring-blue-900/20'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{r.roleName}</span>
                  {r.requires2FA && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase ${
                        isSelected ? 'bg-amber-400 text-slate-900' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      2FA
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Role Meta Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900">{currentRoleConfig.roleName}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${currentRoleConfig.color}`}>
                {currentRoleConfig.role}
              </span>
              {currentRoleConfig.requires2FA && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  Mandatory 2FA Role
                </span>
              )}
            </div>
            <p className="text-slate-600 mt-1">{currentRoleConfig.description}</p>
          </div>

          <div className="text-[11px] text-slate-500 bg-white px-3 py-2 rounded-xl border border-slate-200">
            <span>Granular Scopes: </span>
            <strong className="text-blue-900">
              {Object.values(currentRoleConfig.permissions).reduce(
                (sum, mod) => sum + Object.values(mod).filter(Boolean).length,
                0
              )}{' '}
              Active Permissions
            </strong>
          </div>
        </div>
      </div>

      {/* Permissions Matrix Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Module Permission Matrix for: {currentRoleConfig.roleName}
          </span>
          <span className="text-[11px] text-slate-500">
            Click checkboxes to grant/revoke discrete actions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 min-w-[200px]">System Module</th>
                {ALL_PERMISSION_ACTIONS.map((act) => (
                  <th key={act} className="p-3 text-center min-w-[80px]">
                    <div className="font-bold capitalize">{ACTION_LABELS[act].label}</div>
                    <span className="text-[9px] text-slate-400 font-normal hidden lg:block">
                      {ACTION_LABELS[act].desc}
                    </span>
                  </th>
                ))}
                <th className="p-3 text-right">Quick Set</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ALL_PERMISSION_MODULES.map((mod) => {
                const perms = currentRoleConfig.permissions[mod.key] || {
                  view: false,
                  create: false,
                  edit: false,
                  delete: false,
                  approve: false,
                  audit: false,
                  export: false,
                };
                const allActive = ALL_PERMISSION_ACTIONS.every((a) => perms[a]);
                const noneActive = ALL_PERMISSION_ACTIONS.every((a) => !perms[a]);

                return (
                  <tr key={mod.key} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <span>{mod.label}</span>
                        {mod.isFinance && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 font-black">
                            FINANCE
                          </span>
                        )}
                      </div>
                    </td>

                    {ALL_PERMISSION_ACTIONS.map((act) => {
                      const isGranted = perms[act];
                      const isSuper = selectedRole === 'SUPER_ADMIN';

                      return (
                        <td key={act} className="p-3 text-center">
                          <button
                            type="button"
                            disabled={isSuper}
                            onClick={() => handleTogglePermission(mod.key, act)}
                            className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center transition border ${
                              isGranted
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-300 border-slate-200'
                            }`}
                            title={`${isGranted ? 'Revoke' : 'Grant'} ${act} on ${mod.label}`}
                          >
                            {isGranted ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      );
                    })}

                    <td className="p-3 text-right whitespace-nowrap">
                      {selectedRole !== 'SUPER_ADMIN' && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleAllForModule(mod.key, true)}
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-blue-700 hover:bg-blue-50 border border-blue-200"
                          >
                            All
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleAllForModule(mod.key, false)}
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 hover:bg-slate-100 border border-slate-200"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
