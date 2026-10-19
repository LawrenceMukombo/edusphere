'use client';

import React, { useState, useEffect } from 'react';
import { loadAppSettings } from '@/lib/appSettings';

interface LegacyLogoProps {
  variant?: 'emblem' | 'compact' | 'letterhead' | 'banner';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showAddress?: boolean;
}

const DEFAULT_INSTITUTION = {
  name: 'Legacy School Solwezi',
  motto: 'We Strive for Your Academic and Moral Excellence',
  city: 'Solwezi',
  province: 'North-Western Province',
  address: 'Stand # S/SOLWE/3177178, Kansanshi Mine Road, Mushitala',
  primaryPhone: '+260 974 371271',
  officialEmail: 'legacyschool208@gmail.com',
};

export function LegacyLogo({
  variant = 'compact',
  className = '',
  size = 'md',
  showAddress = true,
}: LegacyLogoProps) {
  const [institution, setInstitution] = useState(DEFAULT_INSTITUTION);

  useEffect(() => {
    const handleUpdate = () => {
      try {
        setInstitution(loadAppSettings().institution);
      } catch (e) {
        // Safe fallback
      }
    };
    handleUpdate();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('edusphere:settings-updated', handleUpdate);
    window.addEventListener('edusphere:tenant-switched', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('edusphere:settings-updated', handleUpdate);
      window.removeEventListener('edusphere:tenant-switched', handleUpdate);
    };
  }, []);

  const schoolName = institution.name || 'Legacy School Solwezi';
  const schoolMotto = institution.motto || 'We Strive for Your Academic and Moral Excellence';
  const schoolCity = institution.city || 'Solwezi';

  // Emblem Only (The authentic flying parent & fledgling dove with arched LEGACY SCHOOL)
  if (variant === 'emblem') {
    const dim = size === 'sm' ? 44 : size === 'md' ? 58 : size === 'lg' ? 76 : 104;
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        <img
          src="/legacy-logo.png"
          alt={`${schoolName} Emblem`}
          width={dim}
          height={dim}
          className="object-contain drop-shadow-xs select-none max-w-full"
        />
      </div>
    );
  }

  // Compact Header / Navbar Format
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2.5 sm:gap-3.5 shrink-0 ${className}`}>
        <LegacyLogo variant="emblem" size={size} />
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-base sm:text-lg font-black tracking-wider text-blue-950 font-serif leading-none whitespace-nowrap uppercase">
              {schoolName}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 whitespace-nowrap uppercase">
              {schoolCity}
            </span>
          </div>
          <span className="text-[11px] sm:text-xs font-serif italic text-blue-700 tracking-wide mt-0.5 leading-tight truncate max-w-[210px] sm:max-w-[280px] lg:max-w-[220px] xl:max-w-none">
            {schoolMotto}
          </span>
          <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium hidden 2xl:block truncate">
            {institution.address || 'Mushitala Campus (Near Kansanshi) • Urban Campus'}
          </span>
        </div>
      </div>
    );
  }

  // Official Letterhead / Printable Document Header
  if (variant === 'letterhead') {
    return (
      <div className={`w-full bg-white p-4 border-b-2 border-blue-900 ${className}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="shrink-0">
            <LegacyLogo variant="emblem" size="lg" />
          </div>

          <div className="flex-1 text-center">
            <h1 className="text-3xl font-black tracking-wide text-blue-900 font-serif uppercase">
              {schoolName}
            </h1>
            <p className="text-sm font-serif italic font-semibold text-blue-700 mt-0.5">
              {schoolMotto}
            </p>
            {showAddress && (
              <div className="mt-2 text-xs text-slate-700 space-y-0.5 font-sans">
                <p className="font-semibold text-slate-800">
                  {institution.address}
                </p>
                <p className="text-slate-600">
                  {schoolCity}, {institution.province || 'North-Western Province'}, Zambia
                </p>
                <p className="font-bold text-blue-900">
                  Cell: {institution.primaryPhone} • Email: {institution.officialEmail}
                </p>
              </div>
            )}
          </div>

          {/* Academic Graduation Cap (Right Side) */}
          <div className="shrink-0 hidden md:block">
            <svg viewBox="0 0 120 100" width="70" height="60" className="drop-shadow-sm">
              <polygon points="60,10 115,30 60,50 5,30" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
              <polygon points="60,12 110,30 60,48 10,30" fill="#334155" />
              <path d="M 25,36 L 25,56 Q 60,72 95,56 L 95,36 Q 60,50 25,36 Z" fill="#0f172a" stroke="#0f172a" strokeWidth="1.5" />
              <circle cx="60" cy="30" r="4.5" fill="#f59e0b" />
              <path d="M 60,30 Q 82,34 98,54 Q 102,70 105,82" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 100,82 L 109,82 L 112,100 L 97,100 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
            </svg>
          </div>
        </div>

        {/* Decorative Divider */}
        <div className="mt-3 flex items-center gap-1">
          <div className="h-0.5 flex-1 bg-blue-900" />
          <div className="w-2 h-2 rotate-45 bg-amber-500" />
          <div className="h-0.5 flex-1 bg-blue-900" />
        </div>
      </div>
    );
  }

  // Full Banner (Light Blue Background Matching Image 1)
  return (
    <div className={`w-full bg-[#dbeafe] p-4 rounded-xl border border-blue-200 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <LegacyLogo variant="emblem" size="lg" />

        <div className="flex-1 text-center">
          <h1 className="text-3xl md:text-4xl font-black tracking-wider text-blue-950 font-serif">
            LEGACY SCHOOL
          </h1>
          <p className="text-sm md:text-base font-serif italic font-bold text-blue-800 mt-1">
            We Strive for Your Academic and Moral Excellence
          </p>
          <p className="text-xs text-blue-900 font-semibold mt-1">
            Kansanshi Mine Road Educational Corridor, Solwezi
          </p>
        </div>

        <div className="hidden sm:block shrink-0">
          <svg viewBox="0 0 120 100" width="70" height="60">
            <polygon points="60,10 115,30 60,50 5,30" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
            <polygon points="60,12 110,30 60,48 10,30" fill="#334155" />
            <path d="M 25,36 L 25,56 Q 60,72 95,56 L 95,36 Q 60,50 25,36 Z" fill="#0f172a" />
            <circle cx="60" cy="30" r="4" fill="#f59e0b" />
            <path d="M 60,30 Q 82,34 98,54 Q 102,70 105,82" fill="none" stroke="#d97706" strokeWidth="2.5" />
            <path d="M 100,82 L 109,82 L 112,100 L 97,100 Z" fill="#f59e0b" />
          </svg>
        </div>
      </div>
    </div>
  );
}
