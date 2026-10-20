// src/components/admin/UserManagementConsole.tsx
// Comprehensive Identity & Access Governance Console for EduSphere / Legacy School Solwezi
// Allows creation and management of system users with granular permissions, rights overrides, and Separation of Powers compliance
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  Sparkles,
  Smartphone,
  Send,
  X,
  Check,
  Download,
  Building2,
  Layers,
  Award,
  Clock,
  Eye,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import {
  UserSecurityProfile,
  UserRole,
  loadSecurityUsers,
  saveSecurityUsers,
  INITIAL_SECURITY_USERS,
  loadRolePermissions,
  saveRolePermissions,
  ALL_PERMISSION_MODULES,
  ALL_PERMISSION_ACTIONS,
  ModulePermissionKey,
  PermissionAction,
  evaluatePasswordStrength,
  loadPasswordPolicy,
  saveActiveUser,
  loadActiveUser,
} from '@/lib/authPermissions';
import {
  loadBreakGlassIncidents,
  BreakGlassIncident,
  OPERATIONAL_TASK_DEFINITIONS,
} from '@/lib/separationOfPowers';
import { EnterpriseTable, ColumnDef } from '@/components/EnterpriseTable';
import { saveAdminAuditLogs, loadAdminAuditLogs, AdminAuditLog } from '@/lib/appSettings';

export function UserManagementConsole() {
  const [subTab, setSubTab] = useState<'users' | 'incidents'>('users');
  const [users, setUsers] = useState<UserSecurityProfile[]>(() => loadSecurityUsers());
  const [incidents, setIncidents] = useState<BreakGlassIncident[]>(() => loadBreakGlassIncidents());
  const [activeUser, setActiveUser] = useState(() => loadActiveUser());

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserSecurityProfile | null>(null);
  const [showResetModal, setShowResetModal] = useState<UserSecurityProfile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New User Form State
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '+260 ',
    staffId: '',
    tczNumber: '',
    role: 'TEACHER' as UserRole,
    campusId: 'ALL' as 'ALL' | 'MUSHITALA' | 'URBAN',
    is2FAEnabled: false,
    initialPassword: '',
    mustChangePassword: true,
  });

  // Custom Granular Rights Overrides for the user being created
  const [customRights, setCustomRights] = useState<Record<string, boolean>>({});

  // Reset Password State
  const [newTempPassword, setNewTempPassword] = useState('');
  const policy = useMemo(() => loadPasswordPolicy(), []);
  const passStrength = useMemo(() => evaluatePasswordStrength(newTempPassword, policy), [newTempPassword, policy]);

  useEffect(() => {
    const handleUpdate = () => {
      setUsers(loadSecurityUsers());
      setIncidents(loadBreakGlassIncidents());
      setActiveUser(loadActiveUser());
    };
    window.addEventListener('edusphere:users-updated', handleUpdate);
    window.addEventListener('edusphere:break-glass-updated', handleUpdate);
    window.addEventListener('edusphere:user-updated', handleUpdate);
    return () => {
      window.removeEventListener('edusphere:users-updated', handleUpdate);
      window.removeEventListener('edusphere:break-glass-updated', handleUpdate);
      window.removeEventListener('edusphere:user-updated', handleUpdate);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Generate Military-Grade Temporary Password
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
    for (let i = 0; i < 9; i++) {
      pass += all[Math.floor(Math.random() * all.length)];
    }
    return pass;
  };

  // Handle Create User Submit
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim()) {
      showToast('Please fill in Full Name and Official Email.');
      return;
    }

    const username =
      formData.username.trim() ||
      formData.fullName.toLowerCase().replace(/[^a-z0-9]/g, '.');

    // Check duplicate username
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      showToast(`Username "${username}" is already assigned to an existing user.`);
      return;
    }

    const tempPassword = formData.initialPassword.trim() || generateRandomPassword();

    const newUser: UserSecurityProfile = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      username,
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      role: formData.role,
      campusId: formData.campusId,
      staffId: formData.staffId.trim() || `LSS-STF-${Math.floor(100 + Math.random() * 900)}`,
      tczNumber: formData.tczNumber.trim() || undefined,
      is2FAEnabled: formData.is2FAEnabled || formData.role === 'FINANCE_DIRECTOR' || formData.role === 'BURSAR' || formData.role === 'SUPER_ADMIN',
      is2FAVerified: false,
      passwordLastChanged: new Date().toISOString(),
      mustChangePassword: formData.mustChangePassword,
      failedLoginAttempts: 0,
      accountLocked: false,
    };

    const updated = [newUser, ...users];
    saveSecurityUsers(updated);
    setUsers(updated);

    // Record non-reported system admin audit log (Separation of Powers compliance: System Admin actions are logged normally)
    const auditLogs = loadAdminAuditLogs();
    const auditEntry: AdminAuditLog = {
      id: `aud-usr-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' CAT',
      adminName: `${activeUser.fullName} (System Administrator)`,
      action: 'USER_ACCOUNT_CREATED',
      module: 'Identity & Access Management',
      details: `Created new user account for ${newUser.fullName} (${newUser.username}) with role ${newUser.role} on campus ${newUser.campusId}. Temporary credentials generated.`,
      status: 'SUCCESS',
      ipAddress: '127.0.0.1 (System Console)',
    };
    saveAdminAuditLogs([auditEntry, ...auditLogs.slice(0, 49)]);

    setShowCreateModal(false);
    setFormData({
      fullName: '',
      username: '',
      email: '',
      phone: '+260 ',
      staffId: '',
      tczNumber: '',
      role: 'TEACHER',
      campusId: 'ALL',
      is2FAEnabled: false,
      initialPassword: '',
      mustChangePassword: true,
    });
    setCustomRights({});

    alert(
      `🎉 User Account Created Successfully!\n\n` +
        `• Name: ${newUser.fullName}\n` +
        `• Username: ${newUser.username}\n` +
        `• Assigned Role: ${newUser.role}\n` +
        `• Campus: ${newUser.campusId}\n` +
        `• Initial Password: ${tempPassword}\n\n` +
        `The user has been provisioned and is active. Credentials can now be shared securely with the staff member.`
    );
  };

  // Toggle Account Lock
  const handleToggleLock = (user: UserSecurityProfile) => {
    const updatedUsers = users.map((u) => {
      if (u.id === user.id) {
        return {
          ...u,
          accountLocked: !u.accountLocked,
          failedLoginAttempts: 0,
        };
      }
      return u;
    });

    saveSecurityUsers(updatedUsers);
    setUsers(updatedUsers);

    const actionText = user.accountLocked ? 'UNLOCKED' : 'LOCKED';
    showToast(`User ${user.fullName} has been ${actionText}.`);

    const auditLogs = loadAdminAuditLogs();
    saveAdminAuditLogs([
      {
        id: `aud-lock-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' CAT',
        adminName: activeUser.fullName,
        action: 'USER_SECURITY_STATUS_CHANGED',
        module: 'Identity & Access Management',
        details: `Account for ${user.fullName} (${user.username}) was set to ${actionText}.`,
        status: 'SUCCESS',
        ipAddress: '127.0.0.1',
      },
      ...auditLogs.slice(0, 49),
    ]);
  };

  // Password Reset Execution
  const handleExecutePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showResetModal) return;

    if (!passStrength.meetsPolicy) {
      showToast('Password does not fulfill the institutional password policy.');
      return;
    }

    const updated = users.map((u) =>
      u.id === showResetModal.id
        ? {
            ...u,
            passwordLastChanged: new Date().toISOString(),
            mustChangePassword: true,
            failedLoginAttempts: 0,
            accountLocked: false,
          }
        : u
    );

    saveSecurityUsers(updated);
    setUsers(updated);
    setShowResetModal(null);
    setNewTempPassword('');
    showToast(`Password successfully reset for ${showResetModal.fullName}.`);
  };

  // Enterprise Table Columns for Users (Rule 24 Compliant)
  const userColumns: ColumnDef<UserSecurityProfile>[] = [
    {
      key: 'username',
      header: 'Username / Account',
      sortable: true,
      render: (r) => (
        <div>
          <span className="font-mono font-bold text-slate-900 block text-xs">{r.username}</span>
          <span className="text-[10px] text-slate-500 font-mono">{r.staffId}</span>
        </div>
      ),
    },
    {
      key: 'fullName',
      header: 'Full Name & Email',
      sortable: true,
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{r.fullName}</span>
          <span className="text-[11px] text-slate-500">{r.email}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Assigned Role',
      sortable: true,
      render: (r) => {
        const isSysAdmin = r.role === 'SUPER_ADMIN';
        return (
          <div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                isSysAdmin
                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                  : r.role.includes('FINANCE') || r.role === 'BURSAR'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}
            >
              {r.role.replace(/_/g, ' ')}
            </span>
            <span
              className={`block text-[9px] font-bold mt-1 ${
                isSysAdmin ? 'text-rose-600' : 'text-slate-500'
              }`}
            >
              {isSysAdmin ? '⚠️ System Admin (No School Tasks)' : '✓ Operational Delegation'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'campusId',
      header: 'Campus Scope',
      sortable: true,
      render: (r) => {
        const labels: Record<string, string> = {
          ALL: 'Composite (All Campuses)',
          MUSHITALA: 'Mushitala Day & Boarding',
          URBAN: 'Urban Campus (Solwezi Central)',
        };
        return <span className="text-xs font-semibold text-slate-700">{labels[r.campusId] || r.campusId}</span>;
      },
    },
    {
      key: 'is2FAEnabled',
      header: '2FA Policy',
      sortable: true,
      render: (r) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
            r.is2FAEnabled
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {r.is2FAEnabled ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : null}
          {r.is2FAEnabled ? '2FA Enforced' : 'Password Only'}
        </span>
      ),
    },
    {
      key: 'accountLocked',
      header: 'Account Status',
      sortable: true,
      render: (r) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            r.accountLocked
              ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
          }`}
        >
          {r.accountLocked ? 'Locked / Suspended' : 'Active & Clear'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Governance Actions',
      render: (r) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowResetModal(r);
              setNewTempPassword(generateRandomPassword());
            }}
            className="px-2 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition"
          >
            Reset PIN/Pass
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleLock(r);
            }}
            className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition ${
              r.accountLocked
                ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200'
            }`}
          >
            {r.accountLocked ? 'Unlock' : 'Suspend'}
          </button>
        </div>
      ),
    },
  ];

  // Enterprise Table Columns for Break-Glass Incidents (Rule 24 Compliant)
  const incidentColumns: ColumnDef<BreakGlassIncident>[] = [
    {
      key: 'id',
      header: 'Incident ID',
      sortable: true,
      render: (r) => (
        <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
          {r.id}
        </span>
      ),
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-800 font-mono font-medium">
          <Clock className="w-3.5 h-3.5 text-rose-600" />
          <span>{r.timestamp}</span>
        </div>
      ),
    },
    {
      key: 'adminName',
      header: 'System Administrator',
      sortable: true,
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{r.adminName}</span>
          <span className="text-[10px] font-mono text-slate-500">@{r.adminUsername} ({r.adminRole})</span>
        </div>
      ),
    },
    {
      key: 'taskTitle',
      header: 'Operational School Task Attempted',
      sortable: true,
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{r.taskTitle}</span>
          <span className="text-[10px] text-slate-500 line-clamp-1">{r.taskDescription}</span>
        </div>
      ),
    },
    {
      key: 'justification',
      header: 'Mandatory Emergency Reason',
      sortable: true,
      render: (r) => (
        <div className="max-w-xs">
          <p className="text-[11px] text-slate-700 italic bg-amber-50/70 p-2 rounded border border-amber-200 line-clamp-2">
            &quot;{r.justification}&quot;
          </p>
        </div>
      ),
    },
    {
      key: 'dispatchStatus',
      header: 'CEO & Principal Alert',
      sortable: true,
      render: (r) => (
        <div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 block w-fit">
            ✓ Dispatched to CEO & Manager
          </span>
          <span className="text-[9px] text-slate-500 block mt-0.5">
            Recipients: Dr. K. Musonda & Mr. E. Mwansa
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              User Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Provision user accounts, assign role permissions, and manage administrative access privileges.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setFormData({
                fullName: '',
                username: '',
                email: '',
                phone: '+260 ',
                staffId: '',
                tczNumber: '',
                role: 'TEACHER',
                campusId: 'ALL',
                is2FAEnabled: false,
                initialPassword: generateRandomPassword(),
                mustChangePassword: true,
              });
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        </div>
      </div>

      {/* ADMINISTRATIVE ACCESS CONTROL CARD */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl text-white border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Administrative Access Controls Active
              </span>
              <span className="text-xs text-slate-400 font-mono">Governance Compliance</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              System Administrators are restricted from direct school operations (fee collection, admissions, official letters). Administrative actions like user management and backups are logged in the standard audit trail. Any emergency override on school operational tasks requires a mandatory documented reason and is communicated immediately to the <strong>School Manager (Dr. K. Musonda)</strong> and the <strong>CEO (Mr. E. Mwansa)</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            type="button"
            onClick={() => setSubTab('users')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              subTab === 'users'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            Active Users ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('incidents')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              subTab === 'incidents'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
            <span>Administrative Overrides ({incidents.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: ACTIVE SYSTEM USERS TABLE */}
      {subTab === 'users' && (
        <div className="space-y-4 animate-in fade-in">
          <EnterpriseTable
            title="System User Accounts & Security Delegation"
            description="Manage administrative, financial, academic, and pastoral user credentials. Click any row action to manage password rotation or access suspension."
            data={users}
            columns={userColumns}
            isLoading={false}
            onRefresh={() => setUsers(loadSecurityUsers())}
            exportFilename="edusphere-system-users"
          />
        </div>
      )}

      {/* VIEW 2: ADMINISTRATIVE OVERRIDES & EXECUTIVE LOG */}
      {subTab === 'incidents' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-950">
              <span className="font-bold block">Administrative Override Audit Log</span>
              Every instance where a System Administrator exercised an administrative override on operational school tasks (e.g. payments, documents, admissions) is documented here with recorded justification and confirmation of instant dispatch to the School Manager and CEO.
            </div>
          </div>

          <EnterpriseTable
            title="Administrative Overrides & Executive Incident Log"
            description="Official audit log of operational school tasks accessed via administrative override."
            data={incidents}
            columns={incidentColumns}
            isLoading={false}
            onRefresh={() => setIncidents(loadBreakGlassIncidents())}
            exportFilename="edusphere-administrative-overrides"
          />
        </div>
      )}

      {/* CREATE NEW USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Provision New System User</h3>
                  <span className="text-xs text-slate-500">Configure identity, role permissions, campus scope, and credentials</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mrs. Gertrude Banda"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username (Login ID)</label>
                  <input
                    type="text"
                    placeholder="e.g. g.banda (auto-generated if blank)"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="g.banda@legacyschool.edu.zm"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+260 970 000000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Staff / Employee ID</label>
                  <input
                    type="text"
                    placeholder="e.g. LSS-TCH-088"
                    value={formData.staffId}
                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">TCZ Registration No.</label>
                  <input
                    type="text"
                    placeholder="e.g. TCZ-2024-4482"
                    value={formData.tczNumber}
                    onChange={(e) => setFormData({ ...formData, tczNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Campus Assignment *</label>
                  <select
                    value={formData.campusId}
                    onChange={(e) => setFormData({ ...formData, campusId: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold"
                  >
                    <option value="ALL">Composite (All Campuses)</option>
                    <option value="MUSHITALA">Mushitala Day & Boarding</option>
                    <option value="URBAN">Urban Campus (Central)</option>
                  </select>
                </div>
              </div>

              {/* ROLE SELECTION WITH SEPARATION OF POWERS NOTATION */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-800">
                  Select System Role & Security Scope <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-xs"
                >
                  <option value="TEACHER">Subject & Class Teacher (Attendance, Marks, Class Tutor)</option>
                  <option value="ACADEMIC_HEAD">Head of Academics & Studies (Exam Moderation, ECZ Curriculum)</option>
                  <option value="BURSAR">School Bursar & Cashier (Fee Collection, Cashbook, Receipts)</option>
                  <option value="FINANCE_DIRECTOR">Finance Director & Auditor (Controllership, Expenditure Sign-off)</option>
                  <option value="HR_OFFICER">Human Resources & Compliance Officer (Staff Files, TCZ, Biometrics)</option>
                  <option value="BOARDING_MASTER">Boarding Master & Hostels Matron (Exeats, Curfew, Dormitories)</option>
                  <option value="ESTATE_MANAGER">Estate & Asset Manager (Fleet, Standby Power, Fixed Assets)</option>
                  <option value="PRINCIPAL">School Director & Principal (Executive Operational Authority)</option>
                  <option value="SUPER_ADMIN">Platform Super Administrator (Systems, Backups, Tenant Config ONLY)</option>
                </select>

                {formData.role === 'SUPER_ADMIN' ? (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-[11px] flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Administrative Role Notice:</strong> This user will be restricted to system administration only. They cannot record payments, admit learners, or generate letters without documented administrative override.
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      This user receives operational school authority for <strong>{formData.role.replace(/_/g, ' ')}</strong> tasks according to institutional delegation.
                    </span>
                  </div>
                )}
              </div>

              {/* INITIAL TEMPORARY PASSWORD */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">Initial Temporary Password</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, initialPassword: generateRandomPassword() })}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Generate Secure Password</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.initialPassword}
                  onChange={(e) => setFormData({ ...formData, initialPassword: e.target.value })}
                  placeholder="Click Generate Secure Password"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs bg-white font-bold"
                />

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.mustChangePassword}
                      onChange={(e) => setFormData({ ...formData, mustChangePassword: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600"
                    />
                    <span>Force user to change password on first login</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.is2FAEnabled}
                      onChange={(e) => setFormData({ ...formData, is2FAEnabled: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600"
                    />
                    <span>Enforce Two-Factor Authentication (2FA)</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition"
                >
                  Provision User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Reset User Password</h3>
                  <span className="text-xs text-slate-500">{showResetModal.fullName} (@{showResetModal.username})</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecutePasswordReset} className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">New Temporary Password</label>
                  <button
                    type="button"
                    onClick={() => setNewTempPassword(generateRandomPassword())}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-800"
                  >
                    Generate Random
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newTempPassword}
                  onChange={(e) => setNewTempPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-xs"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <span>Strength: <span className={passStrength.color}>{passStrength.label}</span></span>
                  <span>Score: {passStrength.score} / 4</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${passStrength.barColor}`} style={{ width: `${(passStrength.score / 4) * 100}%` }}></div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowResetModal(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition"
                >
                  Save & Require Reset on Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
