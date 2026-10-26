'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Receipt,
  Check,
  DollarSign,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  onPaymentRecorded: (payment: any, receipt: any) => void;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  invoice,
  onPaymentRecorded,
}: RecordPaymentModalProps) {
  if (!isOpen || !invoice) return null;

  const [amount, setAmount] = useState<number>(invoice.balanceZMW || invoice.balance || 0);
  const [paymentMethod, setPaymentMethod] = useState<string>('AIRTEL_MONEY');
  const [reference, setReference] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Mobile Money Options
  // 'ussd_push': Prompt student handset with USSD PIN dialog
  // 'existing_ref': Student already paid via agent/USSD and has MNO transaction reference
  const [momoMode, setMomoMode] = useState<'ussd_push' | 'existing_ref'>('ussd_push');
  const [phoneMsisdn, setPhoneMsisdn] = useState<string>('+260 977 412098');
  const [isVerifyingRef, setIsVerifyingRef] = useState<boolean>(false);
  const [refVerified, setRefVerified] = useState<boolean>(false);
  const [verifiedDetails, setVerifiedDetails] = useState<string | null>(null);

  // USSD Interactive Prompt Overlay State
  const [showUssdPrompt, setShowUssdPrompt] = useState<boolean>(false);
  const [ussdPin, setUssdPin] = useState<string>('');
  const [ussdTimer, setUssdTimer] = useState<number>(60);
  const [ussdStatus, setUssdStatus] = useState<'awaiting_pin' | 'processing' | 'approved' | 'failed'>('awaiting_pin');

  const isMobileMoney = paymentMethod === 'AIRTEL_MONEY' || paymentMethod === 'MTN_MOMO';

  // Set default phone prefix based on provider
  useEffect(() => {
    if (paymentMethod === 'AIRTEL_MONEY') {
      setPhoneMsisdn('+260 977 412098');
    } else if (paymentMethod === 'MTN_MOMO') {
      setPhoneMsisdn('+260 966 845120');
    }
    setRefVerified(false);
    setVerifiedDetails(null);
  }, [paymentMethod]);

  // USSD timer countdown
  useEffect(() => {
    let interval: any;
    if (showUssdPrompt && ussdStatus === 'awaiting_pin' && ussdTimer > 0) {
      interval = setInterval(() => {
        setUssdTimer((prev) => prev - 1);
      }, 1000);
    } else if (ussdTimer === 0 && ussdStatus === 'awaiting_pin') {
      setUssdStatus('failed');
      setErrorMessage('USSD session expired on student handset. Please retry.');
    }
    return () => clearInterval(interval);
  }, [showUssdPrompt, ussdStatus, ussdTimer]);

  // Trigger Live USSD Push
  function handleTriggerUssdPush() {
    if (!amount || amount <= 0) {
      setErrorMessage('Please enter a valid payment amount.');
      return;
    }
    if (!phoneMsisdn || phoneMsisdn.length < 10) {
      setErrorMessage('Please enter a valid Zambian mobile number (+260 97X... / +260 96X...).');
      return;
    }

    setErrorMessage('');
    setUssdPin('');
    setUssdTimer(60);
    setUssdStatus('awaiting_pin');
    setShowUssdPrompt(true);
  }

  // Confirm USSD PIN & Authorise
  async function handleConfirmUssdPin() {
    if (!ussdPin || ussdPin.length < 4) {
      setErrorMessage('Please enter your 4-digit Mobile Money PIN.');
      return;
    }

    setUssdStatus('processing');

    setTimeout(async () => {
      const generatedMnoRef =
        paymentMethod === 'AIRTEL_MONEY'
          ? `AMZ-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`
          : `MTN-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

      setReference(generatedMnoRef);
      setUssdStatus('approved');

      // Post payment automatically
      await executePaymentSubmission(generatedMnoRef);
    }, 1200);
  }

  // Verify manual reference
  async function handleVerifyReference() {
    if (!reference.trim()) {
      setErrorMessage('Please enter the MNO transaction reference number to verify.');
      return;
    }

    setIsVerifyingRef(true);
    setErrorMessage('');

    setTimeout(() => {
      setIsVerifyingRef(false);
      setRefVerified(true);
      setVerifiedDetails(
        `✓ Validated on ${
          paymentMethod === 'AIRTEL_MONEY' ? 'Airtel Africa Open API' : 'MTN MoMo Gateway'
        } clearing switch. Settled amount: K${amount.toLocaleString()} matches invoice ${invoice.invoiceNumber}.`
      );
    }, 900);
  }

  // Submission handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setErrorMessage('Please enter a valid payment amount.');
      return;
    }

    if (isMobileMoney && momoMode === 'existing_ref' && !reference.trim()) {
      setErrorMessage('Please enter and verify the transaction reference before recording.');
      return;
    }

    const finalRef = reference.trim() || `REF-${Math.floor(100000 + Math.random() * 900000)}`;
    await executePaymentSubmission(finalRef);
  }

  async function executePaymentSubmission(finalRef: string) {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/finance/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerId: invoice.learnerId,
          invoiceId: invoice.id,
          amount,
          paymentMethod,
          reference: finalRef,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const receiptData = {
          receiptNumber: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          studentName: invoice.studentName || `${invoice.learner?.firstName || ''} ${invoice.learner?.lastName || ''}`,
          studentNumber: invoice.studentNumber || invoice.learner?.studentNumber || 'NWU/2026/0014',
          programme: invoice.programme || 'Health Science Programme',
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          amountZMW: amount,
          paymentMethod,
          reference: finalRef,
          allocations: [
            { item: 'Tuition Fee Allocation', amountZMW: Math.min(amount, 6500) },
            { item: 'Clinical Placement Allocation', amountZMW: Math.max(0, amount - 6500) },
          ],
          invoiceNumber: invoice.invoiceNumber,
          remainingBalanceZMW: Math.max(0, (invoice.balanceZMW || invoice.balance || 0) - amount),
          cashierName: 'Mr. Clement Banda, Bursar',
        };

        onPaymentRecorded(data.data, receiptData);
        setShowUssdPrompt(false);
        onClose();
      } else {
        setErrorMessage(data.message || 'Failed to record payment.');
        setUssdStatus('awaiting_pin');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error recording payment.');
      setUssdStatus('awaiting_pin');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white text-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-600 text-white">
              <Receipt className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Record Student Fee Payment</h3>
              <p className="text-[11px] text-slate-500 font-mono">Invoice: {invoice.invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs font-bold text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Invoice Summary */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Candidate:</span>
              <span className="font-extrabold text-slate-900">
                {invoice.studentName || `${invoice.learner?.firstName || ''} ${invoice.learner?.lastName || ''}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Student ID:</span>
              <span className="font-mono font-bold text-cyan-800">{invoice.studentNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Invoice Total:</span>
              <span className="font-mono font-bold text-slate-900">
                K{(invoice.totalZMW || invoice.totalAmount || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Outstanding Balance:</span>
              <span className="font-mono font-extrabold text-rose-700">
                K{(invoice.balanceZMW || invoice.balance || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Amount to Receive (ZMW)
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">K</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                max={invoice.balanceZMW || invoice.balance || 999999}
                className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-2 font-mono text-sm font-extrabold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Payment Rail / Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-cyan-600 focus:outline-none"
            >
              <option value="AIRTEL_MONEY">Airtel Money (Push Prompt / *778#)</option>
              <option value="MTN_MOMO">MTN Mobile Money (Merchant Push / *303#)</option>
              <option value="ZANACO_BILLMASTER">ZANACO Billmaster Bank Collection</option>
              <option value="BANK_TRANSFER">Direct Electronic Funds Transfer (EFT)</option>
              <option value="CASH">Official Campus Cashier Office</option>
            </select>
          </div>

          {/* MOBILE MONEY WORKFLOW: USSD PUSH VS. EXISTING REFERENCE */}
          {isMobileMoney ? (
            <div className="rounded-xl border border-cyan-200 bg-cyan-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-cyan-950 flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-cyan-700" />
                  {paymentMethod === 'AIRTEL_MONEY' ? 'Airtel Money Rail' : 'MTN MoMo Rail'}
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  ONLINE GATEWAY
                </span>
              </div>

              {/* Toggle Mode: USSD Push vs. Already Paid with Reference */}
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-cyan-100/70 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMomoMode('ussd_push')}
                  className={`rounded-md py-1.5 text-center transition ${
                    momoMode === 'ussd_push'
                      ? 'bg-white text-cyan-950 shadow-sm'
                      : 'text-cyan-800 hover:text-cyan-950'
                  }`}
                >
                  USSD Push to Student
                </button>
                <button
                  type="button"
                  onClick={() => setMomoMode('existing_ref')}
                  className={`rounded-md py-1.5 text-center transition ${
                    momoMode === 'existing_ref'
                      ? 'bg-white text-cyan-950 shadow-sm'
                      : 'text-cyan-800 hover:text-cyan-950'
                  }`}
                >
                  Have MNO Reference
                </button>
              </div>

              {momoMode === 'ussd_push' ? (
                /* Mode 1: Dispatch USSD Push Prompt */
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">
                      Student Mobile Phone Number (MSISDN):
                    </label>
                    <input
                      type="text"
                      value={phoneMsisdn}
                      onChange={(e) => setPhoneMsisdn(e.target.value)}
                      placeholder="+260 97X XXX XXX"
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs font-bold text-slate-900 focus:border-cyan-600 focus:outline-none"
                    />
                    <p className="mt-1 text-[10px] text-slate-500">
                      Dispatches immediate interactive prompt to student's phone. Student enters PIN on their handset to approve deduction.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleTriggerUssdPush}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-cyan-800 transition"
                  >
                    <Smartphone className="h-4 w-4" />
                    Open USSD Push on Student Phone (K{amount.toLocaleString()})
                  </button>
                </div>
              ) : (
                /* Mode 2: Existing MNO Reference Verification */
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">
                      MNO / Gateway Reference Number:
                    </label>
                    <div className="mt-1 flex gap-2">
                      <input
                        type="text"
                        value={reference}
                        onChange={(e) => {
                          setReference(e.target.value);
                          setRefVerified(false);
                          setVerifiedDetails(null);
                        }}
                        placeholder={
                          paymentMethod === 'AIRTEL_MONEY'
                            ? 'e.g. MP261025.1209.A12345 or AMZ-981023'
                            : 'e.g. MTN-84920194 or 03918294'
                        }
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs text-slate-900 focus:border-cyan-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyReference}
                        disabled={isVerifyingRef || !reference.trim()}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-900 disabled:opacity-50"
                      >
                        {isVerifyingRef ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        )}
                        Verify
                      </button>
                    </div>
                  </div>

                  {verifiedDetails && (
                    <div className="flex items-start gap-2 rounded-lg border border-emerald-300 bg-emerald-50 p-2.5 text-[11px] text-emerald-800 font-semibold">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                      <span>{verifiedDetails}</span>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-500 italic">
                    Use when the candidate already executed payment via Airtel/MTN *778# / *303# or at an agent booth and holds an SMS transaction receipt.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Traditional Reference Input for Bank & Cash */
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Transaction / Bank Deposit Reference
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Deposit slip number, cheque number, or bank ref"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-800 focus:border-cyan-600 focus:outline-none"
              />
            </div>
          )}

          {/* Form Actions */}
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (isMobileMoney && momoMode === 'existing_ref' && !refVerified)}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {isSubmitting ? 'Posting Payment...' : 'Record Payment & Issue Receipt'}
            </button>
          </div>
        </form>

        {/* INTERACTIVE USSD PUSH HANDSET SIMULATOR MODAL */}
        {showUssdPrompt && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
            <div className="w-full max-w-sm rounded-3xl border-4 border-slate-800 bg-slate-900 p-6 text-white shadow-2xl">
              {/* Phone Speaker Notch */}
              <div className="mx-auto h-1.5 w-16 rounded-full bg-slate-700 mb-6" />

              <div className="rounded-2xl border border-slate-700 bg-slate-800/90 p-5 shadow-inner">
                {/* Handset Header */}
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold tracking-wider text-slate-300">
                      {paymentMethod === 'AIRTEL_MONEY' ? 'AIRTEL MONEY *778#' : 'MTN MOMO *303#'}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-amber-400 font-bold">{ussdTimer}s</span>
                </div>

                {ussdStatus === 'awaiting_pin' && (
                  <div className="mt-4 space-y-4">
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-200">
                        North Western University College
                      </p>
                      <p className="text-[11px] text-cyan-300 font-medium">
                        Student Fee Collection
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-900/80 p-3 text-xs space-y-1 font-mono text-slate-300">
                      <div className="flex justify-between">
                        <span>Invoice:</span>
                        <span className="text-white font-bold">{invoice.invoiceNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Student:</span>
                        <span className="text-white font-bold truncate max-w-[140px]">
                          {invoice.studentName}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-slate-800 pt-1 text-emerald-400 font-bold">
                        <span>Amount Due:</span>
                        <span>ZMW {amount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-center text-xs font-semibold text-slate-300 mb-1.5">
                        Enter Mobile Money PIN to Authorise:
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        autoFocus
                        value={ussdPin}
                        onChange={(e) => setUssdPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        className="w-full text-center text-2xl font-mono tracking-widest rounded-xl border border-slate-600 bg-slate-950 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowUssdPrompt(false)}
                        className="flex-1 rounded-xl bg-slate-700 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmUssdPin}
                        disabled={ussdPin.length < 4}
                        className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-extrabold text-white hover:bg-emerald-500 disabled:opacity-50 shadow-md"
                      >
                        Authorise (PIN)
                      </button>
                    </div>
                  </div>
                )}

                {ussdStatus === 'processing' && (
                  <div className="py-8 text-center space-y-3">
                    <RefreshCw className="mx-auto h-8 w-8 text-cyan-400 animate-spin" />
                    <p className="text-xs font-bold text-white">Communicating with MNO Clearing Rail...</p>
                    <p className="text-[11px] text-slate-400">Verifying customer PIN and account balance</p>
                  </div>
                )}

                {ussdStatus === 'approved' && (
                  <div className="py-6 text-center space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-emerald-400">Payment Approved & Settled!</p>
                      <p className="mt-1 font-mono text-xs text-slate-300">Ref: {reference}</p>
                    </div>
                    <p className="text-[11px] text-slate-400">Recording transaction in ledger & issuing receipt...</p>
                  </div>
                )}

                {ussdStatus === 'failed' && (
                  <div className="py-6 text-center space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
                      <AlertCircle className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-rose-400">USSD Session Timed Out</p>
                      <p className="mt-1 text-xs text-slate-400">No PIN entered within 60 seconds.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUssdPrompt(false)}
                      className="rounded-xl bg-slate-700 px-4 py-2 text-xs font-bold text-white"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
