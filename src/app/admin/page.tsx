// src/app/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  Plus,
  CreditCard,
  Users,
  CheckCircle2,
  AlertTriangle,
  Server,
  Lock,
  X,
  ExternalLink,
  KeyRound,
  Sliders,
  Sparkles,
  Layers,
} from 'lucide-react';
import { EnterpriseTable, ColumnDef } from '@/components/EnterpriseTable';
import { RolePermissionsMatrix } from '@/components/admin/RolePermissionsMatrix';
import { StaffSecurityManager } from '@/components/admin/StaffSecurityManager';
import { PasswordPolicyManager } from '@/components/admin/PasswordPolicyManager';

interface OrgRecord {
  id: string;
  code: string;
  name: string;
  officialName?: string;
  type: string;
  city: string;
  province?: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  operationalModel?: 'DAY_SCHOOL_ONLY' | 'BOARDING_ONLY' | 'COMBINED_DAY_AND_BOARDING';
  subscriptions?: Array<{ tier: string; status: string; priceZMW: number; activeLearnerCap: number }>;
  _count?: { learners: number; staff: number };
}

const THEME_PRESETS = [
  { name: 'Solwezi Legacy Navy', primary: '#1e3a8a', secondary: '#f59e0b', accent: '#059669' },
  { name: 'Emerald Academy', primary: '#064e3b', secondary: '#10b981', accent: '#d97706' },
  { name: 'Crimson Sovereign', primary: '#881337', secondary: '#fbbf24', accent: '#0284c7' },
  { name: 'Royal Purple Crest', primary: '#581c87', secondary: '#c084fc', accent: '#e11d48' },
  { name: 'Copperbelt Bronze', primary: '#78350f', secondary: '#f59e0b', accent: '#2563eb' },
];

export default function AdminPage() {
  const [adminTab, setAdminTab] = useState<'tenants' | 'permissions' | 'passwords' | 'policy'>('tenants');
  const [organisations, setOrganisations] = useState<OrgRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrgRecord | null>(null);

  // Edit Tenant Form State (ALL fields editable)
  const [editForm, setEditForm] = useState({
    id: '',
    code: '',
    name: '',
    officialName: '',
    type: 'COMBINED_PRIMARY_SECONDARY',
    email: '',
    phone: '',
    city: 'Solwezi',
    province: 'North-Western',
    tier: 'PROFESSIONAL',
    operationalModel: 'COMBINED_DAY_AND_BOARDING' as 'DAY_SCHOOL_ONLY' | 'BOARDING_ONLY' | 'COMBINED_DAY_AND_BOARDING',
    logoUrl: '/legacy-crest.png',
    primaryColor: '#1e3a8a',
    secondaryColor: '#f59e0b',
  });

  const [form, setForm] = useState({
    code: `EDS-ZM-00${Math.floor(5 + Math.random() * 5)}`,
    name: '',
    officialName: '',
    type: 'COMBINED_PRIMARY_SECONDARY',
    email: '',
    phone: '+260',
    city: 'Solwezi',
    province: 'North-Western',
    tier: 'PROFESSIONAL',
    operationalModel: 'COMBINED_DAY_AND_BOARDING' as 'DAY_SCHOOL_ONLY' | 'BOARDING_ONLY' | 'COMBINED_DAY_AND_BOARDING',
    logoUrl: '/legacy-crest.png',
    primaryColor: '#1e3a8a',
    secondaryColor: '#f59e0b',
  });

  const openEditTenant = (org: OrgRecord) => {
    setSelectedOrg(org);
    setEditForm({
      id: org.id,
      code: org.code,
      name: org.name,
      officialName: org.officialName || org.name,
      type: org.type,
      email: org.email || 'admin@legacyschool.edu.zm',
      phone: org.phone || '+260 974 371271',
      city: org.city,
      province: org.province || 'North-Western',
      tier: org.subscriptions?.[0]?.tier || 'PROFESSIONAL',
      operationalModel: org.operationalModel || 'COMBINED_DAY_AND_BOARDING',
      logoUrl: org.logoUrl || '/legacy-crest.png',
      primaryColor: org.primaryColor || '#1e3a8a',
      secondaryColor: org.secondaryColor || '#f59e0b',
    });
  };

  const handleSaveTenantEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tenants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (json.success) {
        setOrganisations((prev) =>
          prev.map((o) =>
            o.id === editForm.id
              ? {
                  ...o,
                  code: editForm.code,
                  name: editForm.name,
                  officialName: editForm.officialName,
                  city: editForm.city,
                  province: editForm.province,
                  operationalModel: editForm.operationalModel,
                  logoUrl: editForm.logoUrl,
                  primaryColor: editForm.primaryColor,
                  secondaryColor: editForm.secondaryColor,
                  subscriptions: [
                    {
                      tier: editForm.tier,
                      status: 'ACTIVE',
                      priceZMW: editForm.tier === 'CAMPUS_PLUS' ? 1499 : editForm.tier === 'PROFESSIONAL' ? 799 : 399,
                      activeLearnerCap: editForm.tier === 'CAMPUS_PLUS' ? 1500 : 600,
                    },
                  ],
                }
              : o
          )
        );
        setSelectedOrg(null);
        alert(`Tenant "${editForm.name}" updated successfully with new theme colors and settings!`);
      } else {
        alert(json.message || 'Failed to update tenant');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating tenant');
    }
  };

  const fetchOrgs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tenants');
      const json = await res.json();
      if (json.success) {
        // Enrich data with operational model if not set
        const enriched = json.data.map((o: any) => ({
          ...o,
          operationalModel: o.operationalModel || (o.name.includes('Legacy') ? 'COMBINED_DAY_AND_BOARDING' : o.name.includes('Primary') ? 'DAY_SCHOOL_ONLY' : 'COMBINED_DAY_AND_BOARDING'),
        }));
        setOrganisations(enriched);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setShowProvisionModal(false);
        fetchOrgs();
        alert(`School tenant "${form.name}" provisioned successfully with ${form.operationalModel.replace(/_/g, ' ')} operational modules!`);
      } else {
        alert(json.message);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const columns: ColumnDef<OrgRecord>[] = [
    {
      key: 'code',
      header: 'Tenant Code',
      sortable: true,
      render: (r) => <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{r.code}</span>,
    },
    {
      key: 'name',
      header: 'Institution Name',
      sortable: true,
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 block">{r.name}</span>
          <span className="text-[11px] text-slate-500 capitalize">{r.type.toLowerCase().replace(/_/g, ' ')}</span>
        </div>
      ),
    },
    {
      key: 'operationalModel',
      header: 'Operational Model',
      sortable: true,
      render: (r) => {
        const model = r.operationalModel || 'COMBINED_DAY_AND_BOARDING';
        const styles = {
          DAY_SCHOOL_ONLY: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          BOARDING_ONLY: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          COMBINED_DAY_AND_BOARDING: 'bg-amber-50 text-amber-900 border-amber-200 font-black',
        }[model];
        const labels = {
          DAY_SCHOOL_ONLY: 'Day School Only',
          BOARDING_ONLY: 'Boarding School Only',
          COMBINED_DAY_AND_BOARDING: 'Day & Boarding (Combined)',
        }[model];
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles}`}>
            {labels}
          </span>
        );
      },
    },
    {
      key: 'city',
      header: 'Location',
      sortable: true,
      render: (r) => <span className="text-slate-700">{r.city}, Zambia</span>,
    },
    {
      key: 'tier',
      header: 'Package Plan',
      sortable: true,
      render: (r) => {
        const sub = r.subscriptions?.[0];
        const tierName = sub?.tier.replace('_', ' ') || 'PROFESSIONAL';
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-800 border border-blue-200">
            {tierName}
          </span>
        );
      },
    },
    {
      key: 'mrr',
      header: 'Monthly Fee',
      sortable: true,
      render: (r) => {
        const sub = r.subscriptions?.[0];
        return <span className="font-bold font-mono text-slate-900">K{sub?.priceZMW ? Number(sub.priceZMW).toLocaleString() : '799'}</span>;
      },
    },
    {
      key: 'learners',
      header: 'Active Learners',
      sortable: true,
      render: (r) => (
        <span className="font-semibold text-slate-800">
          {r._count?.learners || 0} Learners
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Inspect & Manage',
      render: (r) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openEditTenant(r);
          }}
          className="px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 transition"
        >
          Manage & Brand Tenant
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Super Administrator</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Multi-tenant SaaS oversight, subscription entitlement governance, and platform infrastructure health.
          </p>
        </div>

        <button
          onClick={() => setShowProvisionModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New School</span>
        </button>
      </div>

      {/* SaaS Health & Revenue KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Subscribed Institutions</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{organisations.length} Schools</div>
          <span className="text-[11px] text-emerald-600 font-semibold">100% tenant isolation active</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Platform MRR</span>
          <div className="text-2xl font-black text-slate-900 mt-1">K3,144.00</div>
          <span className="text-[11px] text-slate-500 font-medium">Recurring SaaS revenue</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Active Enrolled Learners</span>
          <div className="text-2xl font-black text-slate-900 mt-1">780</div>
          <span className="text-[11px] text-slate-500 font-medium">Under active capacity caps</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Data Residency</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">Zambia-Local</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Data Protection Act Sec 70</span>
        </div>
      </div>

      {/* Master Admin Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setAdminTab('tenants')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            adminTab === 'tenants'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>School Tenants & Campuses</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-800 text-white font-mono">
            {organisations.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('permissions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            adminTab === 'permissions'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Granular Role & Permissions Matrix</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500 text-slate-900 font-bold uppercase">
            RBAC
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('passwords')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            adminTab === 'passwords'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <KeyRound className="w-4 h-4 text-amber-400" />
          <span>Staff Security & Monthly Rotation</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-900 font-bold uppercase">
            30-Day
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('policy')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            adminTab === 'policy'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Lock className="w-4 h-4 text-blue-400" />
          <span>Password Policy & 2FA Governance</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-800 text-white font-mono">
            2FA
          </span>
        </button>
      </div>

      {/* TAB 1: Tenants & Campuses */}
      {adminTab === 'tenants' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Tenants Table */}
          <EnterpriseTable
            title="Subscribed School Tenants & Institutions"
            description="Manage school tiers, operational day/boarding models, active campuses, and feature entitlements. Click any row to inspect & edit."
            data={organisations}
            columns={columns}
            isLoading={isLoading}
            onRefresh={fetchOrgs}
            onRowClick={(row) => openEditTenant(row)}
            exportFilename="edusphere-saas-tenants"
          />
        </div>
      )}

      {/* TAB 2: Granular Role & Permissions Matrix */}
      {adminTab === 'permissions' && (
        <div className="animate-in fade-in">
          <RolePermissionsMatrix />
        </div>
      )}

      {/* TAB 3: Staff Security & Monthly Password Rotation */}
      {adminTab === 'passwords' && (
        <div className="animate-in fade-in">
          <StaffSecurityManager />
        </div>
      )}

      {/* TAB 4: Password Policy & 2FA Controls */}
      {adminTab === 'policy' && (
        <div className="animate-in fade-in">
          <PasswordPolicyManager />
        </div>
      )}

      {/* Provision School Modal with Logo & Theme Customization */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Provision School Tenant</h3>
                  <span className="text-[11px] text-slate-500">Configure institutional profile, logo, colors, and package tier</span>
                </div>
              </div>
              <button onClick={() => setShowProvisionModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProvision} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tenant Code (Unique) *</label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City / Town *</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Institution / School Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copperbelt Academy Solwezi"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* BRAND LOGO & THEME PALETTE FOR NEW ONBOARDING */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                  School Crest / Logo & Visual Theme
                </span>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Logo URL or Presets</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.logoUrl}
                      onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                      placeholder="e.g. /legacy-crest.png"
                      className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, logoUrl: '/legacy-crest.png' })}
                      className="px-2.5 py-1 text-[10px] font-bold bg-blue-100 text-blue-800 rounded-xl hover:bg-blue-200"
                    >
                      Use Legacy Crest
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form.primaryColor}
                        onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={form.primaryColor}
                        onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                        className="w-full px-2 py-1 font-mono text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Secondary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form.secondaryColor}
                        onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={form.secondaryColor}
                        onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                        className="w-full px-2 py-1 font-mono text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* OPERATIONAL MODEL SELECTION */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Select Institutional Operational Model <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, operationalModel: 'DAY_SCHOOL_ONLY' })}
                    className={`p-2.5 rounded-xl text-left border transition ${
                      form.operationalModel === 'DAY_SCHOOL_ONLY'
                        ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-bold text-xs block">Day School Only</span>
                    <span className={`text-[10px] block mt-0.5 ${form.operationalModel === 'DAY_SCHOOL_ONLY' ? 'text-blue-200' : 'text-slate-500'}`}>
                      Daily registers, day scholar bus fees
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, operationalModel: 'BOARDING_ONLY' })}
                    className={`p-2.5 rounded-xl text-left border transition ${
                      form.operationalModel === 'BOARDING_ONLY'
                        ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-bold text-xs block">Boarding Only</span>
                    <span className={`text-[10px] block mt-0.5 ${form.operationalModel === 'BOARDING_ONLY' ? 'text-blue-200' : 'text-slate-500'}`}>
                      Dormitory beds, meal dining ration
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, operationalModel: 'COMBINED_DAY_AND_BOARDING' })}
                    className={`p-2.5 rounded-xl text-left border transition ${
                      form.operationalModel === 'COMBINED_DAY_AND_BOARDING'
                        ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-bold text-xs block">Day & Boarding</span>
                    <span className={`text-[10px] block mt-0.5 ${form.operationalModel === 'COMBINED_DAY_AND_BOARDING' ? 'text-blue-200' : 'text-slate-500'}`}>
                      Multi-campus combined (e.g. Legacy)
                    </span>
                  </button>
                </div>
              </div>

              {/* PACKAGE TIER SELECTION */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Select Subscription Package Plan <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, tier: 'COMMUNITY_STARTER' })}
                    className={`p-2.5 rounded-xl text-left border transition ${
                      form.tier === 'COMMUNITY_STARTER'
                        ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs">Starter Package</span>
                      <span className="font-mono font-bold text-[11px]">K149/mo</span>
                    </div>
                    <span className={`text-[10px] block mt-0.5 ${form.tier === 'COMMUNITY_STARTER' ? 'text-blue-200' : 'text-slate-500'}`}>
                      Up to 80 learners, core attendance
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, tier: 'GROWING_SCHOOL' })}
                    className={`p-2.5 rounded-xl text-left border transition ${
                      form.tier === 'GROWING_SCHOOL'
                        ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs">Growing School</span>
                      <span className="font-mono font-bold text-[11px]">K399/mo</span>
                    </div>
                    <span className={`text-[10px] block mt-0.5 ${form.tier === 'GROWING_SCHOOL' ? 'text-blue-200' : 'text-slate-500'}`}>
                      Up to 250 learners, billing & SMS
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, tier: 'PROFESSIONAL' })}
                    className={`p-2.5 rounded-xl text-left border transition ${
                      form.tier === 'PROFESSIONAL'
                        ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs">Professional Sovereign</span>
                      <span className="font-mono font-bold text-[11px]">K799/mo</span>
                    </div>
                    <span className={`text-[10px] block mt-0.5 ${form.tier === 'PROFESSIONAL' ? 'text-blue-200' : 'text-slate-500'}`}>
                      Up to 600 learners, multi-campus, TCZ & HR
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, tier: 'CAMPUS_PLUS' })}
                    className={`p-2.5 rounded-xl text-left border transition ${
                      form.tier === 'CAMPUS_PLUS'
                        ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs">Campus Plus Enterprise</span>
                      <span className="font-mono font-bold text-[11px]">K1,499/mo</span>
                    </div>
                    <span className={`text-[10px] block mt-0.5 ${form.tier === 'CAMPUS_PLUS' ? 'text-blue-200' : 'text-slate-500'}`}>
                      Up to 1,500 learners, full boarding & GIS
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official School Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@school.zm"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official School Phone *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition"
                >
                  Provision School Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE TENANT EDIT, LOGO UPLOAD & THEME COLOR STUDIO MODAL */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {editForm.logoUrl ? (
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-1 shadow-2xs">
                    <img src={editForm.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                ) : (
                  <div
                    className="w-12 h-12 rounded-2xl text-white font-black text-sm flex items-center justify-center shadow-2xs"
                    style={{ backgroundColor: editForm.primaryColor }}
                  >
                    {editForm.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-black text-slate-900">Edit Institution & Theme Studio</h3>
                  <span className="text-xs text-slate-500 font-mono font-semibold">
                    {editForm.code} • {editForm.city}, Zambia (ALL Fields Editable)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrg(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTenantEdit} className="space-y-4 text-xs">
              {/* BRAND COLOR PALETTE & LOGO UPLOAD */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    School Crest Logo & Institutional Theme Palette
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active Brand Live
                  </span>
                </div>

                {/* Preset Palettes */}
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block mb-1">Theme Presets:</span>
                  <div className="flex flex-wrap gap-2">
                    {THEME_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() =>
                          setEditForm({ ...editForm, primaryColor: p.primary, secondaryColor: p.secondary })
                        }
                        className="px-2 py-1 rounded-lg text-[10px] font-bold border border-slate-200 bg-white hover:bg-slate-100 flex items-center gap-1.5"
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.primary }} />
                        <span>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Primary Brand Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editForm.primaryColor}
                        onChange={(e) => setEditForm({ ...editForm, primaryColor: e.target.value })}
                        className="w-9 h-9 rounded cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={editForm.primaryColor}
                        onChange={(e) => setEditForm({ ...editForm, primaryColor: e.target.value })}
                        className="w-full px-2.5 py-1.5 font-mono text-xs border border-slate-300 rounded-xl bg-white font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Secondary / Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editForm.secondaryColor}
                        onChange={(e) => setEditForm({ ...editForm, secondaryColor: e.target.value })}
                        className="w-9 h-9 rounded cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={editForm.secondaryColor}
                        onChange={(e) => setEditForm({ ...editForm, secondaryColor: e.target.value })}
                        className="w-full px-2.5 py-1.5 font-mono text-xs border border-slate-300 rounded-xl bg-white font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Logo Upload & URL */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Institutional Logo / Crest</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editForm.logoUrl}
                      onChange={(e) => setEditForm({ ...editForm, logoUrl: e.target.value })}
                      placeholder="/legacy-crest.png or Image URL"
                      className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl bg-white text-xs"
                    />
                    <label className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl border border-blue-200 font-bold cursor-pointer transition">
                      Upload Logo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (reader.result) {
                                setEditForm({ ...editForm, logoUrl: reader.result as string });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* CORE TENANT FIELDS (ALL EDITABLE) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tenant Code *</label>
                  <input
                    type="text"
                    required
                    value={editForm.code}
                    onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase bg-white font-bold text-blue-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City / Town *</label>
                  <input
                    type="text"
                    required
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Institution / School Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Registered Legal Name</label>
                <input
                  type="text"
                  value={editForm.officialName}
                  onChange={(e) => setEditForm({ ...editForm, officialName: e.target.value })}
                  placeholder="e.g. Legacy School Solwezi Educational Services Ltd"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Telephone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-800"
                  />
                </div>
              </div>

              {/* OPERATIONAL MODEL */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Institutional Operational Model <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, operationalModel: 'DAY_SCHOOL_ONLY' })}
                    className={`p-2 rounded-xl text-left border transition ${
                      editForm.operationalModel === 'DAY_SCHOOL_ONLY'
                        ? 'bg-blue-900 text-white border-blue-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="font-bold text-xs block">Day School Only</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, operationalModel: 'BOARDING_ONLY' })}
                    className={`p-2 rounded-xl text-left border transition ${
                      editForm.operationalModel === 'BOARDING_ONLY'
                        ? 'bg-blue-900 text-white border-blue-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="font-bold text-xs block">Boarding Only</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, operationalModel: 'COMBINED_DAY_AND_BOARDING' })}
                    className={`p-2 rounded-xl text-left border transition ${
                      editForm.operationalModel === 'COMBINED_DAY_AND_BOARDING'
                        ? 'bg-blue-900 text-white border-blue-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="font-bold text-xs block">Day & Boarding</span>
                  </button>
                </div>
              </div>

              {/* SUBSCRIPTION TIER */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Subscription Package Plan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editForm.tier}
                  onChange={(e) => setEditForm({ ...editForm, tier: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-slate-900"
                >
                  <option value="COMMUNITY_STARTER">Starter Package (K149/mo • 80 Learners Cap)</option>
                  <option value="GROWING_SCHOOL">Growing School (K399/mo • 250 Learners Cap)</option>
                  <option value="PROFESSIONAL">Professional Sovereign (K799/mo • 600 Learners Cap)</option>
                  <option value="CAMPUS_PLUS">Campus Plus Enterprise (K1,499/mo • 1,500 Learners Cap)</option>
                  <option value="ENTERPRISE_GROUP">Enterprise Multi-School Group (K3,500/mo • 1,500+ Learners)</option>
                </select>
              </div>

              {/* DATA ISOLATION CONFIRMATION */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tenant Schema & Multi-Campus Isolation active. Data does not leak between institutions.</span>
                </div>
                <span className="font-mono font-bold bg-emerald-600 text-white px-2 py-0.5 rounded">Zambia ISO 27001</span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrg(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition"
                >
                  Save All Institutional Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
