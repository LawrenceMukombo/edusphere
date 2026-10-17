// src/app/finance/page.tsx — Transparent Financial Inflows, Ledger & Operational Expenditures
'use client';

import React, { useState, useEffect, useMemo } from 'react';

// ... other imports ...
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
  Plus,
  Building2,
  Fuel,
  Beef,
  Briefcase,
  Wrench,
  FlaskConical,
  Bus,
  Layers,
  Check,
  RotateCcw,
} from 'lucide-react';
import { EnterpriseTable, ColumnDef } from '@/components/EnterpriseTable';
import { InteractiveChart } from '@/components/InteractiveChart';
import { useCampus } from '@/components/CampusContext';
import {
  LEGACY_EXPENDITURES,
  LEGACY_FEE_TRANSACTIONS,
  ExpenditureRecord,
  FeeTransactionRecord,
} from '@/server/services/legacySchoolData';

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

export default function FinancePage() {
  const { selectedCampus, campusInfo } = useCampus();
  const [activeTab, setActiveTab] = useState<'balances' | 'ledger' | 'expenditures' | 'reports'>('balances');
  const [learnerBalances, setLearnerBalances] = useState<LearnerBalanceRecord[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [expenditures, setExpenditures] = useState<ExpenditureRecord[]>(LEGACY_EXPENDITURES);
  const [reportsData, setReportsData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & History Drawer
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [selectedLearnerHistory, setSelectedLearnerHistory] = useState<any | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Report Subtab
  const [activeReportType, setActiveReportType] = useState<'cashbook' | 'categories' | 'classes' | 'ageing' | 'statement'>('cashbook');

  // Payment Form State
  const [paymentForm, setPaymentForm] = useState({
    learnerId: '',
    learnerName: 'Chileshe Mulenga Jr.',
    studentNumber: 'LSS-2026-0142',
    amount: 5200,
    paymentMethod: 'ZANACO_BILLPAY',
    referenceNumber: `FT-${Date.now().toString().slice(-8)}`,
    notes: 'Term 1 Boarding & Tuition instalment',
  });

  // Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    category: 'FOOD_BOARDING_RATIONS' as const,
    categoryLabel: 'Food & Boarding Dining Provisions',
    campusId: 'LSS-MSC' as const,
    campusName: 'Mushitala Campus (Near Kansanshi)',
    amountZMW: 12500,
    vendorName: '',
    vendorTpin: '',
    paymentMethod: 'BANK_EFT' as const,
    referenceNumber: `EFT-${Date.now().toString().slice(-6)}`,
    description: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Drilldown & Interactive Cross-Filtering State
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CLEARED' | 'PARTIAL' | 'ARREARS' | 'CHRONIC_ARREARS'>('ALL');
  const [selectedChartClass, setSelectedChartClass] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [balRes, ledRes, expRes, repRes] = await Promise.all([
        fetch(`/api/finance/balances?campus=${selectedCampus}`),
        fetch(`/api/finance/ledger?campus=${selectedCampus}`),
        fetch(`/api/finance/expenditures?campusId=${selectedCampus}`),
        fetch(`/api/finance/reports?campus=${selectedCampus}`),
      ]);

      const [balJson, ledJson, expJson, repJson] = await Promise.all([
        balRes.json(),
        ledRes.json(),
        expRes.json(),
        repRes.json(),
      ]);

      if (balJson.success) setLearnerBalances(balJson.data);
      if (ledJson.success) setLedgerEntries(ledJson.data);
      if (expJson.success && expJson.data.expenditures) setExpenditures(expJson.data.expenditures);
      if (repJson.success) setReportsData(repJson.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Reset any local chart filter when campus changes so clean campus overview is presented
    setSelectedChartClass(null);
    fetchData();
  }, [selectedCampus]);

  // Dynamic Financial Calculations from current campus data
  const totalBilled = useMemo(() => learnerBalances.reduce((sum, b) => sum + b.totalBilled, 0), [learnerBalances]);
  const totalCollected = useMemo(() => learnerBalances.reduce((sum, b) => sum + b.totalPaid, 0), [learnerBalances]);
  const totalArrears = useMemo(() => learnerBalances.reduce((sum, b) => sum + b.balance, 0), [learnerBalances]);
  const recoveryRate = totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : '0';
  const totalDisbursed = useMemo(() => expenditures.filter((e) => e.status === 'DISBURSED').reduce((sum, e) => sum + e.amountZMW, 0), [expenditures]);
  const netSurplus = totalCollected - totalDisbursed;

  const clearedCount = useMemo(() => learnerBalances.filter((b) => b.financialStatus === 'CLEARED').length, [learnerBalances]);
  const partialCount = useMemo(() => learnerBalances.filter((b) => b.financialStatus === 'PARTIAL').length, [learnerBalances]);
  const arrearsCount = useMemo(() => learnerBalances.filter((b) => b.financialStatus === 'ARREARS' || b.financialStatus === 'CHRONIC_ARREARS').length, [learnerBalances]);

  // Filtered balances by drilldown status or chart click
  const displayedBalances = useMemo(() => {
    let list = learnerBalances;
    if (statusFilter !== 'ALL') {
      list = list.filter((b) => b.financialStatus === statusFilter);
    }
    if (selectedChartClass) {
      list = list.filter((b) => b.className.toLowerCase().includes(selectedChartClass.toLowerCase()) || b.stage.toLowerCase().includes(selectedChartClass.toLowerCase()));
    }
    return list;
  }, [learnerBalances, statusFilter, selectedChartClass]);

  // Collections vs Billed by Class for Interactive Chart
  const collectionsChartData = useMemo(() => {
    const byClass: Record<string, { billed: number; collected: number; stage: string }> = {};
    for (const b of learnerBalances) {
      if (!byClass[b.className]) {
        byClass[b.className] = { billed: 0, collected: 0, stage: b.stage };
      }
      byClass[b.className].billed += b.totalBilled;
      byClass[b.className].collected += b.totalPaid;
    }
    return Object.entries(byClass).map(([cls, data]) => ({
      label: cls.replace(' (Candidates)', '').replace(' (Senior Candidates)', '').replace(' (ECZ Candidates)', ''),
      value: data.collected,
      secondaryValue: data.billed,
      category: data.stage.replace(/_/g, ' '),
    })).slice(0, 10);
  }, [learnerBalances]);

  const openLearnerPaymentHistory = (learner: LearnerBalanceRecord) => {
    setSelectedLearnerHistory({
      learner: {
        firstName: learner.learnerName.split(' ')[0],
        lastName: learner.learnerName.split(' ').slice(1).join(' '),
        studentNumber: learner.studentNumber,
        currentClass: { name: learner.className },
        campus: { name: learner.campusName },
      },
      payments: [
        {
          id: 'pay-001',
          paymentNumber: 'PAY-2026-0089',
          amount: learner.totalPaid,
          paymentMethod: 'ZANACO_BILLPAY',
          referenceNumber: 'ZNCO-SOL-882194',
          receivedDate: '2026-10-16T11:24:00Z',
          receipt: { receiptNumber: 'REC-SOL-2026-00412' },
        },
      ],
      totalPaid: learner.totalPaid,
    });
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTxn = {
      receiptNumber: `REC-SOL-2026-00${Math.floor(420 + Math.random() * 80)}`,
      amount: paymentForm.amount,
      learnerName: paymentForm.learnerName,
      studentNumber: paymentForm.studentNumber,
      paymentMethod: paymentForm.paymentMethod,
      referenceNumber: paymentForm.referenceNumber,
    };
    setSelectedReceipt(newTxn);
    setShowPaymentModal(false);
    showToast(`Payment of ZMW ${paymentForm.amount.toLocaleString()} posted. Official receipt issued.`);
    fetchData();
  };

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/finance/expenditures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseForm),
      });
      const json = await res.json();
      if (json.success) {
        setShowExpenseModal(false);
        showToast(`Expenditure voucher ${json.data.voucherNumber} authorized and posted to outflows journal.`);
        fetchData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 1. Learner Balances Columns
  const balanceColumns: ColumnDef<LearnerBalanceRecord>[] = [
    {
      key: 'studentNumber',
      header: 'Student ID',
      sortable: true,
      render: (r) => <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">{r.studentNumber}</span>,
    },
    {
      key: 'learnerName',
      header: 'Learner Member',
      sortable: true,
      accessor: (r) => r.learnerName,
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 block">{r.learnerName}</span>
          <span className="text-[11px] text-slate-500">
            {r.className} • <span className="font-semibold text-blue-700">{r.campusName}</span>
          </span>
        </div>
      ),
    },
    {
      key: 'totalBilled',
      header: 'Total Invoiced (ZMW)',
      sortable: true,
      render: (r) => <span className="font-mono font-bold text-slate-800">K{r.totalBilled.toLocaleString()}</span>,
    },
    {
      key: 'totalPaid',
      header: 'Collected (ZMW)',
      sortable: true,
      render: (r) => <span className="font-mono font-bold text-emerald-700">K{r.totalPaid.toLocaleString()}</span>,
    },
    {
      key: 'balance',
      header: 'Outstanding Balance',
      sortable: true,
      render: (r) => (
        <span
          className={`font-mono font-black text-xs px-2.5 py-0.5 rounded-md ${
            r.balance <= 0
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          K{r.balance.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'financialStatus',
      header: 'Status',
      sortable: true,
      render: (r) => {
        const styles: Record<string, string> = {
          CLEARED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          PARTIAL: 'bg-amber-50 text-amber-700 border-amber-200',
          ARREARS: 'bg-rose-50 text-rose-700 border-rose-200',
          CHRONIC_ARREARS: 'bg-red-100 text-red-800 border-red-300 font-bold',
        };
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[r.financialStatus] || 'bg-slate-50 text-slate-700'}`}>
            {r.financialStatus.replace(/_/g, ' ')}
          </span>
        );
      },
    },
    {
      key: 'guardian',
      header: 'Parent / Payer Contact',
      render: (r) => (
        <div className="text-xs">
          <span className="font-bold text-slate-800 block">{r.guardian?.name || 'Guardian'}</span>
          <span className="font-mono text-slate-500 text-[11px]">{r.guardian?.phone || 'N/A'}</span>
        </div>
      ),
    },
  ];

  // 2. Inflows Ledger Columns (Transparent Transactions)
  const ledgerColumns: ColumnDef<any>[] = [
    {
      key: 'receipt',
      header: 'Official Receipt #',
      sortable: true,
      render: (r) => (
        <span className="font-mono font-black text-xs text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {r.payment?.receipt?.receiptNumber || 'REC-SOL-2026'}
        </span>
      ),
    },
    {
      key: 'learnerName',
      header: 'Student & Campus',
      sortable: true,
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 block">{r.learnerName || 'Student Account'}</span>
          <span className="text-[11px] text-slate-500 font-mono">
            {r.studentNumber} • <span className="text-blue-700 font-semibold">{r.campusName || 'Solwezi'}</span>
          </span>
        </div>
      ),
    },
    {
      key: 'postedAt',
      header: 'Date & Time',
      sortable: true,
      render: (r) => (
        <span className="text-slate-600 text-xs">
          {r.postedAt ? new Date(r.postedAt).toLocaleDateString() : 'Today'}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Fee Classification & Payment Channel',
      render: (r) => (
        <div className="text-xs max-w-sm">
          <span className="font-bold text-slate-800 block">{r.description}</span>
          <span className="text-[11px] text-slate-500 font-mono">
            Ref: {r.payment?.referenceNumber || 'DIRECT'}
          </span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount Received (ZMW)',
      sortable: true,
      render: (r) => (
        <span className="font-mono font-black text-emerald-700 text-sm">
          +K{Number(r.amount).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'postedById',
      header: 'Bursar Stamp',
      render: (r) => (
        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
          {r.postedById || 'Mr. C. Mulenga'}
        </span>
      ),
    },
  ];

  // 3. Operational Expenditures Columns (Comprehensive Outflows)
  const expenseColumns: ColumnDef<ExpenditureRecord>[] = [
    {
      key: 'voucherNumber',
      header: 'Voucher #',
      sortable: true,
      render: (e) => (
        <div>
          <span className="font-mono font-bold text-indigo-900 block">{e.voucherNumber}</span>
          <span className="font-mono text-[10px] text-slate-400">{e.expenseNumber}</span>
        </div>
      ),
    },
    {
      key: 'expenseDate',
      header: 'Disbursement Date',
      sortable: true,
      render: (e) => <span className="text-xs font-semibold text-slate-700">{e.expenseDate}</span>,
    },
    {
      key: 'campusName',
      header: 'Campus Allocation',
      sortable: true,
      render: (e) => (
        <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {e.campusName}
        </span>
      ),
    },
    {
      key: 'categoryLabel',
      header: 'Expenditure Classification',
      sortable: true,
      render: (e) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{e.title}</span>
          <span className="text-[11px] text-slate-500">{e.categoryLabel}</span>
        </div>
      ),
    },
    {
      key: 'vendorName',
      header: 'Payee / Vendor',
      sortable: true,
      render: (e) => (
        <div className="text-xs">
          <span className="font-bold text-slate-800 block">{e.vendorName}</span>
          <span className="text-[10px] text-slate-500 font-mono">TPIN: {e.vendorTpin || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'amountZMW',
      header: 'Amount Disbursed (ZMW)',
      sortable: true,
      render: (e) => (
        <span className="font-mono font-black text-rose-700 text-sm">
          -K{e.amountZMW.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Channel & Ref',
      render: (e) => (
        <div className="text-[11px]">
          <span className="font-semibold text-slate-700 block">{e.paymentMethod.replace(/_/g, ' ')}</span>
          <span className="font-mono text-slate-500 text-[10px]">{e.referenceNumber}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Authorization',
      sortable: true,
      render: (e) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
            e.status === 'DISBURSED'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          {e.status}
        </span>
      ),
    },
  ];


  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header and Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Fees Management & Expenditure Control
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
              {campusInfo.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete transaction transparency across Zanaco, Stanbic, Mobile Money gateways, and fully audited operational outflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowExpenseModal(true)}
            className="px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Log Expenditure Voucher</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPaymentModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Record Fee Payment</span>
          </button>
        </div>
      </div>

      {/* Interactive 6-Card Financial KPI Command Deck */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          type="button"
          onClick={() => {
            setStatusFilter('ALL');
            setSelectedChartClass(null);
            setActiveTab('balances');
          }}
          className={`p-3.5 rounded-2xl border text-left transition transform hover:-translate-y-0.5 ${
            statusFilter === 'ALL' && !selectedChartClass
              ? 'bg-blue-900 text-white border-blue-950 shadow-md ring-2 ring-blue-300'
              : 'bg-white text-slate-900 border-slate-200 hover:border-blue-400 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold opacity-80 mb-1">
            <span>Total Invoiced</span>
            <FileText className="w-3.5 h-3.5" />
          </div>
          <p className="text-lg font-black tracking-tight leading-none">
            K{(totalBilled / 1000).toFixed(0)}k
          </p>
          <span className="text-[10px] opacity-75 mt-1 block">
            {learnerBalances.length} active accounts
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter('CLEARED');
            setActiveTab('balances');
          }}
          className={`p-3.5 rounded-2xl border text-left transition transform hover:-translate-y-0.5 ${
            statusFilter === 'CLEARED'
              ? 'bg-emerald-700 text-white border-emerald-800 shadow-md ring-2 ring-emerald-300'
              : 'bg-white text-slate-900 border-slate-200 hover:border-emerald-400 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold opacity-80 mb-1">
            <span>Collected Inflows</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-lg font-black tracking-tight leading-none text-emerald-600 group-hover:text-white">
            K{(totalCollected / 1000).toFixed(0)}k
          </p>
          <span className="text-[10px] opacity-75 mt-1 block font-semibold">
            {clearedCount} fully cleared
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter(statusFilter === 'ARREARS' ? 'ALL' : 'ARREARS');
            setActiveTab('balances');
          }}
          className={`p-3.5 rounded-2xl border text-left transition transform hover:-translate-y-0.5 ${
            statusFilter === 'ARREARS'
              ? 'bg-rose-700 text-white border-rose-800 shadow-md ring-2 ring-rose-300'
              : 'bg-white text-slate-900 border-slate-200 hover:border-rose-400 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold opacity-80 mb-1">
            <span>Debtors Arrears</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p className="text-lg font-black tracking-tight leading-none text-rose-600">
            K{(totalArrears / 1000).toFixed(0)}k
          </p>
          <span className="text-[10px] opacity-75 mt-1 block font-semibold">
            {arrearsCount + partialCount} pending balance
          </span>
        </button>

        <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
            <span>Recovery Rate</span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-lg font-black text-slate-900 tracking-tight leading-none">
            {recoveryRate}%
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Number(recoveryRate))}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('expenditures')}
          className={`p-3.5 rounded-2xl border text-left transition transform hover:-translate-y-0.5 ${
            activeTab === 'expenditures'
              ? 'bg-amber-600 text-white border-amber-700 shadow-md ring-2 ring-amber-300'
              : 'bg-white text-slate-900 border-slate-200 hover:border-amber-400 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold opacity-80 mb-1">
            <span>Total Outflows</span>
            <DollarSign className="w-3.5 h-3.5" />
          </div>
          <p className="text-lg font-black tracking-tight leading-none text-amber-600">
            K{(totalDisbursed / 1000).toFixed(0)}k
          </p>
          <span className="text-[10px] opacity-75 mt-1 block font-semibold">
            {expenditures.length} audited vouchers
          </span>
        </button>

        <div className="p-3.5 rounded-2xl border border-slate-200 bg-linear-to-br from-blue-50 to-indigo-50 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-blue-800 mb-1">
            <span>Net Operating Margin</span>
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-lg font-black text-blue-950 tracking-tight leading-none">
            K{(netSurplus / 1000).toFixed(0)}k
          </p>
          <span className="text-[10px] text-emerald-700 font-bold mt-1 block flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Audited Surplus
          </span>
        </div>
      </div>

      {/* Interactive Drilldown Collections Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Interactive Revenue Collections & Billing Breakdown by Class
            </h3>
            <p className="text-xs text-slate-500">
              Click any class bar or category segment below to drill down and filter learner accounts instantly.
            </p>
          </div>

          {(statusFilter !== 'ALL' || selectedChartClass !== null) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('ALL');
                setSelectedChartClass(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Drilldowns</span>
            </button>
          )}
        </div>

        <InteractiveChart
          title=""
          data={collectionsChartData}
          type="bar"
          valuePrefix="K"
          primaryLabel="Collected (ZMW)"
          secondaryLabel="Billed (ZMW)"
          onItemClick={(item) => {
            setSelectedChartClass(item.label === selectedChartClass ? null : item.label);
            setActiveTab('balances');
            showToast(`Drilling down into ${item.label} accounts.`);
          }}
        />

        {/* Active Filter Chips */}
        {(statusFilter !== 'ALL' || selectedChartClass !== null) && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
            <span className="font-bold text-slate-500">Active Drilldowns:</span>
            {statusFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold border border-blue-200">
                Status: {statusFilter}
                <button type="button" onClick={() => setStatusFilter('ALL')} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedChartClass !== null && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 font-bold border border-indigo-200">
                Class: {selectedChartClass}
                <button type="button" onClick={() => setSelectedChartClass(null)} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <span className="text-slate-400 font-medium">({displayedBalances.length} learners matching)</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('balances')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'balances'
              ? 'border-blue-900 text-blue-900 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Learner Fee Balances</span>
          <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded text-[10px]">
            {displayedBalances.length} Accounts
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'ledger'
              ? 'border-emerald-700 text-emerald-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ReceiptIcon className="w-4 h-4" />
          <span>Transparent Inflows Ledger</span>
          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[10px]">
            {ledgerEntries.length} Inflows
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('expenditures')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'expenditures'
              ? 'border-rose-700 text-rose-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Operational Expenditures (Outflows)</span>
          <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded text-[10px]">
            ZMW {totalDisbursed.toLocaleString()}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'border-slate-900 text-slate-900 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Financial Statements & Cashbook</span>
        </button>
      </div>

      {/* TAB 1: LEARNER FEE BALANCES */}
      {activeTab === 'balances' && (
        <div className="space-y-4">
          <EnterpriseTable
            data={displayedBalances}
            columns={balanceColumns}
            title={`Student Fee Ledger & Debtors Ageing — ${campusInfo.name}`}
            description="Billing, recovery, and ageing breakdown across Day and Boarding programs."
            searchPlaceholder="Search by student name, ID, or class..."
            exportFilename="legacy-school-balances"
            rowActions={(row) => (
              <button
                type="button"
                onClick={() => openLearnerPaymentHistory(row)}
                className="px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 transition"
              >
                Statement
              </button>
            )}
          />
        </div>
      )}

      {/* TAB 2: INFLOWS LEDGER (Transparent Transactions) */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <EnterpriseTable
            data={ledgerEntries}
            columns={ledgerColumns}
            title="Institutional Inflows & Official Receipt Journal"
            description="Real-time multi-channel deposits reconciled into the General Ledger."
            searchPlaceholder="Search by receipt #, student name, reference..."
            exportFilename="legacy-school-inflows-ledger"
            rowActions={(row) => (
              <button
                type="button"
                onClick={() =>
                  setSelectedReceipt({
                    receiptNumber: row.payment?.receipt?.receiptNumber || 'REC-SOL-2026',
                    amount: row.amount,
                    learnerName: row.learnerName,
                    studentNumber: row.studentNumber,
                    paymentMethod: row.payment?.paymentMethod || 'BANK_TRANSFER',
                    referenceNumber: row.payment?.referenceNumber || 'DIRECT',
                  })
                }
                className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-50 rounded-lg border border-emerald-300 transition flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Receipt</span>
              </button>
            )}
          />
        </div>
      )}

      {/* TAB 3: OPERATIONAL EXPENDITURES (Comprehensive Outflows) */}
      {activeTab === 'expenditures' && (
        <div className="space-y-6">
          {/* Expenditure KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Disbursed (Term 1)</span>
              <div className="text-2xl font-black text-rose-700 mt-1">
                K{totalDisbursed.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">
                {expenditures.length} Authorized Vouchers
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Boarding Food & Rations</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                K87,000
              </div>
              <span className="text-[11px] text-amber-700 font-bold block mt-0.5">
                Kansanshi Butchery & Solwezi Milling
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Generator Fuel (SGC Solwezi)</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                K72,500
              </div>
              <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">
                2,500L Reserve • 24/7 Power
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Statutory Payroll Remittances</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                K54,300
              </div>
              <span className="text-[11px] text-blue-700 font-bold block mt-0.5">
                NAPSA & NHIMA 100% Up to Date
              </span>
            </div>
          </div>

          <EnterpriseTable
            data={expenditures}
            columns={expenseColumns}
            title="Operational Expenditures & Payment Voucher Ledger"
            description="Audited outflows for boarding dining, diesel power backup, teacher payroll, and campus maintenance."
            searchPlaceholder="Search by vendor, voucher #, category..."
            exportFilename="legacy-school-expenditures"
          />
        </div>
      )}

      {/* TAB 4: FINANCIAL STATEMENTS & CASHBOOK */}
      {activeTab === 'reports' && reportsData && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Income vs Expenditure Statement (Term 1 2026)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Consolidated financial performance across Mushitala Day Campus and Kansanshi Boarding Campus.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                Net Operating Cashflow: +K2,770,000
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Inflows Summary */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
              <div className="flex justify-between items-center font-black text-emerald-950 text-sm">
                <span>Total Fee Inflows Collected</span>
                <span className="font-mono">K3,912,800.00</span>
              </div>
              <div className="space-y-1.5 text-slate-700 pt-2 border-t border-emerald-200/60">
                <div className="flex justify-between">
                  <span>Boarding & Tuition Fees (Kansanshi):</span>
                  <span className="font-mono font-bold">K2,480,500</span>
                </div>
                <div className="flex justify-between">
                  <span>Primary Day Tuition (Mushitala):</span>
                  <span className="font-mono font-bold">K980,000</span>
                </div>
                <div className="flex justify-between">
                  <span>ECE Nursery & Reception Tuition:</span>
                  <span className="font-mono font-bold">K234,000</span>
                </div>
                <div className="flex justify-between">
                  <span>National Examination & Transport Levies:</span>
                  <span className="font-mono font-bold">K218,300</span>
                </div>
              </div>
            </div>

            {/* Outflows Summary */}
            <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
              <div className="flex justify-between items-center font-black text-rose-950 text-sm">
                <span>Total Operational Expenditures Disbursed</span>
                <span className="font-mono">K1,142,800.00</span>
              </div>
              <div className="space-y-1.5 text-slate-700 pt-2 border-t border-rose-200/60">
                <div className="flex justify-between">
                  <span>Food Provisions & Dining Hall Rations:</span>
                  <span className="font-mono font-bold">K384,500</span>
                </div>
                <div className="flex justify-between">
                  <span>Staff Salaries & Statutory (NAPSA/NHIMA):</span>
                  <span className="font-mono font-bold">K342,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Generator Diesel & Power Utilities (SGC):</span>
                  <span className="font-mono font-bold">K168,400</span>
                </div>
                <div className="flex justify-between">
                  <span>STEM Laboratory Reagents & Exams:</span>
                  <span className="font-mono font-bold">K98,200</span>
                </div>
                <div className="flex justify-between">
                  <span>Minibus Fleet, Repairs & Administration:</span>
                  <span className="font-mono font-bold">K149,700</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Record Fee Payment */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Record Fee Inflow</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Student Account</label>
                <select
                  value={paymentForm.studentNumber}
                  onChange={(e) => {
                    const sel = learnerBalances.find((b) => b.studentNumber === e.target.value);
                    if (sel) {
                      setPaymentForm({
                        ...paymentForm,
                        studentNumber: sel.studentNumber,
                        learnerName: sel.learnerName,
                        amount: sel.balance > 0 ? sel.balance : 5200,
                      });
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                >
                  {learnerBalances.map((l) => (
                    <option key={l.id} value={l.studentNumber}>
                      {l.learnerName} ({l.studentNumber}) — Balance: K{l.balance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Channel</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                  >
                    <option value="ZANACO_BILLPAY">Zanaco BillPay</option>
                    <option value="STANBIC_DEPOSIT">Stanbic Deposit Slip</option>
                    <option value="MTN_MOMO">MTN Mobile Money</option>
                    <option value="AIRTEL_MONEY">Airtel Money</option>
                    <option value="ABSA_TRANSFER">Absa Transfer</option>
                    <option value="CASH_OFFICE">Bursar Cash Office</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (ZMW)</label>
                  <input
                    type="number"
                    required
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">External Bank / Gateway Reference #</label>
                <input
                  type="text"
                  required
                  value={paymentForm.referenceNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                  placeholder="e.g. FT26101924ZNCO"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
                >
                  Post Payment & Print Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Log Expenditure Voucher */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">Authorize Operational Expenditure</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExpenseModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Disbursement Purpose / Title</label>
                <input
                  type="text"
                  required
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  placeholder="e.g. Bulk supply of 300 broiler chickens for boarding kitchen"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expenditure Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e: any) => {
                      const labels: Record<string, string> = {
                        FOOD_BOARDING_RATIONS: 'Food & Boarding Dining Provisions',
                        UTILITIES_GENERATOR_POWER: 'Generator Diesel & Power Utilities',
                        STAFF_SALARIES_ALLOWANCES: 'Staff Salaries & Statutory Remittances',
                        FACILITY_MAINTENANCE: 'Facility Repairs & Infrastructure',
                        LEARNING_LAB_SUPPLIES: 'Academic & Laboratory Materials',
                        TRANSPORT_FUEL: 'Student Minibus Fleet & Logistics',
                        ADMIN_OPERATIONS: 'Administrative & ICT Operations',
                      };
                      setExpenseForm({
                        ...expenseForm,
                        category: e.target.value,
                        categoryLabel: labels[e.target.value] || e.target.value,
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                  >
                    <option value="FOOD_BOARDING_RATIONS">Food & Boarding Provisions</option>
                    <option value="UTILITIES_GENERATOR_POWER">Generator Diesel (SGC Solwezi)</option>
                    <option value="STAFF_SALARIES_ALLOWANCES">Staff Salaries & Remittances</option>
                    <option value="FACILITY_MAINTENANCE">Facility Repairs & Maintenance</option>
                    <option value="LEARNING_LAB_SUPPLIES">STEM Science Lab Supplies</option>
                    <option value="TRANSPORT_FUEL">Minibus Shuttle Fuel</option>
                    <option value="ADMIN_OPERATIONS">Administrative & Starlink ICT</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Campus Allocation</label>
                  <select
                    value={expenseForm.campusId}
                    onChange={(e: any) => {
                      const names: Record<string, string> = {
                        'LSS-MSC': 'Mushitala Campus (Near Kansanshi)',
                        'LSS-URB': 'Urban Campus (Solwezi Central)',
                        'CENTRAL': 'All Campuses (Consolidated)',
                      };
                      setExpenseForm({
                        ...expenseForm,
                        campusId: e.target.value,
                        campusName: names[e.target.value] || 'Solwezi',
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                  >
                    <option value="LSS-MSC">Mushitala Campus (Near Kansanshi)</option>
                    <option value="LSS-URB">Urban Campus (Solwezi Central)</option>
                    <option value="CENTRAL">Central / Shared Facility</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payee / Vendor Name</label>
                  <input
                    type="text"
                    required
                    value={expenseForm.vendorName}
                    onChange={(e) => setExpenseForm({ ...expenseForm, vendorName: e.target.value })}
                    placeholder="e.g. Kansanshi Fresh Agri Supplies"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (ZMW)</label>
                  <input
                    type="number"
                    required
                    value={expenseForm.amountZMW}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amountZMW: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={(e: any) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                  >
                    <option value="BANK_EFT">Bank EFT Direct</option>
                    <option value="CHEQUE">Bank Cheque</option>
                    <option value="CORPORATE_CARD">Corporate Visa Card</option>
                    <option value="PETTY_CASH">Bursary Petty Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reference / Cheque #</label>
                  <input
                    type="text"
                    required
                    value={expenseForm.referenceNumber}
                    onChange={(e) => setExpenseForm({ ...expenseForm, referenceNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-xs"
                >
                  Authorize Payment Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Official Receipt Presentation */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-900 text-amber-300 flex items-center justify-center mx-auto shadow-md">
              <ReceiptIcon className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-blue-900 block">
                Republic of Zambia • Official Educational Receipt
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                Legacy School Solwezi
              </h3>
              <span className="text-xs text-slate-500 italic block">
                &ldquo;We strive for your academic and moral excellence&rdquo;
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                Stand # S/SOLWE/3177178, Kansanshi Mine Road • TPIN: 1008492019
              </span>
            </div>

            <div className="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Receipt Number:</span>
                <span className="font-mono font-black text-blue-900">{selectedReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Learner Name:</span>
                <span className="font-bold text-slate-900">{selectedReceipt.learnerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student ID #:</span>
                <span className="font-mono font-bold text-slate-900">{selectedReceipt.studentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Gateway:</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-mono text-slate-700">{selectedReceipt.referenceNumber}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black">
                <span className="text-slate-900">Total Received:</span>
                <span className="font-mono text-emerald-700">K{Number(selectedReceipt.amount).toLocaleString()}.00</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-100 pt-3">
              <span>Bursar Stamp: Approved</span>
              <span>Anti-Fraud Verified ✓</span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Copy</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Individual Student Statement History */}
      {selectedLearnerHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {selectedLearnerHistory.learner.firstName} {selectedLearnerHistory.learner.lastName}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {selectedLearnerHistory.learner.studentNumber} • {selectedLearnerHistory.learner.currentClass.name} • {selectedLearnerHistory.learner.campus.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLearnerHistory(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <span className="font-bold text-slate-700 block text-xs uppercase tracking-wider">
                Audited Payment Transactions
              </span>
              {selectedLearnerHistory.payments.map((p: any) => (
                <div key={p.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 block">{p.receipt.receiptNumber}</span>
                    <span className="text-[11px] text-slate-500">Ref: {p.referenceNumber} • {p.paymentMethod}</span>
                  </div>
                  <span className="font-mono font-black text-emerald-700 text-sm">
                    K{Number(p.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLearnerHistory(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
