'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, BadgeDollarSign, Bell, BookOpenCheck, Building2, CalendarDays, ClipboardCheck, FileText, Globe, GraduationCap, HeartPulse, LayoutDashboard, MessageSquareText, Search, Settings2, ShieldCheck, Sparkles, UsersRound, WalletCards, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { UniversalSearchModal } from '@/components/search/UniversalSearchModal';
import { TopWelcomeBanner } from '@/components/TopWelcomeBanner';
import { NwuchasEmblemSvg } from '@/components/NwuchasLogo';

type NavigationItem = { href: string; label: string; icon: LucideIcon };
type NavigationGroup = { label: string; items: NavigationItem[] };

const groups: NavigationGroup[] = [
  { label: 'Academic & learners', items: [
    { href: '/modules/admissions', label: 'Admissions & candidate portal', icon: UsersRound },
    { href: '/modules/academics', label: 'Academics & examinations', icon: BookOpenCheck },
    { href: '/modules/attendance', label: 'Attendance & engagement', icon: ClipboardCheck },
    { href: '/modules/clinical-learning', label: 'Clinical learning', icon: HeartPulse },
  ] },
  { label: 'Operations & finance', items: [
    { href: '/modules/finance', label: 'Finance & payments', icon: WalletCards },
    { href: '/modules/hr', label: 'Staff & HR', icon: UsersRound },
    { href: '/modules/operations', label: 'Campus operations', icon: Building2 },
    { href: '/modules/assets', label: 'Asset register', icon: Wrench },
  ] },
  { label: 'Core & executive', items: [
    { href: '/modules/communications', label: 'Communications', icon: MessageSquareText },
    { href: '/modules/documents', label: 'Documents', icon: FileText },
    { href: '/modules/calendar', label: 'Academic calendar', icon: CalendarDays },
  ] },
  { label: 'Portals & administration', items: [
    { href: '/modules/parent-portal', label: 'Student & sponsor portal', icon: GraduationCap },
    { href: '/modules/administration', label: 'Administration & settings', icon: Settings2 },
    { href: '/modules/integration-status', label: 'Integrations & compliance', icon: ShieldCheck },
  ] },
];

function isActive(pathname: string, href: string) { return pathname === href || pathname.startsWith(`${href}/`); }

export function NwuchasShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle search on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Public visitor pages (Landing site, Application Portal, Login) render outside the internal staff command shell
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/apply') ||
    pathname.startsWith('/login') ||
    pathname === '/offline.html';

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <TopWelcomeBanner />
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm shadow-slate-200/50 backdrop-blur">
        <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6">
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

            <span className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-medium text-emerald-800 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Local development
            </span>
            <Link
              href="/modules/documents"
              className="hidden rounded-md px-3 py-2 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:inline-flex"
            >
              Documents
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-slate-300 px-3 py-2 font-semibold text-slate-700 hover:border-cyan-600 hover:text-cyan-700 hover:bg-slate-50"
            >
              Sign in
            </Link>
            <Link
              aria-label="Institution profile"
              href="/institution"
              className="grid h-9 w-9 place-items-center rounded-md border border-slate-300 text-slate-600 hover:border-cyan-600 hover:text-cyan-700 hover:bg-slate-50"
            >
              <Bell size={17} />
            </Link>
          </div>
        </div>
      </header>
      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 overflow-y-auto border-r border-slate-200 bg-white px-3 py-5 lg:block">
          <Link
            href="/portal/executive"
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
            className="mb-5 flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-cyan-800 bg-cyan-50/70 border border-cyan-100 hover:bg-cyan-100/70 transition"
          >
            <Globe size={16} /> View public website →
          </Link>
          {groups.map((group) => (
            <section key={group.label} className="mb-5">
              <h2 className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                {group.label}
              </h2>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                        active
                          ? 'bg-cyan-50 text-cyan-900 font-semibold border-l-4 border-cyan-600'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon size={17} className={active ? 'text-cyan-700' : 'text-slate-400'} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
          <div className="mt-7 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
            <span className="flex items-center gap-2 font-semibold text-emerald-700">
              <Activity size={15} /> Environment operational
            </span>
            <p className="mt-1">Dedicated NWUCHAS institution database.</p>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
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
          <main className="p-3 sm:p-6 lg:p-8 pb-20 md:pb-8 w-full max-w-none overflow-y-auto min-w-0">
            {children}
          </main>
        </div>
      </div>

      {/* Universal Enterprise Search Modal with AI & 360° Dossiers */}
      <UniversalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
