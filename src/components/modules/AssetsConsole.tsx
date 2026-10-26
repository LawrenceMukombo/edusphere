'use client';

import { useState, useEffect } from 'react';
import {
  Wrench,
  Zap,
  Droplets,
  Wifi,
  Bus,
  ShieldCheck,
  Stethoscope,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  Sparkles,
  MapPin,
  ChevronRight,
  Eye,
  Check,
  SlidersHorizontal,
} from 'lucide-react';
import { AssetCrudModal, AssetRecord } from '../assets/AssetCrudModal';

interface AssetsConsoleProps {
  initialRecords?: any[];
}

function parseAssetRecords(records: any[]): AssetRecord[] {
  if (!records || records.length === 0) return [];
  return records.map((r) => {
    try {
      if (r.metadataJson) {
        const p = JSON.parse(r.metadataJson);
        return {
          id: r.id,
          tag: p.tag || 'NWU-AST-000',
          name: p.name || r.title,
          category: p.category || 'FACILITY',
          location: p.location || 'Manyama Campus',
          custodian: p.custodian || 'Facilities Unit',
          acquisitionDate: p.acquisitionDate || '15/01/2024',
          valueZmw: Number(p.valueZmw || 0),
          status: p.status || r.status || 'OPERATIONAL',
          lastServiced: p.lastServiced || '10/10/2026',
          nextService: p.nextService || '10/01/2027',
          notes: p.notes || r.summary,
          serialNumber: p.serialNumber || 'N/A',
          supplier: p.supplier || 'N/A',
        };
      }
    } catch (e) {}
    return {
      id: r.id,
      tag: r.title.split('—')[0]?.trim() || 'NWU-AST',
      name: r.title,
      category: 'FACILITY',
      location: 'Manyama Campus',
      custodian: 'Facilities Unit',
      acquisitionDate: '15/01/2024',
      valueZmw: 100000,
      status: (r.status as any) || 'OPERATIONAL',
      lastServiced: '10/10/2026',
      nextService: '10/01/2027',
      notes: r.summary,
      serialNumber: 'N/A',
      supplier: 'N/A',
    };
  });
}

export function AssetsConsole({ initialRecords = [] }: AssetsConsoleProps) {
  const [assets, setAssets] = useState<AssetRecord[]>(() => parseAssetRecords(initialRecords));
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notice, setNotice] = useState<string>('');

  // CRUD Modal State
  const [selectedAsset, setSelectedAsset] = useState<AssetRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false);

  // Client-side fallback fetch from database if page loaded without SSR props
  useEffect(() => {
    if (assets.length === 0) {
      fetch('/api/modules/assets')
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setAssets(parseAssetRecords(json.data));
          }
        })
        .catch((err) => console.error('[AssetsConsole] API fetch notice:', err));
    }
  }, []);

  const filteredAssets = assets.filter((asset) => {
    const matchesCat = selectedCategory === 'ALL' || asset.category === selectedCategory;
    const matchesStat = selectedStatus === 'ALL' || asset.status === selectedStatus;
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.custodian.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStat && matchesSearch;
  });

  const totalValue = assets.reduce((sum, a) => sum + a.valueZmw, 0);

  function handleOpenCreate() {
    setSelectedAsset(null);
    setIsCreateMode(true);
    setIsModalOpen(true);
  }

  function handleOpenRowCrud(asset: AssetRecord) {
    setSelectedAsset(asset);
    setIsCreateMode(false);
    setIsModalOpen(true);
  }

  async function handleSaveAsset(updated: AssetRecord) {
    if (isCreateMode) {
      try {
        const res = await fetch('/api/modules/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `${updated.tag} — ${updated.name}`,
            status: updated.status,
            summary: updated.notes,
            metadataJson: JSON.stringify(updated),
          }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          updated.id = json.data.id;
        }
      } catch (e) {
        console.error('Failed to persist created asset:', e);
      }
      setAssets([updated, ...assets]);
      setNotice(`Capital Asset "${updated.name}" (${updated.tag}) registered in database.`);
    } else {
      try {
        await fetch('/api/modules/assets', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: updated.id,
            title: `${updated.tag} — ${updated.name}`,
            status: updated.status,
            summary: updated.notes,
            metadataJson: JSON.stringify(updated),
          }),
        });
      } catch (e) {
        console.error('Failed to persist updated asset:', e);
      }
      setAssets(assets.map((a) => (a.id === updated.id ? updated : a)));
      setNotice(`Asset records for "${updated.name}" (${updated.tag}) updated.`);
    }
    setTimeout(() => setNotice(''), 5000);
  }

  async function handleDeleteAsset(id: string) {
    try {
      await fetch(`/api/modules/assets?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete asset from database:', e);
    }
    setAssets(assets.filter((a) => a.id !== id));
    setNotice('Asset archived from active register.');
    setTimeout(() => setNotice(''), 5000);
  }

  return (
    <div className="mt-8 space-y-6">
      {notice && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 shadow-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-xs font-bold">{notice}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Capital Valuation</p>
          <p className="mt-2 text-2xl font-black text-slate-900 font-mono">
            ZMW {totalValue.toLocaleString()}
          </p>
          <span className="mt-2 inline-flex items-center text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-600" /> {assets.length} Capital Assets Logged
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Power & Water Resiliency</p>
          <p className="mt-2 text-2xl font-black text-emerald-700">100% Operational</p>
          <span className="mt-2 inline-flex items-center text-xs text-slate-600">
            <Zap className="mr-1 h-3.5 w-3.5 text-amber-500" /> 250kVA Standby + 20kL Solar Well
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Medical Simulation Suite</p>
          <p className="mt-2 text-2xl font-black text-cyan-800">5 High-Fidelity Units</p>
          <span className="mt-2 inline-flex items-center text-xs text-slate-600">
            <Stethoscope className="mr-1 h-3.5 w-3.5 text-cyan-700" /> SimMan 3G, Gaumard, Ultrasound
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Transit Fleet & Transit QR</p>
          <p className="mt-2 text-2xl font-black text-indigo-900">2 Vehicles Active</p>
          <span className="mt-2 inline-flex items-center text-xs text-slate-600">
            <Bus className="mr-1 h-3.5 w-3.5 text-indigo-600" /> Coaster Bus & BLS Ambulance
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'CLINICAL', 'POWER', 'UTILITY', 'ICT', 'FLEET', 'FACILITY'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-700 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Asset Groups' : cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="EXCELLENT">EXCELLENT</option>
              <option value="OPERATIONAL">OPERATIONAL</option>
              <option value="MAINTENANCE_DUE">MAINTENANCE DUE</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tag, name, custodian…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-cyan-600"
            />
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-cyan-800 transition"
          >
            <Plus className="h-4 w-4" /> Register New Asset
          </button>
        </div>
      </div>

      {/* Asset Table: Clickable Rows */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>Click any asset record to view maintenance logs, update valuation, schedule service, or edit specifications</span>
          <span className="text-cyan-700">{filteredAssets.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Asset Tag & Description</th>
                <th className="px-6 py-3.5">Category & Location</th>
                <th className="px-6 py-3.5">Custodian</th>
                <th className="px-6 py-3.5">Valuation (ZMW)</th>
                <th className="px-6 py-3.5">Condition Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAssets.map((asset) => (
                <tr
                  key={asset.id}
                  onClick={() => handleOpenRowCrud(asset)}
                  className="cursor-pointer hover:bg-cyan-50/30 transition group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md border border-cyan-200 bg-cyan-50 px-2 py-0.5 font-mono text-xs font-bold text-cyan-800">
                        {asset.tag}
                      </span>
                      <span className="font-bold text-slate-900 group-hover:text-cyan-800 transition">
                        {asset.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900">{asset.category}</span>
                    <p className="text-slate-500 text-[11px] mt-0.5">{asset.location}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800">{asset.custodian}</p>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900 text-sm">
                    ZMW {asset.valueZmw.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        asset.status === 'EXCELLENT'
                          ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                          : asset.status === 'OPERATIONAL'
                          ? 'border border-cyan-200 bg-cyan-50 text-cyan-800'
                          : 'border border-amber-200 bg-amber-50 text-amber-800'
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3" /> {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenRowCrud(asset);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50/70 px-3 py-1.5 text-xs font-bold text-cyan-800 hover:bg-cyan-100 transition shadow-xs"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5 text-cyan-700" /> Manage Asset
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Modal */}
      <AssetCrudModal
        asset={selectedAsset}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAsset}
        onDelete={handleDeleteAsset}
        isCreateMode={isCreateMode}
      />
    </div>
  );
}
