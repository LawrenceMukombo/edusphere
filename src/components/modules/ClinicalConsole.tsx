'use client';

import React, { useState } from 'react';
import {
  Stethoscope,
  Building,
  Users,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  Plus,
  BookOpen,
  AlertCircle,
  ShieldCheck,
  Search,
  Filter,
  Printer,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Check,
} from 'lucide-react';
import { OfficialClinicalCertificateModal } from '../clinical/OfficialClinicalCertificateModal';
import { LogProcedureModal } from '../clinical/LogProcedureModal';
import { SignOffModal } from '../clinical/SignOffModal';
import { SchedulePlacementModal } from '../clinical/SchedulePlacementModal';

export interface ClinicalConsoleProps {
  initialSites?: any[];
  initialPlacements?: any[];
  learners?: any[];
}

function formatDateStr(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') {
    return val.includes('T') ? val.split('T')[0] : val;
  }
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  return String(val);
}

export function ClinicalConsole({
  initialSites = [],
  initialPlacements = [],
  learners = [],
}: ClinicalConsoleProps) {
  const [activeTab, setActiveTab] = useState<'placements' | 'logbook' | 'sites' | 'supervisors'>('placements');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notice, setNotice] = useState<string>('');

  // Modals state
  const [showPlacementModal, setShowPlacementModal] = useState<boolean>(false);
  const [showLogbookModal, setShowLogbookModal] = useState<boolean>(false);
  const [selectedEntryForSignOff, setSelectedEntryForSignOff] = useState<any | null>(null);
  const [selectedStudentForCert, setSelectedStudentForCert] = useState<any | null>(null);

  // Sites list state
  const [sites, setSites] = useState<any[]>(
    initialSites.length > 0
      ? initialSites
      : [
          {
            id: 'site-1',
            code: 'SOL-GEN',
            name: 'Solwezi General Hospital',
            siteType: 'PROVINCIAL_TERTIARY',
            location: 'Solwezi Central, North-Western Province',
            province: 'North-Western',
            capacityStudents: 45,
            contactPerson: 'Dr. Mukuka Banda, Medical Superintendent',
            contactPhone: '+260 218 821102',
            mouValidUntil: '2028-12-31',
            supervisorsCount: 8,
          },
          {
            id: 'site-2',
            code: 'LUM-HOSP',
            name: 'Lumwana First Level Hospital',
            siteType: 'FIRST_LEVEL_HOSPITAL',
            location: 'Lumwana Town Centre, Kalumbila District',
            province: 'North-Western',
            capacityStudents: 25,
            contactPerson: 'Dr. Grace Chibwe, Clinical Director',
            contactPhone: '+260 977 440112',
            mouValidUntil: '2028-12-31',
            supervisorsCount: 5,
          },
          {
            id: 'site-3',
            code: 'MAN-HC',
            name: 'Manyama Urban Health Centre',
            siteType: 'PRIMARY_HEALTH_CENTRE',
            location: 'Manyama Corridor, Lumwana Road',
            province: 'North-Western',
            capacityStudents: 20,
            contactPerson: 'Sister Florence Bwalya, Sister-in-Charge',
            contactPhone: '+260 966 220194',
            mouValidUntil: '2027-10-31',
            supervisorsCount: 4,
          },
        ]
  );

  // Placements state
  const [placements, setPlacements] = useState<any[]>(
    initialPlacements.length > 0
      ? initialPlacements.map((p: any, idx: number) => ({
          id: p.id || `pl-${idx + 1}`,
          studentName: p.learner ? `${p.learner.firstName} ${p.learner.lastName}` : (p.studentName || 'Student Trainee'),
          studentNumber: p.learner?.studentNumber || p.studentNumber || 'NWU-2026-0001',
          councilIndexingNo: p.councilIndexingNo || 'NMCZ/IDX/2026/0410',
          programme: p.learner?.programme?.name || p.programme || 'Diploma in Registered Nursing',
          clinicalSite: p.clinicalSite || { name: 'Solwezi General Hospital', location: 'Solwezi' },
          wardOrDept: p.wardOrDept || 'General Medical Ward',
          startDate: formatDateStr(p.startDate) || '2026-10-01',
          endDate: formatDateStr(p.endDate) || '2026-11-15',
          hoursCompleted: Number(p.hoursCompleted || 120),
          totalHoursTarget: Number(p.totalHoursTarget || 160),
          status: p.status || 'ACTIVE',
          preceptorName: p.preceptorName || 'Sr. Patricia Mwewa, RN',
        }))
      : [
    {
      id: 'pl-1',
      studentName: 'Brian Mulenga',
      studentNumber: 'NWU-2026-0004',
      councilIndexingNo: 'NMCZ/IDX/2026/0411',
      programme: 'Diploma in Registered Nursing',
      clinicalSite: { name: 'Solwezi General Hospital', location: 'Solwezi' },
      wardOrDept: 'Female Medical & Surgical Ward',
      startDate: '2026-10-01',
      endDate: '2026-11-15',
      hoursCompleted: 140,
      totalHoursTarget: 160,
      status: 'ACTIVE',
      preceptorName: 'Sr. Patricia Mwewa, RN',
    },
    {
      id: 'pl-2',
      studentName: 'Esther Lungu',
      studentNumber: 'NWU-2026-0005',
      councilIndexingNo: 'NMCZ/IDX/2026/0412',
      programme: 'Diploma in Registered Nursing',
      clinicalSite: { name: 'Manyama Urban Health Centre', location: 'Manyama' },
      wardOrDept: 'Maternity, Labor Ward & Antenatal Care',
      startDate: '2026-10-01',
      endDate: '2026-11-15',
      hoursCompleted: 160,
      totalHoursTarget: 160,
      status: 'COMPLETED',
      preceptorName: 'Sister Florence Bwalya, RN',
    },
    {
      id: 'pl-3',
      studentName: 'Emmanuel Sichone',
      studentNumber: 'NWU-2026-0002',
      councilIndexingNo: 'HPCZ/IDX/2026/0891',
      programme: 'Diploma in Clinical Medicine',
      clinicalSite: { name: 'Solwezi General Hospital', location: 'Solwezi' },
      wardOrDept: 'Emergency, Casualty & Resuscitation Unit',
      startDate: '2026-10-05',
      endDate: '2026-11-20',
      hoursCompleted: 125,
      totalHoursTarget: 200,
      status: 'ACTIVE',
      preceptorName: 'Dr. Mwape Banda, MBChB',
    },
    {
      id: 'pl-4',
      studentName: 'Grace Mwape',
      studentNumber: 'NWU-2026-0003',
      councilIndexingNo: 'HPCZ/IDX/2026/0892',
      programme: 'Diploma in Clinical Medicine',
      clinicalSite: { name: 'Lumwana First Level Hospital', location: 'Lumwana' },
      wardOrDept: 'Pediatric & Neonatal Ward',
      startDate: '2026-10-05',
      endDate: '2026-11-20',
      hoursCompleted: 155,
      totalHoursTarget: 200,
      status: 'ACTIVE',
      preceptorName: 'Dr. Grace Chibwe, Clinical Officer',
    },
    {
      id: 'pl-5',
      studentName: 'Chilufya Banda',
      studentNumber: 'NWU-2026-0001',
      councilIndexingNo: 'NMCZ/IDX/2026/0410',
      programme: 'Diploma in Registered Nursing',
      clinicalSite: { name: 'Solwezi General Hospital', location: 'Solwezi' },
      wardOrDept: 'Main Operating Theatre & Recovery',
      startDate: '2026-10-10',
      endDate: '2026-11-25',
      hoursCompleted: 85,
      totalHoursTarget: 160,
      status: 'ACTIVE',
      preceptorName: 'Mr. John Lungu, Theatre Nurse',
    },
  ]);

  // Logbook procedures state
  const [logbookEntries, setLogbookEntries] = useState<any[]>([
    {
      id: 'log-1',
      studentName: 'Brian Mulenga',
      studentNumber: 'NWU-2026-0004',
      procedureCategory: 'CORE_NURSING',
      activityCode: 'NUR-IV-CANNULATION',
      procedureTitle: 'Intravenous Cannulation (20G) & Infusion Regimen',
      caseSummaryDeidentified: 'Adult female presented with acute dehydration secondary to gastroenteritis. 20G IV cannula inserted on left cephalic vein on first attempt under aseptic technique.',
      hoursLogged: 4,
      competencySelfRating: 'PERFORMED_WITH_SUPERVISION',
      reflection: 'Maintained strict asepsis. Verified patient ID band against medication chart before connecting IV line.',
      isSupervisorSigned: true,
      supervisorName: 'Sr. Patricia Mwewa, RN, BScN',
      supervisorFeedback: 'Proficient vein selection and gentle needle insertion technique. Documented fluid balance correctly.',
      date: '2026-10-22',
    },
    {
      id: 'log-2',
      studentName: 'Esther Lungu',
      studentNumber: 'NWU-2026-0005',
      procedureCategory: 'MIDWIFERY_MCH',
      activityCode: 'MCH-PARTOGRAPH-DELIVERY',
      procedureTitle: 'Monitoring Active Labor via Partograph & Spontaneous Delivery Assist',
      caseSummaryDeidentified: 'Gravida 2 Para 1 at 39 weeks gestation in active phase of labor. Cervical dilation and fetal heart rate charted on WHO Partograph. Delivered live female infant (Apgar 9/10 at 5 min).',
      hoursLogged: 8,
      competencySelfRating: 'PERFORMED_WITH_SUPERVISION',
      reflection: 'Monitored descent and uterine contractions carefully. Conducted active management of third stage of labor (AMTSL) smoothly.',
      isSupervisorSigned: true,
      supervisorName: 'Sister Florence Bwalya, Midwife',
      supervisorFeedback: 'Excellent partograph charting. Calm conduct during delivery and prompt neonatal care.',
      date: '2026-10-23',
    },
    {
      id: 'log-3',
      studentName: 'Emmanuel Sichone',
      studentNumber: 'NWU-2026-0002',
      procedureCategory: 'CLINICAL_MEDICINE',
      activityCode: 'MED-SUTURE-LACERATION',
      procedureTitle: 'Minor Surgical Wound Debridement & Interrupted Suture Closure',
      caseSummaryDeidentified: 'Adult male presented with 5cm laceration on right forearm following domestic accidental trauma. Cleaned with chlorhexidine, infiltrated with 2% lignocaine, and closed with 4-0 nylon sutures.',
      hoursLogged: 3,
      competencySelfRating: 'PERFORMED_WITH_SUPERVISION',
      reflection: 'Learned importance of eversion of skin edges to minimize scar formation.',
      isSupervisorSigned: false,
      supervisorName: null,
      supervisorFeedback: null,
      date: '2026-10-24',
    },
    {
      id: 'log-4',
      studentName: 'Grace Mwape',
      studentNumber: 'NWU-2026-0003',
      procedureCategory: 'CORE_NURSING',
      activityCode: 'NUR-CATHETER-INSERTION',
      procedureTitle: 'Urethral Catheterization (Foley 14Fr) under Strict Aseptic Technique',
      caseSummaryDeidentified: 'Post-operative adult female requiring urinary drainage monitoring. Sterile field established, lubricated 14Fr Foley catheter passed and balloon inflated with 10ml sterile water.',
      hoursLogged: 3,
      competencySelfRating: 'PERFORMED_WITH_SUPERVISION',
      reflection: 'Careful adherence to non-touch technique to prevent CAUTI (Catheter-Associated UTI).',
      isSupervisorSigned: false,
      supervisorName: null,
      supervisorFeedback: null,
      date: '2026-10-24',
    },
  ]);

  // Supervisors state
  const [supervisors, setSupervisors] = useState<any[]>([
    {
      id: 'sup-1',
      fullName: 'Sr. Patricia Mwewa, RN, BScN',
      profession: 'Senior Nursing Sister & Clinical Preceptor',
      councilRegNumber: 'NMCZ-RN-2012-04481',
      clinicalSiteName: 'Solwezi General Hospital',
      department: 'Female Medical & Surgical',
      phone: '+260 977 120944',
      traineesSupervised: 6,
    },
    {
      id: 'sup-2',
      fullName: 'Dr. Mwape Banda, MBChB, MMed',
      profession: 'Consultant Physician & Medical Preceptor',
      councilRegNumber: 'HPCZ-MED-2010-01924',
      clinicalSiteName: 'Solwezi General Hospital',
      department: 'Emergency & Internal Medicine',
      phone: '+260 966 331189',
      traineesSupervised: 4,
    },
    {
      id: 'sup-3',
      fullName: 'Sister Florence Bwalya, RN, RM',
      profession: 'Senior Midwife Preceptor',
      councilRegNumber: 'NMCZ-RM-2015-08112',
      clinicalSiteName: 'Manyama Urban Health Centre',
      department: 'Maternity & Child Health',
      phone: '+260 971 884920',
      traineesSupervised: 4,
    },
    {
      id: 'sup-4',
      fullName: 'Mr. John Lungu, RN (Peri-Operative)',
      profession: 'Operating Theatre Nurse Specialist',
      councilRegNumber: 'NMCZ-RN-2014-06631',
      clinicalSiteName: 'Solwezi General Hospital',
      department: 'Main Theatre & Recovery',
      phone: '+260 955 771209',
      traineesSupervised: 3,
    },
  ]);

  // Calculations
  const totalHoursLogged = placements.reduce((sum, p) => sum + (p.hoursCompleted || 0), 0);
  const totalHoursTarget = placements.reduce((sum, p) => sum + (p.totalHoursTarget || 0), 0);
  const completionPercentage = totalHoursTarget > 0 ? Math.round((totalHoursLogged / totalHoursTarget) * 100) : 0;
  const verifiedLogbooksCount = logbookEntries.filter((l) => l.isSupervisorSigned).length;

  function handlePlacementCreated(newPl: any) {
    const formatted = {
      id: newPl.id || `pl-${Date.now()}`,
      studentName: 'Newly Assigned Candidate',
      studentNumber: 'NWU-2026-0008',
      councilIndexingNo: 'NMCZ/IDX/2026/0419',
      programme: 'Diploma in Registered Nursing',
      clinicalSite: { name: 'Solwezi General Hospital', location: 'Solwezi' },
      wardOrDept: newPl.wardOrDept,
      startDate: newPl.startDate ? new Date(newPl.startDate).toISOString().split('T')[0] : '2026-11-02',
      endDate: newPl.endDate ? new Date(newPl.endDate).toISOString().split('T')[0] : '2026-12-18',
      hoursCompleted: 0,
      totalHoursTarget: Number(newPl.totalHoursTarget || 160),
      status: 'SCHEDULED',
      preceptorName: 'Sr. Patricia Mwewa, RN',
    };
    setPlacements([formatted, ...placements]);
    setNotice('Hospital clinical placement scheduled successfully.');
    setTimeout(() => setNotice(''), 4000);
  }

  function handleLogbookSubmitted(entry: any) {
    const formatted = {
      id: entry.id || `log-${Date.now()}`,
      studentName: 'Nursing Trainee',
      studentNumber: 'NWU-2026-0004',
      procedureCategory: entry.procedureCategory,
      activityCode: entry.activityCode,
      procedureTitle: entry.activityCode,
      caseSummaryDeidentified: entry.caseSummaryDeidentified,
      hoursLogged: entry.hoursLogged || 4,
      competencySelfRating: entry.competencySelfRating || 'PERFORMED_WITH_SUPERVISION',
      reflection: entry.reflection || 'Maintained sterile technique.',
      isSupervisorSigned: false,
      supervisorName: null,
      supervisorFeedback: null,
      date: '2026-10-24',
    };
    setLogbookEntries([formatted, ...logbookEntries]);
    setNotice('De-identified logbook entry recorded. Pending preceptor review and sign-off.');
    setTimeout(() => setNotice(''), 5000);
  }

  function handleLogbookSigned(signedEntry: any) {
    setLogbookEntries(
      logbookEntries.map((l) => (l.id === signedEntry.id ? signedEntry : l))
    );
    setNotice(`Logbook entry #${signedEntry.id} signed and endorsed by preceptor.`);
    setTimeout(() => setNotice(''), 4000);
  }

  return (
    <div className="mt-8 space-y-6">
      {notice && (
        <div className="flex items-center justify-between rounded-xl border border-cyan-300 bg-cyan-50 p-4 text-sm font-semibold text-cyan-900 shadow-sm">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} className="text-cyan-700 hover:text-cyan-950">
            &times;
          </button>
        </div>
      )}

      {/* KPI Cards (Light Theme) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Hospital Attachments
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-50 text-cyan-700">
              <Stethoscope className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{placements.length}</span>
            <span className="text-xs font-semibold text-slate-500">Scheduled Rotations</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Across {sites.length} Accredited Partner Hospitals</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Clinical Hours Completed
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-emerald-600">
              {totalHoursLogged} hrs
            </span>
            <span className="text-xs font-bold text-slate-500">/ {totalHoursTarget} target</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, completionPercentage)}%` }} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              EPA Logbook Sign-offs
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
              <Award className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {verifiedLogbooksCount} / {logbookEntries.length}
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
              Preceptor Signed
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">De-identified procedure competencies</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Hospital Preceptors
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-50 text-teal-600">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{supervisors.length}</span>
            <span className="text-xs font-semibold text-slate-500">Accredited Clinicians</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">NMCZ & HPCZ Registered Practitioners</p>
        </div>
      </div>

      {/* Navigation Tabs (Light Theme) */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('placements')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'placements'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Calendar className="h-4 w-4" /> Hospital Rotations & Placements ({placements.length})
        </button>

        <button
          onClick={() => setActiveTab('logbook')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'logbook'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="h-4 w-4" /> De-Identified EPA Logbook ({logbookEntries.length})
        </button>

        <button
          onClick={() => setActiveTab('sites')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'sites'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Building className="h-4 w-4" /> Hospital Partner Facilities ({sites.length})
        </button>

        <button
          onClick={() => setActiveTab('supervisors')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'supervisors'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Users className="h-4 w-4" /> Clinical Preceptors ({supervisors.length})
        </button>
      </div>

      {/* TAB 1: PLACEMENTS */}
      {activeTab === 'placements' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Clinical Placement Rotations</h3>
              <p className="text-[11px] text-slate-500">
                1,600 hours required for Registered Nursing • 1,800 hours for Clinical Medicine
              </p>
            </div>
            <button
              onClick={() => setShowPlacementModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-cyan-700"
            >
              <Plus className="h-4 w-4" /> Schedule New Placement
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-3">Programme</th>
                  <th className="py-3 px-3">Hospital Site</th>
                  <th className="py-3 px-3">Ward / Department</th>
                  <th className="py-3 px-3">Rotation Period</th>
                  <th className="py-3 px-3">Hours Logged</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {placements.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() =>
                      setSelectedStudentForCert({
                        studentName: p.studentName,
                        studentNumber: p.studentNumber,
                        councilIndexingNo: p.councilIndexingNo,
                        programme: p.programme,
                        totalHoursLogged: 1620,
                        statutoryHoursRequired: 1600,
                        completionDate: '24 October 2026',
                        verifiedProceduresCount: 42,
                        rotations: [
                          {
                            hospitalSite: 'Solwezi General Hospital',
                            wardOrDept: 'Female Medical & Surgical Ward',
                            hoursCompleted: 320,
                            preceptorName: 'Sr. Patricia Mwewa, RN',
                            standing: 'DISTINCTION',
                          },
                          {
                            hospitalSite: 'Manyama Urban Health Centre',
                            wardOrDept: 'Maternity, Labor Ward & Antenatal',
                            hoursCompleted: 280,
                            preceptorName: 'Sister Florence Bwalya, RM',
                            standing: 'MERIT',
                          },
                          {
                            hospitalSite: 'Lumwana First Level Hospital',
                            wardOrDept: 'Pediatric & Neonatal Care Unit',
                            hoursCompleted: 240,
                            preceptorName: 'Dr. Grace Chibwe',
                            standing: 'DISTINCTION',
                          },
                        ],
                      })
                    }
                    className="hover:bg-slate-50 transition cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <span className="block font-bold text-slate-900">{p.studentName}</span>
                      <span className="font-mono text-[11px] text-slate-500">{p.studentNumber}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{p.programme}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{p.clinicalSite?.name}</td>
                    <td className="py-3 px-3 text-slate-700">{p.wardOrDept}</td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {formatDateStr(p.startDate)} &rarr; {formatDateStr(p.endDate)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{p.hoursCompleted}h</span>
                        <span className="text-slate-400">/ {p.totalHoursTarget}h</span>
                      </div>
                      <div className="mt-1 h-1.5 w-20 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-cyan-600"
                          style={{ width: `${Math.min(100, (p.hoursCompleted / p.totalHoursTarget) * 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {p.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Scheduled
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudentForCert({
                            studentName: p.studentName,
                            studentNumber: p.studentNumber,
                            councilIndexingNo: p.councilIndexingNo,
                            programme: p.programme,
                            totalHoursLogged: 1620,
                            statutoryHoursRequired: 1600,
                            completionDate: '24 October 2026',
                            verifiedProceduresCount: 42,
                            rotations: [
                              {
                                hospitalSite: 'Solwezi General Hospital',
                                wardOrDept: 'Female Medical & Surgical Ward',
                                hoursCompleted: 320,
                                preceptorName: 'Sr. Patricia Mwewa, RN',
                                standing: 'DISTINCTION',
                              },
                              {
                                hospitalSite: 'Manyama Urban Health Centre',
                                wardOrDept: 'Maternity, Labor Ward & Antenatal',
                                hoursCompleted: 280,
                                preceptorName: 'Sister Florence Bwalya, RM',
                                standing: 'MERIT',
                              },
                              {
                                hospitalSite: 'Lumwana First Level Hospital',
                                wardOrDept: 'Pediatric & Neonatal Care Unit',
                                hoursCompleted: 240,
                                preceptorName: 'Dr. Grace Chibwe',
                                standing: 'DISTINCTION',
                              },
                              {
                                hospitalSite: 'Solwezi General Hospital',
                                wardOrDept: 'Main Operating Theatre & Recovery',
                                hoursCompleted: 260,
                                preceptorName: 'Mr. John Lungu, RN',
                                standing: 'MERIT',
                              },
                              {
                                hospitalSite: 'Solwezi General Hospital',
                                wardOrDept: 'Emergency & Resuscitation (Casualty)',
                                hoursCompleted: 260,
                                preceptorName: 'Dr. Mwape Banda, MBChB',
                                standing: 'DISTINCTION',
                              },
                              {
                                hospitalSite: 'Mukinge Mission Hospital',
                                wardOrDept: 'Community Public Health & Outreach',
                                hoursCompleted: 260,
                                preceptorName: 'Dr. David Tembo',
                                standing: 'MERIT',
                              },
                            ],
                          });
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        <Printer className="h-3 w-3 text-slate-500" /> Certificate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DE-IDENTIFIED EPA LOGBOOK */}
      {activeTab === 'logbook' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm">Entrustable Professional Activities (EPA) Logbook</h3>
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="inline h-3 w-3 mr-0.5" /> De-Identified Patient Data
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Meets statutory NMCZ and HPCZ procedural clinical competency standards
              </p>
            </div>
            <button
              onClick={() => setShowLogbookModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" /> Log Clinical Procedure
            </button>
          </div>

          <div className="space-y-3">
            {logbookEntries.map((log) => (
              <div key={log.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="rounded bg-cyan-50 px-2.5 py-1 font-mono text-xs font-bold text-cyan-800 border border-cyan-200">
                      {log.activityCode}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm">{log.procedureTitle}</h4>
                    <span className="text-xs text-slate-400">• Trainee: {log.studentName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {log.isSupervisorSigned ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Preceptor Signed
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedEntryForSignOff(log)}
                        className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm hover:bg-amber-700"
                      >
                        <Award className="h-3.5 w-3.5" /> Preceptor Sign-off
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-700 leading-relaxed">
                  <p><strong>Case Summary:</strong> {log.caseSummaryDeidentified}</p>
                  <p className="mt-1 text-slate-500 italic"><strong>Reflection:</strong> &ldquo;{log.reflection}&rdquo;</p>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-600">
                  <div className="flex gap-4">
                    <span>Shift Hours: <strong>{log.hoursLogged}h</strong></span>
                    <span>Level: <strong>{log.competencySelfRating}</strong></span>
                    <span>Date: <strong>{formatDateStr(log.date)}</strong></span>
                  </div>
                  {log.isSupervisorSigned && (
                    <div className="text-emerald-800 font-semibold">
                      Evaluated by <strong>{log.supervisorName}</strong>: &ldquo;{log.supervisorFeedback}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: HOSPITAL SITES */}
      {activeTab === 'sites' && (
        <div className="grid gap-6 md:grid-cols-3">
          {sites.map((site) => (
            <div key={site.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded bg-cyan-50 px-2 py-0.5 text-xs font-bold uppercase text-cyan-800 border border-cyan-200">
                    {site.siteType}
                  </span>
                  <h3 className="mt-2 text-base font-extrabold text-slate-900">{site.name}</h3>
                  <p className="text-xs text-slate-500">{site.location}</p>
                </div>
                <Building className="h-6 w-6 text-cyan-600" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Student Capacity:</span>
                  <p className="font-bold text-slate-800">{site.capacityStudents} learners</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Preceptors:</span>
                  <p className="font-bold text-slate-800">{site.supervisorsCount || 4} registered</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">MoU Expiry:</span>
                  <p className="font-bold text-emerald-700">{formatDateStr(site.mouValidUntil) || '2028-12-31'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Contact:</span>
                  <p className="font-bold text-slate-800 truncate">{site.contactPhone}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: SUPERVISORS */}
      {activeTab === 'supervisors' && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="py-3 px-4">Preceptor Name</th>
                <th className="py-3 px-3">Council Registration #</th>
                <th className="py-3 px-3">Hospital Training Facility</th>
                <th className="py-3 px-3">Ward / Speciality</th>
                <th className="py-3 px-3">Active Trainees</th>
                <th className="py-3 px-4">Contact Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {supervisors.map((sup) => (
                <tr key={sup.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <span className="block font-bold text-slate-900">{sup.fullName}</span>
                    <span className="text-[11px] text-slate-500">{sup.profession}</span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-cyan-800">{sup.councilRegNumber}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{sup.clinicalSiteName}</td>
                  <td className="py-3 px-3 text-slate-700">{sup.department}</td>
                  <td className="py-3 px-3">
                    <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-bold text-cyan-800">
                      {sup.traineesSupervised} Learners
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{sup.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Official Certificate Modal */}
      {selectedStudentForCert && (
        <OfficialClinicalCertificateModal
          isOpen={!!selectedStudentForCert}
          onClose={() => setSelectedStudentForCert(null)}
          certificateData={selectedStudentForCert}
        />
      )}

      {/* Log Procedure Modal */}
      <LogProcedureModal
        isOpen={showLogbookModal}
        onClose={() => setShowLogbookModal(false)}
        placements={placements}
        learners={
          learners.length > 0
            ? learners
            : [
                { id: '172ade2b-7c89-4f9e-a31c-ef16745843e9', firstName: 'Brian', lastName: 'Mulenga', studentNumber: 'NWU-2026-0004' },
                { id: '57fb6263-7eb3-4cb4-a104-c2aa7a11c378', firstName: 'Esther', lastName: 'Lungu', studentNumber: 'NWU-2026-0005' },
                { id: 'e213a2ed-c2de-4236-8724-3c325ad2df53', firstName: 'Emmanuel', lastName: 'Sichone', studentNumber: 'NWU-2026-0002' },
                { id: '4d747e0a-5eee-4459-af7f-221157dd0b8b', firstName: 'Grace', lastName: 'Mwape', studentNumber: 'NWU-2026-0003' },
              ]
        }
        onLogbookSubmitted={handleLogbookSubmitted}
      />

      {/* Preceptor Sign-off Modal */}
      {selectedEntryForSignOff && (
        <SignOffModal
          isOpen={!!selectedEntryForSignOff}
          onClose={() => setSelectedEntryForSignOff(null)}
          entry={selectedEntryForSignOff}
          onSigned={handleLogbookSigned}
        />
      )}

      {/* Schedule Placement Modal */}
      <SchedulePlacementModal
        isOpen={showPlacementModal}
        onClose={() => setShowPlacementModal(false)}
        sites={sites}
        learners={
          learners.length > 0
            ? learners
            : [
                { id: '172ade2b-7c89-4f9e-a31c-ef16745843e9', firstName: 'Brian', lastName: 'Mulenga', studentNumber: 'NWU-2026-0004' },
                { id: '57fb6263-7eb3-4cb4-a104-c2aa7a11c378', firstName: 'Esther', lastName: 'Lungu', studentNumber: 'NWU-2026-0005' },
                { id: 'e213a2ed-c2de-4236-8724-3c325ad2df53', firstName: 'Emmanuel', lastName: 'Sichone', studentNumber: 'NWU-2026-0002' },
                { id: '4d747e0a-5eee-4459-af7f-221157dd0b8b', firstName: 'Grace', lastName: 'Mwape', studentNumber: 'NWU-2026-0003' },
              ]
        }
        onPlacementCreated={handlePlacementCreated}
      />
    </div>
  );
}
