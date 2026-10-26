/**
 * Global NWUCHAS Design System & Institutional Brand Standards
 * North Western University College of Health and Applied Sciences - Lumwana
 *
 * User Mandated Palette:
 * - Teal-blue:  #007B99 (Primary buttons, active states, header accents)
 * - Lime-green: #8DC63F (Secondary accents, banners, badges, highlights)
 * - Pink:       #EC008C (Pulse, alerts, healthcare badges, status indicators)
 * - Navy Header: #0b2545
 * - Slate Neutral: #334155
 */

export const NWUCHAS_THEME = {
  // Brand Hex Colors
  colors: {
    primary: '#007B99',      // Teal-blue
    primaryDark: '#00627a',
    primaryLight: '#e0f4f8',
    accent: '#8DC63F',       // Lime-green
    accentDark: '#72a330',
    accentLight: '#f4faea',
    pulsePink: '#EC008C',    // Pink
    pulsePinkDark: '#c70076',
    pulsePinkLight: '#fde6f4',
    navy: '#0b2545',
    slate: '#334155',
  },

  // Tables
  tableContainer: 'overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs',
  table: 'min-w-full divide-y divide-slate-200 text-left text-xs',
  th: 'px-4 py-3.5 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600 select-none',
  td: 'px-4 py-3.5 text-xs text-slate-700 align-middle',
  row: 'cursor-pointer hover:bg-[#007B99]/5 transition-colors border-b border-slate-100 last:border-b-0',
  rowSelected: 'bg-[#007B99]/10 hover:bg-[#007B99]/15 transition-colors border-b border-[#007B99]/30',

  // Forms & Inputs
  formGroup: 'space-y-1.5',
  label: 'block text-xs font-bold uppercase tracking-wider text-slate-700',
  input: 'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#007B99] focus:ring-2 focus:ring-[#007B99]/20 focus:outline-none transition shadow-2xs disabled:bg-slate-100 disabled:text-slate-500',
  select: 'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-[#007B99] focus:ring-2 focus:ring-[#007B99]/20 focus:outline-none transition shadow-2xs disabled:bg-slate-100',
  textarea: 'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#007B99] focus:ring-2 focus:ring-[#007B99]/20 focus:outline-none transition shadow-2xs resize-y',
  checkbox: 'h-4 w-4 rounded border-slate-300 text-[#007B99] focus:ring-[#007B99]',

  // Buttons
  btnPrimary: 'inline-flex items-center justify-center gap-2 rounded-lg bg-[#007B99] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#00627a] active:bg-[#004f63] transition disabled:opacity-50 disabled:cursor-not-allowed',
  btnAccent: 'inline-flex items-center justify-center gap-2 rounded-lg bg-[#8DC63F] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#72a330] active:bg-[#5c8426] transition disabled:opacity-50 disabled:cursor-not-allowed',
  btnPink: 'inline-flex items-center justify-center gap-2 rounded-lg bg-[#EC008C] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#c70076] active:bg-[#a30061] transition disabled:opacity-50 disabled:cursor-not-allowed',
  btnSecondary: 'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed',
  btnDanger: 'inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 active:bg-rose-800 transition disabled:opacity-50 disabled:cursor-not-allowed',
  btnGhost: 'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition',

  // Cards & Layout
  card: 'rounded-xl border border-slate-200 bg-white p-6 shadow-xs hover:border-[#007B99]/30 transition',
  cardHeader: 'border-b border-slate-100 pb-4 mb-4 flex items-center justify-between',
  headerBanner: 'rounded-xl border border-[#007B99]/20 bg-gradient-to-r from-sky-50 via-white to-lime-50 p-6 sm:p-8 shadow-xs',
  filterBar: 'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs',

  // Badges & Status Indicators
  badgePrimary: 'inline-flex items-center gap-1 rounded-full border border-[#007B99]/30 bg-[#007B99]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#007B99]',
  badgeAccent: 'inline-flex items-center gap-1 rounded-full border border-[#8DC63F]/40 bg-[#8DC63F]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#5c8426]',
  badgePink: 'inline-flex items-center gap-1 rounded-full border border-[#EC008C]/30 bg-[#EC008C]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#c70076]',
  badgeSuccess: 'inline-flex items-center gap-1 rounded-full border border-[#8DC63F]/40 bg-[#8DC63F]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#5c8426]',
  badgeWarning: 'inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800',
  badgeInfo: 'inline-flex items-center gap-1 rounded-full border border-[#007B99]/30 bg-[#007B99]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#007B99]',
  badgeDanger: 'inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-800',
  badgeNeutral: 'inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-bold text-slate-700',

  // Modals
  modalOverlay: 'fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150',
  modalContent: 'relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150',
  modalHeader: 'flex items-center justify-between border-b border-slate-100 pb-4 mb-5',
  modalFooter: 'mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4',
} as const;

// Backward-compatible alias for existing modules
export const GSB_THEME = NWUCHAS_THEME;

export default NWUCHAS_THEME;
