// src/app/calendar/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CalendarCheck,
  Cake,
  PartyPopper,
  Gift,
  Flag,
  Sparkles,
  BookOpen,
  Clock,
  Users,
  Building2,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Download,
  Send,
  Phone,
  User,
  Award,
  ShieldAlert,
} from 'lucide-react';
import {
  ZAMBIAN_PUBLIC_HOLIDAYS_2026,
  ACADEMIC_TERMS_2026,
  SCHOOL_EVENTS_2026,
  getAllLearnerBirthdays,
  getBirthdaysByMonth,
  getBirthdaysForDate,
  getTodayBirthdays,
  generateSmsBirthdayWish,
  buildMonthCalendarMatrix,
  CalendarDayCell,
  ZambianPublicHoliday,
  LearnerBirthdayProfile,
  SchoolCalendarEvent,
} from '@/server/services/schoolCalendarData';
import { useCampus } from '@/components/CampusContext';
import { ModuleGate } from '@/components/ModuleGate';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SchoolCalendarPage() {
  const { selectedCampus, campusInfo } = useCampus();

  // Active view
  const [activeTab, setActiveTab] = useState<'MONTH_GRID' | 'HOLIDAYS' | 'TERMS' | 'BIRTHDAYS' | 'EVENTS'>('MONTH_GRID');

  // Month navigation (Defaults to October 2026 - National Day of Prayer & Exam Month)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(10); // 1-12 (October)
  const todayDateStr = '2026-10-18'; // Zambia National Day of Prayer

  // Selected Day Cell for Drawer / Modal
  const [selectedDayCell, setSelectedDayCell] = useState<CalendarDayCell | null>(null);

  // Birthday Hub State
  const [birthdayMonthFilter, setBirthdayMonthFilter] = useState<number>(10);
  const [birthdayClassFilter, setBirthdayClassFilter] = useState<string>('ALL');
  const [birthdaySearch, setBirthdaySearch] = useState<string>('');
  const [smsModalLearner, setSmsModalLearner] = useState<LearnerBirthdayProfile | null>(null);
  const [smsCustomMessage, setSmsCustomMessage] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Public Holiday Filters
  const [holidayCategoryFilter, setHolidayCategoryFilter] = useState<string>('ALL');
  const [holidaySearch, setHolidaySearch] = useState<string>('');

  // Events Filters
  const [eventCategoryFilter, setEventCategoryFilter] = useState<string>('ALL');
  const [eventCampusFilter, setEventCampusFilter] = useState<string>('ALL');

  // Toast auto-clear
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Build calendar matrix for selected month
  const calendarMatrix = useMemo(() => {
    return buildMonthCalendarMatrix(currentYear, currentMonth, todayDateStr);
  }, [currentYear, currentMonth, todayDateStr]);

  // Today's celebrants
  const todayBirthdaysInfo = useMemo(() => {
    return getTodayBirthdays(todayDateStr);
  }, [todayDateStr]);

  // All birthdays for active birthday tab
  const allBirthdays = useMemo(() => {
    return getAllLearnerBirthdays();
  }, []);

  const filteredBirthdays = useMemo(() => {
    return allBirthdays.filter((b) => {
      if (birthdayMonthFilter !== 0 && b.birthMonth !== birthdayMonthFilter) return false;
      if (birthdayClassFilter !== 'ALL' && b.className !== birthdayClassFilter) return false;
      if (birthdaySearch) {
        const q = birthdaySearch.toLowerCase();
        return (
          b.learnerName.toLowerCase().includes(q) ||
          b.studentNumber.toLowerCase().includes(q) ||
          b.guardianName.toLowerCase().includes(q) ||
          b.guardianPhone.includes(q)
        );
      }
      return true;
    });
  }, [allBirthdays, birthdayMonthFilter, birthdayClassFilter, birthdaySearch]);

  // Filtered Holidays
  const filteredHolidays = useMemo(() => {
    return ZAMBIAN_PUBLIC_HOLIDAYS_2026.filter((h) => {
      if (holidayCategoryFilter !== 'ALL' && h.category !== holidayCategoryFilter) return false;
      if (holidaySearch) {
        const q = holidaySearch.toLowerCase();
        return (
          h.name.toLowerCase().includes(q) ||
          h.significance.toLowerCase().includes(q) ||
          h.dayOfWeek.toLowerCase().includes(q) ||
          h.date.includes(q)
        );
      }
      return true;
    });
  }, [holidayCategoryFilter, holidaySearch]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return SCHOOL_EVENTS_2026.filter((e) => {
      if (eventCategoryFilter !== 'ALL' && e.category !== eventCategoryFilter) return false;
      if (eventCampusFilter !== 'ALL' && e.campus !== 'All Campuses' && !e.campus.includes(eventCampusFilter)) return false;
      return true;
    });
  }, [eventCategoryFilter, eventCampusFilter]);

  // Distinct classes for birthday filter
  const distinctClasses = useMemo(() => {
    const set = new Set(allBirthdays.map((b) => b.className));
    return Array.from(set).sort();
  }, [allBirthdays]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleSendSms = (learner: LearnerBirthdayProfile) => {
    setSmsModalLearner(learner);
    setSmsCustomMessage(generateSmsBirthdayWish(learner));
  };

  const confirmSendSms = () => {
    if (!smsModalLearner) return;
    showToast(`SMS Birthday Greeting successfully queued to ${smsModalLearner.guardianName} (${smsModalLearner.guardianPhone}) for ${smsModalLearner.learnerName}!`);
    setSmsModalLearner(null);
  };

  // Export Holidays CSV
  const exportHolidaysCsv = () => {
    const headers = ['Holiday Name', 'Date', 'Day of Week', 'Category', 'School Closure Status', 'Significance', 'Historical Context'];
    const rows = ZAMBIAN_PUBLIC_HOLIDAYS_2026.map((h) => [
      `"${h.name}"`,
      `"${h.date}"`,
      `"${h.dayOfWeek}"`,
      `"${h.category}"`,
      `"${h.schoolClosure}"`,
      `"${h.significance.replace(/"/g, '""')}"`,
      `"${h.historicalContext.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Zambia_Public_Holidays_2026_Legacy_School.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Zambian Public Holidays CSV successfully downloaded.');
  };

  // Export Birthdays CSV
  const exportBirthdaysCsv = () => {
    const headers = ['Student ID', 'Learner Name', 'Class', 'Campus', 'Type', 'Date of Birth', 'Turning Age', 'Guardian Name', 'Guardian Phone'];
    const rows = filteredBirthdays.map((b) => [
      `"${b.studentNumber}"`,
      `"${b.learnerName}"`,
      `"${b.className}"`,
      `"${b.campusName}"`,
      `"${b.studentType}"`,
      `"${b.dateOfBirth}"`,
      `"${b.turningAge}"`,
      `"${b.guardianName}"`,
      `"${b.guardianPhone}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Legacy_School_Learner_Birthdays_${MONTH_NAMES[birthdayMonthFilter - 1] || 'All'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Learner Birthdays CSV successfully downloaded.');
  };

  return (
    <ModuleGate
      moduleKey="calendar"
      moduleName="School Calendar & Birthdays"
      moduleDescription="Statutory Zambian public holidays, ECZ examination schedules, termly observances, and automated learner birthday SMS greetings."
      planRequired="STARTER"
      pricePerTermZMW={850}
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slide-up">
          <PartyPopper className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-xs font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Top Header & Context Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Calendar className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Academic Calendar & Observances
                </h1>
                <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-black tracking-wider uppercase">
                  2026 Ministry of Education
                </span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded-full text-[10px] font-bold">
                  Republic of Zambia
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Comprehensive statutory holiday tracking, MoE tri-term schedules, ECZ examination windows, and 780 learner birthday celebrations.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportHolidaysCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Holidays (CSV)</span>
          </button>
          <button
            type="button"
            onClick={exportBirthdaysCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg shadow-xs transition"
          >
            <Cake className="w-3.5 h-3.5" />
            <span>Export Birthdays (CSV)</span>
          </button>
        </div>
      </div>

      {/* Quick Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Public Holidays */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Zambia Public Holidays</span>
            <Flag className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">15</span>
            <span className="text-xs text-emerald-700 font-bold">Gazetted Days</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Mandatory school closures under Zambian statutory law.
          </p>
        </div>

        {/* Card 2: Academic Terms */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">MoE 2026 Terms</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">3 Terms</span>
            <span className="text-xs text-blue-700 font-bold">39 Weeks</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            187 scheduled curriculum instruction days across campuses.
          </p>
        </div>

        {/* Card 3: ECZ National Exams */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">ECZ Exam Window</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-900">26 Oct - 27 Nov</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Grade 7, Grade 9 & Grade 12 national certification.
          </p>
        </div>

        {/* Card 4: Learner Birthdays */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Learner Birthdays</span>
            <Cake className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-950">780</span>
            <span className="text-xs text-amber-800 font-bold">
              {todayBirthdaysInfo.count} Celebrating Today!
            </span>
          </div>
          <p className="text-[10px] text-amber-700 mt-1">
            Active birthday celebrations across Urban & Mushitala cohorts.
          </p>
        </div>
      </div>

      {/* Today's Special Celebration Highlight Banner */}
      {todayBirthdaysInfo.count > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-4 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-3 bg-white/20 rounded-xl backdrop-blur-xs">
              <PartyPopper className="w-6 h-6 text-yellow-200" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-100">
                  🎉 Birthday Celebration Today (18 October 2026)
                </span>
                <span className="px-2 py-0.5 bg-white/30 text-white rounded-full text-[10px] font-bold">
                  {todayBirthdaysInfo.count} Pupils
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">
                {todayBirthdaysInfo.birthdays.map((b) => `${b.learnerName} (${b.className}, turning ${b.turningAge})`).join(' • ')}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (todayBirthdaysInfo.birthdays.length > 0) {
                  handleSendSms(todayBirthdaysInfo.birthdays[0]);
                }
              }}
              className="px-4 py-2 bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5 text-amber-700" />
              <span>Send Birthday Blessing SMS</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary Navigation Tabs */}
      <div className="flex items-center border-b border-slate-200 gap-6 text-xs font-bold overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('MONTH_GRID')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'MONTH_GRID'
              ? 'border-emerald-700 text-emerald-800 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Interactive Monthly Grid</span>
          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[10px]">
            {MONTH_NAMES[currentMonth - 1]} {currentYear}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HOLIDAYS')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'HOLIDAYS'
              ? 'border-blue-900 text-blue-900 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Flag className="w-4 h-4 text-blue-600" />
          <span>Zambia Gazetted Public Holidays</span>
          <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">
            15 Statutory Days
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TERMS')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'TERMS'
              ? 'border-purple-800 text-purple-900 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4 text-purple-600" />
          <span>MoE 2026 Academic Terms & ECZ Windows</span>
          <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded text-[10px]">
            3 Terms
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('BIRTHDAYS')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'BIRTHDAYS'
              ? 'border-amber-600 text-amber-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cake className="w-4 h-4 text-amber-600" />
          <span>Learner Birthdays Registry</span>
          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
            780 Learners
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('EVENTS')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'EVENTS'
              ? 'border-indigo-800 text-indigo-900 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>School Events & Galas</span>
          <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded text-[10px]">
            {SCHOOL_EVENTS_2026.length} Events
          </span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: INTERACTIVE MONTHLY CALENDAR GRID */}
      {/* ==================================================================== */}
      {activeTab === 'MONTH_GRID' && (
        <div className="space-y-4">
          {/* Month Controller Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-4 text-xs font-black text-slate-900 tracking-tight min-w-[130px] text-center">
                  {MONTH_NAMES[currentMonth - 1]} {currentYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Jump to Active Demo Month (October / March) */}
              <button
                type="button"
                onClick={() => {
                  setCurrentMonth(10);
                  setCurrentYear(2026);
                }}
                className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition ${
                  currentMonth === 10
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                October (National Prayer & Exams)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentMonth(3);
                  setCurrentYear(2026);
                }}
                className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition ${
                  currentMonth === 3
                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                March (Women's Day & Youth Day)
              </button>
            </div>

            {/* Legend Indicators */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Zambia Public Holiday</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>Instruction School Day</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span>Mid-Term / Vacation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Learner Birthdays (🎂)</span>
              </div>
            </div>
          </div>

          {/* Monthly Calendar Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            {/* Weekday Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-900 text-white text-center py-2.5 text-xs font-black tracking-wider uppercase">
              {WEEKDAY_NAMES.map((w, idx) => (
                <div
                  key={w}
                  className={`${idx === 0 || idx === 6 ? 'text-slate-400' : 'text-white'}`}
                >
                  {w}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="divide-y divide-slate-100">
              {calendarMatrix.map((week, wIdx) => (
                <div key={`w-${wIdx}`} className="grid grid-cols-7 divide-x divide-slate-100 min-h-[105px]">
                  {week.map((day) => {
                    const isSelected = selectedDayCell?.date === day.date;
                    const hasHoliday = !!day.publicHoliday;
                    const hasEvents = day.schoolEvents.length > 0;
                    const hasBirthdays = day.birthdayCount > 0;

                    return (
                      <div
                        key={day.date}
                        onClick={() => setSelectedDayCell(day)}
                        className={`p-1.5 transition relative flex flex-col justify-between cursor-pointer group ${
                          !day.isCurrentMonth
                            ? 'bg-slate-50/60 text-slate-400'
                            : day.isToday
                            ? 'bg-amber-50/80 ring-2 ring-amber-400 ring-inset'
                            : isSelected
                            ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset'
                            : hasHoliday
                            ? 'bg-emerald-50/60 hover:bg-emerald-100/60'
                            : 'bg-white hover:bg-slate-50/90'
                        }`}
                      >
                        {/* Day Header */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-black rounded-full w-5 h-5 flex items-center justify-center ${
                              day.isToday
                                ? 'bg-amber-600 text-white'
                                : hasHoliday
                                ? 'bg-emerald-700 text-white'
                                : day.isCurrentMonth
                                ? 'text-slate-800'
                                : 'text-slate-400'
                            }`}
                          >
                            {day.dayNumber}
                          </span>

                          {/* Quick indicators */}
                          <div className="flex items-center gap-1">
                            {hasHoliday && (
                              <span title={`Zambian Holiday: ${day.publicHoliday?.name}`}>
                                <Flag className="w-3 h-3 text-emerald-700 fill-emerald-100" />
                              </span>
                            )}
                            {hasBirthdays && (
                              <span
                                className="px-1 py-0.2 bg-amber-100 text-amber-800 rounded text-[9px] font-black flex items-center gap-0.5"
                                title={`${day.birthdayCount} Learner Birthdays`}
                              >
                                <Cake className="w-2.5 h-2.5 text-amber-600" />
                                {day.birthdayCount}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Mid Section: Badges / Highlights */}
                        <div className="space-y-1 my-1 overflow-hidden">
                          {/* Public Holiday Pill */}
                          {hasHoliday && (
                            <div className="bg-emerald-700 text-white px-1.5 py-0.5 rounded text-[9px] font-bold leading-tight truncate shadow-xs">
                              🇿🇲 {day.publicHoliday?.name}
                            </div>
                          )}

                          {/* School Event Pill */}
                          {day.schoolEvents.slice(0, 1).map((ev) => (
                            <div
                              key={ev.id}
                              className="bg-indigo-100 text-indigo-900 border border-indigo-200 px-1 py-0.2 rounded text-[9px] font-bold truncate"
                              title={ev.title}
                            >
                              📍 {ev.title}
                            </div>
                          ))}

                          {/* Mid-term break / vacation pill */}
                          {day.isMidTermBreak && (
                            <div className="bg-purple-100 text-purple-800 px-1 py-0.2 rounded text-[9px] font-bold truncate">
                              🏖️ Mid-Term Exeat
                            </div>
                          )}

                          {/* Birthday snippet preview */}
                          {hasBirthdays && (
                            <div className="text-[9px] text-amber-900 font-semibold truncate">
                              🎂 {day.birthdays[0]?.learnerName.split(' ')[0]}
                              {day.birthdayCount > 1 ? ` +${day.birthdayCount - 1}` : ''}
                            </div>
                          )}
                        </div>

                        {/* Bottom Footer: Day Type */}
                        <div className="text-[8px] font-bold text-slate-400 flex items-center justify-between">
                          <span>
                            {hasHoliday
                              ? 'Official Closure'
                              : day.isSchoolDay
                              ? 'School Day'
                              : day.isMidTermBreak
                              ? 'Exeat Break'
                              : day.isVacation
                              ? 'MoE Vacation'
                              : 'Weekend'}
                          </span>
                          {day.isToday && <span className="text-amber-700 font-black">TODAY</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Day Inspection Drawer / Card */}
          {selectedDayCell && (
            <div className="bg-white border-2 border-blue-500 rounded-2xl p-5 shadow-lg space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-blue-100 text-blue-900 rounded-xl">
                    <Calendar className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Day Dossier: {WEEKDAY_NAMES[selectedDayCell.dayOfWeek]},{' '}
                      {selectedDayCell.dayNumber} {MONTH_NAMES[selectedDayCell.month - 1]} {selectedDayCell.year}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Status:{' '}
                      <strong className="text-slate-800">
                        {selectedDayCell.publicHoliday
                          ? 'Mandatory National Closure (Gazetted Public Holiday)'
                          : selectedDayCell.isSchoolDay
                          ? 'Standard Curriculum Teaching Day (Active Roll-Call Required)'
                          : selectedDayCell.isMidTermBreak
                          ? 'Ministry of Education Mid-Term Break (Boarding Exeat)'
                          : selectedDayCell.isVacation
                          ? 'MoE End of Term Vacation'
                          : 'Weekend'}
                      </strong>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDayCell(null)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition"
                >
                  Close Dossier
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Public Holiday Box */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Statutory Zambian Observance
                  </span>
                  {selectedDayCell.publicHoliday ? (
                    <div className="mt-1 space-y-1">
                      <h4 className="text-xs font-black text-emerald-950">
                        🇿🇲 {selectedDayCell.publicHoliday.name}
                      </h4>
                      <p className="text-[11px] text-emerald-800 leading-snug">
                        {selectedDayCell.publicHoliday.significance}
                      </p>
                      <div className="text-[10px] font-semibold text-emerald-700 pt-1 border-t border-emerald-200">
                        Closure: <strong>Mandatory Gazetted Closure</strong>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-700/80 italic mt-1">
                      No statutory public holiday gazetted on this date.
                    </p>
                  )}
                </div>

                {/* School Events Box */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">
                    Institutional Schedule & Events
                  </span>
                  {selectedDayCell.schoolEvents.length > 0 ? (
                    <div className="mt-1 space-y-2">
                      {selectedDayCell.schoolEvents.map((ev) => (
                        <div key={ev.id} className="text-[11px]">
                          <strong className="text-indigo-950 font-bold block">{ev.title}</strong>
                          <span className="text-indigo-800 text-[10px] block">
                            🕒 {ev.time} • 📍 {ev.location}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-indigo-700/80 italic mt-1">
                      Standard timetable. No major extra-curricular events scheduled.
                    </p>
                  )}
                </div>

                {/* Birthdays on this day */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                      Learner Birthdays ({selectedDayCell.birthdayCount})
                    </span>
                    <Cake className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  {selectedDayCell.birthdayCount > 0 ? (
                    <div className="mt-1 space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {selectedDayCell.birthdays.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between text-[11px] bg-white p-1.5 rounded-lg border border-amber-200"
                        >
                          <div>
                            <span className="font-bold text-slate-800 block">{b.learnerName}</span>
                            <span className="text-[10px] text-slate-500">
                              {b.className} • Turning {b.turningAge}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSendSms(b)}
                            className="p-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold transition"
                            title="Send SMS Birthday Greeting"
                          >
                            <Send className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-700/80 italic mt-1">
                      No learner birthdays on this calendar date.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: ZAMBIA GAZETTED PUBLIC HOLIDAYS REGISTRY (ENTERPRISE TABLE) */}
      {/* ==================================================================== */}
      {activeTab === 'HOLIDAYS' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-bold text-slate-700">Category:</span>
                <select
                  value={holidayCategoryFilter}
                  onChange={(e) => setHolidayCategoryFilter(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden"
                >
                  <option value="ALL">All Categories (15 Holidays)</option>
                  <option value="FOUNDATIONAL">Foundational National</option>
                  <option value="RELIGIOUS">Religious Observances</option>
                  <option value="NATIONAL_HERITAGE">National Heritage & Unity</option>
                  <option value="WORKERS_AND_YOUTH">Workers, Women & Youth</option>
                </select>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search holiday name, day..."
                  value={holidaySearch}
                  onChange={(e) => setHolidaySearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden w-60 font-semibold"
                />
              </div>
            </div>

            <div className="text-xs text-slate-500 font-semibold">
              Showing <strong className="text-slate-800">{filteredHolidays.length}</strong> of 15 statutory holidays
            </div>
          </div>

          {/* Enterprise Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-black text-[11px] tracking-wider uppercase">
                  <tr>
                    <th className="py-3 px-4">Zambian Gazetted Holiday</th>
                    <th className="py-3 px-4">Official Date (2026)</th>
                    <th className="py-3 px-4">Day of Week</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">School Closure Mandate</th>
                    <th className="py-3 px-4">Significance & Statutory Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                  {filteredHolidays.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <Flag className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{h.name}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {h.date}
                        </span>
                        {h.observedDate && (
                          <span className="block text-[10px] text-amber-700 mt-0.5">
                            Observed: {h.observedDate}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{h.dayOfWeek}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            h.category === 'FOUNDATIONAL'
                              ? 'bg-purple-100 text-purple-900'
                              : h.category === 'RELIGIOUS'
                              ? 'bg-amber-100 text-amber-900'
                              : h.category === 'NATIONAL_HERITAGE'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-blue-100 text-blue-900'
                          }`}
                        >
                          {h.category.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Mandatory School Closure
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-md">
                        <p className="font-semibold text-slate-800 leading-snug">{h.significance}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{h.historicalContext}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: MoE 2026 ACADEMIC TERMS & EXAMINATION WINDOWS */}
      {/* ==================================================================== */}
      {activeTab === 'TERMS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ACADEMIC_TERMS_2026.map((term) => (
              <div
                key={term.termNumber}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                      MoE Academic Term {term.termNumber}
                    </span>
                    <h3 className="text-base font-black text-slate-900">{term.termLabel}</h3>
                  </div>
                  <span className="p-2 bg-blue-50 text-blue-800 rounded-xl font-black text-sm">
                    {term.teachingWeeks} Wks
                  </span>
                </div>

                {/* Term Dates */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Term Opens:</span>
                    <strong className="text-slate-900 font-bold">{term.startDate}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Term Closes:</span>
                    <strong className="text-slate-900 font-bold">{term.endDate}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Teaching Days:</span>
                    <strong className="text-blue-900 font-bold">{term.totalTeachingDays} Days</strong>
                  </div>
                </div>

                {/* Mid-term Break Box */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-xs">
                  <div className="flex items-center gap-1.5 text-purple-900 font-black text-[11px] mb-1">
                    <Clock className="w-3.5 h-3.5 text-purple-700" />
                    <span>Mid-Term Break (Exeat)</span>
                  </div>
                  <div className="text-purple-800 font-bold">
                    {term.midTermBreak.startDate} to {term.midTermBreak.endDate}
                  </div>
                  <p className="text-[10px] text-purple-700 mt-0.5">{term.midTermBreak.description}</p>
                </div>

                {/* ECZ Exam Window (Term 3) */}
                {term.eczExamWindow && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-900 font-black text-[11px] mb-1">
                      <Award className="w-3.5 h-3.5 text-amber-700" />
                      <span>National ECZ Examination Period</span>
                    </div>
                    <div className="text-amber-800 font-bold">
                      {term.eczExamWindow.startDate} to {term.eczExamWindow.endDate}
                    </div>
                    <p className="text-[10px] text-amber-700 mt-0.5">{term.eczExamWindow.description}</p>
                  </div>
                )}

                {/* Vacation Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                  <div className="text-slate-700 font-bold text-[11px]">
                    🏖️ End of Term Vacation: {term.vacation.weeks} Weeks
                  </div>
                  <div className="text-slate-500 text-[10px] mt-0.5">
                    {term.vacation.startDate} to {term.vacation.endDate}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Curriculum Integrity Callout */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                <CheckCircle2 className="w-6 h-6" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Full Compliance with Examinations Council of Zambia (ECZ) Directives
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Term schedules include mandatory 60+ instructional days per term to satisfy national syllabus pacing for Grade 7, Grade 9, and Grade 12 candidates.
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-3 py-1.5 rounded-lg border border-emerald-800">
                Solwezi District Pacing Validated
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: LEARNER BIRTHDAYS REGISTRY (780 LEARNERS) */}
      {/* ==================================================================== */}
      {activeTab === 'BIRTHDAYS' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Month Selector */}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-bold text-slate-700">Month:</span>
                <select
                  value={birthdayMonthFilter}
                  onChange={(e) => setBirthdayMonthFilter(parseInt(e.target.value, 10))}
                  className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden"
                >
                  <option value={0}>All Months (780 Learners)</option>
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Classroom Filter */}
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-bold text-slate-700">Class:</span>
                <select
                  value={birthdayClassFilter}
                  onChange={(e) => setBirthdayClassFilter(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden max-w-[180px]"
                >
                  <option value="ALL">All Classes</option>
                  {distinctClasses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search learner, guardian..."
                  value={birthdaySearch}
                  onChange={(e) => setBirthdaySearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden w-56 font-semibold"
                />
              </div>
            </div>

            <div className="text-xs text-slate-500 font-semibold">
              Showing <strong className="text-slate-800">{filteredBirthdays.length}</strong> birthdays in selection
            </div>
          </div>

          {/* Birthday Roster Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-black text-[11px] tracking-wider uppercase">
                  <tr>
                    <th className="py-3 px-4">Learner Identity</th>
                    <th className="py-3 px-4">Class & Campus</th>
                    <th className="py-3 px-4">Birth Date</th>
                    <th className="py-3 px-4">Turning Age</th>
                    <th className="py-3 px-4">Enrollment Type</th>
                    <th className="py-3 px-4">Guardian Contact</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                  {filteredBirthdays.map((b) => {
                    const isCelebratedToday = b.birthMonth === 10 && b.birthDay === 18;

                    return (
                      <tr
                        key={b.id}
                        className={`transition ${
                          isCelebratedToday ? 'bg-amber-50 hover:bg-amber-100/60 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-amber-100 text-amber-800 rounded-full font-bold">
                              <Cake className="w-3.5 h-3.5" />
                            </span>
                            <div>
                              <strong className="text-slate-900 block">{b.learnerName}</strong>
                              <span className="text-[10px] text-slate-400 font-mono">{b.studentNumber}</span>
                            </div>
                            {isCelebratedToday && (
                              <span className="px-1.5 py-0.2 bg-amber-600 text-white rounded text-[9px] font-black uppercase">
                                Today!
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <strong className="text-slate-800 block">{b.className}</strong>
                          <span className="text-[10px] text-slate-500">{b.campusName}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          {b.birthDay} {MONTH_NAMES[b.birthMonth - 1]}
                          <span className="block text-[10px] text-slate-400 font-normal">Born: {b.dateOfBirth}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-900">
                            {b.turningAge} Years
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              b.studentType === 'BOARDER'
                                ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {b.studentType === 'BOARDER' ? 'Boarder' : 'Day Scholar'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <strong className="text-slate-800 block">{b.guardianName}</strong>
                          <span className="text-[10px] text-blue-700 font-mono flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" />
                            {b.guardianPhone}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleSendSms(b)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-lg shadow-xs transition"
                          >
                            <Send className="w-3 h-3" />
                            <span>Wish (SMS)</span>
                          </button>
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

      {/* ==================================================================== */}
      {/* TAB 5: SCHOOL EVENTS & GALAS */}
      {/* ==================================================================== */}
      {activeTab === 'EVENTS' && (
        <div className="space-y-4">
          {/* Event Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-bold text-slate-700">Category:</span>
                <select
                  value={eventCategoryFilter}
                  onChange={(e) => setEventCategoryFilter(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden"
                >
                  <option value="ALL">All Categories</option>
                  <option value="ACADEMIC">Academic & Science Fairs</option>
                  <option value="SPORTS">Sports & Athletics</option>
                  <option value="CEREMONY">Speech Days & Ceremonies</option>
                  <option value="PASTORAL">Pastoral & National Prayers</option>
                  <option value="COMMUNITY_PTA">PTA & Community</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-bold text-slate-700">Campus:</span>
                <select
                  value={eventCampusFilter}
                  onChange={(e) => setEventCampusFilter(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden"
                >
                  <option value="ALL">All Campuses</option>
                  <option value="Mushitala">Mushitala Campus (Secondary & Boarding)</option>
                  <option value="Urban">Urban Campus (ECE & Primary)</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-semibold">
              Showing <strong className="text-slate-800">{filteredEvents.length}</strong> scheduled events
            </div>
          </div>

          {/* Events Timeline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-900">
                    {ev.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    📅 {ev.date}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">{ev.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ev.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <span>
                    🕒 <strong>{ev.time}</strong>
                  </span>
                  <span>
                    📍 <strong>{ev.location}</strong>
                  </span>
                  <span>
                    👥 Audience: <strong>{ev.audience}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SMS BIRTHDAY GREETING MODAL */}
      {/* ==================================================================== */}
      {smsModalLearner && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Cake className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Send Birthday Blessing SMS
                  </h3>
                  <p className="text-xs text-slate-500">
                    {smsModalLearner.learnerName} ({smsModalLearner.className}) • Turning {smsModalLearner.turningAge}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSmsModalLearner(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Recipient Details */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient Guardian:</span>
                <strong className="text-slate-800">{smsModalLearner.guardianName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Guardian Mobile Phone:</span>
                <strong className="text-blue-900 font-mono">{smsModalLearner.guardianPhone}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Campus:</span>
                <span className="text-slate-700">{smsModalLearner.campusName}</span>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Personalised Birthday Message (Zambia Telecel / Airtel SMS Gateway):
              </label>
              <textarea
                rows={4}
                value={smsCustomMessage}
                onChange={(e) => setSmsCustomMessage(e.target.value)}
                className="w-full text-xs font-medium border border-slate-300 rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800 leading-relaxed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Standard SMS billing applied via Legacy School Solwezi airtime credit account.
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSmsModalLearner(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSendSms}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit SMS Blessing</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </ModuleGate>
  );
}
