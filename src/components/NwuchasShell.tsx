'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  BadgeDollarSign,
  Bell,
  BookOpenCheck,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Globe,
  GraduationCap,
  HeartPulse,
  KeyRound,
  LayoutDashboard,
  Lock,
  Menu,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UsersRound,
  WalletCards,
  Wrench,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { UniversalSearchModal } from '@/components/search/UniversalSearchModal';
import { TopWelcomeBanner } from '@/components/TopWelcomeBanner';
import { NwuchasEmblemSvg } from '@/components/NwuchasLogo';
import { TwoFactorChallengeModal } from '@/components/auth/TwoFactorChallengeModal';
import { isSensitiveModule, getSensitiveModulePolicy } from '@/lib/sensitiveModules';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { InactivityAutoLockWidget, QuickPinTopBarButton } from '@/components/security/InactivityTimeoutProvider';
import { SYSTEM_VERSION } from '@/config/version';

type NavigationItem = { href: string; label: string; icon: LucideIcon; isSensitive?: boolean };
type NavigationGroup = { label: string; items: NavigationItem[] };

const groups: NavigationGroup[] = [
  {
    label: 'Academic & learners',
    items: [
      { href: '/modules/admissions', label: 'Admissions & candidate portal', icon: UsersRound, isSensitive: true },
      { href: '/modules/academics', label: 'Academics & examinations', icon: BookOpenCheck },
      { href: '/modules/attendance', label: 'Attendance & engagement', icon: ClipboardCheck },
      { href: '/modules/clinical-learning', label: 'Clinical learning', icon: HeartPulse },
    ],
  },
  {
    label: 'Operations & finance',
    items: [
      { href: '/modules/finance', label: 'Finance & payments', icon: WalletCards, isSensitive: true },
      { href: '/modules/hr', label: 'Staff & HR', icon: UsersRound, isSensitive: true },
      { href: '/modules/operations', label: 'Campus operations', icon: Building2 },
      { href: '/modules/assets', label: 'Asset register', icon: Wrench, isSensitive: true },
    ],
  },
  {
    label: 'Core & executive',
    items: [
      { href: '/modules/communications', label: 'Communications', icon: MessageSquareText },
      { href: '/modules/documents', label: 'Documents', icon: FileText },
      { href: '/modules/calendar', label: 'Academic calendar', icon: CalendarDays },
    ],
  },
  {
    label: 'Portals & administration',
    items: [
      { href: '/modules/parent-portal', label: 'Student & sponsor portal', icon: GraduationCap },
      { href: '/modules/administration', label: 'Administration & settings', icon: Settings2, isSensitive: true },
      { href: '/modules/integration-status', label: 'Integrations & compliance', icon: ShieldCheck },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NwuchasShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Institutional Two-Factor Authentication (2FA) State for Sensitive Modules
  const [isMfaVerified, setIsMfaVerified] = useState<boolean>(false);
  const [isMfaModalOpen, setIsMfaModalOpen] = useState<boolean>(false);
  const [mfaTargetModule, setMfaTargetModule] = useState<string>('finance');

  // Query 2FA verification status on mount and path change
  useEffect(() => {
    let isMounted = true;
    const checkMfaStatus = async () => {
      try {
        const cached = localStorage.getItem('nwuchas_mfa_verified');
        if (cached === 'true') {
          setIsMfaVerified(true);
        }
        const res = await fetch('/api/auth/2fa/status');
        if (res.ok && isMounted) {
          const json = await res.json();
          if (json.success && json.data) {
            const verified = Boolean(json.data.isMfaVerified);
            setIsMfaVerified(verified);
            if (verified) {
              localStorage.setItem('nwuchas_mfa_verified', 'true');
            } else {
              localStorage.removeItem('nwuchas_mfa_verified');
            }
          }
        }
      } catch {}
    };
    checkMfaStatus();
    return () => { isMounted = false; };
  }, [pathname]);

  // Restore sidebar state & category collapsed preferences from localStorage
  useEffect(() => {
    try {
      const savedSidebar = localStorage.getItem('nwuchas_sidebar_collapsed');
      if (savedSidebar !== null) {
        setIsSidebarCollapsed(savedSidebar === 'true');
      }
      const savedCats = localStorage.getItem('nwuchas_collapsed_categories');
      if (savedCats) {
        setCollapsedCategories(JSON.parse(savedCats));
      }
    } catch {
      // Local storage may be restricted in sandbox
    }
  }, []);

  // Keyboard shortcut: Ctrl+K / Cmd+K for search, Ctrl+B / Cmd+B for sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [pathname]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('nwuchas_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const toggleCategory = (label: string) => {
    setCollapsedCategories((prev) => {
      const next = { ...prev, [label]: !prev[label] };
      try {
        localStorage.setItem('nwuchas_collapsed_categories', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Public visitor pages (Landing site, Application Portal, Login) render outside the internal staff command shell
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/apply') ||
    pathname.startsWith('/login') ||
    pathname === '/offline.html';

  // Check if current route requires 2FA
  const isCurrentRouteSensitive = isSensitiveModule(pathname);
  const currentPolicy = getSensitiveModulePolicy(pathname);

  // Auto-open 2FA modal if user accesses a sensitive route without verification
  useEffect(() => {
    if (isCurrentRouteSensitive && !isMfaVerified && !isPublicRoute) {
      const cleanSlug = pathname.replace(/^\/modules\//, '').replace(/^\/portal\//, '').split('/')[0];
      setMfaTargetModule(cleanSlug || 'finance');
      setIsMfaModalOpen(true);
    }
  }, [pathname, isCurrentRouteSensitive, isMfaVerified, isPublicRoute]);

  const handleLockMfa = async () => {
    try {
      await fetch('/api/auth/2fa/revoke', { method: 'POST' });
      setIsMfaVerified(false);
      localStorage.removeItem('nwuchas_mfa_verified');
      if (isCurrentRouteSensitive) {
        setIsMfaModalOpen(true);
      }
    } catch {}
  };

  const handleMfaSuccess = () => {
    setIsMfaVerified(true);
    localStorage.setItem('nwuchas_mfa_verified', 'true');
    setIsMfaModalOpen(false);
  };

  const openMfaChallengeForModule = (slug: string) => {
    setMfaTargetModule(slug);
    setIsMfaModalOpen(true);
  };

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <TopWelcomeBanner />
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm shadow-slate-200/50 backdrop-blur">
        <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6">
          {/* Mobile drawer toggle */}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen((prev) => !prev)}
            aria-label="Toggle mobile menu"
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-800 transition lg:hidden"
          >
            {isMobileDrawerOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Desktop sidebar toggle button */}
          <button
            type="button"
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-800 transition shadow-2xs"
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>

          <Link href="/portal/executive" className="flex min-w-0 items-center gap-3 group">
            <NwuchasEmblemSvg size={38} className="group-hover:scale-105 transition-transform" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold tracking-wide text-[#0b2545]">
                NWUCHAS-CMIS
              </span>
              <span className="block truncate text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#007B99]">
                College command centre
              </span>
            </span>
          </Link>

          {/* Universal AI Search Trigger Bar */}
          <div className="mx-auto hidden max-w-xl flex-1 px-4 md:block">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="group flex w-full items-center gap-3 rounded-full border border-slate-200 bg-slate-50/80 px-4 py-2 text-left text-xs font-medium text-slate-500 shadow-inner transition hover:border-cyan-500 hover:bg-white hover:text-slate-800 hover:shadow-md"
              title="Search students, staff, courses, or ask anything in natural language (Ctrl+K)"
            >
              <Search size={15} className="text-cyan-600 transition group-hover:scale-110" />
              <span className="flex-1 truncate">
                <span className="font-semibold text-slate-700">Search</span> learners, faculty, courses, or ask in natural language...
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-bold text-slate-500 shadow-xs">
                <Sparkles size={11} className="text-amber-500 animate-pulse" />
                <span className="text-slate-600">AI Search</span>
                <kbd className="ml-0.5 rounded bg-slate-100 px-1 py-0.2 font-mono text-[9px] text-slate-500 border border-slate-200">Ctrl K</kbd>
              </span>
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2 text-xs">
            {/* Mobile Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search college database"
              className="grid h-9 w-9 place-items-center rounded-md border border-slate-300 text-slate-600 hover:border-cyan-600 hover:text-cyan-700 hover:bg-slate-50 md:hidden"
            >
              <Search size={16} />
            </button>

            {/* 2FA Institutional Status & Quick Lock Toggle */}
            {isMfaVerified ? (
              <button
                type="button"
                onClick={handleLockMfa}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 shadow-2xs hover:bg-emerald-100 transition"
                title="High Security Active (2FA Verified). Click to lock sensitive modules."
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <ShieldCheck size={13} className="text-emerald-700" />
                <span className="hidden sm:inline">2FA Active</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openMfaChallengeForModule('finance')}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 shadow-2xs hover:bg-amber-100 transition"
                title="Two-factor authentication required for sensitive modules (Finance, Assets, Students, Staff). Click to verify."
              >
                <ShieldAlert size={13} className="text-amber-600" />
                <span className="hidden sm:inline">2FA Required</span>
              </button>
            )}

            <Link
              href="/modules/documents"
              className="hidden rounded-md px-3 py-2 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:inline-flex"
            >
              Documents
            </Link>
            <QuickPinTopBarButton />
            <InactivityAutoLockWidget />
            <NotificationCenter />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sticky Sidebar (Collapsible to compact rail or expandable) */}
        <aside
          className={`sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 overflow-y-auto border-r border-slate-200 bg-white transition-all duration-300 ease-in-out lg:block ${
            isSidebarCollapsed ? 'w-20 px-2 py-4' : 'w-72 px-3 py-5'
          }`}
        >
          {/* Header Action inside Sidebar */}
          <div className={`mb-3 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-1'}`}>
            {!isSidebarCollapsed && (
              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                Navigation modules
              </span>
            )}
            <button
              type="button"
              onClick={toggleSidebar}
              className="grid h-7 w-7 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              title={isSidebarCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
            >
              {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Executive Dashboard Link */}
          <Link
            href="/portal/executive"
            title="Executive dashboard"
            className={`group relative mb-2 flex items-center rounded-lg text-sm font-semibold transition ${
              isSidebarCollapsed
                ? 'h-11 w-11 mx-auto justify-center'
                : 'gap-3 px-3 py-2.5'
            } ${
              pathname === '/portal/executive'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard size={18} className="shrink-0" />
            {!isSidebarCollapsed && <span className="truncate">Executive dashboard</span>}
            {isSidebarCollapsed && (
              <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl group-hover:block whitespace-nowrap">
                Executive dashboard
              </span>
            )}
          </Link>

          {/* Public Website Link */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="View public website"
            className={`group relative mb-4 flex items-center rounded-lg text-xs font-semibold text-cyan-800 bg-cyan-50/70 border border-cyan-100 hover:bg-cyan-100/70 transition ${
              isSidebarCollapsed
                ? 'h-10 w-11 mx-auto justify-center'
                : 'gap-3 px-3 py-2'
            }`}
          >
            <Globe size={16} className="shrink-0" />
            {!isSidebarCollapsed && <span className="truncate">View public website →</span>}
            {isSidebarCollapsed && (
              <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl group-hover:block whitespace-nowrap">
                View public website →
              </span>
            )}
          </Link>

          {/* Navigation Groups (Each category collapsible) */}
          {groups.map((group) => {
            const isGroupActive = group.items.some((it) => isActive(pathname, it.href));
            // Default open if active route is inside, or if not collapsed in user state
            const isCollapsed = collapsedCategories[group.label] ?? false;

            return (
              <section key={group.label} className={isSidebarCollapsed ? 'mb-3' : 'mb-4'}>
                {/* Category Header */}
                {!isSidebarCollapsed ? (
                  <button
                    type="button"
                    onClick={() => toggleCategory(group.label)}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition group"
                    title={isCollapsed ? `Expand ${group.label}` : `Collapse ${group.label}`}
                  >
                    <span className="truncate">{group.label}</span>
                    <span className="flex items-center gap-1.5">
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[9px] font-bold text-slate-500 group-hover:bg-slate-200">
                        {group.items.length}
                      </span>
                      <ChevronDown
                        size={13}
                        className={`text-slate-400 transition-transform duration-200 ${
                          isCollapsed ? '-rotate-90' : 'rotate-0'
                        }`}
                      />
                    </span>
                  </button>
                ) : (
                  <div
                    className="my-2 border-t border-slate-100"
                    title={group.label}
                  />
                )}

                {/* Group Items */}
                <div
                  className={`space-y-0.5 transition-all duration-300 ease-in-out ${
                    !isSidebarCollapsed && isCollapsed
                      ? 'max-h-0 opacity-0 overflow-hidden pointer-events-none'
                      : 'max-h-96 opacity-100 mt-1'
                  }`}
                >
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={item.label}
                        className={`group relative flex items-center rounded-md text-sm transition ${
                          isSidebarCollapsed
                            ? 'h-10 w-11 mx-auto justify-center'
                            : 'gap-3 px-3 py-2'
                        } ${
                          active
                            ? 'bg-cyan-50 text-cyan-900 font-semibold border-l-4 border-cyan-600'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <Icon
                          size={17}
                          className={`shrink-0 ${active ? 'text-cyan-700' : 'text-slate-400 group-hover:text-slate-600'}`}
                        />
                        {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                        {isSidebarCollapsed && (
                          <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl group-hover:flex items-center gap-1.5 whitespace-nowrap">
                            <span>{item.label}</span>
                            <span className="text-[10px] text-cyan-300 font-normal">
                              • {group.label}
                            </span>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {/* Operational Status Box */}
          {!isSidebarCollapsed ? (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
              <span className="flex items-center gap-2 font-semibold text-emerald-700">
                <Activity size={15} /> Environment operational
              </span>
              <p className="mt-1 text-[11px] text-slate-500">Dedicated NWUCHAS institution database.</p>
            </div>
          ) : (
            <div
              className="mt-4 flex justify-center"
              title="Environment operational • Dedicated NWUCHAS institution database"
            >
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
              </span>
            </div>
          )}
        </aside>

        {/* Mobile Off-Canvas Drawer Navigation */}
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileDrawerOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl p-5 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-left duration-200">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <NwuchasEmblemSvg size={32} />
                    <div>
                      <p className="text-xs font-bold text-slate-900">NWUCHAS-CMIS</p>
                      <p className="text-[10px] font-semibold text-cyan-700">College Command Centre</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={18} />
                  </button>
                </div>

                <Link
                  href="/portal/executive"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className={`mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    pathname === '/portal/executive'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard size={18} /> Executive dashboard
                </Link>

                <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-4 flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-cyan-800 bg-cyan-50/70 border border-cyan-100"
                >
                  <Globe size={16} /> View public website →
                </Link>

                {groups.map((group) => {
                  const isCollapsed = collapsedCategories[group.label] ?? false;
                  return (
                    <section key={group.label} className="mb-4">
                      <button
                        type="button"
                        onClick={() => toggleCategory(group.label)}
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                      >
                        <span>{group.label}</span>
                        <ChevronDown
                          size={13}
                          className={`text-slate-400 transition-transform duration-200 ${
                            isCollapsed ? '-rotate-90' : 'rotate-0'
                          }`}
                        />
                      </button>
                      <div
                        className={`space-y-0.5 transition-all duration-300 ease-in-out ${
                          isCollapsed ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-96 opacity-100 mt-1'
                        }`}
                      >
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const active = isActive(pathname, item.href);
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsMobileDrawerOpen(false)}
                              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                                active
                                  ? 'bg-cyan-50 text-cyan-900 font-semibold border-l-4 border-cyan-600'
                                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                              }`}
                            >
                              <Icon size={17} className={active ? 'text-cyan-700' : 'text-slate-400'} />
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>

              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                <span className="flex items-center gap-2 font-semibold text-emerald-700">
                  <Activity size={14} /> Environment operational
                </span>
                <p className="mt-1 text-[11px] text-slate-500">Dedicated NWUCHAS institution database.</p>
              </div>
            </aside>
          </div>
        )}

        <div className="min-w-0 flex-1 flex flex-col min-h-[calc(100vh-4rem)]">
          {/* Mobile Horizontal Quick-Scroll Tabs */}
          <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
            <Link
              href="/portal/executive"
              className={`shrink-0 rounded-md px-3 py-1.5 text-sm ${
                pathname === '/portal/executive'
                  ? 'bg-cyan-600 font-semibold text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              Dashboard
            </Link>
            {groups
              .flatMap((group) => group.items)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-md px-3 py-1.5 text-sm ${
                    isActive(pathname, item.href)
                      ? 'bg-cyan-50 font-semibold text-cyan-900'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
          </nav>
          <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-16 md:pb-8 w-full max-w-none overflow-y-auto min-w-0">
            {children}
          </main>

          {/* Authentic Signature Lime Green Footer Bar - Static/Sticky Bottom Bar */}
          {/* Authentic Signature Lime Green Footer Bar - Static/Sticky Bottom Bar */}
          <footer className="sticky bottom-0 z-20 bg-[#8DC63F] text-slate-950 py-1.5 px-3 md:px-5 font-bold border-t border-[#7ab332] shadow-[0_-2px_10px_rgba(0,0,0,0.08)] w-full overflow-hidden">
            <div className="w-full flex items-center justify-between gap-x-2 text-[clamp(8px,0.76vw,12.5px)] leading-tight whitespace-nowrap overflow-x-auto no-scrollbar font-bold text-slate-950">
              <span className="shrink-0">
                © 2026 North Western University College of Health and Applied Sciences. All rights reserved.
              </span>
              <span className="text-slate-800 opacity-60">•</span>
              <span className="rounded-full bg-slate-950 text-white px-2 py-0.5 text-[clamp(7.5px,0.7vw,10.5px)] font-black tracking-wider shrink-0">
                {SYSTEM_VERSION.version}
              </span>
              <span className="text-slate-800 opacity-60">•</span>
              <span className="shrink-0">Plot 511/518 Shilenda Road, Manyama, Lumwana, Zambia</span>
              <span className="text-slate-800 opacity-60">•</span>
              <span className="shrink-0">
                Hotlines/WhatsApp: <strong>0964240051 / 0955550051 / 0979000051 / 0974896096 / 0974240051</strong>
              </span>
              <span className="text-slate-800 opacity-60">•</span>
              <a href="mailto:info@nwuc.edu.zm" className="underline hover:text-slate-950 shrink-0">info@nwuc.edu.zm</a>
            </div>
          </footer>
        </div>
      </div>

      {/* Universal Enterprise Search Modal with AI & 360° Dossiers */}
      <UniversalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Institutional Two-Factor Authentication Step-Up Modal */}
      <TwoFactorChallengeModal
        isOpen={isMfaModalOpen}
        targetModule={mfaTargetModule}
        onSuccess={handleMfaSuccess}
        onCancel={() => {
          setIsMfaModalOpen(false);
          // If user cancels on a sensitive route, return them to executive portal
          if (isCurrentRouteSensitive) {
            window.location.href = '/portal/executive';
          }
        }}
      />
    </div>
  );
}
