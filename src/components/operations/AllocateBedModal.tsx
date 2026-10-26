'use client';

import { useState } from 'react';
import { X, Home, UserCheck, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AllocateBedModalProps {
  hostels: any[];
  learners: any[];
  onClose: () => void;
  onAllocated: (newAlloc: any) => void;
}

export function AllocateBedModal({ hostels = [], learners = [], onClose, onAllocated }: AllocateBedModalProps) {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(hostels[0]?.id || '');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedBedId, setSelectedBedId] = useState<string>('');
  const [selectedLearnerId, setSelectedLearnerId] = useState<string>(learners[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const currentBuilding = hostels.find((h) => h.id === selectedBuildingId);
  const rooms = currentBuilding?.rooms || [];
  const currentRoom = rooms.find((r: any) => r.id === (selectedRoomId || rooms[0]?.id));
  const availableBeds = (currentRoom?.beds || []).filter((b: any) => !b.isOccupied);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const bedIdToUse = selectedBedId || availableBeds[0]?.id;
    if (!bedIdToUse) {
      setErrorMsg('Please select an available bed.');
      return;
    }
    if (!selectedLearnerId) {
      setErrorMsg('Please select a student.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'allocate_bed',
          bedId: bedIdToUse,
          learnerId: selectedLearnerId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to allocate bed.');

      onAllocated(data.data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
              <Home className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Allocate Hostel Bed</h3>
              <p className="text-xs text-slate-500">Assign a registered student to a residential bed</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
            <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="font-bold uppercase tracking-wider text-slate-700">Residential Hall</label>
            <select
              value={selectedBuildingId}
              onChange={(e) => {
                setSelectedBuildingId(e.target.value);
                setSelectedRoomId('');
                setSelectedBedId('');
              }}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none"
            >
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.genderPolicy || 'CO-ED'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold uppercase tracking-wider text-slate-700">Room</label>
              <select
                value={selectedRoomId || rooms[0]?.id || ''}
                onChange={(e) => {
                  setSelectedRoomId(e.target.value);
                  setSelectedBedId('');
                }}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none"
              >
                {rooms.map((r: any) => (
                  <option key={r.id} value={r.id}>
                    {r.roomNumber} (Floor {r.floor})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-slate-700">Available Bed</label>
              <select
                value={selectedBedId || availableBeds[0]?.id || ''}
                onChange={(e) => setSelectedBedId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none"
              >
                {availableBeds.length === 0 ? (
                  <option value="">No vacant beds in this room</option>
                ) : (
                  availableBeds.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.bedNumber} (Vacant)
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold uppercase tracking-wider text-slate-700">Student to Assign</label>
            <select
              value={selectedLearnerId}
              onChange={(e) => setSelectedLearnerId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none"
            >
              {learners.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.firstName} {l.lastName} ({l.studentNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || availableBeds.length === 0}
              className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-cyan-800 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Allocating...' : 'Confirm Allocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
