// src/components/Sidebar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardCheck,
  CreditCard,
  Briefcase,
  HeartHandshake,
  ShieldCheck,
  Compass,
  CalendarCheck,
  Calendar,
  Building2,
  DollarSign,
  Bed,
  Sliders,
  Lock,
  Boxes,
  MessageSquare,
  FileText,
  ChevronDown,
  MapPin,
} from 'lucide-react';
import { useCampus } from './CampusContext';
import { loadAppSettings, checkModuleEntitlement, AppSettings } from '@/lib/appSettings';
import {
  loadActiveUser,
  UserSecurityProfile,
  UserRole,
  hasPermission,
  ModulePermissionKey,
} from '@/lib/authPermissions';

export interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: string;
  moduleKey?: ModulePermissionKey;
  allowedRoles?: UserRole[];
  campusLock?: 'MUSHITALA' | 'URBAN';
}

export interface NavCategory {
  id: string;
  title: string;
  icon: any;
  items: NavItem[];
}

const CATEGORIES: NavCategory[] = [
  {
    id: 'academic',
    title: 'Academic & Learners',
    icon: GraduationCap,
    items: [
      {
        href: '/admissions',
        label: 'Admissions & SIS',
        icon: Users,
        moduleKey: 'admissions',
        allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACADEMIC_HEAD', 'BURSAR'],
      },
      {
        href: '/attendance',
        label: 'Operations & Attendance',
        icon: CalendarCheck,
        badge: 'Live',
        moduleKey: 'attendance',
        allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACADEMIC_HEAD', 'BOARDING_MASTER'],
      },
      {
        href: '/academics',
        label: 'Academics & Reports',
        icon: GraduationCap,
        moduleKey: 'academics',
        allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACADEMIC_HEAD', 'TEACHER'],
      },
      {
        href: '/teacher',
        label: 'Teacher Workspace',
        icon: ClipboardCheck,
        moduleKey: 'teacher',
        allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACADEMIC_HEAD', 'TEACHER'],
      },
    ],
  },
  {
    id: 'operations',
    title: 'Operations & Finance',
    icon: DollarSign,
    items: [
      {
        href: '/finance',
        label: 'Fees & Expenditures',
        icon: DollarSign,
        badge: 'Ledger',
        moduleKey: 'fees',
        allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'FINANCE_DIRECTOR', 'BURSAR'],
      },
      {
        href: '/boarding',
        label: 'Boarding Houses & Village',
        icon: Bed,
        badge: 'Village',
        moduleKey: 'boarding',
        allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'BOARDING_MASTER'],
        campusLock: 'MUSHITALA',
      },
      {
        href: '/hr',
        label: 'Staff & HR Suite',
        icon: Briefcase,
        badge: 'TCZ',
        moduleKey: 'hr',
        allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'HR_OFFICER'],
      },
      {
        href: '/gis',
        label: 'Solwezi Campuses & GIS',
        icon: Compass,
        moduleKey: 'gis',
        allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'ESTATE_MANAGER', 'FINANCE_DIRECTOR'],
      },
      {
        href: '/assets',
        label: 'School Asset Manager',
        icon: Boxes,
        badge: 'Capital',
        moduleKey: 'assets',
        allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'ESTATE_MANAGER', 'FINANCE_DIRECTOR', 'BURSAR'],
      },
    ],
  },
  {
    id: 'executive',
    title: 'Core & Executive',
    icon: LayoutDashboard,
    items: [
      {
        href: '/',
        label: 'Executive Dashboard',
        icon: LayoutDashboard,
        allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'FINANCE_DIRECTOR', 'BURSAR', 'ACADEMIC_HEAD', 'ESTATE_MANAGER', 'HR_OFFICER'],
      },
      {
        href: '/messages',
        label: 'In-App Messaging',
        icon: MessageSquare,
        badge: 'WhatsApp',
      },
      {
        href: '/documents',
        label: 'Document Generator',
        icon: FileText,
        badge: 'Letters',
        allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACADEMIC_HEAD', 'HR_OFFICER', 'BURSAR'],
      },
      {
        href: '/calendar',
        label: 'School Calendar & Events',
        icon: Calendar,
        badge: '2026',
        moduleKey: 'calendar',
      },
    ],
  },
  {
    id: 'portals',
    title: 'Portals & Guardians',
    icon: HeartHandshake,
    items: [
      {
        href: '/parent',
        label: 'Parent Portal',
        icon: HeartHandshake,
        moduleKey: 'parentPortal',
        allowedRoles: ['PARENT', 'PRINCIPAL', 'SUPER_ADMIN'],
      },
    ],
  },
  {
    id: 'admin',
    title: 'Platform Administration',
    icon: ShieldCheck,
    items: [
      {
        href: '/admin',
        label: 'Administration & Settings',
        icon: ShieldCheck,
        badge: 'Admin',
        allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL'],
      },
    ],
  },
];

const STORAGE_COLLAPSED_KEY = 'edusphere_sidebar_collapsed_categories_v2';

export function Sidebar() {
  const pathname = usePathname();
  const { campusInfo, isCampusRestricted, selectedCampus } = useCampus();
  const [settings, setSettings] = useState<AppSettings>(() => loadAppSettings());
  const [currentUser, setCurrentUser] = useState<UserSecurityProfile>(() => loadActiveUser());
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Sync settings and active user
  useEffect(() => {
    const handleSettingsUpdate = () => setSettings(loadAppSettings());
    const handleUserUpdate = () => setCurrentUser(loadActiveUser());

    window.addEventListener('storage', handleSettingsUpdate);
    window.addEventListener('storage', handleUserUpdate);
    window.addEventListener('edusphere:settings-updated', handleSettingsUpdate);
    window.addEventListener('edusphere:user-updated', handleUserUpdate);

    // Load persisted collapsed state
    try {
      const saved = localStorage.getItem(STORAGE_COLLAPSED_KEY);
      if (saved) {
        setCollapsedCategories(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }

    return () => {
      window.removeEventListener('storage', handleSettingsUpdate);
      window.removeEventListener('storage', handleUserUpdate);
      window.removeEventListener('edusphere:settings-updated', handleSettingsUpdate);
      window.removeEventListener('edusphere:user-updated', handleUserUpdate);
    };
  }, []);

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories((prev) => {
      const updated = { ...prev, [categoryId]: !prev[categoryId] };
      try {
        localStorage.setItem(STORAGE_COLLAPSED_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Filter items by active user role, permissions, and campus
  const isItemVisible = (item: NavItem): boolean => {
    // 1. Check explicit role restrictions
    if (item.allowedRoles && !item.allowedRoles.includes(currentUser.role)) {
      return false;
    }

    // 2. Check granular permission if moduleKey defined
    if (item.moduleKey && !hasPermission(currentUser.role, item.moduleKey, 'view')) {
      return false;
    }

    // 3. Check campus restrictions (e.g. Boarding only exists at Mushitala)
    if (item.campusLock && currentUser.campusId === 'URBAN') {
      return false;
    }

    return true;
  };

  // Filter categories that have at least one visible item
  const visibleCategories = CATEGORIES.map((cat) => ({
    ...cat,
    visibleItems: cat.items.filter(isItemVisible),
  })).filter((cat) => cat.visibleItems.length > 0);

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-4 min-h-[calc(100vh-5rem)]">
      <div className="space-y-5">
        {/* Active Campus Status Badge */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs min-w-0">
              <Building2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span className="truncate">{campusInfo.name}</span>
            </div>
            {isCampusRestricted && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 shrink-0">
                <MapPin className="w-2.5 h-2.5" />
                Locked
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">{campusInfo.type}</p>
          <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-slate-600 border-t border-slate-200/60 pt-1.5">
            <span>Enrolled: <strong className="text-blue-900">{campusInfo.enrolled}</strong></span>
            <span>Capacity: <strong className="text-slate-800">{campusInfo.capacity}</strong></span>
          </div>
        </div>

        {/* Collapsible Categorized Workspaces */}
        <div className="space-y-4">
          {visibleCategories.map((cat) => {
            const hasActiveRoute = cat.visibleItems.some((item) => pathname === item.href);
            // Default to open if contains active route, otherwise check saved state
            const isCollapsed = hasActiveRoute ? false : !!collapsedCategories[cat.id];
            const CatIcon = cat.icon;

            return (
              <div key={cat.id} className="space-y-1">
                {/* Collapsible Category Header */}
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition select-none group"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <CatIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-900 shrink-0" />
                    <span className="truncate">{cat.title}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-slate-200/70 text-slate-700">
                      {cat.visibleItems.length}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                        isCollapsed ? '-rotate-90' : 'rotate-0'
                      }`}
                    />
                  </div>
                </button>

                {/* Category Items List */}
                {!isCollapsed && (
                  <nav className="space-y-0.5 pt-0.5 pl-1 animate-in fade-in duration-150">
                    {cat.visibleItems.map((item) => {
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
                          prefetch={true}
                          className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition ${
                            isActive
                              ? 'bg-blue-900 text-white shadow-xs shadow-blue-900/30 font-bold'
                              : isUnsubscribed || isDisabled
                              ? 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                isActive
                                  ? 'text-amber-300'
                                  : isUnsubscribed || isDisabled
                                  ? 'text-slate-300'
                                  : 'text-slate-400'
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {badgeText && (
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                                isActive
                                  ? 'bg-amber-400 text-slate-900'
                                  : isUnsubscribed
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300 font-extrabold'
                                  : isDisabled
                                  ? 'bg-slate-100 text-slate-500 border border-slate-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                              }`}
                            >
                              {badgeText}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                )}
              </div>
            );
          })}
        </div>

        {/* Solwezi Mining Corridor Operational Compliance */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-950 rounded-xl p-3 text-white text-xs shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-300 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Solwezi Operations Online</span>
          </div>
          <p className="text-[10px] text-blue-100 mt-1 leading-relaxed">
            Kansanshi Boarding & Mushitala Day linked via high-speed failover. 250kVA generator standby active.
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
        EduSphere SMIS • Legacy School Solwezi
      </div>
    </aside>
  );
}
