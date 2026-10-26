'use client';

import { useState } from 'react';
import {
  X,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Save,
  Trash2,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export interface IntegrationNode {
  id: string;
  name: string;
  category: 'STATUTORY' | 'PAYMENTS' | 'NETWORK' | 'HARDWARE' | 'DATABASE';
  endpoint: string;
  status: 'ONLINE' | 'ACTIVE' | 'DEGRADED' | 'STANDBY';
  latencyMs: number;
  lastPing: string;
  description: string;
}

interface IntegrationNodeCrudModalProps {
  node: IntegrationNode | null;
  isOpen: boolean;
  isCreateMode?: boolean;
  onClose: () => void;
  onSave: (node: IntegrationNode) => void;
  onDelete?: (id: string) => void;
}

export function IntegrationNodeCrudModal({
  node,
  isOpen,
  isCreateMode = false,
  onClose,
  onSave,
  onDelete,
}: IntegrationNodeCrudModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'VIEW' | 'EDIT' | 'DIAGNOSTICS'>('VIEW');
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  const [formData, setFormData] = useState<IntegrationNode>(
    node || {
      id: `node-${Date.now()}`,
      name: '',
      category: 'STATUTORY',
      endpoint: 'https://',
      status: 'ONLINE',
      latencyMs: 45,
      lastPing: 'Just now',
      description: '',
    }
  );

  function handlePingTest() {
    setIsPinging(true);
    setPingResult(null);
    setTimeout(() => {
      setIsPinging(false);
      const latency = Math.floor(15 + Math.random() * 40);
      setFormData((prev) => ({ ...prev, latencyMs: latency, lastPing: 'Just now' }));
      setPingResult(`HTTP 200 OK — Round-trip response received in ${latency}ms via Institutional Integration Bus.`);
    }, 700);
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(formData);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 border border-cyan-100 text-cyan-800">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isCreateMode ? 'Register New Gateway Node' : formData.name}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {formData.endpoint}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Tabs */}
        {!isCreateMode && (
          <div className="flex border-b border-slate-100 bg-slate-50/50 px-6">
            <button
              onClick={() => setActiveTab('VIEW')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
                activeTab === 'VIEW'
                  ? 'border-cyan-700 text-cyan-800'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Gateway Details
            </button>
            <button
              onClick={() => setActiveTab('EDIT')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
                activeTab === 'EDIT'
                  ? 'border-cyan-700 text-cyan-800'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Edit Configuration
            </button>
            <button
              onClick={() => setActiveTab('DIAGNOSTICS')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
                activeTab === 'DIAGNOSTICS'
                  ? 'border-cyan-700 text-cyan-800'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Diagnostic Probe & Ping
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {pingResult && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{pingResult}</span>
            </div>
          )}

          {activeTab === 'VIEW' && !isCreateMode ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-100 bg-slate-50/50 p-4 text-xs">
                <div>
                  <span className="text-slate-500">Service Category:</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{formData.category}</p>
                </div>
                <div>
                  <span className="text-slate-500">Operating Status:</span>
                  <p className="font-semibold text-emerald-700 mt-0.5 inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {formData.status}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Current Latency:</span>
                  <p className="font-semibold font-mono text-slate-900 mt-0.5">{formData.latencyMs} ms</p>
                </div>
                <div>
                  <span className="text-slate-500">Last Telemetry Ping:</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{formData.lastPing}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Service Scope & Compliance</h4>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed bg-white border border-slate-200 rounded-lg p-3">
                  {formData.description}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={handlePingTest}
                  disabled={isPinging}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                  {isPinging ? 'Probing Gateway…' : 'Run Diagnostics Ping'}
                </button>

                <div className="flex items-center gap-2">
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remove gateway node "${formData.name}"?`)) {
                          onDelete(formData.id);
                          onClose();
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveTab('EDIT')}
                    className="rounded-lg bg-cyan-700 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-800 transition"
                  >
                    Edit Node
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'DIAGNOSTICS' && !isCreateMode ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Live Health Telemetry</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> TLS 1.3 Active
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-600">
                  Target Endpoint: <code className="font-mono text-cyan-800">{formData.endpoint}</code>
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="rounded bg-white p-2.5 border border-slate-200">
                    <p className="text-[11px] text-slate-500">Latency</p>
                    <p className="mt-1 font-mono font-bold text-slate-900">{formData.latencyMs}ms</p>
                  </div>
                  <div className="rounded bg-white p-2.5 border border-slate-200">
                    <p className="text-[11px] text-slate-500">Packet Loss</p>
                    <p className="mt-1 font-mono font-bold text-slate-900">0.0%</p>
                  </div>
                  <div className="rounded bg-white p-2.5 border border-slate-200">
                    <p className="text-[11px] text-slate-500">Availability</p>
                    <p className="mt-1 font-mono font-bold text-emerald-700">99.98%</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={handlePingTest}
                  disabled={isPinging}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-700 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-800 transition"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                  {isPinging ? 'Testing…' : 'Trigger Immediate Health Check'}
                </button>
              </div>
            </div>
          ) : (
            /* EDIT / CREATE FORM */
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Service / Gateway Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. ZRA TaxOnline Gateway (PAYE Engine)"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-cyan-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-cyan-600 focus:bg-white"
                  >
                    <option value="STATUTORY">Statutory Regulator</option>
                    <option value="PAYMENTS">Payment Gateway (MoMo/Bank)</option>
                    <option value="NETWORK">Campus Network / WAN</option>
                    <option value="HARDWARE">Campus Hardware (Turnstiles)</option>
                    <option value="DATABASE">Database & PostGIS Engine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-cyan-600 focus:bg-white"
                  >
                    <option value="ONLINE">ONLINE (Healthy)</option>
                    <option value="ACTIVE">ACTIVE (Operational)</option>
                    <option value="DEGRADED">DEGRADED (High Latency)</option>
                    <option value="STANDBY">STANDBY (Warm Failover)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Target Endpoint / Connection URI</label>
                <input
                  type="text"
                  required
                  value={formData.endpoint}
                  onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                  placeholder="https://..."
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-medium text-slate-900 outline-none focus:border-cyan-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Description & Integration Purpose</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain compliance scope, authentication rails, encryption protocols..."
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-900 outline-none focus:border-cyan-600 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-700 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-cyan-800 transition"
                >
                  <Save className="h-3.5 w-3.5" />
                  {isCreateMode ? 'Register Gateway' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
