'use client';

import React from 'react';
import {
  NwuchasLogo,
  NwuchasEmblemSvg,
  NWUCHAS_IDENTITY,
  NwuchasLogoProps,
} from './NwuchasLogo';

export interface LegacyLogoProps {
  variant?: 'emblem' | 'compact' | 'letterhead' | 'banner';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showAddress?: boolean;
}

/**
 * LegacyLogo adapter: cleanly delegates to authentic NWUCHAS Institutional Brand Identity
 * to guarantee no demo or legacy school assets remain active in production.
 */
export function LegacyLogo({
  variant = 'compact',
  className = '',
  size = 'md',
  showAddress = true,
}: LegacyLogoProps) {
  if (variant === 'emblem') {
    const iconSize = size === 'sm' ? 40 : size === 'md' ? 52 : size === 'lg' ? 72 : 96;
    return <NwuchasEmblemSvg size={iconSize} className={className} />;
  }

  if (variant === 'compact') {
    return (
      <NwuchasLogo
        variant="compact"
        size={size}
        className={className}
        showAddress={showAddress}
      />
    );
  }

  if (variant === 'letterhead') {
    return (
      <NwuchasLogo
        variant="letterhead"
        className={className}
        showAddress={showAddress}
      />
    );
  }

  // Full Banner variant
  return (
    <div
      className={`w-full bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-5 rounded-2xl border border-sky-100 shadow-xs ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <NwuchasLogo variant="horizontal" size={size} />
        <div className="text-right text-xs text-slate-600 font-sans">
          <p className="font-bold text-slate-800">{NWUCHAS_IDENTITY.address}</p>
          <p className="text-[#007B99] font-semibold">
            Hotline: {NWUCHAS_IDENTITY.primaryPhone} • {NWUCHAS_IDENTITY.email}
          </p>
        </div>
      </div>
    </div>
  );
}

export default LegacyLogo;
