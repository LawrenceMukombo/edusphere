// src/components/Navbar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Calendar,
  Sparkles,
  MapPin,
  CheckCircle2,
  Bed,
  Sun,
  Layers,
  Menu,
  X,
  LayoutDashboard,
  CalendarCheck,
  DollarSign,
  Boxes,
  Briefcase,
  Compass,
  Users,
  GraduationCap,
  ClipboardCheck,
  HeartHandshake,
  Sliders,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useCampus, CampusId } from './CampusContext';
import { LegacyLogo } from './LegacyLogo';
import { OfflineIndicator } from './OfflineIndicator';
import { MobileBottomNav } from './MobileBottomNav';
import { loadAppSettings, checkModuleEntitlement, AppSettings } from '@/lib/appSettings';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: string;
  moduleKey?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Executive Dashboard', icon: LayoutDashboard },
  { href: '/attendance', label: 'Operations & Attendance', icon: CalendarCheck, badge: 'Live', moduleKey: 'attendance' },
  { href: '/calendar', label: 'School Calendar & Birthdays', icon: Calendar, badge: '2026', moduleKey: 'calendar' },
  { href: '/boarding', label: 'Boarding Houses & Village', icon: Bed, badge: 'Village', moduleKey: 'boarding' },
  { href: '/finance', label: 'Fees & Expenditures', icon: DollarSign, badge: 'Ledger', moduleKey: 'fees' },
  { href: '/assets', label: 'School Asset Manager', icon: Boxes, badge: 'Capital', moduleKey: 'assets' },
  { href: '/hr', label: 'Staff & HR Suite', icon: Briefcase, badge: 'TCZ', moduleKey: 'hr' },
  { href: '/gis', label: 'Solwezi Campuses & GIS', icon: Compass, moduleKey: 'gis' },
  { href: '/admissions', label: 'Admissions & SIS', icon: Users, moduleKey: 'admissions' },
  { href: '/academics', label: 'Academics & Reports', icon: GraduationCap, moduleKey: 'academics' },
  { href: '/teacher', label: 'Teacher Workspace', icon: ClipboardCheck, moduleKey: 'teacher' },
  { href: '/parent', label: 'Parent Portal', icon: HeartHandshake, moduleKey: 'parentPortal' },
  { href: '/settings', label: 'System Settings', icon: Sliders, badge: 'Config' },
  { href: '/admin', label: 'Platform Admin', icon: ShieldCheck },
];

export function Navbar() {
  const pathname = usePathname();
  const { selectedCampus, setSelectedCampus, campusInfo } = useCampus();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => loadAppSettings());

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Sync settings
  useEffect(() => {
    const handleUpdate = () => setSettings(loadAppSettings());
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('edusphere:settings-updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('edusphere:settings-updated', handleUpdate);
    };
  }, []);

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="w-full px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & School Identity from Official Emblem */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/" className="flex items-center hover:opacity-95 transition">
                <LegacyLogo variant="compact" size="md" />
              </Link>
            </div>

            {/* Center: Campus Switcher (Management Control) */}
            <div className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shadow-inner shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCampus('ALL')}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  selectedCampus === 'ALL'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xl:inline">All Campuses (Consolidated)</span>
                <span className="xl:hidden">All Campuses</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCampus('MUSHITALA')}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  selectedCampus === 'MUSHITALA' || selectedCampus === 'KANSANSHI'
                    ? 'bg-indigo-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bed className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden 2xl:inline">Mushitala Campus (Near Kansanshi)</span>
                <span className="2xl:hidden">Mushitala Campus</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCampus('URBAN')}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  selectedCampus === 'URBAN'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sun className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden 2xl:inline">Urban Campus (Solwezi Central)</span>
                <span className="2xl:hidden">Urban Campus</span>
              </button>
            </div>

            {/* Quick Links & Active User */}
            <div className="flex items-center gap-2 sm:gap-3">
              <OfflineIndicator />

              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
                <div
                  className="w-8 h-8 rounded-full bg-blue-900 text-amber-300 font-bold text-xs flex items-center justify-center ring-2 ring-blue-100 shadow-xs"
                  title="Mr. Emmanuel Mwansa — School Director & Principal"
                >
                  EM
                </div>
              </div>

              {/* Mobile Hamburger Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                aria-label="Toggle navigation workspaces"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
              </button>
            </div>
          </div>

          {/* Mobile Campus Selector */}
          <div className="lg:hidden pb-3 flex items-center justify-between border-t border-slate-100 pt-2 gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Campus View:</span>
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value as CampusId)}
              className="text-xs font-bold bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 flex-1 truncate"
            >
              <option value="ALL">All Campuses (Consolidated)</option>
              <option value="MUSHITALA">Mushitala Campus (Near Kansanshi - Boarding)</option>
              <option value="URBAN">Urban Campus (Solwezi Central - ECE & Primary)</option>
            </select>
          </div>
        </div>

        {/* Responsive Mobile Drawer (Screen Width < md) */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-20 z-50 bg-slate-950/60 backdrop-blur-xs flex flex-col justify-start animate-in fade-in">
            <div className="bg-white border-b border-slate-200 p-4 max-h-[80vh] overflow-y-auto space-y-4 shadow-2xl">
              {/* Campus Status Card in Drawer */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{campusInfo.name}</h4>
                    <p className="text-[10px] text-slate-500">{campusInfo.type}</p>
                  </div>
                </div>
                <div className="text-right text-[10px]">
                  <span className="text-blue-900 font-bold block">{campusInfo.enrolled} Enrolled</span>
                  <span className="text-slate-400">Cap: {campusInfo.capacity}</span>
                </div>
              </div>

              {/* Navigation Workspaces */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1.5">
                  Management Workspaces (14 Modules)
                </span>
                <nav className="space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    let badgeText = item.badge;
                    let isUnsubscribed = false;
                    let isDisabled = false;

                    if (item.moduleKey) {
                      const entitlement = checkModuleEntitlement(item.moduleKey, settings);
                      if (!entitlement.isSubscribed) {
                        isUnsubscribed = true;
                        badgeText = 'Upgrade';
                      } else if (!entitlement.isEnabled) {
                        isDisabled = true;
                        badgeText = 'Off';
                      }
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                          isActive
                            ? 'bg-blue-900 text-white font-bold shadow-sm'
                            : isUnsubscribed || isDisabled
                            ? 'text-slate-400 hover:bg-slate-50'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                          <span>{item.label}</span>
                        </div>
                        {badgeText && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                              isActive
                                ? 'bg-blue-800 text-white'
                                : isUnsubscribed
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {badgeText}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* User Profile Footer in Drawer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-900 text-amber-300 font-bold text-xs flex items-center justify-center">
                    EM
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Mr. Emmanuel Mwansa</p>
                    <p className="text-[10px] text-slate-500">School Director & Principal</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Online
                </span>
              </div>
            </div>

            {/* Click backdrop to close */}
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        onToggleDrawer={() => setMobileMenuOpen((prev) => !prev)}
        isDrawerOpen={mobileMenuOpen}
      />
    </>
  );
}
