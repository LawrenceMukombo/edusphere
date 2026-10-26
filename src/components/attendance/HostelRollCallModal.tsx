'use client';

import React, { useState } from 'react';
import { X, Building, Check, Clock, AlertTriangle, ShieldCheck, Bed } from 'lucide-react';

interface HostelRollCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRollCall: (newLog: any) => void;
}

export function HostelRollCallModal({
  isOpen,
  onClose,
  onSaveRollCall,
}: HostelRollCallModalProps) {
  const [hostelWing, setHostelWing] = useState(
    'Florence Nightingale Residence (Female Hostel - Shilenda Road Campus)'
  );
  const [wardenName, setWardenName] = useState('Mrs. Margaret Musonda, RN (Senior Matron)');
  const [curfewTime, setCurfewTime] = useState('21:30');
  const [roomStatuses, setRoomStatuses] = useState<Record<string, string>>({
    'Room 101': 'IN_ROOM',
    'Room 102': 'IN_ROOM',
    'Room 103': 'LATE_RETURN',
    'Room 104': 'ON_EXEAT',
    'Room 201': 'IN_ROOM',
    'Room 202': 'IN_ROOM',
    'Room 203': 'SICK_BAY',
  });
  const [remarks, setRemarks] = useState(
    'Curfew conducted promptly at 21:30 hrs. Night perimeter lighting intact. Two students on night shift clinical rotation at Solwezi General Hospital.'
  );

  if (!isOpen) return null;

  const handleStatusChange = (room: string, status: string) => {
    setRoomStatuses((prev) => ({ ...prev, [room]: status }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inRoomCount = Object.values(roomStatuses).filter((s) => s === 'IN_ROOM').length;
    const lateCount = Object.values(roomStatuses).filter((s) => s === 'LATE_RETURN').length;
    const exeatCount = Object.values(roomStatuses).filter((s) => s === 'ON_EXEAT').length;
    const sickBayCount = Object.values(roomStatuses).filter((s) => s === 'SICK_BAY').length;

    const newLog = {
      id: `rc-${Date.now()}`,
      hostelName: hostelWing,
      timestamp: `2026-10-26 ${curfewTime}:00`,
      warden: wardenName,
      inRoomCount: inRoomCount * 4,
      lateCount: lateCount * 2,
      exeatCount: exeatCount * 2,
      sickBayCount: sickBayCount * 1,
      totalBeds: 120,
      status: 'VERIFIED',
      remarks,
    };

    onSaveRollCall(newLog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 border border-slate-200 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-100 text-indigo-800">
              <Bed className="h-5 w-5 text-indigo-700" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Log Hostel Nightly Curfew Verification
              </h3>
              <p className="text-xs text-slate-500">
                Official institutional residence room check and trainee accountability register.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Hostel Residence Wing:</label>
              <select
                value={hostelWing}
                onChange={(e) => {
                  setHostelWing(e.target.value);
                  if (e.target.value.includes('Albert')) {
                    setWardenName('Mr. Kelvin Phiri (Male Residence Warden)');
                  } else {
                    setWardenName('Mrs. Margaret Musonda, RN (Senior Matron)');
                  }
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-800 focus:outline-none"
              >
                <option value="Florence Nightingale Residence (Female Hostel - Shilenda Road Campus)">
                  Florence Nightingale Residence (Female Hostel - Shilenda Road Campus)
                </option>
                <option value="Albert Schweitzer Hall (Main Campus Male Residence)">
                  Albert Schweitzer Hall (Main Campus Male Residence)
                </option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Night Duty Warden / Matron:</label>
              <input
                type="text"
                value={wardenName}
                onChange={(e) => setWardenName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Curfew Verification Time:</label>
              <input
                type="time"
                value={curfewTime}
                onChange={(e) => setCurfewTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <span className="font-bold text-slate-600">Standard Curfew:</span>
              <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 font-mono font-black text-xs">
                21:30 CAT
              </span>
            </div>
          </div>

          {/* Room-by-Room Curfew Checklist */}
          <div>
            <label className="font-bold text-slate-700 block mb-2">Room Inspection Statuses:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto p-3 border border-slate-200 rounded-xl bg-slate-50">
              {Object.entries(roomStatuses).map(([room, status]) => (
                <div
                  key={room}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200"
                >
                  <span className="font-bold text-slate-800">{room}</span>
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(room, e.target.value)}
                    className="text-[11px] font-bold rounded border border-slate-300 px-2 py-1 bg-white"
                  >
                    <option value="IN_ROOM">In Room (Present)</option>
                    <option value="LATE_RETURN">Late Return (Flagged)</option>
                    <option value="ON_EXEAT">On Approved Exeat</option>
                    <option value="SICK_BAY">In Sick Bay</option>
                    <option value="ABSENT">Unaccounted / Absent</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Duty Warden Security Remarks:</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-700 text-white font-extrabold hover:bg-indigo-800 transition shadow-sm"
            >
              Save Curfew Roll-Call
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
