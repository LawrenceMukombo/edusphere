// src/app/finance/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  PlusCircle,
  Receipt as ReceiptIcon,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  X,
} from 'lucide-react';
import { EnterpriseTable, ColumnDef } from '@/components/EnterpriseTable';

interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  learner?: { firstName: string; lastName: string; studentNumber: string };
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: string;
  dueDate: string;
  issuedDate: string;
}

interface PaymentRecord {
  id: string;
  paymentNumber: string;
  learner?: { firstName: string; lastName: string; studentNumber: string };
  amount: number;
  paymentMethod: string;
  referenceNumber: string;
  receivedDate: string;
  receipt?: { receiptNumber: string };
}

export default function FinancePage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'ledger'>('invoices');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  // Payment Form State
  const [paymentForm, setPaymentForm] = useState({
    learnerId: '',
    invoiceId: '',
    amount: 1500,
    paymentMethod: 'BANK_TRANSFER',
    referenceNumber: `FT-${Date.now().toString().slice(-8)}`,
    notes: 'Term tuition payment',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [invRes, payRes, ledRes] = await Promise.all([
        fetch('/api/finance/invoices'),
        fetch('/api/finance/payments'),
        fetch('/api/finance/ledger'),
      ]);

      const [invJson, payJson, ledJson] = await Promise.all([
        invRes.json(),
        payRes.json(),
        ledRes.json(),
      ]);

      if (invJson.success) setInvoices(invJson.data);
      if (payJson.success) setPayments(payJson.data);
      if (ledJson.success) setLedgerEntries(ledJson.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const targetInvoice = invoices[0];
      const res = await fetch('/api/finance/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerId: targetInvoice?.learner ? (targetInvoice as any).learnerId : undefined,
          invoiceId: targetInvoice?.id,
          amount: Number(paymentForm.amount),
          paymentMethod: paymentForm.paymentMethod,
          referenceNumber: paymentForm.referenceNumber,
          notes: paymentForm.notes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setShowPaymentModal(false);
        fetchData();
        setSelectedReceipt(json.data.receipt);
      } else {
        alert(json.message);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Invoice Columns
  const invoiceColumns: ColumnDef<InvoiceRecord>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      sortable: true,
      render: (r) => <span className="font-mono font-bold text-blue-700">{r.invoiceNumber}</span>,
    },
    {
      key: 'learner',
      header: 'Learner',
      sortable: true,
      accessor: (r) => `${r.learner?.firstName} ${r.learner?.lastName}`,
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900">{r.learner?.firstName} {r.learner?.lastName}</span>
          <span className="block text-[11px] text-slate-400 font-mono">{r.learner?.studentNumber}</span>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Billed (ZMW)',
      sortable: true,
      render: (r) => <span className="font-bold">K{Number(r.totalAmount).toLocaleString()}</span>,
    },
    {
      key: 'paidAmount',
      header: 'Paid (ZMW)',
      sortable: true,
      render: (r) => <span className="font-semibold text-emerald-700">K{Number(r.paidAmount).toLocaleString()}</span>,
    },
    {
      key: 'balance',
      header: 'Outstanding (ZMW)',
      sortable: true,
      render: (r) => (
        <span className="font-bold text-rose-700">
          K{Number(r.balance).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Payment Status',
      sortable: true,
      filterable: true,
      filterOptions: ['ISSUED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED'],
      render: (r) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
            r.status === 'PAID'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : r.status === 'PARTIALLY_PAID'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          {r.status}
        </span>
      ),
    },
  ];

  // Ledger Columns
  const ledgerColumns: ColumnDef<any>[] = [
    {
      key: 'postedAt',
      header: 'Posting Date',
      sortable: true,
      render: (r) => <span className="text-slate-600 font-mono">{new Date(r.postedAt).toLocaleDateString()}</span>,
    },
    {
      key: 'entryType',
      header: 'Entry Type',
      sortable: true,
      filterable: true,
      filterOptions: ['DEBIT_CHARGE', 'CREDIT_PAYMENT', 'DEBIT_REVERSAL', 'CREDIT_REFUND'],
      render: (r) => {
        const isCredit = r.entryType.startsWith('CREDIT');
        return (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
              isCredit ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {r.entryType}
          </span>
        );
      },
    },
    {
      key: 'description',
      header: 'Transaction Narrative',
      render: (r) => <span className="text-slate-800 font-medium">{r.description}</span>,
    },
    {
      key: 'amount',
      header: 'Amount (ZMW)',
      sortable: true,
      render: (r) => <span className="font-bold font-mono">K{Number(r.amount).toLocaleString()}</span>,
    },
    {
      key: 'balanceAfter',
      header: 'Balance After',
      sortable: true,
      render: (r) => (
        <span className="font-bold font-mono text-slate-900">
          K{Number(r.balanceAfter).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Fees & Institutional Finance</h1>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative billing, payment capture, immutable double-entry ledger journal, and automated receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
          >
            <CreditCard className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 px-1 border-b-2 transition ${
            activeTab === 'invoices' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Student Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 px-1 border-b-2 transition ${
            activeTab === 'ledger' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Immutable Financial Journal ({ledgerEntries.length} Postings)
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'invoices' && (
        <EnterpriseTable
          title="Student Fee Accounts & Billing"
          description="Track active term tuition, laboratory levies, partial collections, and arrears"
          data={invoices}
          columns={invoiceColumns}
          isLoading={isLoading}
          onRefresh={fetchData}
          exportFilename="edusphere-invoices-register"
        />
      )}

      {activeTab === 'ledger' && (
        <EnterpriseTable
          title="Double-Entry Financial Journal"
          description="Permanent audit trail of debit charges, credit payments, and non-destructive reversals"
          data={ledgerEntries}
          columns={ledgerColumns}
          isLoading={isLoading}
          onRefresh={fetchData}
          exportFilename="edusphere-financial-journal"
        />
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Record Fee Payment</h3>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Account</label>
                <input
                  type="text"
                  disabled
                  value="Bupe Mwewa (EDS-2026-0042) — Secondary Tuition"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer (Zanaco/Stanbic)</option>
                    <option value="AIRTEL_MONEY">Airtel Money</option>
                    <option value="MTN_MONEY">MTN Mobile Money</option>
                    <option value="CASH">Cash Deposit</option>
                    <option value="CHEQUE">Bank Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (ZMW)</label>
                  <input
                    type="number"
                    required
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank / Transaction Reference</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FT26019284ZANACO"
                  value={paymentForm.referenceNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks / Note</label>
                <input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Post Payment & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Presentation Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">Official Payment Receipt</h3>
            <span className="font-mono text-xs font-bold text-blue-700 block mt-1">
              {selectedReceipt.receiptNumber}
            </span>
            <div className="my-4 py-3 border-y border-slate-100 text-xs text-slate-600 space-y-1">
              <p>Amount Paid: <strong className="text-slate-900 text-sm">K{Number(selectedReceipt.amount).toLocaleString()}</strong></p>
              <p>Issued: <strong>{new Date().toLocaleDateString()}</strong></p>
              <p className="text-[11px] text-slate-400">Captured to Immutable Posting Journal</p>
            </div>
            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
