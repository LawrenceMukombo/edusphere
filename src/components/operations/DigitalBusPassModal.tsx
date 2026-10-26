'use client';

import { X, Printer, Bus, QrCode, ShieldCheck, CheckCircle2, UserCheck, Calendar } from 'lucide-react';

interface DigitalBusPassModalProps {
  subscription: any;
  onClose: () => void;
}

export function DigitalBusPassModal({ subscription, onClose }: DigitalBusPassModalProps) {
  if (!subscription) return null;

  const learner = subscription.learner || {};
  const route = subscription.route || {};
  const passCode = subscription.passQrCode || `NWUCHAS-BUS-${learner.studentNumber || 'STD'}-9821A`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm print:static print:bg-white print:p-0">
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 print:max-h-none print:border-none print:p-0 print:shadow-none">
        
        {/* Modal Controls */}
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-800 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
            <Bus className="h-3.5 w-3.5" /> Official Shuttle Pass
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1 rounded-lg bg-cyan-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-cyan-800 transition"
            >
              <Printer className="h-3.5 w-3.5" /> Print Card
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Bus Pass Card */}
        <div className="rounded-2xl border-2 border-slate-800 bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 p-5 text-white shadow-xl relative overflow-hidden">
          
          {/* Subtle Decorative Pattern */}
          <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full border-4 border-cyan-500/20 pointer-events-none"></div>

          {/* Institutional Header */}
          <div className="border-b border-cyan-800/80 pb-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">NWUCHAS Transport Service</p>
              <h2 className="text-sm font-black tracking-tight text-white uppercase leading-tight">
                North Western University College
              </h2>
            </div>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
              ACTIVE
            </span>
          </div>

          {/* Student particulars & Photo */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-cyan-900/60 border border-cyan-500/40 text-cyan-200 font-bold text-lg">
              {learner.firstName?.[0] || 'S'}{learner.lastName?.[0] || 'T'}
            </div>
            <div className="space-y-0.5">
              <p className="text-base font-extrabold text-white">{learner.firstName} {learner.lastName}</p>
              <p className="text-xs font-mono text-cyan-300">ID: {learner.studentNumber}</p>
              <p className="text-[11px] text-slate-300">Student • Clinical Rotations</p>
            </div>
          </div>

          {/* Route & Vehicle details */}
          <div className="mt-4 rounded-xl bg-slate-800/80 p-3 border border-slate-700/80 space-y-1 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Authorised Route:</span>
              <span className="font-bold text-white">{route.routeCode || 'BUS-NWU-01'}</span>
            </div>
            <p className="text-[11px] font-medium text-cyan-200 leading-snug">
              {route.routeName || 'Manyama Main Gate — Lumwana Town — Hospital Annex'}
            </p>
            <div className="mt-2 pt-2 border-t border-slate-700 flex justify-between text-[11px] text-slate-400">
              <span>Vehicle: {route.vehicleReg || 'BAF 8492'}</span>
              <span>Valid Thru: {new Date(subscription.validUntil || Date.now() + 90 * 86400000).toLocaleDateString()}</span>
            </div>
          </div>

          {/* QR Code Token Representation */}
          <div className="mt-4 flex items-center justify-between rounded-xl bg-white p-3 text-slate-900">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cryptographic Verification Token</p>
              <p className="text-xs font-mono font-bold text-slate-900 tracking-tight">{passCode}</p>
              <p className="mt-0.5 text-[9px] text-slate-400">Scan at turnstiles or bus entry reader</p>
            </div>
            <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
              <QrCode className="h-8 w-8 text-slate-800" />
            </div>
          </div>

          {/* Safety & Notice */}
          <p className="mt-3 text-[9px] text-slate-400 text-center italic">
            This digital credential is the property of NWUCHAS. Egress at any turnstile or gate is guaranteed under fire safety regulations.
          </p>

        </div>

      </div>
    </div>
  );
}
