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
  Radio,
  CreditCard,
  QrCode,
  BellRing,
  Clock,
  Sparkles,
  Shuffle,
  Gauge,
} from 'lucide-react';
import { CampusGisItem, LiveShuttleItem } from '@/components/gis/CampusMap';
import { useCampus } from '@/components/CampusContext';
import { ModuleGate } from '@/components/ModuleGate';

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

const INITIAL_SOLWEZI_CAMPUSES_GIS: CampusGisItem[] = [
  {
    id: 'LSS-MSC',
    name: 'Mushitala Campus (Near Kansanshi)',
    code: 'MSC',
    address: 'Stand # S/SOLWE/3177178, Plot 889, 890 Kansanshi Mine Road (opp. SGC Filling Station), Mushitala',
    city: 'Mushitala, Solwezi',
    phone: '+260 974 371271',
    isMainCampus: true,
    latitude: -12.151775,
    longitude: 26.424711,
    elevationMeters: 1365,
    catchmentRadiusKm: 15.0,
    capacity: 650,
    campusType: 'SECONDARY_BOARDING_WING',
    landAreaHectares: 5.4,
    facilities: [
      'Kansanshi Boys Boarding Hall (180 Beds)',
      'Kalumbila Girls Boarding Hall (170 Beds)',
      'Central Dining Hall & Industrial Kitchen',
      '250kVA Standby Low-Emission Diesel Generator',
      'Advanced STEM Physics, Chemistry & Biology Labs',
      'Full Sports Oval & Netball/Volleyball Courts',
      '24/7 Sickbay with Resident Nurse',
    ],
    contactEmail: 'mushitala@legacyschool.edu.zm',
    headTeacherName: 'Mr. Emmanuel Mwansa (Director & Principal)',
    enrolledCount: 420,
    staffCount: 26,
    classCount: 10,
    utilizationRate: 64.6,
    isOverCapacity: false,
    transportRoutes: [],
    catchmentZones: [],
  },
  {
    id: 'LSS-URB',
    name: 'Urban Campus (Solwezi Central)',
    code: 'URB',
    address: 'Opposite Kikombe School, next to Zambia Army Mess, Solwezi Central',
    city: 'Solwezi Urban, North-Western Province',
    phone: '+260 967 288578',
    isMainCampus: false,
    latitude: -12.187002,
    longitude: 26.406948,
    elevationMeters: 1358,
    catchmentRadiusKm: 6.0,
    capacity: 450,
    campusType: 'DAY_PRIMARY_ECE',
    landAreaHectares: 2.1,
    facilities: [
      'Opposite Kikombe School & Adjacent to Zambia Army Mess',
      'ECE Nursery & Reception Play Park',
      'Junior Computer Laboratory (35 Desktops)',
      'Primary Classrooms (Grades 1 to 7)',
      'Borehole Solar Pumping Station (80m)',
      'Tuckshop & Covered Dining Pavilion',
      'Minibus Terminal (Bus BAX 3192 ZM)',
    ],
    contactEmail: 'urban@legacyschool.edu.zm',
    headTeacherName: 'Mrs. Grace Tembo (MEd Early Childhood & Primary)',
    enrolledCount: 360,
    staffCount: 22,
    classCount: 11,
    utilizationRate: 80.0,
    isOverCapacity: false,
    transportRoutes: [],
    catchmentZones: [],
  },
];

const INITIAL_SOLWEZI_DISTANCE_MATRIX: DistanceMatrixItem[] = [
  {
    fromCampusId: 'LSS-MSC',
    fromCampusName: 'Mushitala Campus (Near Kansanshi)',
    fromCampusCode: 'MSC',
    toCampusId: 'LSS-URB',
    toCampusName: 'Urban Campus (Solwezi Central)',
    toCampusCode: 'URB',
    distanceKm: 4.4,
    estimatedDriveMinutes: 8,
  },
  {
    fromCampusId: 'LSS-URB',
    fromCampusName: 'Urban Campus (Solwezi Central)',
    fromCampusCode: 'URB',
    toCampusId: 'LSS-MSC',
    toCampusName: 'Mushitala Campus (Near Kansanshi)',
    toCampusCode: 'MSC',
    distanceKm: 4.4,
    estimatedDriveMinutes: 8,
  },
];

export default function GisCampusesPage() {
  const { selectedCampus: globalCampus } = useCampus();
  const [activeTab, setActiveTab] = useState<'MAP' | 'BRANCHES' | 'DISTANCE' | 'CALCULATOR'>('MAP');
  const [campuses, setCampuses] = useState<CampusGisItem[]>(() => INITIAL_SOLWEZI_CAMPUSES_GIS);
  const [distanceMatrix, setDistanceMatrix] = useState<DistanceMatrixItem[]>(() => INITIAL_SOLWEZI_DISTANCE_MATRIX);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map state
  const [selectedCampus, setSelectedCampus] = useState<CampusGisItem | null>(null);
  const [showCatchmentZones, setShowCatchmentZones] = useState(true);
  const [showTransportRoutes, setShowTransportRoutes] = useState(true);
  const [pickedLocation, setPickedLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Live Transport & Shuttle GPS Tracking State
  const [liveShuttles, setLiveShuttles] = useState<LiveShuttleItem[]>([]);
  const [boardingLogs, setBoardingLogs] = useState<any[]>([]);
  const [showAddStopModal, setShowAddStopModal] = useState(false);
  const [showBoardingModal, setShowBoardingModal] = useState(false);
  const [showAssignShuttleModal, setShowAssignShuttleModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [fleetSummary, setFleetSummary] = useState<any>(null);

  const [newStopForm, setNewStopForm] = useState({
    routeCode: 'BUS-SOL-02',
    name: '',
    latitude: '-12.1600',
    longitude: '26.4000',
    morningPickupTime: '06:50',
    afternoonDropTime: '15:35',
    studentCount: '6',
    landmark: '',
    targetCampuses: ['URB', 'MSC'],
    distanceFromPrevStopKm: '1.8',
  });

  const [assignShuttleForm, setAssignShuttleForm] = useState({
    routeCode: 'BUS-SOL-01',
    assignedCampuses: [
      'Urban Campus (Solwezi Central - opp Kikombe School / Army Mess)',
      'Mushitala Campus (Near Kansanshi)',
    ],
  });

  const [boardingForm, setBoardingForm] = useState({
    studentNumber: 'LSS-2026-0042',
    studentName: 'Bupe Mwewa',
    className: 'Form 2 Green',
    routeCode: 'BUS-SOL-02',
    stopName: 'Kansanshi Golf Estate Gate 1',
    destinationCampus: 'Mushitala Campus (Near Kansanshi)',
    method: 'NFC_MIFARE_CARD' as 'NFC_MIFARE_CARD' | 'QR_CODE_SCAN',
  });

  // Fleet Fuel Telematics Table State (Rule 24 compliant)
  const [fuelSearchQuery, setFuelSearchQuery] = useState('');
  const [fuelSortField, setFuelSortField] = useState<string>('routeCode');
  const [fuelSortOrder, setFuelSortOrder] = useState<'asc' | 'desc'>('asc');
  const [fuelCurrentPage, setFuelCurrentPage] = useState(1);
  const [fuelPageSize, setFuelPageSize] = useState(10);
  const [fuelVisibleColumns, setFuelVisibleColumns] = useState<Record<string, boolean>>({
    route: true,
    model: true,
    campuses: true,
    distance: true,
    dailyFuel: true,
    dailyCost: true,
    monthlyCost: true,
    traffic: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

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
    presetArea: 'Mushitala / Kansanshi Mine Road',
    latitude: -12.151775,
    longitude: 26.424711,
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
    city: 'Solwezi',
    phone: '',
    latitude: '-12.1750',
    longitude: '26.3920',
    catchmentRadiusKm: '6.0',
    capacity: '500',
    campusType: 'BRANCH',
    landAreaHectares: '3.0',
    contactEmail: '',
    headTeacherName: '',
  });

  // Preset Feeder Areas strictly in Solwezi
  const PRESET_AREAS = [
    { name: 'Mushitala / Kansanshi Mine Road', lat: -12.151775, lng: 26.424711 },
    { name: 'Kansanshi Golf Estate / Senior Staff Mess', lat: -12.1480, lng: 26.4120 },
    { name: 'Kikombe Residential (Opposite Kikombe School / Zambia Army Mess)', lat: -12.187002, lng: 26.406948 },
    { name: 'Solwezi Town Centre / Independence Ave', lat: -12.1825, lng: 26.3850 },
    { name: 'Kyawama Residential / Market Area', lat: -12.1930, lng: 26.3780 },
    { name: 'Kazomba Feeder Zone', lat: -12.1720, lng: 26.3760 },
    { name: 'Kimasala Feeder Area', lat: -12.1890, lng: 26.4010 },
    { name: 'Airport Area / Mipundu Corridor', lat: -12.1700, lng: 26.4250 },
    { name: 'College / Totela Suburb', lat: -12.1980, lng: 26.3950 },
  ];

  // Fetch GIS Data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gis/campuses?orgCode=EDS-ZM-SOL-001');
      const json = await res.json();
      if (json.success && json.data?.campuses?.length > 0) {
        setCampuses(json.data.campuses);
        if (json.data.distanceMatrix?.length > 0) {
          setDistanceMatrix(json.data.distanceMatrix);
        }
      } else {
        // Fallback to authoritative baseline
        setCampuses(INITIAL_SOLWEZI_CAMPUSES_GIS);
        setDistanceMatrix(INITIAL_SOLWEZI_DISTANCE_MATRIX);
      }
    } catch (err: any) {
      // Retain baseline data on network error
      setCampuses(INITIAL_SOLWEZI_CAMPUSES_GIS);
      setDistanceMatrix(INITIAL_SOLWEZI_DISTANCE_MATRIX);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransportData = async () => {
    try {
      const res = await fetch('/api/gis/transport');
      const json = await res.json();
      if (json.success && json.data) {
        setLiveShuttles(json.data.shuttles);
        setBoardingLogs(json.data.boardingLogs);
        if (json.data.fleetSummary) {
          setFleetSummary(json.data.fleetSummary);
        }
      }
    } catch (e) {
      // Keep existing state
    }
  };

  useEffect(() => {
    fetchData();
    fetchTransportData();
    runNearestCalculation(-12.151775, 26.424711);
    const interval = setInterval(() => {
      fetchTransportData();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/gis/transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_STOP',
          routeCode: newStopForm.routeCode,
          name: newStopForm.name,
          latitude: Number(newStopForm.latitude),
          longitude: Number(newStopForm.longitude),
          morningPickupTime: newStopForm.morningPickupTime,
          afternoonDropTime: newStopForm.afternoonDropTime,
          studentCount: Number(newStopForm.studentCount),
          landmark: newStopForm.landmark,
          targetCampusCodes: newStopForm.targetCampuses,
          distanceFromPrevStopKm: Number(newStopForm.distanceFromPrevStopKm),
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        setShowAddStopModal(false);
        setNewStopForm({
          routeCode: 'BUS-SOL-02',
          name: '',
          latitude: '-12.1600',
          longitude: '26.4000',
          morningPickupTime: '06:50',
          afternoonDropTime: '15:35',
          studentCount: '6',
          landmark: '',
          targetCampuses: ['URB', 'MSC'],
          distanceFromPrevStopKm: '1.8',
        });
        fetchTransportData();
        fetchData();
      } else {
        alert(json.message || 'Failed to add route stop');
      }
    } catch (err: any) {
      alert(err.message || 'Error communicating with transport service');
    }
  };

  const handleAssignShuttle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/gis/transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ASSIGN_SHUTTLE',
          routeCode: assignShuttleForm.routeCode,
          assignedCampuses: assignShuttleForm.assignedCampuses,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`✔ Shuttle ${assignShuttleForm.routeCode} updated: Serving ${assignShuttleForm.assignedCampuses.length} campuses.`);
        setShowAssignShuttleModal(false);
        fetchTransportData();
      } else {
        alert(json.message || 'Failed to update shuttle assignment');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating shuttle routing');
    }
  };

  const handleBoardStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/gis/transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BOARD_STUDENT',
          studentNumber: boardingForm.studentNumber,
          routeCode: boardingForm.routeCode,
          stopName: boardingForm.stopName,
          destinationCampus: boardingForm.destinationCampus,
          method: boardingForm.method,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`✔ Tap Verified: ${json.data.log.studentName} boarded ${json.data.log.routeCode}. SMS sent to guardian.`);
        setShowBoardingModal(false);
        fetchTransportData();
      } else {
        alert(json.message || 'Boarding log error');
      }
    } catch (err: any) {
      alert(err.message || 'Error processing student ID card');
    }
  };

  // Nearest Campus calculation trigger
  const runNearestCalculation = async (lat: number, lng: number) => {
    setCalculatingNearest(true);
    try {
      const res = await fetch('/api/gis/nearest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng, orgCode: 'EDS-ZM-SOL-001' }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        // Strict client-side filter against any residual non-Solwezi campuses
        const cleanRecs = (json.data.allRecommendations || json.data.allCampusesRanked || []).filter((r: any) => {
          const name = r.campus?.name || '';
          return !name.includes('Roma') && !name.includes('Avondale') && !name.includes('Kabulonga') && !name.includes('Woodlands') && (r.distanceKm < 50);
        });
        const cleanNearest = cleanRecs[0] || json.data.nearest;
        setCalculatorResult({
          ...json.data,
          nearest: cleanNearest,
          allRecommendations: cleanRecs,
        });
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
    <ModuleGate
      moduleKey="gis"
      moduleName="Solwezi GIS & Campus Fleet Tracking"
      moduleDescription="Leaflet interactive satellite maps, Mushitala & Urban campus spatial telemetry, shuttle fleet tracking, and student catchment analytics."
      planRequired="SOVEREIGN_ENTERPRISE"
      pricePerTermZMW={2650}
    >
      <div className="space-y-6 w-full pb-12">
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
                city: 'Solwezi',
                phone: '',
                latitude: '-12.1750',
                longitude: '26.3920',
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
            <div className="text-2xl font-black text-slate-900 mt-1">~21.0 km</div>
            <span className="text-[11px] text-indigo-600 font-medium">Solwezi Urban & Kansanshi Mine Corridor</span>
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
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold text-slate-700">Map Layers:</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-bold bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={showTransportRoutes}
                  onChange={(e) => setShowTransportRoutes(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>🚌 Road Network Transit Routes & Telematics</span>
              </label>

              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-600">
                <span>Traffic Flow:</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Clear
                </span>
                <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Moderate
                </span>
                <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Jam
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAssignShuttleModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Assign Shuttle &amp; Campuses</span>
              </button>
              <button
                onClick={() => setShowAddStopModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Route Stop</span>
              </button>
              <button
                onClick={() => setShowBoardingModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Simulate ID Card Tap</span>
              </button>
            </div>

            {selectedCampus && (
              <div className="w-full sm:w-auto flex items-center justify-between gap-2 bg-blue-50 text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200">
                <span>Focused: <strong>{selectedCampus.name}</strong></span>
                <button
                  onClick={() => setSelectedCampus(null)}
                  className="text-blue-500 hover:text-blue-700 font-bold ml-1 text-xs"
                >
                  ✕ Reset Focus
                </button>
              </div>
            )}
          </div>

      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-white text-slate-800 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-200 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Leaflet Map Component */}
      <CampusMap
        campuses={campuses}
        selectedCampusId={selectedCampus?.id || null}
        onSelectCampus={(c) => setSelectedCampus(c)}
        pickedLocation={pickedLocation}
        onPickLocation={handlePickMapLocation}
        showCatchmentZones={showCatchmentZones}
        showTransportRoutes={showTransportRoutes}
        liveShuttles={liveShuttles}
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
                <p className="text-xs text-slate-500 mt-0.5">Calculated using the Haversine great-circle formula with local Solwezi terrain buffer times.</p>
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

          {/* Active Bus Shuttles & Live Route Management */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Bus className="w-5 h-5 text-blue-600" />
                  Active Inter-Campus Shuttles &amp; Fleet Telematics Engine
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time GPS transit monitoring, multi-campus pickups/dropoffs, road network distances, fuel consumption, and live traffic congestion tracking.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowAssignShuttleModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>Assign Shuttle &amp; Campuses</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddStopModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Route Stop</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowBoardingModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Simulate Student ID Card Tap</span>
                </button>

                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                  <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  <span>Live Telematics Active</span>
                </span>
              </div>
            </div>

            {/* Shuttle Cards Grid with Multi-Campus & Traffic Telematics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {liveShuttles.map((shuttle: any) => {
                const occupancyRate = Math.round((shuttle.boardedCount / shuttle.capacity) * 100);
                const isJam = shuttle.speedKmh < 18;
                const trafficColor = isJam ? 'border-rose-300 bg-rose-50/50 text-rose-800' : shuttle.speedKmh < 32 ? 'border-amber-300 bg-amber-50/50 text-amber-800' : 'border-emerald-300 bg-emerald-50/50 text-emerald-800';

                return (
                  <div key={shuttle.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4 hover:shadow-xs transition flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs bg-blue-600 text-white px-2.5 py-1 rounded-lg shadow-2xs">
                            {shuttle.routeCode}
                          </span>
                          <span className="font-bold text-slate-900 text-xs">{shuttle.vehicleReg}</span>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${trafficColor}`}>
                          <span className={`w-2 h-2 rounded-full ${isJam ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                          {shuttle.speedKmh} km/h • {isJam ? 'Traffic Jam (+6m)' : 'Clear Flow'}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-black text-slate-900 text-sm">{shuttle.routeName}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {shuttle.model || 'Toyota Coaster'} &bull; Driver: <strong>{shuttle.driverName || 'Patrick Zulu'}</strong> ({shuttle.driverPhone || '+260 971 883920'})
                        </p>
                      </div>

                      {/* Multi-Campus Destination Badges */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Assigned Campuses Serviced:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {(shuttle.assignedCampuses || [
                            'Urban Campus (opp Kikombe School / Army Mess)',
                            'Mushitala Campus (Near Kansanshi)',
                          ]).map((campusName: string, cIdx: number) => {
                            const isUrban = campusName.includes('Urban') || campusName.includes('Kikombe');
                            return (
                              <span
                                key={cIdx}
                                className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${
                                  isUrban
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}
                              >
                                {isUrban ? '🏫 Urban (opp Kikombe)' : '🏛️ Mushitala Boarding'}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Fuel & Real Road Distance Telematics */}
                      {shuttle.fuelMetrics && (
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] space-y-1 font-mono">
                          <div className="flex justify-between text-slate-600">
                            <span>One-Way Distance:</span>
                            <strong className="text-slate-900">{shuttle.totalDistanceKm} km</strong>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Daily Round-Trip:</span>
                            <strong className="text-slate-900">{shuttle.fuelMetrics.dailyRoundTripKm} km</strong>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Daily Fuel Used:</span>
                            <strong className="text-emerald-700">{shuttle.fuelMetrics.dailyFuelLiters} Liters (~K{shuttle.fuelMetrics.dailyFuelCostZMW})</strong>
                          </div>
                          <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-100">
                            <span>Monthly Fuel (22d):</span>
                            <strong className="text-blue-700">K{shuttle.fuelMetrics.monthlyFuelCostZMW?.toLocaleString()}</strong>
                          </div>
                        </div>
                      )}

                      {/* Passenger Occupancy Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700">Passenger Load (NFC Logged):</span>
                          <span className="font-mono font-bold text-slate-900">
                            {shuttle.boardedCount} / {shuttle.capacity} seats ({occupancyRate}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              occupancyRate > 90
                                ? 'bg-rose-500'
                                : occupancyRate > 75
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, occupancyRate)}%` }}
                          />
                        </div>
                      </div>

                      {/* Next Transit Stop */}
                      <div className="p-2.5 bg-white rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Navigation className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Next Stop</span>
                            <span className="font-bold text-slate-800 text-[11px] truncate max-w-[170px] block">{shuttle.nextStop || 'Approaching Stop'}</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold font-mono text-[10px]">
                          ETA ~{shuttle.etaNextStopMinutes || 3}m
                        </span>
                      </div>
                    </div>

                    {/* Sequenced Route Stops Accordion/Summary */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Assigned Stops ({shuttle.stops?.length || 0})</span>
                        <span className="text-[10px] text-slate-400">AM &bull; PM</span>
                      </div>
                      <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                        {shuttle.stops?.map((stop: any, sIdx: number) => (
                          <div
                            key={stop.id || sIdx}
                            className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-100 text-[11px]"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-bold text-[9px] flex items-center justify-center shrink-0">
                                {sIdx + 1}
                              </span>
                              <div className="truncate">
                                <span className="font-bold text-slate-800 block truncate">{stop.name}</span>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-blue-700 text-[10px] shrink-0">
                              {stop.morningPickupTime || '07:00'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Fleet Fuel & Road Distance Telematics Ledger (Enterprise Table) */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-indigo-600" />
                    Fleet Fuel Consumption &amp; Real Road Distance Telematics Ledger
                  </h4>
                  <p className="text-xs text-slate-500">
                    Calculated using real road distances across Solwezi transit corridors at current Solwezi ERB diesel pump rate (ZMW 34.20/L).
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    placeholder="Search shuttle, route, or driver..."
                    value={fuelSearchQuery}
                    onChange={(e) => setFuelSearchQuery(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs w-56"
                  />
                  <button
                    onClick={() => {
                      const csvHeader = 'Route,Model,Registration,Driver,AssignedCampuses,OneWayKm,DailyRoundTripKm,ConsumptionRate,DailyFuelLiters,DailyFuelCostZMW,MonthlyFuelCostZMW,TrafficState\n';
                      const csvRows = liveShuttles.map((s: any) =>
                        `"${s.routeCode}","${s.model || 'Toyota Coaster'}","${s.vehicleReg}","${s.driverName}","${(s.assignedCampuses || []).join('; ')}",${s.totalDistanceKm || 0},${s.fuelMetrics?.dailyRoundTripKm || 0},${s.fuelMetrics?.consumptionRateLPer100Km || 14.5},${s.fuelMetrics?.dailyFuelLiters || 0},${s.fuelMetrics?.dailyFuelCostZMW || 0},${s.fuelMetrics?.monthlyFuelCostZMW || 0},"${s.speedKmh < 18 ? 'JAM' : 'CLEAR'}"`
                      ).join('\n');
                      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Legacy_School_Fleet_Fuel_Telematics_${new Date().toISOString().slice(0, 10)}.csv`;
                      a.click();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Shuttle / Route</th>
                      <th className="p-3">Vehicle &amp; Reg</th>
                      <th className="p-3">Assigned Campuses</th>
                      <th className="p-3 text-right">One-Way Road</th>
                      <th className="p-3 text-right">Daily Round-Trip</th>
                      <th className="p-3 text-right">Daily Fuel</th>
                      <th className="p-3 text-right">Daily Cost (ZMW)</th>
                      <th className="p-3 text-right">Monthly Budget (22d)</th>
                      <th className="p-3 text-center">Live Traffic Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {liveShuttles.map((shuttle: any) => {
                      const isJam = shuttle.speedKmh < 18;
                      return (
                        <tr key={shuttle.id} className="hover:bg-slate-50">
                          <td className="p-3">
                            <span className="font-mono font-bold text-blue-700 block">{shuttle.routeCode}</span>
                            <span className="text-[11px] text-slate-500 truncate max-w-[200px] block">{shuttle.routeName}</span>
                          </td>
                          <td className="p-3">
                            <strong className="text-slate-900 block">{shuttle.vehicleReg}</strong>
                            <span className="text-[11px] text-slate-500">{shuttle.model || 'Toyota Coaster'}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-col gap-1">
                              {(shuttle.assignedCampuses || ['Urban Campus', 'Mushitala Campus']).map((c: string, idx: number) => (
                                <span key={idx} className="text-[10.5px] font-semibold text-slate-700 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                  {c.includes('Urban') ? 'Urban (opp Kikombe)' : 'Mushitala Boarding'}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-800">
                            {shuttle.totalDistanceKm || 9.4} km
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-800">
                            {shuttle.fuelMetrics?.dailyRoundTripKm || 18.8} km
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-700">
                            {shuttle.fuelMetrics?.dailyFuelLiters || 2.67} L
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">
                            K{shuttle.fuelMetrics?.dailyFuelCostZMW?.toFixed(2) || '91.31'}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-blue-700">
                            K{shuttle.fuelMetrics?.monthlyFuelCostZMW?.toLocaleString() || '2,008'}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isJam ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isJam ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                              {isJam ? 'Traffic Jam (14 km/h)' : 'Clear (44 km/h)'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                    <tr>
                      <td colSpan={3} className="p-3 text-slate-700">Fleet Totals (All Active Shuttles):</td>
                      <td className="p-3 text-right font-mono">{liveShuttles.reduce((acc, s) => acc + (s.totalDistanceKm || 0), 0).toFixed(1)} km</td>
                      <td className="p-3 text-right font-mono">{liveShuttles.reduce((acc, s) => acc + (s.fuelMetrics?.dailyRoundTripKm || 0), 0).toFixed(1)} km</td>
                      <td className="p-3 text-right font-mono text-emerald-700">{liveShuttles.reduce((acc, s) => acc + (s.fuelMetrics?.dailyFuelLiters || 0), 0).toFixed(2)} L</td>
                      <td className="p-3 text-right font-mono">K{liveShuttles.reduce((acc, s) => acc + (s.fuelMetrics?.dailyFuelCostZMW || 0), 0).toFixed(2)}</td>
                      <td className="p-3 text-right font-mono text-blue-700">K{liveShuttles.reduce((acc, s) => acc + (s.fuelMetrics?.monthlyFuelCostZMW || 0), 0).toLocaleString()}</td>
                      <td className="p-3 text-center text-slate-500 font-normal text-[11px]">Solwezi ERB Standard</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Smart Learner Bus Boarding & ID Card Manifest (Rule 24 Compliant) */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Today's Real-Time Learner Boarding Manifest (NFC / QR Scans)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Live scan log from in-bus contactless reader terminal. Automated SMS sent to parents on tap.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {boardingLogs.length} Verified Taps Today
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Student Number</th>
                      <th className="p-3">Learner Name</th>
                      <th className="p-3">Class Cohort</th>
                      <th className="p-3">Bus Route</th>
                      <th className="p-3">Boarding Stop</th>
                      <th className="p-3">Tap Time</th>
                      <th className="p-3">Parent Notification</th>
                      <th className="p-3">Scan Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {boardingLogs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-slate-400">
                          No boarding scans recorded yet today. Click "Simulate Student ID Card Tap" above.
                        </td>
                      </tr>
                    ) : (
                      boardingLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-blue-700">{log.studentNumber}</td>
                          <td className="p-3 font-bold text-slate-900">{log.studentName}</td>
                          <td className="p-3 text-slate-700">{log.className}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold font-mono text-[10px]">
                              {log.routeCode}
                            </span>
                          </td>
                          <td className="p-3 text-slate-700 font-semibold">{log.stopName}</td>
                          <td className="p-3 font-mono text-slate-600">
                            {new Date(log.tapTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> SMS Delivered ({log.guardianPhone})
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {log.boardingMethod === 'NFC_MIFARE_CARD' ? '💳 NFC MIFARE' : '📱 2D QR Code'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Strategic Technical Advisory: Learner ID Card Bus Boarding */}
            <div className="p-5 rounded-2xl bg-linear-to-br from-indigo-50/60 to-blue-50/60 border border-indigo-200 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-sm text-indigo-950">
                  Strategic Advisory for Executive Management: Smart Transport & ID Card Boarding Architecture
                </h4>
              </div>
              <p className="text-xs text-indigo-900/90 leading-relaxed">
                As requested, here is the enterprise architectural blueprint for implementing contactless student ID card boarding across Legacy School's Solwezi shuttle fleet:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
                <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs space-y-1">
                  <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    <span>1. ID Card Technology</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-snug">
                    Standardize on <strong>MIFARE Classic 1K / DESFire 13.56 MHz NFC PVC cards</strong> with 2D QR code fallback. Dual-technology allows tap-to-board, library checkout, and cashless tuckshop purchases on one student badge.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs space-y-1">
                  <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-600" />
                    <span>2. In-Bus Validator Hardware</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-snug">
                    Mount a rugged <strong>7-inch Android In-Vehicle Telematics Tablet (NFC + GPS + 4G LTE)</strong> on the bus entrance stanchion. The tablet beeps green on tap, shows student photo, and alerts if a child boards the wrong shuttle.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs space-y-1">
                  <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <BellRing className="w-3.5 h-3.5 text-amber-600" />
                    <span>3. Instant Guardian Alerts</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-snug">
                    Upon successful tap-in, EduSphere dispatches an <strong>instant automated SMS and WhatsApp notification</strong> to parents with exact timestamp, bus ID, and pickup stop, eliminating parental anxiety.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs space-y-1">
                  <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    <span>4. Offline-First Resilience</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-snug">
                    Full offline store-and-forward capability: if the shuttle passes through low-signal pockets along Kansanshi Mine Road, taps are cached in encrypted local SQLite and automatically synced when back in 4G coverage.
                  </p>
                </div>
              </div>
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
              Select a residential neighborhood in Solwezi or provide applicant GPS coordinates to determine the nearest school branch and catchment compliance.
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
            ) : (() => {
              const nearestItem = calculatorResult?.nearest || (calculatorResult?.nearestCampus ? {
                campus: calculatorResult.nearestCampus,
                distanceKm: calculatorResult.distanceKm || 0,
                estimatedDriveMinutes: calculatorResult.estimatedDriveMinutes || 10,
                isWithinCatchment: Boolean(calculatorResult.isWithinCatchment),
                spareCapacity: 50,
              } : null);
              const allRecs = calculatorResult?.allRecommendations || calculatorResult?.allCampusesRanked || (nearestItem ? [nearestItem] : []);

              if (!nearestItem || !nearestItem.campus) {
                return (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Evaluating spatial feeder branches...
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {/* Nearest Branch Card */}
                  <div className="p-5 rounded-2xl border-2 border-blue-500 bg-blue-50/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-600 text-white">
                        Recommended Primary Feeder Branch
                      </span>
                      <span className="font-mono text-xs font-bold text-blue-900">
                        {(nearestItem.distanceKm != null ? nearestItem.distanceKm : 0).toFixed(2)} km away
                      </span>
                    </div>

                    <div>
                      <h4 className="text-lg font-black text-slate-900">{nearestItem.campus?.name}</h4>
                      <p className="text-xs text-slate-500">{nearestItem.campus?.address || nearestItem.campus?.city}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs border-t border-blue-200/60">
                      <div>
                        <span className="text-slate-500 block">Transit Time:</span>
                        <strong className="text-slate-900">~{nearestItem.estimatedDriveMinutes || 10} mins</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Catchment Status:</span>
                        <strong className={nearestItem.isWithinCatchment ? 'text-emerald-700 font-bold' : 'text-amber-700'}>
                          {nearestItem.isWithinCatchment ? '✓ Inside Catchment' : 'Outside Catchment'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Spare Capacity:</span>
                        <strong className="text-slate-900">{nearestItem.spareCapacity ?? 45} vacancies</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Branch Code:</span>
                        <strong className="text-slate-900">{nearestItem.campus?.code}</strong>
                      </div>
                    </div>
                  </div>

                  {/* All Other Campuses Distance Comparison */}
                  {allRecs.length > 1 && (
                    <div>
                      <h5 className="font-bold text-xs text-slate-700 mb-2">Distance to Other School Branches:</h5>
                      <div className="space-y-2">
                        {allRecs.slice(1).map((rec: any, idx: number) => (
                          <div key={rec.campus?.id || idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs">
                            <div>
                              <strong className="text-slate-800">{rec.campus?.name}</strong>
                              <span className="text-[11px] text-slate-400 ml-2">({rec.campus?.code})</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-slate-600">{(rec.distanceKm != null ? rec.distanceKm : 0).toFixed(2)} km (~{rec.estimatedDriveMinutes || 10} mins)</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rec.isWithinCatchment ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                                {rec.isWithinCatchment ? 'In Catchment' : 'Out of Zone'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
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
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. CB"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white text-blue-900"
                  />
                  <span className="text-[10px] text-slate-400">All fields fully editable per Enterprise Multi-Tenant policy</span>
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
      {/* MODAL 1: ADD ROUTE STOP */}
      {showAddStopModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <MapPin className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Add Learner Route Transit Stop</h3>
                  <p className="text-[11px] text-slate-500">Expand feeder pickup coverage in Solwezi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStopModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStop} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Bus Shuttle Route *</label>
                <select
                  value={newStopForm.routeCode}
                  onChange={(e) => setNewStopForm({ ...newStopForm, routeCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-blue-900"
                >
                  <option value="BUS-SOL-01">BUS-SOL-01 (Kyawama — Urban Campus Express)</option>
                  <option value="BUS-SOL-02">BUS-SOL-02 (Kansanshi Golf Estate — Mushitala Campus)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Stop / Station Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solwezi Airport Junction / Chawama Turnoff"
                  value={newStopForm.name}
                  onChange={(e) => setNewStopForm({ ...newStopForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Latitude (-90 to +90) *</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newStopForm.latitude}
                    onChange={(e) => setNewStopForm({ ...newStopForm, latitude: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Longitude (-180 to +180) *</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newStopForm.longitude}
                    onChange={(e) => setNewStopForm({ ...newStopForm, longitude: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Morning Pickup Time *</label>
                  <input
                    type="time"
                    required
                    value={newStopForm.morningPickupTime}
                    onChange={(e) => setNewStopForm({ ...newStopForm, morningPickupTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Afternoon Dropoff Time *</label>
                  <input
                    type="time"
                    required
                    value={newStopForm.afternoonDropTime}
                    onChange={(e) => setNewStopForm({ ...newStopForm, afternoonDropTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Recognizable Landmark</label>
                <input
                  type="text"
                  placeholder="e.g. Opposite Kikombe School next to Zambia Army Mess"
                  value={newStopForm.landmark}
                  onChange={(e) => setNewStopForm({ ...newStopForm, landmark: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Destination Campuses for this Stop *</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={newStopForm.targetCampuses.includes('URB')}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...newStopForm.targetCampuses, 'URB']
                          : newStopForm.targetCampuses.filter((c) => c !== 'URB');
                        setNewStopForm({ ...newStopForm, targetCampuses: next });
                      }}
                      className="rounded text-blue-600"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block">🏫 Urban Campus</span>
                      <span className="text-[10px] text-slate-500">Opp Kikombe / Army Mess</span>
                    </div>
                  </label>
                  <label className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={newStopForm.targetCampuses.includes('MSC')}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...newStopForm.targetCampuses, 'MSC']
                          : newStopForm.targetCampuses.filter((c) => c !== 'MSC');
                        setNewStopForm({ ...newStopForm, targetCampuses: next });
                      }}
                      className="rounded text-emerald-600"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block">🏛️ Mushitala Campus</span>
                      <span className="text-[10px] text-slate-500">Boarding & Secondary</span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Road Distance from Previous Stop (km) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.2"
                  max="40"
                  required
                  value={newStopForm.distanceFromPrevStopKm}
                  onChange={(e) => setNewStopForm({ ...newStopForm, distanceFromPrevStopKm: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  placeholder="e.g. 1.8"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Used to automatically calculate total route distance and daily fuel consumption.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddStopModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
                >
                  Add Stop to Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SIMULATE STUDENT ID CARD TAP */}
      {showBoardingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <CreditCard className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Learner Bus ID Card Tap Simulator</h3>
                  <p className="text-[11px] text-slate-500">Contactless NFC / Barcode In-Bus Check-in</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBoardingModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBoardStudent} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Student to Tap In *</label>
                <select
                  value={boardingForm.studentNumber}
                  onChange={(e) => {
                    const sn = e.target.value;
                    const sampleNames: Record<string, { name: string; class: string }> = {
                      'LSS-2026-0042': { name: 'Bupe Mwewa', class: 'Form 2 Green' },
                      'LSS-2026-0043': { name: 'Mulenga Chanda', class: 'Form 2 Green' },
                      'LSS-2026-0044': { name: 'Zondani Phiri', class: 'Form 2 Green' },
                      'LSS-2026-0045': { name: 'Chilufya Tembo', class: 'Form 2 Green' },
                      'LSS-2026-0155': { name: 'Kondwani Mwewa', class: 'Grade 6 Silver' },
                      'LSS-2026-0198': { name: 'Natasha Mwewa', class: 'Reception Stars' },
                    };
                    const s = sampleNames[sn] || { name: 'Learner', class: 'Form 1 Alpha' };
                    setBoardingForm({
                      ...boardingForm,
                      studentNumber: sn,
                      studentName: s.name,
                      className: s.class,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                >
                  <option value="LSS-2026-0042">LSS-2026-0042 &bull; Bupe Mwewa (Form 2 Green)</option>
                  <option value="LSS-2026-0043">LSS-2026-0043 &bull; Mulenga Chanda (Form 2 Green)</option>
                  <option value="LSS-2026-0044">LSS-2026-0044 &bull; Zondani Phiri (Form 2 Green)</option>
                  <option value="LSS-2026-0045">LSS-2026-0045 &bull; Chilufya Tembo (Form 2 Green)</option>
                  <option value="LSS-2026-0155">LSS-2026-0155 &bull; Kondwani Mwewa (Grade 6 Silver)</option>
                  <option value="LSS-2026-0198">LSS-2026-0198 &bull; Natasha Mwewa (Reception Stars)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Bus Route *</label>
                <select
                  value={boardingForm.routeCode}
                  onChange={(e) => setBoardingForm({ ...boardingForm, routeCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="BUS-SOL-02">BUS-SOL-02 &bull; Kansanshi — Mushitala Corridor</option>
                  <option value="BUS-SOL-01">BUS-SOL-01 &bull; Kyawama — Urban Campus Express</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Boarding Stop Location *</label>
                <input
                  type="text"
                  required
                  value={boardingForm.stopName}
                  onChange={(e) => setBoardingForm({ ...boardingForm, stopName: e.target.value })}
                  placeholder="e.g. Kansanshi Golf Estate Gate 1"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Card Verification Mechanism</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={boardingForm.method === 'NFC_MIFARE_CARD'}
                      onChange={() => setBoardingForm({ ...boardingForm, method: 'NFC_MIFARE_CARD' })}
                    />
                    <span className="font-bold text-slate-800">💳 NFC MIFARE</span>
                  </label>
                  <label className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={boardingForm.method === 'QR_CODE_SCAN'}
                      onChange={() => setBoardingForm({ ...boardingForm, method: 'QR_CODE_SCAN' })}
                    />
                    <span className="font-bold text-slate-800">📱 2D QR Code</span>
                  </label>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] space-y-1">
                <span className="font-bold block">Automated Safeguarding Protocol:</span>
                <span>Tapping will verify passenger entitlement, increment the onboard bus manifest count, and trigger an automated SMS confirmation to the learner's guardian (+260 977 889900).</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBoardingModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Execute Tap & Confirm SMS</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ASSIGN SHUTTLE TO MULTIPLE STOPS & CAMPUSES */}
      {showAssignShuttleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Shuffle className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Assign Shuttle to Multiple Stops &amp; Campuses</h3>
                  <p className="text-[11px] text-slate-500">Configure multi-campus pickups and dropoffs for school fleet</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAssignShuttleModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignShuttle} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Shuttle Vehicle *</label>
                <select
                  value={assignShuttleForm.routeCode}
                  onChange={(e) => setAssignShuttleForm({ ...assignShuttleForm, routeCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                >
                  <option value="BUS-SOL-01">BUS-SOL-01 &bull; BAX 3192 ZM &bull; Kyawama — Urban — Mushitala Express</option>
                  <option value="BUS-SOL-02">BUS-SOL-02 &bull; BAL 4920 ZM &bull; Kansanshi Golf Estate — Mess — Mushitala</option>
                  <option value="BUS-SOL-03">BUS-SOL-03 &bull; BCD 8472 ZM &bull; Kazomba — Kimasala — Urban Campus Inter-Connector</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Destination Campuses for this Shuttle *</label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Select all campuses where this vehicle drops off and picks up pupils along its route:
                </p>
                <div className="space-y-2">
                  <label className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignShuttleForm.assignedCampuses.some((c) => c.includes('Urban') || c.includes('Kikombe'))}
                      onChange={(e) => {
                        const urbanLabel = 'Urban Campus (Solwezi Central - opp Kikombe School / Army Mess)';
                        const next = e.target.checked
                          ? [...assignShuttleForm.assignedCampuses.filter((c) => !c.includes('Urban') && !c.includes('Kikombe')), urbanLabel]
                          : assignShuttleForm.assignedCampuses.filter((c) => !c.includes('Urban') && !c.includes('Kikombe'));
                        setAssignShuttleForm({ ...assignShuttleForm, assignedCampuses: next });
                      }}
                      className="mt-0.5 rounded text-blue-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">🏫 Urban Campus (Solwezi Central)</span>
                      <span className="text-[11px] text-slate-500 block">Opposite Kikombe School, next to Zambia Army Mess &bull; Day Primary &amp; ECE</span>
                    </div>
                  </label>

                  <label className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignShuttleForm.assignedCampuses.some((c) => c.includes('Mushitala'))}
                      onChange={(e) => {
                        const mscLabel = 'Mushitala Campus (Near Kansanshi)';
                        const next = e.target.checked
                          ? [...assignShuttleForm.assignedCampuses.filter((c) => !c.includes('Mushitala')), mscLabel]
                          : assignShuttleForm.assignedCampuses.filter((c) => !c.includes('Mushitala'));
                        setAssignShuttleForm({ ...assignShuttleForm, assignedCampuses: next });
                      }}
                      className="mt-0.5 rounded text-emerald-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">🏛️ Mushitala Campus (Near Kansanshi)</span>
                      <span className="text-[11px] text-slate-500 block">Plot 889, Kansanshi Mine Road &bull; Secondary Wing &amp; Boarding Village</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-[11px] space-y-1">
                <span className="font-bold block">Multi-Campus Routing Logic:</span>
                <span>The vehicle first serves morning stops, drops junior learners at Urban Campus (opp Kikombe School / Zambia Army Mess), and proceeds along Kansanshi Mine Road to deliver secondary boarding learners at Mushitala Campus. Real road distances will calculate fuel metrics automatically.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignShuttleModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Multi-Campus Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </ModuleGate>
  );
}
