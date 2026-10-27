'use client';

import { useState, useEffect } from 'react';
import {
  GraduationCap,
  X,
  Check,
  Printer,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  Building,
  HeartPulse,
  Bus,
  QrCode,
  CheckCircle2,
  Lock,
  FileText,
  DollarSign,
  User,
} from 'lucide-react';

export interface StudentProfileRecord {
  id: string;
  studentNumber: string;
  nrcNumber: string;
  name: string;
  programme: string;
  yearOfStudy: string;
  indexingNumber: string;
  council: string;
  tuitionInvoiced: number;
  totalPaid: number;
  balanceOutstanding: number;
  examClearanceStatus: 'GRANTED' | 'WITHHELD_FEES' | 'WITHHELD_ATTENDANCE' | 'WITHHELD_CLINICAL_HOURS';
  attendanceRate: number;
  caScore: number;
  clinicalProceduresLogged: number;
  clinicalProceduresRequired: number;
  hostelRoom: string;
  busPassStatus: 'ACTIVE' | 'EXPIRED';
  sponsorName?: string;
  sponsorPhone?: string;
  clearanceOverrideNote?: string;
}

interface StudentClearanceCrudModalProps {
  student: StudentProfileRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: StudentProfileRecord) => void;
  onDelete?: (id: string) => void;
}

export function StudentClearanceCrudModal({
  student,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: StudentClearanceCrudModalProps) {
  const [formData, setFormData] = useState<StudentProfileRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'CLEARANCE' | 'SLIP'>('CLEARANCE');

  useEffect(() => {
    if (student) {
      setFormData(student);
    }
  }, [student, isOpen]);

  if (!isOpen || !formData) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formData) {
      onSave(formData);
      onClose();
    }
  }

  function handlePrintSlip() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl transition-all sm:p-8 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-800">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                Student & Sponsor Portal • Examination Clearance Terminal
              </span>
              <h3 className="text-lg font-black text-slate-900">
                {formData.name} ({formData.studentNumber})
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

        {/* Tab Toggle */}
        <div className="mt-4 flex gap-2 border-b border-slate-100 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('CLEARANCE')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'CLEARANCE'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Clearance Verification & Overrides
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SLIP')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'SLIP'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Official Examination Docket & Slip
          </button>
        </div>

        {activeTab === 'CLEARANCE' ? (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Student Info Card */}
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs">
              <div>
                <p className="font-bold text-slate-500 uppercase text-[10px]">Programme</p>
                <p className="font-bold text-slate-900 mt-0.5">{formData.programme}</p>
                <p className="text-slate-500 text-[11px]">{formData.yearOfStudy}</p>
              </div>
              <div>
                <p className="font-bold text-slate-500 uppercase text-[10px]">Statutory Indexing</p>
                <p className="font-mono font-bold text-cyan-800 mt-0.5">{formData.indexingNumber}</p>
                <p className="text-slate-500 text-[11px]">{formData.council}</p>
              </div>
              <div>
                <p className="font-bold text-slate-500 uppercase text-[10px]">Attendance & CA Score</p>
                <p className="font-semibold text-slate-800 mt-0.5">
                  Attendance: {formData.attendanceRate}% • CA: {formData.caScore}/40
                </p>
              </div>
              <div>
                <p className="font-bold text-slate-500 uppercase text-[10px]">Clinical Procedures</p>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {formData.clinicalProceduresLogged} / {formData.clinicalProceduresRequired} Completed
                </p>
              </div>
            </div>

            {/* Clearance & Balance Controls */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Examination Clearance Status
                </label>
                <select
                  value={formData.examClearanceStatus}
                  onChange={(e) =>
                    setFormData({ ...formData, examClearanceStatus: e.target.value as any })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
                >
                  <option value="GRANTED">GRANTED (Full Clear for CBT & OSCE)</option>
                  <option value="WITHHELD_FEES">WITHHELD (Tuition Balance Due)</option>
                  <option value="WITHHELD_ATTENDANCE">WITHHELD (Below 85% Roll-Call)</option>
                  <option value="WITHHELD_CLINICAL_HOURS">WITHHELD (Incomplete Ward Hours)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Outstanding Tuition Balance (ZMW)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.balanceOutstanding}
                  onChange={(e) => {
                    const bal = Number(e.target.value);
                    setFormData({
                      ...formData,
                      balanceOutstanding: bal,
                      totalPaid: formData.tuitionInvoiced - bal,
                    });
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-cyan-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Designated Sponsor Name
                </label>
                <input
                  type="text"
                  value={formData.sponsorName || ''}
                  onChange={(e) => setFormData({ ...formData, sponsorName: e.target.value })}
                  placeholder="e.g. Mr. Peter Mutale (Father)"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Sponsor Contact Phone
                </label>
                <input
                  type="text"
                  value={formData.sponsorPhone || ''}
                  onChange={(e) => setFormData({ ...formData, sponsorPhone: e.target.value })}
                  placeholder="e.g. 0967812903"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Administrative Override Justification / Bursary Notes
              </label>
              <textarea
                rows={2}
                value={formData.clearanceOverrideNote || ''}
                onChange={(e) => setFormData({ ...formData, clearanceOverrideNote: e.target.value })}
                placeholder="Required for administrative clearance overrides when fees or attendance are under dispute or covered by bank promissory note."
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                {onDelete && formData?.id && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Are you sure you want to transition ${formData.name} to WITHDRAWN status?`)) {
                        onDelete(formData.id);
                        onClose();
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                  >
                    Withdraw / Archive Student
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
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
                  <Check className="h-4 w-4" /> Save Student Clearance Record
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6">
              <div className="border-b border-slate-200 pb-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-800">
                  NORTH WESTERN UNIVERSITY COLLEGE OF HEALTH AND APPLIED SCIENCES
                </p>
                <p className="text-xs text-slate-500">Office of the Registrar & Bursary • Manyama Main Campus</p>
                <h4 className="mt-2 text-base font-black text-slate-900">
                  SEMESTER 1 OFFICIAL EXAMINATION CLEARANCE DOCKET
                </h4>
                <p className="text-[11px] font-mono text-slate-400">
                  DOCKET NO: DOC-NWU-2026-{(formData.studentNumber || '000').slice(-4)}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500">Student Name</p>
                  <p className="font-bold text-slate-900 mt-0.5">{formData.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500">Student ID / NRC</p>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">
                    {formData.studentNumber} ({formData.nrcNumber})
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500">Programme of Study</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{formData.programme}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500">Council Indexing</p>
                  <p className="font-mono font-semibold text-cyan-800 mt-0.5">{formData.indexingNumber}</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs">
                  <span className="font-semibold text-slate-600">Total Tuition Invoiced:</span>
                  <span className="font-mono font-bold text-slate-900">
                    ZMW {formData.tuitionInvoiced.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 py-2 text-xs">
                  <span className="font-semibold text-slate-600">Total Payments Cleared:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    ZMW {formData.totalPaid.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="font-bold text-slate-900">Outstanding Balance:</span>
                  <span className="font-mono font-bold text-rose-700 text-sm">
                    ZMW {formData.balanceOutstanding.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-cyan-50/70 p-3.5 border border-cyan-200 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-cyan-700" />
                  <div>
                    <p className="font-bold text-cyan-900">
                      Clearance Status: {formData.examClearanceStatus.replace('_', ' ')}
                    </p>
                    <p className="text-[11px] text-cyan-700">
                      Attendance: {formData.attendanceRate}% • CA Mark: {formData.caScore}/40
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-cyan-700 px-3 py-1 font-mono text-[10px] font-bold text-white">
                  VERIFIED
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrintSlip}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
              >
                <Printer className="h-4 w-4 text-slate-500" /> Print Official Examination Docket
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
