'use client';

import { useState } from 'react';
import {
  X,
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  DollarSign,
  Calendar,
  User,
  MapPin,
  Trash2,
  Save,
  Tag,
  ShieldCheck,
  Stethoscope,
  Zap,
  Droplets,
  Wifi,
  Bus,
} from 'lucide-react';

export interface AssetRecord {
  id: string;
  tag: string;
  name: string;
  category: 'CLINICAL' | 'POWER' | 'UTILITY' | 'ICT' | 'FLEET' | 'FACILITY';
  location: string;
  custodian: string;
  acquisitionDate: string;
  valueZmw: number;
  status: 'EXCELLENT' | 'OPERATIONAL' | 'MAINTENANCE_DUE' | 'CRITICAL';
  lastServiced: string;
  nextService: string;
  notes: string;
  serialNumber?: string;
  supplier?: string;
}

interface AssetCrudModalProps {
  asset: AssetRecord | null;
  isOpen: boolean;
  isCreateMode?: boolean;
  onClose: () => void;
  onSave: (asset: AssetRecord) => void;
  onDelete?: (id: string) => void;
}

export function AssetCrudModal({
  asset,
  isOpen,
  isCreateMode = false,
  onClose,
  onSave,
  onDelete,
}: AssetCrudModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'VIEW' | 'EDIT' | 'SERVICE'>('VIEW');
  const [formData, setFormData] = useState<AssetRecord>(
    asset || {
      id: `asset-${Date.now()}`,
      tag: `NWU-AST-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category: 'CLINICAL',
      location: 'Manyama Main Campus',
      custodian: 'Facilities Unit',
      acquisitionDate: new Date().toLocaleDateString('en-GB'),
      valueZmw: 50000,
      status: 'OPERATIONAL',
      lastServiced: new Date().toLocaleDateString('en-GB'),
      nextService: new Date(Date.now() + 90 * 24 * 3600 * 1000).toLocaleDateString('en-GB'),
      notes: '',
      serialNumber: `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      supplier: 'Biomedical Supplies Zambia Ltd',
    }
  );

  const [serviceTechnician, setServiceTechnician] = useState<string>('Eng. Patrick Banda');
  const [serviceNotes, setServiceNotes] = useState<string>('Routine calibration & preventative maintenance inspection completed. Fully compliant.');
  const [serviceCostZmw, setServiceCostZmw] = useState<number>(1200);

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(formData);
    onClose();
  }

  function handleLogService(e: React.FormEvent) {
    e.preventDefault();
    const today = new Date().toLocaleDateString('en-GB');
    const nextQuarter = new Date(Date.now() + 90 * 24 * 3600 * 1000).toLocaleDateString('en-GB');
    const updated: AssetRecord = {
      ...formData,
      lastServiced: today,
      nextService: nextQuarter,
      status: 'EXCELLENT',
      notes: `${formData.notes ? formData.notes + ' | ' : ''}Serviced by ${serviceTechnician} on ${today}: ${serviceNotes}`,
    };
    onSave(updated);
    onClose();
  }

  function getCategoryIcon(cat: string) {
    switch (cat) {
      case 'CLINICAL':
        return <Stethoscope className="h-4 w-4 text-cyan-600" />;
      case 'POWER':
        return <Zap className="h-4 w-4 text-amber-500" />;
      case 'UTILITY':
        return <Droplets className="h-4 w-4 text-blue-500" />;
      case 'ICT':
        return <Wifi className="h-4 w-4 text-indigo-500" />;
      case 'FLEET':
        return <Bus className="h-4 w-4 text-emerald-600" />;
      default:
        return <Building className="h-4 w-4 text-slate-600" />;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
              {getCategoryIcon(formData.category)}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-cyan-200 bg-cyan-50 px-2 py-0.5 font-mono text-xs font-bold text-cyan-800">
                  {formData.tag}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    formData.status === 'EXCELLENT'
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                      : formData.status === 'OPERATIONAL'
                      ? 'border border-cyan-200 bg-cyan-50 text-cyan-800'
                      : 'border border-amber-200 bg-amber-50 text-amber-800'
                  }`}
                >
                  {formData.status}
                </span>
              </div>
              <h2 className="mt-1 text-base font-bold text-slate-900">
                {isCreateMode ? 'Register New Capital Asset' : formData.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action Tabs */}
        {!isCreateMode && (
          <div className="mt-4 flex gap-2 border-b border-slate-100 pb-3">
            <button
              onClick={() => setActiveTab('VIEW')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'VIEW'
                  ? 'bg-cyan-700 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Asset Overview
            </button>
            <button
              onClick={() => setActiveTab('EDIT')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'EDIT'
                  ? 'bg-cyan-700 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Edit Asset Records
            </button>
            <button
              onClick={() => setActiveTab('SERVICE')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'SERVICE'
                  ? 'bg-cyan-700 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Log Maintenance / Service
            </button>
          </div>
        )}

        {/* TAB 1: VIEW DETAILS */}
        {!isCreateMode && activeTab === 'VIEW' && (
          <div className="mt-5 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="text-[11px] font-medium text-slate-500">Asset Category</p>
                <p className="font-bold text-slate-900">{formData.category}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Current Valuation</p>
                <p className="font-mono font-black text-slate-900 text-sm">
                  ZMW {Number(formData.valueZmw).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Campus Location</p>
                <p className="font-semibold text-slate-800 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" /> {formData.location}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Responsible Custodian</p>
                <p className="font-semibold text-slate-800 flex items-center gap-1">
                  <User className="h-3 w-3 text-slate-400" /> {formData.custodian}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div>
                <p className="text-[11px] font-medium text-slate-500">Date Acquired</p>
                <p className="font-semibold text-slate-800">{formData.acquisitionDate}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Serial / Reg Number</p>
                <p className="font-mono font-semibold text-cyan-800">{formData.serialNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Last Serviced Date</p>
                <p className="font-semibold text-emerald-700">{formData.lastServiced}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Next Service Due</p>
                <p className="font-semibold text-amber-700">{formData.nextService}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-medium text-slate-500">Inspection & Operational Notes</p>
              <p className="mt-1 leading-relaxed text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {formData.notes || 'No specific maintenance notes recorded.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> NWUCHAS Capital Asset Audit Compliant
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('EDIT')}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Edit Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('SERVICE')}
                  className="rounded-xl bg-cyan-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-cyan-800"
                >
                  Log Service
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EDIT ASSET OR CREATE NEW */}
        {(isCreateMode || activeTab === 'EDIT') && (
          <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Asset Tag Ref</label>
                <input
                  type="text"
                  required
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</label>
                <select
                  value={formData.category}
                  onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                >
                  <option value="CLINICAL">Clinical & Biomedical Simulation</option>
                  <option value="POWER">Standby Power & Generators</option>
                  <option value="UTILITY">Water Reservoirs & Solar Boreholes</option>
                  <option value="ICT">ICT Infrastructure & CBT Labs</option>
                  <option value="FLEET">Shuttles & Emergency Ambulances</option>
                  <option value="FACILITY">Boarding Hostels & Facilities</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Asset Description / Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Laerdal SimMan 3G Patient Simulator"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Campus Location</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Custodian / Department</label>
                <input
                  type="text"
                  required
                  value={formData.custodian}
                  onChange={(e) => setFormData({ ...formData, custodian: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Valuation (ZMW)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.valueZmw}
                  onChange={(e) => setFormData({ ...formData, valueZmw: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Operating Status</label>
                <select
                  value={formData.status}
                  onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                >
                  <option value="EXCELLENT">EXCELLENT</option>
                  <option value="OPERATIONAL">OPERATIONAL</option>
                  <option value="MAINTENANCE_DUE">MAINTENANCE DUE</option>
                  <option value="CRITICAL">CRITICAL REPAIR</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Serial Number</label>
                <input
                  type="text"
                  value={formData.serialNumber || ''}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  placeholder="e.g. SN-8829103"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Notes & Specifications</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {!isCreateMode && onDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Are you sure you want to archive asset ${formData.tag}?`)) {
                      onDelete(formData.id);
                      onClose();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                >
                  <Trash2 className="h-4 w-4" /> Archive Asset
                </button>
              ) : (
                <div></div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-700 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-cyan-800 transition"
                >
                  <Save className="h-4 w-4" /> {isCreateMode ? 'Register Asset' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 3: LOG MAINTENANCE SERVICE */}
        {!isCreateMode && activeTab === 'SERVICE' && (
          <form onSubmit={handleLogService} className="mt-5 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Preventative Maintenance Sign-Off Form
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Record routine calibration, filter replacement, electrical testing, or biomedical safety validation.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Lead Technician / Engineer</label>
                <input
                  type="text"
                  required
                  value={serviceTechnician}
                  onChange={(e) => setServiceTechnician(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Service Cost (ZMW)</label>
                <input
                  type="number"
                  min={0}
                  value={serviceCostZmw}
                  onChange={(e) => setServiceCostZmw(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Inspection Findings & Replaced Parts</label>
              <textarea
                required
                rows={4}
                value={serviceNotes}
                onChange={(e) => setServiceNotes(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('VIEW')}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Back
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
              >
                <CheckCircle2 className="h-4 w-4" /> Sign Off & Update Schedule
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
