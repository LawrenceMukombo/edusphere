'use client';

import { useState, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle2,
  Calendar as CalendarIcon,
  Filter,
  Plus,
  BookOpen,
  Award,
  ShieldCheck,
  Stethoscope,
  Search,
  SlidersHorizontal,
  ChevronRight,
  AlertCircle,
  FileText,
  Building,
} from 'lucide-react';
import { CalendarEventCrudModal, AcademicEventRecord } from '../calendar/CalendarEventCrudModal';

interface CalendarConsoleProps {
  initialRecords?: any[];
}

function parseCalendarRecords(records: any[]): AcademicEventRecord[] {
  if (!records || records.length === 0) return [];
  return records.map((r) => {
    try {
      if (r.metadataJson) {
        const p = JSON.parse(r.metadataJson);
        return {
          id: r.id,
          title: p.title || r.title,
          category: p.category || 'ACADEMIC',
          startDate: p.startDate || '12/01/2026',
          endDate: p.endDate || '16/01/2026',
          location: p.location || 'Manyama Campus',
          targetCohorts: p.targetCohorts || 'All Registered Programmes',
          status: p.status || r.status || 'UPCOMING',
          description: p.description || r.summary,
        };
      }
    } catch (e) {}
    return {
      id: r.id,
      title: r.title,
      category: 'ACADEMIC',
      startDate: '12/01/2026',
      endDate: '16/01/2026',
      location: 'Manyama Main Campus',
      targetCohorts: 'All Programmes',
      status: (r.status as any) || 'UPCOMING',
      description: r.summary,
    };
  });
}

export function CalendarConsole({ initialRecords = [] }: CalendarConsoleProps) {
  const [events, setEvents] = useState<AcademicEventRecord[]>(() => parseCalendarRecords(initialRecords));
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notice, setNotice] = useState<string>('');

  // CRUD Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('EDIT');
  const [selectedEvent, setSelectedEvent] = useState<AcademicEventRecord | null>(null);

  // Client-side fallback fetch from database if page loaded without SSR props
  useEffect(() => {
    if (events.length === 0) {
      fetch('/api/modules/calendar')
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setEvents(parseCalendarRecords(json.data));
          }
        })
        .catch((err) => console.error('[CalendarConsole] API error:', err));
    }
  }, []);

  const filteredEvents = events.filter((e) => {
    const matchesCat = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || e.status === selectedStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      e.title.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      e.targetCohorts.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q);
    return matchesCat && matchesStatus && matchesQuery;
  });

  function handleOpenCreate() {
    setSelectedEvent(null);
    setModalMode('CREATE');
    setModalOpen(true);
  }

  function handleOpenEdit(event: AcademicEventRecord) {
    setSelectedEvent(event);
    setModalMode('EDIT');
    setModalOpen(true);
  }

  async function handleSaveEvent(saved: AcademicEventRecord) {
    if (modalMode === 'CREATE') {
      try {
        const res = await fetch('/api/modules/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: saved.title,
            status: saved.status,
            summary: saved.description,
            metadataJson: JSON.stringify(saved),
          }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          saved.id = json.data.id;
        }
      } catch (e) {
        console.error('Failed to persist created event:', e);
      }
      setEvents([saved, ...events]);
      setNotice(`New academic event "${saved.title}" scheduled and saved to database.`);
    } else {
      try {
        await fetch('/api/modules/calendar', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: saved.id,
            title: saved.title,
            status: saved.status,
            summary: saved.description,
            metadataJson: JSON.stringify(saved),
          }),
        });
      } catch (e) {
        console.error('Failed to persist updated event:', e);
      }
      setEvents(events.map((e) => (e.id === saved.id ? saved : e)));
      setNotice(`Academic event "${saved.title}" updated.`);
    }
    setTimeout(() => setNotice(''), 5000);
  }

  async function handleDeleteEvent(id: string) {
    try {
      await fetch(`/api/modules/calendar?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete event:', e);
    }
    setEvents(events.filter((e) => e.id !== id));
    setNotice('Event removed from academic timetable.');
    setTimeout(() => setNotice(''), 5000);
  }

  return (
    <div className="mt-8 space-y-6">
      {notice && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 shadow-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-xs font-bold">{notice}</p>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Academic Year</p>
          <p className="mt-2 text-2xl font-black text-slate-900">2026 Session</p>
          <span className="mt-2 inline-flex items-center text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-600" /> Semester 1 In Progress
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Upcoming Exam Windows</p>
          <p className="mt-2 text-2xl font-black text-rose-800">3 Summative</p>
          <span className="mt-2 inline-flex items-center text-xs text-slate-600">
            <Award className="mr-1 h-3.5 w-3.5 text-rose-600" /> OSCE Circuit & Theory CBT
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Clinical Placements</p>
          <p className="mt-2 text-2xl font-black text-cyan-800">Active Rotations</p>
          <span className="mt-2 inline-flex items-center text-xs text-slate-600">
            <Stethoscope className="mr-1 h-3.5 w-3.5 text-cyan-700" /> Solwezi Gen Hospital & Manyama RHC
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Statutory Compliance</p>
          <p className="mt-2 text-2xl font-black text-amber-800">NMCZ & HPCZ</p>
          <span className="mt-2 inline-flex items-center text-xs text-slate-600">
            <ShieldCheck className="mr-1 h-3.5 w-3.5 text-amber-600" /> 100% Calendar Curricula Aligned
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'ACADEMIC', 'CLINICAL', 'EXAMINATION', 'COUNCIL'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-700 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'ALL'
                ? 'All Timetables'
                : cat === 'ACADEMIC'
                ? 'Academic'
                : cat === 'CLINICAL'
                ? 'Clinical Rotations'
                : cat === 'EXAMINATION'
                ? 'Examinations & OSCE'
                : 'Council Indexing'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event, venue, cohort…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-cyan-600"
            />
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-cyan-800 transition"
          >
            <Plus className="h-4 w-4" /> Schedule Academic Event
          </button>
        </div>
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        Click any calendar milestone to inspect directives, edit dates, update examination venue, or print notice slip
      </p>

      {/* Timeline List (Clickable cards) */}
      <div className="space-y-3">
        {filteredEvents.map((evt) => (
          <article
            key={evt.id}
            onClick={() => handleOpenEdit(evt)}
            className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-cyan-300 hover:shadow-md transition group"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                {/* Date Box */}
                <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center sm:w-36">
                  <CalendarIcon className="h-4 w-4 text-cyan-700" />
                  <span className="mt-1 font-mono text-xs font-bold text-slate-900">{evt.startDate}</span>
                  <span className="text-[10px] text-slate-400 font-medium">to</span>
                  <span className="font-mono text-xs font-bold text-slate-700">{evt.endDate}</span>
                </div>

                {/* Details */}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        evt.category === 'EXAMINATION'
                          ? 'border border-rose-200 bg-rose-50 text-rose-800'
                          : evt.category === 'CLINICAL'
                          ? 'border border-cyan-200 bg-cyan-50 text-cyan-800'
                          : evt.category === 'COUNCIL'
                          ? 'border border-amber-200 bg-amber-50 text-amber-800'
                          : 'border border-slate-200 bg-slate-100 text-slate-800'
                      }`}
                    >
                      {evt.category}
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        evt.status === 'COMPLETED'
                          ? 'border border-slate-200 bg-slate-100 text-slate-600'
                          : evt.status === 'IN_PROGRESS'
                          ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 animate-pulse'
                          : 'border border-cyan-200 bg-cyan-50 text-cyan-800'
                      }`}
                    >
                      {evt.status === 'COMPLETED'
                        ? 'Completed'
                        : evt.status === 'IN_PROGRESS'
                        ? 'In Progress'
                        : 'Scheduled'}
                    </span>
                  </div>

                  <h3 className="mt-2 text-base font-bold text-slate-900 group-hover:text-cyan-800 transition">
                    {evt.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-3xl">{evt.description}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-cyan-700" /> {evt.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-cyan-700" /> Cohort: {evt.targetCohorts}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex shrink-0 items-center sm:self-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEdit(evt);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50/70 px-3 py-1.5 text-xs font-bold text-cyan-800 hover:bg-cyan-100 transition shadow-xs"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-cyan-700" /> Manage Event
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* CRUD Modal */}
      <CalendarEventCrudModal
        event={selectedEvent}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        mode={modalMode}
      />
    </div>
  );
}
