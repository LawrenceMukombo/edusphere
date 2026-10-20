// src/components/MobileBottomNav.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  Bed,
  DollarSign,
  MessageSquare,
  Menu,
  HeartHandshake,
  Calendar,
  ClipboardCheck,
  GraduationCap,
} from 'lucide-react';
import { loadActiveUser, UserSecurityProfile } from '@/lib/authPermissions';

interface MobileBottomNavProps {
  onToggleDrawer: () => void;
  isDrawerOpen?: boolean;
}

export function MobileBottomNav({ onToggleDrawer, isDrawerOpen }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserSecurityProfile>(() => loadActiveUser());

  useEffect(() => {
    const handleUserUpdate = () => setCurrentUser(loadActiveUser());
    window.addEventListener('storage', handleUserUpdate);
    window.addEventListener('edusphere:user-updated', handleUserUpdate);
    return () => {
      window.removeEventListener('storage', handleUserUpdate);
      window.removeEventListener('edusphere:user-updated', handleUserUpdate);
    };
  }, []);

  // Compute role-tailored quick navigation tabs
  const getNavItems = () => {
    if (currentUser.role === 'PARENT') {
      return [
        { href: '/parent', label: 'Portal', icon: HeartHandshake },
        { href: '/calendar', label: 'Calendar', icon: Calendar },
        { href: '/messages', label: 'Messages', icon: MessageSquare },
      ];
    }
    if (currentUser.role === 'TEACHER') {
      return [
        { href: '/teacher', label: 'Classes', icon: ClipboardCheck },
        { href: '/attendance', label: 'Attendance', icon: CalendarCheck },
        { href: '/academics', label: 'Grades', icon: GraduationCap },
        { href: '/messages', label: 'Messages', icon: MessageSquare },
      ];
    }
    return [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/messages', label: 'Messages', icon: MessageSquare },
      { href: '/attendance', label: 'Attendance', icon: CalendarCheck },
      ...(currentUser.campusId !== 'URBAN' ? [{ href: '/boarding', label: 'Boarding', icon: Bed }] : []),
      { href: '/finance', label: 'Finance', icon: DollarSign },
    ];
  };

  const navItems = getNavItems();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around no-print"
      style={{ paddingBottom: 'calc(0.4rem + env(safe-area-inset-bottom, 0px))' }}
      aria-label="Mobile Bottom Navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
              isActive
                ? 'text-blue-900 font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-100/80 text-blue-900' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] leading-tight mt-0.5">{item.label}</span>
          </Link>
        );
      })}

      {/* Modules Drawer Trigger */}
      <button
        type="button"
        onClick={onToggleDrawer}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
          isDrawerOpen ? 'text-blue-900 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
        }`}
        aria-label="Open All Workspaces Menu"
      >
        <div className={`p-1 rounded-lg ${isDrawerOpen ? 'bg-blue-100/80 text-blue-900' : ''}`}>
          <Menu className="w-5 h-5" />
        </div>
        <span className="text-[10px] leading-tight mt-0.5">All Modules</span>
      </button>
    </nav>
  );
}
