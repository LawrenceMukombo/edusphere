// src/app/documents/page.tsx
// Official Institutional Document Generator Workspace for Legacy School Solwezi
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  Printer,
  Copy,
  Check,
  Search,
  Building,
  GraduationCap,
  Calendar,
  User,
  ShieldCheck,
  Award,
  DollarSign,
  QrCode,
  Sparkles,
  CheckCircle2,
  Filter,
  ArrowRight,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { LegacyLogo } from '@/components/LegacyLogo';
import {
  DocumentTemplateService,
  DocumentType,
  DocumentLearnerProfile,
  DocumentGenerationOptions,
} from '@/server/services/documentTemplate.service';

const SAMPLE_LEARNERS: DocumentLearnerProfile[] = [
  {
    studentNumber: 'LS-2026-0042',
    learnerName: 'Bupe Mwewa',
    className: 'Grade 10A Science',
    campusName: 'Kansanshi Boarding Campus',
    studentType: 'FULL_BOARDER',
    gender: 'MALE',
    dateOfBirth: '14th August 2010',
    guardianName: 'Mrs. Natasha Mwewa',
    guardianPhone: '+260 97 782 1904',
    guardianEmail: 'natasha.mwewa@gmail.com',
    hallName: 'Kansanshi Boys Residential Hall',
    dormRoom: 'Block A, Cubicle 4',
    bedNumber: 'Bed #08',
    totalBilled: 14000,
    totalPaid: 14000,
    balance: 0,
    conductRating: 'Exemplary (A+)',
    academicAverage: 84.5,
  },
  {
    studentNumber: 'LS-2026-0118',
    learnerName: 'Kondwani Phiri',
    className: 'Grade 7 Blue',
    campusName: 'Mushitala Day Campus',
    studentType: 'DAY_SCHOLAR',
    gender: 'MALE',
    dateOfBirth: '22nd January 2013',
    guardianName: 'Mr. Godfrey Phiri',
    guardianPhone: '+260 95 541 0092',
    guardianEmail: 'godfrey.phiri@outlook.com',
    totalBilled: 8000,
    totalPaid: 8000,
    balance: 0,
    conductRating: 'Very Good (A)',
    academicAverage: 78.2,
  },
  {
    studentNumber: 'LS-2026-0089',
    learnerName: 'Natasha Chileshe',
    className: 'Grade 11 Commerce',
    campusName: 'Kansanshi Boarding Campus',
    studentType: 'BOARDER',
    gender: 'FEMALE',
    dateOfBirth: '3rd November 2009',
    guardianName: 'Eng. Patrick Chileshe',
    guardianPhone: '+260 96 677 1209',
    guardianEmail: 'patrick.chileshe@firstquantum.com',
    hallName: 'Kalumbila Girls Residential Hall',
    dormRoom: 'Block C, Room 12',
    bedNumber: 'Bed #02',
    totalBilled: 14000,
    totalPaid: 14000,
    balance: 0,
    conductRating: 'Exemplary (A+)',
    academicAverage: 89.1,
  },
];

export default function DocumentGeneratorPage() {
  const [selectedType, setSelectedType] = useState<DocumentType>('OFFER_LETTER');
  const [selectedLearner, setSelectedLearner] = useState<DocumentLearnerProfile>(SAMPLE_LEARNERS[0]);
  const [learnerSearch, setLearnerSearch] = useState('');
  const [issueDate, setIssueDate] = useState('2026-10-19');
  const [reportingDate, setReportingDate] = useState('2026-01-12');
  const [acceptanceDeadline, setAcceptanceDeadline] = useState('2026-11-30');
  const [signatory, setSignatory] = useState<'PRINCIPAL' | 'DEPUTY' | 'BURSAR'>('PRINCIPAL');
  const [recipientName, setRecipientName] = useState('The Consular & Immigration Officer');
  const [recipientOrg, setRecipientOrg] = useState('Ministry of Home Affairs & Internal Security');
  const [recipientAddress, setRecipientAddress] = useState('North-Western Provincial Headquarters, Solwezi');
  const [purpose, setPurpose] = useState('Study Permit Verification & Dependent Exemption');
  const [copied, setCopied] = useState(false);

  // Filter learners for picker
  const filteredLearners = useMemo(() => {
    if (!learnerSearch) return SAMPLE_LEARNERS;
    return SAMPLE_LEARNERS.filter(
      (l) =>
        l.learnerName.toLowerCase().includes(learnerSearch.toLowerCase()) ||
        l.studentNumber.toLowerCase().includes(learnerSearch.toLowerCase()) ||
        l.className.toLowerCase().includes(learnerSearch.toLowerCase())
    );
  }, [learnerSearch]);

  // Signatory details
  const signatoryInfo = useMemo(() => {
    switch (signatory) {
      case 'BURSAR':
        return { name: 'Mrs. Mary Chisenga', title: 'Senior Bursar & Finance Director' };
      case 'DEPUTY':
        return { name: 'Mr. C. Mulenga, B.Ed, M.Ed', title: 'Deputy Headteacher & Academic Dean' };
      case 'PRINCIPAL':
      default:
        return { name: 'Mr. Emmanuel Mwansa', title: 'Managing Director & School Principal' };
    }
  }, [signatory]);

  // Generate document payload using DocumentTemplateService
  const generatedDoc = useMemo(() => {
    const opts: DocumentGenerationOptions = {
      documentType: selectedType,
      issueDate,
      reportingDate,
      acceptanceDeadline,
      recipientName: recipientName || undefined,
      recipientOrganization: recipientOrg || undefined,
      recipientAddress: recipientAddress || undefined,
      purpose: purpose || undefined,
      signatoryName: signatoryInfo.name,
      signatoryTitle: signatoryInfo.title,
      academicYear: '2026',
    };
    return DocumentTemplateService.generateDocument(selectedLearner, opts);
  }, [
    selectedType,
    selectedLearner,
    issueDate,
    reportingDate,
    acceptanceDeadline,
    recipientName,
    recipientOrg,
    recipientAddress,
    purpose,
    signatoryInfo,
  ]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const plainText = `${generatedDoc.title}\n${generatedDoc.referenceNumber}\n\n${generatedDoc.paragraphs.join(
      '\n\n'
    )}\n\nSignatory: ${generatedDoc.signatoryName} (${generatedDoc.signatoryTitle})`;
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 w-full p-4 sm:p-6 bg-slate-50 min-h-screen">
      {/* Top Banner & Control Header (Hidden in Print) */}
      <div className="no-print bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Institutional Document Engine
            </span>
            <span className="text-xs text-slate-400">• Official Zambian Letterhead & MoE Verifications</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Official Document Generator</h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate, customize, and print high-fidelity letters of acceptance, provisional offers, introductory credentials,
            and clearance certificates with anti-fraud QR verification codes.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/messages"
            className="px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>In-App Messages</span>
          </Link>
          <button
            onClick={handleCopyText}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Print Official A4 Letter</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls & Form Parameters (5 Cols) (Hidden in Print) */}
        <div className="no-print lg:col-span-5 space-y-5">
          {/* Document Type Selector Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              1. Select Official Document Template
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedType('OFFER_LETTER')}
                className={`p-3 rounded-2xl text-left border text-xs font-bold transition flex flex-col justify-between ${
                  selectedType === 'OFFER_LETTER'
                    ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Award className={`w-4 h-4 ${selectedType === 'OFFER_LETTER' ? 'text-amber-300' : 'text-blue-700'}`} />
                  <span>Provisional Offer</span>
                </div>
                <span className={`text-[10px] mt-1 font-normal ${selectedType === 'OFFER_LETTER' ? 'text-blue-200' : 'text-slate-500'}`}>
                  New intake admission offer
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('ACCEPTANCE_LETTER')}
                className={`p-3 rounded-2xl text-left border text-xs font-bold transition flex flex-col justify-between ${
                  selectedType === 'ACCEPTANCE_LETTER'
                    ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className={`w-4 h-4 ${selectedType === 'ACCEPTANCE_LETTER' ? 'text-amber-300' : 'text-blue-700'}`} />
                  <span>Formal Acceptance</span>
                </div>
                <span className={`text-[10px] mt-1 font-normal ${selectedType === 'ACCEPTANCE_LETTER' ? 'text-blue-200' : 'text-slate-500'}`}>
                  Confirmed enrollment certificate
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('INTRODUCTION_LETTER')}
                className={`p-3 rounded-2xl text-left border text-xs font-bold transition flex flex-col justify-between ${
                  selectedType === 'INTRODUCTION_LETTER'
                    ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`w-4 h-4 ${selectedType === 'INTRODUCTION_LETTER' ? 'text-amber-300' : 'text-blue-700'}`} />
                  <span>Introduction / Visa</span>
                </div>
                <span className={`text-[10px] mt-1 font-normal ${selectedType === 'INTRODUCTION_LETTER' ? 'text-blue-200' : 'text-slate-500'}`}>
                  Embassy / Immigration credential
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('TRANSFER_CLEARANCE')}
                className={`p-3 rounded-2xl text-left border text-xs font-bold transition flex flex-col justify-between ${
                  selectedType === 'TRANSFER_CLEARANCE'
                    ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building className={`w-4 h-4 ${selectedType === 'TRANSFER_CLEARANCE' ? 'text-amber-300' : 'text-blue-700'}`} />
                  <span>Transfer Clearance</span>
                </div>
                <span className={`text-[10px] mt-1 font-normal ${selectedType === 'TRANSFER_CLEARANCE' ? 'text-blue-200' : 'text-slate-500'}`}>
                  Inter-school transfer certificate
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('FEE_CLEARANCE')}
                className={`p-3 rounded-2xl text-left border text-xs font-bold transition flex flex-col justify-between sm:col-span-2 ${
                  selectedType === 'FEE_CLEARANCE'
                    ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <DollarSign className={`w-4 h-4 ${selectedType === 'FEE_CLEARANCE' ? 'text-amber-300' : 'text-emerald-700'}`} />
                  <span>Bursar Fee Clearance Certificate</span>
                </div>
                <span className={`text-[10px] mt-1 font-normal ${selectedType === 'FEE_CLEARANCE' ? 'text-blue-200' : 'text-slate-500'}`}>
                  Official financial reconciliation and term exam permit
                </span>
              </button>
            </div>
          </div>

          {/* Learner Picker Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                2. Select Learner
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Active Roster</span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search pupil name, student ID, or class..."
                value={learnerSearch}
                onChange={(e) => setLearnerSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto divide-y divide-slate-100">
              {filteredLearners.map((lrn) => {
                const isSelected = selectedLearner.studentNumber === lrn.studentNumber;
                return (
                  <div
                    key={lrn.studentNumber}
                    onClick={() => setSelectedLearner(lrn)}
                    className={`p-2.5 rounded-xl cursor-pointer transition flex items-center justify-between ${
                      isSelected ? 'bg-blue-50 border border-blue-300' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{lrn.learnerName}</p>
                      <p className="text-[10px] text-slate-500">
                        {lrn.className} • <span className="font-mono text-blue-700">{lrn.studentNumber}</span>
                      </p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-700" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Letter Meta Details Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              3. Letterhead Parameters & Dates
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Issue Date</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reporting Date</label>
                <input
                  type="date"
                  value={reportingDate}
                  onChange={(e) => setReportingDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Acceptance Deadline</label>
                <input
                  type="date"
                  value={acceptanceDeadline}
                  onChange={(e) => setAcceptanceDeadline(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Authorized Signatory</label>
                <select
                  value={signatory}
                  onChange={(e) => setSignatory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                >
                  <option value="PRINCIPAL">Mr. Emmanuel Mwansa (Director)</option>
                  <option value="DEPUTY">Mr. C. Mulenga (Deputy Head)</option>
                  <option value="BURSAR">Mrs. Mary Chisenga (Senior Bursar)</option>
                </select>
              </div>
            </div>

            {selectedType === 'INTRODUCTION_LETTER' && (
              <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Addressed Recipient</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                    placeholder="e.g. The Visa & Consular Officer"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Organization / Department</label>
                  <input
                    type="text"
                    value={recipientOrg}
                    onChange={(e) => setRecipientOrg(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                    placeholder="e.g. Department of Immigration, Zambia"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Official Document Paper Preview (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-200/60 p-4 sm:p-6 rounded-3xl border border-slate-300 shadow-inner flex justify-center">
          <div
            id="official-letter-sheet"
            className="bg-white w-full max-w-[210mm] min-h-[297mm] p-8 sm:p-12 rounded-xl shadow-2xl border border-slate-300 text-slate-900 font-serif leading-relaxed flex flex-col justify-between"
          >
            <div>
              {/* Institutional Crest & Letterhead */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
                <div className="flex items-center gap-4">
                  <LegacyLogo variant="emblem" size="md" />
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-950 font-sans uppercase">
                      LEGACY SCHOOL SOLWEZI
                    </h1>
                    <span className="text-[11px] font-bold text-amber-700 font-sans tracking-wide block uppercase">
                      Centre of Academic & Moral Excellence
                    </span>
                    <span className="text-[9px] text-slate-500 font-sans block mt-0.5">
                      MoE Reg: MOE/NWP/SOL/SEC/2026/044 • ECZ Examination Centre #044/SOL
                    </span>
                  </div>
                </div>

                <div className="text-right text-[9px] font-sans text-slate-500 space-y-0.5">
                  <p className="font-bold text-slate-800">Mushitala Day & Kansanshi Boarding</p>
                  <p>Plot #889 Kansanshi Mine Road</p>
                  <p>P.O. Box 110022, Solwezi, Zambia</p>
                  <p className="font-mono text-blue-900 font-bold">+260 218 821 000</p>
                </div>
              </div>

              {/* Reference & Date Bar */}
              <div className="flex items-center justify-between text-[10px] font-sans font-bold text-slate-600 mt-4 pb-2 border-b border-slate-100">
                <span>
                  REF: <strong className="text-slate-900 font-mono">{generatedDoc.referenceNumber}</strong>
                </span>
                <span>
                  Date: <strong className="text-slate-900">{generatedDoc.issueDate}</strong>
                </span>
              </div>

              {/* Recipient Lines */}
              {generatedDoc.recipientLines && generatedDoc.recipientLines.length > 0 && (
                <div className="mt-4 text-[11px] font-sans space-y-0.5">
                  {generatedDoc.recipientLines.map((line, idx) => (
                    <p key={idx} className={idx === 0 ? 'font-bold text-slate-900 uppercase' : 'text-slate-700'}>
                      {line}
                    </p>
                  ))}
                </div>
              )}

              {/* Salutation & Subject */}
              <div className="mt-4 font-sans">
                <p className="text-xs font-bold text-slate-800">{generatedDoc.salutation}</p>
                <h2 className="text-sm font-black font-sans uppercase tracking-wider text-slate-950 mt-2 inline-block border-b-2 border-slate-950 pb-1">
                  {generatedDoc.subjectLine}
                </h2>
              </div>

              {/* Tabular Data (if present) */}
              {generatedDoc.tabularData && (
                <div className="mt-4 border border-slate-300 rounded-lg overflow-hidden text-[11px] font-sans">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300">
                        {generatedDoc.tabularData.headers.map((h, idx) => (
                          <th key={idx} className="px-3 py-1.5 text-left font-bold text-slate-800 text-[10px] uppercase">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {generatedDoc.tabularData.rows.map((row, rIdx) => (
                        <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-3 py-1.5 border-b border-slate-200 text-slate-900">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Requirements List (if present) */}
              {generatedDoc.requirementsList && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-sans space-y-1">
                  <p className="font-bold text-slate-900 uppercase text-[10px]">Mandatory Enrolment Checklist:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                    {generatedDoc.requirementsList.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Body Paragraphs */}
              <div className="mt-4 text-xs text-slate-800 space-y-3 text-justify">
                {generatedDoc.paragraphs.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>

            {/* Bottom Footer: Signatures & Cryptographic QR Verification */}
            <div className="mt-8 pt-4 border-t-2 border-slate-900">
              <div className="flex items-end justify-between">
                {/* Signatory Signature Block */}
                <div className="space-y-1 font-sans text-xs">
                  <div className="h-10 w-36 border-b border-dashed border-slate-400 flex items-end">
                    <span className="font-serif italic text-blue-900 font-bold text-sm">
                      {signatoryInfo.name.split(' ')[1] || 'Mwansa'}
                    </span>
                  </div>
                  <p className="font-bold text-slate-950 mt-1">{generatedDoc.signatoryName}</p>
                  <p className="text-[10px] text-slate-600">{generatedDoc.signatoryTitle}</p>
                  <p className="text-[9px] text-slate-400">Legacy School Solwezi Administration</p>
                </div>

                {/* Anti-Fraud Security QR Stamp */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-sans">
                  <div className="w-14 h-14 bg-white p-1 rounded-lg border border-slate-300 flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-slate-900" />
                  </div>
                  <div className="text-[8px] text-slate-600 space-y-0.5">
                    <span className="font-bold text-slate-900 block uppercase">SECURE VERIFIED DOCUMENT</span>
                    <span>Stamp Hash: {generatedDoc.securityStamp.verificationHash.slice(0, 24)}...</span>
                    <span className="text-emerald-700 font-bold block">✓ Validated Active Session</span>
                    <span>Scan with camera to verify authenticity</span>
                  </div>
                </div>
              </div>

              <div className="text-center text-[8px] font-sans text-slate-400 mt-4 pt-2 border-t border-slate-100">
                Official document generated by EduSphere SMIS Enterprise • Sovereign Cloud & On-Premises Architecture
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
