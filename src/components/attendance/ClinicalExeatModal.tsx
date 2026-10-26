'use client';

import React, { useState } from 'react';
import { X, Building, Check, Clock, AlertTriangle, ShieldCheck, FileCheck } from 'lucide-react';
import { AttendanceLearnerRecord } from '../modules/AttendanceConsole';

export interface ClinicalExeatPass {
  id: string;
  passNumber: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  programme: string;
  destination: string;
  reason: string;
  departureTime: string;
  expectedReturnTime: string;
  actualReturnTime?: string;
  authorizingOfficer: string;
  emergencyPhone: string;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
}

interface ClinicalExeatModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: AttendanceLearnerRecord[];
  onSaveExeat: (newExeat: ClinicalExeatPass) => void;
}

export function ClinicalExeatModal({
  isOpen,
  onClose,
  students,
  onSaveExeat,
}: ClinicalExeatModalProps) {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [destination, setDestination] = useState(
    'Solwezi General Hospital (Maternity & Labour Ward Attachment)'
  );
  const [reason, setReason] = useState(
    'Assigned 8-hour clinical shift rotation under supervision of Ward Sister in Charge.'
  );
  const [departureTime, setDepartureTime] = useState('2026-10-26T13:30');
  const [expectedReturnTime, setExpectedReturnTime] = useState('2026-10-26T21:00');
  const [authorizingOfficer, setAuthorizingOfficer] = useState(
    'Sr. Patricia Mwewa, RN (Clinical Placement Coordinator)'
  );
  const [emergencyPhone, setEmergencyPhone] = useState('+260 977 440192');

  if (!isOpen) return null;

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const passNumber = `NWU-EXT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newExeat: ClinicalExeatPass = {
      id: `ext-${Date.now()}`,
      passNumber,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      studentNumber: selectedStudent.studentNumber,
      programme: selectedStudent.programme,
      destination,
      reason,
      departureTime: departureTime.replace('T', ' '),
      expectedReturnTime: expectedReturnTime.replace('T', ' '),
      authorizingOfficer,
      emergencyPhone,
      status: 'ACTIVE',
    };

    onSaveExeat(newExeat);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-5 border border-slate-200 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-100 text-cyan-800">
              <FileCheck className="h-5 w-5 text-cyan-700" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Issue Clinical Exeat & Placement Gate Pass
              </h3>
              <p className="text-xs text-slate-500">
                Authorized gate clearance for clinical hospital rotations and approved off-campus travel.
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
          <div>
            <label className="font-bold text-slate-700 block mb-1">Select Candidate Trainee:</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-800 focus:outline-none"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.studentNumber}) — {s.programme}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Clinical Destination / Site:</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-800 focus:outline-none"
            >
              <option value="Solwezi General Hospital (Maternity & Labour Ward Attachment)">
                Solwezi General Hospital (Maternity & Labour Ward Attachment)
              </option>
              <option value="Solwezi General Hospital (Outpatient & Emergency Department)">
                Solwezi General Hospital (Outpatient & Emergency Department)
              </option>
              <option value="Manyama Urban Clinic (Child Health & Immunisation Centre)">
                Manyama Urban Clinic (Child Health & Immunisation Centre)
              </option>
              <option value="St. Dorothy Rural Health Centre (Community Outreach Rotation)">
                St. Dorothy Rural Health Centre (Community Outreach Rotation)
              </option>
              <option value="Mukinge Mission Hospital (Surgical Clinical Practicum)">
                Mukinge Mission Hospital (Surgical Clinical Practicum)
              </option>
              <option value="Compassionate / Bereavement Leave (Authorized Home Travel)">
                Compassionate / Bereavement Leave (Authorized Home Travel)
              </option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Specific Purpose / Rotation Duty:</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Departure Date & Time:</label>
              <input
                type="datetime-local"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-xs font-bold text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Expected Return Date & Time:</label>
              <input
                type="datetime-local"
                value={expectedReturnTime}
                onChange={(e) => setExpectedReturnTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-xs font-bold text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Authorizing Placement Officer:</label>
              <input
                type="text"
                value={authorizingOfficer}
                onChange={(e) => setAuthorizingOfficer(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Emergency Sponsor Phone:</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-xs text-slate-800 focus:outline-none"
              />
            </div>
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
              className="px-5 py-2 rounded-xl bg-cyan-700 text-white font-extrabold hover:bg-cyan-800 transition shadow-sm"
            >
              Authorize Gate Pass
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
