// src/app/academics/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  Printer,
  Eye,
  FileCheck,
  Search,
  BookOpen,
  Award,
  AlertCircle,
} from 'lucide-react';
import { EnterpriseTable, ColumnDef } from '@/components/EnterpriseTable';

export default function AcademicsPage() {
  const [reportCards, setReportCards] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load sample report cards from database or state
  useEffect(() => {
    // Fetch students to display report card options
    fetch('/api/students')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          const sampleReports = json.data.map((learner: any, idx: number) => ({
            id: `rc-${learner.id}`,
            learnerId: learner.id,
            learnerName: `${learner.firstName} ${learner.lastName}`,
            studentNumber: learner.studentNumber,
            className: learner.currentClass?.name || 'Form 2 Green',
            termName: '2026 Term 1',
            status: idx === 0 ? 'PUBLISHED' : idx === 1 ? 'MODERATED' : 'DRAFT',
            aggregateScore: idx === 0 ? 84.5 : idx === 1 ? 76.0 : 68.5,
            rank: `${idx + 1} of 38`,
            teacherRemarks: 'Diligent and consistent effort observed across all learning areas.',
            principalRemarks: 'Approved for progression with honours.',
          }));
          setReportCards(sampleReports);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handlePublish = (id: string) => {
    setReportCards((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'PUBLISHED' } : r))
    );
    alert('Report card successfully approved and published to the Parent Portal!');
  };

  const columns: ColumnDef<any>[] = [
    {
      key: 'studentNumber',
      header: 'Student ID',
      sortable: true,
      render: (r) => <span className="font-mono font-bold text-blue-700">{r.studentNumber}</span>,
    },
    {
      key: 'learnerName',
      header: 'Learner Name',
      sortable: true,
      render: (r) => <span className="font-bold text-slate-900">{r.learnerName}</span>,
    },
    {
      key: 'className',
      header: 'Class Cohort',
      sortable: true,
      filterable: true,
      filterOptions: ['Grade 1A', 'Form 2 Green'],
    },
    {
      key: 'termName',
      header: 'Academic Term',
    },
    {
      key: 'aggregateScore',
      header: 'Average Mark',
      sortable: true,
      render: (r) => (
        <span className="font-bold text-slate-800">
          {r.aggregateScore}%
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Approval State',
      sortable: true,
      filterable: true,
      filterOptions: ['DRAFT', 'MODERATED', 'APPROVED', 'PUBLISHED'],
      render: (r) => {
        const isPublished = r.status === 'PUBLISHED';
        const isModerated = r.status === 'MODERATED';
        return (
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
              isPublished
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isModerated
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {r.status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Academic Governance & Report Cards</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review, moderate, and approve student assessment results. Complies with Ministry of Education curriculum moderation workflows.
        </p>
      </div>

      {/* Moderation Stage Indicator */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Step 1: Draft</span>
          <p className="text-sm font-bold text-slate-800 mt-1">Subject Mark Entry</p>
          <span className="text-xs text-slate-500">Teacher markbook active</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">Step 2: Submitted</span>
          <p className="text-sm font-bold text-slate-800 mt-1">HoD Moderation</p>
          <span className="text-xs text-slate-500">Checking weight consistency</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Step 3: Approved</span>
          <p className="text-sm font-bold text-slate-800 mt-1">Principal Sign-off</p>
          <span className="text-xs text-slate-500">Academic board sanction</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-emerald-200 bg-emerald-50/40">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Step 4: Published</span>
          <p className="text-sm font-bold text-emerald-950 mt-1">Parent Portal Live</p>
          <span className="text-xs text-emerald-700">Printable PDF unlocked</span>
        </div>
      </div>

      {/* Report Cards Table */}
      <EnterpriseTable
        title="Term 1 Report Card Register"
        description="Search learners, view compilation summaries, or publish for parent access"
        data={reportCards}
        columns={columns}
        isLoading={isLoading}
        exportFilename="edusphere-academic-reports"
        rowActions={(row) => (
          <div className="flex items-center gap-1.5 justify-end">
            <button
              onClick={() => setSelectedReport(row)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Card</span>
            </button>
            {row.status !== 'PUBLISHED' && (
              <button
                onClick={() => handlePublish(row.id)}
                className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs"
              >
                Approve & Publish
              </button>
            )}
          </div>
        )}
      />

      {/* Printable Report Card Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl border border-slate-200 print:p-0 print:shadow-none print:border-none">
            {/* Report Header */}
            <div className="text-center pb-6 border-b-2 border-slate-900">
              <div className="w-12 h-12 rounded-xl bg-blue-800 text-white mx-auto flex items-center justify-center font-black text-xl mb-2">
                KCA
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                Kabulonga Combined Academy
              </h2>
              <p className="text-xs text-slate-600">
                P.O. Box 31089, Bishops Road, Kabulonga, Lusaka • Tel: +260 211 261000
              </p>
              <div className="mt-2 inline-block px-4 py-1 rounded bg-slate-100 font-bold text-xs uppercase tracking-widest text-slate-800">
                Official Learner Progress Report Card • 2026 Term 1
              </div>
            </div>

            {/* Learner Info Card */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
              <div>
                <p><span className="font-semibold text-slate-500">Learner Name:</span> <strong className="text-slate-900">{selectedReport.learnerName}</strong></p>
                <p className="mt-1"><span className="font-semibold text-slate-500">Student ID:</span> <strong className="font-mono text-slate-900">{selectedReport.studentNumber}</strong></p>
              </div>
              <div>
                <p><span className="font-semibold text-slate-500">Class Cohort:</span> <strong className="text-slate-900">{selectedReport.className}</strong></p>
                <p className="mt-1"><span className="font-semibold text-slate-500">Attendance:</span> <strong className="text-slate-900">58 / 60 Days (96.7%)</strong></p>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div className="py-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Academic Performance</h4>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50">
                    <th className="py-2 px-3 font-bold text-slate-800">Learning Area / Subject</th>
                    <th className="py-2 px-3 font-bold text-slate-800 text-center">Continuous (40%)</th>
                    <th className="py-2 px-3 font-bold text-slate-800 text-center">Exam (60%)</th>
                    <th className="py-2 px-3 font-bold text-slate-800 text-center">Total (100%)</th>
                    <th className="py-2 px-3 font-bold text-slate-800">Letter Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-900">Mathematics</td>
                    <td className="py-2 px-3 text-center">36 / 40</td>
                    <td className="py-2 px-3 text-center">48.5 / 60</td>
                    <td className="py-2 px-3 text-center font-bold">84.5%</td>
                    <td className="py-2 px-3 font-semibold text-emerald-700">Distinction (1)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-900">English Language</td>
                    <td className="py-2 px-3 text-center">32 / 40</td>
                    <td className="py-2 px-3 text-center">47.0 / 60</td>
                    <td className="py-2 px-3 text-center font-bold">79.0%</td>
                    <td className="py-2 px-3 font-semibold text-blue-700">Merit (2)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-900">Integrated Science</td>
                    <td className="py-2 px-3 text-center">37 / 40</td>
                    <td className="py-2 px-3 text-center">51.0 / 60</td>
                    <td className="py-2 px-3 text-center font-bold">88.0%</td>
                    <td className="py-2 px-3 font-semibold text-emerald-700">Distinction (1)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-900">Social Studies</td>
                    <td className="py-2 px-3 text-center">30 / 40</td>
                    <td className="py-2 px-3 text-center">44.0 / 60</td>
                    <td className="py-2 px-3 text-center font-bold">74.0%</td>
                    <td className="py-2 px-3 font-semibold text-blue-700">Credit (3)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Remarks Section */}
            <div className="py-4 border-t border-slate-200 text-xs space-y-3">
              <div>
                <span className="font-bold text-slate-900">Class Teacher Remarks:</span>
                <p className="text-slate-600 mt-0.5 italic">&ldquo;{selectedReport.teacherRemarks}&rdquo;</p>
              </div>
              <div>
                <span className="font-bold text-slate-900">Headteacher / Principal Approval:</span>
                <p className="text-slate-600 mt-0.5 italic">&ldquo;{selectedReport.principalRemarks}&rdquo;</p>
              </div>
            </div>

            {/* Official Stamp & Security Reference */}
            <div className="pt-6 border-t-2 border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
              <div>
                <p className="font-mono text-slate-700">Verification Hash: EDS-2026-T1-VERIFIED</p>
                <p className="text-[10px]">Issued under Education Act 2011 (Amended 2026)</p>
              </div>
              <div className="text-right">
                <span className="inline-block border border-dashed border-slate-400 px-4 py-2 font-bold text-slate-700 uppercase">
                  Official School Seal
                </span>
              </div>
            </div>

            {/* Action Bar (No-Print) */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-end gap-2 no-print">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close Preview
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
