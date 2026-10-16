// src/app/admissions/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { EnterpriseTable, ColumnDef } from '@/components/EnterpriseTable';
import {
  UserPlus,
  Eye,
  CheckCircle2,
  Calendar,
  Building,
  ShieldCheck,
  X,
  Phone,
  Mail,
  User,
  GraduationCap,
  AlertTriangle,
} from 'lucide-react';

interface LearnerRecord {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  status: string;
  campus?: { name: string };
  currentClass?: { name: string; stage: string };
  guardians?: Array<{
    relationship: string;
    guardian: { firstName: string; lastName: string; phone: string; email?: string };
  }>;
}

export default function AdmissionsPage() {
  const [learners, setLearners] = useState<LearnerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [selectedLearner, setSelectedLearner] = useState<any | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    studentNumber: `EDS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    firstName: '',
    lastName: '',
    gender: 'MALE',
    dateOfBirth: '2015-05-10',
    campusId: '',
    classId: '',
    emergencyContact: '',
    guardianFirstName: '',
    guardianLastName: '',
    guardianPhone: '',
    guardianRelationship: 'FATHER',
  });

  const fetchLearners = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/students');
      const json = await res.json();
      if (json.success) {
        setLearners(json.data);
      } else {
        setError(json.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLearners();
  }, []);

  const openLearnerProfile = async (id: string) => {
    setProfileLoading(true);
    setSelectedLearner(null);
    try {
      const res = await fetch(`/api/students/${id}`);
      const json = await res.json();
      if (json.success) {
        setSelectedLearner(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAdmitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        studentNumber: formData.studentNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        emergencyContact: formData.emergencyContact,
        campusId: learners[0]?.campus?.name ? (learners[0] as any).campusId : undefined,
      };

      if (formData.guardianFirstName && formData.guardianPhone) {
        payload.guardian = {
          firstName: formData.guardianFirstName,
          lastName: formData.guardianLastName || formData.lastName,
          phone: formData.guardianPhone,
          relationship: formData.guardianRelationship,
        };
      }

      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setShowAdmitModal(false);
        fetchLearners();
        setFormData({
          studentNumber: `EDS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          firstName: '',
          lastName: '',
          gender: 'MALE',
          dateOfBirth: '2015-05-10',
          campusId: '',
          classId: '',
          emergencyContact: '',
          guardianFirstName: '',
          guardianLastName: '',
          guardianPhone: '',
          guardianRelationship: 'FATHER',
        });
      } else {
        alert(json.message || 'Error admitting learner');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Enterprise Table Columns (Rule 24)
  const columns: ColumnDef<LearnerRecord>[] = [
    {
      key: 'studentNumber',
      header: 'Student ID',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
          {row.studentNumber}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Learner Name',
      sortable: true,
      accessor: (row) => `${row.firstName} ${row.lastName}`,
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900">{row.firstName} {row.lastName}</span>
          <span className="block text-[11px] text-slate-400 capitalize">{row.gender.toLowerCase()}</span>
        </div>
      ),
    },
    {
      key: 'currentClass',
      header: 'Class / Stage',
      sortable: true,
      accessor: (row) => row.currentClass?.name || 'Unassigned',
      filterable: true,
      filterOptions: ['Grade 1A', 'Form 2 Green', 'Reception Stars'],
      render: (row) => (
        <span className="font-medium text-slate-700">
          {row.currentClass?.name || <em className="text-slate-400">Not assigned</em>}
        </span>
      ),
    },
    {
      key: 'campus',
      header: 'Campus Branch',
      sortable: true,
      accessor: (row) => row.campus?.name || 'Main Campus',
      render: (row) => (
        <span className="text-slate-600">{row.campus?.name || 'Main Campus'}</span>
      ),
    },
    {
      key: 'guardian',
      header: 'Primary Guardian',
      accessor: (row) => row.guardians?.[0]?.guardian?.firstName || 'None',
      render: (row) => {
        const g = row.guardians?.[0];
        if (!g) return <span className="text-slate-400 italic">No link</span>;
        return (
          <div>
            <span className="font-semibold text-slate-800">
              {g.guardian.firstName} {g.guardian.lastName} ({g.relationship})
            </span>
            <span className="block text-[11px] text-slate-500 font-mono">{g.guardian.phone}</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['ENROLLED', 'APPLICANT', 'TRANSFERRED_OUT', 'ALUMNI'],
      render: (row) => (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admissions & Student Information System</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete institutional learner registry, continuous longitudinal records, and verified guardian linking.
          </p>
        </div>

        <button
          onClick={() => setShowAdmitModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-600/30 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Admission</span>
        </button>
      </div>

      {/* Enterprise Table (Rule 24 compliant) */}
      <EnterpriseTable
        title="Enrolled Learners Registry"
        description="Search by learner name, student ID, or guardian contact"
        data={learners}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefresh={fetchLearners}
        exportFilename="edusphere-students-registry"
        rowActions={(row) => (
          <button
            onClick={() => openLearnerProfile(row.id)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition inline-flex items-center gap-1 font-semibold text-xs"
            title="View Full Profile & Longitudinal Record"
          >
            <Eye className="w-4 h-4" />
            <span>Profile</span>
          </button>
        )}
      />

      {/* New Admission Modal */}
      {showAdmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Admit New Learner</h3>
              </div>
              <button
                onClick={() => setShowAdmitModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdmitSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Student ID</label>
                  <input
                    type="text"
                    required
                    value={formData.studentNumber}
                    onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kondwani"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mwewa"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    placeholder="+260977..."
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Guardian section */}
              <div className="pt-3 border-t border-slate-100">
                <span className="block text-xs font-bold text-slate-800 mb-2">Primary Guardian Link</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Guardian First Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Kabaso"
                      value={formData.guardianFirstName}
                      onChange={(e) => setFormData({ ...formData, guardianFirstName: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Guardian Phone (WhatsApp/SMS)</label>
                    <input
                      type="tel"
                      placeholder="+260977..."
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdmitModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Submit Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pupil Profile Drawer Modal */}
      {selectedLearner && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedLearner.studentNumber}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {selectedLearner.firstName} {selectedLearner.lastName}
                </h3>
                <p className="text-xs text-slate-500">
                  Current Class: {selectedLearner.currentClass?.name || 'Unassigned'} • Campus: {selectedLearner.campus?.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedLearner(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Tabs Content */}
            <div className="mt-6 space-y-6">
              {/* Linked Guardians */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Verified Guardians</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedLearner.guardians?.map((rel: any) => (
                    <div key={rel.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{rel.guardian.firstName} {rel.guardian.lastName}</span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                          {rel.relationship}
                        </span>
                      </div>
                      <div className="mt-2 text-slate-600 space-y-1">
                        <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {rel.guardian.phone}</p>
                        {rel.guardian.email && <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {rel.guardian.email}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Longitudinal Academics & Report Cards */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Academic History & Report Cards</h4>
                {selectedLearner.reportCards?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedLearner.reportCards.map((rc: any) => (
                      <div key={rc.id} className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-xs flex items-center justify-between">
                        <div>
                          <span className="font-bold text-emerald-900">{rc.term.name} Report Card (v{rc.versionNumber})</span>
                          <p className="text-[11px] text-emerald-700 mt-0.5">
                            Teacher remarks: &ldquo;{rc.teacherRemarks}&rdquo;
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]">
                          {rc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No historical report cards published yet.</p>
                )}
              </div>

              {/* Fee Accounts */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Recent Invoices</h4>
                {selectedLearner.invoices?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedLearner.invoices.map((inv: any) => (
                      <div key={inv.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-slate-800">{inv.invoiceNumber}</span>
                          <p className="text-[11px] text-slate-500">Total: K{Number(inv.totalAmount).toLocaleString()} • Paid: K{Number(inv.paidAmount).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-rose-700">Balance: K{Number(inv.balance).toLocaleString()}</span>
                          <span className="block text-[10px] font-semibold text-slate-500">{inv.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No invoices issued.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
