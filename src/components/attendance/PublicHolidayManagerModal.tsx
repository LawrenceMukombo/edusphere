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
} from 'lucide-react';
import { ZambianHoliday } from '@/lib/zambianHolidays';

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
  const [category, setCategory] = useState<'NATIONAL_HERITAGE' | 'RELIGIOUS' | 'WORKERS_AND_YOUTH' | 'FOUNDATIONAL'>('NATIONAL_HERITAGE');
  const [significance, setSignificance] = useState<string>('');
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
    setFormError('');
  }

  function openAddNew() {
    if (!canEdit) return;
    setEditingHoliday(null);
    setIsAddingNew(true);
    setName('');
    setDate('2026-10-25');
    setObservedDate('');
    setCategory('NATIONAL_HERITAGE');
    setSignificance('Gazetted statutory public holiday under Chapter 7 of the Laws of Zambia.');
    setFormError('');
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Holiday name is required.');
      return;
    }
    if (!date) {
      setFormError('Date is required.');
      return;
    }

    const dObj = new Date(date);
    const dayOfWeek = dObj.toLocaleDateString('en-US', { weekday: 'long' });

    const holidayToSave: ZambianHoliday = {
      id: editingHoliday ? editingHoliday.id : `zm-${Date.now()}`,
      name: name.trim(),
      date,
      dayOfWeek,
      observedDate: observedDate ? observedDate : undefined,
      category,
      significance: significance.trim() || 'Official gazetted holiday.',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white text-slate-800 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-purple-100 text-purple-700">
              <Flag className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Gazetted Statutory Public Holidays Management
              </h2>
              <p className="text-xs text-slate-500">
                Chapter 7 of Laws of Zambia • Aligned with Ministry of Education & Council Calendars
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <>
                <button
                  type="button"
                  onClick={openAddNew}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-purple-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-purple-800 transition"
                >
                  <Plus className="h-4 w-4" /> Add Public Holiday
                </button>
                <button
                  type="button"
                  onClick={onResetDefaults}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-slate-500" /> Reset Statutory Defaults
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
            <div className="rounded-xl border-2 border-purple-200 bg-purple-50/50 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-purple-950 flex items-center gap-2">
                  <Flag className="h-4 w-4 text-purple-700" />
                  {editingHoliday ? `Edit Holiday: ${editingHoliday.name}` : 'Add New Gazetted Public Holiday'}
                </h3>
                <span className="text-xs text-purple-800 font-semibold">
                  Required Permissions: Academic Registrar / Dean
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
                      Holiday Official Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Independence Day, Youth Day"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-purple-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Holiday Category
                    </label>
                    <select
                      value={category}
                      onChange={(e: any) => setCategory(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-purple-600 focus:outline-none"
                    >
                      <option value="NATIONAL_HERITAGE">National Heritage & Freedom</option>
                      <option value="RELIGIOUS">Religious Observance</option>
                      <option value="WORKERS_AND_YOUTH">Workers & Youth</option>
                      <option value="FOUNDATIONAL">Foundational National Commemoration</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Statutory Calendar Date *
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-purple-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Observed Date (If Weekend Fallback)
                    </label>
                    <input
                      type="date"
                      placeholder="Optional"
                      value={observedDate}
                      onChange={(e) => setObservedDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-purple-600 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Leave blank if observed on calendar date</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Significance & Legal Context
                  </label>
                  <textarea
                    rows={2}
                    value={significance}
                    onChange={(e) => setSignificance(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-purple-600 focus:outline-none"
                    placeholder="Brief description of the holiday significance..."
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-200">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-purple-700 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-purple-800 transition"
                  >
                    <Check className="h-4 w-4" /> Save Gazetted Holiday
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Table of Gazetted Holidays */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="py-3 px-4">Holiday Name</th>
                  <th className="py-3 px-3">Statutory Date</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Significance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {holidays.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">🇿🇲 {h.name}</span>
                        {h.observedDate && (
                          <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-800">
                            Observed: {h.observedDate}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{h.id}</span>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-800">
                      {h.date}
                      <span className="block text-[10px] font-sans text-slate-400 font-normal">
                        {h.dayOfWeek}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        {h.category.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                      {h.significance}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {canEdit ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(h)}
                            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-purple-700 transition"
                            title="Edit Holiday"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteHoliday(h.id)}
                            className="rounded p-1 text-slate-500 hover:bg-rose-50 hover:text-rose-700 transition"
                            title="Delete Holiday"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Read-Only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
