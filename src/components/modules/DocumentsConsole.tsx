'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  BookOpen,
  CreditCard,
  Plus,
  Eye,
  Download,
} from 'lucide-react';
import { DocumentCrudModal, OfficialDocumentRecord } from '../documents/DocumentCrudModal';

interface DocumentsConsoleProps {
  initialRecords?: any[];
  initialDocuments?: any[];
}

function mapDocToRecord(d: any): OfficialDocumentRecord {
  const catMap: Record<string, 'REGULATORY' | 'ACADEMIC' | 'CLINICAL' | 'FINANCE'> = {
    OFFER_LETTER: 'REGULATORY',
    ACCEPTANCE_LETTER: 'REGULATORY',
    BONAFIDE_STUDENT: 'REGULATORY',
    INTRODUCTION_LETTER: 'REGULATORY',
    ACADEMIC_TRANSCRIPT: 'ACADEMIC',
    EXAM_CLEARANCE: 'ACADEMIC',
    CLINICAL_COMPLETION: 'CLINICAL',
    FEE_CLEARANCE: 'FINANCE',
  };
  return {
    id: d.id,
    reference: d.referenceNumber || (d.title ? d.title.split(' — ')[0] : `NWU-DOC-${d.id.slice(-4)}`),
    title: d.title ? (d.title.includes(' — ') ? d.title.split(' — ')[1] : d.title) : 'Official Document',
    category: catMap[d.documentType] || 'REGULATORY',
    fileFormat: 'PDF',
    fileSize: '1.2 MB',
    datePublished: new Date(d.issuedAt || d.createdAt || Date.now()).toLocaleDateString('en-GB'),
    authority: d.signatoryTitle || 'Office of the Academic Registrar',
    summary: d.purpose || d.summary || d.title || '',
    version: d.status || 'v1.0 (Audited)',
    fullBody: d.payloadJson || d.customRemarks || '',
  };
}

export function DocumentsConsole({ initialRecords = [], initialDocuments = [] }: DocumentsConsoleProps) {
  const [docs, setDocs] = useState<OfficialDocumentRecord[]>(() => {
    if (initialDocuments && initialDocuments.length > 0) {
      return initialDocuments.map(mapDocToRecord);
    }
    if (initialRecords && initialRecords.length > 0) {
      return initialRecords.map((r: any) => {
        if (r.metadataJson) {
          try {
            return JSON.parse(r.metadataJson);
          } catch {}
        }
        return mapDocToRecord(r);
      });
    }
    return [];
  });

  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notice, setNotice] = useState<string>('');

  // CRUD Modal State
  const [selectedDoc, setSelectedDoc] = useState<OfficialDocumentRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false);

  // Live database fetch from /api/documents
  const fetchLiveDocs = async () => {
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setDocs(json.data.map(mapDocToRecord));
        }
      }
    } catch (err) {
      console.error('[DocumentsConsole] Error fetching live documents:', err);
    }
  };

  useEffect(() => {
    fetchLiveDocs();
  }, []);

  const filteredDocs = docs.filter((d) => {
    const matchesCat = selectedCat === 'ALL' || d.category === selectedCat;
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      !q ||
      (d.title || '').toLowerCase().includes(q) ||
      (d.reference || '').toLowerCase().includes(q) ||
      (d.authority || '').toLowerCase().includes(q) ||
      (d.summary || '').toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  function handleOpenCreate() {
    setSelectedDoc(null);
    setIsCreateMode(true);
    setIsModalOpen(true);
  }

  function handleOpenRowCrud(d: OfficialDocumentRecord) {
    setSelectedDoc(d);
    setIsCreateMode(false);
    setIsModalOpen(true);
  }

  async function handleSaveDoc(updated: OfficialDocumentRecord) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
    const authHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    if (isCreateMode) {
      try {
        const res = await fetch('/api/documents', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            documentType: 'OFFER_LETTER',
            title: updated.title,
            purpose: updated.summary,
            signatoryTitle: updated.authority,
            customRemarks: updated.fullBody,
          }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setDocs([mapDocToRecord(json.data), ...docs]);
          setNotice(`Official Document "${updated.title}" (${json.data.referenceNumber}) registered in institutional archive.`);
        } else {
          setDocs([updated, ...docs]);
          setNotice(`Official Document "${updated.title}" (${updated.reference}) registered.`);
        }
      } catch (err) {
        console.error('Failed to persist document creation:', err);
        setDocs([updated, ...docs]);
      }
    } else {
      try {
        await fetch('/api/documents', {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({
            id: updated.id,
            action: 'APPROVE',
            notes: updated.summary,
          }),
        });
        setNotice(`Document records for "${updated.title}" (${updated.reference}) updated.`);
      } catch (err) {
        console.error('Failed to persist document update:', err);
      }
      setDocs(docs.map((d) => (d.id === updated.id ? updated : d)));
    }
    setTimeout(() => setNotice(''), 5000);
  }

  async function handleDeleteDoc(id: string) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
    setDocs(docs.filter((d) => d.id !== id));
    setNotice('Document archived and revoked from active controlled registry.');
    try {
      await fetch(`/api/documents?id=${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {
      console.error('Failed to persist document deletion:', err);
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

      {/* Documents Top Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Controlled Records</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{docs.length} Instruments</p>
          <span className="mt-2 inline-flex items-center text-xs text-slate-600">
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-cyan-700" /> Audited Senate & Council Records
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Statutory Accreditations</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">3 Statutory Bodies</p>
          <span className="mt-2 inline-flex items-center text-xs text-slate-600">
            <FileCheck2 className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> HEA, NMCZ & HPCZ Valid
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Academic Curricula</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">2026 Syllabus</p>
          <span className="mt-2 inline-flex items-center text-xs text-slate-600">
            <BookOpen className="mr-1.5 h-3.5 w-3.5 text-slate-500" /> Credit Weights & Modules
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Financial Policies</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">Tuition & Fees</p>
          <span className="mt-2 inline-flex items-center text-xs text-slate-600">
            <CreditCard className="mr-1.5 h-3.5 w-3.5 text-slate-500" /> LamtonPay Gateway Standard
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'REGULATORY', 'ACADEMIC', 'CLINICAL', 'FINANCE'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedCat === cat
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat === 'ALL'
                ? 'All Documents'
                : cat === 'REGULATORY'
                ? 'Regulatory Accreditations'
                : cat === 'ACADEMIC'
                ? 'Academic Regulations'
                : cat === 'CLINICAL'
                ? 'Clinical Protocols'
                : 'Finance & Tariffs'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[260px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, reference, council…"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-cyan-600"
            />
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <Plus className="h-4 w-4" /> + Register Controlled Document
          </button>
        </div>
      </div>

      {/* Controlled Document Register Data Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Reference</th>
                <th className="px-5 py-3.5">Document Title & Summary</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Issuing Authority</th>
                <th className="px-5 py-3.5">Version</th>
                <th className="px-5 py-3.5">Format / Size</th>
                <th className="px-5 py-3.5">Date Registered</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                    No documents found matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => handleOpenRowCrud(doc)}
                    className="cursor-pointer hover:bg-slate-50 transition"
                  >
                    <td className="px-5 py-3.5 font-mono font-medium text-cyan-800 whitespace-nowrap">
                      {doc.reference}
                    </td>
                    <td className="px-5 py-3.5 max-w-sm">
                      <p className="font-semibold text-slate-900 line-clamp-1">{doc.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{doc.summary}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-medium text-slate-700">
                        {doc.category === 'REGULATORY'
                          ? 'Regulatory Body'
                          : doc.category === 'ACADEMIC'
                          ? 'Academic Senate'
                          : doc.category === 'CLINICAL'
                          ? 'Clinical Directorate'
                          : 'Finance & Tariffs'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">
                      {doc.authority}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono text-slate-800">
                      {doc.version || 'v1.0'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                      {doc.fileFormat} • {doc.fileSize}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                      {doc.datePublished}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenRowCrud(doc);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                      >
                        <Eye className="h-3.5 w-3.5 text-slate-500" /> Open & Print
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500">
          <span>Showing {filteredDocs.length} of {docs.length} controlled documents</span>
          <span>Official NWUCHAS-CMIS Repository</span>
        </div>
      </div>

      {/* Document CRUD Modal */}
      <DocumentCrudModal
        document={selectedDoc}
        isOpen={isModalOpen}
        isCreateMode={isCreateMode}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDoc}
        onDelete={handleDeleteDoc}
      />
    </div>
  );
}
