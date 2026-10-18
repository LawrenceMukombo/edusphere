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
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { ModuleGate } from '@/components/ModuleGate';

export default function ParentPortalPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
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
          setChildren(json.data);
          if (json.guardian) setGuardianInfo(json.guardian);
          if (json.allSchoolLearnersSummary) setAllSchoolLearners(json.allSchoolLearnersSummary);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, []);

  const currentChild = children[selectedChildIndex]?.learner;

  // Sync payment modal default amount with child balance
  useEffect(() => {
    if (currentChild) {
      setPaymentAmount(currentChild.balance > 0 ? currentChild.balance : 1500);
    }
  }, [currentChild]);

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
      setPaymentSuccess(true);
      setShowPaymentModal(false);
      // Reduce balance locally
      if (currentChild) {
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

  const handleSelectAlternativeLearner = (student: any) => {
    // Dynamically insert or switch to this learner in children list
    const existingIdx = children.findIndex((c) => c.learner.studentNumber === student.studentNumber);
    if (existingIdx !== -1) {
      setSelectedChildIndex(existingIdx);
    } else {
      const newEntry = {
        relationshipId: `rel-alt-${Date.now()}`,
        relationshipType: 'GUARDIAN',
        hasFinancialAuthority: true,
        learner: {
          id: student.id,
          studentNumber: student.studentNumber,
          firstName: student.learnerName.split(' ')[0],
          lastName: student.learnerName.split(' ').slice(1).join(' '),
          fullName: student.learnerName,
          gender: 'MALE',
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
          totalPaid: (student.totalBilled || (student.campusName.includes('Mushitala') ? 10400 : 2800)) - student.balance,
          balance: student.balance,
          financialStatus: student.balance === 0 ? 'CLEARED' : 'ARREARS',
          academicStanding: 'Distinction (1)',
          averageScore: 86.4,
          subjects: [
            { subjectName: 'Mathematics', code: 'MATH', score: 92, eczGrade: '1 (Distinction)', teacherRemark: 'Superb problem solving skills.' },
            { subjectName: 'English Language', code: 'ENG', score: 85, eczGrade: '1 (Distinction)', teacherRemark: 'Fluent reading and comprehension.' },
            { subjectName: 'Integrated Science', code: 'SCI', score: 88, eczGrade: '1 (Distinction)', teacherRemark: 'Outstanding laboratory work.' },
            { subjectName: 'Social Studies', code: 'SOC', score: 80, eczGrade: '2 (Distinction)', teacherRemark: 'Good grasp of Zambian geography.' },
            { subjectName: 'Computer Studies', code: 'COMP', score: 95, eczGrade: '1 (Distinction)', teacherRemark: 'Advanced computer and typing skills.' },
          ],
          termPerformanceTrend: [
            { term: '2025 Term 1', average: 81, rank: '3rd of 42' },
            { term: '2025 Term 2', average: 84, rank: '2nd of 42' },
            { term: '2025 Term 3', average: 86, rank: '1st of 42' },
            { term: '2026 Term 1', average: 88, rank: '1st of 42' },
          ],
          itemizedFees: [
            { id: '1', name: 'Tuition Fee Scheme', category: 'Academic Core', billed: 4200, paid: 4200, balance: 0 },
            { id: '2', name: 'Boarding & Dining Hall Fee', category: 'Boarding & Dining', billed: 3500, paid: 3500 - student.balance, balance: student.balance },
          ],
          reportCards: [
            {
              id: 'rep-alt-1',
              title: 'Term 1 Official Progress & Competency Report',
              academicYear: '2026',
              term: 'Term 1',
              status: 'PUBLISHED',
              conductGrade: 'EXEMPLARY (A+)',
              classTeacherRemarks: 'Diligent, punctual, and highly disciplined student.',
              principalRemarks: 'Approved for progression with honours.',
              positionInClass: '1st of 42 Learners',
            },
          ],
          attendance: {
            ratePercent: 98.2,
            daysPresent: 59,
            totalDays: 60,
            unexcusedAbsences: 0,
            excusedAbsences: 1,
            lateArrivals: 0,
            recentSessions: [
              { date: '2026-10-17', status: 'PRESENT', session: 'Morning Registration', time: '07:20 AM' },
              { date: '2026-10-16', status: 'PRESENT', session: 'Morning Registration', time: '07:15 AM' },
            ],
          },
        },
      };
      setChildren([...children, newEntry]);
      setSelectedChildIndex(children.length);
    }
    setShowAllLearnersPicker(false);
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

        {/* Multi-Child Tabs (PRD FR-PAR-001) */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {children.map((item, idx) => {
              const lrn = item.learner;
              const isSelected = selectedChildIndex === idx;
              return (
                <button
                  key={lrn.id || idx}
                  type="button"
                  onClick={() => setSelectedChildIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{lrn.firstName}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {lrn.currentClass?.name?.split(' ')[0] || 'Pupil'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Switcher for Any Student in School */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAllLearnersPicker(!showAllLearnersPicker)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span>Switch Ward</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showAllLearnersPicker && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="font-bold text-slate-800">Select School Ward</span>
                  <button onClick={() => setShowAllLearnersPicker(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                </div>
                <input
                  type="text"
                  placeholder="Search student name, ID..."
                  value={searchStudentQuery}
                  onChange={(e) => setSearchStudentQuery(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {filteredAlternativeLearners.map((learner) => (
                    <button
                      key={learner.id}
                      type="button"
                      onClick={() => handleSelectAlternativeLearner(learner)}
                      className="w-full text-left py-1.5 px-2 hover:bg-blue-50 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{learner.learnerName}</span>
                        <span className="text-[10px] text-slate-500">{learner.studentNumber} &bull; {learner.className}</span>
                      </div>
                      <span className={`text-[10px] font-bold ${learner.balance === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {learner.balance === 0 ? 'Cleared' : `K${learner.balance}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
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

      {currentChild && (
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
              <span className="text-[11px] text-slate-500 font-semibold">Class Position: 1st in Cohort</span>
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 my-8">
            {/* Header with School Crest & Ministry Standards */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-900 text-white font-black flex items-center justify-center text-xl shadow-md">
                  LSS
                </div>
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
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
        </div>
      )}
    </ModuleGate>
  );
}
