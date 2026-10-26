'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Check, Server, Globe, Key, AlertCircle } from 'lucide-react';

export interface GatewayRail {
  id: string;
  name: string;
  provider: 'MTN' | 'AIRTEL' | 'ABSA' | 'ZNBS' | 'ZANACO' | 'OTHER';
  status: 'ONLINE' | 'DEGRADED' | 'MAINTENANCE' | 'OFFLINE';
  description: string;
  endpoint: string;
  settlementSla: string;
  merchantCodeOrTerminal: string;
  apiVersion: string;
  webhookSecret?: string;
  activeFeatures?: string[];
}

interface EditGatewayRailModalProps {
  isOpen: boolean;
  onClose: () => void;
  rail: GatewayRail | null;
  onSave: (updatedRail: GatewayRail) => void;
}

export function EditGatewayRailModal({
  isOpen,
  onClose,
  rail,
  onSave,
}: EditGatewayRailModalProps) {
  if (!isOpen || !rail) return null;

  const [formData, setFormData] = useState<GatewayRail>({ ...rail });
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (rail) {
      setFormData({ ...rail });
      setErrorMessage('');
    }
  }, [rail]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Rail name is required.');
      return;
    }
    if (!formData.endpoint.trim()) {
      setErrorMessage('Endpoint URL / proxy host is required.');
      return;
    }

    onSave(formData);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white text-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-700 text-white">
              <Server className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Configure Zambian Gateway Rail</h3>
              <p className="text-[11px] text-slate-500 font-mono">{formData.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs font-bold text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Gateway Rail Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Operational Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-cyan-600 focus:outline-none"
              >
                <option value="ONLINE">ONLINE (Active & Processing)</option>
                <option value="DEGRADED">DEGRADED (High Latency / MNO Notice)</option>
                <option value="MAINTENANCE">MAINTENANCE (Scheduled MNO Downtime)</option>
                <option value="OFFLINE">OFFLINE (Disabled)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Architecture & Integration Summary
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-cyan-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Endpoint URL / Proxy Host
              </label>
              <div className="relative mt-1">
                <input
                  type="text"
                  value={formData.endpoint}
                  onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                  placeholder="proxy.momo.mtn.zm:8443"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-cyan-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Settlement Clearing SLA
              </label>
              <input
                type="text"
                value={formData.settlementSla}
                onChange={(e) => setFormData({ ...formData, settlementSla: e.target.value })}
                placeholder="T+0 Real-Time Webhook"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Merchant Code / Terminal ID / Shortcode
              </label>
              <input
                type="text"
                value={formData.merchantCodeOrTerminal}
                onChange={(e) => setFormData({ ...formData, merchantCodeOrTerminal: e.target.value })}
                placeholder="Merchant Code: 039182 / Terminal: NWU-BURS-POS01"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs font-bold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                API Version / Clearing Protocol
              </label>
              <input
                type="text"
                value={formData.apiVersion}
                onChange={(e) => setFormData({ ...formData, apiVersion: e.target.value })}
                placeholder="Open API v2.1 / ISO 8583"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-800 focus:border-cyan-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-2">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-cyan-700" />
              Cryptographic Credentials & Webhook Signing
            </span>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Webhook Secret Token</label>
                <input
                  type="password"
                  value={formData.webhookSecret || '••••••••••••••••••••••••'}
                  onChange={(e) => setFormData({ ...formData, webhookSecret: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs text-slate-800 focus:border-cyan-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Provider Region</label>
                <div className="mt-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700">
                  Zambia (ZMW) • National Clearing
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-cyan-800"
            >
              <Check className="h-4 w-4" /> Save Rail Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
