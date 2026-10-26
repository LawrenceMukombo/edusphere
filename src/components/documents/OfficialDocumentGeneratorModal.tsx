// src/components/documents/OfficialDocumentGeneratorModal.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  Download,
  Copy,
  Check,
  X,
  FileCheck,
  Building,
  GraduationCap,
  Calendar,
  User,
  ShieldCheck,
  Award,
  DollarSign,
  ArrowRightLeft,
  QrCode,
} from 'lucide-react';
import { LegacyLogo } from '../LegacyLogo';
import {
  DocumentTemplateService,
  DocumentType,
  DocumentLearnerProfile,
  DocumentGenerationOptions,
} from '@/server/services/documentTemplate.service';

interface OfficialDocumentGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  learner: DocumentLearnerProfile;
  initialType?: DocumentType;
}

export function OfficialDocumentGeneratorModal({
  isOpen,
  onClose,
  learner,
  initialType = 'OFFER_LETTER',
}: OfficialDocumentGeneratorModalProps) {
  const [selectedType, setSelectedType] = useState<DocumentType>(initialType);
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [customRef, setCustomRef] = useState('');
  const [recipientPreset, setRecipientPreset] = useState<'GENERAL' | 'VISA' | 'BANK' | 'CUSTOM'>('GENERAL');
  const [recipientName, setRecipientName] = useState('TO WHOM IT MAY CONCERN');
  const [recipientOrg, setRecipientOrg] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('Solwezi, North-Western Province, Zambia');
  const [purpose, setPurpose] = useState('Educational Verification & Academic Reference');
  const [reportingDate, setReportingDate] = useState('Monday, 12th January 2026');
  const [acceptanceDeadline, setAcceptanceDeadline] = useState('Friday, 5th December 2025');
  const [signatory, setSignatory] = useState<'PRINCIPAL' | 'BURSAR' | 'DEPUTY'>('PRINCIPAL');
  const [targetTransferSchool, setTargetTransferSchool] = useState('Kansanshi Secondary School, Solwezi');
  const [copied, setCopied] = useState(false);

  // Synchronize recipient presets
  const handlePresetChange = (preset: 'GENERAL' | 'VISA' | 'BANK' | 'CUSTOM') => {
    setRecipientPreset(preset);
    if (preset === 'GENERAL') {
      setRecipientName('TO WHOM IT MAY CONCERN');
      setRecipientOrg('Institutional & Public Verification Authorities');
      setRecipientAddress('Republic of Zambia');
      setPurpose('Bona Fide Pupil Reference & Institutional Record');
    } else if (preset === 'VISA') {
      setRecipientName('The Visa & Consular Officer');
      setRecipientOrg('Embassy / High Commission / Department of Immigration');
      setRecipientAddress('Consular Section, Lusaka, Zambia');
      setPurpose('Minor Pupil International Travel & Visa Application');
    } else if (preset === 'BANK') {
      setRecipientName('The Branch Operations Manager');
      setRecipientOrg('Standard Chartered / ZANACO / Absa Bank Zambia');
      setRecipientAddress('Solwezi Commercial Banking Branch');
      setPurpose('Minor Learner Savings Account Opening & Trust Management');
    } else {
      setRecipientName('');
      setRecipientOrg('');
      setRecipientAddress('');
      setPurpose('');
    }
  };

  // Signatory details
  const signatoryInfo = useMemo(() => {
    switch (signatory) {
      case 'BURSAR':
        return {
          name: 'Mrs. Mary Chisenga',
          title: 'Senior Bursar & Finance Director',
        };
      case 'DEPUTY':
        return {
          name: 'Mr. C. Mulenga, B.Ed, M.Ed',
          title: 'Deputy Headteacher & Academic Dean',
        };
      case 'PRINCIPAL':
      default:
        return {
          name: 'Mr. Emmanuel Mwansa',
          title: 'School Director & Principal',
        };
    }
  }, [signatory]);

  // Generate document structure using the template service
  const generatedDoc = useMemo(() => {
    const options: DocumentGenerationOptions = {
      documentType: selectedType,
      referenceNumber: customRef.trim() || undefined,
      issueDate,
      recipientName: recipientName.trim() || undefined,
      recipientOrganization: recipientOrg.trim() || undefined,
      recipientAddress: recipientAddress.trim() || undefined,
      purpose: purpose.trim() || undefined,
      reportingDate,
      acceptanceDeadline,
      signatoryName: signatoryInfo.name,
      signatoryTitle: signatoryInfo.title,
      targetTransferSchool,
    };

    return DocumentTemplateService.generateDocument(learner, options);
  }, [
    selectedType,
    customRef,
    issueDate,
    recipientName,
    recipientOrg,
    recipientAddress,
    purpose,
    reportingDate,
    acceptanceDeadline,
    signatoryInfo,
    targetTransferSchool,
    learner,
  ]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = [
      '====================================================================',
      'LEGACY SCHOOL SOLWEZI — OFFICIAL INSTITUTIONAL DOCUMENT',
      'Ministry of Education Reg: MOE/NWP/SOL/SEC/2026/044 • TPIN: 1008492019',
      '====================================================================',
      `Reference: ${generatedDoc.referenceNumber}`,
      `Date: ${generatedDoc.issueDate}`,
      '',
      ...generatedDoc.recipientLines,
      '',
      `Subject: ${generatedDoc.subjectLine}`,
      '',
      ...generatedDoc.paragraphs.map((p) => `${p}\n`),
      `Issued By: ${generatedDoc.signatoryName} (${generatedDoc.signatoryTitle})`,
      `Verification Hash: ${generatedDoc.securityStamp.verificationHash}`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95">
        {/* Top Modal Navigation Header */}
        <div className="no-print bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Official Institutional Document Generator
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 uppercase">
                  Legacy School Solwezi
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pupil: <strong className="text-white">{learner.learnerName}</strong> ({learner.studentNumber}) • Class: {learner.className}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
              title="Copy plain text document content"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content: Split Customizer on Left, Live Preview on Right */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT: Controls & Document Parameter Customizer */}
          <div className="no-print w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/70 p-5 overflow-y-auto space-y-5 text-xs">
            {/* Document Type Selector */}
            <div>
              <label className="block font-black text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                1. Select Document Template
              </label>
              <div className="space-y-1.5">
                {[
                  {
                    type: 'OFFER_LETTER' as DocumentType,
                    label: 'Provisional Offer of Admission',
                    desc: 'Formal admission offer, fee schedule & reporting date',
                    icon: Award,
                  },
                  {
                    type: 'ACCEPTANCE_LETTER' as DocumentType,
                    label: 'Confirmation of Enrolment',
                    desc: 'Official pupil placement & student ID certification',
                    icon: GraduationCap,
                  },
                  {
                    type: 'INTRODUCTION_LETTER' as DocumentType,
                    label: 'Pupil Introduction & Reference',
                    desc: 'Bona fide student letter for Visa, Bank, or Embassy',
                    icon: Building,
                  },
                  {
                    type: 'TRANSFER_CLEARANCE' as DocumentType,
                    label: 'Inter-School Transfer & Clearance',
                    desc: 'Official clearance of books, sports kit & conduct',
                    icon: ArrowRightLeft,
                  },
                  {
                    type: 'FEE_CLEARANCE' as DocumentType,
                    label: 'Bursar Financial Clearance',
                    desc: 'Tuition statement & zero arrears certification',
                    icon: DollarSign,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedType === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setSelectedType(item.type)}
                      className={`w-full text-left p-3 rounded-2xl border transition flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-blue-900 text-white border-blue-950 shadow-sm'
                          : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100/80'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-amber-400' : 'text-blue-700'}`} />
                      <div className="min-w-0">
                        <span className="font-bold block leading-tight">{item.label}</span>
                        <span className={`text-[10px] block mt-0.5 truncate ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                          {item.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Document Details & Customization */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <label className="block font-black text-slate-800 uppercase tracking-wider text-[11px]">
                2. Parameters & Addressee
              </label>

              {/* Date & Custom Reference Number */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Custom Ref # (Opt)</label>
                  <input
                    type="text"
                    placeholder="Auto Generated"
                    value={customRef}
                    onChange={(e) => setCustomRef(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Conditional Controls per Document Type */}
              {selectedType === 'OFFER_LETTER' && (
                <div className="space-y-2">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Reporting Date</label>
                    <input
                      type="text"
                      value={reportingDate}
                      onChange={(e) => setReportingDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Acceptance Deadline</label>
                    <input
                      type="text"
                      value={acceptanceDeadline}
                      onChange={(e) => setAcceptanceDeadline(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
                    />
                  </div>
                </div>
              )}

              {selectedType === 'INTRODUCTION_LETTER' && (
                <div className="space-y-2">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Recipient Preset</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'GENERAL', label: 'To Whom It May Concern' },
                        { id: 'VISA', label: 'Visa / Embassy' },
                        { id: 'BANK', label: 'Bank Account' },
                        { id: 'CUSTOM', label: 'Custom Addressee' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handlePresetChange(p.id as any)}
                          className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition ${
                            recipientPreset === p.id
                              ? 'bg-blue-800 text-white border-blue-900'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Addressee Name / Title</label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Institution / Organization</label>
                    <input
                      type="text"
                      value={recipientOrg}
                      onChange={(e) => setRecipientOrg(e.target.value)}
                      placeholder="e.g. British High Commission, Lusaka"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Specific Purpose</label>
                    <input
                      type="text"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                </div>
              )}

              {selectedType === 'TRANSFER_CLEARANCE' && (
                <div className="space-y-2">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Receiving School Name</label>
                    <input
                      type="text"
                      value={targetTransferSchool}
                      onChange={(e) => setTargetTransferSchool(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* Signatory Selector */}
              <div>
                <label className="font-bold text-slate-600 block mb-1">Authorized Signatory</label>
                <select
                  value={signatory}
                  onChange={(e) => setSignatory(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold text-slate-900"
                >
                  <option value="PRINCIPAL">Prof. Hastings Chileshe — College Principal</option>
                  <option value="BURSAR">Mrs. Mary Chisenga — College Bursar &amp; Director of Finance</option>
                  <option value="DEPUTY">Dr. George Silwamba — Academic Registrar &amp; Dean of Studies</option>
                </select>
              </div>
            </div>

            {/* Quick Action in Sidebar */}
            <div className="pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Letterhead Copy</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Live Authentic Printable Document Preview */}
          <div className="flex-1 bg-slate-200/80 p-3 sm:p-6 overflow-y-auto flex justify-center">
            <div
              id="printable-official-document"
              className="bg-white w-full max-w-3xl min-h-[980px] p-8 sm:p-12 rounded-xl shadow-lg border border-slate-300 space-y-6 text-slate-900 print:m-0 print:p-0 print:border-none print:shadow-none"
              style={{ fontFamily: '"Times New Roman", Times, Georgia, serif' }}
            >
              {/* AUTHENTIC SCHOOL LOGO & LETTERHEAD */}
              <div className="border-b-2 border-blue-950 pb-4">
                <LegacyLogo variant="letterhead" showAddress={true} />
              </div>

              {/* Reference & Date Line */}
              <div className="flex items-center justify-between text-xs font-sans text-slate-700 pt-1">
                <div>
                  <strong>OUR REF:</strong> <span className="font-mono font-bold text-blue-950">{generatedDoc.referenceNumber}</span>
                </div>
                <div>
                  <strong>DATE:</strong> <span>{generatedDoc.issueDate}</span>
                </div>
              </div>

              {/* Recipient Address */}
              <div className="text-xs font-sans text-slate-800 space-y-0.5 pt-2">
                {generatedDoc.recipientLines.map((line, idx) => (
                  <p key={idx} className={idx === 0 ? 'font-bold text-slate-950 text-sm' : ''}>
                    {line}
                  </p>
                ))}
              </div>

              {/* Salutation */}
              <p className="text-sm font-sans font-bold text-slate-900 pt-2">
                {generatedDoc.salutation}
              </p>

              {/* Document Subject Line */}
              <div className="text-center pt-2 pb-1">
                <h3 className="text-sm sm:text-base font-black tracking-wide uppercase text-blue-950 border-b-2 border-blue-900 pb-1 inline-block font-sans">
                  {generatedDoc.subjectLine}
                </h3>
              </div>

              {/* Document Paragraphs */}
              <div className="text-xs sm:text-[13px] leading-relaxed text-slate-800 space-y-3 font-serif text-justify">
                {generatedDoc.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {/* Tabular Data (Fees, Attributes, Clearance Matrix) */}
              {generatedDoc.tabularData && (
                <div className="pt-2 font-sans">
                  <table className="w-full text-xs text-left border border-slate-300 rounded-lg overflow-hidden">
                    <thead className="bg-blue-950 text-white font-bold">
                      <tr>
                        {generatedDoc.tabularData.headers.map((h, idx) => (
                          <th key={idx} className="p-2.5 border-b border-slate-200">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {generatedDoc.tabularData.rows.map((row, rIdx) => (
                        <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className={`p-2.5 text-slate-800 ${
                                cIdx === 0 ? 'font-bold' : ''
                              } ${cIdx === row.length - 1 ? 'font-mono' : ''}`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                    {generatedDoc.tabularData.footers && (
                      <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-400">
                        <tr>
                          {generatedDoc.tabularData.footers.map((f, idx) => (
                            <td
                              key={idx}
                              className={`p-2.5 text-slate-950 ${
                                idx === generatedDoc.tabularData!.footers!.length - 1 ? 'font-mono font-black text-blue-950' : ''
                              }`}
                            >
                              {f}
                            </td>
                          ))}
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}

              {/* Requirements Checklist (for Offer Letters) */}
              {generatedDoc.requirementsList && (
                <div className="pt-2 font-sans">
                  <h4 className="text-xs font-bold uppercase text-blue-950 mb-1.5">
                    Essential Induction & Reporting Inventory Checklist:
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {generatedDoc.requirementsList.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-700 font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Concluding Assurance */}
              <p className="text-xs font-serif text-slate-800 pt-2">
                Yours faithfully in Academic & Moral Excellence,
              </p>

              {/* Signatures & Institutional Security Seal */}
              <div className="pt-4 flex items-end justify-between font-sans border-t border-slate-200">
                {/* Official Signature Block */}
                <div className="space-y-1">
                  <div className="font-serif italic text-blue-900 text-lg sm:text-xl font-bold tracking-wider select-none">
                    {generatedDoc.signatoryName}
                  </div>
                  <div className="w-48 h-0.5 bg-slate-400"></div>
                  <p className="font-bold text-xs text-slate-900">{generatedDoc.signatoryName}</p>
                  <p className="text-[11px] text-slate-600">{generatedDoc.signatoryTitle}</p>
                  <p className="text-[10px] text-slate-500 font-mono">Legacy School Solwezi</p>
                </div>

                {/* Circular Official Seal / Stamp */}
                <div className="shrink-0 flex items-center gap-3">
                  <div className="w-24 h-24 rounded-full border-4 border-dashed border-blue-900/60 p-1 flex flex-col items-center justify-center text-center rotate-[-6deg] select-none text-blue-900 bg-blue-50/40">
                    <span className="text-[8px] font-black uppercase tracking-tight">LEGACY SCHOOL</span>
                    <span className="text-[7px] font-bold">SOLWEZI • ZAMBIA</span>
                    <div className="my-0.5 text-[10px] font-black tracking-widest text-emerald-800">★ VERIFIED ★</div>
                    <span className="text-[6px] font-mono text-slate-600">MOE/NWP/SOL/SEC</span>
                    <span className="text-[6px] font-bold text-blue-950">OFFICIAL STAMP</span>
                  </div>

                  {/* QR Security Verification Stamp */}
                  <div className="hidden sm:flex flex-col items-center text-center p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <QrCode className="w-10 h-10 text-slate-800" />
                    <span className="text-[8px] font-mono font-bold text-slate-500 mt-1">SECURE SCAN</span>
                    <span className="text-[7px] font-mono text-slate-400 max-w-[80px] truncate">
                      {generatedDoc.securityStamp.verificationHash.slice(0, 14)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statutory Footnote */}
              <div className="pt-4 border-t border-slate-200 text-[10px] font-sans text-slate-400 flex items-center justify-between">
                <span>Registration: MOE/NWP/SOL/SEC/2026/044 • TPIN: 1008492019</span>
                <span>EduSphere SMIS Authentic Document Engine</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
