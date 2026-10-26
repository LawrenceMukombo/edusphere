'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Flag,
  Calendar,
  Check,
  ShieldCheck,
  AlertCircle,
  Sun,
  School,
} from 'lucide-react';
import { ZambianHoliday } from '@/lib/zambianHolidays';
import { formatCleanEnum } from '@/lib/formatters';

interface PublicHolidayManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  holidays: ZambianHoliday[];
  onSaveHoliday: (holiday: ZambianHoliday) => void;
  onDeleteHoliday: (holidayId: string) => void;
  onResetDefaults: () => void;
  canEdit: boolean;
}

export function PublicHolidayManagerModal({
  isOpen,
  onClose,
  holidays,
  onSaveHoliday,
  onDeleteHoliday,
  onResetDefaults,
  canEdit,
}: PublicHolidayManagerModalProps) {
  const [editingHoliday, setEditingHoliday] = useState<ZambianHoliday | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  // Form state
  const [name, setName] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [observedDate, setObservedDate] = useState<string>('');
  const [category, setCategory] = useState<ZambianHoliday['category']>('NATIONAL_HERITAGE');
  const [significance, setSignificance] = useState<string>('');
  const [isSchoolClosure, setIsSchoolClosure] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  if (!isOpen) return null;

  function openEdit(h: ZambianHoliday) {
    if (!canEdit) return;
    setEditingHoliday(h);
    setIsAddingNew(false);
    setName(h.name);
    setDate(h.date);
    setObservedDate(h.observedDate || '');
    setCategory(h.category);
    setSignificance(h.significance);
    setIsSchoolClosure(h.isSchoolClosure || h.category === 'SCHOOL_RECESS' || h.category === 'SHORT_HOLIDAY' || h.category === 'TERM_BREAK');
    setFormError('');
  }

  function openAddNewHoliday() {
    if (!canEdit) return;
    setEditingHoliday(null);
    setIsAddingNew(true);
    setName('');
    setDate('2026-10-25');
    setObservedDate('');
    setCategory('NATIONAL_HERITAGE');
    setIsSchoolClosure(false);
    setSignificance('Gazetted statutory public holiday under Chapter 7 of the Laws of Zambia.');
    setFormError('');
  }

  function openAddNewSchoolClosing() {
    if (!canEdit) return;
    setEditingHoliday(null);
    setIsAddingNew(true);
    setName('Term 3 Mid-Term Short Holiday & Recess');
    setDate('2026-10-26');
    setObservedDate('');
    setCategory('SCHOOL_RECESS');
    setIsSchoolClosure(true);
    setSignificance('Official college closing date for student mid-term short recess and clinical faculty moderation.');
    setFormError('');
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Holiday or school closing title is required.');
      return;
    }
    if (!date) {
      setFormError('Date is required.');
      return;
    }

    const dObj = new Date(date);
    const dayOfWeek = dObj.toLocaleDateString('en-US', { weekday: 'long' });

    const closure = isSchoolClosure || category === 'SCHOOL_RECESS' || category === 'SHORT_HOLIDAY' || category === 'TERM_BREAK';

    const holidayToSave: ZambianHoliday = {
      id: editingHoliday ? editingHoliday.id : `nwuc-${Date.now()}`,
      name: name.trim(),
      date,
      dayOfWeek,
      observedDate: observedDate ? observedDate : undefined,
      category,
      isSchoolClosure: closure,
      significance: significance.trim() || (closure ? 'Official college closing date for short recess.' : 'Official gazetted holiday.'),
    };

    onSaveHoliday(holidayToSave);
    setIsAddingNew(false);
    setEditingHoliday(null);
    setFormError('');
  }

  function handleCancelForm() {
    setIsAddingNew(false);
    setEditingHoliday(null);
    setFormError('');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white text-slate-800 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-teal-100 text-[#007B99]">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Public Holidays & School Closing Dates (Short Holidays / Recess)
              </h2>
              <p className="text-xs text-slate-500">
                Chapter 7 Laws of Zambia & NWUCHAS Institutional Academic Calendar
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canEdit && (
              <>
                <button
                  type="button"
                  onClick={openAddNewSchoolClosing}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#8DC63F] px-3 py-1.5 text-xs font-bold text-slate-950 shadow-xs hover:bg-[#72a330] transition"
                  title="Define school closing dates for short holidays or recess"
                >
                  <School className="h-4 w-4" /> Add School Closing / Recess
                </button>
                <button
                  type="button"
                  onClick={openAddNewHoliday}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#007B99] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#00627a] transition"
                >
                  <Plus className="h-4 w-4" /> Add Public Holiday
                </button>
                <button
                  type="button"
                  onClick={onResetDefaults}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                  title="Reset to 2026 Zambian Gazetted statutory default dates"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-slate-500" /> Defaults
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Add / Edit Form Card */}
          {(isAddingNew || editingHoliday) && (
            <div className="rounded-xl border-2 border-[#007B99]/30 bg-sky-50/40 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-[#0b2545] flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#007B99]" />
                  {editingHoliday
                    ? `Edit Entry: ${editingHoliday.name}`
                    : isSchoolClosure
                    ? 'Define School Closing Date for Short Holiday / Recess'
                    : 'Add New Statutory Public Holiday'}
                </h3>
                <span className="text-xs text-[#007B99] font-bold">
                  Academic Registrar Clearance
                </span>
              </div>

              {formError && (
                <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-800">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Title / Occasion Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Term 3 Short Holiday, Mid-Term Recess, Independence Day"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-[#007B99] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Category & Closure Type
                    </label>
                    <select
                      value={category}
                      onChange={(e: any) => {
                        const val = e.target.value;
                        setCategory(val);
                        if (val === 'SCHOOL_RECESS' || val === 'SHORT_HOLIDAY' || val === 'TERM_BREAK') {
                          setIsSchoolClosure(true);
                        }
                      }}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-[#007B99] focus:outline-none"
                    >
                      <option value="SCHOOL_RECESS">🏫 School Closing Date (Mid-Term / Short Recess)</option>
                      <option value="SHORT_HOLIDAY">🏖️ Short Holiday / Break</option>
                      <option value="TERM_BREAK">📅 Term Vacation / End-of-Term Closure</option>
                      <option value="NATIONAL_HERITAGE">National Heritage & Freedom</option>
                      <option value="RELIGIOUS">Religious Observance</option>
                      <option value="WORKERS_AND_YOUTH">Workers & Youth</option>
                      <option value="FOUNDATIONAL">Foundational National Commemoration</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Calendar Date *
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-[#007B99] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Observed Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={observedDate}
                      onChange={(e) => setObservedDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-[#007B99] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chkSchoolClosure"
                    checked={isSchoolClosure}
                    onChange={(e) => setIsSchoolClosure(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#007B99] focus:ring-[#007B99]"
                  />
                  <label htmlFor="chkSchoolClosure" className="text-xs font-bold text-slate-700 cursor-pointer">
                    College Closure / Short Holiday: Suspend didactic lectures and mark student attendance registers as "Recess / School Closed"
                  </label>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Significance & Administrative Directive
                  </label>
                  <textarea
                    rows={2}
                    value={significance}
                    onChange={(e) => setSignificance(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-[#007B99] focus:outline-none"
                    placeholder="Brief description of the closure or statutory holiday significance..."
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#007B99] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#00627a] transition"
                  >
                    <Check className="h-4 w-4" /> Save Schedule Entry
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Table of Gazetted Holidays and School Closing Dates */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="py-3 px-4">Date & Occasion</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Significance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {holidays.map((h) => {
                  const isClosure = h.isSchoolClosure || h.category === 'SCHOOL_RECESS' || h.category === 'SHORT_HOLIDAY' || h.category === 'TERM_BREAK';
                  return (
                    <tr key={h.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900">
                            {isClosure ? '🏫' : '🇿🇲'} {h.name}
                          </span>
                          {h.observedDate && (
                            <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold text-[#007B99] border border-[#007B99]/30">
                              Observed: {h.observedDate}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {h.date} ({h.dayOfWeek})
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {isClosure ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-0.5 text-[10px] font-extrabold">
                            <School className="h-3 w-3" /> School Closing / Recess
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 text-[#007B99] border border-[#007B99]/30 px-2.5 py-0.5 text-[10px] font-extrabold">
                            <Flag className="h-3 w-3" /> Statutory Holiday
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {formatCleanEnum(h.category)}
                      </td>

                      <td className="py-3 px-3 text-[11px] text-slate-600 max-w-xs">
                        {h.significance}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {canEdit && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEdit(h)}
                              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                              title="Edit date entry"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteHoliday(h.id)}
                              className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                              title="Delete date entry"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3">
          <span className="text-xs text-slate-500">
            {holidays.length} configured dates • When school closing dates are defined, attendance registers automatically reflect institutional recess.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
