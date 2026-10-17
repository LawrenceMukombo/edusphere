// src/app/finance/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Receipt as ReceiptIcon,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  X,
  History,
  TrendingUp,
  BarChart3,
  Phone,
  Printer,
  ShieldAlert,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { EnterpriseTable, ColumnDef } from '@/components/EnterpriseTable';
import { InteractiveChart } from '@/components/InteractiveChart';

interface LearnerBalanceRecord {
  id: string;
  studentNumber: string;
  learnerName: string;
  className: string;
  stage: string;
  campusName: string;
  totalBilled: number;
  totalPaid: number;
  balance: number;
  financialStatus: string;
  ageing: {
    current: number;
    days31to60: number;
    days61to90: number;
    over90days: number;
  };
  guardian?: {
    name: string;
    phone: string;
    email?: string;
  } | null;
  invoiceCount: number;
  paymentCount: number;
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
  const [activeTab, setActiveTab] = useState<'balances' | 'reports' | 'invoices' | 'ledger'>('balances');
  const [learnerBalances, setLearnerBalances] = useState<LearnerBalanceRecord[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [reportsData, setReportsData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & History Drawer
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [selectedLearnerHistory, setSelectedLearnerHistory] = useState<any | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Active Report Subtab
  const [activeReportType, setActiveReportType] = useState<'cashbook' | 'categories' | 'classes' | 'ageing'>('cashbook');

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
      const [balRes, invRes, ledRes, repRes] = await Promise.all([
        fetch('/api/finance/balances'),
        fetch('/api/finance/invoices'),
        fetch('/api/finance/ledger'),
        fetch('/api/finance/reports'),
      ]);

      const [balJson, invJson, ledJson, repJson] = await Promise.all([
        balRes.json(),
        invRes.json(),
        ledRes.json(),
        repRes.json(),
      ]);

      if (balJson.success) setLearnerBalances(balJson.data);
      if (invJson.success) setInvoices(invJson.data);
      if (ledJson.success) setLedgerEntries(ledJson.data);
      if (repJson.success) setReportsData(repJson.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openLearnerPaymentHistory = async (learnerId: string) => {
    setHistoryLoading(true);
    setSelectedLearnerHistory(null);
    try {
      const res = await fetch(`/api/finance/learners/${learnerId}/payments`);
      const json = await res.json();
      if (json.success) {
        setSelectedLearnerHistory(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const targetInvoice = invoices[0];
      const res = await fetch('/api/finance/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerId: paymentForm.learnerId || (targetInvoice as any)?.learnerId,
          invoiceId: paymentForm.invoiceId || targetInvoice?.id,
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

  // 1. Learner Balances & Ageing Columns (Rule 24 compliant)
  const balanceColumns: ColumnDef<LearnerBalanceRecord>[] = [
    {
      key: 'studentNumber',
      header: 'Student ID',
      sortable: true,
      render: (r) => <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{r.studentNumber}</span>,
    },
    {
      key: 'learnerName',
      header: 'Learner Name',
      sortable: true,
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900">{r.learnerName}</span>
          <span className="block text-[11px] text-slate-400">{r.className} • {r.campusName}</span>
        </div>
      ),
    },
    {
      key: 'totalBilled',
      header: 'Billed (ZMW)',
      sortable: true,
      render: (r) => <span className="font-semibold text-slate-700">K{r.totalBilled.toLocaleString()}</span>,
    },
    {
      key: 'totalPaid',
      header: 'Paid (ZMW)',
      sortable: true,
      render: (r) => <span className="font-semibold text-emerald-700">K{r.totalPaid.toLocaleString()}</span>,
    },
    {
      key: 'balance',
      header: 'Balance (ZMW)',
      sortable: true,
      render: (r) => (
        <span className={`font-bold ${r.balance > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
          K{r.balance.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'financialStatus',
      header: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['CLEARED', 'PARTIAL', 'ARREARS', 'CHRONIC_ARREARS'],
      render: (r) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
            r.financialStatus === 'CLEARED'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : r.financialStatus === 'PARTIAL'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : r.financialStatus === 'CHRONIC_ARREARS'
              ? 'bg-rose-100 text-rose-800 border-rose-300'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          {r.financialStatus.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'ageingCurrent',
      header: 'Current (0-30d)',
      accessor: (r) => r.ageing.current,
      sortable: true,
      defaultVisible: true,
      render: (r) => (
        <span className="font-mono text-slate-600">
          {r.ageing.current > 0 ? `K${r.ageing.current.toLocaleString()}` : '—'}
        </span>
      ),
    },
    {
      key: 'ageing31to60',
      header: '31–60 Days',
      accessor: (r) => r.ageing.days31to60,
      sortable: true,
      defaultVisible: true,
      render: (r) => (
        <span className="font-mono text-amber-600 font-medium">
          {r.ageing.days31to60 > 0 ? `K${r.ageing.days31to60.toLocaleString()}` : '—'}
        </span>
      ),
    },
    {
      key: 'ageing61to90',
      header: '61–90 Days',
      accessor: (r) => r.ageing.days61to90,
      sortable: true,
      defaultVisible: true,
      render: (r) => (
        <span className="font-mono text-orange-600 font-semibold">
          {r.ageing.days61to90 > 0 ? `K${r.ageing.days61to90.toLocaleString()}` : '—'}
        </span>
      ),
    },
    {
      key: 'ageingOver90',
      header: '90+ Days Arrears',
      accessor: (r) => r.ageing.over90days,
      sortable: true,
      defaultVisible: true,
      render: (r) => (
        <span className="font-mono text-rose-700 font-bold">
          {r.ageing.over90days > 0 ? `K${r.ageing.over90days.toLocaleString()}` : '—'}
        </span>
      ),
    },
    {
      key: 'guardianPhone',
      header: 'Guardian Follow-up',
      accessor: (r) => r.guardian?.phone || 'None',
      defaultVisible: false,
      render: (r) =>
        r.guardian ? (
          <div>
            <span className="font-semibold text-slate-800">{r.guardian.name}</span>
            <span className="block text-[11px] text-slate-500 font-mono">{r.guardian.phone}</span>
          </div>
        ) : (
          <em className="text-slate-400">None</em>
        ),
    },
  ];

  // Invoice Columns
  const invoiceColumns: ColumnDef<any>[] = [
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

  // Total summary calculations
  const totalBilledInstitutional = reportsData?.totals?.totalBilled || learnerBalances.reduce((s, l) => s + l.totalBilled, 0);
  const totalCollectedInstitutional = reportsData?.totals?.totalCollected || learnerBalances.reduce((s, l) => s + l.totalPaid, 0);
  const totalOutstandingInstitutional = reportsData?.totals?.totalOutstanding || learnerBalances.reduce((s, l) => s + l.balance, 0);
  const over90Total = reportsData?.ageingSummary?.over90days || learnerBalances.reduce((s, l) => s + l.ageing.over90days, 0);

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Fees & Institutional Finance Hub</h1>
          <p className="text-xs text-slate-500 mt-1">
            Capture all learners’ fee balances, debtors ageing analysis, individual payment histories, and multi-type financial returns.
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

      {/* Institutional KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Billed Fees</span>
          <div className="text-2xl font-black text-slate-900 mt-1">K{totalBilledInstitutional.toLocaleString()}</div>
          <span className="text-[11px] text-slate-500 font-medium">All active student cohorts</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Collections</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">K{totalCollectedInstitutional.toLocaleString()}</div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {reportsData?.totals?.overallCollectionRate || 78.4}% Collection Rate
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Outstanding</span>
          <div className="text-2xl font-black text-rose-700 mt-1">K{totalOutstandingInstitutional.toLocaleString()}</div>
          <span className="text-[11px] text-slate-500">Unsettled receivables</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">90+ Days Chronic Arrears</span>
          <div className="text-2xl font-black text-orange-700 mt-1">K{over90Total.toLocaleString()}</div>
          <span className="text-[11px] text-orange-600 font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Requires bursar escalation
          </span>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="border-b border-slate-200 flex gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('balances')}
          className={`pb-3 px-1 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'balances' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Learner Fee Balances & Ageing ({learnerBalances.length} Pupils)</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-1 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'reports' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Financial Reports & Returns</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 px-1 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'invoices' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Student Invoices ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 px-1 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'ledger' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ReceiptIcon className="w-4 h-4" />
          <span>Double-Entry Journal ({ledgerEntries.length} Postings)</span>
        </button>
      </div>

      {/* TAB 1: ALL LEARNERS FEE BALANCES & AGEING */}
      {activeTab === 'balances' && (
        <div className="space-y-4">
          <EnterpriseTable
            title="All Learners Fee Balances & Debtors Ageing"
            description="Itemized balances, current and aged receivables (0-30d, 31-60d, 61-90d, 90+d), and payment history"
            data={learnerBalances}
            columns={balanceColumns}
            isLoading={isLoading}
            onRefresh={fetchData}
            exportFilename="edusphere-learners-aged-fee-balances"
            rowActions={(row) => (
              <button
                onClick={() => openLearnerPaymentHistory(row.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition"
                title="View full chronological payment history & receipts"
              >
                <History className="w-3.5 h-3.5" />
                <span>Payment History</span>
              </button>
            )}
          />
        </div>
      )}

      {/* TAB 2: MULTI-TYPE FINANCIAL REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Sub-report selector buttons */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveReportType('cashbook')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeReportType === 'cashbook' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily Cashbook Ledger
            </button>
            <button
              onClick={() => setActiveReportType('categories')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeReportType === 'categories' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fee Category Revenue
            </button>
            <button
              onClick={() => setActiveReportType('classes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeReportType === 'classes' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Class Collection Comparison
            </button>
            <button
              onClick={() => setActiveReportType('ageing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeReportType === 'ageing' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Aged Debtors Summary
            </button>
          </div>

          {/* REPORT TYPE 1: DAILY CASHBOOK */}
          {activeReportType === 'cashbook' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Daily Cashbook & Collections Report</h3>
                  <p className="text-xs text-slate-500">Summary of collections itemized by payment channel (Cash, Bank, Mobile Money, Cheque)</p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Cashbook</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase">
                      <th className="px-4 py-3">Collection Date</th>
                      <th className="px-4 py-3 text-right">Bank Transfer (ZMW)</th>
                      <th className="px-4 py-3 text-right">Airtel Money (ZMW)</th>
                      <th className="px-4 py-3 text-right">MTN MoMo (ZMW)</th>
                      <th className="px-4 py-3 text-right">Cash Deposit (ZMW)</th>
                      <th className="px-4 py-3 text-right">Cheque (ZMW)</th>
                      <th className="px-4 py-3 text-right font-bold text-slate-900">Day Total (ZMW)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportsData?.cashbook?.length > 0 ? (
                      reportsData.cashbook.map((row: any) => (
                        <tr key={row.date} className="hover:bg-slate-50/80 transition">
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">{row.date}</td>
                          <td className="px-4 py-3 text-right font-mono">K{row.bank.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-mono">K{row.airtel.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-mono">K{row.mtn.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-mono">K{row.cash.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-mono">K{row.cheque.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">K{row.total.toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                          No cashbook collections recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT TYPE 2: FEE CATEGORY REVENUE */}
          {activeReportType === 'categories' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Revenue Breakdown by Fee Category</h3>
                  <p className="text-xs text-slate-500">Distribution of billed vs collected fees across Tuition, Levies, Examination, and Transport</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase">
                      <th className="px-4 py-3">Fee Category</th>
                      <th className="px-4 py-3 text-right">Total Billed (ZMW)</th>
                      <th className="px-4 py-3 text-right">Estimated Collections (ZMW)</th>
                      <th className="px-4 py-3 text-right">Collection Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportsData?.categoryRevenue?.map((cat: any) => {
                      const rate = cat.billed > 0 ? Math.round((cat.collectedEstimate / cat.billed) * 100) : 0;
                      return (
                        <tr key={cat.category} className="hover:bg-slate-50/80 transition">
                          <td className="px-4 py-3 font-bold text-slate-900 capitalize">{cat.category.replace(/_/g, ' ')}</td>
                          <td className="px-4 py-3 text-right font-mono">K{cat.billed.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-mono text-emerald-700 font-medium">K{Math.round(cat.collectedEstimate).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-bold text-blue-700">{rate}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT TYPE 3: CLASS COLLECTION COMPARISON */}
          {activeReportType === 'classes' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Class & Cohort Collection Rate Comparison</h3>
                  <p className="text-xs text-slate-500">Comparison of fees billed, collected, and outstanding across every class stream</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase">
                      <th className="px-4 py-3">Class Cohort</th>
                      <th className="px-4 py-3">Educational Stage</th>
                      <th className="px-4 py-3 text-center">Pupils</th>
                      <th className="px-4 py-3 text-right">Billed (ZMW)</th>
                      <th className="px-4 py-3 text-right">Collected (ZMW)</th>
                      <th className="px-4 py-3 text-right">Outstanding (ZMW)</th>
                      <th className="px-4 py-3 text-right font-bold">Collection %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportsData?.classComparison?.map((cls: any) => (
                      <tr key={cls.classId} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-3 font-bold text-slate-900">{cls.className}</td>
                        <td className="px-4 py-3 text-slate-600 capitalize">{cls.stage.toLowerCase()}</td>
                        <td className="px-4 py-3 text-center font-medium">{cls.learnerCount}</td>
                        <td className="px-4 py-3 text-right font-mono">K{cls.billed.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-700">K{cls.collected.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono text-rose-700">K{cls.outstanding.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-bold ${cls.collectionRate >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {cls.collectionRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT TYPE 4: AGED DEBTORS INSTITUTIONAL SUMMARY */}
          {activeReportType === 'ageing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Current (0–30 Days)</span>
                  <div className="text-xl font-black text-slate-800 mt-1">
                    K{(reportsData?.ageingSummary?.current || 0).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-400">Regular term billing cycle</span>
                </div>

                <div className="p-4 bg-white rounded-xl border border-amber-200 bg-amber-50/30 shadow-2xs">
                  <span className="text-xs font-semibold text-amber-700 uppercase">31–60 Days Overdue</span>
                  <div className="text-xl font-black text-amber-800 mt-1">
                    K{(reportsData?.ageingSummary?.days31to60 || 0).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-amber-600">First payment reminder issued</span>
                </div>

                <div className="p-4 bg-white rounded-xl border border-orange-200 bg-orange-50/30 shadow-2xs">
                  <span className="text-xs font-semibold text-orange-700 uppercase">61–90 Days Overdue</span>
                  <div className="text-xl font-black text-orange-800 mt-1">
                    K{(reportsData?.ageingSummary?.days61to90 || 0).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-orange-600">Second payment reminder issued</span>
                </div>

                <div className="p-4 bg-white rounded-xl border border-rose-200 bg-rose-50/40 shadow-2xs">
                  <span className="text-xs font-semibold text-rose-700 uppercase">90+ Days Chronic Arrears</span>
                  <div className="text-xl font-black text-rose-800 mt-1">
                    K{(reportsData?.ageingSummary?.over90days || 0).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-rose-600 font-semibold">Immediate bursar consultation</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STUDENT INVOICES */}
      {activeTab === 'invoices' && (
        <EnterpriseTable
          title="Student Fee Invoices"
          description="Track active term tuition, laboratory levies, partial collections, and arrears"
          data={invoices}
          columns={invoiceColumns}
          isLoading={isLoading}
          onRefresh={fetchData}
          exportFilename="edusphere-invoices-register"
        />
      )}

      {/* TAB 4: IMMUTABLE FINANCIAL JOURNAL */}
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

      {/* LEARNER PAYMENT HISTORY MODAL / DRAWER */}
      {selectedLearnerHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedLearnerHistory.learner.studentNumber}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Payment History: {selectedLearnerHistory.learner.firstName} {selectedLearnerHistory.learner.lastName}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedLearnerHistory.learner.currentClass?.name || 'Class Cohort'} • Cumulative Paid: <strong>K{selectedLearnerHistory.totalPaid.toLocaleString()}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedLearnerHistory(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {selectedLearnerHistory.payments.length > 0 ? (
                selectedLearnerHistory.payments.map((payment: any) => (
                  <div
                    key={payment.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{payment.paymentNumber}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          {payment.paymentMethod.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-1">
                        Ref: <strong className="font-mono text-slate-700">{payment.referenceNumber}</strong> • Date: <strong>{new Date(payment.receivedDate).toLocaleDateString()}</strong>
                      </p>
                      {payment.notes && <p className="text-slate-600 italic mt-0.5">&ldquo;{payment.notes}&rdquo;</p>}
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-base font-black text-emerald-700 font-mono">
                        K{Number(payment.amount).toLocaleString()}
                      </div>
                      {payment.receipt && (
                        <button
                          onClick={() => setSelectedReceipt(payment.receipt)}
                          className="mt-1 text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                        >
                          <ReceiptIcon className="w-3.5 h-3.5" />
                          <span>Receipt {payment.receipt.receiptNumber}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No payment records found for this learner.
                </div>
              )}
            </div>
          </div>
        </div>
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
                <select
                  value={paymentForm.learnerId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, learnerId: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Learner...</option>
                  {learnerBalances.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.learnerName} ({l.studentNumber}) — Balance: K{l.balance.toLocaleString()}
                    </option>
                  ))}
                </select>
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
