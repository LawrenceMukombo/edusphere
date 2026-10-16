// src/app/parent/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  Building,
} from 'lucide-react';

export default function ParentPortalPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentChannel, setPaymentChannel] = useState<'AIRTEL' | 'MTN'>('AIRTEL');
  const [payerPhone, setPayerPhone] = useState('+260977889900');

  useEffect(() => {
    fetch('/api/parent/children')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          setChildren(json.data);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const currentChild = children[selectedChildIndex]?.learner;

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
      setPaymentSuccess(true);
      setShowPaymentModal(false);
    }, 800);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-xs font-semibold text-slate-400">Loading authorized learner records...</span>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center max-w-md mx-auto">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">No Active Learner Links</h3>
        <p className="text-xs text-slate-500 mt-1">
          Your guardian account has no verified children or access has been temporarily revoked per school safeguarding policy.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Portal Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Guardian Portal
          </span>
          <h1 className="text-xl font-black text-slate-900 mt-0.5">Family Academic & Fee Center</h1>
          <p className="text-xs text-slate-500">Welcome, Mr. Kabaso Mwewa (Ibex Hill, Lusaka)</p>
        </div>

        {/* Multi-Child Switcher (PRD FR-PAR-001) */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          {children.map((item, idx) => (
            <button
              key={item.learner.id}
              onClick={() => setSelectedChildIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedChildIndex === idx
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{item.learner.firstName}</span>
            </button>
          ))}
        </div>
      </div>

      {paymentSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Mobile Money payment approved. School invoice updated and receipt REC-2026-ONLINE posted.</span>
          </div>
          <button onClick={() => setPaymentSuccess(false)} className="text-emerald-700 hover:text-emerald-950 font-bold">
            ×
          </button>
        </div>
      )}

      {currentChild && (
        <div className="space-y-6">
          {/* Child Identity Card */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold bg-blue-700/60 px-2.5 py-0.5 rounded border border-blue-400/30">
                {currentChild.studentNumber}
              </span>
              <h2 className="text-2xl font-black mt-2">
                {currentChild.firstName} {currentChild.lastName}
              </h2>
              <p className="text-xs text-blue-200 mt-1">
                Class: <strong>{currentChild.currentClass?.name || 'Form 2 Green'}</strong> • Campus: <strong>Senior Campus - Kabulonga</strong>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] font-semibold text-blue-200 uppercase">Outstanding Balance</span>
              <div className="text-2xl font-black text-white mt-0.5">K1,500.00</div>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs transition"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Pay via Mobile Money</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Term 1 Attendance</span>
              <p className="text-xl font-bold text-slate-900 mt-1">96.7%</p>
              <span className="text-[11px] text-emerald-600 font-medium">58 of 60 days present</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Academic Standing</span>
              <p className="text-xl font-bold text-slate-900 mt-1">Distinction (1)</p>
              <span className="text-[11px] text-slate-500 font-medium">Average Mark: 83.8%</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Report Card Status</span>
              <p className="text-xl font-bold text-emerald-700 mt-1">Published</p>
              <span className="text-[11px] text-slate-500 font-medium">Approved by Principal</span>
            </div>
          </div>

          {/* Published Report Card Box */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Term 1 Official Progress Report</h3>
              </div>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="font-semibold text-slate-500 block mb-1">Subject Results</span>
                <ul className="space-y-1 text-slate-700">
                  <li className="flex justify-between"><span>Mathematics:</span> <strong className="text-emerald-700">84.5% (Distinction)</strong></li>
                  <li className="flex justify-between"><span>English Language:</span> <strong className="text-blue-700">79.0% (Merit)</strong></li>
                  <li className="flex justify-between"><span>Integrated Science:</span> <strong className="text-emerald-700">88.0% (Distinction)</strong></li>
                </ul>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="font-semibold text-slate-500 block mb-1">Teacher Remarks</span>
                <p className="text-slate-700 italic">
                  &ldquo;Bupe is a focused, diligent learner with remarkable academic consistency.&rdquo;
                </p>
                <span className="block mt-2 font-semibold text-slate-500">Principal Remarks</span>
                <p className="text-slate-700 italic">
                  &ldquo;Approved for progression. An exemplary term result.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Online Payment Modal (MTN / Airtel Mobile Money) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-black text-slate-900">Online Fee Payment</h3>
            <p className="text-xs text-slate-500 mt-1">
              Direct merchant settlement to Kabulonga Combined Academy bank account.
            </p>

            <form onSubmit={handleSimulatePayment} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Channel</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentChannel('AIRTEL')}
                    className={`py-2 px-3 rounded-lg border font-bold text-center ${
                      paymentChannel === 'AIRTEL'
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Airtel Money
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentChannel('MTN')}
                    className={`py-2 px-3 rounded-lg border font-bold text-center ${
                      paymentChannel === 'MTN'
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    MTN MoMo
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Money Number</label>
                <input
                  type="tel"
                  required
                  value={payerPhone}
                  onChange={(e) => setPayerPhone(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount to Pay (ZMW)</label>
                <input
                  type="number"
                  disabled
                  value={1500}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold font-mono text-slate-800"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs"
                >
                  Initiate Prompt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
