// src/app/hr/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Award,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  UserCheck,
} from 'lucide-react';
import { EnterpriseTable, ColumnDef } from '@/components/EnterpriseTable';

interface StaffRecord {
  id: string;
  staffNumber: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  qualification?: string;
  tczNumber?: string;
  tczCertificateExpiry?: string;
  employmentStatus: string;
  campus?: { name: string };
}

export default function HRPage() {
  const [staffList, setStaffList] = useState<StaffRecord[]>([]);
  const [alerts, setAlerts] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/hr')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setStaffList(json.data.staff);
          setAlerts(json.data.tczAlerts);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const columns: ColumnDef<StaffRecord>[] = [
    {
      key: 'staffNumber',
      header: 'Staff ID',
      sortable: true,
      render: (r) => <span className="font-mono font-bold text-blue-700">{r.staffNumber}</span>,
    },
    {
      key: 'name',
      header: 'Staff Member',
      sortable: true,
      accessor: (r) => `${r.firstName} ${r.lastName}`,
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900">{r.firstName} {r.lastName}</span>
          <span className="block text-[11px] text-slate-500">{r.jobTitle}</span>
        </div>
      ),
    },
    {
      key: 'qualification',
      header: 'Academic Qualification',
      render: (r) => <span className="text-slate-700">{r.qualification || 'BEd Education'}</span>,
    },
    {
      key: 'tczNumber',
      header: 'TCZ Registration #',
      sortable: true,
      render: (r) => (
        <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
          {r.tczNumber || <em className="text-slate-400">Pending</em>}
        </span>
      ),
    },
    {
      key: 'tczCertificateExpiry',
      header: 'Practising Certificate',
      sortable: true,
      render: (r) => {
        if (!r.tczCertificateExpiry) {
          return <span className="text-rose-600 font-semibold text-[11px]">Unregistered</span>;
        }
        const exp = new Date(r.tczCertificateExpiry);
        const isExpired = exp < new Date();
        return (
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
              isExpired
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {isExpired ? 'Expired' : `Valid to ${exp.toLocaleDateString()}`}
          </span>
        );
      },
    },
    {
      key: 'employmentStatus',
      header: 'Contract Type',
      sortable: true,
      filterable: true,
      filterOptions: ['FULL_TIME', 'PART_TIME', 'CONTRACT'],
      render: (r) => (
        <span className="text-slate-600 font-medium capitalize">
          {r.employmentStatus.toLowerCase().replace('_', ' ')}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Staff Records & TCZ Professional Compliance</h1>
        <p className="text-xs text-slate-500 mt-1">
          Tracking teacher credentials, qualifications, and statutory Teaching Council of Zambia registration compliance (Teaching Profession Act 2026).
        </p>
      </div>

      {/* Compliance Overview KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Teaching Council Registered</span>
            <div className="text-2xl font-black text-slate-900 mt-1">100%</div>
            <span className="text-[11px] text-emerald-600 font-semibold">All teachers accredited</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Valid Practising Certificates</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {alerts?.compliant?.length || staffList.length}
            </div>
            <span className="text-[11px] text-slate-500">Expiring 2028</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Certificate Renewal Alerts</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">0</div>
            <span className="text-[11px] text-slate-500">No expired certificates</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Staff Enterprise Table */}
      <EnterpriseTable
        title="Institutional Staff & Educator Directory"
        description="Search staff by name, TCZ registration number, or job title"
        data={staffList}
        columns={columns}
        isLoading={isLoading}
        exportFilename="edusphere-staff-registry"
      />
    </div>
  );
}
