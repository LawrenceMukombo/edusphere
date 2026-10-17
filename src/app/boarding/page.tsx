// src/app/boarding/page.tsx
// Comprehensive Boarding Village & Student 360° Accommodation, Financial, and Academic Dossier
'use client';

import React, { useState, useMemo } from 'react';
import {
  Bed,
  Building2,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  FileText,
  DollarSign,
  Award,
  Activity,
  Heart,
  User,
  Phone,
  Mail,
  Search,
  Download,
  Printer,
  TrendingUp,
  X,
  Layers,
  ChevronRight,
  Sparkles,
  Sun,
} from 'lucide-react';
import { useCampus } from '@/components/CampusContext';
import { EnterpriseTable, ColumnDef } from '@/components/EnterpriseTable';
import { LegacyLogo } from '@/components/LegacyLogo';
import {
  generateLegacyLearners,
  LegacyLearnerBalance,
  AccommodationHistoryRecord,
  HistoricalFeeRecord,
  HistoricalAcademicRecord,
} from '@/server/services/legacySchoolData';

const ALL_LEARNERS = generateLegacyLearners(478);

export default function BoardingVillagePage() {
  const { selectedCampus, setSelectedCampus } = useCampus();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'KANSANSHI' | 'KALUMBILA' | 'MOPANI' | 'MUKWA' | 'ALL_STUDENTS'>('OVERVIEW');
  const [selectedStudent, setSelectedStudent] = useState<LegacyLearnerBalance | null>(null);
  const [dossierTab, setDossierTab] = useState<'ACCOMMODATION' | 'FEES' | 'ACADEMICS' | 'HEALTH' | 'LETTERHEAD'>('ACCOMMODATION');
  const [houseFilter, setHouseFilter] = useState<'ALL' | 'MOPANI_BOYS_HALL' | 'MUKWA_GIRLS_HALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'BOARDER' | 'DAY_SCHOLAR'>('ALL');

  // Filter students based on campus selection and filters
  const filteredStudents = useMemo(() => {
    let list = ALL_LEARNERS;

    if (selectedCampus === 'MUSHITALA' || selectedCampus === 'KANSANSHI') {
      list = list.filter((l) => l.campusName.includes('Mushitala') || l.campusName.includes('Kansanshi'));
    } else if (selectedCampus === 'URBAN') {
      list = list.filter((l) => l.campusName.includes('Urban'));
    }

    if (typeFilter !== 'ALL') {
      list = list.filter((l) => l.studentType === typeFilter);
    }

    if (houseFilter !== 'ALL') {
      list = list.filter((l) => l.currentAccommodation?.boardingHouse === houseFilter);
    }

    return list;
  }, [selectedCampus, typeFilter, houseFilter]);

  // Village Stats
  const boarders = useMemo(() => filteredStudents.filter((l) => l.studentType === 'BOARDER'), [filteredStudents]);
  const mopaniBoarders = useMemo(() => boarders.filter((l) => l.currentAccommodation?.boardingHouse === 'MOPANI_BOYS_HALL'), [boarders]);
  const mukwaBoarders = useMemo(() => boarders.filter((l) => l.currentAccommodation?.boardingHouse === 'MUKWA_GIRLS_HALL'), [boarders]);

  // Enterprise Table Columns
  const columns: ColumnDef<LegacyLearnerBalance>[] = [
    {
      key: 'studentNumber',
      header: 'Student ID',
      accessor: (row) => (
        <button
          onClick={() => setSelectedStudent(row)}
          className="font-mono text-xs font-bold text-blue-900 hover:text-blue-700 underline text-left"
        >
          {row.studentNumber}
        </button>
      ),
      sortable: true,
    },
    {
      key: 'learnerName',
      header: 'Learner Name',
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{row.learnerName}</span>
          <span className="text-[11px] text-slate-500">{row.gender} • {row.className}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'studentType',
      header: 'Cadre / Type',
      accessor: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
            row.studentType === 'BOARDER'
              ? 'bg-purple-100 text-purple-800 border border-purple-200'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}
        >
          {row.studentType === 'BOARDER' ? 'Full Boarder' : 'Day Scholar'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'hallName',
      header: 'Boarding House & Dorm',
      accessor: (row) => {
        if (row.studentType !== 'BOARDER') {
          return <span className="text-xs text-slate-400 italic">Day Scholar (Minibus)</span>;
        }
        return (
          <div className="flex flex-col text-xs">
            <span className="font-bold text-slate-800">{row.currentAccommodation?.boardingHouseLabel || 'Unassigned'}</span>
            <span className="text-slate-500 font-medium">
              {row.currentAccommodation?.dormRoom} • {row.currentAccommodation?.bedNumber}
            </span>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'financialStatus',
      header: 'Fees Ledger Balance',
      accessor: (row) => (
        <div className="flex flex-col text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-slate-900">
              K{row.balance.toLocaleString()}
            </span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                row.financialStatus === 'CLEARED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : row.financialStatus === 'PARTIAL'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {row.financialStatus}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            Paid K{row.totalPaid.toLocaleString()} of K{row.totalBilled.toLocaleString()}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'academicScore',
      header: 'Performance Trend',
      accessor: (row) => {
        const latest = row.performanceHistory?.[row.performanceHistory.length - 1];
        if (!latest) return <span className="text-xs text-slate-400">N/A</span>;
        return (
          <div className="flex flex-col text-xs">
            <div className="flex items-center gap-1">
              <span className="font-bold text-blue-900">{latest.averageScore}%</span>
              <span className="text-[10px] text-slate-500">({latest.eczDivision})</span>
            </div>
            <span className="text-[10px] text-slate-400">Rank: {latest.positionInClass}</span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Dossier Actions',
      accessor: (row) => (
        <button
          onClick={() => setSelectedStudent(row)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200 transition"
        >
          <span>View 360° Profile</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Official Legacy School Banner */}
      <LegacyLogo variant="banner" />

      {/* Page Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-900">
              <Bed className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-slate-900">
              Boarding Village & Student 360° Dossiers
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete residential accommodation records, multi-year fees ledgers, academic history, and healthcare profiles.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'OVERVIEW' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Village Overview
          </button>
          <button
            onClick={() => {
              setActiveTab('KANSANSHI');
              setHouseFilter('MOPANI_BOYS_HALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'KANSANSHI' || activeTab === 'MOPANI' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kansanshi Boys Hall
          </button>
          <button
            onClick={() => {
              setActiveTab('KALUMBILA');
              setHouseFilter('MUKWA_GIRLS_HALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'KALUMBILA' || activeTab === 'MUKWA' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kalumbila Girls Hall
          </button>
          <button
            onClick={() => setActiveTab('ALL_STUDENTS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'ALL_STUDENTS' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Students Directory
          </button>
        </div>
      </div>

      {/* Urban Campus Notice Banner when URBAN is selected */}
      {selectedCampus === 'URBAN' && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sky-950 text-sm">Urban Campus (Solwezi Central) — ECE & Primary Day School</h3>
              <p className="text-xs text-sky-800 mt-0.5">
                Urban Campus operates exclusively as a Day School for Early Childhood and Primary grades. The dedicated Boarding Village facilities (Kansanshi Boys Hall & Kalumbila Girls Hall) are located at <strong>Mushitala Campus (Near Kansanshi)</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedCampus('MUSHITALA')}
            className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shrink-0 shadow-xs transition"
          >
            Switch to Mushitala Boarding Wing
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Boarders */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Resident Boarders</span>
            <Bed className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{boarders.length}</span>
            <span className="text-xs text-slate-500">/ 350 beds total</span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center justify-between">
            <span>Occupancy Rate</span>
            <span>{((boarders.length / 350) * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Kansanshi Boys Boarding Hall */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Kansanshi Boys Boarding Hall</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{mopaniBoarders.length}</span>
            <span className="text-xs text-slate-500">/ 180 capacity</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-600 truncate font-medium">
            Housemaster: <strong>Mr. Kelvin Phiri</strong>
          </p>
        </div>

        {/* Kalumbila Girls Boarding Hall */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Kalumbila Girls Boarding Hall</span>
            <Building2 className="w-4 h-4 text-pink-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{mukwaBoarders.length}</span>
            <span className="text-xs text-slate-500">/ 170 capacity</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-600 truncate font-medium">
            Senior Matron: <strong>Mrs. C. Kangwa</strong>
          </p>
        </div>

        {/* Standby Power */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>250kVA Standby Power</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">Online</span>
            <span className="text-xs text-slate-500">24/7 ATS Standby</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-600 truncate font-medium">
            Fuel Tank: <strong>91% Diesel • Normal</strong>
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kansanshi Hall Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-blue-100 text-blue-900 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Kansanshi Boys Boarding Hall</h3>
                  <p className="text-xs text-slate-500">Mushitala Campus (Near Kansanshi) • 180 Bed Capacity</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                {mopaniBoarders.length} / 180 Beds ({((mopaniBoarders.length / 180) * 100).toFixed(0)}%)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block">Junior Wing (Forms 1-2)</span>
                <span className="text-base font-black text-slate-900 mt-1 block">Dorm A & Dorm B</span>
                <span className="text-[11px] text-slate-500">Chambishi & Lumwana Wings</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block">Senior Wing (Forms 3-5)</span>
                <span className="text-base font-black text-slate-900 mt-1 block">Dorm C & Dorm D</span>
                <span className="text-[11px] text-slate-500">Kalumbila & Prefect Cubicles</span>
              </div>
            </div>

            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-xs space-y-1">
              <p className="font-semibold text-blue-950">Boarding Staff Supervision:</p>
              <p className="text-slate-700">Senior Housemaster: <strong>Mr. Kelvin Phiri</strong> (+260 967 288578)</p>
              <p className="text-slate-700">Assistant Housemaster: <strong>Mr. Derrick Musonda</strong></p>
              <p className="text-slate-700">Evening Study Prep: <strong>19:00 - 21:00 Daily</strong> • Curfew: <strong>21:30</strong></p>
            </div>

            <button
              onClick={() => {
                setHouseFilter('MOPANI_BOYS_HALL');
                setActiveTab('ALL_STUDENTS');
              }}
              className="w-full py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>View All Kansanshi Resident Boarders</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Kalumbila Hall Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-pink-100 text-pink-900 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Kalumbila Girls Boarding Hall</h3>
                  <p className="text-xs text-slate-500">Mushitala Campus (Near Kansanshi) • 170 Bed Capacity</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-pink-50 text-pink-800 border border-pink-200">
                {mukwaBoarders.length} / 170 Beds ({((mukwaBoarders.length / 170) * 100).toFixed(0)}%)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block">North Wing (Forms 1-2)</span>
                <span className="text-base font-black text-slate-900 mt-1 block">Dorm 1 & Dorm 2</span>
                <span className="text-[11px] text-slate-500">Jacaranda & Baobab Wings</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block">South Wing (Forms 3-5)</span>
                <span className="text-base font-black text-slate-900 mt-1 block">Dorm 3 & Dorm 4</span>
                <span className="text-[11px] text-slate-500">Acacia & Senior Cubicles</span>
              </div>
            </div>

            <div className="bg-pink-50/50 p-3 rounded-xl border border-pink-100 text-xs space-y-1">
              <p className="font-semibold text-pink-950">Boarding Staff Supervision:</p>
              <p className="text-slate-700">Senior Matron: <strong>Mrs. Constance Kangwa</strong> (+260 975 119284)</p>
              <p className="text-slate-700">Assistant Matron: <strong>Mrs. Eneless Tembo</strong></p>
              <p className="text-slate-700">Resident Nurse: <strong>Mrs. Mary Mumba, RN</strong> (Sickbay Supervisor)</p>
            </div>

            <button
              onClick={() => {
                setHouseFilter('MUKWA_GIRLS_HALL');
                setActiveTab('ALL_STUDENTS');
              }}
              className="w-full py-2.5 rounded-xl bg-pink-900 hover:bg-pink-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>View All Kalumbila Resident Boarders</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Directory Table Tab */}
      {(activeTab === 'ALL_STUDENTS' || activeTab === 'KANSANSHI' || activeTab === 'KALUMBILA' || activeTab === 'MOPANI' || activeTab === 'MUKWA') && (
        <div className="space-y-4">
          {/* Quick Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600 mr-1">Filter by Cadre:</span>
              <button
                onClick={() => setTypeFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  typeFilter === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Learners ({filteredStudents.length})
              </button>
              <button
                onClick={() => setTypeFilter('BOARDER')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  typeFilter === 'BOARDER' ? 'bg-purple-800 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                Boarders Only ({filteredStudents.filter((l) => l.studentType === 'BOARDER').length})
              </button>
              <button
                onClick={() => setTypeFilter('DAY_SCHOLAR')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  typeFilter === 'DAY_SCHOLAR' ? 'bg-emerald-800 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Day Scholars ({filteredStudents.filter((l) => l.studentType === 'DAY_SCHOLAR').length})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">House:</span>
              <select
                value={houseFilter}
                onChange={(e) => setHouseFilter(e.target.value as any)}
                className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white"
              >
                <option value="ALL">All Houses & Day</option>
                <option value="MOPANI_BOYS_HALL">Kansanshi Boys Boarding Hall</option>
                <option value="MUKWA_GIRLS_HALL">Kalumbila Girls Boarding Hall</option>
              </select>
            </div>
          </div>

          {/* Enterprise Table */}
          <EnterpriseTable
            data={filteredStudents}
            columns={columns}
            title="Legacy School Solwezi — Student Registry & Dossiers"
            description="Displaying all grades, boarders, and dayscholars with verified histories."
            exportFilename="legacy-school-student-dossiers"
            onRowClick={(row) => setSelectedStudent(row)}
          />
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* STUDENT 360° DOSSIER MODAL */}
      {/* --------------------------------------------------------------------- */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header with School Identity */}
            <div className="bg-blue-950 text-white p-4 sm:p-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <LegacyLogo variant="emblem" size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black tracking-wide text-white font-serif">
                      {selectedStudent.learnerName}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-blue-950 font-mono">
                      {selectedStudent.studentNumber}
                    </span>
                  </div>
                  <p className="text-xs text-blue-200 mt-0.5">
                    {selectedStudent.className} • {selectedStudent.campusName} •{' '}
                    <strong className="text-white">
                      {selectedStudent.studentType === 'BOARDER'
                        ? `Full Boarder (${selectedStudent.currentAccommodation?.boardingHouseLabel})`
                        : 'Day Scholar'}
                    </strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-blue-200 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Tabs */}
            <div className="bg-slate-100 border-b border-slate-200 px-4 flex items-center gap-1 overflow-x-auto">
              <button
                onClick={() => setDossierTab('ACCOMMODATION')}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  dossierTab === 'ACCOMMODATION'
                    ? 'border-blue-900 text-blue-950 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bed className="w-3.5 h-3.5" />
                <span>Accommodation History</span>
              </button>
              <button
                onClick={() => setDossierTab('FEES')}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  dossierTab === 'FEES'
                    ? 'border-blue-900 text-blue-950 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Fees Ledger History</span>
              </button>
              <button
                onClick={() => setDossierTab('ACADEMICS')}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  dossierTab === 'ACADEMICS'
                    ? 'border-blue-900 text-blue-950 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Academic Records</span>
              </button>
              <button
                onClick={() => setDossierTab('HEALTH')}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  dossierTab === 'HEALTH'
                    ? 'border-blue-900 text-blue-950 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Healthcare & Welfare</span>
              </button>
              <button
                onClick={() => setDossierTab('LETTERHEAD')}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  dossierTab === 'LETTERHEAD'
                    ? 'border-blue-900 text-blue-950 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Official Letterhead Dossier</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              {/* TAB 1: ACCOMMODATION HISTORY */}
              {dossierTab === 'ACCOMMODATION' && (
                <div className="space-y-4">
                  {/* Current Active Allocation */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-blue-900">
                      Current Room & Board Allocation (2026 Term 1)
                    </h4>
                    {selectedStudent.studentType === 'BOARDER' ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                        <div>
                          <span className="text-slate-500 font-semibold block">Boarding House</span>
                          <span className="font-bold text-slate-900 mt-0.5 block">
                            {selectedStudent.currentAccommodation?.boardingHouseLabel}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block">Wing & Room</span>
                          <span className="font-bold text-slate-900 mt-0.5 block">
                            {selectedStudent.currentAccommodation?.wing} • {selectedStudent.currentAccommodation?.dormRoom}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block">Bed & Locker ID</span>
                          <span className="font-bold text-slate-900 mt-0.5 block">
                            {selectedStudent.currentAccommodation?.bedNumber} • {selectedStudent.currentAccommodation?.lockerNumber}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block">Housemaster/Matron</span>
                          <span className="font-bold text-slate-900 mt-0.5 block">
                            {selectedStudent.currentAccommodation?.supervisorName}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600 mt-2">
                        This learner is currently enrolled as a <strong>Day Scholar</strong> at {selectedStudent.campusName}. They use the morning minibus route (Stand # S/SOLWE/3177178 Kansanshi Corridor) and day locker {selectedStudent.currentAccommodation?.lockerNumber}.
                      </p>
                    )}
                  </div>

                  {/* Multi-Year Accommodation Timeline */}
                  <div>
                    <h4 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-800" />
                      <span>Historical Accommodation Timeline Over The Years</span>
                    </h4>

                    {selectedStudent.accommodationHistory && selectedStudent.accommodationHistory.length > 0 ? (
                      <div className="space-y-3">
                        {selectedStudent.accommodationHistory.map((h, i) => (
                          <div
                            key={h.id || i}
                            className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:border-blue-300 transition"
                          >
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-xs">
                                {h.termLabel}
                              </span>
                              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                {h.inspectionScore}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs text-slate-700">
                              <div><strong>Dormitory:</strong> {h.dormRoom}</div>
                              <div><strong>Bed Assigned:</strong> {h.bedNumber}</div>
                              <div><strong>Supervisor:</strong> {h.housemasterOrMatron}</div>
                              <div><strong>Exeats Taken:</strong> {h.exeatsCount} approved</div>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-2 italic border-t border-slate-100 pt-1.5">
                              Remarks: {h.remarks}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
                        No previous residential history recorded (Day Scholar or new entrant).
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: FEES LEDGER HISTORY */}
              {dossierTab === 'FEES' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 font-semibold">Current Term 1 Balance</span>
                      <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                        K{selectedStudent.balance.toLocaleString()}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        selectedStudent.financialStatus === 'CLEARED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {selectedStudent.financialStatus}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900">
                    Comprehensive Fees Payment History Over The Years (2024–2026)
                  </h4>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                        <tr>
                          <th className="p-3">Academic Term</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Amount Billed</th>
                          <th className="p-3">Amount Paid</th>
                          <th className="p-3">Balance</th>
                          <th className="p-3">Receipt / Ref</th>
                          <th className="p-3">Payment Method</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedStudent.feeHistory?.map((f, idx) => (
                          <tr key={f.id || idx} className="hover:bg-slate-50/80">
                            <td className="p-3 font-bold text-slate-900">{f.termLabel}</td>
                            <td className="p-3 text-slate-600">
                              {f.category === 'BOARDING_AND_TUITION' ? 'Boarding & Tuition' : 'Day Tuition'}
                            </td>
                            <td className="p-3 font-mono">K{f.amountBilled.toLocaleString()}</td>
                            <td className="p-3 font-mono font-bold text-emerald-700">K{f.amountPaid.toLocaleString()}</td>
                            <td className="p-3 font-mono">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                                  f.balanceRemaining === 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                                }`}
                              >
                                K{f.balanceRemaining.toLocaleString()}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-[11px] text-blue-900">{f.receiptNumber}</td>
                            <td className="p-3 text-slate-600">{f.paymentMethod}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: ACADEMIC PERFORMANCE OVER THE YEARS */}
              {dossierTab === 'ACADEMICS' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Termly Academic Records & Subject Performance Over The Years</span>
                  </h4>

                  {selectedStudent.performanceHistory?.map((p, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-blue-950 text-white font-bold text-xs">
                            {p.termLabel}
                          </span>
                          <span className="font-bold text-slate-900 text-xs">{p.className}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            Average: {p.averageScore}%
                          </span>
                          <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {p.eczDivision}
                          </span>
                          <span className="text-slate-500 font-medium">Rank: {p.positionInClass}</span>
                        </div>
                      </div>

                      {/* Subject breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        {p.subjects.map((sub, sIdx) => (
                          <div key={sIdx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">{sub.subjectName}</span>
                              <span className="font-mono font-bold text-blue-900">{sub.score}%</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                              <span>Grade: <strong>{sub.eczGrade}</strong></span>
                            </div>
                            <p className="text-[10px] text-slate-500 italic mt-1 line-clamp-1">
                              {sub.teacherRemark}
                            </p>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-slate-600 bg-blue-50/50 p-2 rounded-lg border border-blue-100 italic">
                        <strong>Principal Remarks:</strong> {p.principalRemarks}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: HEALTHCARE & WELFARE */}
              {dossierTab === 'HEALTH' && (
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>Sickbay & Medical Profile (Supervised by Nurse Mary Mumba)</span>
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-500 font-semibold block">Blood Group</span>
                        <span className="font-black text-rose-700 text-lg mt-0.5 block">
                          {selectedStudent.medicalProfile?.bloodGroup}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-500 font-semibold block">Allergies</span>
                        <span className="font-bold text-slate-800 mt-0.5 block">
                          {selectedStudent.medicalProfile?.allergies}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-500 font-semibold block">Chronic Conditions</span>
                        <span className="font-bold text-slate-800 mt-0.5 block">
                          {selectedStudent.medicalProfile?.chronicConditions}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-500 font-semibold block">Sickbay Visits</span>
                        <span className="font-bold text-slate-900 mt-0.5 block">
                          {selectedStudent.medicalProfile?.sickbayVisitsCount} visits logged
                        </span>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-xs space-y-1">
                      <p className="font-bold text-blue-950">Last Clinical Examination:</p>
                      <p className="text-slate-700">{selectedStudent.medicalProfile?.nurseNotes}</p>
                      <p className="text-slate-500 text-[11px] mt-1">Date: {selectedStudent.medicalProfile?.lastNurseCheckup}</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                      <span className="font-bold text-slate-800 block">Emergency Guardian Contact:</span>
                      <p className="text-slate-700 mt-1">
                        {selectedStudent.guardian.name} • Phone: <strong>{selectedStudent.guardian.phone}</strong> • Email: {selectedStudent.guardian.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: OFFICIAL LETTERHEAD DOSSIER */}
              {dossierTab === 'LETTERHEAD' && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900 text-white text-xs font-bold shadow-xs hover:bg-blue-800 transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Official Student Dossier</span>
                    </button>
                  </div>

                  {/* Document Container */}
                  <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 shadow-sm space-y-6 text-slate-900">
                    <LegacyLogo variant="letterhead" />

                    <div className="text-center">
                      <h2 className="text-base font-black tracking-wider uppercase text-blue-950 border-b-2 border-blue-900 pb-1 inline-block">
                        OFFICIAL CONFIDENTIAL STUDENT DOSSIER
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        ISSUED UNDER THE AUTHORITY OF THE SCHOOL DIRECTOR & BURSARY
                      </p>
                    </div>

                    {/* Bio Table */}
                    <div className="grid grid-cols-2 gap-4 text-xs border border-slate-200 rounded-xl p-4 bg-slate-50/60">
                      <div><strong>Learner Full Name:</strong> {selectedStudent.learnerName}</div>
                      <div><strong>Student ID Number:</strong> {selectedStudent.studentNumber}</div>
                      <div><strong>Current Class & Stage:</strong> {selectedStudent.className} ({selectedStudent.stage})</div>
                      <div><strong>Campus:</strong> {selectedStudent.campusName}</div>
                      <div><strong>Enrolment Cadre:</strong> {selectedStudent.studentType === 'BOARDER' ? 'Residential Boarder' : 'Day Scholar'}</div>
                      <div><strong>Residential Hall:</strong> {selectedStudent.currentAccommodation?.boardingHouseLabel || 'N/A'}</div>
                      <div><strong>Guardian Name:</strong> {selectedStudent.guardian.name}</div>
                      <div><strong>Emergency Phone:</strong> {selectedStudent.guardian.phone}</div>
                    </div>

                    {/* Financial Summary */}
                    <div>
                      <h4 className="text-xs font-black uppercase text-blue-900 mb-2">Bursar Statement Summary</h4>
                      <table className="w-full text-left text-xs border border-slate-200">
                        <thead className="bg-slate-100 font-bold">
                          <tr>
                            <th className="p-2 border-b">Term</th>
                            <th className="p-2 border-b">Billed (ZMW)</th>
                            <th className="p-2 border-b">Paid (ZMW)</th>
                            <th className="p-2 border-b">Receipt Ref</th>
                            <th className="p-2 border-b">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStudent.feeHistory?.slice(-4).map((f, i) => (
                            <tr key={i} className="border-b border-slate-100">
                              <td className="p-2 font-bold">{f.termLabel}</td>
                              <td className="p-2 font-mono">K{f.amountBilled.toLocaleString()}</td>
                              <td className="p-2 font-mono text-emerald-800">K{f.amountPaid.toLocaleString()}</td>
                              <td className="p-2 font-mono text-[11px]">{f.receiptNumber}</td>
                              <td className="p-2 font-bold text-[11px]">{f.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Authorizing Stamp */}
                    <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800">Mrs. Grace Tembo / Mr. Emmanuel Mwansa</p>
                        <p className="text-[11px] text-slate-500">School Directorate & Principal</p>
                      </div>
                      <div className="border-2 border-dashed border-blue-900 px-4 py-2 rounded-xl text-center">
                        <span className="block text-[10px] font-black uppercase tracking-widest text-blue-900">
                          LEGACY SCHOOL SOLWEZI
                        </span>
                        <span className="block text-[9px] text-slate-500">OFFICIAL ARCHIVE STAMP</span>
                        <span className="block text-[9px] font-mono text-blue-800">MOE/NWP/SOL/SEC/2026/044</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
