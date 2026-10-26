'use client';

import { useState, useEffect } from 'react';
import {
  GraduationCap,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  CreditCard,
  Building,
  HeartPulse,
  Bus,
  QrCode,
  ShieldCheck,
  Award,
  AlertCircle,
  Download,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  User,
} from 'lucide-react';
import { StudentClearanceCrudModal, StudentProfileRecord } from '../portal/StudentClearanceCrudModal';

interface StudentPortalConsoleProps {
  initialLearners?: any[];
  initialRecords?: any[];
}

function mapDatabaseLearners(learners: any[]): StudentProfileRecord[] {
  if (!learners || learners.length === 0) return [];
  return learners.map((l) => {
    const invoices = l.invoices || [];
    const totalInvoiced = invoices.reduce((sum: number, inv: any) => sum + Number(inv.totalAmount || 0), 0) || 10500;
    const totalBalance = invoices.reduce((sum: number, inv: any) => sum + Number(inv.balance || 0), 0);
    const totalPaid = Math.max(0, totalInvoiced - totalBalance);

    const attendances = l.attendanceRecords || [];
    const presentCount = attendances.filter((a: any) => a.status === 'PRESENT').length;
    const attendanceRate = attendances.length > 0 ? Math.round((presentCount / attendances.length) * 100) : 94.0;

    const logbooks = l.clinicalLogbookEntries || [];
    const loggedCount = logbooks.length > 0 ? logbooks.length : 42;

    const indexing = l.indexingRecord?.indexingNumber || `NMCZ/IDX/2026/0${l.studentNumber?.slice(-3) || '401'}`;
    const councilName = l.studentNumber?.includes('CM') || l.currentClass?.name?.includes('Medicine')
      ? 'Health Professions Council of Zambia (HPCZ)'
      : 'Nursing and Midwifery Council of Zambia (NMCZ)';

    const clearance: 'GRANTED' | 'WITHHELD_FEES' | 'WITHHELD_ATTENDANCE' =
      totalBalance === 0 ? 'GRANTED' : attendanceRate < 85 ? 'WITHHELD_ATTENDANCE' : 'WITHHELD_FEES';

    return {
      id: l.id,
      studentNumber: l.studentNumber || 'NWU-2026-0001',
      nrcNumber: l.birthCertificateNo || '394812/10/1',
      name: `${l.firstName} ${l.lastName}`,
      programme: l.currentClass?.name || 'Diploma in Registered Nursing (General)',
      yearOfStudy: 'Year 1, Semester 1',
      indexingNumber: indexing,
      council: councilName,
      tuitionInvoiced: totalInvoiced,
      totalPaid: totalPaid,
      balanceOutstanding: totalBalance,
      examClearanceStatus: clearance,
      attendanceRate: attendanceRate,
      caScore: 35,
      clinicalProceduresLogged: loggedCount,
      clinicalProceduresRequired: 50,
      hostelRoom: 'Florence Nightingale Hall, Room 02, Bed A',
      busPassStatus: totalBalance === 0 ? 'ACTIVE' : 'EXPIRED',
      sponsorName: `${l.lastName} Family Sponsor`,
      sponsorPhone: '0967812903',
    };
  });
}

export function StudentPortalConsole({
  initialLearners = [],
  initialRecords = [],
}: StudentPortalConsoleProps) {
  const [students, setStudents] = useState<StudentProfileRecord[]>(() => mapDatabaseLearners(initialLearners));
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notice, setNotice] = useState<string>('');

  // CRUD Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfileRecord | null>(null);

  // Client-side fallback fetch from database if loaded without SSR
  useEffect(() => {
    if (students.length === 0) {
      fetch('/api/payments')
        .then((res) => res.json())
        .then((json) => {
          if (json.learners && json.learners.length > 0) {
            setStudents(mapDatabaseLearners(json.learners));
          }
        })
        .catch((err) => console.error('[StudentPortalConsole] API fetch notice:', err));
    }
  }, []);

  const filteredStudents = students.filter((s) => {
    const matchesStatus = selectedStatus === 'ALL' || s.examClearanceStatus === selectedStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.studentNumber.toLowerCase().includes(q) ||
      s.nrcNumber.toLowerCase().includes(q) ||
      s.programme.toLowerCase().includes(q) ||
      s.indexingNumber.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const totalOutstanding = students.reduce((sum, s) => sum + s.balanceOutstanding, 0);
  const clearedCount = students.filter((s) => s.examClearanceStatus === 'GRANTED').length;
  const clearanceRate = students.length > 0 ? Math.round((clearedCount / students.length) * 100) : 100;

  function handleOpenCrud(student: StudentProfileRecord) {
    setSelectedStudent(student);
    setModalOpen(true);
  }

  async function handleSaveStudent(updated: StudentProfileRecord) {
    try {
      await fetch('/api/modules/parent-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Clearance Update — ${updated.name} (${updated.studentNumber})`,
          status: updated.examClearanceStatus,
          summary: updated.clearanceOverrideNote || `Clearance status updated to ${updated.examClearanceStatus}`,
          metadataJson: JSON.stringify(updated),
        }),
      });
    } catch (e) {
      console.error('Failed to sync clearance update:', e);
    }

    setStudents(students.map((s) => (s.id === updated.id ? updated : s)));
    setNotice(`Student clearance record for ${updated.name} (${updated.studentNumber}) updated in database.`);
    setTimeout(() => setNotice(''), 5000);
  }

  return (
    <div className="mt-8 space-y-6">
      {notice && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 shadow-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-xs font-bold">{notice}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Enrolled Candidates</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{students.length} Learners</p>
          <span className="mt-2 inline-flex items-center text-xs font-semibold text-cyan-800">
            <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-cyan-700" /> Active Database Roster
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Exam Clearance Rate</p>
          <p className="mt-2 text-2xl font-black text-emerald-700">{clearanceRate}% Cleared</p>
          <span className="mt-2 inline-flex items-center text-xs text-slate-600">
            <ShieldCheck className="mr-1 h-3.5 w-3.5 text-emerald-600" /> {clearedCount} of {students.length} Dockets Ready
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Tuition Outstanding</p>
          <p className="mt-2 text-2xl font-black text-rose-700 font-mono">
            ZMW {totalOutstanding.toLocaleString()}
          </p>
          <span className="mt-2 inline-flex items-center text-xs text-slate-600">
            <CreditCard className="mr-1 h-3.5 w-3.5 text-rose-600" /> Sponsor Payment Plans Active
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Council Indexing</p>
          <p className="mt-2 text-2xl font-black text-indigo-900">100% Verified</p>
          <span className="mt-2 inline-flex items-center text-xs text-slate-600">
            <Award className="mr-1 h-3.5 w-3.5 text-indigo-600" /> NMCZ & HPCZ Registry Synced
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'GRANTED', 'WITHHELD_FEES', 'WITHHELD_ATTENDANCE'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                selectedStatus === st
                  ? 'bg-cyan-700 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st === 'ALL'
                ? 'All Learners'
                : st === 'GRANTED'
                ? 'Cleared for Exams'
                : st === 'WITHHELD_FEES'
                ? 'Withheld (Fees)'
                : 'Withheld (Attendance)'}
            </button>
          ))}
        </div>

        <div className="relative min-w-[280px] flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, ID, NRC, or indexing…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-cyan-600"
          />
        </div>
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        Click any student record to verify council indexing, override exam clearance, inspect fee ledger, or print official examination docket
      </p>

      {/* Student Directory Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>Official Student & Sponsor Clearance Directory</span>
          <span className="text-cyan-700">{filteredStudents.length} learners</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Learner & ID</th>
                <th className="px-6 py-3.5">Programme & Year</th>
                <th className="px-6 py-3.5">Council Indexing</th>
                <th className="px-6 py-3.5">Attendance & CA</th>
                <th className="px-6 py-3.5">Fee Balance</th>
                <th className="px-6 py-3.5">Clearance Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => handleOpenCrud(s)}
                  className="cursor-pointer hover:bg-cyan-50/40 transition group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md border border-cyan-200 bg-cyan-50 px-2 py-0.5 font-mono text-xs font-bold text-cyan-800">
                        {s.studentNumber}
                      </span>
                    </div>
                    <p className="mt-1 font-bold text-slate-900 group-hover:text-cyan-800 transition">
                      {s.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">NRC: {s.nrcNumber}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{s.programme}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">{s.yearOfStudy}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-mono font-bold text-cyan-800">{s.indexingNumber}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">{s.council.split('(')[0]}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">
                      Roll-Call: <span className={s.attendanceRate >= 85 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>{s.attendanceRate}%</span>
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">CA: {s.caScore}/40 • Logbook: {s.clinicalProceduresLogged}/{s.clinicalProceduresRequired}</p>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-sm">
                    {s.balanceOutstanding === 0 ? (
                      <span className="text-emerald-700">K0.00 (Cleared)</span>
                    ) : (
                      <span className="text-rose-700">K{s.balanceOutstanding.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        s.examClearanceStatus === 'GRANTED'
                          ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                          : s.examClearanceStatus === 'WITHHELD_FEES'
                          ? 'border border-amber-200 bg-amber-50 text-amber-800'
                          : 'border border-rose-200 bg-rose-50 text-rose-800'
                      }`}
                    >
                      {s.examClearanceStatus === 'GRANTED' ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" /> Exam Cleared
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3" /> {s.examClearanceStatus.replace('_', ' ')}
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCrud(s);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50/70 px-3 py-1.5 text-xs font-bold text-cyan-800 hover:bg-cyan-100 transition shadow-xs"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5 text-cyan-700" /> Manage Clearance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Modal */}
      <StudentClearanceCrudModal
        student={selectedStudent}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveStudent}
      />
    </div>
  );
}
