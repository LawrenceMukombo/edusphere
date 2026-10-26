'use client';

import { useState, useEffect } from 'react';
import {
  CalendarDays,
  X,
  Check,
  Trash2,
  MapPin,
  Users,
  Clock,
  Calendar as CalendarIcon,
  Tag,
  FileText,
  AlertCircle,
  Sparkles,
  Download,
  Printer,
  ChevronRight,
} from 'lucide-react';

export interface AcademicEventRecord {
  id: string;
  title: string;
  category: 'ACADEMIC' | 'CLINICAL' | 'EXAMINATION' | 'COUNCIL';
  startDate: string;
  endDate: string;
  location: string;
  targetCohorts: string;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
  description: string;
}

interface CalendarEventCrudModalProps {
  event: AcademicEventRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: AcademicEventRecord) => void;
  onDelete?: (id: string) => void;
  mode: 'CREATE' | 'EDIT';
}

export function CalendarEventCrudModal({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
  mode,
}: CalendarEventCrudModalProps) {
  const [formData, setFormData] = useState<AcademicEventRecord>({
    id: '',
    title: '',
    category: 'ACADEMIC',
    startDate: '',
    endDate: '',
    location: '',
    targetCohorts: '',
    status: 'UPCOMING',
    description: '',
  });

  const [activeTab, setActiveTab] = useState<'DETAILS' | 'PREVIEW'>('DETAILS');

  useEffect(() => {
    if (event) {
      setFormData(event);
    } else {
      setFormData({
        id: `EVT-${Date.now()}`,
        title: '',
        category: 'ACADEMIC',
        startDate: new Date().toLocaleDateString('en-GB'),
        endDate: new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-GB'),
        location: 'Manyama Main Campus',
        targetCohorts: 'All Registered Programmes',
        status: 'UPCOMING',
        description: '',
      });
    }
  }, [event, isOpen]);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(formData);
    onClose();
  }

  function handlePrintCircular() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl transition-all sm:p-8 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-800">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                North Western University College • Academic Affairs
              </span>
              <h3 className="text-lg font-black text-slate-900">
                {mode === 'CREATE' ? 'Schedule New Academic Event' : 'Manage Timetable Event & Notice'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="mt-4 flex gap-2 border-b border-slate-100 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('DETAILS')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'DETAILS'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Event Specifications & Scheduling
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PREVIEW')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'PREVIEW'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Official Calendar Notice Slip
          </button>
        </div>

        {activeTab === 'DETAILS' ? (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Event Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Continuous Assessment 2 (Theory & Practical OSCE Stations)"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Academic Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
                >
                  <option value="ACADEMIC">ACADEMIC (Orientation, Lectures, Term Dates)</option>
                  <option value="CLINICAL">CLINICAL (Hospital Rotations, Lab Pre-Clinical)</option>
                  <option value="EXAMINATION">EXAMINATION (CBT, OSCE, End-of-Semester)</option>
                  <option value="COUNCIL">COUNCIL (NMCZ / HPCZ Indexing & Audits)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Event Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
                >
                  <option value="UPCOMING">UPCOMING (Scheduled on Timetable)</option>
                  <option value="IN_PROGRESS">IN_PROGRESS (Currently Active)</option>
                  <option value="COMPLETED">COMPLETED (Concluded & Logged)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Start Date</label>
                <input
                  type="text"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  placeholder="DD/MM/YYYY"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">End Date</label>
                <input
                  type="text"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  placeholder="DD/MM/YYYY"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Venue / Location</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Manyama Main Campus CBT Hall"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Target Cohorts</label>
                <input
                  type="text"
                  required
                  value={formData.targetCohorts}
                  onChange={(e) => setFormData({ ...formData, targetCohorts: e.target.value })}
                  placeholder="e.g. Year 1 Nursing, Year 2 Clinical Medicine"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Detailed Operational Description & Circular Directive
              </label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Include mandatory student requirements, clearance prerequisite thresholds (e.g. 85% attendance, 100% fee payment), or logbook submission deadlines."
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              {mode === 'EDIT' && onDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Remove event "${formData.title}" from institutional calendar?`)) {
                      onDelete(formData.id);
                      onClose();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                >
                  <Trash2 className="h-4 w-4" /> Remove Event
                </button>
              ) : (
                <div></div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-cyan-800 transition"
                >
                  <Check className="h-4 w-4" /> Save Academic Event
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6">
              <div className="text-center border-b border-slate-200 pb-4">
                <p className="text-[10px] font-black tracking-widest uppercase text-cyan-800">
                  NORTH WESTERN UNIVERSITY COLLEGE OF HEALTH AND APPLIED SCIENCES
                </p>
                <p className="text-xs text-slate-500">P.O. Box 110244, Manyama Campus, Solwezi Road, North-Western Province</p>
                <h4 className="mt-3 text-base font-black text-slate-900">{formData.title}</h4>
                <div className="mt-2 inline-flex items-center gap-2">
                  <span className="rounded-md border border-cyan-200 bg-white px-2 py-0.5 text-xs font-bold text-cyan-800">
                    Category: {formData.category}
                  </span>
                  <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700">
                    Status: {formData.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold text-slate-500 uppercase text-[10px]">Date Range</p>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {formData.startDate} to {formData.endDate}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-slate-500 uppercase text-[10px]">Location / Venue</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{formData.location}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-500 uppercase text-[10px]">Target Cohorts</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{formData.targetCohorts}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-500 uppercase text-[10px]">Authority</p>
                  <p className="font-semibold text-slate-900 mt-0.5">Office of the Academic Registrar</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-white p-4 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <p className="font-bold text-slate-900 mb-1">Administrative Note / Circular Directive:</p>
                {formData.description || 'No additional note specified.'}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrintCircular}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
              >
                <Printer className="h-4 w-4 text-slate-500" /> Print Calendar Circular
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
