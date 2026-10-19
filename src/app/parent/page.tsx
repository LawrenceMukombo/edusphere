// src/app/parent/page.tsx
// Enterprise Guardian Academic & Fee Center (Multi-Child Family Portal)
// Conforming to Rule 24 & Rule 25: Multi-term trends, full subject breakdown, itemized statements, and official printable report cards

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Smartphone,
  ShieldCheck,
  Building,
  Printer,
  Receipt,
  Clock,
  Search,
  Sparkles,
  TrendingUp,
  Award,
  BookOpen,
  ChevronDown,
  X,
  MessageSquare,
  Building2,
  Layers,
  Bed,
  Sun,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { ModuleGate } from '@/components/ModuleGate';
import { LegacyLogo } from '@/components/LegacyLogo';
import { useCampus, CampusId } from '@/components/CampusContext';

export default function ParentPortalPage() {
  const { selectedCampus, setSelectedCampus, campusInfo } = useCampus();
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [activeFamilyView, setActiveFamilyView] = useState<'unified' | 'individual'>('unified');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkSearchQuery, setLinkSearchQuery] = useState('');
  const [selectedLearnerToLink, setSelectedLearnerToLink] = useState<any | null>(null);
  const [relationshipType, setRelationshipType] = useState('FATHER');
  const [financialRole, setFinancialRole] = useState('FULL');
  const [allSchoolLearners, setAllSchoolLearners] = useState<any[]>([]);
  const [guardianInfo, setGuardianInfo] = useState<any>({
    name: 'Eng. Chileshe Mulenga',
    phone: '+260 977 889900',
    email: 'chileshe.mulenga@kansanshigroup.zm',
    residentialAddress: 'House # 42, Kansanshi Golf Estate, Solwezi',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Active View Tabs inside Child Dossier
  const [activeChildTab, setActiveChildTab] = useState<'academics' | 'fees' | 'attendance' | 'accommodation'>('academics');

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [showReportCardModal, setShowReportCardModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [absenceSuccess, setAbsenceSuccess] = useState(false);
  const [paymentChannel, setPaymentChannel] = useState<'AIRTEL' | 'MTN' | 'ZANACO'>('AIRTEL');
  const [payerPhone, setPayerPhone] = useState('+260 977 889900');
  const [paymentAmount, setPaymentAmount] = useState<number>(1500);

  // Search Filter for All School Learners Switcher
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  const [showAllLearnersPicker, setShowAllLearnersPicker] = useState(false);

  // Absence form state
  const [absenceDate, setAbsenceDate] = useState(new Date().toISOString().split('T')[0]);
  const [absenceReason, setAbsenceReason] = useState('Medical / Doctor Appointment');
  const [absenceNotes, setAbsenceNotes] = useState('Attending scheduled dental checkup at Solwezi General Hospital.');

  useEffect(() => {
    fetch('/api/parent/children')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          let combined = json.data;
          try {
            const saved = localStorage.getItem('edusphere_guardian_linked_wards');
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) {
                parsed.forEach((pw: any) => {
                  if (!combined.some((c: any) => c.learner?.studentNumber === pw.learner?.studentNumber)) {
                    combined.push(pw);
                  }
                });
              }
            }
          } catch (e) {}

          setChildren(combined);
          if (json.guardian) setGuardianInfo(json.guardian);
          if (json.allSchoolLearnersSummary) setAllSchoolLearners(json.allSchoolLearnersSummary);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, []);

  const currentChild = children[selectedChildIndex]?.learner;

  // Family-wide consolidated totals
  const familyTotalBilled = useMemo(() => children.reduce((sum, c) => sum + (c.learner?.totalBilled || 0), 0), [children]);
  const familyTotalPaid = useMemo(() => children.reduce((sum, c) => sum + (c.learner?.totalPaid || 0), 0), [children]);
  const familyTotalBalance = useMemo(() => children.reduce((sum, c) => sum + (c.learner?.balance || 0), 0), [children]);
  const familyAverageScore = useMemo(() => {
    if (children.length === 0) return 0;
    const sum = children.reduce((acc, c) => acc + (c.learner?.averageScore || 0), 0);
    return Math.round((sum / children.length) * 10) / 10;
  }, [children]);
  const familyAverageAttendance = useMemo(() => {
    if (children.length === 0) return 0;
    const sum = children.reduce((acc, c) => acc + (c.learner?.attendance?.ratePercent || 0), 0);
    return Math.round((sum / children.length) * 10) / 10;
  }, [children]);

  // Reactive campus filtering for wards
  const filteredChildren = useMemo(() => {
    if (selectedCampus === 'MUSHITALA' || selectedCampus === 'KANSANSHI') {
      return children.filter((c) => (c.learner?.campusName || '').includes('Mushitala') || c.learner?.isBoarder);
    }
    if (selectedCampus === 'URBAN') {
      return children.filter((c) => (c.learner?.campusName || '').includes('Urban') || !c.learner?.isBoarder);
    }
    return children;
  }, [children, selectedCampus]);

  // Sync payment modal default amount with child balance or family balance
  useEffect(() => {
    if (activeFamilyView === 'unified') {
      setPaymentAmount(familyTotalBalance > 0 ? familyTotalBalance : 3500);
    } else if (currentChild) {
      setPaymentAmount(currentChild.balance > 0 ? currentChild.balance : 1500);
    }
  }, [currentChild, familyTotalBalance, activeFamilyView]);

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
      setPaymentSuccess(true);
      setShowPaymentModal(false);
      // Reduce balance locally
      if (activeFamilyView === 'unified') {
        let remaining = paymentAmount;
        children.forEach((c) => {
          if (c.learner && remaining > 0) {
            const deduction = Math.min(c.learner.balance, remaining);
            c.learner.balance -= deduction;
            c.learner.totalPaid += deduction;
            remaining -= deduction;
          }
        });
      } else if (currentChild) {
        currentChild.balance = Math.max(0, currentChild.balance - paymentAmount);
        currentChild.totalPaid += paymentAmount;
      }
    }, 600);
  };

  const handleSimulateAbsence = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
      setAbsenceSuccess(true);
      setShowAbsenceModal(false);
    }, 400);
  };

  // Link learner confirmation
  const handleConfirmLink = () => {
    if (!selectedLearnerToLink) return;
    const student = selectedLearnerToLink;
    const existingIdx = children.findIndex((c) => c.learner.studentNumber === student.studentNumber);
    if (existingIdx !== -1) {
      alert(`${student.learnerName} is already linked to your guardian portal.`);
      setSelectedChildIndex(existingIdx);
      setActiveFamilyView('individual');
      setShowLinkModal(false);
      return;
    }

    const newEntry = {
      relationshipId: `rel-link-${Date.now()}`,
      relationshipType,
      hasFinancialAuthority: financialRole !== 'MONITORING_ONLY',
      financialResponsibility: financialRole,
      learner: {
        id: student.id,
        studentNumber: student.studentNumber,
        firstName: student.learnerName.split(' ')[0],
        lastName: student.learnerName.split(' ').slice(1).join(' '),
        fullName: student.learnerName,
        gender: student.gender || 'MALE',
        stage: student.className.includes('Grade') ? 'PRIMARY' : 'SECONDARY',
        campusName: student.campusName,
        currentClass: { name: student.className },
        campus: {
          name: student.campusName,
          address: student.campusName.includes('Mushitala')
            ? 'Stand # S/SOLWE/3177178, Plot 889, 890 Kansanshi Mine Road (opp. SGC Filling Station), Mushitala'
            : 'Opposite Kikombe School, next to Zambia Army Mess, Solwezi Central',
        },
        isBoarder: student.isBoarder ?? student.campusName.includes('Mushitala'),
        totalBilled: student.totalBilled || (student.campusName.includes('Mushitala') ? 10400 : 2800),
        totalPaid: (student.totalBilled || (student.campusName.includes('Mushitala') ? 10400 : 2800)) - (student.balance || 0),
        balance: student.balance || 0,
        financialStatus: (student.balance || 0) === 0 ? 'CLEARED' : 'ARREARS',
        academicStanding: 'Distinction (1)',
        averageScore: 84.5,
        subjects: [
          { subjectName: 'Mathematics', code: 'MATH', score: 88, eczGrade: '1 (Distinction)', teacherRemark: 'Superb algebraic problem-solving.' },
          { subjectName: 'English Language', code: 'ENG', score: 82, eczGrade: '2 (Distinction)', teacherRemark: 'Fluent reading and comprehension.' },
          { subjectName: 'Integrated Science', code: 'SCI', score: 86, eczGrade: '1 (Distinction)', teacherRemark: 'Inquisitive scientific methodology.' },
          { subjectName: 'Social Studies', code: 'SOC', score: 79, eczGrade: '2 (Distinction)', teacherRemark: 'Sound grasp of curriculum.' },
          { subjectName: 'Computer Studies', code: 'COMP', score: 92, eczGrade: '1 (Distinction)', teacherRemark: 'Advanced digital skills.' },
        ],
        termPerformanceTrend: [
          { term: '2025 Term 1', average: 80, rank: '3rd of 42' },
          { term: '2025 Term 2', average: 82, rank: '2nd of 42' },
          { term: '2025 Term 3', average: 84, rank: '1st of 42' },
          { term: '2026 Term 1', average: 85, rank: '1st of 42' },
        ],
        itemizedFees: [
          { id: '1', name: 'Tuition Fee Scheme', category: 'Academic Core', billed: student.campusName.includes('Mushitala') ? 4200 : 2200, paid: student.campusName.includes('Mushitala') ? 4200 : 2200, balance: 0 },
          { id: '2', name: student.campusName.includes('Mushitala') ? 'Boarding & Dining Hall Fee' : 'Nutrition & Tuckshop', category: 'Dining & Boarding', billed: student.campusName.includes('Mushitala') ? 3500 : 400, paid: (student.campusName.includes('Mushitala') ? 3500 : 400) - (student.balance || 0), balance: student.balance || 0 },
        ],
        reportCards: [
          {
            id: `rep-${student.studentNumber}-2026-T1`,
            title: 'Term 1 Official Progress & Competency Report',
            academicYear: '2026',
            term: 'Term 1',
            status: 'PUBLISHED',
            conductGrade: 'EXEMPLARY (A+)',
            classTeacherRemarks: 'Diligent, punctual, and highly disciplined student.',
            principalRemarks: 'Approved for progression with honours.',
            positionInClass: `1st of ${student.className.includes('Grade') ? '36' : '44'} Learners`,
          },
        ],
        attendance: {
          ratePercent: 97.5,
          daysPresent: 58,
          totalDays: 60,
          unexcusedAbsences: 0,
          excusedAbsences: 2,
          lateArrivals: 0,
          recentSessions: [
            { date: '2026-10-17', status: 'PRESENT', session: 'Morning Registration', time: '07:20 AM' },
            { date: '2026-10-16', status: 'PRESENT', session: 'Morning Registration', time: '07:15 AM' },
          ],
        },
      },
    };

    const updated = [...children, newEntry];
    setChildren(updated);
    try {
      localStorage.setItem('edusphere_guardian_linked_wards', JSON.stringify(updated));
    } catch (e) {}

    setSelectedLearnerToLink(null);
    setShowLinkModal(false);
    setSelectedChildIndex(updated.length - 1);
    setActiveFamilyView('individual');
    alert(`Successfully linked ${student.learnerName} (${student.className}) to your guardian portal!`);
  };

  const handleUnlinkChild = (idx: number, childName: string) => {
    if (children.length <= 1) {
      alert('You must have at least one active ward linked to your portal account.');
      return;
    }
    if (confirm(`Are you sure you want to unlink ${childName} from this guardian portal account?`)) {
      const updated = children.filter((_, i) => i !== idx);
      setChildren(updated);
      setSelectedChildIndex(0);
      try {
        localStorage.setItem('edusphere_guardian_linked_wards', JSON.stringify(updated));
      } catch (e) {}
    }
  };

  const filteredAlternativeLearners = useMemo(() => {
    if (!searchStudentQuery) return allSchoolLearners.slice(0, 10);
    return allSchoolLearners
      .filter((l) =>
        l.learnerName.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
        l.studentNumber.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
        l.className.toLowerCase().includes(searchStudentQuery.toLowerCase())
      )
      .slice(0, 15);
  }, [allSchoolLearners, searchStudentQuery]);

  const searchResultsForLinking = useMemo(() => {
    if (!linkSearchQuery) return allSchoolLearners.slice(0, 8);
    return allSchoolLearners
      .filter((l) =>
        l.learnerName.toLowerCase().includes(linkSearchQuery.toLowerCase()) ||
        l.studentNumber.toLowerCase().includes(linkSearchQuery.toLowerCase()) ||
        l.className.toLowerCase().includes(linkSearchQuery.toLowerCase())
      )
      .slice(0, 12);
  }, [allSchoolLearners, linkSearchQuery]);

  return (
    <ModuleGate
      moduleKey="parentPortal"
      moduleName="Parent Portal & Real-Time WhatsApp Alerts"
      moduleDescription="Digital report card viewer, real-time fee balance settlement, absence excuse submissions, and automated SMS/WhatsApp alerts."
      planRequired="SOVEREIGN_ENTERPRISE"
      pricePerTermZMW={1550}
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[420px] text-slate-500 gap-2">
          <Sparkles className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-xs font-semibold">Synchronizing verified family ward records...</span>
        </div>
      ) : children.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center max-w-md mx-auto space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Active Learner Profiles Linked</h3>
          <p className="text-xs text-slate-500">
            Your guardian profile has no active children records in this session.
          </p>
        </div>
      ) : (
        <div className="w-full space-y-6">
      {/* Portal Header & Multi-Child Switcher */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Guardian Portal
            </span>
            <span className="text-xs font-bold text-slate-400">&bull;</span>
            <span className="text-xs font-bold text-slate-700">{guardianInfo.name}</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 mt-1">Family Academic & Fee Center</h1>
          <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
            <span>{guardianInfo.residentialAddress}</span>
            <span>&bull;</span>
            <span className="font-mono">{guardianInfo.phone}</span>
          </p>
        </div>

        {/* Master View Switcher & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Unified Family Mode Toggle */}
          <button
            type="button"
            onClick={() => setActiveFamilyView('unified')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-2xs ${
              activeFamilyView === 'unified'
                ? 'bg-blue-900 text-white ring-2 ring-blue-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Unified Family Overview</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-800 text-white font-mono">
              {children.length} Wards
            </span>
          </button>

          {/* Child Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 flex-wrap">
            {children.map((item, idx) => {
              const lrn = item.learner;
              const isSelected = activeFamilyView === 'individual' && selectedChildIndex === idx;
              const isMushitala = (lrn.campusName || '').includes('Mushitala') || lrn.isBoarder;
              return (
                <button
                  key={lrn.id || idx}
                  type="button"
                  onClick={() => {
                    setSelectedChildIndex(idx);
                    setActiveFamilyView('individual');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span>{lrn.firstName}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                    isSelected
                      ? 'bg-blue-700 text-white'
                      : isMushitala
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-sky-100 text-sky-700'
                  }`}>
                    {isMushitala ? 'Mushitala' : 'Urban'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Link Guardian to Another Learner Button */}
          <button
            type="button"
            onClick={() => setShowLinkModal(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-2xs"
            title="Link an additional learner/ward to this guardian account"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Link Another Ward</span>
          </button>
        </div>
      </div>

      {/* Interactive Campus Selector Bar (Linked to Global Campus Context) */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black tracking-wide text-white uppercase">{campusInfo.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {campusInfo.badge}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Filtered Family Wards: {filteredChildren.length} of {children.length} Enrolled in Active Campus Scope
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedCampus('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              selectedCampus === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Campuses (Consolidated)</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCampus('MUSHITALA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              selectedCampus === 'MUSHITALA' || selectedCampus === 'KANSANSHI'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bed className="w-3.5 h-3.5" />
            <span>Mushitala Campus (Near Kansanshi)</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCampus('URBAN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              selectedCampus === 'URBAN'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Urban Campus (Solwezi Central)</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {paymentSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Mobile Money transaction of ZMW {paymentAmount.toLocaleString()} approved. Official receipt posted to general ledger.</span>
          </div>
          <button onClick={() => setPaymentSuccess(false)} className="text-emerald-700 font-bold text-base">✕</button>
        </div>
      )}

      {absenceSuccess && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>Absence request for {absenceDate} submitted to Class Teacher and Deputy Head. Status: Under Review.</span>
          </div>
          <button onClick={() => setAbsenceSuccess(false)} className="text-blue-700 font-bold text-base">✕</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW A: UNIFIED FAMILY OVERVIEW (ALL LINKED WARDS) */}
      {/* ========================================================================= */}
      {activeFamilyView === 'unified' && (
        <div className="space-y-6">
          {/* Family Consolidated Hero Banner */}
          <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5 border border-blue-900/50">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full border border-amber-400/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Consolidated Family Portfolio
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-blue-800/80 border border-blue-400/30 font-mono">
                  {children.length} Enrolled Learners
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-800/80 border border-emerald-400/30 font-bold">
                  Active 2026 Academic Year
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-serif">
                {guardianInfo.name} &bull; Family Household Dossier
              </h2>
              <p className="text-xs text-blue-200 flex items-center gap-2 flex-wrap">
                <span>{guardianInfo.profession || 'Kansanshi Mining PLC Corporate Sponsorship Eligible'}</span>
                <span>&bull;</span>
                <span>{guardianInfo.residentialAddress}</span>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-5 rounded-2xl border border-white/15 text-left md:text-right shrink-0">
              <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider block">Consolidated Family Balance</span>
              <div className={`text-3xl font-black mt-0.5 ${familyTotalBalance === 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                K{familyTotalBalance.toLocaleString()}.00
              </div>
              <div className="mt-2.5 flex items-center gap-2 flex-wrap md:justify-end">
                {familyTotalBalance > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentAmount(familyTotalBalance);
                      setShowPaymentModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md transition"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Settle Family Balance (K{familyTotalBalance.toLocaleString()})</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 rounded-xl text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All Family Accounts Cleared
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowLinkModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-800/90 hover:bg-blue-800 text-blue-100 rounded-xl text-xs font-bold border border-blue-600 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Link Ward</span>
                </button>
              </div>
            </div>
          </div>

          {/* Unified Family KPI Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Composite Academic Index</span>
              <p className="text-xl font-black text-slate-900 mt-1">Distinction Average ({familyAverageScore}%)</p>
              <span className="text-[11px] text-blue-600 font-bold">
                {children.length} Wards &bull; Across ECZ Curriculum
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Family Attendance Benchmark</span>
              <p className="text-xl font-black text-slate-900 mt-1">{familyAverageAttendance}% Overall</p>
              <span className="text-[11px] text-emerald-600 font-bold">
                Statutory MoE Form 12A Compliant (&gt;80%)
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Total Billed vs Paid Fees</span>
              <p className="text-xl font-black text-slate-900 mt-1">
                K{familyTotalPaid.toLocaleString()} / K{familyTotalBilled.toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-500 font-semibold">
                {familyTotalBalance === 0 ? '100% Cleared' : `K${familyTotalBalance.toLocaleString()} Outstanding`}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Cross-Campus Distribution</span>
              <p className="text-xl font-black text-indigo-900 mt-1">
                {children.filter((c) => (c.learner?.campusName || '').includes('Mushitala') || c.learner?.isBoarder).length} Secondary &bull; {children.filter((c) => (c.learner?.campusName || '').includes('Urban') || !c.learner?.isBoarder).length} Primary
              </p>
              <span className="text-[11px] text-slate-500 font-semibold">
                Mushitala Boarding & Urban Day
              </span>
            </div>
          </div>

          {/* Unified Multi-Ward Performance & Financial Table (Rule 24 Compliant) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
              <div>
                <h3 className="text-base font-black text-slate-900">Multi-Child Academic & Financial Performance Matrix</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comparative overview of all children linked to this guardian profile across Solwezi campuses.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Link Additional Ward</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Learner Profile</th>
                    <th className="py-3 px-4">Campus & Accommodation</th>
                    <th className="py-3 px-4">Class Cohort</th>
                    <th className="py-3 px-4 text-center">Academic Standing</th>
                    <th className="py-3 px-4 text-center">Attendance %</th>
                    <th className="py-3 px-4 text-right">Fee Obligation</th>
                    <th className="py-3 px-4 text-right">Balance</th>
                    <th className="py-3 px-4 text-center">Direct Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {children.map((item, idx) => {
                    const lrn = item.learner;
                    const isMushitala = (lrn.campusName || '').includes('Mushitala') || lrn.isBoarder;
                    return (
                      <tr key={lrn.id || idx} className="hover:bg-blue-50/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-900 text-white flex items-center justify-center font-black text-xs shrink-0">
                              {lrn.firstName?.[0]}{lrn.lastName?.[0]}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block text-xs">{lrn.fullName}</span>
                              <span className="font-mono text-[10px] text-slate-500">{lrn.studentNumber}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isMushitala
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-sky-50 text-sky-700 border-sky-200'
                            }`}>
                              {isMushitala ? 'Mushitala (Near Kansanshi)' : 'Urban (Solwezi Central)'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {lrn.isBoarder ? 'Full Boarder (Hall)' : 'Day Scholar'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {lrn.currentClass?.name || 'Class'}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-slate-900 block text-xs">{lrn.academicStanding || 'Distinction'}</span>
                          <span className="text-[10px] text-blue-600 font-semibold">{lrn.averageScore || 85}% Average</span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="font-black text-slate-900 block">{lrn.attendance?.ratePercent || 96.7}%</span>
                          <span className="text-[10px] text-emerald-600 font-semibold">{lrn.attendance?.daysPresent || 58} Days Present</span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-slate-700 font-semibold">
                          K{lrn.totalBilled?.toLocaleString()}.00
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <span className={`font-mono font-black block text-xs ${lrn.balance === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            K{lrn.balance?.toLocaleString()}.00
                          </span>
                          <span className={`inline-flex px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            lrn.balance === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {lrn.balance === 0 ? 'Cleared' : 'Arrears'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedChildIndex(idx);
                                setActiveFamilyView('individual');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] border border-blue-200 transition"
                            >
                              Open Dossier
                            </button>
                            {lrn.balance > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedChildIndex(idx);
                                  setPaymentAmount(lrn.balance);
                                  setShowPaymentModal(true);
                                }}
                                className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] border border-emerald-200 transition"
                              >
                                Pay K{lrn.balance}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedChildIndex(idx);
                                setShowReportCardModal(true);
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold text-[11px] border border-slate-200 transition"
                              title="Download Report Card"
                            >
                              <Printer className="w-3 h-3 text-slate-500" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUnlinkChild(idx, lrn.fullName)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Unlink ward from guardian"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Consolidated Family Fee Statement Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">Consolidated Family Fee Book & Component Ledger</h3>
                <p className="text-xs text-slate-500">Aggregated breakdown of statutory fees across all enrolled family wards.</p>
              </div>
              <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                Total Family Obligation: K{familyTotalBilled.toLocaleString()}.00
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map((c, i) => (
                <div key={i} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <span className="font-bold text-slate-900 text-xs">{c.learner?.fullName} ({c.learner?.currentClass?.name})</span>
                    <span className={`text-xs font-mono font-black ${c.learner?.balance === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      Balance: K{c.learner?.balance?.toLocaleString()}.00
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {c.learner?.itemizedFees?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-xs text-slate-600">
                        <span>{item.name}</span>
                        <div className="flex items-center gap-2 font-mono">
                          <span>Billed: K{item.billed}</span>
                          <span className={item.balance === 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                            Bal: K{item.balance}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW B: INDIVIDUAL CHILD IN-DEPTH DOSSIER */}
      {/* ========================================================================= */}
      {activeFamilyView === 'individual' && currentChild && (
        <div className="space-y-6">
          {/* Child Identity Card */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold bg-blue-800/80 px-2.5 py-0.5 rounded-lg border border-blue-400/30">
                  {currentChild.studentNumber}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-indigo-800/80 border border-indigo-400/30 font-bold">
                  {currentChild.isBoarder ? '🏠 Full Boarder (Kansanshi Boys Hall)' : '🎒 Day Scholar'}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-800/80 border border-emerald-400/30 font-bold">
                  Active Enrollment 2026
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                {currentChild.fullName || `${currentChild.firstName} ${currentChild.lastName}`}
              </h2>
              <p className="text-xs text-blue-200">
                Class: <strong className="text-white">{currentChild.currentClass?.name || 'Class Cohort'}</strong> &bull; Campus: <strong className="text-white">{currentChild.campusName || currentChild.campus?.name}</strong>
              </p>
            </div>

            <div className="text-left sm:text-right bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/15">
              <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider block">Outstanding Fee Balance</span>
              <div className={`text-2xl sm:text-3xl font-black mt-0.5 ${currentChild.balance === 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                K{currentChild.balance.toLocaleString()}.00
              </div>
              <div className="mt-2.5 flex items-center gap-2 flex-wrap sm:justify-end">
                {currentChild.balance > 0 ? (
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs transition"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Pay via Mobile Money</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 rounded-xl text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Account Cleared
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowAbsenceModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-800/90 hover:bg-blue-800 text-blue-100 rounded-xl text-xs font-semibold border border-blue-600 transition"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Report Absence</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportCardModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Official Report Card</span>
                </button>
                <Link
                  href="/messages"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                  title="Open In-App Messenger with Class Teacher"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Message Teacher</span>
                </Link>
              </div>
            </div>
          </div>

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Academic Standing</span>
              <p className="text-xl font-black text-slate-900 mt-1">{currentChild.academicStanding || 'Distinction (1)'}</p>
              <span className="text-[11px] text-blue-600 font-bold">Average Mark: {currentChild.averageScore || 84.5}%</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Term 1 Attendance</span>
              <p className="text-xl font-black text-slate-900 mt-1">{currentChild.attendance?.ratePercent || 96.7}%</p>
              <span className="text-[11px] text-emerald-600 font-bold">
                {currentChild.attendance?.daysPresent || 58} of {currentChild.attendance?.totalDays || 60} days present
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Fee Status & Recovery</span>
              <p className={`text-xl font-black mt-1 ${currentChild.balance === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {currentChild.balance === 0 ? 'Fully Cleared' : `K${currentChild.balance.toLocaleString()} Arrears`}
              </p>
              <span className="text-[11px] text-slate-500 font-semibold">
                K{currentChild.totalPaid?.toLocaleString()} of K{currentChild.totalBilled?.toLocaleString()} Paid
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Official Report Status</span>
              <p className="text-xl font-black text-emerald-700 mt-1">Published</p>
              <span className="text-[11px] text-slate-500 font-semibold">
                Class Position: {currentChild.reportCards?.[0]?.positionInClass || '1st in Cohort'}
              </span>
            </div>
          </div>

          {/* Child Subtabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveChildTab('academics')}
              className={`pb-3 px-3 border-b-2 transition flex items-center gap-2 ${
                activeChildTab === 'academics'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Full Academic Performance & ECZ Marks</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveChildTab('fees')}
              className={`pb-3 px-3 border-b-2 transition flex items-center gap-2 ${
                activeChildTab === 'fees'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Itemized Fee Statement & Ledger</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveChildTab('attendance')}
              className={`pb-3 px-3 border-b-2 transition flex items-center gap-2 ${
                activeChildTab === 'attendance'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Attendance & Safeguarding Dossier</span>
            </button>
          </div>

          {/* TAB 1: ACADEMICS & MARKS OVER TIME */}
          {activeChildTab === 'academics' && (
            <div className="space-y-6">
              {/* Multi-Term Progression Graph Bar */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Academic Progression & Term Averages Over Time (2024 &ndash; 2026)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Scholastic performance trajectory mapped across consecutive terms.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Continuous Distinction
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
                  {(currentChild.termPerformanceTrend || [
                    { term: '2024 T1', average: 78, rank: '4th of 42' },
                    { term: '2024 T2', average: 80, rank: '3rd of 42' },
                    { term: '2024 T3', average: 82, rank: '2nd of 42' },
                    { term: '2025 T1', average: 84, rank: '2nd of 44' },
                    { term: '2025 T2', average: 86, rank: '1st of 44' },
                    { term: '2025 T3', average: 87, rank: '1st of 44' },
                    { term: '2026 T1', average: 88, rank: '1st of 44' },
                  ]).map((pt: any, pIdx: number) => (
                    <div key={pIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                      <span className="text-[10px] text-slate-400 font-semibold block">{pt.term}</span>
                      <p className="text-lg font-black text-blue-700">{pt.average}%</p>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${pt.average}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-600 font-bold block pt-1">{pt.rank}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comprehensive Subjects Marks Breakdown (ECZ Standard) */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-600" />
                      Term 1 Comprehensive Subject Markbook (All ECZ Curriculum Subjects)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Detailed subject marks, letter grade, and specific subject teacher observations.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowReportCardModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Official Report Card (PDF)</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Subject Name & Code</th>
                        <th className="p-3 text-right">CA 1 & 2 (40%)</th>
                        <th className="p-3 text-right">Final Exam (60%)</th>
                        <th className="p-3 text-right">Total Score (100%)</th>
                        <th className="p-3">ECZ Grade</th>
                        <th className="p-3">Subject Teacher Observation & Guidance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {currentChild.subjects?.map((sub: any, sIdx: number) => {
                        const ca = Math.round(sub.score * 0.4);
                        const exam = sub.score - ca;
                        return (
                          <tr key={sIdx} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-900">
                              <span>{sub.subjectName}</span>
                              <span className="text-[10px] text-slate-400 font-mono block">{sub.code}</span>
                            </td>
                            <td className="p-3 text-right font-mono text-slate-600">{ca} / 40</td>
                            <td className="p-3 text-right font-mono text-slate-600">{exam} / 60</td>
                            <td className="p-3 text-right font-mono font-bold text-base text-blue-700">
                              {sub.score}%
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {sub.eczGrade}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600 italic">
                              &ldquo;{sub.teacherRemark}&rdquo;
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ITEMIZED FEES & LEDGER */}
          {activeChildTab === 'fees' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-indigo-600" />
                      Term 1 Itemized Billing & Tuition Schedule
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Statutory tuition, boarding hall accommodation, dining rations, and laboratory fees.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Print Statement</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Fee Component</th>
                        <th className="p-3">Category</th>
                        <th className="p-3 text-right">Amount Billed</th>
                        <th className="p-3 text-right">Amount Paid</th>
                        <th className="p-3 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {currentChild.itemizedFees?.map((item: any) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{item.name}</td>
                          <td className="p-3 text-slate-500">{item.category}</td>
                          <td className="p-3 text-right font-mono text-slate-900">K{item.billed.toLocaleString()}.00</td>
                          <td className="p-3 text-right font-mono text-emerald-700 font-bold">K{item.paid.toLocaleString()}.00</td>
                          <td className={`p-3 text-right font-mono font-bold ${item.balance > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
                            K{item.balance.toLocaleString()}.00
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50/90 font-black border-t-2 border-slate-300">
                        <td className="p-3 text-slate-900" colSpan={2}>Total Term Account Summary</td>
                        <td className="p-3 text-right font-mono text-slate-900">K{currentChild.totalBilled?.toLocaleString()}.00</td>
                        <td className="p-3 text-right font-mono text-emerald-700">K{currentChild.totalPaid?.toLocaleString()}.00</td>
                        <td className="p-3 text-right font-mono text-rose-700 text-sm">K{currentChild.balance?.toLocaleString()}.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Historical Receipts / Payments Journal */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  Official Receipts & Multi-Term Payment History
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Receipt #</th>
                        <th className="p-3">Academic Term</th>
                        <th className="p-3">Payment Date</th>
                        <th className="p-3">Channel & Bank Ref</th>
                        <th className="p-3 text-right">Amount Paid</th>
                        <th className="p-3 text-right">Account Balance After</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {(currentChild.feeHistory || []).map((f: any, fIdx: number) => (
                        <tr key={f.id || fIdx} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-blue-700">{f.receiptNumber}</td>
                          <td className="p-3 font-bold text-slate-900">{f.termLabel}</td>
                          <td className="p-3 text-slate-600">{f.paymentDate}</td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-800 block">{f.paymentMethod}</span>
                            <span className="font-mono text-[10px] text-slate-400">{f.referenceNumber}</span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-700">K{f.amountPaid.toLocaleString()}</td>
                          <td className="p-3 text-right font-mono font-semibold text-slate-500">K{f.balanceRemaining.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ATTENDANCE & SAFEGUARDING */}
          {activeChildTab === 'attendance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Cumulative Attendance Rate</span>
                  <p className="text-2xl font-black text-slate-900">{currentChild.attendance?.ratePercent || 96.7}%</p>
                  <span className="text-xs text-emerald-600 font-bold">Safeguarding Status: Excellent</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Days Present / Attended</span>
                  <p className="text-2xl font-black text-emerald-700">{currentChild.attendance?.daysPresent || 58} Sessions</p>
                  <span className="text-xs text-slate-500">Out of {currentChild.attendance?.totalDays || 60} Total Teaching Days</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Excused Exeats / Medical</span>
                  <p className="text-2xl font-black text-blue-700">{currentChild.attendance?.excusedAbsences || 2} Days</p>
                  <span className="text-xs text-slate-500">0 Unexcused Truancies</span>
                </div>
              </div>

              {/* Attendance Log Table */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-blue-600" />
                  Recent Daily Attendance & Check-in Sessions
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Session Date</th>
                        <th className="p-3">Session Name</th>
                        <th className="p-3">Check-in Timestamp</th>
                        <th className="p-3">Attendance Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {(currentChild.attendance?.recentSessions || []).map((s: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{s.date}</td>
                          <td className="p-3 text-slate-700">{s.session}</td>
                          <td className="p-3 font-mono text-slate-600">{s.time}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                s.status === 'PRESENT'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-blue-50 text-blue-800 border border-blue-200'
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: OFFICIAL PRINTABLE REPORT CARD */}
      {showReportCardModal && currentChild && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 my-8">
            {/* Header with School Crest & Ministry Standards */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
              <div className="flex items-center gap-3">
                <LegacyLogo variant="emblem" size="lg" className="shrink-0 drop-shadow-sm" />
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">LEGACY SCHOOL SOLWEZI</h2>
                  <p className="text-xs italic text-blue-800 font-semibold">
                    &ldquo;We strive for your academic and moral excellence&rdquo;
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Ministry Registration: MOE/NWP/SOL/SEC/2026/044 &bull; Plot 889, Kansanshi Mine Road
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-900 border border-blue-300">
                  OFFICIAL PROGRESS REPORT
                </span>
                <span className="text-[11px] text-slate-500 block font-mono mt-1">2026 Term 1 &bull; Week 8</span>
              </div>
            </div>

            {/* Student Biographical Dossier */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl text-xs border border-slate-200">
              <div>
                <span className="text-slate-400 font-semibold block">Learner Full Name:</span>
                <span className="font-bold text-slate-900 text-sm">{currentChild.fullName || currentChild.firstName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Student ID Number:</span>
                <span className="font-mono font-bold text-blue-700">{currentChild.studentNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Class & Cohort:</span>
                <span className="font-bold text-slate-900">{currentChild.currentClass?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Class Position:</span>
                <span className="font-bold text-emerald-700">{currentChild.reportCards?.[0]?.positionInClass || '1st of 44'}</span>
              </div>
            </div>

            {/* Subject Results Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-black border-b border-slate-300">
                  <tr>
                    <th className="p-2.5">Subject Curriculum</th>
                    <th className="p-2.5 text-right">CA (40%)</th>
                    <th className="p-2.5 text-right">Exam (60%)</th>
                    <th className="p-2.5 text-right">Total (100%)</th>
                    <th className="p-2.5 text-center">ECZ Grade</th>
                    <th className="p-2.5">Instructor Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {currentChild.subjects?.map((sub: any, sIdx: number) => {
                    const ca = Math.round(sub.score * 0.4);
                    const exam = sub.score - ca;
                    return (
                      <tr key={sIdx}>
                        <td className="p-2.5 font-bold text-slate-900">{sub.subjectName}</td>
                        <td className="p-2.5 text-right font-mono text-slate-600">{ca}</td>
                        <td className="p-2.5 text-right font-mono text-slate-600">{exam}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-blue-700">{sub.score}%</td>
                        <td className="p-2.5 text-center font-bold text-emerald-800">{sub.eczGrade}</td>
                        <td className="p-2.5 text-slate-600 italic text-[11px]">&ldquo;{sub.teacherRemark}&rdquo;</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Conduct & Institutional Approval */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">Class Teacher Remarks:</span>
                <p className="text-slate-600 italic">
                  &ldquo;{currentChild.reportCards?.[0]?.classTeacherRemarks || 'Diligent, highly focused student who participates enthusiastically.'}&rdquo;
                </p>
                <span className="text-[10px] text-slate-400 font-semibold block pt-2">Conduct Grade: EXEMPLARY (A+)</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">Principal's Progression Endorsement:</span>
                <p className="text-slate-600 italic">
                  &ldquo;{currentChild.reportCards?.[0]?.principalRemarks || 'Approved for progression with honours.'}&rdquo;
                </p>
                <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200 mt-2">
                  <span>Mr. Emmanuel Mwansa</span>
                  <span className="font-bold text-emerald-700">✓ Digitally Signed & Stamped</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-400 font-mono">Document Ref: LSS-REP-{currentChild.studentNumber}-2026-T1</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportCardModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save as PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MOBILE MONEY PAYMENT */}
      {showPaymentModal && currentChild && (
        <div className="fixed inset-0 z-[80] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Online Fee Settlement</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <p className="text-xs text-slate-500">
              Direct merchant payment for <strong>{currentChild.fullName}</strong> ({currentChild.studentNumber}).
            </p>

            <form onSubmit={handleSimulatePayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Payment Gateway</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentChannel('AIRTEL')}
                    className={`py-2 px-3 rounded-xl border font-bold text-center ${
                      paymentChannel === 'AIRTEL'
                        ? 'border-red-600 bg-red-50 text-red-700 ring-2 ring-red-200'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Airtel Money
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentChannel('MTN')}
                    className={`py-2 px-3 rounded-xl border font-bold text-center ${
                      paymentChannel === 'MTN'
                        ? 'border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-200'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    MTN MoMo
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Money Number</label>
                <input
                  type="tel"
                  required
                  value={payerPhone}
                  onChange={(e) => setPayerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Amount to Settle (ZMW)</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black font-mono text-slate-900 text-sm"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Approve Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REPORT ABSENCE */}
      {showAbsenceModal && currentChild && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Formal Absence Notification</h3>
              <button onClick={() => setShowAbsenceModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <p className="text-xs text-slate-500">
              Notify the Class Teacher and School Administration of scheduled absence for <strong>{currentChild.fullName}</strong>.
            </p>

            <form onSubmit={handleSimulateAbsence} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Absence Date *</label>
                <input
                  type="date"
                  required
                  value={absenceDate}
                  onChange={(e) => setAbsenceDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Absence *</label>
                <select
                  value={absenceReason}
                  onChange={(e) => setAbsenceReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                >
                  <option value="Medical / Doctor Appointment">Medical / Doctor Appointment</option>
                  <option value="Family Bereavement">Family Bereavement</option>
                  <option value="Official Representation / Sports">Official Representation / Sports</option>
                  <option value="Transport Disruption">Transport Disruption</option>
                  <option value="Other Compassionate Grounds">Other Compassionate Grounds</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Explanation / Notes</label>
                <textarea
                  rows={3}
                  value={absenceNotes}
                  onChange={(e) => setAbsenceNotes(e.target.value)}
                  placeholder="Provide supporting context..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAbsenceModal(false)}
                  className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Submit to Headteacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL 4: LINK GUARDIAN TO ANOTHER LEARNER */}
      {showLinkModal && (
        <div className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">Link Additional Ward to Family Portal</h3>
              </div>
              <button onClick={() => setShowLinkModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            
            <p className="text-xs text-slate-500">
              Link a pupil to Guardian <strong>{guardianInfo.name}</strong> to enable unified academic monitoring and single-receipt Mobile Money fee settlement.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Search School Roster (All Solwezi Campuses)</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by student name, ID (e.g. LSS-2026-0042), or class..."
                    value={linkSearchQuery}
                    onChange={(e) => setLinkSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Search Results Picker */}
              <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl p-1 bg-slate-50/50">
                {searchResultsForLinking.map((student) => {
                  const isSelected = selectedLearnerToLink?.studentNumber === student.studentNumber;
                  const isAlreadyLinked = children.some((c) => c.learner?.studentNumber === student.studentNumber);
                  return (
                    <div
                      key={student.id}
                      onClick={() => !isAlreadyLinked && setSelectedLearnerToLink(student)}
                      className={`p-2 rounded-lg flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : isAlreadyLinked
                            ? 'opacity-50 cursor-not-allowed bg-slate-100'
                            : 'hover:bg-blue-50 text-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs">{student.learnerName}</span>
                          {isAlreadyLinked && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 font-bold">
                              Already Linked
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                          {student.studentNumber} &bull; {student.className} &bull; {student.campusName}
                        </span>
                      </div>
                      <span className={`text-[11px] font-mono font-bold ${
                        isSelected
                          ? 'text-white'
                          : student.balance === 0
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                      }`}>
                        {student.balance === 0 ? 'Cleared' : `K${student.balance}`}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Relationship & Financial Details Form */}
              {selectedLearnerToLink && (
                <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between pb-1.5 border-b border-blue-200">
                    <span className="font-bold text-blue-900">Linkage Parameters for {selectedLearnerToLink.learnerName}</span>
                    <span className="text-[10px] font-mono text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-300">
                      {selectedLearnerToLink.studentNumber}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Guardian Relationship *</label>
                      <select
                        value={relationshipType}
                        onChange={(e) => setRelationshipType(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white text-xs font-semibold"
                      >
                        <option value="FATHER">Father</option>
                        <option value="MOTHER">Mother</option>
                        <option value="LEGAL_GUARDIAN">Legal Guardian</option>
                        <option value="SPONSOR">Corporate Sponsor / Kansanshi Benefactor</option>
                        <option value="UNCLE_AUNT">Uncle / Aunt</option>
                        <option value="ELDER_SIBLING">Elder Sibling</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Fee Obligation Authority *</label>
                      <select
                        value={financialRole}
                        onChange={(e) => setFinancialRole(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white text-xs font-semibold"
                      >
                        <option value="FULL">Full Financial Responsibility</option>
                        <option value="SHARED">Shared Co-Sponsorship (50%)</option>
                        <option value="MONITORING_ONLY">Academic Progress Monitoring Only</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLearnerToLink(null);
                    setShowLinkModal(false);
                  }}
                  className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedLearnerToLink}
                  onClick={handleConfirmLink}
                  className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  Confirm & Link Ward to Family Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      )}
    </ModuleGate>
  );
}
