'use client';

import { useState } from 'react';
import {
  Send,
  Users,
  FileText,
  ShieldCheck,
  Search,
  Plus,
  Eye,
  Radio,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Building2,
} from 'lucide-react';
import { CommunicationCrudModal, CircularRecord } from '../communications/CommunicationCrudModal';

interface CommunicationsConsoleProps {
  initialNotices?: any[];
  initialRecords?: any[];
}

export function CommunicationsConsole({
  initialNotices = [],
  initialRecords = [],
}: CommunicationsConsoleProps) {
  // Hydrate circulars from live database records
  const hydratedCirculars: CircularRecord[] = initialRecords.length > 0
    ? initialRecords.map((r: any) => {
        if (r.metadataJson) {
          try {
            return JSON.parse(r.metadataJson);
          } catch {
            // fallback
          }
        }
        return {
          id: r.id,
          reference: r.title.split(' — ')[0] || `NWU/CIR/2026/0${r.id.slice(-2)}`,
          title: r.title.split(' — ')[1] || r.title,
          targetAudience: 'Campus-wide / Regulatory',
          channel: 'OFFICIAL_MEMO',
          dateIssued: new Date(r.updatedAt || Date.now()).toLocaleDateString('en-GB'),
          status: (r.status as any) || 'DISPATCHED',
          recipientsCount: 420,
          content: r.summary || '',
          issuedBy: 'Office of the Registrar',
          department: 'Academic Registry',
        };
      })
    : initialNotices.length > 0
    ? initialNotices.map((n: any, idx: number) => ({
        id: n.id,
        reference: `NWU/CIR/2026/0${14 + idx}`,
        title: n.title,
        targetAudience: 'All Registered Students (Campus-wide)',
        channel: 'PORTAL_NOTICE',
        dateIssued: new Date(n.publishedAt || Date.now()).toLocaleDateString('en-GB'),
        status: 'PUBLISHED',
        recipientsCount: 420,
        content: n.content,
        issuedBy: 'Senate & Academic Registry',
        department: 'Academic Affairs',
      }))
    : [
        {
          id: 'cir-1',
          reference: 'NWU/CIR/2026/011',
          title: 'Mandatory NMCZ Student Indexing Verification & Document Submission Deadline',
          targetAudience: 'Year 1 Nursing & Midwifery Learners (RN-2026-JAN)',
          channel: 'OFFICIAL_MEMO',
          dateIssued: '18/10/2026',
          status: 'DISPATCHED',
          recipientsCount: 185,
          content:
            'All newly enrolled Diploma in Registered Nursing learners must submit certified copies of Grade 12 results (5 credits or better including English, Math, Science/Biology) and National Registration Card (NRC) to the Academic Registrar for formal indexing with the Nursing and Midwifery Council of Zambia (NMCZ). Deadline: Friday, 31st October 2026.',
          issuedBy: 'Academic Registrar & Council Liaison Directorate',
          department: 'Academic Registry',
        },
        {
          id: 'cir-2',
          reference: 'NWU/CIR/2026/015',
          title: 'Semester 1 Clinical Placement Rotations — Solwezi General Hospital Attachment',
          targetAudience: 'Year 2 Clinical Medicine & Nursing Cohorts',
          channel: 'SMS_WHATSAPP',
          dateIssued: '20/10/2026',
          status: 'DISPATCHED',
          recipientsCount: 510,
          content:
            'Solwezi General Hospital attachment commences Monday 03 November 2026. Uniform compliance: clean white clinical coat, NWUCHAS photo badge, and stethoscopes mandatory. Bus departs Manyama Campus at 06:15 AM sharp.',
          issuedBy: 'Clinical Practice Directorate',
          department: 'Clinical Learning',
        },
        {
          id: 'cir-3',
          reference: 'NWU/CIR/2026/016',
          title: 'Final Examination Clearance & 85% Roll-Call Policy Notice',
          targetAudience: 'All Registered Students (Campus-wide)',
          channel: 'PORTAL_NOTICE',
          dateIssued: '22/10/2026',
          status: 'PUBLISHED',
          recipientsCount: 420,
          content:
            'In strict compliance with Higher Education Authority (HEA) and Council standards, only learners with an aggregate lecture/ward attendance of at least 85% and a zero outstanding fee balance or approved bursary scheme will be issued digital exam hall entry tokens.',
          issuedBy: 'Office of the Registrar',
          department: 'Senate Examinations',
        },
        {
          id: 'cir-4',
          reference: 'NWU/CIR/2026/017',
          title: 'LamtonPay MTN & Airtel Money Collections Channel Integration Live',
          targetAudience: 'Students and Registered Sponsors/Guardians',
          channel: 'SMS_WHATSAPP',
          dateIssued: '24/10/2026',
          status: 'DISPATCHED',
          recipientsCount: 850,
          content:
            'Tuition and hostel fee payments can now be settled instantly via LamtonPay USSD Push. Use student admission number as reference. Official electronic receipts are posted automatically to the student ledger within 60 seconds.',
          issuedBy: 'Bursary & Student Accounts',
          department: 'Finance Directorate',
        },
      ];

  const [circulars, setCirculars] = useState<CircularRecord[]>(hydratedCirculars);
  const [activeTab, setActiveTab] = useState<'CIRCULARS' | 'COMPOSE' | 'CHANNELS'>('CIRCULARS');
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notice, setNotice] = useState<string>('');

  // CRUD Modal State
  const [selectedCircular, setSelectedCircular] = useState<CircularRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false);

  // Form state for Compose Tab
  const [formTitle, setFormTitle] = useState('');
  const [formCohort, setFormCohort] = useState('ALL_STUDENTS');
  const [formChannel, setFormChannel] = useState<'SMS_WHATSAPP' | 'OFFICIAL_MEMO' | 'PORTAL_NOTICE'>('SMS_WHATSAPP');
  const [formMessage, setFormMessage] = useState('');

  const filteredCirculars = circulars.filter((c) => {
    const matchesChannel = selectedChannel === 'ALL' || c.channel === selectedChannel;
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      !q ||
      (c.title || '').toLowerCase().includes(q) ||
      (c.reference || '').toLowerCase().includes(q) ||
      (c.targetAudience || '').toLowerCase().includes(q) ||
      ((c.department || '').toLowerCase().includes(q));
    return matchesChannel && matchesSearch;
  });

  const totalRecipients = circulars.reduce((acc, curr) => acc + (curr.recipientsCount || 0), 0);

  function handleOpenCreate() {
    setSelectedCircular(null);
    setIsCreateMode(true);
    setIsModalOpen(true);
  }

  function handleOpenRowCrud(c: CircularRecord) {
    setSelectedCircular(c);
    setIsCreateMode(false);
    setIsModalOpen(true);
  }

  async function handleSaveCircular(updated: CircularRecord) {
    if (isCreateMode) {
      setCirculars([updated, ...circulars]);
      setNotice(`Communique "${updated.title}" (${updated.reference}) published and broadcast.`);
      try {
        await fetch('/api/modules/communications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `${updated.reference} — ${updated.title}`,
            status: updated.status,
            summary: updated.content,
            metadataJson: JSON.stringify(updated),
          }),
        });
      } catch (err) {
        console.error('Failed to persist circular creation:', err);
      }
    } else {
      setCirculars(circulars.map((c) => (c.id === updated.id ? updated : c)));
      setNotice(`Communique "${updated.title}" (${updated.reference}) updated.`);
      try {
        await fetch('/api/modules/communications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: updated.id,
            title: `${updated.reference} — ${updated.title}`,
            status: updated.status,
            summary: updated.content,
            metadataJson: JSON.stringify(updated),
          }),
        });
      } catch (err) {
        console.error('Failed to persist circular update:', err);
      }
    }
    setTimeout(() => setNotice(''), 5000);
  }

  async function handleDeleteCircular(id: string) {
    setCirculars(circulars.filter((c) => c.id !== id));
    setNotice('Communique revoked from active notice board.');
    try {
      await fetch(`/api/modules/communications?id=${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to persist circular deletion:', err);
    }
    setTimeout(() => setNotice(''), 5000);
  }

  async function handleSendBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle || !formMessage) return;

    const newCircular: CircularRecord = {
      id: `cir-${Date.now()}`,
      reference: `NWU/CIR/2026/0${circulars.length + 18}`,
      title: formTitle,
      targetAudience: formCohort === 'ALL_STUDENTS' ? 'All Registered Learners (Campus-wide)' : formCohort,
      channel: formChannel,
      dateIssued: new Date().toLocaleDateString('en-GB'),
      status: 'DISPATCHED',
      recipientsCount: formCohort === 'ALL_STUDENTS' ? 420 : 185,
      content: formMessage,
      issuedBy: 'Academic Registrar & Communications Directorate',
      department: 'Registry Communications',
    };

    setCirculars([newCircular, ...circulars]);
    setFormTitle('');
    setFormMessage('');
    setActiveTab('CIRCULARS');
    setNotice(`Broadcast "${newCircular.title}" successfully dispatched to ${newCircular.recipientsCount} recipients.`);

    try {
      await fetch('/api/modules/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${newCircular.reference} — ${newCircular.title}`,
          status: newCircular.status,
          summary: newCircular.content,
          metadataJson: JSON.stringify(newCircular),
        }),
      });
    } catch (err) {
      console.error('Failed to persist broadcast:', err);
    }

    setTimeout(() => setNotice(''), 5000);
  }

  return (
    <div className="mt-8 space-y-6">
      {notice && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 shadow-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-xs font-bold">{notice}</p>
        </div>
      )}

      {/* Institutional Top Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Official Directives</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{circulars.length} Notices</p>
          <span className="mt-2 inline-flex items-center text-xs text-slate-600">
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-cyan-700" /> Audited Institutional Directives
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Broadcast Channels</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">3 Rails Online</p>
          <span className="mt-2 inline-flex items-center text-xs text-slate-600">
            <span className="mr-1.5 h-2 w-2 rounded-full bg-emerald-500" /> SMS Gateway, WhatsApp & Portal
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Audience Reached</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 font-mono">
            {totalRecipients.toLocaleString()}
          </p>
          <span className="mt-2 inline-flex items-center text-xs text-slate-600">
            <Users className="mr-1.5 h-3.5 w-3.5 text-slate-500" /> Students, Preceptors & Sponsors
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Regulatory Directives</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">100% Compliant</p>
          <span className="mt-2 inline-flex items-center text-xs text-slate-600">
            <FileText className="mr-1.5 h-3.5 w-3.5 text-slate-500" /> NMCZ, HPCZ & HEA Circulars
          </span>
        </div>
      </div>

      {/* Institutional Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('CIRCULARS')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'CIRCULARS'
                ? 'bg-cyan-700 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FileText className="h-4 w-4" />
            Official Notices & Directives ({circulars.length})
          </button>

          <button
            onClick={() => setActiveTab('COMPOSE')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'COMPOSE'
                ? 'bg-cyan-700 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Send className="h-4 w-4" />
            Compose Broadcast / SMS Alert
          </button>

          <button
            onClick={() => setActiveTab('CHANNELS')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'CHANNELS'
                ? 'bg-cyan-700 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Radio className="h-4 w-4" />
            Dispatch Rails & Gateway Status
          </button>
        </div>

        {activeTab === 'CIRCULARS' && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <Plus className="h-4 w-4" /> + Issue Official Notice
          </button>
        )}
      </div>

      {/* TAB 1: Institutional OFFICIAL NOTICES DATA TABLE */}
      {activeTab === 'CIRCULARS' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              {['ALL', 'SMS_WHATSAPP', 'OFFICIAL_MEMO', 'PORTAL_NOTICE'].map((ch) => (
                <button
                  key={ch}
                  onClick={() => setSelectedChannel(ch)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedChannel === ch
                      ? 'bg-teal-800 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {ch === 'ALL'
                    ? 'All Channels'
                    : ch === 'SMS_WHATSAPP'
                    ? 'SMS / WhatsApp'
                    : ch === 'OFFICIAL_MEMO'
                    ? 'Official Memo'
                    : 'Portal Notice'}
                </button>
              ))}
            </div>

            <div className="relative min-w-[260px] flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reference, subject, department…"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-cyan-600"
              />
            </div>
          </div>

          {/* Clean Institutional Data Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Reference</th>
                    <th className="px-5 py-3.5">Directive Title & Department</th>
                    <th className="px-5 py-3.5">Target Audience</th>
                    <th className="px-5 py-3.5">Channel</th>
                    <th className="px-5 py-3.5">Date Issued</th>
                    <th className="px-5 py-3.5">Audience Size</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredCirculars.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                        No circulars found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCirculars.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => handleOpenRowCrud(c)}
                        className="cursor-pointer hover:bg-slate-50 transition"
                      >
                        <td className="px-5 py-3.5 font-mono font-medium text-cyan-800 whitespace-nowrap">
                          {c.reference}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-slate-900 line-clamp-1">{c.title}</p>
                          <p className="text-[11px] text-slate-500">{c.issuedBy || c.department || 'Registrar'}</p>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">
                          {c.targetAudience}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="font-medium text-slate-700">
                            {c.channel === 'SMS_WHATSAPP'
                              ? 'SMS & WhatsApp'
                              : c.channel === 'OFFICIAL_MEMO'
                              ? 'Official Memo'
                              : 'Student Portal'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                          {c.dateIssued}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap font-mono text-slate-800">
                          {c.recipientsCount}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {c.status === 'DISPATCHED' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Dispatched
                            </span>
                          ) : c.status === 'PUBLISHED' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Published
                            </span>
                          ) : c.status === 'SCHEDULED' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Scheduled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Archived
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenRowCrud(c);
                            }}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-500" /> View & Manage
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500">
              <span>Showing {filteredCirculars.length} of {circulars.length} institutional notices</span>
              <span>All records synchronized with College Audit Ledger</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPOSE BROADCAST */}
      {activeTab === 'COMPOSE' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">Broadcast Official Notice or Emergency Alert</h3>
            <p className="mt-1 text-xs text-slate-500">
              Directives are immediately archived in the official register and dispatched through selected institutional rails.
            </p>
          </div>

          <form onSubmit={handleSendBroadcast} className="mt-6 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Notice Title / Subject Reference</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Mandatory Hospital Preceptorship Orientation Notice"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-cyan-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Target Cohort / Distribution Group</label>
                <select
                  value={formCohort}
                  onChange={(e) => setFormCohort(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-cyan-600 focus:bg-white"
                >
                  <option value="ALL_STUDENTS">Campus-wide (All Enrolled Learners — 420 Students)</option>
                  <option value="Year 1 Nursing (DRN-2026-JAN)">Year 1 Registered Nursing (DRN-2026-JAN)</option>
                  <option value="Year 2 Clinical Medicine">Year 2 Clinical Medicine (DCM-2025-JAN)</option>
                  <option value="FACULTY_AND_PRECEPTORS">Faculty Lecturers & Hospital Preceptors</option>
                  <option value="SPONSORS_AND_GUARDIANS">Registered Fee Sponsors & Guardians</option>
                </select>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Primary Delivery Channel</label>
                <select
                  value={formChannel}
                  onChange={(e) => setFormChannel(e.target.value as any)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-cyan-600 focus:bg-white"
                >
                  <option value="SMS_WHATSAPP">SMS Gateway & WhatsApp Broadcast</option>
                  <option value="OFFICIAL_MEMO">Official Senate Directive Memo (PDF)</option>
                  <option value="PORTAL_NOTICE">Student Self-Service Portal Notice Board</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Authorizing Officer</label>
                <input
                  type="text"
                  disabled
                  value="Office of the Academic Registrar (Manyama Campus)"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Official Directive Text / Message Body</label>
              <textarea
                required
                rows={5}
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                placeholder="Enter formal communication text. Reference relevant statutory bodies (NMCZ, HPCZ, HEA) and deadlines where applicable..."
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed font-medium text-slate-900 outline-none focus:border-cyan-600 focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('CIRCULARS')}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-700 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-cyan-800 transition"
              >
                <Send className="h-4 w-4" /> Dispatch Directive
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: GATEWAY STATUS */}
      {activeTab === 'CHANNELS' && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 text-sm">Zamtel & Airtel SMS Rail</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              Direct short-code gateway for mission-critical notifications, roll-call alerts, and emergency clinical rotation changes.
            </p>
            <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500 flex justify-between">
              <span>Latency: <strong>1.4s</strong></span>
              <span>Delivery Rate: <strong>99.8%</strong></span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 text-sm">WhatsApp Cloud Business API</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Connected
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              Official institutional channel for student payment receipts, examination clearance barcodes, and circular PDFs.
            </p>
            <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500 flex justify-between">
              <span>Verified ID: <strong>NWUCHAS-EDU</strong></span>
              <span>Throughput: <strong>60 msg/min</strong></span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 text-sm">Student Portal Notice Engine</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Synchronized
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              Real-time in-app broadcast board rendered on student and sponsor dashboards upon institutional authorization.
            </p>
            <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500 flex justify-between">
              <span>Cache: <strong>Redis (0ms)</strong></span>
              <span>Audit: <strong>Immutable</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Institutional CRUD Modal */}
      <CommunicationCrudModal
        circular={selectedCircular}
        isOpen={isModalOpen}
        isCreateMode={isCreateMode}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCircular}
        onDelete={handleDeleteCircular}
      />
    </div>
  );
}
