'use client';

import { useState } from 'react';
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
}

export function DocumentsConsole({ initialRecords = [] }: DocumentsConsoleProps) {
  // Hydrate from live PostgreSQL records
  const hydratedDocs: OfficialDocumentRecord[] = initialRecords.length > 0
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
          reference: r.title.split(' — ')[0] || `NWU-DOC-2026-0${r.id.slice(-2)}`,
          title: r.title.split(' — ')[1] || r.title,
          category: 'REGULATORY',
          fileFormat: 'PDF',
          fileSize: '1.5 MB',
          datePublished: new Date(r.updatedAt || Date.now()).toLocaleDateString('en-GB'),
          authority: 'Office of the Academic Registrar',
          summary: r.summary || '',
          version: 'v1.0 (Audited)',
        };
      })
    : [
        {
          id: 'doc-1',
          reference: 'NWU-DOC-001',
          title: 'Provisional Admission & Acceptance Offer Letter (2026)',
          category: 'REGULATORY',
          authority: 'Office of the Academic Registrar',
          datePublished: '10/01/2026',
          version: 'v2.4',
          fileFormat: 'PDF',
          fileSize: '340 KB',
          summary:
            'Official admission offer containing student enrollment number, programme allocation, fee matrix, medical examination form, and statutory acceptance declaration.',
        },
        {
          id: 'doc-2',
          reference: 'NWU-DOC-002',
          title: 'NMCZ / HPCZ Statutory Student Indexing Verification Form',
          category: 'REGULATORY',
          authority: 'Council Indexing Liaison Office',
          datePublished: '14/01/2026',
          version: 'v1.8',
          fileFormat: 'PDF',
          fileSize: '410 KB',
          summary:
            'Official regulatory submission docket capturing ECZ Grade 12 statement of results, certified National Registration Card (NRC), birth certificate, and police finger-print clearances.',
        },
        {
          id: 'doc-3',
          reference: 'NWU-DOC-003',
          title: 'Official Examination Clearance Slip & Hall Entry Docket',
          category: 'ACADEMIC',
          authority: 'Chief Examinations Invigilator',
          datePublished: '28/01/2026',
          version: 'v3.0',
          fileFormat: 'PDF',
          fileSize: '290 KB',
          summary:
            'Digital security hall entry pass verifying 85% attendance roll-call compliance, zero fee balance clearance from the Bursary, and CBT biometric verification barcode.',
        },
        {
          id: 'doc-4',
          reference: 'NWU-DOC-004',
          title: 'Student Clinical Logbook & Preceptor Evaluation Dossier',
          category: 'CLINICAL',
          authority: 'Director of Clinical Practice',
          datePublished: '05/02/2026',
          version: 'v2.1',
          fileFormat: 'PDF',
          fileSize: '820 KB',
          summary:
            'Prescribed procedural logbook for hospital ward attachments: surgical scrubbing, IV cannulation, normal delivery management, catheterization, and post-operative monitoring sign-offs.',
        },
        {
          id: 'doc-5',
          reference: 'NWU-DOC-005',
          title: 'Official Academic Transcript & Statement of Results (Security Watermark)',
          category: 'ACADEMIC',
          authority: 'Academic Senate & Examinations Committee',
          datePublished: '12/02/2026',
          version: 'v2.0',
          fileFormat: 'PDF',
          fileSize: '510 KB',
          summary:
            'Formal certified transcript recording credit units, course grades, GPA, OSCE practical performance, clinical rotations completed, and official college seal.',
        },
        {
          id: 'doc-6',
          reference: 'NWU-DOC-006',
          title: 'Standard Campus Tenancy & Hostel Accommodation Agreement',
          category: 'FINANCE',
          authority: 'Campus Operations & Dean of Students',
          datePublished: '18/02/2026',
          version: 'v1.5',
          fileFormat: 'PDF',
          fileSize: '220 KB',
          summary:
            'Binding residential agreement for hostel accommodation at Florence Nightingale and Albert Schweitzer halls, specifying room allocation rules, curfew policies, and utility services.',
        },
      ];

  const [docs, setDocs] = useState<OfficialDocumentRecord[]>(hydratedDocs);
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notice, setNotice] = useState<string>('');

  // CRUD Modal State
  const [selectedDoc, setSelectedDoc] = useState<OfficialDocumentRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false);

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
    if (isCreateMode) {
      setDocs([updated, ...docs]);
      setNotice(`Official Document "${updated.title}" (${updated.reference}) registered in institutional archive.`);
      try {
        await fetch('/api/modules/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `${updated.reference} — ${updated.title}`,
            status: 'ACTIVE',
            summary: updated.summary,
            metadataJson: JSON.stringify(updated),
          }),
        });
      } catch (err) {
        console.error('Failed to persist document creation:', err);
      }
    } else {
      setDocs(docs.map((d) => (d.id === updated.id ? updated : d)));
      setNotice(`Document records for "${updated.title}" (${updated.reference}) updated.`);
      try {
        await fetch('/api/modules/documents', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: updated.id,
            title: `${updated.reference} — ${updated.title}`,
            status: 'ACTIVE',
            summary: updated.summary,
            metadataJson: JSON.stringify(updated),
          }),
        });
      } catch (err) {
        console.error('Failed to persist document update:', err);
      }
    }
    setTimeout(() => setNotice(''), 5000);
  }

  async function handleDeleteDoc(id: string) {
    setDocs(docs.filter((d) => d.id !== id));
    setNotice('Document archived from active controlled registry.');
    try {
      await fetch(`/api/modules/documents?id=${id}`, {
        method: 'DELETE',
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
