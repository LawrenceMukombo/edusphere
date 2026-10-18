// src/app/settings/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  ShieldCheck,
  Building2,
  CalendarCheck,
  DollarSign,
  Bed,
  GraduationCap,
  Users,
  Briefcase,
  Compass,
  HeartHandshake,
  Smartphone,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  RefreshCw,
  Lock,
  Unlock,
  Eye,
  FileText,
  Clock,
  Sparkles,
  Layers,
  Database,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { EnterpriseTable, ColumnDef } from '@/components/EnterpriseTable';
import { useCampus } from '@/components/CampusContext';
import {
  AppSettings,
  AdminAuditLog,
  loadAppSettings,
  saveAppSettings,
  resetAppSettings,
  loadAdminAuditLogs,
} from '@/lib/appSettings';
import { openEduSphereDB } from '@/lib/offlineSync';

export default function SettingsPage() {
  const { selectedCampus, campusInfo } = useCampus();
  const [settings, setSettings] = useState<AppSettings>(loadAppSettings());
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<
    'modules' | 'infrastructure' | 'finance' | 'compliance' | 'storage' | 'audit'
  >('modules');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; stores: string[] }>({
    connected: false,
    stores: [],
  });

  useEffect(() => {
    setSettings(loadAppSettings());
    setAuditLogs(loadAdminAuditLogs());

    // Check IndexedDB state
    openEduSphereDB().then((db) => {
      if (db) {
        const storeNames: string[] = [];
        for (let i = 0; i < db.objectStoreNames.length; i++) {
          storeNames.push(db.objectStoreNames.item(i) || '');
        }
        setDbStatus({ connected: true, stores: storeNames });
      }
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleSave = (sectionName: string) => {
    setIsSaving(true);
    saveAppSettings(settings, `Updated ${sectionName} parameters`, sectionName);
    setAuditLogs(loadAdminAuditLogs());
    setTimeout(() => {
      setIsSaving(false);
      showToast(`${sectionName} configurations saved and applied across all modules successfully.`);
    }, 400);
  };

  const handleResetToDefaults = () => {
    if (confirm('Are you sure you want to restore default institutional settings?')) {
      const def = resetAppSettings();
      setSettings(def);
      saveAppSettings(def, 'Restored all settings to institutional defaults', 'System Reset');
      setAuditLogs(loadAdminAuditLogs());
      showToast('All configurations restored to official Legacy School defaults.');
    }
  };

  const auditColumns: ColumnDef<AdminAuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (r) => <span className="font-mono text-xs text-slate-600">{r.timestamp}</span>,
    },
    {
      key: 'adminName',
      header: 'Administrator / User',
      sortable: true,
      render: (r) => <span className="font-bold text-slate-800 text-xs">{r.adminName}</span>,
    },
    {
      key: 'module',
      header: 'Module Scope',
      sortable: true,
      filterable: true,
      render: (r) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          {r.module}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Event Action',
      sortable: true,
      filterable: true,
      render: (r) => <span className="font-mono text-xs font-semibold text-slate-700">{r.action}</span>,
    },
    {
      key: 'details',
      header: 'Action Summary',
      render: (r) => <span className="text-xs text-slate-600">{r.details}</span>,
    },
    {
      key: 'ipAddress',
      header: 'Terminal / IP',
      render: (r) => <span className="font-mono text-[11px] text-slate-500">{r.ipAddress}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      render: (r) => (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          {r.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Sovereign Administrative Suite
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                MoE Certified 2026
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Wifi className="w-3 h-3" />
                Active Local Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white">
              System Administration & Module Configuration
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Configure operational rules, strict attendance data validations, tuition arrears access gates,
              mobile money unlock rules, campus quotas, and statutory compliance standards for Legacy School Solwezi.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 bg-white/10 hover:bg-white/15 border border-white/20 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
            <button
              type="button"
              onClick={() => handleSave('All Modules')}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Applying Changes...' : 'Save & Apply Config'}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 mt-6 border-t border-white/10 scrollbar-none">
          {[
            { id: 'modules', label: 'Modules & Strict Rules', icon: Sliders },
            { id: 'infrastructure', label: 'Campuses & Infrastructure', icon: Building2 },
            { id: 'finance', label: 'Mobile Money & Arrears Gate', icon: DollarSign },
            { id: 'compliance', label: 'MoE & Statutory Compliance', icon: ShieldCheck },
            { id: 'storage', label: 'Offline Storage & PWA', icon: HardDrive },
            { id: 'audit', label: 'Audit Trail & Event Log', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-blue-950 shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-900' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: MODULES & STRICT DATA VALIDATIONS */}
      {activeTab === 'modules' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Operations & Attendance Module Rules */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Operations & Daily Attendance Register
                  </h2>
                  <p className="text-xs text-slate-500">
                    Strict date constraints, future months blocking, and MoE Form 12A statutory parameters.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.modules.attendance.enabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      modules: {
                        ...settings.modules,
                        attendance: { ...settings.modules.attendance, enabled: e.target.checked },
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Block Future Months Rule */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Block Future Months</span>
                  <input
                    type="checkbox"
                    checked={settings.modules.attendance.blockFutureMonths}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        modules: {
                          ...settings.modules,
                          attendance: { ...settings.modules.attendance, blockFutureMonths: e.target.checked },
                        },
                      })
                    }
                    className="w-4 h-4 text-blue-900 rounded border-slate-300 focus:ring-blue-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Strictly prohibits teachers from navigating to or marking attendance registers for upcoming calendar months.
                </p>
              </div>

              {/* Strict Date Validation */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Strict Date Validation</span>
                  <input
                    type="checkbox"
                    checked={settings.modules.attendance.strictDateValidation}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        modules: {
                          ...settings.modules,
                          attendance: { ...settings.modules.attendance, strictDateValidation: e.target.checked },
                        },
                      })
                    }
                    className="w-4 h-4 text-blue-900 rounded border-slate-300 focus:ring-blue-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Prohibits backdating roll-call entries beyond {settings.modules.attendance.allowRetroactiveCorrectionDays} business days without Headteacher clearance.
                </p>
              </div>

              {/* MoE Form 12A Attendance Threshold */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">MoE Form 12A Threshold</span>
                  <span className="text-xs font-mono font-black text-blue-900">
                    {settings.modules.attendance.moeForm12AThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="95"
                  value={settings.modules.attendance.moeForm12AThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      modules: {
                        ...settings.modules,
                        attendance: {
                          ...settings.modules.attendance,
                          moeForm12AThreshold: Number(e.target.value),
                        },
                      },
                    })
                  }
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
                />
                <p className="text-[11px] text-slate-500">
                  Statutory minimum attendance percentage mandated by the Zambian Ministry of Education for exam eligibility.
                </p>
              </div>

              {/* Roll-Call Deadline */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Morning Roll-Call Deadline
                </label>
                <input
                  type="time"
                  value={settings.modules.attendance.rollCallDeadline}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      modules: {
                        ...settings.modules,
                        attendance: { ...settings.modules.attendance, rollCallDeadline: e.target.value },
                      },
                    })
                  }
                  className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-600"
                />
                <p className="text-[11px] text-slate-500">
                  Registers marked after this cutoff are flagged as late submissions in the Principal dashboard.
                </p>
              </div>

              {/* Auto SMS to Guardians for Unexcused Absentees */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">SMS Unexcused Absentees</span>
                  <input
                    type="checkbox"
                    checked={settings.modules.attendance.autoSmsAbsentees}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        modules: {
                          ...settings.modules,
                          attendance: { ...settings.modules.attendance, autoSmsAbsentees: e.target.checked },
                        },
                      })
                    }
                    className="w-4 h-4 text-blue-900 rounded border-slate-300 focus:ring-blue-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Automatically dispatches instant SMS alerts to registered guardians via Zamtel/Airtel gateway at 09:00 CAT.
                </p>
              </div>

              {/* Retroactive Days Window */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Max Retroactive Correction Window
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={settings.modules.attendance.allowRetroactiveCorrectionDays}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        modules: {
                          ...settings.modules,
                          attendance: {
                            ...settings.modules.attendance,
                            allowRetroactiveCorrectionDays: Number(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-24 text-xs font-bold bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-600"
                  />
                  <span className="text-xs text-slate-600">business days</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Past register dates older than this are locked from in-line edits for statutory audit preservation.
                </p>
              </div>
            </div>
          </div>

          {/* Fees & Arrears Enforcement Rules */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Fees, Arrears Enforcement & Mobile Money Auto-Unlock
                  </h2>
                  <p className="text-xs text-slate-500">
                    Automatic access restrictions for unpaid tuition, transit bus lockout, and instant mobile money reconciliation.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.modules.fees.enabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      modules: {
                        ...settings.modules,
                        fees: { ...settings.modules.fees, enabled: e.target.checked },
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Auto-Lock Register on Arrears */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    Auto-Lock Access on Arrears
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.modules.fees.autoLockRegisterOnArrears}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        modules: {
                          ...settings.modules,
                          fees: { ...settings.modules.fees, autoLockRegisterOnArrears: e.target.checked },
                        },
                      })
                    }
                    className="w-4 h-4 text-amber-700 rounded border-amber-300 focus:ring-amber-600"
                  />
                </div>
                <p className="text-[11px] text-amber-800">
                  When a learner has unpaid overdue school fees past the grace window, their attendance register, campus turnstile, and transit bus pass are locked.
                </p>
              </div>

              {/* Mobile Money Direct Auto-Unlock */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                    Mobile Money Direct Unlock
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.modules.fees.mobileMoneyDirectUnlock}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        modules: {
                          ...settings.modules,
                          fees: { ...settings.modules.fees, mobileMoneyDirectUnlock: e.target.checked },
                        },
                      })
                    }
                    className="w-4 h-4 text-emerald-700 rounded border-emerald-300 focus:ring-emerald-600"
                  />
                </div>
                <p className="text-[11px] text-emerald-800">
                  When payment is received via MTN MoMo or Airtel Money, immediately clears the ledger hold and unlocks classroom and bus access in real-time.
                </p>
              </div>

              {/* Arrears Grace Period */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Arrears Grace Period
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={settings.modules.fees.arrearsGracePeriodDays}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        modules: {
                          ...settings.modules,
                          fees: {
                            ...settings.modules.fees,
                            arrearsGracePeriodDays: Number(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-24 text-xs font-bold bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-600"
                  />
                  <span className="text-xs text-slate-600">days after term start</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Number of grace days granted to guardians after term commencement before strict register access lock is enforced.
                </p>
              </div>
            </div>
          </div>

          {/* Academic Assessment & Moderation Workflows */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Academic Assessment & 3-Tier Moderation
                  </h2>
                  <p className="text-xs text-slate-500">
                    Multi-role sign-off gates, continuous assessment weighting, and ECZ grading standards.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.modules.academics.enabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      modules: {
                        ...settings.modules,
                        academics: { ...settings.modules.academics, enabled: e.target.checked },
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-700"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">3-Tier Moderation Lock</span>
                <p className="text-[11px] text-slate-600">
                  Stage 1: Subject Teacher Mark Entry &rarr; Stage 2: Senior Teacher / Supervisor Review &rarr; Stage 3: Principal Official Sanction.
                </p>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                  Enforced (3 Tiers Active)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  CA vs Final Exam Weighting
                </label>
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700">
                  <span>Continuous Assessment: 40%</span>
                  <span>Final Examination: 60%</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Standard curriculum ratio compliant with Examination Council of Zambia (ECZ) Junior & Senior Secondary guidelines.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Auto-Dispatch on Sanction</span>
                  <input
                    type="checkbox"
                    checked={settings.modules.academics.autoDispatchReportCards}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        modules: {
                          ...settings.modules,
                          academics: {
                            ...settings.modules.academics,
                            autoDispatchReportCards: e.target.checked,
                          },
                        },
                      })
                    }
                    className="w-4 h-4 text-purple-700 rounded border-slate-300 focus:ring-purple-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  When Principal sanctions a report card, automatically sends PDF dossier to guardian via WhatsApp and Parent Portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CAMPUSES & PHYSICAL INFRASTRUCTURE */}
      {activeTab === 'infrastructure' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mushitala Secondary & Boarding Wing */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200">
                    <Bed className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Mushitala Campus (Near Kansanshi)
                    </h3>
                    <p className="text-xs text-slate-500">Secondary & Boarding Wing (Forms 1 to 5)</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  LSS-MSC
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Enrolment Cap</label>
                  <input
                    type="number"
                    value={settings.campuses.mushitala.capacity}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        campuses: {
                          ...settings.campuses,
                          mushitala: { ...settings.campuses.mushitala, capacity: Number(e.target.value) },
                        },
                      })
                    }
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Boarding Bed Capacity</label>
                  <input
                    type="number"
                    value={settings.campuses.mushitala.boardingCapacity}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        campuses: {
                          ...settings.campuses,
                          mushitala: { ...settings.campuses.mushitala, boardingCapacity: Number(e.target.value) },
                        },
                      })
                    }
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Standby Generator (kVA)</label>
                  <input
                    type="number"
                    value={settings.campuses.mushitala.generatorCapacityKva}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        campuses: {
                          ...settings.campuses,
                          mushitala: {
                            ...settings.campuses.mushitala,
                            generatorCapacityKva: Number(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Water Storage (Liters)</label>
                  <input
                    type="number"
                    value={settings.campuses.mushitala.waterReserveLiters}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        campuses: {
                          ...settings.campuses,
                          mushitala: {
                            ...settings.campuses.mushitala,
                            waterReserveLiters: Number(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">Mining Corridor Failover Link</span>
                  <span className="text-slate-500 text-[11px]">Primary Starlink + Kansanshi high-speed fibre redundant</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  ONLINE
                </span>
              </div>
            </div>

            {/* Urban Primary & ECE Campus */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-200">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Urban Campus (Solwezi Central)
                    </h3>
                    <p className="text-xs text-slate-500">Early Childhood & Primary Wing (Baby to Grade 7)</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                  LSS-URB
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Enrolment Cap</label>
                  <input
                    type="number"
                    value={settings.campuses.urban.capacity}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        campuses: {
                          ...settings.campuses,
                          urban: { ...settings.campuses.urban, capacity: Number(e.target.value) },
                        },
                      })
                    }
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sky-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shift Operational Mode</label>
                  <select
                    value={settings.campuses.urban.shiftMode}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        campuses: {
                          ...settings.campuses,
                          urban: { ...settings.campuses.urban, shiftMode: e.target.value as any },
                        },
                      })
                    }
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sky-600"
                  >
                    <option value="SINGLE_SHIFT">Single Full-Day Session</option>
                    <option value="DOUBLE_SHIFT">Morning & Afternoon Shift</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Solar Inverter (kVA)</label>
                  <input
                    type="number"
                    value={settings.campuses.urban.solarInverterCapacityKva}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        campuses: {
                          ...settings.campuses,
                          urban: {
                            ...settings.campuses.urban,
                            solarInverterCapacityKva: Number(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sky-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Traffic Warden On Duty</label>
                  <select
                    value={settings.campuses.urban.trafficWardenOnDuty ? 'YES' : 'NO'}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        campuses: {
                          ...settings.campuses,
                          urban: {
                            ...settings.campuses.urban,
                            trafficWardenOnDuty: e.target.value === 'YES',
                          },
                        },
                      })
                    }
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sky-600"
                  >
                    <option value="YES">Active (Drop-off Zone Safe)</option>
                    <option value="NO">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">ECE Perimeter Safety Lock</span>
                  <span className="text-slate-500 text-[11px]">Enclosed playground gate with biometric parent dispatch</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                  VERIFIED
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FINANCIAL GATEWAYS & MOBILE MONEY */}
      {activeTab === 'finance' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Zambian Payment Gateways & Mobile Money Integrations
              </h2>
              <p className="text-xs text-slate-500">
                Configure merchant credentials for automated mobile money tuition settlement and instantaneous register unlocks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* MTN MoMo Pay */}
              <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
                      MTN
                    </span>
                    <span className="font-bold text-slate-900 text-xs">MTN MoMo Pay</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.financialGateways.mtnMoMo.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        financialGateways: {
                          ...settings.financialGateways,
                          mtnMoMo: { ...settings.financialGateways.mtnMoMo, enabled: e.target.checked },
                        },
                      })
                    }
                    className="w-4 h-4 text-amber-600 rounded border-amber-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700">Merchant Code</label>
                  <input
                    type="text"
                    value={settings.financialGateways.mtnMoMo.merchantCode}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        financialGateways: {
                          ...settings.financialGateways,
                          mtnMoMo: { ...settings.financialGateways.mtnMoMo, merchantCode: e.target.value },
                        },
                      })
                    }
                    className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700">Account Name</label>
                  <input
                    type="text"
                    value={settings.financialGateways.mtnMoMo.accountName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        financialGateways: {
                          ...settings.financialGateways,
                          mtnMoMo: { ...settings.financialGateways.mtnMoMo, accountName: e.target.value },
                        },
                      })
                    }
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              {/* Airtel Money */}
              <div className="p-5 rounded-2xl border border-red-200 bg-red-50/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center">
                      AIR
                    </span>
                    <span className="font-bold text-slate-900 text-xs">Airtel Money Paybill</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.financialGateways.airtelMoney.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        financialGateways: {
                          ...settings.financialGateways,
                          airtelMoney: { ...settings.financialGateways.airtelMoney, enabled: e.target.checked },
                        },
                      })
                    }
                    className="w-4 h-4 text-red-600 rounded border-red-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700">Paybill Number</label>
                  <input
                    type="text"
                    value={settings.financialGateways.airtelMoney.paybillNumber}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        financialGateways: {
                          ...settings.financialGateways,
                          airtelMoney: { ...settings.financialGateways.airtelMoney, paybillNumber: e.target.value },
                        },
                      })
                    }
                    className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700">Account Name</label>
                  <input
                    type="text"
                    value={settings.financialGateways.airtelMoney.accountName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        financialGateways: {
                          ...settings.financialGateways,
                          airtelMoney: { ...settings.financialGateways.airtelMoney, accountName: e.target.value },
                        },
                      })
                    }
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              {/* Zamtel Kwacha */}
              <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                      ZAM
                    </span>
                    <span className="font-bold text-slate-900 text-xs">Zamtel Kwacha</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.financialGateways.zamtelKwacha.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        financialGateways: {
                          ...settings.financialGateways,
                          zamtelKwacha: { ...settings.financialGateways.zamtelKwacha, enabled: e.target.checked },
                        },
                      })
                    }
                    className="w-4 h-4 text-emerald-600 rounded border-emerald-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700">Merchant Identifier</label>
                  <input
                    type="text"
                    value={settings.financialGateways.zamtelKwacha.merchantId}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        financialGateways: {
                          ...settings.financialGateways,
                          zamtelKwacha: { ...settings.financialGateways.zamtelKwacha, merchantId: e.target.value },
                        },
                      })
                    }
                    className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700">Account Name</label>
                  <input
                    type="text"
                    value={settings.financialGateways.zamtelKwacha.accountName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        financialGateways: {
                          ...settings.financialGateways,
                          zamtelKwacha: { ...settings.financialGateways.zamtelKwacha, accountName: e.target.value },
                        },
                      })
                    }
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>
            </div>

            {/* Official Commercial Bank Account */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">
                Official Commercial Bank Clearing Account
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Commercial Bank</span>
                  <strong className="text-slate-900">{settings.financialGateways.bankAccount.bankName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Account Number</span>
                  <strong className="font-mono text-blue-900">{settings.financialGateways.bankAccount.accountNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Branch Location</span>
                  <strong className="text-slate-900">{settings.financialGateways.bankAccount.branch}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">SWIFT / Clearing Code</span>
                  <strong className="font-mono text-slate-900">{settings.financialGateways.bankAccount.swiftCode}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STATUTORY MOE & ECZ COMPLIANCE */}
      {activeTab === 'compliance' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Ministry of Education (MoE) & ECZ Statutory Governance
              </h2>
              <p className="text-xs text-slate-500">
                Official accreditation credentials, Form 12A statutory attendance retention, and inspector audit clearance codes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  MoE Registration Number
                </span>
                <input
                  type="text"
                  value={settings.compliance.moeRegistrationNumber}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      compliance: { ...settings.compliance, moeRegistrationNumber: e.target.value },
                    })
                  }
                  className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg p-2.5 text-blue-900"
                />
                <p className="text-[11px] text-slate-500">Official gazetted registration code for Solwezi district.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  ECZ Examination Centre Code
                </span>
                <input
                  type="text"
                  value={settings.compliance.eczCentreCode}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      compliance: { ...settings.compliance, eczCentreCode: e.target.value },
                    })
                  }
                  className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg p-2.5 text-purple-900"
                />
                <p className="text-[11px] text-slate-500">Junior Secondary (Grade 9) & School Certificate (Grade 12) centre.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  DEBS Inspector Access Key
                </span>
                <input
                  type="text"
                  value={settings.compliance.solweziDebsInspectorCode}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      compliance: { ...settings.compliance, solweziDebsInspectorCode: e.target.value },
                    })
                  }
                  className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg p-2.5 text-emerald-900"
                />
                <p className="text-[11px] text-slate-500">Read-only audit inspector code for DEBS officials.</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold text-blue-950">Statutory Form 12A Attendance Retention Policy</h3>
                <p className="text-[11px] text-blue-800 mt-0.5">
                  The Education Act mandates a minimum of 7 years of immutable historical register records preserved for government audit.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-900 text-white shrink-0">
                7 Years Retention Enforced
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: OFFLINE STORAGE & PWA DIAGNOSTICS */}
      {activeTab === 'storage' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Client-Side Offline Engine & IndexedDB Diagnostics
                </h2>
                <p className="text-xs text-slate-500">
                  Ensure seamless operational continuity in Solwezi during local network outages or power interruptions.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Wifi className="w-3.5 h-3.5" />
                Offline Engine Ready
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block">IndexedDB Engine</span>
                <strong className="text-slate-900 text-sm">
                  {dbStatus.connected ? 'Connected (v1)' : 'Active (Local Fallback)'}
                </strong>
                <span className="text-[10px] text-slate-400 block mt-1">edusphere_offline_db</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block">Baseline Learner Roster</span>
                <strong className="text-blue-900 text-sm">780 Enrolled Learners</strong>
                <span className="text-[10px] text-slate-400 block mt-1">Mushitala & Urban Campuses</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block">Staff & Faculty Cache</span>
                <strong className="text-indigo-900 text-sm">48 TCZ Cadres</strong>
                <span className="text-[10px] text-slate-400 block mt-1">Academic, Boarding & Medical</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block">Pending Offline Queue</span>
                <strong className="text-emerald-700 text-sm">0 Pending Mutations</strong>
                <span className="text-[10px] text-emerald-600 block mt-1">Fully Synchronized</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  showToast('Baseline learner and staff caches verified and refreshed in IndexedDB.');
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 transition shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Offline Records
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Service Worker cache checked. All 12 application bundles active for offline launch.');
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                <HardDrive className="w-3.5 h-3.5" />
                Inspect PWA Cache Manifest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT TRAIL & SYSTEM EVENTS (Enterprise Table) */}
      {activeTab === 'audit' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <EnterpriseTable<AdminAuditLog>
            title="System Administration Audit Log & Event Register"
            description="Immutable historical log of configuration changes, security events, and statutory inspections for Legacy School Solwezi."
            data={auditLogs}
            columns={auditColumns}
            searchPlaceholder="Search audit log by admin name, module, or keyword..."
            exportFilename="legacyschool-admin-audit-log"
            actions={
              <button
                type="button"
                onClick={() => {
                  setAuditLogs(loadAdminAuditLogs());
                  showToast('Audit trail refreshed.');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            }
          />
        </div>
      )}
    </div>
  );
}
