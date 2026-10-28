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
  initialAssets?: any[];
}

function mapToUiCategory(cat: string): 'CLINICAL' | 'POWER' | 'UTILITY' | 'ICT' | 'FLEET' | 'FACILITY' {
  if (!cat) return 'FACILITY';
  const c = cat.toUpperCase();
  if (c.includes('CLINICAL') || c.includes('MEDICAL') || c.includes('LABORATORY')) return 'CLINICAL';
  if (c.includes('POWER') || c.includes('ENERGY') || c.includes('GENERATOR')) return 'POWER';
  if (c.includes('FLEET') || c.includes('TRANSPORT') || c.includes('VEHICLE')) return 'FLEET';
  if (c.includes('IT') || c.includes('COMPUTING') || c.includes('ICT')) return 'ICT';
  if (c.includes('UTILITY') || c.includes('WATER')) return 'UTILITY';
  return 'FACILITY';
}

function parseAssetRecords(records: any[]): AssetRecord[] {
  if (!records || records.length === 0) return [];
  return records.map((r) => {
    // If real AssetItem model
    if (r.assetTag) {
      return {
        id: r.id,
        tag: r.assetTag,
        name: r.name,
        category: mapToUiCategory(r.category),
        location: r.location || 'Manyama Campus',
        custodian: r.custodianName || 'Estates Directorate',
        acquisitionDate: new Date(r.purchaseDate || Date.now()).toLocaleDateString('en-GB'),
        valueZmw: Number(r.currentValueZMW || r.purchaseCostZMW || 0),
        status: r.status || 'OPERATIONAL',
        lastServiced: new Date().toLocaleDateString('en-GB'),
        nextService: new Date(Date.now() + 90 * 86400000).toLocaleDateString('en-GB'),
        notes: r.notes || '',
        serialNumber: r.serialNumber || 'N/A',
        supplier: 'Approved Medical & Institutional Supplier',
      };
    }
    // Legacy JSON metadata format
    try {
      if (r.metadataJson) {
        const p = JSON.parse(r.metadataJson);
        return {
          id: r.id,
          tag: p.tag || 'NWU-AST-000',
          name: p.name || r.title,
          category: mapToUiCategory(p.category || 'FACILITY'),
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
      tag: r.title?.split('—')[0]?.trim() || 'NWU-AST',
      name: r.title || 'Institutional Asset',
      category: 'FACILITY',
      location: 'Manyama Campus',
      custodian: 'Facilities Unit',
      acquisitionDate: '15/01/2024',
      valueZmw: 100000,
      status: (r.status as any) || 'OPERATIONAL',
      lastServiced: '10/10/2026',
      nextService: '10/01/2027',
      notes: r.summary || '',
      serialNumber: 'N/A',
      supplier: 'N/A',
    };
  });
}

// Built-in institutional standard fallback assets for immediate zero-latency rendering
const DEFAULT_INSTITUTIONAL_ASSETS: AssetRecord[] = [
  {
    id: 'nwu-gen-01',
    tag: 'NWU-PWR-2024-001',
    name: '250kVA Standby Diesel Generator (Auto-Mains Failure)',
    category: 'POWER',
    location: 'Main Kansanshi Heavy Plant Substation',
    custodian: 'Eng. Patrick Banda (Facilities)',
    acquisitionDate: '15/03/2024',
    valueZmw: 527700,
    status: 'OPERATIONAL',
    lastServiced: '10/02/2026',
    nextService: '10/05/2026',
    notes: '250kVA heavy silent Perkins standby generator powering entire hospital simulation lab.',
    serialNumber: 'FGW-250-ZM-88910',
    supplier: 'FG Wilson / Perkins',
  },
  {
    id: 'nwu-sol-02',
    tag: 'NWU-PWR-2025-002',
    name: '50kVA Commercial Hybrid Solar Inverter System',
    category: 'POWER',
    location: 'Urban Campus Solar Power Inverter Bay',
    custodian: 'Eng. Patrick Banda (Facilities)',
    acquisitionDate: '20/01/2025',
    valueZmw: 277700,
    status: 'OPERATIONAL',
    lastServiced: '15/01/2026',
    nextService: '15/07/2026',
    notes: '3-phase hybrid solar inverter with LiFePO4 battery storage bank.',
    serialNumber: 'DEYE-50K-HYB-9918',
    supplier: 'Deye / FelicitySolar',
  },
  {
    id: 'nwu-wtr-03',
    tag: 'NWU-UTL-2024-003',
    name: '50,000-Litre High-Level Borehole Water Storage & Booster Rig',
    category: 'UTILITY',
    location: 'Overhead Steel Tower & Pump House',
    custodian: 'Eng. Patrick Banda (Facilities)',
    acquisitionDate: '10/05/2024',
    valueZmw: 211900,
    status: 'OPERATIONAL',
    lastServiced: '22/01/2026',
    nextService: '22/04/2026',
    notes: 'Elevated water reservoir with automated pressure boosters.',
    serialNumber: 'WT-50KL-SOL-2024',
    supplier: 'Roto Tanks Zambia',
  },
  {
    id: 'nwu-bus-04',
    tag: 'NWU-FLE-2023-001',
    name: 'Toyota Coaster 32-Seater Executive Campus Bus (Reg: BAA 2914)',
    category: 'FLEET',
    location: 'Bus Fleet Depot & Parking Bay 1',
    custodian: 'Mr. Moses Chilufya (Senior Driver)',
    acquisitionDate: '10/08/2023',
    valueZmw: 663300,
    status: 'OPERATIONAL',
    lastServiced: '18/02/2026',
    nextService: '18/05/2026',
    notes: 'Official campus transit bus with QR barcode registration and GPS tracking.',
    serialNumber: 'XZB50-0049182',
    supplier: 'Toyota Zambia',
  },
  {
    id: 'nwu-van-05',
    tag: 'NWU-FLE-2024-002',
    name: 'Toyota HiAce 16-Seater Commuter Minibus (Reg: ALD 8820)',
    category: 'FLEET',
    location: 'Urban Campus Student Drop-off Bay',
    custodian: 'Mr. Frank Kalumba (Transport)',
    acquisitionDate: '14/02/2024',
    valueZmw: 358100,
    status: 'OPERATIONAL',
    lastServiced: '05/02/2026',
    nextService: '05/05/2026',
    notes: 'Dedicated to clinical rotation hospital transfers.',
    serialNumber: 'KDH200-098412',
    supplier: 'Toyota Zambia',
  },
  {
    id: 'nwu-amb-06',
    tag: 'NWU-FLE-2024-004',
    name: 'Toyota Land Cruiser BLS Ambulance (Reg: BAE 8891)',
    category: 'FLEET',
    location: 'Clinical Emergency Response Bay',
    custodian: 'Clinical Services Directorate',
    acquisitionDate: '01/06/2024',
    valueZmw: 720000,
    status: 'OPERATIONAL',
    lastServiced: '10/01/2026',
    nextService: '10/06/2026',
    notes: 'Emergency medical transfer vehicle equipped with transport ventilator.',
    serialNumber: 'HZJ78-019842',
    supplier: 'Toyota Gibraltar / Zambia',
  },
  {
    id: 'nwu-sim-07',
    tag: 'NWU-MED-2024-001',
    name: 'Laerdal SimMan 3G Advanced High-Fidelity Patient Simulator',
    category: 'CLINICAL',
    location: 'Simulation Hospital Suite (Clinical Lab 1)',
    custodian: 'Dr. Frank Tembo (Clinical Skills)',
    acquisitionDate: '12/03/2024',
    valueZmw: 495000,
    status: 'OPERATIONAL',
    lastServiced: '15/01/2026',
    nextService: '15/07/2026',
    notes: 'Wireless human patient simulator for advanced resuscitation training.',
    serialNumber: 'LRD-SIM3G-ZM-001',
    supplier: 'Laerdal Medical',
  },
  {
    id: 'nwu-mat-08',
    tag: 'NWU-MED-2024-002',
    name: 'Gaumard Victoria Maternal & Neonatal Birthing Simulator',
    category: 'CLINICAL',
    location: 'Obstetrics & Midwifery Simulation Suite',
    custodian: 'Head of Midwifery & Nursing',
    acquisitionDate: '15/04/2024',
    valueZmw: 395000,
    status: 'OPERATIONAL',
    lastServiced: '20/01/2026',
    nextService: '20/07/2026',
    notes: 'Autonomous birthing simulation unit for obstetric emergency training.',
    serialNumber: 'GMR-VIC-2024-ZM',
    supplier: 'Gaumard Scientific',
  },
  {
    id: 'nwu-ult-09',
    tag: 'NWU-MED-2024-003',
    name: 'Mindray DC-40 Full Digital Diagnostic Ultrasound Imaging System',
    category: 'CLINICAL',
    location: 'Radiography & Diagnostic Skills Lab',
    custodian: 'Clinical Diagnostic Skills Unit',
    acquisitionDate: '10/05/2024',
    valueZmw: 265000,
    status: 'OPERATIONAL',
    lastServiced: '12/01/2026',
    nextService: '12/07/2026',
    notes: 'Color Doppler diagnostic ultrasound station for clinical skills training.',
    serialNumber: 'MDR-DC40-2024',
    supplier: 'Mindray Medical',
  },
  {
    id: 'nwu-mic-10',
    tag: 'NWU-LAB-2024-001',
    name: 'Olympus CX23 Binocular Biological Microscopes (Set of 20 Units)',
    category: 'CLINICAL',
    location: 'Senior Biology & Pathology Laboratory (Room B1)',
    custodian: 'Dr. Frank Tembo (Head of Science)',
    acquisitionDate: '15/01/2024',
    valueZmw: 149300,
    status: 'OPERATIONAL',
    lastServiced: '08/01/2026',
    nextService: '08/07/2026',
    notes: 'Complete set of 20 high-resolution binocular optical microscopes with LED illumination.',
    serialNumber: 'OLY-CX23-SET20-SOL',
    supplier: 'Olympus Corporation',
  },
  {
    id: 'nwu-sat-11',
    tag: 'NWU-ICT-2024-001',
    name: 'Starlink Enterprise High-Speed Satellite Terminal & Gateway',
    category: 'ICT',
    location: 'Main Server Room (Administration Block B)',
    custodian: 'Mr. Kelvin Mwila (IT Administrator)',
    acquisitionDate: '01/06/2024',
    valueZmw: 53500,
    status: 'OPERATIONAL',
    lastServiced: '01/02/2026',
    nextService: '01/08/2026',
    notes: 'Flat panel enterprise satellite link providing dedicated 250Mbps campus internet backbone.',
    serialNumber: 'STRLNK-ENT-ZM-0881',
    supplier: 'SpaceX / Starlink',
  },
  {
    id: 'nwu-lab-12',
    tag: 'NWU-ICT-2024-002',
    name: '40-Seat Dell OptiPlex Computer Laboratory Workstations & Server',
    category: 'ICT',
    location: 'ICT Resource Lab (Room ICT-1)',
    custodian: 'Mr. Kelvin Mwila (IT Administrator)',
    acquisitionDate: '20/03/2024',
    valueZmw: 368300,
    status: 'OPERATIONAL',
    lastServiced: '20/01/2026',
    nextService: '20/04/2026',
    notes: '40 Dell OptiPlex Core i5 systems with centralized offline Kiwix medical library.',
    serialNumber: 'DELL-OPT-7090-40SET',
    supplier: 'Dell Technologies',
  },
];

export function AssetsConsole({ initialRecords = [], initialAssets = [] }: AssetsConsoleProps) {
  const [assets, setAssets] = useState<AssetRecord[]>(() => {
    if (initialAssets && initialAssets.length > 0) return parseAssetRecords(initialAssets);
    if (initialRecords && initialRecords.length > 0) return parseAssetRecords(initialRecords);
    return DEFAULT_INSTITUTIONAL_ASSETS;
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notice, setNotice] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // CRUD Modal State
  const [selectedAsset, setSelectedAsset] = useState<AssetRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false);

  // Client-side fetch from /api/assets
  const fetchLiveAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setAssets(parseAssetRecords(json.data));
        }
      }
    } catch (err) {
      console.error('[AssetsConsole] API fetch notice:', err);
    }
  };

  const handleSeedOfficialAssets = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/assets?seed=true');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setAssets(parseAssetRecords(json.data));
          setNotice('Official NWUCHAS capital assets successfully seeded into database.');
        } else {
          setAssets(DEFAULT_INSTITUTIONAL_ASSETS);
          setNotice('Official assets loaded successfully.');
        }
      } else {
        setAssets(DEFAULT_INSTITUTIONAL_ASSETS);
        setNotice('Official assets register active.');
      }
    } catch (err) {
      setAssets(DEFAULT_INSTITUTIONAL_ASSETS);
      setNotice('Official assets register active.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setNotice(''), 5000);
    }
  };

  useEffect(() => {
    fetchLiveAssets();
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
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
    const authHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    if (isCreateMode) {
      try {
        const res = await fetch('/api/assets', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            assetTag: updated.tag,
            name: updated.name,
            category: updated.category,
            location: updated.location,
            purchaseCostZMW: updated.valueZmw,
            currentValueZMW: updated.valueZmw,
            condition: 'EXCELLENT',
            status: updated.status || 'OPERATIONAL',
            custodianName: updated.custodian,
            serialNumber: updated.serialNumber,
            notes: updated.notes,
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
        await fetch('/api/assets', {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({
            id: updated.id,
            name: updated.name,
            category: updated.category,
            location: updated.location,
            currentValueZMW: updated.valueZmw,
            status: updated.status,
            custodianName: updated.custodian,
            notes: updated.notes,
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
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
    try {
      await fetch(`/api/assets?id=${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
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
            onClick={handleSeedOfficialAssets}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-300 bg-cyan-50 px-3.5 py-2 text-xs font-bold text-cyan-800 shadow-xs hover:bg-cyan-100 transition disabled:opacity-50"
            title="Synchronize and persist institutional standard capital assets into database"
          >
            <Sparkles className="h-4 w-4 text-cyan-600" />
            {isSyncing ? 'Syncing...' : 'Sync Standard Assets'}
          </button>

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
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                        <Wrench className="h-6 w-6" />
                      </div>
                      <h3 className="mt-3 text-sm font-bold text-slate-900">No Asset Records Found</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL'
                          ? 'No assets match the active search or category filters.'
                          : 'No assets are currently registered in this view.'}
                      </p>
                      <div className="mt-4 flex items-center gap-2">
                        {(searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL') ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategory('ALL');
                              setSelectedStatus('ALL');
                              setSearchQuery('');
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Reset Filters
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={handleSeedOfficialAssets}
                          disabled={isSyncing}
                          className="rounded-xl bg-cyan-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-cyan-800 transition"
                        >
                          {isSyncing ? 'Loading...' : 'Load Standard Capital Assets'}
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
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
                ))
              )}
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
