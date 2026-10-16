// src/components/InteractiveChart.tsx
'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, Info } from 'lucide-react';

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  category?: string;
}

interface InteractiveChartProps {
  title: string;
  subtitle?: string;
  data: ChartDataPoint[];
  primaryColor?: string;
  secondaryColor?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  unit?: string;
  onSelectCategory?: (category: string | null) => void;
}

export function InteractiveChart({
  title,
  subtitle,
  data,
  primaryColor = '#026fc5',
  secondaryColor = '#eab308',
  primaryLabel = 'Primary',
  secondaryLabel,
  unit = '',
  onSelectCategory,
}: InteractiveChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.value, d.secondaryValue || 0)),
    1
  );

  const handleBarClick = (category?: string) => {
    if (!category) return;
    const next = selectedCategory === category ? null : category;
    setSelectedCategory(next);
    if (onSelectCategory) onSelectCategory(next);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-bold text-slate-900">{title}</h4>
          </div>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: primaryColor }} />
            <span>{primaryLabel}</span>
          </div>
          {secondaryLabel && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: secondaryColor }} />
              <span>{secondaryLabel}</span>
            </div>
          )}
        </div>
      </div>

      {/* Active Filter Chip if selected */}
      {selectedCategory && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-[11px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-medium border border-blue-200 flex items-center gap-1">
            Filter: {selectedCategory}
            <button
              onClick={() => handleBarClick(selectedCategory)}
              className="text-blue-500 hover:text-blue-800 ml-1 font-bold"
            >
              ×
            </button>
          </span>
        </div>
      )}

      {/* Chart Canvas / SVG Presentation */}
      <div className="h-48 w-full flex items-end gap-3 pt-6 pb-2 px-1 relative border-b border-slate-100">
        {data.map((item, idx) => {
          const heightPercent = Math.round((item.value / maxValue) * 100);
          const secHeightPercent = item.secondaryValue
            ? Math.round((item.secondaryValue / maxValue) * 100)
            : 0;
          const isHovered = hoveredIdx === idx;
          const isDimmed = selectedCategory && item.category && selectedCategory !== item.category;

          return (
            <div
              key={idx}
              className={`flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer transition-opacity ${
                isDimmed ? 'opacity-30' : 'opacity-100'
              }`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => handleBarClick(item.category)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-12 z-20 bg-slate-900 text-white text-[11px] rounded-md px-2.5 py-1.5 shadow-lg whitespace-nowrap pointer-events-none">
                  <div className="font-semibold">{item.label}</div>
                  <div>
                    {primaryLabel}: {unit}
                    {item.value.toLocaleString()}
                  </div>
                  {item.secondaryValue !== undefined && (
                    <div>
                      {secondaryLabel}: {unit}
                      {item.secondaryValue.toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              {/* Bars */}
              <div className="w-full flex items-end justify-center gap-1 h-full">
                <div
                  className="w-full max-w-[28px] rounded-t transition-all duration-300"
                  style={{
                    height: `${Math.max(heightPercent, 4)}%`,
                    backgroundColor: primaryColor,
                  }}
                />
                {item.secondaryValue !== undefined && (
                  <div
                    className="w-full max-w-[28px] rounded-t transition-all duration-300"
                    style={{
                      height: `${Math.max(secHeightPercent, 4)}%`,
                      backgroundColor: secondaryColor,
                    }}
                  />
                )}
              </div>

              {/* Bottom Label */}
              <span className="text-[10px] text-slate-500 font-medium truncate max-w-[60px] mt-2 select-none">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3" /> Click any column to cross-filter records
        </span>
        <span>Zambian Academic Year 2026</span>
      </div>
    </div>
  );
}
