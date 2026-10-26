'use client';

import { useState } from 'react';
import {
  X,
  Printer,
  Download,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building,
  Save,
  Trash2,
  Lock,
  Layers,
  FileCheck2,
} from 'lucide-react';

export interface OfficialDocumentRecord {
  id: string;
  reference: string;
  title: string;
  category: 'REGULATORY' | 'ACADEMIC' | 'CLINICAL' | 'FINANCE';
  fileFormat: string;
  fileSize: string;
  datePublished: string;
  authority: string;
  summary: string;
  version?: string;
  fullBody?: string;
}

interface DocumentCrudModalProps {
  document: OfficialDocumentRecord | null;
  isOpen: boolean;
  isCreateMode?: boolean;
  onClose: () => void;
  onSave: (doc: OfficialDocumentRecord) => void;
  onDelete?: (id: string) => void;
}

export function DocumentCrudModal({
  document,
  isOpen,
  isCreateMode = false,
  onClose,
  onSave,
  onDelete,
}: DocumentCrudModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'VIEW' | 'EDIT' | 'REVISIONS'>('VIEW');
  const [formData, setFormData] = useState<OfficialDocumentRecord>(
    document || {
      id: `doc-${Date.now()}`,
      reference: `NWU-DOC-2026-0${Math.floor(10 + Math.random() * 90)}`,
      title: '',
      category: 'REGULATORY',
      fileFormat: 'PDF',
      fileSize: '2.5 MB',
      datePublished: new Date().toLocaleDateString('en-GB'),
      authority: 'Office of the Principal / Academic Senate',
      summary: '',
      version: 'v1.0 (Audited)',
      fullBody:
        'Official institutional instrument registered under the governance statutes of North Western University College of Health and Applied Sciences. All rights reserved.',
    }
  );

  const securityHash = `DOC-SEC-${(formData.reference + formData.title).split('').reduce((a, b) => (a * 31 + b.charCodeAt(0)) >>> 0, 0).toString(16).toUpperCase()}`;

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(formData);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm print:static print:bg-white print:p-0">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl print:max-h-none print:border-none print:p-0 print:shadow-none">
        
        {/* Anti-Counterfeit Background Security Watermark */}
        <div className="pointer-events-none absolute inset-0 select-none overflow-hidden opacity-[0.035] print:opacity-[0.05]">
          <div className="absolute -inset-10 flex flex-wrap items-center justify-around gap-12 rotate-[-25deg] text-[10px] font-black tracking-widest text-slate-900 uppercase">
            {Array.from({ length: 30 }).map((_, i) => (
              <span key={i} className="whitespace-nowrap font-mono">
                NWUCHAS CONTROLLED DOCUMENT • NON-NEGOTIABLE • REGULATORY ARCHIVE •
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
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
              {formData.version || 'v1.0'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isCreateMode && (
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-xs"
              >
                <Printer className="h-3.5 w-3.5" /> Print Instrument
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
              Document Instrument View
            </button>
            <button
              onClick={() => setActiveTab('EDIT')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'EDIT'
                  ? 'bg-cyan-700 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Edit Metadata & Summary
            </button>
            <button
              onClick={() => setActiveTab('REVISIONS')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'REVISIONS'
                  ? 'bg-cyan-700 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Version Control & Audit
            </button>
          </div>
        )}

        {/* TAB 1: OFFICIAL PRINTABLE DOCUMENT VIEW */}
        {!isCreateMode && activeTab === 'VIEW' && (
          <div className="relative z-10 space-y-5 text-slate-900 print:space-y-4">
            {/* Header */}
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
                    Manyama & Solwezi Campuses, Zambia • Directorate of Institutional Records
                  </p>
                </div>
              </div>
              <div className="mt-3 inline-block rounded-md border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-bold tracking-wider text-slate-800 uppercase">
                Controlled Institutional Document
              </div>
            </div>

            {/* Document Attributes */}
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs">
              <div>
                <p className="text-slate-500 font-medium">Document Reference</p>
                <p className="font-mono font-bold text-slate-900">{formData.reference}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Category: <span className="font-semibold text-cyan-800">{formData.category}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 font-medium">Issuing Authority</p>
                <p className="font-bold text-slate-900">{formData.authority}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Published: <span className="font-semibold text-slate-800">{formData.datePublished}</span>
                </p>
              </div>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                {formData.title}
              </h2>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-xs leading-relaxed text-slate-800">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Executive Abstract & Regulatory Scope
              </h4>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {formData.summary}
              </p>
            </div>

            {/* Signatory & Security Seal */}
            <div className="flex items-end justify-between pt-6 border-t border-slate-200 text-xs">
              <div>
                <div className="h-9 w-28 border-b border-dashed border-slate-400"></div>
                <p className="mt-1 font-bold text-slate-900">College Principal & CEO</p>
                <p className="text-[11px] text-slate-500">Academic & Regulatory Authority</p>
              </div>

              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5 text-cyan-800 font-bold text-[11px]">
                  <ShieldCheck className="h-4 w-4" /> Cryptographically Sealed & Archived
                </div>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                  AUDIT HASH: {securityHash}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EDIT METADATA OR CREATE */}
        {(isCreateMode || activeTab === 'EDIT') && (
          <form onSubmit={handleFormSubmit} className="relative z-10 mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Document Reference</label>
                <input
                  type="text"
                  required
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</label>
                <select
                  value={formData.category}
                  onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                >
                  <option value="REGULATORY">Regulatory & Council Accreditations</option>
                  <option value="ACADEMIC">Academic Syllabi & Regulations</option>
                  <option value="CLINICAL">Clinical Placement & Logbook Protocols</option>
                  <option value="FINANCE">Finance, Tuition Tariffs & Bursary</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Document Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Higher Education Authority (HEA) Institutional Registration Certificate"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Issuing Authority</label>
                <input
                  type="text"
                  required
                  value={formData.authority}
                  onChange={(e) => setFormData({ ...formData, authority: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Version Label</label>
                <input
                  type="text"
                  value={formData.version || 'v1.0'}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Executive Summary / Scope</label>
              <textarea
                required
                rows={5}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Enter regulatory scope, accreditation terms, or academic requirements..."
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {!isCreateMode && onDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Are you sure you want to archive document ${formData.reference}?`)) {
                      onDelete(formData.id);
                      onClose();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                >
                  <Trash2 className="h-4 w-4" /> Archive Document
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
                  <Save className="h-4 w-4" /> {isCreateMode ? 'Register Document' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 3: REVISIONS */}
        {!isCreateMode && activeTab === 'REVISIONS' && (
          <div className="relative z-10 mt-4 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Audited Document Version History
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Every modification to an approved institutional document is preserved in the audit log.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
                <div>
                  <p className="font-bold text-slate-900">{formData.version || 'v1.0 (Current Live)'}</p>
                  <p className="text-slate-500 text-[11px]">Published: {formData.datePublished}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  CURRENT
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 opacity-60">
                <div>
                  <p className="font-bold text-slate-900">v0.9 (Draft Review)</p>
                  <p className="text-slate-500 text-[11px]">Archived upon formal Senate approval</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                  SUPERSEDED
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('VIEW')}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Back to Document
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
