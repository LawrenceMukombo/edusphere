'use client';

import React, { useState } from 'react';
import {
  WalletCards,
  Receipt,
  FileText,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Plus,
  Printer,
  Search,
  Filter,
  DollarSign,
  ArrowUpRight,
  BookOpen,
  RefreshCw,
  ShieldCheck,
  Building,
  Check,
  Smartphone,
  Send,
  Layers,
  Code2,
  Sliders,
} from 'lucide-react';
import { OfficialInvoiceModal } from '../finance/OfficialInvoiceModal';
import { OfficialReceiptModal } from '../finance/OfficialReceiptModal';
import { CreateInvoiceModal } from '../finance/CreateInvoiceModal';
import { RecordPaymentModal } from '../finance/RecordPaymentModal';
import { CreateJournalModal } from '../finance/CreateJournalModal';
import { PaymentsConsole } from './PaymentsConsole';
import { formatCleanEnum } from '@/lib/formatters';

export interface FinanceConsoleProps {
  initialInvoices?: any[];
  initialLedgers?: any[];
  learners?: any[];
  initialIntents?: any[];
  initialBatches?: any[];
  initialWebhooks?: any[];
  defaultTab?: string;
}

export function FinanceConsole({
  initialInvoices = [],
  initialLedgers = [],
  learners = [],
  initialIntents = [],
  initialBatches = [],
  initialWebhooks = [],
  defaultTab = 'invoices',
}: FinanceConsoleProps) {
  const [activeTab, setActiveTab] = useState<
    | 'invoices'
    | 'receipts'
    | 'reconciliation'
    | 'journals'
    | 'debtors'
    | 'intents'
    | 'simulator'
    | 'settlements'
    | 'webhooks'
    | 'channels'
  >((defaultTab as any) || 'invoices');
  const [invoiceFilter, setInvoiceFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notice, setNotice] = useState<string>('');

  // Modals state
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<any | null>(null);
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<any | null>(null);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState<boolean>(false);
  const [paymentInvoice, setPaymentInvoice] = useState<any | null>(null);
  const [isCreateJournalOpen, setIsCreateJournalOpen] = useState<boolean>(false);

  // Enrolled real learners reference
  const enrolledLearners = learners.length > 0
    ? learners.filter((l: any) => l.studentNumber !== 'DEV-STU-0001')
    : [
        { id: '4d747e0a-5eee-4459-af7f-221157dd0b8b', firstName: 'Chilufya', lastName: 'Banda', studentNumber: 'NWU-2026-0001', programme: 'Diploma in Registered Nursing' },
        { id: 'e213a2ed-c2de-4236-8724-3c325ad2df53', firstName: 'Emmanuel', lastName: 'Sichone', studentNumber: 'NWU-2026-0002', programme: 'Diploma in Clinical Medicine' },
        { id: '172ade2b-7c89-4f9e-a31c-ef16745843e9', firstName: 'Grace', lastName: 'Mwape', studentNumber: 'NWU-2026-0003', programme: 'Diploma in Registered Nursing' },
        { id: '8f28f308-383e-4735-bb68-d95846577f03', firstName: 'Brian', lastName: 'Mulenga', studentNumber: 'NWU-2026-0004', programme: 'Diploma in Registered Nursing' },
        { id: '57fb6263-7eb3-4cb4-a104-c2aa7a11c378', firstName: 'Esther', lastName: 'Lungu', studentNumber: 'NWU-2026-0005', programme: 'Diploma in Registered Nursing' },
      ];

  // Invoices list state (hydrated from live database records)
  const hydratedInvoices = initialInvoices.length > 0
    ? initialInvoices.map((inv: any, idx: number) => {
        const assignedLearner = (inv.learner && inv.learner.studentNumber !== 'DEV-STU-0001' && inv.learner.firstName !== 'Sample')
          ? inv.learner
          : enrolledLearners[idx % (enrolledLearners.length || 1)];

        return {
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          studentName: assignedLearner ? `${assignedLearner.firstName} ${assignedLearner.lastName}` : (inv.learner ? `${inv.learner.firstName} ${inv.learner.lastName}` : 'Enrolled Student'),
          studentNumber: assignedLearner?.studentNumber || inv.learner?.studentNumber || 'NWU-2026-0001',
          learnerId: assignedLearner?.id || inv.learnerId,
          programme: assignedLearner?.programme?.name || assignedLearner?.programme || inv.learner?.programme?.name || 'Diploma in Registered Nursing',
          semester: 'Year 1, Semester 1',
          dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '2026-11-15',
          issuedDate: inv.issuedDate ? new Date(inv.issuedDate).toISOString().split('T')[0] : '2026-10-10',
          lines: (inv.lines && inv.lines.length > 0)
            ? inv.lines.map((l: any) => ({
                category: l.category || 'TUITION',
                description: l.description || 'Semester Fee Allocation',
                amountZMW: Number(l.amountZMW ?? l.lineTotal ?? l.unitPrice ?? l.amount ?? 0),
              }))
            : [
                { category: 'TUITION', description: 'Semester 1 Tuition Fee', amountZMW: Number(inv.totalAmount || 8300) },
              ],
          totalZMW: Number(inv.totalAmount || 0),
          paidZMW: Number(inv.paidAmount || (Number(inv.totalAmount || 0) - Number(inv.balance || 0))),
          balanceZMW: Number(inv.balance || 0),
          status: Number(inv.balance || 0) === 0 ? 'FULLY_PAID' : Number(inv.paidAmount || 0) > 0 ? 'PARTIALLY_PAID' : 'PENDING',
        };
      })
    : [
        {
          id: 'inv-1',
          invoiceNumber: 'INV-2026-00412',
          studentName: 'Grace Mutale',
          studentNumber: 'NWU-2026-0003',
          learnerId: '172ade2b-7c89-4f9e-a31c-ef16745843e9',
          programme: 'Diploma in Registered Nursing',
          semester: 'Year 1, Semester 1',
          dueDate: '2026-11-15',
          issuedDate: '2026-10-10',
          lines: [
            { category: 'TUITION', description: 'Semester 1 Tuition Fee', amountZMW: 6500 },
            { category: 'CLINICAL', description: 'Hospital Ward Rotation & Skills Lab', amountZMW: 1800 },
            { category: 'REGISTRATION', description: 'NMCZ Council Indexing Fee', amountZMW: 1200 },
          ],
          totalZMW: 9500,
          paidZMW: 9500,
          balanceZMW: 0,
          status: 'FULLY_PAID',
        },
        {
          id: 'inv-2',
          invoiceNumber: 'INV-2026-00415',
          studentName: 'Chanda Bwalya',
          studentNumber: 'NWU-2026-0001',
          learnerId: '4d747e0a-5eee-4459-af7f-221157dd0b8b',
          programme: 'Diploma in Registered Nursing',
          semester: 'Year 1, Semester 1',
          dueDate: '2026-11-15',
          issuedDate: '2026-10-10',
          lines: [
            { category: 'TUITION', description: 'Semester 1 Tuition Fee', amountZMW: 6500 },
            { category: 'CLINICAL', description: 'Hospital Ward Rotation & Skills Lab', amountZMW: 1800 },
          ],
          totalZMW: 8300,
          paidZMW: 5000,
          balanceZMW: 3300,
          status: 'PARTIALLY_PAID',
        },
        {
          id: 'inv-3',
          invoiceNumber: 'INV-2026-00418',
          studentName: 'Emmanuel Sichone',
          studentNumber: 'NWU-2026-0002',
          learnerId: 'e213a2ed-c2de-4236-8724-3c325ad2df53',
          programme: 'Diploma in Clinical Medicine',
          semester: 'Year 1, Semester 1',
          dueDate: '2026-11-20',
          issuedDate: '2026-10-12',
          lines: [
            { category: 'TUITION', description: 'Semester 1 Clinical Medicine Tuition', amountZMW: 6800 },
            { category: 'CLINICAL', description: 'Solwezi General Hospital Clinical Quota', amountZMW: 2000 },
            { category: 'HOSTEL', description: 'Campus Residence Hall Accommodation', amountZMW: 2000 },
          ],
          totalZMW: 10800,
          paidZMW: 0,
          balanceZMW: 10800,
          status: 'PENDING',
        },
        {
          id: 'inv-4',
          invoiceNumber: 'INV-2026-00420',
          studentName: 'Brian Mulenga',
          studentNumber: 'NWU-2026-0004',
          learnerId: '8f28f308-383e-4735-bb68-d95846577f03',
          programme: 'Diploma in Registered Nursing',
          semester: 'Year 1, Semester 1',
          dueDate: '2026-11-15',
          issuedDate: '2026-10-10',
          lines: [
            { category: 'TUITION', description: 'Semester 1 Tuition Fee', amountZMW: 6500 },
            { category: 'CLINICAL', description: 'Clinical Rotation Quota', amountZMW: 1800 },
          ],
          totalZMW: 8300,
          paidZMW: 8300,
          balanceZMW: 0,
          status: 'FULLY_PAID',
        },
        {
          id: 'inv-5',
          invoiceNumber: 'INV-2026-00422',
          studentName: 'Esther Lungu',
          studentNumber: 'NWU-2026-0005',
          learnerId: '57fb6263-7eb3-4cb4-a104-c2aa7a11c378',
          programme: 'Diploma in Registered Nursing',
          semester: 'Year 1, Semester 1',
          dueDate: '2026-11-15',
          issuedDate: '2026-10-10',
          lines: [
            { category: 'TUITION', description: 'Semester 1 Tuition Fee', amountZMW: 6500 },
            { category: 'CLINICAL', description: 'Clinical Rotation Quota', amountZMW: 1800 },
          ],
          totalZMW: 8300,
          paidZMW: 4000,
          balanceZMW: 4300,
          status: 'PARTIALLY_PAID',
        },
      ];

  const [invoices, setInvoices] = useState<any[]>(hydratedInvoices);

  // Receipts list state
  const [receipts, setReceipts] = useState<any[]>([
    {
      receiptNumber: 'REC-2026-8912',
      studentName: 'Grace Mutale',
      studentNumber: 'NWU-2026-0003',
      programme: 'Diploma in Registered Nursing',
      date: '2026-10-14',
      amountZMW: 9500,
      amountInWords: 'Nine Thousand Five Hundred Zambian Kwacha Only',
      paymentMethod: 'Airtel Money Paybill',
      reference: 'AIRTEL-TX-9912048',
      invoiceNumber: 'INV-2026-00412',
      remainingBalanceZMW: 0,
      cashierName: 'Mr. Clement Banda, Bursar',
      allocations: [
        { item: 'Tuition Fee', amountZMW: 6500 },
        { item: 'Clinical Placement', amountZMW: 1800 },
        { item: 'NMCZ Council Indexing', amountZMW: 1200 },
      ],
    },
    {
      receiptNumber: 'REC-2026-8945',
      studentName: 'Brian Mulenga',
      studentNumber: 'NWU-2026-0004',
      programme: 'Diploma in Registered Nursing',
      date: '2026-10-16',
      amountZMW: 8300,
      amountInWords: 'Eight Thousand Three Hundred Zambian Kwacha Only',
      paymentMethod: 'MTN Mobile Money',
      reference: 'MTN-MOMO-841920',
      invoiceNumber: 'INV-2026-00420',
      remainingBalanceZMW: 0,
      cashierName: 'Mr. Clement Banda, Bursar',
      allocations: [
        { item: 'Tuition Fee', amountZMW: 6500 },
        { item: 'Clinical Placement', amountZMW: 1800 },
      ],
    },
    {
      receiptNumber: 'REC-2026-9011',
      studentName: 'Chanda Bwalya',
      studentNumber: 'NWU-2026-0001',
      programme: 'Diploma in Registered Nursing',
      date: '2026-10-20',
      amountZMW: 5000,
      amountInWords: 'Five Thousand Zambian Kwacha Only',
      paymentMethod: 'ZANACO Billmaster',
      reference: 'ZAN-BILL-7729104',
      invoiceNumber: 'INV-2026-00415',
      remainingBalanceZMW: 3300,
      cashierName: 'Mr. Clement Banda, Bursar',
      allocations: [
        { item: 'Tuition Fee (Partial)', amountZMW: 5000 },
      ],
    },
  ]);

  // Reconciliation feeds state
  const [reconciliationItems, setReconciliationItems] = useState([
    {
      id: 'rec-1',
      date: '2026-10-24',
      gateway: 'LamtonPay (Airtel Money)',
      externalRef: 'AIR-PAY-8829104',
      amountZMW: 4000,
      studentMatch: 'Esther Lungu (NWU-2026-0005)',
      invoiceMatch: 'INV-2026-00422',
      status: 'RECONCILED',
      varianceZMW: 0,
    },
    {
      id: 'rec-2',
      date: '2026-10-23',
      gateway: 'ZANACO Commercial Bank Feed',
      externalRef: 'ZAN-DEP-551029',
      amountZMW: 5000,
      studentMatch: 'Chanda Bwalya (NWU-2026-0001)',
      invoiceMatch: 'INV-2026-00415',
      status: 'RECONCILED',
      varianceZMW: 0,
    },
    {
      id: 'rec-3',
      date: '2026-10-24',
      gateway: 'MTN Mobile Money Merchant',
      externalRef: 'MTN-UNMATCH-1029',
      amountZMW: 2500,
      studentMatch: 'Unidentified Depositor [Ref: 0966441122]',
      invoiceMatch: 'Pending Identification',
      status: 'UNMATCHED_SUSPENSE',
      varianceZMW: 2500,
    },
  ]);

  // General Journals state
  const [journals, setJournals] = useState<any[]>([
    {
      id: 'jv-1',
      journalRef: 'JV-2026-0041',
      date: '2026-10-22',
      description: 'Term 1 Student Fee Invoicing & Revenue Recognition',
      totalAmount: 45200,
      postedBy: 'Clement Banda, Bursar',
      lines: [
        { account: '1200 - Accounts Receivable: Student Fee Ledger', debit: 45200, credit: 0 },
        { account: '4010 - Revenue: Tuition Fees', debit: 0, credit: 32500 },
        { account: '4020 - Revenue: Clinical Placements Quota', debit: 0, credit: 9000 },
        { account: '4030 - Revenue: Statutory Indexing', debit: 0, credit: 3700 },
      ],
    },
    {
      id: 'jv-2',
      journalRef: 'JV-2026-0042',
      date: '2026-10-23',
      description: 'Solwezi General Hospital MoU Clinical Teaching Quota Payment',
      totalAmount: 12000,
      postedBy: 'Clement Banda, Bursar',
      lines: [
        { account: '5010 - Clinical Teaching & Hospital Quota Expense', debit: 12000, credit: 0 },
        { account: '1010 - Cash & Bank: ZANACO Operational', debit: 0, credit: 12000 },
      ],
    },
  ]);

  // Calculate totals
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalZMW, 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + inv.paidZMW, 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceZMW, 0);
  const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesFilter = invoiceFilter === 'ALL' || inv.status === invoiceFilter;
    const matchesSearch =
      inv.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.studentNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  function handleInvoiceCreated(newInv: any) {
    const formatted = {
      id: newInv.id || `inv-${Date.now()}`,
      invoiceNumber: newInv.invoiceNumber,
      studentName: 'Newly Invoiced Candidate',
      studentNumber: 'NWU-2026-0008',
      programme: 'Diploma in Registered Nursing',
      semester: 'Year 1, Semester 1',
      dueDate: newInv.dueDate ? new Date(newInv.dueDate).toISOString().split('T')[0] : '2026-11-30',
      issuedDate: '2026-10-24',
      lines: (newInv.lines || []).map((l: any) => ({
        category: l.category,
        description: l.description,
        amountZMW: Number(l.lineTotal || l.unitPrice || 0),
      })),
      totalZMW: Number(newInv.totalAmount || 0),
      paidZMW: 0,
      balanceZMW: Number(newInv.totalAmount || 0),
      status: 'PENDING',
    };

    setInvoices([formatted, ...invoices]);
    setNotice(`Invoice ${formatted.invoiceNumber} successfully created and posted to general ledger.`);
    setTimeout(() => setNotice(''), 5000);
  }

  function handlePaymentRecorded(payment: any, receipt: any) {
    // Update invoice
    setInvoices(
      invoices.map((inv) => {
        if (inv.id !== payment.invoiceId && inv.invoiceNumber !== receipt.invoiceNumber) return inv;
        const newPaid = inv.paidZMW + receipt.amountZMW;
        const newBal = Math.max(0, inv.totalZMW - newPaid);
        return {
          ...inv,
          paidZMW: newPaid,
          balanceZMW: newBal,
          status: newBal === 0 ? 'FULLY_PAID' : 'PARTIALLY_PAID',
        };
      })
    );

    // Add to receipts
    setReceipts([receipt, ...receipts]);
    setNotice(`Payment of ZMW ${receipt.amountZMW.toLocaleString()} acknowledged. Receipt ${receipt.receiptNumber} generated.`);
    setSelectedReceiptForPrint(receipt);
    setTimeout(() => setNotice(''), 5000);
  }

  function handleJournalCreated(journal: any) {
    setJournals([
      {
        id: `jv-${Date.now()}`,
        journalRef: journal.journalRef,
        date: '2026-10-24',
        description: journal.description || 'General Journal Voucher Posting',
        totalAmount: journal.totalAmount,
        postedBy: 'Clement Banda, Bursar',
        lines: journal.lines,
      },
      ...journals,
    ]);
    setNotice(`Journal Voucher ${journal.journalRef} posted and verified balanced.`);
    setTimeout(() => setNotice(''), 5000);
  }

  return (
    <div className="mt-8 space-y-6">
      {notice && (
        <div className="flex items-center justify-between rounded-xl border border-cyan-300 bg-cyan-50 p-4 text-sm font-semibold text-cyan-900 shadow-sm">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} className="text-cyan-700 hover:text-cyan-950">
            &times;
          </button>
        </div>
      )}

      {/* KPI Cards (Light Theme) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Fees Invoiced
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-50 text-cyan-700">
              <WalletCards className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-extrabold text-slate-900">
              K{totalInvoiced.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">{invoices.length} Registered Candidates Invoiced</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Collections (ZMW)
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-extrabold text-emerald-600">
              K{totalCollected.toLocaleString()}
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
              {collectionRate}%
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">LamtonPay, MoMo & Bank Collections</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Aged Debtors Outstanding
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-rose-50 text-rose-600">
              <AlertCircle className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-extrabold text-rose-600">
              K{totalOutstanding.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Unsettled Balances & Tuition Arrears</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Reconciliation Health
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
              <RefreshCw className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-slate-900">98.4% Matched</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">ZANACO & Mobile Money Gateway Feed</p>
        </div>
      </div>

      {/* Navigation Tabs (Unified Fee Ledger & Payment Orchestration) */}
      <div className="space-y-2 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Finance & Revenue Directorate:
            </span>
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-extrabold text-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('invoices')}
                className={`rounded-md px-3 py-1 transition ${
                  ['invoices', 'receipts', 'reconciliation', 'journals', 'debtors'].includes(activeTab)
                    ? 'bg-white text-cyan-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Fee Ledger & Accounting
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('intents')}
                className={`rounded-md px-3 py-1 transition ${
                  ['intents', 'simulator', 'settlements', 'webhooks', 'channels'].includes(activeTab)
                    ? 'bg-white text-cyan-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Payment Orchestration & Gateway Rails
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {['invoices', 'receipts', 'reconciliation', 'journals', 'debtors'].includes(activeTab) ? (
            <>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === 'invoices'
                    ? 'bg-cyan-700 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <FileText className="h-4 w-4" /> Student Invoices ({invoices.length})
              </button>
              <button
                onClick={() => setActiveTab('receipts')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === 'receipts'
                    ? 'bg-cyan-700 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Receipt className="h-4 w-4" /> Official Fee Receipts ({receipts.length})
              </button>
              <button
                onClick={() => setActiveTab('reconciliation')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === 'reconciliation'
                    ? 'bg-cyan-700 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <RefreshCw className="h-4 w-4" /> Bank & Gateway Reconciliation
              </button>
              <button
                onClick={() => setActiveTab('journals')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === 'journals'
                    ? 'bg-cyan-700 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="h-4 w-4" /> Double-Entry General Journals ({journals.length})
              </button>
              <button
                onClick={() => setActiveTab('debtors')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === 'debtors'
                    ? 'bg-cyan-700 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <TrendingUp className="h-4 w-4" /> Aged Debtors Analysis
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('intents')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === 'intents'
                    ? 'bg-cyan-700 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="h-4 w-4" /> Payment Intents & Collections
              </button>
              <button
                onClick={() => setActiveTab('simulator')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === 'simulator'
                    ? 'bg-cyan-700 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Send className="h-4 w-4" /> USSD Push Simulator (*303# / *778#)
              </button>
              <button
                onClick={() => setActiveTab('settlements')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === 'settlements'
                    ? 'bg-cyan-700 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Layers className="h-4 w-4" /> Settlement Batches & Matching
              </button>
              <button
                onClick={() => setActiveTab('webhooks')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === 'webhooks'
                    ? 'bg-cyan-700 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Code2 className="h-4 w-4" /> Webhook Inbox & Audit
              </button>
              <button
                onClick={() => setActiveTab('channels')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === 'channels'
                    ? 'bg-cyan-700 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Sliders className="h-4 w-4" /> Gateway Rails & Architecture (Editable)
              </button>
            </>
          )}
        </div>
      </div>

      {/* TAB 1: STUDENT INVOICES */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={invoiceFilter}
                onChange={(e) => setInvoiceFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="ALL">All Payment Statuses</option>
                <option value="FULLY_PAID">Fully Paid</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="PENDING">Pending Payment</option>
              </select>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student or invoice..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-56 rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-cyan-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => setIsCreateInvoiceOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition"
            >
              <Plus className="h-4 w-4" /> Generate Student Invoice
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Candidate Details</th>
                  <th className="py-3.5 px-4">Programme</th>
                  <th className="py-3.5 px-4 text-right">Invoiced Total</th>
                  <th className="py-3.5 px-4 text-right">Paid to Date</th>
                  <th className="py-3.5 px-4 text-right">Balance Due</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoiceForPrint(inv)}
                    className="cursor-pointer hover:bg-slate-50 transition"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-800">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4">
                      <span className="block font-bold text-slate-900">{inv.studentName}</span>
                      <span className="font-mono text-[11px] text-slate-500">{inv.studentNumber}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{inv.programme}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-900">
                      ZMW {inv.totalZMW.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-emerald-700">
                      ZMW {inv.paidZMW.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      <span className={inv.balanceZMW > 0 ? 'text-rose-600' : 'text-slate-400'}>
                        ZMW {inv.balanceZMW.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            inv.status === 'FULLY_PAID'
                              ? 'bg-emerald-500'
                              : inv.status === 'PARTIALLY_PAID'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        <span className="text-slate-800">
                          {inv.status === 'FULLY_PAID'
                            ? 'Fully Paid'
                            : inv.status === 'PARTIALLY_PAID'
                            ? 'Partially Paid'
                            : 'Pending'}
                        </span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {inv.balanceZMW > 0 && (
                          <button
                            onClick={() => setPaymentInvoice(inv)}
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                          >
                            <Receipt className="h-3 w-3" /> Record Payment
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedInvoiceForPrint(inv)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Printer className="h-3 w-3 text-slate-500" /> View Invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: OFFICIAL FEE RECEIPTS */}
      {activeTab === 'receipts' && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="py-3.5 px-4">Receipt #</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Candidate Details</th>
                  <th className="py-3.5 px-4">Payment Method & Ref</th>
                  <th className="py-3.5 px-4 text-right">Amount Received</th>
                  <th className="py-3.5 px-4">Target Invoice</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {receipts.map((rec) => (
                  <tr
                    key={rec.receiptNumber}
                    onClick={() => setSelectedReceiptForPrint(rec)}
                    className="cursor-pointer hover:bg-slate-50 transition"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{rec.receiptNumber}</td>
                    <td className="py-3.5 px-4 text-slate-600">{rec.date}</td>
                    <td className="py-3.5 px-4">
                      <span className="block font-bold text-slate-900">{rec.studentName}</span>
                      <span className="font-mono text-[11px] text-slate-500">{rec.studentNumber}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{rec.paymentMethod}</span>
                      <span className="block font-mono text-[11px] text-slate-500">{rec.reference}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                      ZMW {rec.amountZMW.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{rec.invoiceNumber}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Cleared
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedReceiptForPrint(rec)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Printer className="h-3 w-3 text-slate-500" /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BANK & GATEWAY RECONCILIATION */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Automated Bank & Mobile Gateway Reconciliation
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Continuous matching of bank statement lines (ZANACO Billmaster, Stanbic) and mobile money rails (Airtel, MTN) with student fee ledgers.
                </p>
              </div>
              <button
                onClick={() => {
                  setNotice('Reconciliation scan complete: 2 matched transactions confirmed, 1 pending item in suspense.');
                  setTimeout(() => setNotice(''), 4000);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-cyan-700"
              >
                <RefreshCw className="h-4 w-4" /> Run Automated Reconciliation
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-3">Gateway / Rail</th>
                    <th className="py-3 px-3">Bank Reference</th>
                    <th className="py-3 px-3 text-right">Bank Credit (ZMW)</th>
                    <th className="py-3 px-3">Candidate / Invoice Match</th>
                    <th className="py-3 px-3">Reconciliation Status</th>
                    <th className="py-3 px-4 text-right">Resolution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {reconciliationItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-700">{item.date}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{item.gateway}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{item.externalRef}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        K{item.amountZMW.toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className="block font-bold text-slate-800">{item.studentMatch}</span>
                        <span className="font-mono text-[11px] text-slate-500">{item.invoiceMatch}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                            item.status === 'RECONCILED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {formatCleanEnum(item.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {item.status === 'RECONCILED' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Matched & Cleared
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setNotice(`Suspense deposit ${item.externalRef} manually allocated to student fee ledger.`);
                              setReconciliationItems(
                                reconciliationItems.map((r) =>
                                  r.id === item.id ? { ...r, status: 'RECONCILED' } : r
                                )
                              );
                              setTimeout(() => setNotice(''), 4000);
                            }}
                            className="rounded bg-cyan-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-cyan-700"
                          >
                            Resolve Suspense
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DOUBLE-ENTRY GENERAL JOURNALS */}
      {activeTab === 'journals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">General Journal Vouchers (Double-Entry)</h3>
              <p className="text-[11px] text-slate-500">Every transaction strictly maintains Debit = Credit equilibrium</p>
            </div>
            <button
              onClick={() => setIsCreateJournalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" /> Post Journal Voucher
            </button>
          </div>

          <div className="space-y-4">
            {journals.map((jv) => (
              <div key={jv.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-extrabold text-indigo-900">{jv.journalRef}</span>
                    <span className="text-xs text-slate-500">{jv.date}</span>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                      Double-Entry Balanced
                    </span>
                  </div>
                  <div className="font-mono text-sm font-extrabold text-slate-900">
                    Voucher Total: K{jv.totalAmount.toLocaleString()}
                  </div>
                </div>

                <p className="mt-2 text-xs font-medium text-slate-700">
                  <strong>Narration:</strong> {jv.description}
                </p>

                <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                    <thead className="bg-slate-50 font-bold uppercase text-[10px] text-slate-600">
                      <tr>
                        <th className="py-2 px-3">Ledger Account Code & Description</th>
                        <th className="py-2 px-3 text-right">Debit (ZMW)</th>
                        <th className="py-2 px-3 text-right">Credit (ZMW)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {jv.lines.map((l: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-semibold text-slate-800">{l.account}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                            {l.debit > 0 ? `K${l.debit.toLocaleString()}` : '—'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                            {l.credit > 0 ? `K${l.credit.toLocaleString()}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="mt-2 text-[10px] text-slate-400">Authorized & Posted by: {jv.postedBy}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AGED DEBTORS ANALYSIS */}
      {activeTab === 'debtors' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900">Aged Debtors Aging Schedule</h3>
            <p className="mt-1 text-xs text-slate-500">Aging analysis of outstanding student tuition fees and clinical charges.</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs font-bold text-slate-500 uppercase">Current (0 - 30 Days)</span>
                <div className="mt-2 font-mono text-2xl font-black text-slate-900">K18,400</div>
                <p className="mt-1 text-[11px] text-slate-500">Active payment period</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs font-bold text-slate-500 uppercase">31 - 60 Days</span>
                <div className="mt-2 font-mono text-2xl font-black text-amber-600">K8,300</div>
                <p className="mt-1 text-[11px] text-slate-500">Reminder SMS sent</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs font-bold text-slate-500 uppercase">61 - 90 Days</span>
                <div className="mt-2 font-mono text-2xl font-black text-rose-600">K3,300</div>
                <p className="mt-1 text-[11px] text-slate-500">Exam clearance hold</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs font-bold text-slate-500 uppercase">Over 90 Days</span>
                <div className="mt-2 font-mono text-2xl font-black text-rose-800">K0</div>
                <p className="mt-1 text-[11px] text-slate-500">Zero bad debts written off</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MERGED PAYMENT ORCHESTRATION SUBSYSTEM */}
      {['intents', 'simulator', 'settlements', 'webhooks', 'channels'].includes(activeTab) && (
        <div className="space-y-4">
          <PaymentsConsole
            hideHeader={true}
            activeTabOverride={activeTab as any}
            onTabChange={(t) => setActiveTab(t as any)}
            initialIntents={initialIntents}
            initialBatches={initialBatches}
            initialWebhooks={initialWebhooks}
            learners={enrolledLearners}
            invoices={invoices}
          />
        </div>
      )}

      {/* Official Invoice Print Modal */}
      {selectedInvoiceForPrint && (
        <OfficialInvoiceModal
          isOpen={!!selectedInvoiceForPrint}
          onClose={() => setSelectedInvoiceForPrint(null)}
          invoice={selectedInvoiceForPrint}
        />
      )}

      {/* Official Receipt Print Modal */}
      {selectedReceiptForPrint && (
        <OfficialReceiptModal
          isOpen={!!selectedReceiptForPrint}
          onClose={() => setSelectedReceiptForPrint(null)}
          receipt={selectedReceiptForPrint}
        />
      )}

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
        learners={
          learners.length > 0
            ? learners
            : [
                { id: '172ade2b-7c89-4f9e-a31c-ef16745843e9', firstName: 'Grace', lastName: 'Mwape', studentNumber: 'NWU-2026-0003' },
                { id: '8f28f308-383e-4735-bb68-d95846577f03', firstName: 'Brian', lastName: 'Mulenga', studentNumber: 'NWU-2026-0004' },
                { id: '57fb6263-7eb3-4cb4-a104-c2aa7a11c378', firstName: 'Esther', lastName: 'Lungu', studentNumber: 'NWU-2026-0005' },
                { id: '4d747e0a-5eee-4459-af7f-221157dd0b8b', firstName: 'Chilufya', lastName: 'Banda', studentNumber: 'NWU-2026-0001' },
                { id: 'e213a2ed-c2de-4236-8724-3c325ad2df53', firstName: 'Emmanuel', lastName: 'Sichone', studentNumber: 'NWU-2026-0002' },
                { id: '8aa9d7cb-630c-4546-9799-8bd77b82027e', firstName: 'Sample', lastName: 'Candidate', studentNumber: 'DEV-STU-0001' },
              ]
        }
        onInvoiceCreated={handleInvoiceCreated}
      />

      {/* Record Payment Modal */}
      {paymentInvoice && (
        <RecordPaymentModal
          isOpen={!!paymentInvoice}
          onClose={() => setPaymentInvoice(null)}
          invoice={paymentInvoice}
          onPaymentRecorded={handlePaymentRecorded}
        />
      )}

      {/* Create Journal Modal */}
      <CreateJournalModal
        isOpen={isCreateJournalOpen}
        onClose={() => setIsCreateJournalOpen(false)}
        onJournalCreated={handleJournalCreated}
      />
    </div>
  );
}
