// src/components/admin/StaffSecurityManager.tsx
// Enterprise Staff Security & Password Management Console with Real-Time Strength Meter & 30-Day Rotation
'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  RefreshCw,
  Sparkles,
  Smartphone,
  Send,
  X,
  Search,
  Check,
  Sliders,
} from 'lucide-react';
import {
  UserSecurityProfile,
  INITIAL_SECURITY_USERS,
  evaluatePasswordStrength,
  getDaysUntilPasswordExpiry,
  loadPasswordPolicy,
  savePasswordPolicy,
  PasswordPolicyConfig,
  saveActiveUser,
} from '@/lib/authPermissions';
import { saveAdminAuditLogs } from '@/lib/appSettings';

export function StaffSecurityManager() {
  const [users, setUsers] = useState<UserSecurityProfile[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('edusphere_user_security_profiles_v1');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_SECURITY_USERS;
  });

  const [policy, setPolicy] = useState<PasswordPolicyConfig>(() => loadPasswordPolicy());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserForReset, setSelectedUserForReset] = useState<UserSecurityProfile | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [forceChangeOnNextLogin, setForceChangeOnNextLogin] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const persistUsers = (newUsers: UserSecurityProfile[]) => {
    setUsers(newUsers);
    if (typeof window !== 'undefined') {
      localStorage.setItem('edusphere_user_security_profiles_v1', JSON.stringify(newUsers));
      window.dispatchEvent(new Event('edusphere:user-updated'));
    }
  };

  const strength = evaluatePasswordStrength(newPassword, policy);

  // Generate Military-Grade Password
  const generateRandomPassword = () => {
    const charsUpper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const charsLower = 'abcdefghijkmnopqrstuvwxyz';
    const charsNum = '23456789';
    const charsSym = '!@#$%^&*()_+';

    let pass = '';
    pass += charsUpper[Math.floor(Math.random() * charsUpper.length)];
    pass += charsLower[Math.floor(Math.random() * charsLower.length)];
    pass += charsNum[Math.floor(Math.random() * charsNum.length)];
    pass += charsSym[Math.floor(Math.random() * charsSym.length)];

    const all = charsUpper + charsLower + charsNum + charsSym;
    for (let i = 0; i < 10; i++) {
      pass += all[Math.floor(Math.random() * all.length)];
    }

    setNewPassword(pass);
  };

  const handleSavePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForReset) return;

    if (!strength.meetsPolicy) {
      showToast('Password does not fulfill the institutional security requirements.');
      return;
    }

    const updated = users.map((u) => {
      if (u.id === selectedUserForReset.id) {
        return {
          ...u,
          passwordLastChanged: new Date().toISOString(),
          mustChangePassword: forceChangeOnNextLogin,
          failedLoginAttempts: 0,
          accountLocked: false,
        };
      }
      return u;
    });

    persistUsers(updated);

    saveAdminAuditLogs([
      {
        id: `aud-pwd-${Date.now()}`,
        timestamp: new Date().toLocaleString('en-GB') + ' CAT',
        adminName: 'Platform Security Administrator',
        action: 'STAFF_PASSWORD_RESET',
        module: 'Staff Security',
        details: `Reset password for staff member ${selectedUserForReset.fullName} (${selectedUserForReset.staffId}). Strength: ${strength.label}.`,
        status: 'SUCCESS',
        ipAddress: '192.168.10.4 (Security Officer Terminal)',
      },
    ]);

    setSelectedUserForReset(null);
    setNewPassword('');
    showToast(`Password for ${selectedUserForReset.fullName} updated and certified! 🔑`);
  };

  const handleToggle2FA = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        const nextState = !u.is2FAEnabled;
        showToast(
          `${u.fullName}: 2FA ${nextState ? 'Mandated & Enrolled' : 'Deactivated'}.`
        );
        return { ...u, is2FAEnabled: nextState, is2FAVerified: false };
      }
      return u;
    });
    persistUsers(updated);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-top-4 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Overview & Policy Pill Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <KeyRound className="w-6 h-6 text-blue-900" />
              <h2 className="text-lg font-black text-slate-900">
                Staff Account Security & Monthly Password Rotation
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict 30-day credential lifecycle enforcement, live password strength verification, and 2FA credential audits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Mandatory Rotation: Every {policy.rotationPeriodDays} Days</span>
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff by name, staff ID, username, or role..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:border-blue-700"
          />
        </div>
      </div>

      {/* Staff Security Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Staff Identity</th>
                <th className="p-3">Institutional Role</th>
                <th className="p-3">Campus</th>
                <th className="p-3">Password Expiry Status</th>
                <th className="p-3 text-center">2FA Security</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const { daysRemaining, isExpired, statusBadge } = getDaysUntilPasswordExpiry(
                  u.passwordLastChanged,
                  policy.rotationPeriodDays
                );

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3">
                      <div>
                        <span className="font-bold text-slate-900 block">{u.fullName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {u.staffId} • {u.username} • {u.email}
                        </span>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                        {u.role.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="p-3 text-slate-700 font-medium">
                      {u.campusId === 'ALL'
                        ? 'All Campuses'
                        : u.campusId === 'MUSHITALA'
                        ? 'Mushitala Campus'
                        : 'Urban Campus'}
                    </td>

                    <td className="p-3">
                      <div className="space-y-0.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] border ${statusBadge}`}>
                          <Clock className="w-3 h-3" />
                          <span>
                            {isExpired
                              ? 'EXPIRED — Monthly Reset Due!'
                              : `${daysRemaining} days until rotation`}
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          Changed: {new Date(u.passwordLastChanged).toLocaleDateString()}
                        </span>
                      </div>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggle2FA(u.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                          u.is2FAEnabled
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {u.is2FAEnabled ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Enrolled</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3 h-3 text-slate-400" />
                            <span>Disabled</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUserForReset(u);
                          setNewPassword('');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 ml-auto"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                        <span>Reset Password</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Reset Staff Password with Interactive Strength Meter */}
      {selectedUserForReset && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Reset Password for {selectedUserForReset.fullName}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Staff ID: {selectedUserForReset.staffId} • Role: {selectedUserForReset.role}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForReset(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePasswordReset} className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">New Password *</label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Generate Strong Password</span>
                  </button>
                </div>

                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter strong compliant password..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:outline-hidden focus:border-blue-700"
                />
              </div>

              {/* Real-Time Interactive Password Strength Meter */}
              {newPassword.length > 0 && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600">Password Strength:</span>
                    <span className={`font-black ${strength.color}`}>{strength.label}</span>
                  </div>

                  {/* Visual Strength Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex gap-0.5">
                    <div
                      className={`h-full transition-all duration-300 ${strength.barColor}`}
                      style={{ width: `${Math.max(15, (strength.score + 1) * 20)}%` }}
                    />
                  </div>

                  {/* Requirements Live Checklist */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                    <div
                      className={`flex items-center gap-1.5 ${
                        strength.hasLength ? 'text-emerald-700 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {strength.hasLength ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5" />}
                      <span>At least {policy.minLength} characters</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 ${
                        strength.hasUpper ? 'text-emerald-700 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {strength.hasUpper ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5" />}
                      <span>Uppercase letter (A-Z)</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 ${
                        strength.hasLower ? 'text-emerald-700 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {strength.hasLower ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5" />}
                      <span>Lowercase letter (a-z)</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 ${
                        strength.hasNumber ? 'text-emerald-700 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {strength.hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5" />}
                      <span>Numeric digit (0-9)</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 ${
                        strength.hasSpecial ? 'text-emerald-700 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {strength.hasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5" />}
                      <span>Special symbol (!@#$)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Strict Rotation Notice */}
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px]">
                <Clock className="w-4 h-4 text-blue-700 shrink-0" />
                <span>
                  This password will remain valid for <strong>{policy.rotationPeriodDays} days</strong> under the institutional monthly rotation policy.
                </span>
              </div>

              {/* Force Password Change Checkbox */}
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={forceChangeOnNextLogin}
                  onChange={(e) => setForceChangeOnNextLogin(e.target.checked)}
                  className="rounded text-blue-900 focus:ring-blue-600 w-4 h-4"
                />
                <span className="font-semibold">Force staff member to change password upon next login</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedUserForReset(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!strength.meetsPolicy}
                  className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-bold shadow-xs flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                  <span>Certify & Save Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
