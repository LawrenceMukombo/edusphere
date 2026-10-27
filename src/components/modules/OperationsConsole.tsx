'use client';

import { useState } from 'react';
import {
  Bus,
  Home,
  Book,
  Shield,
  QrCode,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Key,
  Users,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  Printer,
  ChevronRight,
  LogOut,
  Sparkles,
  Plus,
  Trash2,
} from 'lucide-react';
import { AllocateBedModal } from '@/components/operations/AllocateBedModal';
import { DigitalBusPassModal } from '@/components/operations/DigitalBusPassModal';
import {
  CreateHostelModal,
  CreateRoomModal,
  CreateRouteModal,
} from '@/components/operations/CampusOperationsCrudModals';
import { formatCleanEnum } from '@/lib/formatters';

interface OperationsConsoleProps {
  initialHostels?: any[];
  initialRoutes?: any[];
  initialBooks?: any[];
  initialEntitlements?: any[];
  learners?: any[];
}

export function OperationsConsole({
  initialHostels = [],
  initialRoutes = [],
  initialBooks = [],
  initialEntitlements = [],
  learners = [],
}: OperationsConsoleProps) {
  const [activeTab, setActiveTab] = useState<'hostel' | 'transport' | 'library' | 'gate' | 'entitlements'>('hostel');
  const [hostels, setHostels] = useState<any[]>(initialHostels);
  const [routes, setRoutes] = useState<any[]>(initialRoutes);
  const [books, setBooks] = useState<any[]>(initialBooks);
  const [entitlements, setEntitlements] = useState<any[]>(initialEntitlements);

  // Modals state
  const [showAllocateModal, setShowAllocateModal] = useState<boolean>(false);
  const [activeBusPassSub, setActiveBusPassSub] = useState<any | null>(null);
  const [showCreateHostelModal, setShowCreateHostelModal] = useState<boolean>(false);
  const [activeCreateRoomHostel, setActiveCreateRoomHostel] = useState<{ id: string; name: string } | null>(null);
  const [showCreateRouteModal, setShowCreateRouteModal] = useState<boolean>(false);

  // Scanner Simulator state
  const [scanToken, setScanToken] = useState<string>('NWUCHAS-BUS-NWU-2026-0001');
  const [scanGate, setScanGate] = useState<string>('Manyama Main Campus — Lumwana Turnstile');
  const [scanDirection, setScanDirection] = useState<'ENTRY' | 'EXIT'>('ENTRY');
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Learner Entitlement Lookup state
  const [learnerQuery, setLearnerQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [notice, setNotice] = useState<string>('');

  async function handleScanSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsScanning(true);
    setScanResult(null);
    setNotice('');

    try {
      // First check bus pass verification
      if (scanToken.includes('BUS')) {
        const verifyRes = await fetch(`/api/entitlements?verifyToken=${encodeURIComponent(scanToken)}`);
        const verifyData = await verifyRes.json();
        
        // Log access event
        const logRes = await fetch('/api/operations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'record_access',
            gateName: scanGate,
            direction: scanDirection,
            credentialMethod: 'QR_PASS',
            learnerId: verifyData.data?.learner?.id || null,
            qrToken: scanToken,
          }),
        });
        const logData = await logRes.json();

        setScanResult({
          valid: scanDirection === 'EXIT' ? true : verifyData.valid,
          message: scanDirection === 'EXIT'
            ? 'Emergency / Safety Exit Granted (Egress Unrestricted)'
            : verifyData.valid
            ? `Access Granted: ${verifyData.data?.learner?.firstName} ${verifyData.data?.learner?.lastName} (${verifyData.data?.learner?.studentNumber})`
            : verifyData.message || 'Pass invalid or expired',
          learner: verifyData.data?.learner,
        });
      } else {
        // Direct Gate Access check
        const logRes = await fetch('/api/operations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'record_access',
            gateName: scanGate,
            direction: scanDirection,
            credentialMethod: 'RFID_CARD',
          }),
        });
        const logData = await logRes.json();
        setScanResult({
          valid: logData.isAllowed,
          message: logData.message,
        });
      }
    } catch (err: any) {
      setScanResult({ valid: false, message: `Scanner communication error: ${err.message}` });
    } finally {
      setIsScanning(false);
    }
  }

  async function handleSearchLearner(e: React.FormEvent) {
    e.preventDefault();
    if (!learnerQuery) return;
    setIsSearching(true);
    setNotice('');

    try {
      const res = await fetch(`/api/entitlements?learnerId=${encodeURIComponent(learnerQuery)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to retrieve entitlements');

      setEntitlements(data.data || []);
      setNotice(`Loaded ${data.data?.length || 0} service privileges for student.`);
    } catch (err: any) {
      setNotice(`Error: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleReassess(learnerId: string) {
    setIsSearching(true);
    try {
      const res = await fetch('/api/entitlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reassess', learnerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reassess');
      setNotice(`Reassessed entitlements based on verified fee ledger: Payment at ${Math.round(data.data.paymentPercentage)}%.`);
      
      // Reload entitlements
      const reload = await fetch(`/api/entitlements?learnerId=${encodeURIComponent(learnerId)}`);
      const reloadData = await reload.json();
      setEntitlements(reloadData.data || []);
    } catch (err: any) {
      setNotice(`Error: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleCheckoutBed(bedId: string) {
    if (!confirm('Are you sure you want to check out this student from the hostel bed?')) return;
    try {
      const res = await fetch('/api/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkout_bed', bedId }),
      });
      if (!res.ok) throw new Error('Failed to checkout bed');
      setNotice('Bed checked out and marked as vacant.');
      // Refresh hostels
      const reload = await fetch('/api/operations?type=hostels');
      const data = await reload.json();
      setHostels(data.data || []);
    } catch (err: any) {
      setNotice(`Error: ${err.message}`);
    }
  }

  async function handleReturnBook(loanId: string) {
    try {
      const res = await fetch('/api/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'return_book', loanId }),
      });
      if (!res.ok) throw new Error('Failed to return book');
      setNotice('Book returned and copy restored to library catalogue.');
      const reload = await fetch('/api/operations?type=books');
      const data = await reload.json();
      setBooks(data.data || []);
    } catch (err: any) {
      setNotice(`Error: ${err.message}`);
    }
  }

  const refreshHostels = async () => {
    try {
      const res = await fetch('/api/operations?type=hostels');
      const data = await res.json();
      if (data.data) setHostels(data.data);
    } catch (e) {
      console.error('Failed to refresh hostels:', e);
    }
  };

  const refreshRoutes = async () => {
    try {
      const res = await fetch('/api/operations?type=routes');
      const data = await res.json();
      if (data.data) setRoutes(data.data);
    } catch (e) {
      console.error('Failed to refresh routes:', e);
    }
  };

  const handleDeleteHostel = async (hostelId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete hostel building "${name}"? Only hostels with zero occupied beds can be deleted.`)) return;
    try {
      const res = await fetch('/api/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_hostel', hostelId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete hostel');
      setNotice(`Hostel "${name}" successfully deleted.`);
      await refreshHostels();
    } catch (err: any) {
      setNotice(`Error: ${err.message}`);
    }
  };

  const handleDeleteRoom = async (roomId: string, roomNum: string) => {
    if (!confirm(`Are you sure you want to delete room "${roomNum}"?`)) return;
    try {
      const res = await fetch('/api/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_room', roomId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete room');
      setNotice(`Room "${roomNum}" successfully deleted.`);
      await refreshHostels();
    } catch (err: any) {
      setNotice(`Error: ${err.message}`);
    }
  };

  const handleDeleteBed = async (bedId: string, bedNum: string) => {
    if (!confirm(`Are you sure you want to remove bed "${bedNum}"?`)) return;
    try {
      const res = await fetch('/api/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_bed', bedId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete bed');
      setNotice(`Bed "${bedNum}" removed.`);
      await refreshHostels();
    } catch (err: any) {
      setNotice(`Error: ${err.message}`);
    }
  };

  const handleDeleteRoute = async (routeId: string, routeCode: string) => {
    if (!confirm(`Are you sure you want to delete route "${routeCode}"?`)) return;
    try {
      const res = await fetch('/api/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_route', routeId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete route');
      setNotice(`Route "${routeCode}" deleted.`);
      await refreshRoutes();
    } catch (err: any) {
      setNotice(`Error: ${err.message}`);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      {notice && (
        <div className="flex items-center gap-3 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-cyan-900 shadow-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-700" />
          <p className="text-sm font-semibold">{notice}</p>
        </div>
      )}

      {/* Top Banner & High-Level Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-800 border border-cyan-200">
              <Building2 className="h-3.5 w-3.5" /> NWUCHAS Campus Operations Hub
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
              <Shield className="h-3.5 w-3.5" /> Non-Negotiable Safety Egress
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
            Hostels, Transport, Library & Turnstile Operations
          </h2>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Real-time management of student accommodation beds, clinical shuttle passes, medical textbook circulation, and turnstile security verification.
          </p>
        </div>

        {activeTab === 'hostel' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateHostelModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-300 bg-cyan-50 px-3.5 py-2.5 text-xs font-bold text-cyan-800 hover:bg-cyan-100 transition shadow-xs"
            >
              <Plus className="h-4 w-4" /> Add Hostel Building
            </button>
            <button
              onClick={() => setShowAllocateModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-cyan-800 transition"
            >
              <Home className="h-4 w-4" /> Allocate Bed
            </button>
          </div>
        )}
        {activeTab === 'transport' && (
          <button
            onClick={() => setShowCreateRouteModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-cyan-800 transition"
          >
            <Plus className="h-4 w-4" /> Add Shuttle Route
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('hostel')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
            activeTab === 'hostel'
              ? 'bg-cyan-700 text-white shadow'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Home className="h-4 w-4" /> Hostels & Residential Halls ({hostels.length})
        </button>
        <button
          onClick={() => setActiveTab('transport')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
            activeTab === 'transport'
              ? 'bg-cyan-700 text-white shadow'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Bus className="h-4 w-4" /> Campus Bus Shuttle & QR Passes ({routes.length})
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
            activeTab === 'library'
              ? 'bg-cyan-700 text-white shadow'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Book className="h-4 w-4" /> Medical Library & Circulation ({books.length})
        </button>
        <button
          onClick={() => setActiveTab('gate')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
            activeTab === 'gate'
              ? 'bg-cyan-700 text-white shadow'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Shield className="h-4 w-4" /> Turnstile Scanner & Safety Egress
        </button>
        <button
          onClick={() => setActiveTab('entitlements')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
            activeTab === 'entitlements'
              ? 'bg-cyan-700 text-white shadow'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Key className="h-4 w-4" /> Student Entitlements Lookup
        </button>
      </div>

      {/* TAB 1: HOSTELS & RESIDENTIAL HALLS */}
      {activeTab === 'hostel' && (
        <div className="space-y-6">
          {/* Hostel Buildings Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {hostels.map((h) => {
              const totalBeds = (h.rooms || []).reduce((sum: number, r: any) => sum + (r.beds?.length || 0), 0);
              const occupiedBeds = (h.rooms || []).reduce(
                (sum: number, r: any) => sum + (r.beds || []).filter((b: any) => b.isOccupied).length,
                0
              );
              const vacantBeds = totalBeds - occupiedBeds;

              return (
                <div key={h.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-800">
                        <Home className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{h.name}</h3>
                        <p className="text-xs text-slate-500">
                          Policy: <span className="font-semibold text-slate-700">{h.genderPolicy || 'CO-ED'}</span> • Warden: {h.wardenName || 'Mrs. Mwewa'} ({h.wardenPhone || '+260977112233'})
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-800">
                      K{Number(h.feePerSemesterZMW || 2200).toLocaleString()} / Term
                    </span>
                  </div>

                  {/* Bed Occupancy Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-slate-50 p-2 border border-slate-200">
                      <span className="text-slate-500">Total Capacity</span>
                      <p className="text-base font-extrabold text-slate-900">{totalBeds || h.totalBeds || 80}</p>
                    </div>
                    <div className="rounded-lg bg-amber-50/70 p-2 border border-amber-200">
                      <span className="text-amber-800">Occupied</span>
                      <p className="text-base font-extrabold text-amber-900">{occupiedBeds}</p>
                    </div>
                    <div className="rounded-lg bg-emerald-50/70 p-2 border border-emerald-200">
                      <span className="text-emerald-800">Vacant Beds</span>
                      <p className="text-base font-extrabold text-emerald-900">{vacantBeds}</p>
                    </div>
                  </div>

                  {/* Hostel Card Actions */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                    <button
                      onClick={() => setActiveCreateRoomHostel({ id: h.id, name: h.name })}
                      className="inline-flex items-center gap-1 rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-800 hover:bg-cyan-100 transition shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Room
                    </button>
                    <button
                      onClick={() => handleDeleteHostel(h.id, h.name)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-50 transition shadow-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete Building
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Bed Inventory Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Room & Bed Allocation Roster</h3>
                <p className="text-xs text-slate-500">Current residential room assignments and check-in status</p>
              </div>
              <button
                onClick={() => setShowAllocateModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-800 border border-cyan-200 hover:bg-cyan-100 transition shadow-sm"
              >
                <Home className="h-3.5 w-3.5" /> Assign Student
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Building & Room</th>
                    <th className="px-3 py-3">Bed ID</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Allocated Student</th>
                    <th className="px-3 py-3">Check-In Date</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hostels.flatMap((h) =>
                    (h.rooms || []).flatMap((r: any) =>
                      (r.beds || []).map((b: any) => {
                        const activeAlloc = (b.allocations || []).find((a: any) => !a.checkOutDate);
                        const learner = activeAlloc?.learner;

                        return (
                          <tr
                            key={b.id}
                            onClick={() => {
                              if (!b.isOccupied) setShowAllocateModal(true);
                            }}
                            className="cursor-pointer hover:bg-slate-50 transition"
                          >
                            <td className="px-4 py-3.5">
                              <p className="font-bold text-slate-900">{h.name}</p>
                              <div className="flex items-center justify-between">
                                <p className="text-[11px] text-slate-500">{r.roomNumber} (Floor {r.floor})</p>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteRoom(r.id, `${h.name} - ${r.roomNumber}`);
                                  }}
                                  title="Delete Room"
                                  className="rounded p-0.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </td>
                            <td className="px-3 py-3.5 font-semibold text-slate-800">{b.bedNumber}</td>
                            <td className="px-3 py-3.5">
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    b.isOccupied ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                />
                                <span className="text-slate-800">
                                  {b.isOccupied ? 'Occupied' : 'Vacant'}
                                </span>
                              </span>
                            </td>
                            <td className="px-3 py-3.5">
                              {learner ? (
                                <div>
                                  <p className="font-bold text-slate-900">{learner.firstName} {learner.lastName}</p>
                                  <p className="text-[11px] text-cyan-800 font-mono">{learner.studentNumber}</p>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">Unassigned</span>
                              )}
                            </td>
                            <td className="px-3 py-3.5 text-slate-500" suppressHydrationWarning>
                              {activeAlloc ? new Date(activeAlloc.checkInDate).toLocaleDateString() : '—'}
                            </td>
                            <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                              {b.isOccupied ? (
                                <button
                                  onClick={() => handleCheckoutBed(b.id)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-50 transition shadow-xs"
                                >
                                  <LogOut className="h-3 w-3" /> Check Out
                                </button>
                              ) : (
                                <div className="inline-flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setShowAllocateModal(true)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-xs"
                                  >
                                    Assign
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBed(b.id, b.bedNumber)}
                                    title="Delete Bed"
                                    className="rounded-lg p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CAMPUS BUS TRANSPORT & QR PASSES */}
      {activeTab === 'transport' && (
        <div className="space-y-6">
          {/* Active Routes */}
          <div className="grid gap-4 md:grid-cols-2">
            {routes.map((rt) => (
              <div key={rt.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-800">
                      <Bus className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-cyan-800 uppercase">{rt.routeCode}</span>
                      <h3 className="font-bold text-slate-900">{rt.routeName}</h3>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                    ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-500">Vehicle:</span>
                    <p className="font-bold text-slate-900">{rt.vehicleReg || 'BAF 8492'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Driver:</span>
                    <p className="font-bold text-slate-900">{rt.driverName || 'Mr. Mwewa'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Capacity:</span>
                    <p className="font-bold text-slate-900">{rt.capacity || 30} Seats</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  <span className="font-bold text-slate-700">K{Number(rt.feePerSemesterZMW || 1500).toLocaleString()} / Term</span>
                  <button
                    onClick={() => handleDeleteRoute(rt.id, rt.routeCode)}
                    className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-2 py-0.5 text-xs font-bold text-rose-700 hover:bg-rose-50 transition shadow-xs"
                  >
                    <Trash2 className="h-3 w-3" /> Delete Route
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Subscribed Student Passes */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Active Student Transport Passes</h3>
                <p className="text-xs text-slate-500">Digital and RFID shuttle credentials with cryptographic verification</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Student Name & ID</th>
                    <th className="px-3 py-3">Route Code</th>
                    <th className="px-3 py-3">Cryptographic QR Pass Token</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Valid Until</th>
                    <th className="px-4 py-3 text-right">Pass Card</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {routes.flatMap((r) =>
                    (r.TransportSubscription || []).map((sub: any) => {
                      const learner = sub.learner || {};
                      return (
                        <tr
                          key={sub.id}
                          onClick={() => setActiveBusPassSub({ ...sub, route: r })}
                          className="cursor-pointer hover:bg-slate-50 transition"
                        >
                          <td className="px-4 py-3.5">
                            <p className="font-bold text-slate-900">{learner.firstName} {learner.lastName}</p>
                            <p className="text-[11px] text-cyan-800 font-mono">{learner.studentNumber}</p>
                          </td>
                          <td className="px-3 py-3.5 font-semibold text-slate-800">{r.routeCode}</td>
                          <td className="px-3 py-3.5 font-mono text-[11px] text-slate-600">
                            {sub.passQrCode}
                          </td>
                          <td className="px-3 py-3.5">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              Active Pass
                            </span>
                          </td>
                          <td className="px-3 py-3.5 text-slate-500" suppressHydrationWarning>
                            {new Date(sub.validUntil).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setActiveBusPassSub({ ...sub, route: r })}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                            >
                              <Printer className="h-3 w-3 text-slate-500" /> View Pass
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MEDICAL LIBRARY & CIRCULATION */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          {/* Books Catalogue */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Medical College Reference Library Catalogue</h3>
                <p className="text-xs text-slate-500">Textbooks, clinical manuals, and pharmacopeias available for loan</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {books.map((b) => (
                <div key={b.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-cyan-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-800">
                      {b.category || 'NURSING'}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Location: {b.shelfLocation || 'Shelf N-12'}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">{b.title}</h4>
                  <p className="text-xs text-slate-600">Author: {b.author}</p>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Total Copies: <strong className="text-slate-900">{b.totalCopies}</strong></span>
                    <span className="font-bold text-emerald-800">Available: {b.availableCopies} Copies</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Borrowing Loans */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Circulation & Borrowing Register</h3>
                <p className="text-xs text-slate-500">Active loans with overdue tracking and return management</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Book Title</th>
                    <th className="px-3 py-3">Borrower (Student)</th>
                    <th className="px-3 py-3">Borrowed Date</th>
                    <th className="px-3 py-3">Due Date</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {books.flatMap((b) =>
                    (b.loans || []).map((loan: any) => {
                      const learner = loan.learner || {};
                      const isOverdue = !loan.isReturned && new Date(loan.dueDate) < new Date();

                      return (
                        <tr key={loan.id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3.5 font-semibold text-slate-900">{b.title}</td>
                          <td className="px-3 py-3.5">
                            <p className="font-bold text-slate-900">{learner.firstName} {learner.lastName}</p>
                            <p className="text-[11px] text-cyan-800 font-mono">{learner.studentNumber}</p>
                          </td>
                          <td className="px-3 py-3.5 text-slate-500" suppressHydrationWarning>{new Date(loan.borrowedDate).toLocaleDateString()}</td>
                          <td className="px-3 py-3.5 text-slate-500" suppressHydrationWarning>{new Date(loan.dueDate).toLocaleDateString()}</td>
                          <td className="px-3 py-3.5">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  loan.isReturned
                                    ? 'bg-slate-400'
                                    : isOverdue
                                    ? 'bg-rose-500'
                                    : 'bg-emerald-500'
                                }`}
                              />
                              <span className="text-slate-800">
                                {loan.isReturned ? 'Returned' : isOverdue ? 'Overdue' : 'Borrowed'}
                              </span>
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            {!loan.isReturned && (
                              <button
                                onClick={() => handleReturnBook(loan.id)}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-xs"
                              >
                                Mark Returned
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TURNSTILE SCANNER & SAFETY EGRESS */}
      {activeTab === 'gate' && (
        <div className="space-y-6">
          {/* Statutory Safety Non-Negotiable Alert Banner */}
          <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50/70 p-5 text-emerald-950 flex items-start gap-4">
            <Shield className="h-6 w-6 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-900">
                Non-Negotiable Life Safety Regulation: Emergency Egress Guaranteed
              </h4>
              <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                In strict accordance with the Zambian National Fire Safety Code and Higher Education Campus Safeguards, <strong>emergency exits are never physically locked or administratively blocked</strong>. Gate barriers immediately release for exit regardless of student tuition balance, fee hold, or expired credential.
              </p>
            </div>
          </div>

          {/* Interactive Turnstile / Barcode Scanner */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-cyan-700" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Security Gate & Turnstile Verification Scanner</h3>
                <p className="text-xs text-slate-500">Simulate reading student RFID card, bus pass QR barcode, or exam badge</p>
              </div>
            </div>

            <form onSubmit={handleScanSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Credential / Token Scanned</label>
                  <input
                    type="text"
                    required
                    value={scanToken}
                    onChange={(e) => setScanToken(e.target.value)}
                    placeholder="e.g. NWUCHAS-BUS-NWU-2026-0001 or Student ID"
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Direction</label>
                  <select
                    value={scanDirection}
                    onChange={(e) => setScanDirection(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none"
                  >
                    <option value="ENTRY">ENTRY (Check Entitlement)</option>
                    <option value="EXIT">EXIT (Guaranteed Egress)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Access Point / Gate</label>
                <select
                  value={scanGate}
                  onChange={(e) => setScanGate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none"
                >
                  <option value="Manyama Main Campus — Lumwana Turnstile">Manyama Main Campus — Lumwana Turnstile</option>
                  <option value="Clinical Teaching Hospital Annex Gate">Clinical Teaching Hospital Annex Gate</option>
                  <option value="Florence Nightingale Residence Turnstile">Florence Nightingale Residence Turnstile</option>
                  <option value="Medical Library RFID Barrier">Medical Library RFID Barrier</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isScanning}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-cyan-800 transition disabled:opacity-50"
              >
                <Shield className="h-4 w-4" /> {isScanning ? 'Verifying...' : 'Verify Access Credential'}
              </button>
            </form>

            {/* Scan Feedback Banner */}
            {scanResult && (
              <div
                className={`mt-4 rounded-xl border-2 p-4 text-sm ${
                  scanResult.valid
                    ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950'
                    : 'border-rose-500 bg-rose-50/80 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {scanResult.valid ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                      ACCESS GRANTED — TURNSTILE RELEASED
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-rose-700" />
                      ACCESS DENIED — BARRIER LOCKED
                    </>
                  )}
                </div>
                <p className="mt-1 text-xs">{scanResult.message}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: STUDENT SERVICE ENTITLEMENTS LOOKUP */}
      {activeTab === 'entitlements' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Real-Time Fee-Backed Service Entitlements</h3>
            <p className="text-xs text-slate-500">
              Automated service entitlement calculation based on verified invoice settlement percentages (Library: 50%, Exam: 75%, Bus: 80%, Hostel: 90%).
            </p>
          </div>

          <form onSubmit={handleSearchLearner} className="flex flex-wrap gap-3">
            <input
              type="text"
              required
              value={learnerQuery}
              onChange={(e) => setLearnerQuery(e.target.value)}
              placeholder="Enter Student UUID or select from roster below"
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-cyan-800 transition disabled:opacity-50"
            >
              <Search className="h-4 w-4" /> Check Entitlements
            </button>
          </form>

          {/* Quick Learner Selector buttons */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            <span className="text-xs text-slate-500 py-1 mr-1">Quick Select:</span>
            {learners.slice(0, 5).map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  setLearnerQuery(l.id);
                  handleReassess(l.id);
                }}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
              >
                {l.firstName} {l.lastName} ({l.studentNumber})
              </button>
            ))}
          </div>

          {/* Entitlements Cards */}
          {entitlements.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Active Service Entitlements</span>
                {learnerQuery && (
                  <button
                    onClick={() => handleReassess(learnerQuery)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 hover:text-cyan-800"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Reassess Fee Ledger
                  </button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {entitlements.map((ent) => (
                  <div key={ent.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800">{ent.serviceType}</span>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          ent.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {formatCleanEnum(ent.status)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Policy Rule: <strong className="text-slate-900">{ent.grantedByPolicy || 'Ledger Assessment'}</strong>
                    </p>
                    <p className="text-[11px] text-slate-500" suppressHydrationWarning>
                      Valid Through: {new Date(ent.validUntil).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Allocate Bed */}
      {showAllocateModal && (
        <AllocateBedModal
          hostels={hostels}
          learners={learners}
          onClose={() => setShowAllocateModal(false)}
          onAllocated={async () => {
            const reload = await fetch('/api/operations?type=hostels');
            const data = await reload.json();
            setHostels(data.data || []);
            setNotice('Hostel bed allocated successfully.');
          }}
        />
      )}

      {/* Modal: Digital Bus Pass */}
      {activeBusPassSub && (
        <DigitalBusPassModal
          subscription={activeBusPassSub}
          onClose={() => setActiveBusPassSub(null)}
        />
      )}

      {/* Modal: Create Hostel Building */}
      <CreateHostelModal
        isOpen={showCreateHostelModal}
        onClose={() => setShowCreateHostelModal(false)}
        onSuccess={refreshHostels}
      />

      {/* Modal: Create Room */}
      {activeCreateRoomHostel && (
        <CreateRoomModal
          isOpen={!!activeCreateRoomHostel}
          hostelId={activeCreateRoomHostel.id}
          hostelName={activeCreateRoomHostel.name}
          onClose={() => setActiveCreateRoomHostel(null)}
          onSuccess={refreshHostels}
        />
      )}

      {/* Modal: Create Transport Route */}
      <CreateRouteModal
        isOpen={showCreateRouteModal}
        onClose={() => setShowCreateRouteModal(false)}
        onSuccess={refreshRoutes}
      />
    </div>
  );
}
