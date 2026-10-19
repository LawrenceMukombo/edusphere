// src/app/documents/page.tsx
// Official Institutional Document Generator Workspace for Legacy School Solwezi
// Allowing authorized role editing and immutable timestamped archival copies for learners and staff
'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Edit3,
  History,
  Archive,
  UserCheck,
  Briefcase,
  Plus,
  Trash2,
  RotateCcw,
  Clock,
  Eye,
} from 'lucide-react';
import { LegacyLogo } from '@/components/LegacyLogo';
import {
  DocumentTemplateService,
  DocumentType,
  DocumentLearnerProfile,
  DocumentGenerationOptions,
} from '@/server/services/documentTemplate.service';
import {
  LEGACY_STAFF_MEMBERS,
  LegacyStaffMember,
  generateLegacyLearners,
} from '@/server/services/legacySchoolData';
import { EnterpriseTable, ColumnDef } from '@/components/EnterpriseTable';

export interface ArchivedDocumentRecord {
  id: string;
  referenceNumber: string;
  documentType: string;
  recipientCategory: 'LEARNER' | 'STAFF';
  recipientName: string;
  recipientId: string;
  signatoryName: string;
  signatoryTitle: string;
  timestamp: string;
  issueDate: string;
  verificationHash: string;
  title: string;
  subjectLine: string;
  paragraphs: string[];
  requirementsList?: string[];
}

const INITIAL_ARCHIVED_LETTERS: ArchivedDocumentRecord[] = [
  {
    id: 'ARC-2026-0091',
    referenceNumber: 'LSS/ADM-OFFER/2026/0042',
    documentType: 'Provisional Offer of Admission',
    recipientCategory: 'LEARNER',
    recipientName: 'Bupe Mwewa',
    recipientId: 'LS-2026-0042',
    signatoryName: 'Mr. Emmanuel Mwansa',
    signatoryTitle: 'Managing Director & School Principal',
    timestamp: '19 Oct 2026, 14:15:22 CAT',
    issueDate: '19 October 2026',
    verificationHash: 'VER-LSS-OFFER-2026-0042-9981A',
    title: 'PROVISIONAL OFFER OF ADMISSION: BUPE MWEWA',
    subjectLine: 'PROVISIONAL OFFER OF ADMISSION: BUPE MWEWA (REF: LS-2026-0042)',
    paragraphs: [
      'Following your formal application and subsequent satisfactory academic evaluation, the Board of Directors and the Admissions Committee of Legacy School Solwezi are pleased to extend a provisional offer of admission to Bupe Mwewa into Grade 10A Science for the 2026 Academic Session.',
      'This placement is offered at our Kansanshi Boarding Campus, tenured under the Full Residential Boarding Village Cadre. Our curriculum is aligned with the Examination Council of Zambia (ECZ) national framework supplemented by accelerated continuous assessments.',
      'Please note that admission will be formalized upon receipt of the signed acceptance slip accompanied by the minimum requisite commitment deposit before 2026-11-30.',
    ],
  },
  {
    id: 'ARC-2026-0084',
    referenceNumber: 'LSS/STAFF-REC/2026/0014',
    documentType: 'Executive Staff Recommendation',
    recipientCategory: 'STAFF',
    recipientName: 'Mr. Joseph Banda',
    recipientId: 'LSS-STF-014',
    signatoryName: 'Mr. Emmanuel Mwansa',
    signatoryTitle: 'Managing Director & School Principal',
    timestamp: '18 Oct 2026, 10:20:05 CAT',
    issueDate: '18 October 2026',
    verificationHash: 'VER-LSS-STAFF-0014-4112X',
    title: 'OFFICIAL LETTER OF RECOMMENDATION & SERVICE ATTESTATION',
    subjectLine: 'RECOMMENDATION FOR MR. JOSEPH BANDA (STAFF ID: LSS-STF-014)',
    paragraphs: [
      'This is to officially certify that Mr. Joseph Banda has been employed at Legacy School Solwezi as Resident Housemaster & Mathematics Faculty since January 2023.',
      'During his tenure, Mr. Banda has displayed exceptional dedication to learner pastoral welfare, dormitory curfew discipline, and Cambridge/ECZ curriculum support.',
      'We recommend him without reservation for any senior educational administration or pastoral leadership role.',
    ],
  },
];

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
  // Recipient Category: Learners vs Staff
  const [recipientCategory, setRecipientCategory] = useState<'LEARNER' | 'STAFF'>('LEARNER');

  // Learner Selection & Templates
  const [selectedType, setSelectedType] = useState<DocumentType>('OFFER_LETTER');
  const [selectedLearner, setSelectedLearner] = useState<DocumentLearnerProfile>(SAMPLE_LEARNERS[0]);
  const [learnerSearch, setLearnerSearch] = useState('');

  // Staff Selection & Templates
  const [selectedStaff, setSelectedStaff] = useState<LegacyStaffMember>(LEGACY_STAFF_MEMBERS[0]);
  const [staffSearch, setStaffSearch] = useState('');
  const [staffDocType, setStaffDocType] = useState<'STAFF_APPOINTMENT' | 'STAFF_RECOMMENDATION' | 'STAFF_SALARY_CLEARANCE' | 'STAFF_DUTY_CLEARANCE'>('STAFF_RECOMMENDATION');

  // Common Parameters
  const [issueDate, setIssueDate] = useState('2026-10-19');
  const [reportingDate, setReportingDate] = useState('2026-01-12');
  const [acceptanceDeadline, setAcceptanceDeadline] = useState('2026-11-30');
  const [signatory, setSignatory] = useState<'PRINCIPAL' | 'DEPUTY' | 'BURSAR'>('PRINCIPAL');
  const [recipientName, setRecipientName] = useState('The Consular & Immigration Officer');
  const [recipientOrg, setRecipientOrg] = useState('Ministry of Home Affairs & Internal Security');
  const [recipientAddress, setRecipientAddress] = useState('North-Western Provincial Headquarters, Solwezi');
  const [purpose, setPurpose] = useState('Study Permit Verification & Dependent Exemption');
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // In-Place Authorized Content Editing ("Allow users with relevant rights to edit the letters")
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [userRole, setUserRole] = useState<'PRINCIPAL' | 'DEPUTY' | 'BURSAR' | 'REGISTRAR'>('PRINCIPAL');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [customSalutation, setCustomSalutation] = useState<string>('');
  const [customParagraphs, setCustomParagraphs] = useState<string[]>([]);
  const [hasCustomEdits, setHasCustomEdits] = useState(false);

  // Archived Copies with Exact Timestamp ("Copies of generated letter for staff or learners must leave copies with timestamp")
  const [archivedLetters, setArchivedLetters] = useState<ArchivedDocumentRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('edusphere:archived-letters');
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to load archived letters from localStorage', e);
      }
    }
    return INITIAL_ARCHIVED_LETTERS;
  });

  // Filter learners
  const filteredLearners = useMemo(() => {
    if (!learnerSearch) return SAMPLE_LEARNERS;
    return SAMPLE_LEARNERS.filter(
      (l) =>
        l.learnerName.toLowerCase().includes(learnerSearch.toLowerCase()) ||
        l.studentNumber.toLowerCase().includes(learnerSearch.toLowerCase()) ||
        l.className.toLowerCase().includes(learnerSearch.toLowerCase())
    );
  }, [learnerSearch]);

  // Filter staff
  const filteredStaff = useMemo(() => {
    if (!staffSearch) return LEGACY_STAFF_MEMBERS.slice(0, 15);
    return LEGACY_STAFF_MEMBERS.filter(
      (s) =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(staffSearch.toLowerCase()) ||
        s.staffNumber.toLowerCase().includes(staffSearch.toLowerCase()) ||
        s.jobTitle.toLowerCase().includes(staffSearch.toLowerCase()) ||
        s.departmentLabel.toLowerCase().includes(staffSearch.toLowerCase())
    ).slice(0, 15);
  }, [staffSearch]);

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

  // Baseline standard generated document
  const baselineDoc = useMemo(() => {
    if (recipientCategory === 'STAFF') {
      const ref = `LSS/STF-${staffDocType.replace('STAFF_', '')}/2026/${selectedStaff.staffNumber.replace(/[^0-9]/g, '')}`;
      const hash = `VER-LSS-${ref.replace(/[^A-Za-z0-9]/g, '')}-${Date.now().toString(36).toUpperCase()}`;

      let title = 'OFFICIAL STAFF DOCUMENT';
      let subjectLine = `REFERENCE: ${selectedStaff.firstName.toUpperCase()} ${selectedStaff.lastName.toUpperCase()} (${selectedStaff.staffNumber})`;
      let paragraphs: string[] = [];

      if (staffDocType === 'STAFF_APPOINTMENT') {
        title = 'OFFICIAL LETTER OF APPOINTMENT & TEACHING COMMISSION VALIDATION';
        subjectLine = `APPOINTMENT AS ${selectedStaff.jobTitle.toUpperCase()} (${selectedStaff.staffNumber})`;
        paragraphs = [
          `This document serves to confirm the formal appointment of ${selectedStaff.firstName} ${selectedStaff.lastName} as ${selectedStaff.jobTitle} at Legacy School Solwezi.`,
          `The appointee is certified under Teaching Council of Zambia registration ${selectedStaff.tczNumber} and is tenured in the ${selectedStaff.departmentLabel} at our ${selectedStaff.campusName}.`,
          `This appointment carries full statutory responsibilities under the Education Act of 2011 and Legacy School Solwezi Academic Governance Regulations.`,
        ];
      } else if (staffDocType === 'STAFF_RECOMMENDATION') {
        title = 'EXECUTIVE LETTER OF RECOMMENDATION & SERVICE TESTIMONIAL';
        subjectLine = `RECOMMENDATION FOR ${selectedStaff.firstName.toUpperCase()} ${selectedStaff.lastName.toUpperCase()} (${selectedStaff.staffNumber})`;
        paragraphs = [
          `It is with great pleasure that I provide this institutional recommendation for ${selectedStaff.firstName} ${selectedStaff.lastName}, currently serving with distinction as ${selectedStaff.jobTitle}.`,
          `Throughout their service at Legacy School Solwezi, they have consistently demonstrated exemplary pedagogical command, moral integrity, and deep dedication to our learners and the school community.`,
          `They have our unreserved commendation and highest institutional endorsement for any future educational, professional, or academic advancement.`,
        ];
      } else if (staffDocType === 'STAFF_SALARY_CLEARANCE') {
        title = 'BURSARY PROOF OF INCOME & SALARY CLEARANCE';
        subjectLine = `CONFIRMATION OF REGULAR EMOLUMENTS: ${selectedStaff.firstName.toUpperCase()} ${selectedStaff.lastName.toUpperCase()}`;
        paragraphs = [
          `The Bursary Office of Legacy School Solwezi hereby confirms that ${selectedStaff.firstName} ${selectedStaff.lastName} is a verified, full-time staff member in good financial and contractual standing.`,
          `Their monthly emoluments and statutory payroll deductions (PAYE, NAPSA, NHIMA) are regularly reconciled and disbursed via electronic bank transfer.`,
          `This certificate is issued at the employee's request for verification with financial or consular institutions.`,
        ];
      } else {
        title = 'END-OF-TERM RESIDENTIAL & INVENTORY CLEARANCE';
        subjectLine = `CAMPUS ASSET & DUTY HANDOVER: ${selectedStaff.firstName.toUpperCase()} ${selectedStaff.lastName.toUpperCase()}`;
        paragraphs = [
          `This document validates that ${selectedStaff.firstName} ${selectedStaff.lastName} has duly handed over all curriculum materials, department equipment, and residential quarters keys for Term 1, 2026.`,
          `No outstanding liabilities or unreconciled institutional assets are recorded against their staff account.`,
        ];
      }

      return {
        documentType: selectedType,
        title,
        subtitle: 'Legacy School Solwezi Human Resources & Directorate',
        referenceNumber: ref,
        issueDate: DocumentTemplateService.formatOfficialDate(issueDate),
        recipientLines: [
          `Attn: ${selectedStaff.firstName} ${selectedStaff.lastName}`,
          `Designation: ${selectedStaff.jobTitle}`,
          `Department: ${selectedStaff.departmentLabel}`,
          `Legacy School Solwezi, North-Western Province`,
        ],
        salutation: `Dear ${selectedStaff.firstName} ${selectedStaff.lastName},`,
        subjectLine,
        paragraphs,
        signatoryName: signatoryInfo.name,
        signatoryTitle: signatoryInfo.title,
        securityStamp: {
          institution: 'Legacy School Solwezi Limited',
          registration: 'MOE/NWP/SOL/SEC/2026/044',
          tpin: '1008492019',
          issuedTimestamp: new Date().toISOString(),
          verificationHash: hash,
        },
      };
    }

    // Default Learner generation
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
    recipientCategory,
    selectedType,
    selectedLearner,
    selectedStaff,
    staffDocType,
    issueDate,
    reportingDate,
    acceptanceDeadline,
    recipientName,
    recipientOrg,
    recipientAddress,
    purpose,
    signatoryInfo,
  ]);

  // Sync baseline doc to editable state when template or recipient changes
  useEffect(() => {
    setCustomSubject(baselineDoc.subjectLine);
    setCustomSalutation(baselineDoc.salutation);
    setCustomParagraphs([...baselineDoc.paragraphs]);
    setHasCustomEdits(false);
  }, [baselineDoc]);

  // Active Document reflects custom edits if made
  const activeDocument = useMemo(() => {
    return {
      ...baselineDoc,
      salutation: hasCustomEdits ? customSalutation : baselineDoc.salutation,
      subjectLine: hasCustomEdits ? customSubject : baselineDoc.subjectLine,
      paragraphs: hasCustomEdits ? customParagraphs : baselineDoc.paragraphs,
    };
  }, [baselineDoc, hasCustomEdits, customSalutation, customSubject, customParagraphs]);

  // Save current generated document to the timestamped archive
  const handleSaveAndArchive = () => {
    const now = new Date();
    const formattedTimestamp = now.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }) + ' CAT';

    const newRecord: ArchivedDocumentRecord = {
      id: `ARC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      referenceNumber: activeDocument.referenceNumber,
      documentType: activeDocument.title,
      recipientCategory,
      recipientName: recipientCategory === 'LEARNER' ? selectedLearner.learnerName : `${selectedStaff.firstName} ${selectedStaff.lastName}`,
      recipientId: recipientCategory === 'LEARNER' ? selectedLearner.studentNumber : selectedStaff.staffNumber,
      signatoryName: activeDocument.signatoryName,
      signatoryTitle: activeDocument.signatoryTitle,
      timestamp: formattedTimestamp,
      issueDate: activeDocument.issueDate,
      verificationHash: activeDocument.securityStamp.verificationHash,
      title: activeDocument.title,
      subjectLine: activeDocument.subjectLine,
      paragraphs: [...activeDocument.paragraphs],
    };

    const updated = [newRecord, ...archivedLetters];
    setArchivedLetters(updated);
    try {
      localStorage.setItem('edusphere:archived-letters', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not persist to localStorage', e);
    }

    setToastMessage(`Official letter archived successfully at ${formattedTimestamp} (Serial: ${newRecord.id})`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handlePrint = () => {
    // Automatically save an archival copy with timestamp whenever official print is requested
    handleSaveAndArchive();
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const handleCopyText = () => {
    const plainText = `${activeDocument.title}\n${activeDocument.referenceNumber}\nDate: ${activeDocument.issueDate}\n\n${activeDocument.subjectLine}\n\n${activeDocument.salutation}\n\n${activeDocument.paragraphs.join(
      '\n\n'
    )}\n\nSignatory: ${activeDocument.signatoryName} (${activeDocument.signatoryTitle})`;
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRestoreArchivedCopy = (archive: ArchivedDocumentRecord) => {
    setCustomSubject(archive.subjectLine);
    setCustomParagraphs([...archive.paragraphs]);
    setHasCustomEdits(true);
    setToastMessage(`Restored archived snapshot ${archive.id} (Issued: ${archive.timestamp}) into live preview.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Archive Table Columns (Rule 24 Compliant)
  const archiveColumns: ColumnDef<ArchivedDocumentRecord>[] = [
    {
      key: 'timestamp',
      header: 'Archival Timestamp',
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-800 font-bold">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>{r.timestamp}</span>
        </div>
      ),
    },
    {
      key: 'referenceNumber',
      header: 'Reference Serial',
      sortable: true,
      render: (r) => <span className="font-mono text-blue-700 font-bold text-xs">{r.referenceNumber}</span>,
    },
    {
      key: 'recipientCategory',
      header: 'Category',
      sortable: true,
      render: (r) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            r.recipientCategory === 'STAFF'
              ? 'bg-purple-100 text-purple-800 border border-purple-300'
              : 'bg-blue-100 text-blue-800 border border-blue-300'
          }`}
        >
          {r.recipientCategory}
        </span>
      ),
    },
    {
      key: 'recipientName',
      header: 'Recipient of Record',
      sortable: true,
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 block">{r.recipientName}</span>
          <span className="font-mono text-[10px] text-slate-500">{r.recipientId}</span>
        </div>
      ),
    },
    {
      key: 'documentType',
      header: 'Document Type',
      sortable: true,
    },
    {
      key: 'signatoryName',
      header: 'Authorized Signatory',
      render: (r) => (
        <span className="text-xs text-slate-700 font-semibold">{r.signatoryName}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full p-4 sm:p-6 bg-slate-50 min-h-screen font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] max-w-md p-4 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 text-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white font-bold">
            ✕
          </button>
        </div>
      )}

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
            Generate, customize, and print high-fidelity letters of acceptance, provisional offers, staff credentials,
            and clearance certificates with anti-fraud QR verification codes and timestamped archival records.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* In-Place Content Editor Toggle ("Allow users with relevant rights to edit the letters") */}
          <button
            onClick={() => {
              setIsEditingContent(!isEditingContent);
              if (!isEditingContent) setHasCustomEdits(true);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              isEditingContent
                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditingContent ? 'Editing Mode Active' : 'Edit Letter Content'}</span>
          </button>

          <button
            onClick={handleSaveAndArchive}
            className="px-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            title="Save immutable timestamped copy to audit archives"
          >
            <Archive className="w-4 h-4 text-purple-600" />
            <span>Archive Copy</span>
          </button>

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
          {/* Target Audience Switcher: Learners vs Staff */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              1. Document Recipient Category
            </span>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setRecipientCategory('LEARNER')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  recipientCategory === 'LEARNER'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-amber-300" />
                <span>Enrolled Learners</span>
              </button>
              <button
                type="button"
                onClick={() => setRecipientCategory('STAFF')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  recipientCategory === 'STAFF'
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-4 h-4 text-amber-300" />
                <span>Staff Members (48)</span>
              </button>
            </div>
          </div>

          {/* Template Selector Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              2. Select Official Letter Template
            </span>

            {recipientCategory === 'LEARNER' ? (
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
                    Confirmed enrollment credential
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
                    Financial ledger reconciliation and exam clearance
                  </span>
                </button>
              </div>
            ) : (
              // Staff Document Templates
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStaffDocType('STAFF_RECOMMENDATION')}
                  className={`p-3 rounded-2xl text-left border text-xs font-bold transition flex flex-col justify-between ${
                    staffDocType === 'STAFF_RECOMMENDATION'
                      ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-300" />
                    <span>Staff Recommendation</span>
                  </div>
                  <span className="text-[10px] mt-1 text-slate-400 font-normal">
                    Service testimonial & endorsement
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStaffDocType('STAFF_APPOINTMENT')}
                  className={`p-3 rounded-2xl text-left border text-xs font-bold transition flex flex-col justify-between ${
                    staffDocType === 'STAFF_APPOINTMENT'
                      ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-amber-300" />
                    <span>Letter of Appointment</span>
                  </div>
                  <span className="text-[10px] mt-1 text-slate-400 font-normal">
                    TCZ teaching commission proof
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStaffDocType('STAFF_SALARY_CLEARANCE')}
                  className={`p-3 rounded-2xl text-left border text-xs font-bold transition flex flex-col justify-between ${
                    staffDocType === 'STAFF_SALARY_CLEARANCE'
                      ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Proof of Income</span>
                  </div>
                  <span className="text-[10px] mt-1 text-slate-400 font-normal">
                    Bank loan & consular certification
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStaffDocType('STAFF_DUTY_CLEARANCE')}
                  className={`p-3 rounded-2xl text-left border text-xs font-bold transition flex flex-col justify-between ${
                    staffDocType === 'STAFF_DUTY_CLEARANCE'
                      ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>Handover Clearance</span>
                  </div>
                  <span className="text-[10px] mt-1 text-slate-400 font-normal">
                    End-of-term inventory sign-off
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Recipient Picker Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                3. Choose Recipient ({recipientCategory === 'LEARNER' ? 'Learner' : 'Staff Member'})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {recipientCategory === 'LEARNER' ? 'Active Pupils' : '48 Staff Cadres'}
              </span>
            </div>

            {recipientCategory === 'LEARNER' ? (
              <>
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
              </>
            ) : (
              <>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search staff name, designation, or staff ID..."
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {filteredStaff.map((stf) => {
                    const isSelected = selectedStaff.staffNumber === stf.staffNumber;
                    return (
                      <div
                        key={stf.staffNumber}
                        onClick={() => setSelectedStaff(stf)}
                        className={`p-2.5 rounded-xl cursor-pointer transition flex items-center justify-between ${
                          isSelected ? 'bg-purple-50 border border-purple-300' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {stf.firstName} {stf.lastName}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {stf.jobTitle} • <span className="font-mono text-purple-700">{stf.staffNumber}</span>
                          </p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-purple-700" />}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* IN-PLACE AUTHORIZED CONTENT EDITOR ("Allow users with relevant rights to edit the letters") */}
          {isEditingContent && (
            <div className="bg-amber-50/60 border-2 border-amber-300 rounded-3xl p-5 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <span className="text-xs font-black text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-amber-700" />
                  <span>Authorized Letter Content Editor</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCustomSubject(baselineDoc.subjectLine);
                    setCustomSalutation(baselineDoc.salutation);
                    setCustomParagraphs([...baselineDoc.paragraphs]);
                    setHasCustomEdits(false);
                    setToastMessage('Reset letter text to standard template defaults.');
                  }}
                  className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Defaults</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-amber-900 mb-1">Subject Header</label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => {
                      setCustomSubject(e.target.value);
                      setHasCustomEdits(true);
                    }}
                    className="w-full bg-white border border-amber-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-900 mb-1">Salutation</label>
                  <input
                    type="text"
                    value={customSalutation}
                    onChange={(e) => {
                      setCustomSalutation(e.target.value);
                      setHasCustomEdits(true);
                    }}
                    className="w-full bg-white border border-amber-300 rounded-xl p-2.5 font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-bold text-amber-900">Customized Letter Paragraphs</label>
                  {customParagraphs.map((para, pIdx) => (
                    <div key={pIdx} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-amber-800">
                        <span>Paragraph #{pIdx + 1}</span>
                        {customParagraphs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = customParagraphs.filter((_, idx) => idx !== pIdx);
                              setCustomParagraphs(updated);
                              setHasCustomEdits(true);
                            }}
                            className="text-red-600 hover:text-red-800 font-bold"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={3}
                        value={para}
                        onChange={(e) => {
                          const updated = [...customParagraphs];
                          updated[pIdx] = e.target.value;
                          setCustomParagraphs(updated);
                          setHasCustomEdits(true);
                        }}
                        className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setCustomParagraphs([...customParagraphs, 'Additional authorized clause endorsed by the Directorate.']);
                      setHasCustomEdits(true);
                    }}
                    className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Paragraph</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Letter Meta Details & Dates Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              4. Institutional Letterhead Dates & Signatory
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

              {recipientCategory === 'LEARNER' && (
                <>
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
                </>
              )}
            </div>
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
                  REF: <strong className="text-slate-900 font-mono">{activeDocument.referenceNumber}</strong>
                </span>
                <span>
                  Date: <strong className="text-slate-900">{activeDocument.issueDate}</strong>
                </span>
              </div>

              {/* Recipient Lines */}
              {activeDocument.recipientLines && activeDocument.recipientLines.length > 0 && (
                <div className="mt-4 text-[11px] font-sans space-y-0.5">
                  {activeDocument.recipientLines.map((line, idx) => (
                    <p key={idx} className={idx === 0 ? 'font-bold text-slate-900 uppercase' : 'text-slate-700'}>
                      {line}
                    </p>
                  ))}
                </div>
              )}

              {/* Salutation & Subject */}
              <div className="mt-4 font-sans">
                <p className="text-xs font-bold text-slate-800">{activeDocument.salutation}</p>
                <h2 className="text-sm font-black font-sans uppercase tracking-wider text-slate-950 mt-2 inline-block border-b-2 border-slate-950 pb-1">
                  {activeDocument.subjectLine}
                </h2>
              </div>

              {/* Tabular Data (if present and learner mode) */}
              {recipientCategory === 'LEARNER' && (activeDocument as any).tabularData && (
                <div className="mt-4 border border-slate-300 rounded-lg overflow-hidden text-[11px] font-sans">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300">
                        {(activeDocument as any).tabularData.headers.map((h: string, idx: number) => (
                          <th key={idx} className="px-3 py-1.5 text-left font-bold text-slate-800 text-[10px] uppercase">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(activeDocument as any).tabularData.rows.map((row: any[], rIdx: number) => (
                        <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                          {row.map((cell: any, cIdx: number) => (
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

              {/* Body Paragraphs */}
              <div className="mt-4 text-xs text-slate-800 space-y-3 text-justify">
                {activeDocument.paragraphs.map((para, idx) => (
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
                  <p className="font-bold text-slate-950 mt-1">{activeDocument.signatoryName}</p>
                  <p className="text-[10px] text-slate-600">{activeDocument.signatoryTitle}</p>
                  <p className="text-[9px] text-slate-400">Legacy School Solwezi Administration</p>
                </div>

                {/* Anti-Fraud Security QR Stamp */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-sans">
                  <div className="w-14 h-14 bg-white p-1 rounded-lg border border-slate-300 flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-slate-900" />
                  </div>
                  <div className="text-[8px] text-slate-600 space-y-0.5">
                    <span className="font-bold text-slate-900 block uppercase">SECURE VERIFIED DOCUMENT</span>
                    <span>Stamp Hash: {activeDocument.securityStamp.verificationHash.slice(0, 24)}...</span>
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

      {/* ARCHIVED ISSUED COPIES LEDGER ("Copies of generated letter for staff or learners must leave copies with timestamp") */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-purple-700" />
            <h2 className="text-lg font-black text-slate-900">
              Archived Official Issued Letters & Timestamp Audit Trail
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {archivedLetters.length} Document Copies Logged
          </span>
        </div>

        <EnterpriseTable
          title="Issued Institutional Letters Register"
          description="Every official document generated or printed leaves an immutable timestamped copy in compliance with Ministry of Education audit mandates."
          data={archivedLetters}
          columns={archiveColumns}
          exportFilename="edusphere-issued-letters-ledger"
          rowActions={(row) => (
            <button
              onClick={() => handleRestoreArchivedCopy(row)}
              className="px-2.5 py-1 text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition"
              title="View or reprint this exact historical copy"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Archived Copy</span>
            </button>
          )}
        />
      </div>
    </div>
  );
}
