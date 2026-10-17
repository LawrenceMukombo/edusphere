'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Building2,
  Navigation,
  Bus,
  Users,
  Compass,
  ArrowUpDown,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Phone,
  Mail,
  Info,
} from 'lucide-react';
import { CampusGisItem } from '@/components/gis/CampusMap';
import { useCampus } from '@/components/CampusContext';

// Dynamically import Leaflet Map to avoid SSR errors
const CampusMap = dynamic(() => import('@/components/gis/CampusMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 gap-2 border border-slate-200">
      <Compass className="w-8 h-8 animate-spin text-blue-600" />
      <span className="text-xs font-semibold">Loading EduSphere GIS Satellite & Street Engine...</span>
    </div>
  ),
});

interface DistanceMatrixItem {
  fromCampusId: string;
  fromCampusName: string;
  fromCampusCode: string;
  toCampusId: string;
  toCampusName: string;
  toCampusCode: string;
  distanceKm: number;
  estimatedDriveMinutes: number;
}

export default function GisCampusesPage() {
  const { selectedCampus: globalCampus } = useCampus();
  const [activeTab, setActiveTab] = useState<'MAP' | 'BRANCHES' | 'DISTANCE' | 'CALCULATOR'>('MAP');
  const [campuses, setCampuses] = useState<CampusGisItem[]>([]);
  const [distanceMatrix, setDistanceMatrix] = useState<DistanceMatrixItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map state
  const [selectedCampus, setSelectedCampus] = useState<CampusGisItem | null>(null);
  const [showCatchmentZones, setShowCatchmentZones] = useState(true);
  const [showTransportRoutes, setShowTransportRoutes] = useState(true);
  const [pickedLocation, setPickedLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Synchronize map selection with top navigation campus switcher
  useEffect(() => {
    if (campuses.length > 0) {
      if (globalCampus === 'MUSHITALA' || globalCampus === 'KANSANSHI') {
        const found = campuses.find((c) => c.name.includes('Mushitala') || c.code === 'MSC');
        if (found) setSelectedCampus(found);
      } else if (globalCampus === 'URBAN') {
        const found = campuses.find((c) => c.name.includes('Urban') || c.code === 'URB');
        if (found) setSelectedCampus(found);
      }
    }
  }, [globalCampus, campuses]);

  // Nearest Campus Calculator state
  const [calculatorInput, setCalculatorInput] = useState({
    presetArea: 'Kabulonga',
    latitude: -15.423,
    longitude: 28.351,
  });
  const [calculatorResult, setCalculatorResult] = useState<any>(null);
  const [calculatingNearest, setCalculatingNearest] = useState(false);

  // Enterprise Table State (Rule 24 compliant)
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [capacityFilter, setCapacityFilter] = useState('ALL');
  const [sortField, setSortField] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    name: true,
    code: true,
    type: true,
    coordinates: true,
    catchment: true,
    capacity: true,
    enrolled: true,
    utilization: true,
    staff: true,
    actions: true,
  });

  // Modal State for New/Edit Campus
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampus, setEditingCampus] = useState<CampusGisItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: 'Lusaka',
    phone: '',
    latitude: '-15.4200',
    longitude: '28.3500',
    catchmentRadiusKm: '6.0',
    capacity: '500',
    campusType: 'BRANCH',
    landAreaHectares: '3.0',
    contactEmail: '',
    headTeacherName: '',
  });

  // Preset Feeder Areas in Lusaka
  const PRESET_AREAS = [
    { name: 'Kabulonga / Ibex Hill', lat: -15.423, lng: 28.351 },
    { name: 'Woodlands Extension / Chalala', lat: -15.445, lng: 28.335 },
    { name: 'Avondale / Chelstone', lat: -15.375, lng: 28.385 },
    { name: 'Roma / Kalundu / Foxdale', lat: -15.388, lng: 28.308 },
    { name: 'Olympia Park / Northmead', lat: -15.395, lng: 28.302 },
    { name: 'Nyumba Yanga / State Lodge', lat: -15.448, lng: 28.352 },
    { name: 'Chamba Valley / Meanwood', lat: -15.355, lng: 28.365 },
  ];

  // Fetch GIS Data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gis/campuses?orgCode=EDS-ZM-001');
      const json = await res.json();
      if (json.success) {
        setCampuses(json.data.campuses);
        setDistanceMatrix(json.data.distanceMatrix);
      } else {
        setError(json.message || 'Failed to load GIS data');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error to GIS server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Nearest Campus calculation trigger
  const runNearestCalculation = async (lat: number, lng: number) => {
    setCalculatingNearest(true);
    try {
      const res = await fetch('/api/gis/nearest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng, orgCode: 'EDS-ZM-001' }),
      });
      const json = await res.json();
      if (json.success) {
        setCalculatorResult(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCalculatingNearest(false);
    }
  };

  const handlePickMapLocation = (coords: { latitude: number; longitude: number }) => {
    setPickedLocation(coords);
    setCalculatorInput((prev) => ({
      ...prev,
      presetArea: 'Custom Map Pin',
      latitude: Number(coords.latitude.toFixed(4)),
      longitude: Number(coords.longitude.toFixed(4)),
    }));
    runNearestCalculation(coords.latitude, coords.longitude);
  };

  const handleSelectPreset = (areaName: string) => {
    const found = PRESET_AREAS.find((a) => a.name === areaName);
    if (found) {
      setCalculatorInput({
        presetArea: found.name,
        latitude: found.lat,
        longitude: found.lng,
      });
      setPickedLocation({ latitude: found.lat, longitude: found.lng });
      runNearestCalculation(found.lat, found.lng);
    }
  };

  // Filtered & Sorted Campuses for Rule 24 Table
  const filteredCampuses = useMemo(() => {
    return campuses.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType =
        typeFilter === 'ALL' ||
        (typeFilter === 'MAIN' && c.isMainCampus) ||
        (typeFilter === 'BRANCH' && !c.isMainCampus && c.campusType === 'BRANCH') ||
        (typeFilter === 'EARLY_YEARS' && c.campusType === 'EARLY_YEARS');

      const matchCapacity =
        capacityFilter === 'ALL' ||
        (capacityFilter === 'OVER' && c.isOverCapacity) ||
        (capacityFilter === 'AVAILABLE' && !c.isOverCapacity);

      return matchSearch && matchType && matchCapacity;
    });
  }, [campuses, searchQuery, typeFilter, capacityFilter]);

  const sortedCampuses = useMemo(() => {
    return [...filteredCampuses].sort((a, b) => {
      let valA: any = (a as any)[sortField];
      let valB: any = (b as any)[sortField];

      if (typeof valA === 'string') {
        const cmp = valA.localeCompare(valB || '');
        return sortOrder === 'asc' ? cmp : -cmp;
      }
      return sortOrder === 'asc' ? (valA ?? 0) - (valB ?? 0) : (valB ?? 0) - (valA ?? 0);
    });
  }, [filteredCampuses, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedCampuses.length / pageSize) || 1;
  const paginatedCampuses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedCampuses.slice(start, start + pageSize);
  }, [sortedCampuses, currentPage, pageSize]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // CSV Export for Rule 24
  const exportCsv = () => {
    const headers = [
      'Campus Code',
      'Campus Name',
      'Type',
      'Address',
      'City',
      'Latitude',
      'Longitude',
      'Elevation (m)',
      'Catchment Radius (km)',
      'Capacity',
      'Enrolled',
      'Utilization Rate (%)',
      'Staff Count',
      'Head Teacher',
    ];

    const rows = sortedCampuses.map((c) => [
      c.code,
      `"${c.name}"`,
      c.campusType,
      `"${c.address || ''}"`,
      c.city,
      c.latitude ?? '',
      c.longitude ?? '',
      c.elevationMeters ?? '',
      c.catchmentRadiusKm,
      c.capacity,
      c.enrolledCount,
      `${c.utilizationRate}%`,
      c.staffCount,
      `"${c.headTeacherName || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `edusphere_campuses_gis_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Save New or Edit Branch
  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = Boolean(editingCampus);
      const url = '/api/gis/campuses';
      const method = isEdit ? 'PUT' : 'POST';
      const payload = isEdit
        ? {
            campusId: editingCampus!.id,
            ...formData,
          }
        : {
            ...formData,
          };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        setEditingCampus(null);
        fetchData();
      } else {
        alert(json.message || 'Operation failed');
      }
    } catch (e: any) {
      alert(e.message || 'Error saving campus');
    }
  };

  const openEditModal = (campus: CampusGisItem) => {
    setEditingCampus(campus);
    setFormData({
      name: campus.name,
      code: campus.code,
      address: campus.address || '',
      city: campus.city,
      phone: campus.phone || '',
      latitude: campus.latitude ? campus.latitude.toString() : '-15.4200',
      longitude: campus.longitude ? campus.longitude.toString() : '28.3500',
      catchmentRadiusKm: campus.catchmentRadiusKm.toString(),
      capacity: campus.capacity.toString(),
      campusType: campus.campusType,
      landAreaHectares: campus.landAreaHectares ? campus.landAreaHectares.toString() : '3.0',
      contactEmail: campus.contactEmail || '',
      headTeacherName: campus.headTeacherName || '',
    });
    setIsModalOpen(true);
  };

  // Aggregated KPI Stats
  const totalCapacity = campuses.reduce((sum, c) => sum + c.capacity, 0);
  const totalEnrolled = campuses.reduce((sum, c) => sum + c.enrolledCount, 0);
  const overallUtilization = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 1000) / 10 : 0;
  const totalRoutes = campuses.reduce((sum, c) => sum + (c.transportRoutes?.length || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Multi-Campus Spatial Engine
            </span>
            <span className="text-xs text-slate-400">• Zambia Education Standard 2026</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-blue-600" />
            Campus GIS & Branch Network
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Geographic spatial planning, inter-branch logistics, catchment feeder zones, student commute optimization, and branch capacity monitoring across all educational centers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setEditingCampus(null);
              setFormData({
                name: '',
                code: '',
                address: '',
                city: 'Lusaka',
                phone: '',
                latitude: '-15.4200',
                longitude: '28.3500',
                catchmentRadiusKm: '6.0',
                capacity: '500',
                campusType: 'BRANCH',
                landAreaHectares: '3.0',
                contactEmail: '',
                headTeacherName: '',
              });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Branch</span>
          </button>
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
            title="Refresh GIS Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Campuses</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{campuses.length} Branches</div>
            <span className="text-[11px] text-blue-600 font-medium">1 Main • {Math.max(0, campuses.length - 1)} Feeder Branches</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Network Capacity</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalCapacity} Desks</div>
            <span className="text-[11px] text-emerald-600 font-medium">{totalEnrolled} Active Pupils ({overallUtilization}%)</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catchment Feeder Belt</span>
            <div className="text-2xl font-black text-slate-900 mt-1">~28.5 km</div>
            <span className="text-[11px] text-indigo-600 font-medium">Lusaka Urban & Peri-Urban Coverage</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transport Routes</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalRoutes} Shuttles</div>
            <span className="text-[11px] text-amber-600 font-medium">Daily Inter-Branch Transits Active</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Bus className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-3 gap-2">
        <button
          onClick={() => setActiveTab('MAP')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition ${
            activeTab === 'MAP'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Interactive Campus GIS Map</span>
        </button>
        <button
          onClick={() => setActiveTab('BRANCHES')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition ${
            activeTab === 'BRANCHES'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Branch Directory & Attributes (Enterprise Table)</span>
        </button>
        <button
          onClick={() => setActiveTab('DISTANCE')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition ${
            activeTab === 'DISTANCE'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Inter-Branch Distance & Transit Matrix</span>
        </button>
        <button
          onClick={() => setActiveTab('CALCULATOR')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition ${
            activeTab === 'CALCULATOR'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Admissions Catchment & Nearest Branch Finder</span>
        </button>
      </div>

      {/* TAB 1: INTERACTIVE GIS MAP VIEW */}
      {activeTab === 'MAP' && (
        <div className="space-y-4">
          {/* Map Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700">Display Layers:</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 font-semibold">
                <input
                  type="checkbox"
                  checked={showCatchmentZones}
                  onChange={(e) => setShowCatchmentZones(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Catchment Feeder Buffers</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 font-semibold">
                <input
                  type="checkbox"
                  checked={showTransportRoutes}
                  onChange={(e) => setShowTransportRoutes(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Bus Routes & Stops</span>
              </label>
            </div>

            {selectedCampus && (
              <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200">
                <span>Filtered on: <strong>{selectedCampus.name}</strong></span>
                <button
                  onClick={() => setSelectedCampus(null)}
                  className="text-blue-500 hover:text-blue-700 font-bold ml-1 text-xs"
                >
                  ✕ Clear Filter
                </button>
              </div>
            )}
          </div>

          {/* Leaflet Map Component */}
          <CampusMap
            campuses={campuses}
            selectedCampusId={selectedCampus?.id || null}
            onSelectCampus={(c) => setSelectedCampus(c)}
            pickedLocation={pickedLocation}
            onPickLocation={handlePickMapLocation}
            showCatchmentZones={showCatchmentZones}
            showTransportRoutes={showTransportRoutes}
          />

          {/* Quick Details of Selected Campus */}
          {selectedCampus && (
            <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-xs space-y-4 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600" />
                  <h3 className="font-bold text-base text-slate-900">{selectedCampus.name} ({selectedCampus.code})</h3>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                    {selectedCampus.campusType}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(selectedCampus)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Coordinates</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block">GPS Coordinates:</span>
                  <span className="text-slate-800 font-mono mt-0.5 block font-bold">
                    {selectedCampus.latitude?.toFixed(4)}, {selectedCampus.longitude?.toFixed(4)}
                  </span>
                  <span className="text-slate-500 text-[11px]">Alt: {selectedCampus.elevationMeters || 1280}m ASL</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Capacity Utilization:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${
                          selectedCampus.utilizationRate > 100
                            ? 'bg-rose-500'
                            : selectedCampus.utilizationRate > 80
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, selectedCampus.utilizationRate)}%` }}
                      />
                    </div>
                    <span className="font-bold text-slate-800">{selectedCampus.utilizationRate}%</span>
                  </div>
                  <span className="text-slate-500 text-[11px]">
                    {selectedCampus.enrolledCount} enrolled / {selectedCampus.capacity} cap
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Primary Feeder Radius:</span>
                  <span className="text-slate-800 font-bold mt-0.5 block">{selectedCampus.catchmentRadiusKm} km</span>
                  <span className="text-slate-500 text-[11px]">Campus Land: {selectedCampus.landAreaHectares || 3.0} Ha</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Head of Branch:</span>
                  <span className="text-slate-800 font-bold mt-0.5 block">{selectedCampus.headTeacherName || 'School Admin'}</span>
                  <span className="text-slate-500 text-[11px]">{selectedCampus.contactEmail || 'office@edusphere.co.zm'}</span>
                </div>
              </div>

              {selectedCampus.facilities && selectedCampus.facilities.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 text-xs font-semibold block mb-2">On-Campus Specialist Facilities:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCampus.facilities.map((fac, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-xs">
                        ✓ {fac}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ENTERPRISE BRANCH DIRECTORY TABLE (RULE 24 COMPLIANT) */}
      {activeTab === 'BRANCHES' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Institutional Branch Directory & GIS Parameters</h2>
              <p className="text-xs text-slate-500 mt-0.5">Enterprise table conforming to Rule 24: sortable columns, custom visibility, pagination, and CSV export.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search branch name, code, address..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white"
            >
              <option value="ALL">All Branch Types</option>
              <option value="MAIN">Main Campus Only</option>
              <option value="BRANCH">Standard Feeder Branches</option>
              <option value="EARLY_YEARS">Early Years & Foundation</option>
            </select>

            <select
              value={capacityFilter}
              onChange={(e) => {
                setCapacityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white"
            >
              <option value="ALL">All Capacity Statuses</option>
              <option value="AVAILABLE">Available Capacity (Under 100%)</option>
              <option value="OVER">Over Capacity (&gt;100%)</option>
            </select>

            {/* Column Visibility Selector (Rule 24 requirement) */}
            <div className="relative group">
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> Column Visibility
                </span>
                <span className="text-[10px] text-slate-400">▼</span>
              </button>
              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-200 p-2 text-xs space-y-1.5 hidden group-hover:block z-50">
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns.coordinates}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, coordinates: e.target.checked })}
                  />
                  <span>GPS Coordinates</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns.catchment}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, catchment: e.target.checked })}
                  />
                  <span>Catchment Radius</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns.capacity}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, capacity: e.target.checked })}
                  />
                  <span>Capacity</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns.utilization}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, utilization: e.target.checked })}
                  />
                  <span>Utilization %</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns.staff}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, staff: e.target.checked })}
                  />
                  <span>Staff Count</span>
                </label>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th
                    onClick={() => handleSort('code')}
                    className="p-3 cursor-pointer hover:bg-slate-100 transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>Code</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('name')}
                    className="p-3 cursor-pointer hover:bg-slate-100 transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>Campus Name</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-3">Type</th>
                  {visibleColumns.coordinates && <th className="p-3">GPS Coordinates</th>}
                  {visibleColumns.catchment && <th className="p-3">Catchment</th>}
                  {visibleColumns.capacity && <th className="p-3">Capacity</th>}
                  <th className="p-3">Enrolled</th>
                  {visibleColumns.utilization && <th className="p-3">Utilization</th>}
                  {visibleColumns.staff && <th className="p-3">Staff</th>}
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedCampuses.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400">
                      No campuses match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedCampuses.map((c) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-50/80 transition ${
                        selectedCampus?.id === c.id ? 'bg-blue-50/60 font-semibold' : ''
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {c.code}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-[11px] text-slate-400">{c.address || c.city}</div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.isMainCampus
                              ? 'bg-blue-100 text-blue-700'
                              : c.campusType === 'EARLY_YEARS'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {c.isMainCampus ? 'Main Campus' : c.campusType}
                        </span>
                      </td>
                      {visibleColumns.coordinates && (
                        <td className="p-3 font-mono text-[11px] text-slate-600">
                          {c.latitude ? `${c.latitude.toFixed(4)}, ${c.longitude?.toFixed(4)}` : 'Unmapped'}
                        </td>
                      )}
                      {visibleColumns.catchment && (
                        <td className="p-3 font-medium text-slate-700">
                          {c.catchmentRadiusKm} km
                        </td>
                      )}
                      {visibleColumns.capacity && (
                        <td className="p-3 text-slate-700">
                          {c.capacity} desks
                        </td>
                      )}
                      <td className="p-3 font-bold text-slate-900">
                        {c.enrolledCount}
                      </td>
                      {visibleColumns.utilization && (
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              c.utilizationRate > 100
                                ? 'bg-rose-100 text-rose-700'
                                : c.utilizationRate > 80
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {c.utilizationRate}%
                          </span>
                        </td>
                      )}
                      {visibleColumns.staff && (
                        <td className="p-3 text-slate-600">
                          {c.staffCount} staff
                        </td>
                      )}
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedCampus(c);
                              setActiveTab('MAP');
                            }}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition"
                            title="View on Map"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                            title="Edit GIS Coordinates"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Rule 24 Enterprise Pagination Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <span>
                Showing <strong>{Math.min(sortedCampuses.length, (currentPage - 1) * pageSize + 1)}</strong> to{' '}
                <strong>{Math.min(sortedCampuses.length, currentPage * pageSize)}</strong> of{' '}
                <strong>{sortedCampuses.length}</strong> campuses
              </span>

              {/* Page Size Selector */}
              <div className="flex items-center gap-1.5 ml-2">
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition font-semibold"
              >
                Previous
              </button>
              <span className="font-bold text-slate-800">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INTER-CAMPUS DISTANCE & TRANSIT MATRIX */}
      {activeTab === 'DISTANCE' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Pairwise Inter-Campus Distance Matrix</h2>
                <p className="text-xs text-slate-500 mt-0.5">Calculated using the Haversine great-circle formula with local urban transit buffer times for Lusaka.</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {distanceMatrix.length} Inter-Branch Corridors
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Origin Branch</th>
                    <th className="p-3">Destination Branch</th>
                    <th className="p-3">Aerial Distance (km)</th>
                    <th className="p-3">Est. Road Drive Time</th>
                    <th className="p-3">Shuttle Line Available</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {distanceMatrix.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        Insufficient campus coordinates to compute matrix.
                      </td>
                    </tr>
                  ) : (
                    distanceMatrix.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">
                          {item.fromCampusName} ({item.fromCampusCode})
                        </td>
                        <td className="p-3 font-bold text-slate-900">
                          {item.toCampusName} ({item.toCampusCode})
                        </td>
                        <td className="p-3 font-mono font-bold text-blue-600">
                          {item.distanceKm.toFixed(2)} km
                        </td>
                        <td className="p-3 text-slate-700 font-semibold">
                          ~{item.estimatedDriveMinutes} mins
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Daily Route Active
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Bus Shuttles List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bus className="w-4 h-4 text-blue-600" />
              Active Inter-Campus Transport Shuttles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {campuses.flatMap((c) =>
                c.transportRoutes.map((r) => (
                  <div key={r.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-700 text-xs bg-blue-100 px-2 py-0.5 rounded">{r.routeCode}</span>
                      <span className="text-[11px] text-slate-500 font-mono">{r.vehicleReg || 'BAX 2939 ZM'}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs">{r.routeName}</div>
                    <div className="text-[11px] text-slate-600 space-y-1">
                      <div>Capacity: <strong>{r.capacity} seats</strong></div>
                      <div>Stops Count: <strong>{r.stops?.length || 4} transit stops</strong></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ADMISSIONS CATCHMENT & NEAREST CAMPUS FINDER */}
      {activeTab === 'CALCULATOR' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 md:col-span-1">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              Learner Feeder Zone Lookup
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Select a residential neighborhood in Lusaka or provide applicant GPS coordinates to determine the nearest school branch and catchment compliance.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Preset Feeder Area:</label>
                <select
                  value={calculatorInput.presetArea}
                  onChange={(e) => handleSelectPreset(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  {PRESET_AREAS.map((a) => (
                    <option key={a.name} value={a.name}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Latitude:</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={calculatorInput.latitude}
                    onChange={(e) => setCalculatorInput({ ...calculatorInput, latitude: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Longitude:</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={calculatorInput.longitude}
                    onChange={(e) => setCalculatorInput({ ...calculatorInput, longitude: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs"
                  />
                </div>
              </div>

              <button
                onClick={() => runNearestCalculation(calculatorInput.latitude, calculatorInput.longitude)}
                disabled={calculatingNearest}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
              >
                {calculatingNearest ? 'Calculating...' : 'Evaluate Catchment & Distance'}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 md:col-span-2">
            <h3 className="text-sm font-bold text-slate-900">Spatial Admissions Recommendations</h3>
            {!calculatorResult ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Click &quot;Evaluate Catchment &amp; Distance&quot; or click anywhere on the map to view branch recommendations.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Nearest Branch Card */}
                <div className="p-5 rounded-2xl border-2 border-blue-500 bg-blue-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-600 text-white">
                      Recommended Primary Feeder Branch
                    </span>
                    <span className="font-mono text-xs font-bold text-blue-900">
                      {calculatorResult.nearest.distanceKm.toFixed(2)} km away
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-slate-900">{calculatorResult.nearest.campus.name}</h4>
                    <p className="text-xs text-slate-500">{calculatorResult.nearest.campus.address || calculatorResult.nearest.campus.city}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs border-t border-blue-200/60">
                    <div>
                      <span className="text-slate-500 block">Transit Time:</span>
                      <strong className="text-slate-900">~{calculatorResult.nearest.estimatedDriveMinutes} mins</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Catchment Status:</span>
                      <strong className={calculatorResult.nearest.isWithinCatchment ? 'text-emerald-700 font-bold' : 'text-amber-700'}>
                        {calculatorResult.nearest.isWithinCatchment ? '✓ Inside Catchment' : 'Outside Catchment'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Spare Capacity:</span>
                      <strong className="text-slate-900">{calculatorResult.nearest.spareCapacity} vacancies</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Branch Code:</span>
                      <strong className="text-slate-900">{calculatorResult.nearest.campus.code}</strong>
                    </div>
                  </div>
                </div>

                {/* All Other Campuses Distance Comparison */}
                <div>
                  <h5 className="font-bold text-xs text-slate-700 mb-2">Distance to Other School Branches:</h5>
                  <div className="space-y-2">
                    {calculatorResult.allRecommendations.slice(1).map((rec: any) => (
                      <div key={rec.campus.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs">
                        <div>
                          <strong className="text-slate-800">{rec.campus.name}</strong>
                          <span className="text-[11px] text-slate-400 ml-2">({rec.campus.code})</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-slate-600">{rec.distanceKm.toFixed(2)} km (~{rec.estimatedDriveMinutes} mins)</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rec.isWithinCatchment ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                            {rec.isWithinCatchment ? 'In Catchment' : 'Out of Zone'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Register or Edit Branch */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingCampus ? `Edit Campus GIS: ${editingCampus.name}` : 'Register New Campus Branch'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Campus Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Copperbelt Campus"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Branch Code *</label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingCampus)}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. CB"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Latitude (-90 to +90) *</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Longitude (-180 to +180) *</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Catchment (km)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.catchmentRadiusKm}
                    onChange={(e) => setFormData({ ...formData, catchmentRadiusKm: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Capacity (Desks)</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Type</label>
                  <select
                    value={formData.campusType}
                    onChange={(e) => setFormData({ ...formData, campusType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                  >
                    <option value="BRANCH">Standard Branch</option>
                    <option value="EARLY_YEARS">Early Years Annex</option>
                    <option value="SPORTS_COMPLEX">Sports & Recreation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Physical Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Plot number, Street name, Suburb"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Head Teacher</label>
                  <input
                    type="text"
                    value={formData.headTeacherName}
                    onChange={(e) => setFormData({ ...formData, headTeacherName: e.target.value })}
                    placeholder="Head of Branch"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Branch Email</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="branch@edusphere.co.zm"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
                >
                  {editingCampus ? 'Update GIS' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
