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
  MessageSquare,
  FileText,
} from 'lucide-react';
import { useCampus, CampusId } from './CampusContext';
import { NwuchasLogo } from './NwuchasLogo';
import { OfflineIndicator } from './OfflineIndicator';
import { MobileBottomNav } from './MobileBottomNav';
import { loadAppSettings, checkModuleEntitlement, AppSettings, DEFAULT_APP_SETTINGS } from '@/lib/appSettings';
import {
  loadActiveUser,
  UserSecurityProfile,
  UserRole,
  hasPermission,
  ModulePermissionKey,
} from '@/lib/authPermissions';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: string;
  moduleKey?: ModulePermissionKey;
  allowedRoles?: UserRole[];
  campusLock?: 'MUSHITALA' | 'URBAN';
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Executive Dashboard', icon: LayoutDashboard, allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'FINANCE_DIRECTOR', 'BURSAR', 'ACADEMIC_HEAD', 'ESTATE_MANAGER', 'HR_OFFICER'] },
  { href: '/messages', label: 'In-App Messaging', icon: MessageSquare, badge: 'WhatsApp' },
  { href: '/documents', label: 'Document Generator', icon: FileText, badge: 'Letters', allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACADEMIC_HEAD', 'HR_OFFICER', 'BURSAR'] },
  { href: '/attendance', label: 'Operations & Attendance', icon: CalendarCheck, badge: 'Live', moduleKey: 'attendance', allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACADEMIC_HEAD', 'BOARDING_MASTER'] },
  { href: '/calendar', label: 'School Calendar & Birthdays', icon: Calendar, badge: '2026', moduleKey: 'calendar' },
  { href: '/boarding', label: 'Boarding Houses & Village', icon: Bed, badge: 'Village', moduleKey: 'boarding', allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'BOARDING_MASTER'], campusLock: 'MUSHITALA' },
  { href: '/finance', label: 'Fees & Expenditures', icon: DollarSign, badge: 'Ledger', moduleKey: 'fees', allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'FINANCE_DIRECTOR', 'BURSAR'] },
  { href: '/assets', label: 'School Asset Manager', icon: Boxes, badge: 'Capital', moduleKey: 'assets', allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'ESTATE_MANAGER', 'FINANCE_DIRECTOR', 'BURSAR'] },
  { href: '/hr', label: 'Staff & HR Suite', icon: Briefcase, badge: 'TCZ', moduleKey: 'hr', allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'HR_OFFICER'] },
  { href: '/gis', label: 'Solwezi Campuses & GIS', icon: Compass, moduleKey: 'gis', allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'ESTATE_MANAGER', 'FINANCE_DIRECTOR'] },
  { href: '/admissions', label: 'Admissions & SIS', icon: Users, moduleKey: 'admissions', allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACADEMIC_HEAD', 'BURSAR'] },
  { href: '/academics', label: 'Academics & Reports', icon: GraduationCap, moduleKey: 'academics', allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACADEMIC_HEAD', 'TEACHER'] },
  { href: '/teacher', label: 'Teacher Workspace', icon: ClipboardCheck, moduleKey: 'teacher', allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACADEMIC_HEAD', 'TEACHER'] },
  { href: '/parent', label: 'Parent Portal', icon: HeartHandshake, moduleKey: 'parentPortal', allowedRoles: ['PARENT', 'PRINCIPAL', 'SUPER_ADMIN'] },
  { href: '/admin', label: 'Administration & Settings', icon: ShieldCheck, badge: 'Admin', allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL'] },
];

export function Navbar() {
  const pathname = usePathname();
  const { selectedCampus, setSelectedCampus, campusInfo, allowedCampuses, isCampusRestricted } = useCampus();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [currentUser, setCurrentUser] = useState<UserSecurityProfile>(() => loadActiveUser());

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Sync settings and active user
  useEffect(() => {
    const handleSettingsUpdate = () => setSettings(loadAppSettings());
    const handleUserUpdate = () => setCurrentUser(loadActiveUser());

    handleSettingsUpdate();
    handleUserUpdate();

    window.addEventListener('storage', handleSettingsUpdate);
    window.addEventListener('storage', handleUserUpdate);
    window.addEventListener('edusphere:settings-updated', handleSettingsUpdate);
    window.addEventListener('edusphere:user-updated', handleUserUpdate);
    return () => {
      window.removeEventListener('storage', handleSettingsUpdate);
      window.removeEventListener('storage', handleUserUpdate);
      window.removeEventListener('edusphere:settings-updated', handleSettingsUpdate);
      window.removeEventListener('edusphere:user-updated', handleUserUpdate);
    };
  }, []);

  const isItemVisible = (item: NavItem): boolean => {
    if (item.allowedRoles && !item.allowedRoles.includes(currentUser.role)) {
      return false;
    }
    if (item.moduleKey && !hasPermission(currentUser.role, item.moduleKey, 'view')) {
      return false;
    }
    if (item.campusLock && currentUser.campusId === 'URBAN') {
      return false;
    }
    return true;
  };

  const visibleNavItems = NAV_ITEMS.filter(isItemVisible);

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="w-full px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & School Identity from Official Emblem */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/" className="flex items-center hover:opacity-95 transition">
                <NwuchasLogo variant="compact" size="md" />
              </Link>
            </div>

            {/* Center: Campus Switcher (Management Control) */}
            {allowedCampuses.length === 1 ? (
              <div className="hidden lg:flex items-center gap-2 bg-indigo-50 border border-indigo-200/80 text-indigo-950 px-3 py-1.5 rounded-xl shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="text-xs font-bold">{allowedCampuses[0].name}</span>
                <span className="text-[10px] font-bold uppercase bg-indigo-200/60 text-indigo-800 px-1.5 py-0.5 rounded">
                  Assigned Location
                </span>
              </div>
            ) : (
              <div className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shadow-inner shrink-0">
                {allowedCampuses.map((camp) => {
                  const isSelected = selectedCampus === camp.id;
                  return (
                    <button
                      key={camp.id}
                      type="button"
                      onClick={() => setSelectedCampus(camp.id)}
                      className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#007B99] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {camp.id === 'ALL' ? (
                        <Layers className="w-3.5 h-3.5 shrink-0" />
                      ) : camp.id === 'MUSHITALA' ? (
                        <Bed className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <Sun className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{camp.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Quick Links & Active User */}
            <div className="flex items-center gap-2 sm:gap-3">
              <OfflineIndicator />

              <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <Link
                  href="/messages"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-blue-900 hover:bg-slate-100 transition relative"
                  title="In-App Messaging"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span className="hidden xl:inline">Messages</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1 right-1" />
                </Link>

                <Link
                  href="/documents"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-blue-900 hover:bg-slate-100 transition"
                  title="Document Generator"
                >
                  <FileText className="w-4 h-4 text-blue-700" />
                  <span className="hidden xl:inline">Documents</span>
                </Link>

                <div
                  className="w-8 h-8 rounded-full bg-[#007B99] text-white font-bold text-xs flex items-center justify-center ring-2 ring-sky-100 shadow-2xs ml-1"
                  title={`${currentUser.fullName} — ${currentUser.role.replace(/_/g, ' ')}`}
                >
                  {currentUser.fullName
                    .split(' ')
                    .filter((n) => !['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Eng.'].includes(n))
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || 'ES'}
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
            {allowedCampuses.length === 1 ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">{allowedCampuses[0].name}</span>
              </div>
            ) : (
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value as CampusId)}
                className="text-xs font-bold bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 flex-1 truncate"
              >
                {allowedCampuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Responsive Mobile Drawer (Screen Width < md) */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-20 z-50 bg-slate-950/60 backdrop-blur-xs flex flex-col justify-start animate-in fade-in">
            <div className="bg-white border-b border-slate-200 p-4 max-h-[80vh] overflow-y-auto space-y-4 shadow-2xl">
              {/* Campus Status Card in Drawer */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
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
                  Management Workspaces ({visibleNavItems.length} Permitted Modules)
                </span>
                <nav className="space-y-1">
                  {visibleNavItems.map((item) => {
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
