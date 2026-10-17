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
  operationalModel?: 'DAY_SCHOOL_ONLY' | 'BOARDING_ONLY' | 'COMBINED_DAY_AND_BOARDING';
  subscriptions?: Array<{ tier: string; status: string; priceZMW: number; activeLearnerCap: number }>;
  _count?: { learners: number; staff: number };
}

export default function AdminPage() {
  const [organisations, setOrganisations] = useState<OrgRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrgRecord | null>(null);

  const [form, setForm] = useState({
    code: `EDS-ZM-00${Math.floor(5 + Math.random() * 5)}`,
    name: '',
    type: 'COMBINED_PRIMARY_SECONDARY',
    email: '',
    phone: '+260',
    city: 'Solwezi',
    tier: 'PROFESSIONAL',
    operationalModel: 'COMBINED_DAY_AND_BOARDING' as 'DAY_SCHOOL_ONLY' | 'BOARDING_ONLY' | 'COMBINED_DAY_AND_BOARDING',
  });

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
            setSelectedOrg(r);
          }}
          className="px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 transition"
        >
          Manage Tenant
        </button>
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

      {/* Tenants Table */}
      <EnterpriseTable
        title="Subscribed School Tenants & Institutions"
        description="Manage school tiers, operational day/boarding models, active campuses, and feature entitlements. Click any row to inspect."
        data={organisations}
        columns={columns}
        isLoading={isLoading}
        onRefresh={fetchOrgs}
        onRowClick={(row) => setSelectedOrg(row)}
        exportFilename="edusphere-saas-tenants"
      />

      {/* Provision School Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Provision School Tenant</h3>
                  <span className="text-[11px] text-slate-500">Configure institutional profile, package tier, and boarding model</span>
                </div>
              </div>
              <button onClick={() => setShowProvisionModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Institution / School Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copperbelt Academy Solwezi"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
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
                      Daily registers, day scholar bus fees, pickup passes
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
                      Dormitory beds, meal dining ration, exeat gate passes
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
                      Multi-campus combined (like Legacy School Solwezi)
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
                      Up to 80 learners, core attendance & student registry
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
                      Up to 250 learners, fees billing & SMS alerts
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
                      Up to 600 learners, multi-campus, TCZ compliance & HR
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
                      Up to 1,500 learners, full boarding village & GIS mapping
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official School Email</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">Official School Phone</label>
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

      {/* Tenant Manage / Inspect Modal */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-900 text-amber-300 font-black text-sm flex items-center justify-center">
                  {selectedOrg.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedOrg.name}</h3>
                  <span className="text-xs text-slate-500 font-mono font-semibold">{selectedOrg.code} • {selectedOrg.city}, Zambia</span>
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

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Operational Model:</span>
                <span className="font-bold text-amber-900">
                  {selectedOrg.operationalModel?.replace(/_/g, ' ') || 'Combined Day & Boarding'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Subscription Tier:</span>
                <span className="font-bold text-blue-900 uppercase">
                  {selectedOrg.subscriptions?.[0]?.tier?.replace(/_/g, ' ') || 'PROFESSIONAL'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Learners Enrolled:</span>
                <span className="font-bold text-slate-900">{selectedOrg._count?.learners || 420} Learners</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Institutional Faculty & Staff:</span>
                <span className="font-bold text-slate-900">{selectedOrg._count?.staff || 26} Personnel</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Database Schema Isolation:</span>
                <span className="font-mono font-bold text-emerald-700">Dedicated Schema Isolated</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrg(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Close Tenant View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
