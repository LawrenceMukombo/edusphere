// src/components/search/UniversalSearchModal.tsx — Enterprise Universal Search & 360° Entity Dossier Modal
'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  X,
  User,
  GraduationCap,
  UsersRound,
  BookOpen,
  Building2,
  HeartPulse,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  Receipt,
  Calendar,
  Layers,
  Award,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  Briefcase,
  SlidersHorizontal,
  CreditCard,
} from 'lucide-react';
import type {
  UniversalSearchResults,
  UniversalStudentResult,
  UniversalStaffResult,
  UniversalCourseResult,
  UniversalFeatureResult,
  UniversalClinicalResult,
} from '@/server/search/universalSearchEngine';
import { formatCleanEnum } from '@/lib/formatters';

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export function UniversalSearchModal({ isOpen, onClose, initialQuery = '' }: UniversalSearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'ALL' | 'STUDENTS' | 'STAFF' | 'COURSES' | 'FEATURES' | 'CLINICAL'>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<UniversalSearchResults | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<UniversalStudentResult | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<UniversalStaffResult | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<UniversalCourseResult | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<UniversalFeatureResult | null>(null);
  const [selectedClinical, setSelectedClinical] = useState<UniversalClinicalResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Suggested Natural Language Queries
  const SUGGESTED_QUERIES = [
    'Esther Lungu',
    'fees owing in nursing',
    'Dr. Kelvin Silwamba',
    'NUR-113',
    'how to print official transcript',
    'Solwezi General Hospital',
    'conduct live roll-call',
    'who teaches anatomy',
  ];

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      if (initialQuery) {
        executeSearch(initialQuery);
      } else {
        executeSearch('Esther Lungu'); // Default rich executive showcase
      }
    } else {
      setSelectedStudent(null);
      setSelectedStaff(null);
      setSelectedCourse(null);
      setSelectedFeature(null);
      setSelectedClinical(null);
    }
  }, [isOpen, initialQuery]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedStudent || selectedStaff || selectedCourse || selectedFeature || selectedClinical) {
          setSelectedStudent(null);
          setSelectedStaff(null);
          setSelectedCourse(null);
          setSelectedFeature(null);
          setSelectedClinical(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, selectedStudent, selectedStaff, selectedCourse, selectedFeature, selectedClinical]);

  const executeSearch = async (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=30`);
      const payload = await res.json();
      if (payload.success) {
        startTransition(() => {
          setResults(payload.data);
        });
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeSearch(val);
    }, 200);
  };

  const handleSuggestionClick = (suggested: string) => {
    setQuery(suggested);
    executeSearch(suggested);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 md:p-10 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Top Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-teal-700 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search students, staff, courses, or ask in natural language (e.g. 'nursing students with fees owing')..."
              className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-300 rounded-xl text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-teal-700 shadow-xs"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setResults(null);
                  inputRef.current?.focus();
                }}
                className="absolute right-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Natural Language Prompt Pills */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              Try:
            </span>
            {SUGGESTED_QUERIES.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleSuggestionClick(sug)}
                className="shrink-0 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-medium text-[11px] transition shadow-2xs hover:border-teal-700"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Category Filter Tabs */}
          <div className="mt-3 flex items-center gap-1 overflow-x-auto border-t border-slate-200 pt-3">
            {[
              { id: 'ALL', label: 'All Results', count: results?.totalMatches || 0 },
              { id: 'STUDENTS', label: 'Students', count: results?.students.length || 0 },
              { id: 'STAFF', label: 'Faculty & Staff', count: results?.staff.length || 0 },
              { id: 'COURSES', label: 'Courses & Syllabus', count: results?.courses.length || 0 },
              { id: 'FEATURES', label: 'Actions & Features', count: results?.features.length || 0 },
              { id: 'CLINICAL', label: 'Clinical Sites', count: results?.clinicalSites.length || 0 },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-teal-800 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-teal-900 text-teal-100' : 'bg-slate-100 text-slate-600'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Results Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 min-h-[300px]">
          {isLoading && !results && (
            <div className="py-16 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-800 border-r-transparent align-[-0.125em]" />
              <p className="mt-3 text-xs font-semibold text-slate-500">Searching institutional records & synthesizing knowledge graph...</p>
            </div>
          )}

          {/* GOOGLE-STYLE AI OVERVIEW CARD */}
          {results?.aiOverview && activeTab === 'ALL' && (
            <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/80 via-white to-blue-50/50 p-5 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600" />
              
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-teal-800 text-white shadow-2xs">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                      NWUCHAS Institutional AI Overview
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {results.aiOverview.headline}
                    </h3>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {Math.round(results.aiOverview.confidence * 100)}% Match
                </span>
              </div>

              <p className="mt-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                {results.aiOverview.summary}
              </p>

              {/* Key Synthesized Institutional Facts */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {results.aiOverview.keyFacts.map((fact, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{fact.label}</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5 truncate">{fact.value}</div>
                  </div>
                ))}
              </div>

              {/* Primary Action Button */}
              {results.aiOverview.primaryAction && (
                <div className="mt-4 pt-3 border-t border-teal-100 flex justify-end">
                  <Link
                    href={results.aiOverview.primaryAction.href}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-xs transition"
                  >
                    <span>{results.aiOverview.primaryAction.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* STUDENTS SECTION */}
          {(activeTab === 'ALL' || activeTab === 'STUDENTS') && results && results.students.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-teal-700" />
                  Students & Enrolled Learners ({results.students.length})
                </h4>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {results.students.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 hover:border-teal-700 hover:shadow-md transition space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center font-bold text-teal-800 text-sm shadow-2xs">
                          {student.fullName.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition">
                            {student.fullName}
                          </h5>
                          <p className="text-xs font-mono text-slate-500">{student.studentNumber}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        student.financialStatus === 'CLEARED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {student.financialStatus === 'CLEARED' ? 'Fees Cleared' : `K${student.financialBalanceZMW} Due`}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                      <div><strong className="text-slate-800">{student.programmeCode}:</strong> {student.programmeName}</div>
                      <div className="text-slate-500 text-[11px]">{student.cohort} • {student.campusName}</div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-800">
                      <span>Exam: {student.academicStanding.includes('GOOD') ? 'Pass (Good Standing)' : 'Under Review'}</span>
                      <span className="flex items-center gap-1 text-[11px] group-hover:translate-x-1 transition-transform">
                        360° Dossier <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STAFF SECTION */}
          {(activeTab === 'ALL' || activeTab === 'STAFF') && results && results.staff.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <UsersRound className="w-4 h-4 text-teal-700" />
                  Academic Staff & Executive Faculty ({results.staff.length})
                </h4>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {results.staff.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedStaff(member)}
                    className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 hover:border-teal-700 hover:shadow-md transition space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-blue-800 text-sm shadow-2xs">
                          {member.fullName.split(' ').filter((_, i) => i > 0 || !member.fullName.startsWith('Dr') && !member.fullName.startsWith('Prof')).map((n) => n[0]).join('').slice(0, 2) || 'ST'}
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition">
                            {member.fullName}
                          </h5>
                          <p className="text-xs text-slate-500">{member.jobTitle}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                        {member.staffNumber}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                      <div><span className="text-slate-500">Dept:</span> {member.department}</div>
                      <div><span className="text-slate-500">TCZ Reg:</span> <strong className="text-emerald-700">{member.tczNumber || 'Exempt Executive'}</strong> ({member.tczStatus})</div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-800">
                      <span>{member.coursesTaught.length} Courses Taught</span>
                      <span className="flex items-center gap-1 text-[11px] group-hover:translate-x-1 transition-transform">
                        View Staff Record <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COURSES SECTION */}
          {(activeTab === 'ALL' || activeTab === 'COURSES') && results && results.courses.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-teal-700" />
                  Syllabus Courses & Curriculum Modules ({results.courses.length})
                </h4>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {results.courses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => setSelectedCourse(course)}
                    className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 hover:border-teal-700 hover:shadow-md transition space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="inline-block text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                          {course.code}
                        </div>
                        <h5 className="text-sm font-bold text-slate-900 mt-1 group-hover:text-teal-800 transition">
                          {course.name}
                        </h5>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {course.creditUnits} Units
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-0.5">
                      <div>{course.programmeName} • Semester {course.semesterNumber}</div>
                      <div className="text-[11px] text-slate-500">Directive: {course.accreditingCouncil}</div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-800">
                      <span>Pass Mark: {course.minimumPassBenchmark}% (CA 40% + Exam 60%)</span>
                      <span className="flex items-center gap-1 text-[11px] group-hover:translate-x-1 transition-transform">
                        Syllabus Details <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FEATURES & ACTIONS SECTION */}
          {(activeTab === 'ALL' || activeTab === 'FEATURES') && results && results.features.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-teal-700" />
                  Institutional Workflows & Execution Actions ({results.features.length})
                </h4>
              </div>

              <div className="grid gap-2.5">
                {results.features.map((feat) => (
                  <div
                    key={feat.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-teal-700 hover:bg-slate-50/50 transition"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {feat.category}
                        </span>
                        <h5 className="text-sm font-bold text-slate-900">{feat.title}</h5>
                      </div>
                      <p className="text-xs text-slate-500 max-w-2xl">{feat.description}</p>
                    </div>

                    <Link
                      href={feat.href}
                      onClick={onClose}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-xs shrink-0 transition self-start sm:self-auto"
                    >
                      <span>{feat.quickActionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CLINICAL SITES SECTION */}
          {(activeTab === 'ALL' || activeTab === 'CLINICAL') && results && results.clinicalSites.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-teal-700" />
                  Accredited Clinical Teaching Hospital Sites ({results.clinicalSites.length})
                </h4>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {results.clinicalSites.map((site) => (
                  <div
                    key={site.id}
                    onClick={() => setSelectedClinical(site)}
                    className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 hover:border-teal-700 hover:shadow-md transition space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition">
                          {site.name}
                        </h5>
                        <p className="text-xs text-slate-500">{site.district} District • {site.province} Province</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                        {site.bedCapacity} Beds
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-0.5">
                      <div><strong className="text-slate-800">Active Students Placed:</strong> {site.activePlacementCount} Learners</div>
                      <div className="text-[11px] text-slate-500">Corridor: {site.allocatedTransportRoute} ({site.distanceFromMainCampusKm} km)</div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-800">
                      <span>{site.accreditedBy}</span>
                      <span className="flex items-center gap-1 text-[11px] group-hover:translate-x-1 transition-transform">
                        Site Metrics <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMPTY STATE */}
          {results && results.totalMatches === 0 && !isLoading && (
            <div className="py-16 text-center space-y-3">
              <AlertCircle className="mx-auto w-12 h-12 text-slate-300" />
              <h4 className="text-base font-bold text-slate-800">No institutional matches found</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No matching student, faculty staff, course module, or system feature was found for &quot;{query}&quot;. Try searching by student number, staff name, or ask in natural language.
              </p>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 px-5">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1.5 py-0.5 rounded border border-slate-300 bg-white font-mono text-[10px]">ESC</kbd> to exit</span>
            <span>•</span>
            <span className="font-semibold text-teal-800">NWUCHAS Federated Search AI v2.4</span>
          </div>

          {results && (
            <div className="text-[11px] font-mono text-slate-400">
              {results.totalMatches} matches found in {results.executionTimeMs}ms
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 360° STUDENT COMPREHENSIVE DOSSIER MODAL */}
      {/* ==================================================================== */}
      {selectedStudent && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in zoom-in-95">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-800 text-white font-black text-lg flex items-center justify-center shadow-xs">
                  {selectedStudent.fullName.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedStudent.fullName}</h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
                      {selectedStudent.studentNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {selectedStudent.programmeName} • Cohort {selectedStudent.cohort}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Identity & Statutory Grid */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">NRC Identification</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedStudent.nrcNumber}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Gender &amp; DOB</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedStudent.gender} • {selectedStudent.dateOfBirth}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">National Regulatory Indexing</span>
                  <div className="font-bold text-teal-800 mt-0.5">{selectedStudent.nmczIndexNumber || selectedStudent.hpczIndexNumber || 'Verified Index'}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Enrolment Status</span>
                  <div className="font-bold text-emerald-700 mt-0.5">{selectedStudent.enrolmentStatus}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Campus Assignment</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedStudent.campusName}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Fee Ledger Standing</span>
                  <div className={`font-bold mt-0.5 ${selectedStudent.financialBalanceZMW > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {selectedStudent.financialBalanceZMW > 0 ? `K${selectedStudent.financialBalanceZMW.toFixed(2)} Outstanding` : '100% Cleared (K0.00)'}
                  </div>
                </div>
              </div>

              {/* Academic Course Registrations & Scores */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-teal-700" />
                  Senate Examination Marks (CA 40% + Exam 60%)
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="py-2 px-3">Module</th>
                        <th className="py-2 px-3">Title</th>
                        <th className="py-2 px-3 text-center">CA (40%)</th>
                        <th className="py-2 px-3 text-center">Exam (60%)</th>
                        <th className="py-2 px-3 text-center">Final (100%)</th>
                        <th className="py-2 px-3 text-center">Grade</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {selectedStudent.moduleRegistrations.map((m) => (
                        <tr key={m.code} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-bold text-teal-800">{m.code}</td>
                          <td className="py-2 px-3 text-slate-800">{m.title}</td>
                          <td className="py-2 px-3 text-center text-slate-600">{m.caScore}</td>
                          <td className="py-2 px-3 text-center text-slate-600">{m.examScore}</td>
                          <td className="py-2 px-3 text-center font-bold text-slate-900">{m.finalScore}</td>
                          <td className="py-2 px-3 text-center font-bold text-blue-700">{m.grade}</td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {formatCleanEnum(m.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Hospital Clinical Placements */}
              {selectedStudent.clinicalPlacements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-teal-700" />
                    Hospital Clinical Placements & Ward Deployments
                  </h4>
                  <div className="space-y-1.5">
                    {selectedStudent.clinicalPlacements.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
                        <div>
                          <div className="font-bold text-slate-800">{p.siteName}</div>
                          <div className="text-slate-500 text-[11px]">Ward: {p.ward} • {p.hoursCompleted} Hours Certified</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {formatCleanEnum(p.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Guardian & Emergency Contacts */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Guardian Contact</span>
                  <div className="font-bold text-slate-800">{selectedStudent.guardianName}</div>
                  <div className="text-slate-500 text-[11px] font-mono">{selectedStudent.guardianPhone}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Emergency Contact</span>
                  <div className="font-bold text-slate-800">{selectedStudent.emergencyContact}</div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <Link
                href={`/modules/academics?studentNumber=${selectedStudent.studentNumber}`}
                onClick={() => {
                  setSelectedStudent(null);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-xs transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Open Senate Transcript</span>
              </Link>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 360° STAFF DOSSIER MODAL */}
      {/* ==================================================================== */}
      {selectedStaff && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in zoom-in-95">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-800 text-white font-black text-lg flex items-center justify-center shadow-xs">
                  {selectedStaff.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedStaff.fullName}</h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                      {selectedStaff.staffNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{selectedStaff.jobTitle}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStaff(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Department</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedStaff.department}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Campus Assignment</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedStaff.campusName}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">TCZ Certificate Reg</span>
                  <div className="font-bold text-emerald-700 mt-0.5">{selectedStaff.tczNumber || 'Exempt Executive'} ({selectedStaff.tczStatus})</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Employment Status</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedStaff.employmentStatus}</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">Academic Qualifications</h4>
                <div className="space-y-1">
                  {selectedStaff.qualifications.map((q, idx) => (
                    <div key={idx} className="p-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 flex items-center gap-2">
                      <Award className="w-4 h-4 text-teal-700" />
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedStaff.coursesTaught.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">Courses Taught</h4>
                  <div className="space-y-1">
                    {selectedStaff.coursesTaught.map((c) => (
                      <div key={c.code} className="p-2 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                        <span className="font-mono font-bold text-teal-800">{c.code}</span>
                        <span className="text-slate-800 font-medium">{c.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Direct Contacts</div>
                  <div className="font-bold text-slate-800">{selectedStaff.email} • {selectedStaff.phone}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Statutory TPIN</div>
                  <div className="font-mono font-bold text-slate-700">{selectedStaff.statutoryStatus.tpin}</div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <Link
                href={`/modules/hr?staffNumber=${selectedStaff.staffNumber}`}
                onClick={() => {
                  setSelectedStaff(null);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-xs transition"
              >
                <UsersRound className="w-3.5 h-3.5" />
                <span>Open HR Staff Profile</span>
              </Link>

              <button
                type="button"
                onClick={() => setSelectedStaff(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 360° COURSE SYLLABUS MODAL */}
      {/* ==================================================================== */}
      {selectedCourse && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in zoom-in-95">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
                  {selectedCourse.code}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedCourse.name}</h3>
                <p className="text-xs text-slate-500">{selectedCourse.programmeName}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Curriculum Credit Units</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedCourse.creditUnits} Units</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Semester Schedule</span>
                  <div className="font-bold text-slate-800 mt-0.5">Semester {selectedCourse.semesterNumber}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Instruction Hours</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedCourse.theoryHours}h Theory • {selectedCourse.practicalHours}h Practical</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Accrediting Council</span>
                  <div className="font-bold text-teal-800 mt-0.5">{selectedCourse.accreditingCouncil}</div>
                </div>
              </div>

              <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 space-y-1">
                <div className="text-[10px] uppercase font-bold text-teal-800">Senate Examination Directive</div>
                <div className="text-sm font-bold text-slate-900">Minimum Passing Benchmark: {selectedCourse.minimumPassBenchmark.toFixed(1)}%</div>
                <div className="text-slate-600 text-[11px]">
                  Requires Continuous Assessment (40%) + Senate Written/Practical Examination (60%). Pass mandated for progression.
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">Designated Lecturers &amp; Instructors</h4>
                <div className="space-y-1">
                  {selectedCourse.lecturers.map((lec, idx) => (
                    <div key={idx} className="p-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800">
                      {lec}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <Link
                href={`/modules/academics?courseCode=${selectedCourse.code}`}
                onClick={() => {
                  setSelectedCourse(null);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-xs transition"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Open Academics Syllabus</span>
              </Link>

              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 360° CLINICAL SITE MODAL */}
      {/* ==================================================================== */}
      {selectedClinical && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in zoom-in-95">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
                  {selectedClinical.siteType.replace(/_/g, ' ')}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedClinical.name}</h3>
                <p className="text-xs text-slate-500">{selectedClinical.district} District, {selectedClinical.province} Province</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedClinical(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Hospital Bed Capacity</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedClinical.bedCapacity} Beds</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">NWUCHAS Placements</span>
                  <div className="font-bold text-teal-800 mt-0.5">{selectedClinical.activePlacementCount} Students Deployed</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Preceptors Available</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedClinical.preceptorCount} Certified Supervisors</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Accrediting Councils</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedClinical.accreditedBy}</div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">Logistics &amp; Transport Corridor</div>
                <div className="text-xs font-bold text-slate-900">{selectedClinical.allocatedTransportRoute}</div>
                <div className="text-[11px] text-slate-500">Distance from Manyama Main Campus: {selectedClinical.distanceFromMainCampusKm} km</div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <Link
                href="/modules/clinical-learning"
                onClick={() => {
                  setSelectedClinical(null);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-xs transition"
              >
                <HeartPulse className="w-3.5 h-3.5" />
                <span>Open Clinical Placements</span>
              </Link>

              <button
                type="button"
                onClick={() => setSelectedClinical(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
