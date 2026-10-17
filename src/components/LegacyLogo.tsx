'use client';

import React from 'react';

interface LegacyLogoProps {
  variant?: 'emblem' | 'compact' | 'letterhead' | 'banner';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showAddress?: boolean;
}

export function LegacyLogo({
  variant = 'compact',
  className = '',
  size = 'md',
  showAddress = true,
}: LegacyLogoProps) {
  // Emblem Only (The flying peace dove with olive branch and arched text)
  if (variant === 'emblem') {
    const dim = size === 'sm' ? 40 : size === 'md' ? 56 : size === 'lg' ? 72 : 96;
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        <svg
          viewBox="0 0 160 160"
          width={dim}
          height={dim}
          className="drop-shadow-sm select-none"
        >
          <defs>
            <path id="archPathEmblem" d="M 22,108 A 62,62 0 0,1 138,108" fill="none" />
            <linearGradient id="emblemBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0f9ff" />
              <stop offset="100%" stopColor="#e0f2fe" />
            </linearGradient>
          </defs>
          <circle cx="80" cy="80" r="76" fill="url(#emblemBg)" stroke="#1e3a8a" strokeWidth="2.5" />
          <circle cx="80" cy="80" r="71" fill="none" stroke="#93c5fd" strokeWidth="1" strokeDasharray="3,2" />

          {/* Arched Text */}
          <text
            fontFamily="'Arial Black', 'Montserrat', sans-serif"
            fontSize="12.5"
            fontWeight="900"
            fill="#1e3a8a"
            letterSpacing="3"
          >
            <textPath href="#archPathEmblem" startOffset="50%" textAnchor="middle">
              LEGACY SCHOOL
            </textPath>
          </text>

          {/* Flying Dove with Olive Branch */}
          <g transform="translate(44, 46) scale(0.65)">
            <path d="M 88,68 Q 98,62 108,66 Q 118,72 125,70" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
            <path d="M 98,63 Q 102,56 106,62 C 103,66 99,66 98,63 Z" fill="#16a34a" />
            <path d="M 108,65 Q 114,58 117,64 C 114,68 109,68 108,65 Z" fill="#22c55e" />
            <path d="M 118,70 Q 124,65 127,71 C 123,74 119,74 118,70 Z" fill="#16a34a" />

            <path d="M 72,55 C 76,46 84,46 88,52 C 92,58 90,66 82,70 C 76,73 70,70 68,64 Z" fill="#ffffff" stroke="#1e3a8a" strokeWidth="2.5" />
            <path d="M 88,57 L 96,62 L 87,65 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
            <circle cx="82" cy="55" r="2.2" fill="#1e3a8a" />

            <path d="M 64,62 C 58,40 54,20 38,10 C 35,26 40,42 46,55 C 38,42 32,32 20,24 C 22,38 28,52 36,63 C 28,52 20,44 10,40 C 14,55 24,66 34,74 C 44,82 58,82 64,74 Z"
                  fill="#ffffff" stroke="#1e3a8a" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M 68,64 C 62,75 52,86 38,92 C 48,96 60,94 72,86 C 80,78 84,70 82,66 Z" fill="#ffffff" stroke="#1e3a8a" strokeWidth="2.5" />
            <path d="M 38,92 C 26,96 12,98 2,100 C 12,104 26,102 36,98 C 24,106 14,110 4,114 C 18,114 32,108 42,100 Z"
                  fill="#ffffff" stroke="#1e3a8a" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M 44,30 Q 50,45 52,58" fill="none" stroke="#94a3b8" strokeWidth="1.2" />
            <path d="M 30,42 Q 38,55 42,66" fill="none" stroke="#94a3b8" strokeWidth="1.2" />
          </g>
        </svg>
      </div>
    );
  }

  // Compact Header / Navbar Format
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <LegacyLogo variant="emblem" size={size} />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black tracking-wider text-blue-950 font-serif leading-none">
              LEGACY SCHOOL
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              SOLWEZI
            </span>
          </div>
          <span className="text-xs font-serif italic text-blue-700 tracking-wide mt-0.5 leading-tight">
            We Strive for Your Academic and Moral Excellence
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
              LEGACY SCHOOL
            </h1>
            <p className="text-sm font-serif italic font-semibold text-blue-700 mt-0.5">
              We Strive for Your Academic and Moral Excellence
            </p>
            {showAddress && (
              <div className="mt-2 text-xs text-slate-700 space-y-0.5 font-sans">
                <p className="font-semibold text-slate-800">
                  Plot No. 889, 890 Kansanshi Road, Mushitala • P.O Box 110558, Solwezi – Zambia
                </p>
                <p className="font-bold text-blue-900">
                  Cell: 0968/0955 441 441 • Email: legacyschool208@gmail.com
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
