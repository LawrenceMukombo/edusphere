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
} from 'lucide-react';
import { EnterpriseTable, ColumnDef } from '@/components/EnterpriseTable';

interface OrgRecord {
  id: string;
  code: string;
  name: string;
  type: string;
  city: string;
  subscriptions?: Array<{ tier: string; status: string; priceZMW: number; activeLearnerCap: number }>;
  _count?: { learners: number; staff: number };
}

export default function AdminPage() {
  const [organisations, setOrganisations] = useState<OrgRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProvisionModal, setShowProvisionModal] = useState(false);

  const [form, setForm] = useState({
    code: `EDS-ZM-00${Math.floor(5 + Math.random() * 5)}`,
    name: '',
    type: 'COMBINED_PRIMARY_SECONDARY',
    email: '',
    phone: '+260',
    city: 'Ndola',
    tier: 'GROWING_SCHOOL',
  });

  const fetchOrgs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tenants');
      const json = await res.json();
      if (json.success) {
        setOrganisations(json.data);
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
        alert('School tenant provisioned successfully with isolated database schema!');
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
          <span className="font-bold text-slate-900">{r.name}</span>
          <span className="block text-[11px] text-slate-400 capitalize">{r.type.toLowerCase().replace(/_/g, ' ')}</span>
        </div>
      ),
    },
    {
      key: 'city',
      header: 'Location',
      sortable: true,
      render: (r) => <span className="text-slate-700">{r.city}, Zambia</span>,
    },
    {
      key: 'tier',
      header: 'Subscription Tier',
      sortable: true,
      render: (r) => {
        const sub = r.subscriptions?.[0];
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-800 border border-blue-200">
            {sub?.tier.replace('_', ' ') || 'GROWING SCHOOL'}
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
        return <span className="font-bold font-mono">K{sub?.priceZMW ? Number(sub.priceZMW).toLocaleString() : '399'}</span>;
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
  ];

  return (
    <div className="space-y-6">
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
          <div className="text-2xl font-black text-slate-900 mt-1">K1,347.00</div>
          <span className="text-[11px] text-slate-500 font-medium">Recurring SaaS revenue</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Active Enrolled Learners</span>
          <div className="text-2xl font-black text-slate-900 mt-1">472</div>
          <span className="text-[11px] text-slate-500 font-medium">Under active capacity caps</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Data Residency</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">Zambia-Local</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Data Protection Act Sec 70</span>
        </div>
      </div>

      {/* Tenants Table */}
      <EnterpriseTable
        title="Subscribed School Tenants"
        description="Manage school tiers, active campuses, and feature entitlements"
        data={organisations}
        columns={columns}
        isLoading={isLoading}
        onRefresh={fetchOrgs}
        exportFilename="edusphere-saas-tenants"
      />

      {/* Provision School Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Provision School Tenant</h3>
              </div>
              <button onClick={() => setShowProvisionModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProvision} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tenant Code (Unique)</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">School Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copperbelt Academy"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Institution Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="COMBINED_PRIMARY_SECONDARY">Combined Primary & Sec</option>
                    <option value="PRIMARY_ONLY">Primary School</option>
                    <option value="SECONDARY_ONLY">Secondary School</option>
                    <option value="ECE_CENTRE">ECE Centre</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subscription Tier</label>
                  <select
                    value={form.tier}
                    onChange={(e) => setForm({ ...form, tier: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="COMMUNITY_STARTER">Starter (K149/mo)</option>
                    <option value="GROWING_SCHOOL">Growing (K399/mo)</option>
                    <option value="PROFESSIONAL">Professional (K799/mo)</option>
                    <option value="CAMPUS_PLUS">Campus Plus (K1499/mo)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@school.zm"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Phone</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-2xs"
                >
                  Provision School
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
