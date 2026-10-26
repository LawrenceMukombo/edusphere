'use client';

import React from 'react';
import Link from 'next/link';

export const NWUCHAS_IDENTITY = {
  name: 'North Western University College of Health and Applied Sciences',
  shortName: 'NWUCHAS',
  campusName: 'Lumwana Campus',
  legalName: 'North Western University College of Health and Applied Sciences Limited',
  address: 'Plot 511/518 Shilenda Road, Manyama, Lumwana, Zambia',
  plotNumber: 'Plot 511/518',
  street: 'Shilenda Road',
  area: 'Manyama, Lumwana',
  district: 'Kalumbila District',
  province: 'North-Western Province',
  country: 'Zambia',
  established: 2017,
  primaryPhone: '0964240051',
  internationalPhone: '+260 964 240051',
  phoneLines: [
    '0964240051',
    '0955550051',
    '0979000051',
    '0974896096',
    '0974240051',
  ],
  whatsapp: '+260 775747848',
  email: 'info@nwuc.edu.zm',
  admissionsEmail: 'admissions@nwuc.edu.zm',
  website: 'nwuc.edu.zm',
  websiteUrl: 'https://nwuc.edu.zm',
  facebook: 'facebook.com/NWUCHAS',
  accreditations: [
    'Higher Education Authority (HEA)',
    'Nursing and Midwifery Council of Zambia (NMCZ)',
    'Health Professions Council of Zambia (HPCZ)',
  ],
  colors: {
    tealBlue: '#007B99',
    tealBlueDark: '#00627a',
    limeGreen: '#8DC63F',
    limeGreenDark: '#72a330',
    pulsePink: '#EC008C',
    navyHeader: '#0b2545',
    slateDark: '#334155',
  },
} as const;

export interface NwuchasLogoProps {
  variant?: 'horizontal' | 'icon' | 'compact' | 'crest' | 'letterhead';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showAddress?: boolean;
}

export function NwuchasEmblemSvg({ size = 44, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 130 130"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      aria-label="NWUCHAS Emblem"
    >
      <defs>
        <linearGradient id="nwuEmbBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0090b3" />
          <stop offset="100%" stopColor="#007B99" />
        </linearGradient>
        <linearGradient id="nwuEmbPink" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff1493" />
          <stop offset="100%" stopColor="#EC008C" />
        </linearGradient>
      </defs>

      <g transform="translate(5, 5)">
        {/* Top-Right Arc (Teal-blue) */}
        <path
          d="M 60,10 A 50,50 0 0,1 110,60 A 50,50 0 0,1 96,94 L 83,81 A 33,33 0 0,0 94,60 A 33,33 0 0,0 60,27 Z"
          fill="#007B99"
        />
        {/* Left-Bottom Arc (Lime-green) */}
        <path
          d="M 60,10 A 50,50 0 0,0 10,60 A 50,50 0 0,0 60,110 A 50,50 0 0,0 96,94 L 83,81 A 33,33 0 0,1 60,93 A 33,33 0 0,1 27,60 A 33,33 0 0,1 60,27 Z"
          fill="#8DC63F"
        />

        {/* 3 People Figure Heads */}
        <circle cx="96" cy="24" r="11" fill="#007B99" />
        <circle cx="24" cy="24" r="11" fill="#007B99" />
        <circle cx="60" cy="116" r="11" fill="#8DC63F" />

        {/* Joint Separators */}
        <circle cx="104" cy="60" r="4.5" fill="#ffffff" />
        <circle cx="16" cy="60" r="4.5" fill="#ffffff" />

        {/* Center Heart with ECG Pulse */}
        <g transform="translate(60, 60)">
          <path
            d="M 0,-17 C 6,-27 23,-25 23,-9 C 23,6 8,17 0,25 C -8,17 -23,6 -23,-9 C -23,-25 -6,-27 0,-17 Z"
            fill="url(#nwuEmbPink)"
          />
          <path
            d="M -18,2 L -8,2 L -4,-7 L 0,8 L 4,-11 L 8,5 L 11,2 L 18,2"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </svg>
  );
}

export function NwuchasLogo({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showAddress = false,
}: NwuchasLogoProps) {
  const iconSize = size === 'sm' ? 36 : size === 'md' ? 48 : size === 'lg' ? 64 : 84;

  if (variant === 'icon') {
    return <NwuchasEmblemSvg size={iconSize} className={className} />;
  }

  if (variant === 'crest') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <div className="relative">
          <NwuchasEmblemSvg size={iconSize + 16} />
        </div>
        <div className="mt-2 text-center">
          <span className="block text-xs font-black uppercase tracking-wider text-[#8DC63F]">
            North Western
          </span>
          <span className="block text-xs font-black uppercase tracking-wider text-[#007B99]">
            University College
          </span>
          <span className="block text-[10px] text-slate-600 font-medium">
            of Health and Applied Sciences
          </span>
          <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500 border border-slate-200">
            Est. 2017 • Lumwana, Zambia
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 shrink-0 ${className}`}>
        <NwuchasEmblemSvg size={iconSize} />
        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-sm font-black tracking-tight text-[#8DC63F] uppercase leading-none font-sans">
            North Western
          </span>
          <span className="text-xs sm:text-sm font-black tracking-tight text-[#007B99] uppercase leading-none font-sans mt-0.5">
            University College
          </span>
          <span className="text-[10px] sm:text-[11px] text-slate-600 font-medium leading-tight truncate">
            of Health and Applied Sciences
          </span>
          {showAddress && (
            <span className="text-[9px] text-slate-400 font-medium truncate mt-0.5">
              {NWUCHAS_IDENTITY.address}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'letterhead') {
    return (
      <div className={`w-full bg-white p-5 border-b-2 border-[#007B99] ${className}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <NwuchasEmblemSvg size={76} />
            <div>
              <span className="block text-xl sm:text-2xl font-black uppercase text-[#8DC63F] tracking-tight leading-none font-sans">
                North Western
              </span>
              <span className="block text-xl sm:text-2xl font-black uppercase text-[#007B99] tracking-tight leading-none font-sans mt-0.5">
                University College
              </span>
              <span className="block text-sm sm:text-base font-normal text-slate-700 font-sans mt-0.5">
                of Health and Applied Sciences
              </span>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-500">
                <span className="rounded bg-[#007B99]/10 px-2 py-0.5 text-[#007B99] border border-[#007B99]/20 font-bold">HEA Registered</span>
                <span className="rounded bg-[#8DC63F]/15 px-2 py-0.5 text-[#5c8426] border border-[#8DC63F]/30 font-bold">NMCZ Accredited</span>
                <span className="rounded bg-[#EC008C]/10 px-2 py-0.5 text-[#c70076] border border-[#EC008C]/20 font-bold">HPCZ Approved</span>
              </div>
            </div>
          </div>

          <div className="text-right text-xs text-slate-600 space-y-0.5 font-sans min-w-[220px]">
            <p className="font-bold text-slate-900">{NWUCHAS_IDENTITY.address}</p>
            <p className="text-slate-600">
              Tel: <strong className="text-slate-800">{NWUCHAS_IDENTITY.primaryPhone}</strong> • WhatsApp: {NWUCHAS_IDENTITY.whatsapp}
            </p>
            <p className="text-slate-600">
              Email: <strong className="text-[#007B99]">{NWUCHAS_IDENTITY.email}</strong> • Web: {NWUCHAS_IDENTITY.website}
            </p>
          </div>
        </div>

        {/* Brand Dual Accent Line: Lime-green & Teal-blue */}
        <div className="mt-3 flex items-center gap-0">
          <div className="h-1 flex-1 bg-[#8DC63F]" />
          <div className="h-1 flex-1 bg-[#007B99]" />
        </div>
      </div>
    );
  }

  // Default: Horizontal Brandmark
  return (
    <div className={`inline-flex items-center gap-3.5 ${className}`}>
      <NwuchasEmblemSvg size={iconSize} />
      <div className="flex flex-col">
        <span
          className="font-black uppercase tracking-tight leading-none font-sans"
          style={{
            fontSize: size === 'sm' ? '14px' : size === 'md' ? '17px' : size === 'lg' ? '22px' : '28px',
            color: '#8DC63F',
          }}
        >
          North Western
        </span>
        <span
          className="font-black uppercase tracking-tight leading-none font-sans mt-0.5"
          style={{
            fontSize: size === 'sm' ? '14px' : size === 'md' ? '17px' : size === 'lg' ? '22px' : '28px',
            color: '#007B99',
          }}
        >
          University College
        </span>
        <span
          className="font-normal text-slate-600 leading-tight font-sans"
          style={{
            fontSize: size === 'sm' ? '10px' : size === 'md' ? '12px' : size === 'lg' ? '14px' : '17px',
          }}
        >
          of Health and Applied Sciences
        </span>
      </div>
    </div>
  );
}

export default NwuchasLogo;
