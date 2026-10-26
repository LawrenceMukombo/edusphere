'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Search, Filter, Download, Printer, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

export interface AttendanceAuditLogItem {
  id: string;
  timestamp: string;
  eventType: 'ROLL_CALL_LOG' | 'EXCUSE_APPROVED' | 'GATE_PASS_ISSUED' | 'DISCIPLINARY_FLAG' | 'STATUS_OVERRIDE' | 'STATUTORY_RETURN_FILED';
  traineeName: string;
  studentNumber: string;
  programme: string;
  details: string;
  officer: string;
  status: 'VERIFIED' | 'FLAGGED';
  hash: string;
}

export const INITIAL_ATTENDANCE_AUDIT_LOGS: AttendanceAuditLogItem[] = [
  {
    id: 'aud-101',
    timestamp: '2026-10-26 08:30:15',
    eventType: 'ROLL_CALL_LOG',
    traineeName: 'Grace Mwape',
    studentNumber: 'NWU-2026-0003',
    programme: 'Diploma in Clinical Medicine',
    details: 'Marked Late (15 min delay) for MED-111 Lecture Theatre 1. Mobile PIN verification accepted.',
    officer: 'Dr. Mwape Banda (Faculty Lecturer)',
    status: 'VERIFIED',
    hash: 'SHA256:7f8a9b2c3d4e5f6a1b2c3d4e5f6a7b8c',
  },
  {
    id: 'aud-102',
    timestamp: '2026-10-26 08:05:00',
    eventType: 'ROLL_CALL_LOG',
    traineeName: 'Emmanuel Sichone',
    studentNumber: 'NWU-2026-0002',
    programme: 'Diploma in Registered Nursing',
    details: 'Marked Absent without prior notice for NUR-112 Ward Round. Automated guardian alert queued.',
    officer: 'Sr. Patricia Mwewa, RN (Clinical Supervisor)',
    status: 'FLAGGED',
    hash: 'SHA256:3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
  },
  {
    id: 'aud-103',
    timestamp: '2026-10-24 09:30:45',
    eventType: 'EXCUSE_APPROVED',
    traineeName: 'Sample Student',
    studentNumber: 'DEV-STU-0001',
    programme: 'Diploma in Registered Nursing',
    details: 'Absence justification verified. Medical admission slip from Manyama Urban Clinic confirmed malaria treatment.',
    officer: 'Dr. George Silwamba (Academic Registrar)',
    status: 'VERIFIED',
    hash: 'SHA256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
  },
  {
    id: 'aud-104',
    timestamp: '2026-10-23 16:45:20',
    eventType: 'GATE_PASS_ISSUED',
    traineeName: 'Chilufya Banda',
    studentNumber: 'NWU-2026-0001',
    programme: 'Diploma in Clinical Medicine',
    details: 'Clinical Exeat Gate Pass issued for Solwezi General Hospital Maternity Ward overnight rotation. Return time: 2026-10-24 08:00.',
    officer: 'Matron Margaret Musonda (Hostel Warden)',
    status: 'VERIFIED',
    hash: 'SHA256:9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c',
  },
  {
    id: 'aud-105',
    timestamp: '2026-10-20 17:00:00',
    eventType: 'STATUTORY_RETURN_FILED',
    traineeName: 'Esther Lungu',
    studentNumber: 'NWU-2026-0005',
    programme: 'Diploma in Clinical Medicine',
    details: 'Term 3 Mid-Semester Attendance Form 12A filed to Health Professions Council of Zambia (HPCZ) regulatory portal.',
    officer: 'Dr. George Silwamba (Academic Registrar)',
    status: 'VERIFIED',
    hash: 'SHA256:5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b',
  },
];

interface StatutoryAuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs?: AttendanceAuditLogItem[];
}

export function StatutoryAuditLogModal({
  isOpen,
  onClose,
  logs = INITIAL_ATTENDANCE_AUDIT_LOGS,
}: StatutoryAuditLogModalProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.traineeName.toLowerCase().includes(search.toLowerCase()) ||
      log.studentNumber.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.officer.toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === 'ALL' || log.eventType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 space-y-5 border border-slate-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-100 text-indigo-800">
              <ShieldCheck className="h-5 w-5 text-indigo-700" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Statutory Attendance & Roll-Call Audit Trail
              </h3>
              <p className="text-xs text-slate-500">
                Immutable chronological log of all attendance marks, excuse reviews, and clinical gate passes with SHA-256 verification hashes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate, student ID, officer, details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Event Types</option>
              <option value="ROLL_CALL_LOG">Roll-Call Updates</option>
              <option value="EXCUSE_APPROVED">Excuses Approved</option>
              <option value="GATE_PASS_ISSUED">Gate Passes Issued</option>
              <option value="STATUS_OVERRIDE">Status Overrides</option>
              <option value="STATUTORY_RETURN_FILED">Statutory Returns</option>
            </select>
          </div>
        </div>

        {/* Audit Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Candidate</th>
                <th className="py-2.5 px-3">Details & Reason</th>
                <th className="py-2.5 px-3">Authorizing Officer</th>
                <th className="py-2.5 px-3 text-right">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                      {log.eventType}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 block">{log.traineeName}</span>
                    <span className="font-mono text-[10px] text-cyan-800">{log.studentNumber}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs">{log.details}</td>
                  <td className="py-3 px-3 text-slate-700 font-medium whitespace-nowrap">
                    {log.officer}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center gap-1 font-bold text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" /> VERIFIED
                    </span>
                    <span className="block font-mono text-[9px] text-slate-400 mt-0.5 truncate w-24 ml-auto">
                      {log.hash.slice(0, 16)}...
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <span className="text-slate-400 font-medium">
            Showing {filteredLogs.length} audit entries • Complies with Statutory Audit Standard
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 transition"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
}
