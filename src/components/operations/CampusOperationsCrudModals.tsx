'use client';

import React, { useState } from 'react';
import { Home, Bus, Plus, X, Check, Building2, Bed, Users } from 'lucide-react';

interface CreateHostelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateHostelModal({ isOpen, onClose, onSuccess }: CreateHostelModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    genderPolicy: 'FEMALE_ONLY',
    totalRooms: 10,
    totalBeds: 40,
    feePerSemesterZMW: 2200,
    wardenName: '',
    wardenPhone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Hostel building name is required.');
      return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_hostel',
          name: formData.name.trim(),
          genderPolicy: formData.genderPolicy,
          totalRooms: Number(formData.totalRooms),
          totalBeds: Number(formData.totalBeds),
          feePerSemesterZMW: Number(formData.feePerSemesterZMW),
          wardenName: formData.wardenName.trim() || null,
          wardenPhone: formData.wardenPhone.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create hostel');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error creating hostel');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-800">
              <Building2 className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-slate-900">Add New Hostel Building</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Hostel Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Florence Nightingale Hall"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Gender Policy</label>
              <select
                value={formData.genderPolicy}
                onChange={(e) => setFormData({ ...formData, genderPolicy: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
              >
                <option value="FEMALE_ONLY">Female Only</option>
                <option value="MALE_ONLY">Male Only</option>
                <option value="CO_ED_SEGREGATED">Co-Ed (Segregated Wings)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Fee / Semester (ZMW)</label>
              <input
                type="number"
                min="0"
                step="50"
                value={formData.feePerSemesterZMW}
                onChange={(e) => setFormData({ ...formData, feePerSemesterZMW: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Planned Rooms</label>
              <input
                type="number"
                min="1"
                value={formData.totalRooms}
                onChange={(e) => setFormData({ ...formData, totalRooms: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Bed Capacity</label>
              <input
                type="number"
                min="1"
                value={formData.totalBeds}
                onChange={(e) => setFormData({ ...formData, totalBeds: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Warden Name</label>
              <input
                type="text"
                placeholder="e.g. Mrs. Janet Phiri"
                value={formData.wardenName}
                onChange={(e) => setFormData({ ...formData, wardenName: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Warden Phone</label>
              <input
                type="text"
                placeholder="+260 97 123 4567"
                value={formData.wardenPhone}
                onChange={(e) => setFormData({ ...formData, wardenPhone: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-cyan-800 transition disabled:opacity-50"
            >
              <Check className="h-4 w-4" /> {isSubmitting ? 'Creating...' : 'Register Hostel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CreateRoomModalProps {
  isOpen: boolean;
  hostelId: string;
  hostelName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateRoomModal({ isOpen, hostelId, hostelName, onClose, onSuccess }: CreateRoomModalProps) {
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState(1);
  const [capacity, setCapacity] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roomNumber.trim()) {
      setError('Room number is required');
      return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_room',
          hostelId,
          roomNumber: roomNumber.trim(),
          floor: Number(floor),
          capacity: Number(capacity),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create room');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error creating room');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-800">
              <Bed className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Add Room to Hostel</h3>
              <p className="text-[11px] text-slate-500">{hostelName}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Room Designation</label>
            <input
              type="text"
              required
              placeholder="e.g. Room 105"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Floor Level</label>
              <input
                type="number"
                min="0"
                max="10"
                value={floor}
                onChange={(e) => setFloor(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Bed Capacity</label>
              <input
                type="number"
                min="1"
                max="8"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-cyan-800 transition disabled:opacity-50"
            >
              <Check className="h-4 w-4" /> {isSubmitting ? 'Adding...' : 'Create Room & Beds'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CreateRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateRouteModal({ isOpen, onClose, onSuccess }: CreateRouteModalProps) {
  const [formData, setFormData] = useState({
    routeCode: '',
    routeName: '',
    vehicleReg: '',
    driverName: '',
    driverPhone: '',
    capacity: 30,
    feePerSemesterZMW: 1500,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.routeCode.trim() || !formData.routeName.trim()) {
      setError('Route code and route name are required.');
      return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_route',
          routeCode: formData.routeCode.trim(),
          routeName: formData.routeName.trim(),
          vehicleReg: formData.vehicleReg.trim() || null,
          driverName: formData.driverName.trim() || null,
          driverPhone: formData.driverPhone.trim() || null,
          capacity: Number(formData.capacity),
          feePerSemesterZMW: Number(formData.feePerSemesterZMW),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create route');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error creating route');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-800">
              <Bus className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-slate-900">Add Campus Shuttle Route</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Route Code</label>
              <input
                type="text"
                required
                placeholder="e.g. NWU-SHUTTLE-01"
                value={formData.routeCode}
                onChange={(e) => setFormData({ ...formData, routeCode: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Vehicle Registration</label>
              <input
                type="text"
                placeholder="e.g. BAF 8492"
                value={formData.vehicleReg}
                onChange={(e) => setFormData({ ...formData, vehicleReg: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Route Name & Destination</label>
            <input
              type="text"
              required
              placeholder="e.g. Manyama Main Campus ↔ Solwezi General Hospital"
              value={formData.routeName}
              onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Driver Name</label>
              <input
                type="text"
                placeholder="e.g. Mr. Moses Mwewa"
                value={formData.driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Driver Phone</label>
              <input
                type="text"
                placeholder="+260 97 112 2334"
                value={formData.driverPhone}
                onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Bus Seating Capacity</label>
              <input
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Fee / Semester (ZMW)</label>
              <input
                type="number"
                min="0"
                step="50"
                value={formData.feePerSemesterZMW}
                onChange={(e) => setFormData({ ...formData, feePerSemesterZMW: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-cyan-800 transition disabled:opacity-50"
            >
              <Check className="h-4 w-4" /> {isSubmitting ? 'Creating...' : 'Register Shuttle Route'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
