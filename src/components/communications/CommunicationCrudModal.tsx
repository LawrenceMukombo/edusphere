'use client';

import { useState } from 'react';
import {
  X,
  Send,
  FileText,
  Users,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Trash2,
  Save,
  MessageSquare,
  ShieldCheck,
  Building2,
  Printer,
  Radio,
} from 'lucide-react';

export interface CircularRecord {
  id: string;
  reference: string;
  title: string;
  targetAudience: string;
  channel: 'SMS_WHATSAPP' | 'OFFICIAL_MEMO' | 'PORTAL_NOTICE';
  dateIssued: string;
  status: 'DISPATCHED' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
  recipientsCount: number;
  content: string;
  issuedBy?: string;
  department?: string;
}

interface CommunicationCrudModalProps {
  circular: CircularRecord | null;
  isOpen: boolean;
  isCreateMode?: boolean;
  onClose: () => void;
  onSave: (circular: CircularRecord) => void;
  onDelete?: (id: string) => void;
}

export function CommunicationCrudModal({
  circular,
  isOpen,
  isCreateMode = false,
  onClose,
  onSave,
  onDelete,
}: CommunicationCrudModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'VIEW' | 'EDIT' | 'BROADCAST'>('VIEW');
  const [formData, setFormData] = useState<CircularRecord>(
    circular || {
      id: `cir-${Date.now()}`,
      reference: `NWU/CIR/2026/0${Math.floor(10 + Math.random() * 90)}`,
      title: '',
      targetAudience: 'All Registered Students (Campus-wide)',
      channel: 'SMS_WHATSAPP',
      dateIssued: new Date().toLocaleDateString('en-GB'),
      status: 'DISPATCHED',
      recipientsCount: 420,
      content: '',
      issuedBy: 'Office of the Registrar / Directorate of Academic Affairs',
      department: 'Academic Registry & Communications',
    }
  );

  const [dispatchSms, setDispatchSms] = useState(true);
  const [dispatchWhatsapp, setDispatchWhatsapp] = useState(true);
  const [dispatchPortal, setDispatchPortal] = useState(true);

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(formData);
    onClose();
  }

  function handleRebroadcast(e: React.FormEvent) {
    e.preventDefault();
    const updated: CircularRecord = {
      ...formData,
      status: 'DISPATCHED',
      dateIssued: new Date().toLocaleDateString('en-GB'),
    };
    onSave(updated);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm print:static print:bg-white print:p-0">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl print:max-h-none print:border-none print:p-0 print:shadow-none">
        {/* Anti-Counterfeit Watermark */}
        <div className="pointer-events-none absolute inset-0 select-none overflow-hidden opacity-[0.03] print:opacity-[0.05]">
          <div className="absolute -inset-10 flex flex-wrap items-center justify-around gap-12 rotate-[-25deg] text-[10px] font-black tracking-widest text-slate-900 uppercase">
            {Array.from({ length: 30 }).map((_, i) => (
              <span key={i} className="whitespace-nowrap font-mono">
                NWUCHAS OFFICIAL COMMUNIQUE • AUDITED BROADCAST • ACADEMIC REGISTRY •
              </span>
            ))}
          </div>
        </div>

        {/* Modal Controls */}
        <div className="relative z-10 mb-4 flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-cyan-200 bg-cyan-50 px-2 py-0.5 font-mono text-xs font-bold text-cyan-800">
              {formData.reference}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                formData.status === 'DISPATCHED'
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border border-cyan-200 bg-cyan-50 text-cyan-800'
              }`}
            >
              {formData.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isCreateMode && (
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-xs"
              >
                <Printer className="h-3.5 w-3.5" /> Print Memo
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Action Tabs */}
        {!isCreateMode && (
          <div className="relative z-10 mb-4 flex gap-2 border-b border-slate-100 pb-3 print:hidden">
            <button
              onClick={() => setActiveTab('VIEW')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'VIEW'
                  ? 'bg-cyan-700 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Official Memo View
            </button>
            <button
              onClick={() => setActiveTab('EDIT')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'EDIT'
                  ? 'bg-cyan-700 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Edit Communique
            </button>
            <button
              onClick={() => setActiveTab('BROADCAST')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'BROADCAST'
                  ? 'bg-cyan-700 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Dispatch Channels & Re-broadcast
            </button>
          </div>
        )}

        {/* TAB 1: OFFICIAL MEMO VIEW */}
        {!isCreateMode && activeTab === 'VIEW' && (
          <div className="relative z-10 space-y-5 text-slate-900 print:space-y-4">
            {/* Institutional Header */}
            <div className="border-b-2 border-slate-900 pb-4 text-center">
              <div className="flex items-center justify-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-700 font-black text-lg text-white shadow">
                  NW
                </div>
                <div className="text-left">
                  <h1 className="text-base font-black tracking-tight text-slate-900 uppercase">
                    North Western University College of Health and Applied Sciences
                  </h1>
                  <p className="text-[11px] font-medium text-slate-600">
                    Office of the Registrar • Academic Notices & Regulatory Circulars
                  </p>
                </div>
              </div>
              <div className="mt-3 inline-block rounded-md border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-bold tracking-wider text-slate-800 uppercase">
                Official Institutional Circular
              </div>
            </div>

            {/* Metadata Box */}
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs">
              <div>
                <p className="text-slate-500 font-medium">Circular Reference</p>
                <p className="font-mono font-bold text-slate-900">{formData.reference}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Issued: <span className="font-semibold text-slate-800">{formData.dateIssued}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 font-medium">Target Audience</p>
                <p className="font-bold text-slate-900">{formData.targetAudience}</p>
                <p className="text-[11px] font-semibold text-cyan-800 mt-1">
                  {formData.recipientsCount} verified recipients
                </p>
              </div>
            </div>

            {/* Subject */}
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                {formData.title}
              </h2>
            </div>

            {/* Directive Content */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
              {formData.content}
            </div>

            {/* Signatory Footer */}
            <div className="flex items-end justify-between pt-6 border-t border-slate-200 text-xs">
              <div>
                <div className="h-9 w-28 border-b border-dashed border-slate-400"></div>
                <p className="mt-1 font-bold text-slate-900">Academic Registrar</p>
                <p className="text-[11px] text-slate-500">North Western University College</p>
              </div>

              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5 text-emerald-700 font-bold text-[11px]">
                  <ShieldCheck className="h-4 w-4" /> Validated Statutory Communique
                </div>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                  COMM-HASH: {Math.abs(formData.title.length * 31).toString(16).toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EDIT OR CREATE CIRCULAR */}
        {(isCreateMode || activeTab === 'EDIT') && (
          <form onSubmit={handleFormSubmit} className="relative z-10 mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Reference Number</label>
                <input
                  type="text"
                  required
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Primary Channel</label>
                <select
                  value={formData.channel}
                  onChange={(e: any) => setFormData({ ...formData, channel: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                >
                  <option value="SMS_WHATSAPP">SMS & WhatsApp Urgent Broadcast</option>
                  <option value="OFFICIAL_MEMO">Official Regulatory Institutional Memo</option>
                  <option value="PORTAL_NOTICE">Student Self-Service Portal Bulletin</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Target Audience / Cohort</label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
              >
                <option value="All Registered Students (Campus-wide)">All Registered Students (Campus-wide)</option>
                <option value="Year 1 Nursing & Midwifery Learners (DRN-2026-JAN)">Year 1 Nursing & Midwifery Learners (DRN-2026-JAN)</option>
                <option value="Year 2 Clinical Medicine & Nursing Cohorts">Year 2 Clinical Medicine & Nursing Cohorts</option>
                <option value="Clinical Students on Hospital Attachment (Solwezi & Manyama)">Clinical Students on Hospital Attachment</option>
                <option value="Academic Staff & Clinical Preceptors">Academic Staff & Clinical Preceptors</option>
                <option value="Registered Student Sponsors & Guardians">Registered Student Sponsors & Guardians</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Communique Subject / Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Mandatory NMCZ Student Indexing Verification & Document Submission"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Official Directive Text</label>
              <textarea
                required
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter communique text. Supported formatting: line breaks, bullet points, official deadlines..."
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {!isCreateMode && onDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Are you sure you want to revoke circular ${formData.reference}?`)) {
                      onDelete(formData.id);
                      onClose();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                >
                  <Trash2 className="h-4 w-4" /> Revoke Notice
                </button>
              ) : (
                <div></div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-700 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-cyan-800 transition"
                >
                  <Save className="h-4 w-4" /> {isCreateMode ? 'Publish Communique' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 3: DISPATCH & RE-BROADCAST */}
        {!isCreateMode && activeTab === 'BROADCAST' && (
          <form onSubmit={handleRebroadcast} className="relative z-10 mt-4 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Multi-Channel Dispatch Engine
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Trigger simultaneous broadcast across institutional channels for "{formData.title}".
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={dispatchSms}
                  onChange={(e) => setDispatchSms(e.target.checked)}
                  className="h-4 w-4 rounded text-cyan-600 focus:ring-cyan-500"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5 text-cyan-700" /> SMS Broadcast Gateway (Airtel & MTN Corridors)
                  </p>
                  <p className="text-[11px] text-slate-500">Delivers instantaneous text alert to all student mobile numbers.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={dispatchWhatsapp}
                  onChange={(e) => setDispatchWhatsapp(e.target.checked)}
                  className="h-4 w-4 rounded text-cyan-600 focus:ring-cyan-500"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp Verified Business Broadcast
                  </p>
                  <p className="text-[11px] text-slate-500">High-priority push notification with official college letterhead PDF.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={dispatchPortal}
                  onChange={(e) => setDispatchPortal(e.target.checked)}
                  className="h-4 w-4 rounded text-cyan-600 focus:ring-cyan-500"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 text-indigo-600" /> Student & Sponsor Portal Bulletin Board
                  </p>
                  <p className="text-[11px] text-slate-500">Pins directive to self-service dashboard with acknowledgment prompt.</p>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('VIEW')}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Back
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-700 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-cyan-800 transition"
              >
                <Send className="h-4 w-4" /> Trigger Immediate Broadcast
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
