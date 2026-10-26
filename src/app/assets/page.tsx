// src/app/assets/page.tsx
// Enterprise School Asset Management, Depreciation Accounting & Maintenance Console for Legacy School Solwezi
// Compliant with Rule 24 (Enterprise Table) & Rule 25 (Interactive Analytics)
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Boxes,
  Building2,
  Wrench,
  ShieldCheck,
  TrendingDown,
  DollarSign,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  QrCode,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Layers,
  Sparkles,
  Zap,
  Bus,
  FlaskConical,
  Laptop,
  Bed,
  Trophy,
  Sliders,
  X,
  FileText,
  User,
  ShieldAlert,
  Tag,
  Check,
  Lock,
} from 'lucide-react';
import { EnterpriseTable, ColumnDef } from '@/components/EnterpriseTable';
import { InteractiveChart } from '@/components/InteractiveChart';
import { useCampus } from '@/components/CampusContext';
import { ModuleGate } from '@/components/ModuleGate';
import { Finance2FAModal } from '@/components/Finance2FAModal';
import {
  SEED_SCHOOL_ASSETS,
  SchoolAssetItem,
  AssetCategory,
  AssetCondition,
  calculateAssetMetrics,
  calculateStraightLineDepreciation,
} from '@/server/services/schoolAssetData';
import {
  loadActiveUser,
  is2FAVerifiedForSession,
  clear2FASession,
  hasPermission,
} from '@/lib/authPermissions';
import { saveAdminAuditLogs } from '@/lib/appSettings';

const CATEGORY_ICONS: Record<AssetCategory, any> = {
  LABORATORY: FlaskConical,
  POWER_ENERGY: Zap,
  FLEET_TRANSPORT: Bus,
  IT_COMPUTING: Laptop,
  BOARDING_RESIDENTIAL: Bed,
  SPORTS_FACILITIES: Trophy,
  FURNITURE_CLASSROOM: Boxes,
};

const CATEGORY_LABELS: Record<AssetCategory, string> = {
  LABORATORY: 'Science Lab Equipment',
  POWER_ENERGY: 'Generators & Power Grid',
  FLEET_TRANSPORT: 'Bus & Transport Fleet',
  IT_COMPUTING: 'IT & Digital Systems',
  BOARDING_RESIDENTIAL: 'Boarding Village Assets',
  SPORTS_FACILITIES: 'Sports Facilities',
  FURNITURE_CLASSROOM: 'Classroom Furniture',
};

const CONDITION_COLORS: Record<AssetCondition, string> = {
  EXCELLENT: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
  GOOD: 'bg-blue-50 text-blue-800 border-blue-300 font-semibold',
  FAIR: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
  MAINTENANCE_REQUIRED: 'bg-rose-100 text-rose-900 border-rose-300 font-black animate-pulse',
  DECOMMISSIONED: 'bg-slate-100 text-slate-600 border-slate-300 line-through',
};

export default function AssetsPage() {
  const { selectedCampus, campusInfo } = useCampus();
  const [assets, setAssets] = useState<SchoolAssetItem[]>(SEED_SCHOOL_ASSETS);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [conditionFilter, setConditionFilter] = useState<string>('ALL');
  const [selectedAsset, setSelectedAsset] = useState<SchoolAssetItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState<SchoolAssetItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [is2FAVerified, setIs2FAVerified] = useState<boolean>(() => is2FAVerifiedForSession());
  const [activeUser, setActiveUser] = useState(() => loadActiveUser());

  // Listen to 2FA updates
  useEffect(() => {
    const handleUpdate = () => {
      setIs2FAVerified(is2FAVerifiedForSession());
      setActiveUser(loadActiveUser());
    };
    window.addEventListener('edusphere:2fa-verified', handleUpdate);
    window.addEventListener('edusphere:2fa-cleared', handleUpdate);
    window.addEventListener('edusphere:user-updated', handleUpdate);
    return () => {
      window.removeEventListener('edusphere:2fa-verified', handleUpdate);
      window.removeEventListener('edusphere:2fa-cleared', handleUpdate);
      window.removeEventListener('edusphere:user-updated', handleUpdate);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Add Asset Form State
  const [newAsset, setNewAsset] = useState<Partial<SchoolAssetItem>>({
    name: '',
    category: 'LABORATORY',
    campus: 'Mushitala Campus (Near Kansanshi)',
    locationRoom: '',
    serialNumber: '',
    manufacturer: '',
    model: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseCostZMW: 15000,
    usefulLifeYears: 5,
    salvageValueZMW: 1500,
    depreciationMethod: 'STRAIGHT_LINE',
    condition: 'EXCELLENT',
    custodianName: activeUser.fullName,
    custodianStaffId: activeUser.staffId,
  });

  // Maintenance Form State
  const [serviceForm, setServiceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    costZMW: 2500,
    technician: '',
    status: 'COMPLETED' as const,
  });

  // Filtered Assets based on campus and category
  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const matchCampus =
        selectedCampus === 'ALL' ||
        (selectedCampus === 'MUSHITALA' && a.campus.includes('Mushitala')) ||
        (selectedCampus === 'URBAN' && a.campus.includes('Urban'));
      const matchCategory = activeCategory === 'ALL' || a.category === activeCategory;
      const matchCondition = conditionFilter === 'ALL' || a.condition === conditionFilter;
      return matchCampus && matchCategory && matchCondition;
    });
  }, [assets, selectedCampus, activeCategory, conditionFilter]);

  const metrics = useMemo(() => calculateAssetMetrics(filteredAssets), [filteredAssets]);

  // Handle Add Asset Submission
  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.locationRoom) {
      showToast('Please specify Asset Name and Campus Location.');
      return;
    }

    const cost = Number(newAsset.purchaseCostZMW) || 10000;
    const salvage = Number(newAsset.salvageValueZMW) || 1000;
    const life = Number(newAsset.usefulLifeYears) || 5;
    const pDate = newAsset.purchaseDate || new Date().toISOString().split('T')[0];

    const { accumulated, netBookValue } = calculateStraightLineDepreciation(cost, salvage, life, pDate);

    const created: SchoolAssetItem = {
      id: `ast-${Date.now()}`,
      assetTag: `LSS-${newAsset.category?.slice(0, 3)}-${new Date().getFullYear()}-${String(assets.length + 1).padStart(3, '0')}`,
      barcode: `BC-${Date.now().toString().slice(-8)}`,
      name: newAsset.name!,
      category: newAsset.category as AssetCategory,
      campus: newAsset.campus as any,
      locationRoom: newAsset.locationRoom!,
      serialNumber: newAsset.serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      manufacturer: newAsset.manufacturer || 'Standard Certified',
      model: newAsset.model || 'Commercial 2026',
      purchaseDate: pDate,
      purchaseCostZMW: cost,
      usefulLifeYears: life,
      salvageValueZMW: salvage,
      depreciationMethod: 'STRAIGHT_LINE',
      accumulatedDepreciationZMW: accumulated,
      currentNetBookValueZMW: netBookValue,
      condition: (newAsset.condition as AssetCondition) || 'EXCELLENT',
      custodianName: newAsset.custodianName || activeUser.fullName,
      custodianStaffId: newAsset.custodianStaffId || activeUser.staffId,
      lastServiceDate: pDate,
      nextServiceDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      maintenanceHistory: [],
    };

    setAssets([created, ...assets]);
    setShowAddModal(false);
    showToast(`Asset "${created.name}" registered successfully with Tag ${created.assetTag}! 📦`);

    saveAdminAuditLogs([
      {
        id: `aud-ast-${Date.now()}`,
        timestamp: new Date().toLocaleString('en-GB') + ' CAT',
        adminName: activeUser.fullName,
        action: 'ASSET_REGISTRATION',
        module: 'Asset Management',
        details: `Registered ${created.name} (${created.assetTag}) valued at K${created.purchaseCostZMW.toLocaleString()}.`,
        status: 'SUCCESS',
        ipAddress: '192.168.10.15 (Asset Desk)',
      },
    ]);
  };

  // Handle Log Service / Maintenance
  const handleLogService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

    const newLog = {
      id: `mnt-${Date.now()}`,
      date: serviceForm.date,
      description: serviceForm.description,
      costZMW: Number(serviceForm.costZMW) || 0,
      technician: serviceForm.technician || activeUser.fullName,
      status: serviceForm.status,
    };

    const updated = {
      ...selectedAsset,
      lastServiceDate: serviceForm.date,
      condition: serviceForm.status === 'COMPLETED' ? ('GOOD' as AssetCondition) : selectedAsset.condition,
      maintenanceHistory: [newLog, ...selectedAsset.maintenanceHistory],
    };

    setAssets(assets.map((a) => (a.id === selectedAsset.id ? updated : a)));
    setSelectedAsset(updated);
    setShowServiceModal(false);
    showToast(`Maintenance log saved for "${selectedAsset.name}".`);
  };

  // Export Assets CSV conforming to Rule 24
  const handleExportCSV = () => {
    const headers = [
      'Asset Tag',
      'Barcode / QR',
      'Asset Description',
      'Category',
      'Campus',
      'Location / Room',
      'Manufacturer',
      'Model',
      'Serial Number',
      'Purchase Date',
      'Original Cost (ZMW)',
      'Accumulated Deprec (ZMW)',
      'Net Book Value (ZMW)',
      'Condition',
      'Assigned Custodian',
      'Last Serviced',
      'Next Service Due',
    ];

    const rows = filteredAssets.map((a) => [
      a.assetTag,
      a.barcode,
      `"${a.name.replace(/"/g, '""')}"`,
      a.category,
      `"${a.campus}"`,
      `"${a.locationRoom}"`,
      `"${a.manufacturer}"`,
      `"${a.model}"`,
      `"${a.serialNumber}"`,
      a.purchaseDate,
      a.purchaseCostZMW,
      a.accumulatedDepreciationZMW,
      a.currentNetBookValueZMW,
      a.condition,
      `"${a.custodianName}"`,
      a.lastServiceDate,
      a.nextServiceDate,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Legacy_School_Solwezi_Asset_Register_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Asset register CSV successfully exported for MoE & Board of Directors! 📑');
  };

  // Enterprise Table Columns Definition conforming to Rule 24
  const columns: ColumnDef<SchoolAssetItem>[] = [
    {
      key: 'assetTag',
      header: 'Asset Tag & Barcode',
      sortable: true,
      accessor: (a) => a.assetTag,
      render: (a) => (
        <div>
          <span className="font-mono font-bold text-blue-900 block">{a.assetTag}</span>
          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
            <QrCode className="w-2.5 h-2.5 text-slate-500" />
            {a.barcode}
          </span>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Asset Description & Model',
      sortable: true,
      accessor: (a) => a.name,
      render: (a) => {
        const IconComponent = CATEGORY_ICONS[a.category] || Boxes;
        return (
          <div className="flex items-start gap-2 max-w-xs">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 mt-0.5 shrink-0">
              <IconComponent className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 leading-snug line-clamp-2">{a.name}</p>
              <p className="text-[10px] text-slate-500">
                {a.manufacturer} • {a.model}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      accessor: (a) => a.category,
      render: (a) => (
        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          {CATEGORY_LABELS[a.category] || a.category}
        </span>
      ),
    },
    {
      key: 'location',
      header: 'Campus & Location',
      sortable: true,
      accessor: (a) => a.campus,
      render: (a) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800 block">
            {a.campus.includes('Mushitala') ? 'Mushitala Campus' : 'Urban Campus'}
          </span>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-slate-400" />
            {a.locationRoom}
          </span>
        </div>
      ),
    },
    {
      key: 'valuation',
      header: 'Acquisition & Net Value',
      sortable: true,
      accessor: (a) => a.currentNetBookValueZMW,
      render: (a) => (
        <div className="text-right font-mono">
          <span className="font-bold text-blue-900 block text-xs">
            K{a.currentNetBookValueZMW.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400">
            Cost: K{a.purchaseCostZMW.toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      key: 'condition',
      header: 'Condition Status',
      sortable: true,
      accessor: (a) => a.condition,
      render: (a) => (
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider border ${CONDITION_COLORS[a.condition]}`}>
          {a.condition.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'custodian',
      header: 'Assigned Custodian',
      sortable: true,
      accessor: (a) => a.custodianName,
      render: (a) => (
        <div className="text-xs">
          <span className="font-bold text-slate-800 block">{a.custodianName}</span>
          <span className="text-[10px] text-slate-500 font-mono">{a.custodianStaffId}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Dossier Actions',
      render: (a) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedAsset(a)}
            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs"
          >
            <span>Dossier</span>
            <ChevronRight className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => setShowBarcodeModal(a)}
            className="p-1 text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded-lg transition"
            title="Print Barcode Tag"
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <ModuleGate
      moduleKey="assets"
      moduleName="Institutional Asset Management & Depreciation"
      moduleDescription="Capital assets register, straight-line depreciation accounting, preventative maintenance schedules, and QR barcode asset tagging."
      planRequired="SOVEREIGN_ENTERPRISE"
      pricePerTermZMW={2350}
    >
      <div className="space-y-6 w-full pb-16">
        {/* 2FA Challenge for Financial / Asset Reserve Security */}
        {!is2FAVerified && (
          <Finance2FAModal
            onSuccess={() => {
              setIs2FAVerified(true);
              showToast('2FA Security Clearance Verified: School Asset Register Unlocked.');
            }}
            actionTitle="Access School Fixed Asset Register & Depreciation Ledgers"
          />
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-white text-slate-800 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-200 animate-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Header and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Boxes className="w-7 h-7 text-blue-800" />
                <span>Enterprise Asset Management & Capital Register</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                {campusInfo.name}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Physical inventory, straight-line depreciation, generator & bus maintenance schedules, and QR code asset tagging.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {is2FAVerified ? (
              <button
                type="button"
                onClick={() => {
                  clear2FASession();
                  setIs2FAVerified(false);
                  showToast('Asset register 2FA session locked for security.');
                }}
                className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-rose-50 text-emerald-800 hover:text-rose-700 border border-emerald-300 hover:border-rose-300 text-xs font-bold transition flex items-center gap-1.5"
                title="Click to lock asset register"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>2FA Active • Lock</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIs2FAVerified(false)}
                className="px-3 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4" />
                <span>2FA Required</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-blue-700" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Asset</span>
            </button>
          </div>
        </div>

        {/* Rule 25 Interactive Analytics KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Net Book Value</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">
              K{(metrics.totalNetBookValue / 1000).toFixed(1)}k
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Total Current Depreciated Valuation
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Gross Acquisition</span>
              <Boxes className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">
              K{(metrics.totalPurchaseCost / 1000).toFixed(1)}k
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Historical Capital Expenditure
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Accumulated Deprec</span>
              <TrendingDown className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">
              K{(metrics.totalAccumulatedDepreciation / 1000).toFixed(1)}k
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Straight-Line Statutory Provision
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Service Alerts</span>
              <Wrench className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-black text-rose-700">
              {metrics.assetsRequiringMaintenance} Units
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Maintenance or Overhaul Required
            </p>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeCategory === 'ALL'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Categories ({assets.length})
          </button>
          {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => {
            const count = assets.filter((a) => a.category === catKey).length;
            const IconComp = CATEGORY_ICONS[catKey as AssetCategory];
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setActiveCategory(catKey)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeCategory === catKey
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{label}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Rule 24 Enterprise Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Official Institutional Capital Assets Ledger
              </h2>
              <p className="text-xs text-slate-500">
                Showing {filteredAssets.length} tracked items conforming to Ministry of Education Zambia guidelines.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Filter Condition:</span>
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="text-xs font-bold bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800"
              >
                <option value="ALL">All Conditions</option>
                <option value="EXCELLENT">Excellent Condition</option>
                <option value="GOOD">Good Condition</option>
                <option value="FAIR">Fair Condition</option>
                <option value="MAINTENANCE_REQUIRED">Maintenance Required</option>
              </select>
            </div>
          </div>

          <EnterpriseTable
            data={filteredAssets}
            columns={columns}
            searchPlaceholder="Search asset tag, description, serial number, room, custodian..."
            exportFilename="Legacy_School_Solwezi_Assets"
            onRowClick={(row) => setSelectedAsset(row)}
          />
        </div>

        {/* MODAL 1: Asset 360° Dossier Drawer */}
        {selectedAsset && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-6 animate-in zoom-in-95">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-900 border border-blue-300">
                      {selectedAsset.assetTag}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${CONDITION_COLORS[selectedAsset.condition]}`}>
                      {selectedAsset.condition.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{selectedAsset.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedAsset.campus} • {selectedAsset.locationRoom}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Depreciation & Accounting Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Purchase Cost</span>
                  <span className="font-mono font-black text-slate-900 text-sm">
                    K{selectedAsset.purchaseCostZMW.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Net Book Value</span>
                  <span className="font-mono font-black text-emerald-700 text-sm">
                    K{selectedAsset.currentNetBookValueZMW.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Depreciation (SL)</span>
                  <span className="font-mono font-black text-amber-700 text-sm">
                    K{selectedAsset.accumulatedDepreciationZMW.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Useful Life</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {selectedAsset.usefulLifeYears} Years
                  </span>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Technical Specifications & Governance
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">Manufacturer & Model</span>
                    <p className="font-bold text-slate-800">{selectedAsset.manufacturer}</p>
                    <p className="text-slate-600 font-mono text-[11px]">{selectedAsset.model}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">Serial Number / Barcode</span>
                    <p className="font-mono font-bold text-blue-900">{selectedAsset.serialNumber}</p>
                    <p className="text-slate-500 font-mono text-[11px]">{selectedAsset.barcode}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">Assigned Custodian</span>
                    <p className="font-bold text-slate-800">{selectedAsset.custodianName}</p>
                    <p className="text-slate-500 text-[11px]">{selectedAsset.custodianStaffId}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">Next Service Schedule</span>
                    <p className="font-bold text-slate-800">{selectedAsset.nextServiceDate}</p>
                    <p className="text-slate-500 text-[11px]">Last: {selectedAsset.lastServiceDate}</p>
                  </div>
                </div>
              </div>

              {/* Maintenance History Log */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Service & Maintenance Log ({selectedAsset.maintenanceHistory.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowServiceModal(true)}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Log New Service</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedAsset.maintenanceHistory.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No historical repair entries logged.</p>
                  ) : (
                    selectedAsset.maintenanceHistory.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{log.description}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                              {log.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {log.date} • Performed by: {log.technician}
                          </p>
                        </div>
                        <span className="font-mono font-bold text-slate-900 shrink-0">
                          K{log.costZMW.toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Drawer Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowBarcodeModal(selectedAsset)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <QrCode className="w-4 h-4 text-slate-700" />
                  <span>Print Barcode Tag</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowServiceModal(true)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Schedule Service</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAsset(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                  >
                    Close Dossier
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: Register New Asset Form */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-blue-800" />
                  <h3 className="text-base font-black text-slate-900">Register Institutional School Asset</h3>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAsset} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Asset Description / Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Olympus CX23 Binocular Microscopes (Set of 10)"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Asset Category *</label>
                    <select
                      value={newAsset.category}
                      onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value as AssetCategory })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Campus Location *</label>
                    <select
                      value={newAsset.campus}
                      onChange={(e) => setNewAsset({ ...newAsset, campus: e.target.value as any })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    >
                      <option value="Mushitala Campus (Near Kansanshi)">Mushitala Campus (Near Kansanshi)</option>
                      <option value="Urban Campus (Solwezi Central)">Urban Campus (Solwezi Central)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Specific Room / Building *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Chemistry Lab Room C1"
                      value={newAsset.locationRoom}
                      onChange={(e) => setNewAsset({ ...newAsset, locationRoom: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Serial Number</label>
                    <input
                      type="text"
                      placeholder="e.g. SN-889104-ZM"
                      value={newAsset.serialNumber}
                      onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Purchase Cost (ZMW) *</label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={newAsset.purchaseCostZMW}
                      onChange={(e) => setNewAsset({ ...newAsset, purchaseCostZMW: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Useful Life (Years)</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={newAsset.usefulLifeYears}
                      onChange={(e) => setNewAsset({ ...newAsset, usefulLifeYears: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Salvage Value (ZMW)</label>
                    <input
                      type="number"
                      min={0}
                      value={newAsset.salvageValueZMW}
                      onChange={(e) => setNewAsset({ ...newAsset, salvageValueZMW: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold shadow-xs"
                  >
                    Complete Asset Registration
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: Schedule Service Modal */}
        {showServiceModal && selectedAsset && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-black text-slate-900">Log Maintenance / Service</h3>
                </div>
                <button onClick={() => setShowServiceModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleLogService} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Maintenance Description *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. 500-hour comprehensive service, air filter replacement, oil flush..."
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Service Date *</label>
                    <input
                      type="date"
                      value={serviceForm.date}
                      onChange={(e) => setServiceForm({ ...serviceForm, date: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Cost (ZMW)</label>
                    <input
                      type="number"
                      value={serviceForm.costZMW}
                      onChange={(e) => setServiceForm({ ...serviceForm, costZMW: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Technician / Contractor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Kansanshi Power Services / AutoCare Solwezi"
                    value={serviceForm.technician}
                    onChange={(e) => setServiceForm({ ...serviceForm, technician: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowServiceModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs"
                  >
                    Save Maintenance Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: Printable Asset Barcode & QR Sticker */}
        {showBarcodeModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Asset Barcode Label</span>
                <button onClick={() => setShowBarcodeModal(null)} className="text-slate-400 hover:text-slate-700 font-bold">
                  ✕
                </button>
              </div>

              {/* Printable Barcode Label Box */}
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 space-y-2">
                <p className="text-[11px] font-black text-blue-950 uppercase tracking-wider">
                  Legacy School Solwezi
                </p>
                <div className="w-28 h-28 mx-auto bg-white border border-slate-300 rounded-xl p-2 flex items-center justify-center shadow-inner">
                  <QrCode className="w-20 h-20 text-slate-900" />
                </div>
                <p className="font-mono font-black text-sm text-slate-900 tracking-wider">
                  {showBarcodeModal.assetTag}
                </p>
                <p className="text-[10px] text-slate-600 font-semibold line-clamp-1">
                  {showBarcodeModal.name}
                </p>
                <p className="text-[9px] text-slate-400 font-mono">
                  SN: {showBarcodeModal.serialNumber} • {showBarcodeModal.locationRoom}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Physical Tag</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowBarcodeModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </ModuleGate>
  );
}
