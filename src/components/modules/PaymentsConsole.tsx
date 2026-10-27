'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  Smartphone,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Plus,
  FileText,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Search,
  Filter,
  DollarSign,
  ChevronRight,
  Send,
  CheckCheck,
  Check,
  ExternalLink,
  Code2,
  Layers,
  Sparkles,
  Lock,
  Receipt,
  Eye,
  X,
  User,
  Sliders,
  Edit3,
} from 'lucide-react';
import { PaymentReceiptModal } from '../payments/PaymentReceiptModal';
import { EditGatewayRailModal, GatewayRail } from '../payments/EditGatewayRailModal';
import { formatCleanEnum } from '@/lib/formatters';

export interface PaymentsConsoleProps {
  initialIntents?: any[];
  initialBatches?: any[];
  initialWebhooks?: any[];
  learners?: any[];
  invoices?: any[];
  activeTabOverride?: 'intents' | 'simulator' | 'settlements' | 'webhooks' | 'channels';
  onTabChange?: (tab: 'intents' | 'simulator' | 'settlements' | 'webhooks' | 'channels') => void;
  hideHeader?: boolean;
}

const DEFAULT_GATEWAY_RAILS: GatewayRail[] = [
  {
    id: 'rail-mtn',
    name: 'MTN Mobile Money (Zambia)',
    provider: 'MTN',
    status: 'ONLINE',
    description: 'Integration via MTN Mobile Money Open API v2. Supports USSD push prompts (*303#) and instant collections callback.',
    endpoint: 'proxy.momo.mtn.zm:8443',
    settlementSla: 'T+0 Real-Time Webhook',
    merchantCodeOrTerminal: 'Merchant Code: 039182',
    apiVersion: 'Open API v2.1',
  },
  {
    id: 'rail-airtel',
    name: 'Airtel Money (Zambia)',
    provider: 'AIRTEL',
    status: 'ONLINE',
    description: 'Integration via Airtel Africa Merchant Collections API. Dispatches push prompts to Zambian MSISDNs (*778#).',
    endpoint: 'openapi.airtel.africa/zm',
    settlementSla: 'T+0 Real-Time Callback',
    merchantCodeOrTerminal: 'Business No: 891244',
    apiVersion: 'Collections API v1.4',
  },
  {
    id: 'rail-zamtel',
    name: 'Zamtel Kwacha (Zambia)',
    provider: 'ZAMTEL',
    status: 'ONLINE',
    description: 'Integration via Zamtel Kwacha Merchant C2B Gateway. Dispatches instant USSD prompt (*115#) and callback settlement.',
    endpoint: 'gateway.zamtel.co.zm/kwacha/api/v1',
    settlementSla: 'T+0 Real-Time Callback',
    merchantCodeOrTerminal: 'Shortcode: NWU-4421',
    apiVersion: 'Kwacha API v1.2',
  },
  {
    id: 'rail-card',
    name: 'Card & EFTPOS (Commercial Bank)',
    provider: 'ABSA',
    status: 'ONLINE',
    description: 'Card clearing via Absa Bank Zambia / ZNBS Hosted Payment Gateway with 3-D Secure 2.2 authentication.',
    endpoint: 'gateway.absabank.co.zm/checkout',
    settlementSla: 'T+1 Daily Remittance',
    merchantCodeOrTerminal: 'Terminal ID: NWU-BURS-POS01',
    apiVersion: 'ISO 8583 / 3DS 2.2',
  },
];

export function PaymentsConsole({
  initialIntents = [],
  initialBatches = [],
  initialWebhooks = [],
  learners = [],
  invoices = [],
  activeTabOverride,
  onTabChange,
  hideHeader = false,
}: PaymentsConsoleProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<'intents' | 'simulator' | 'settlements' | 'webhooks' | 'channels'>('intents');
  const activeTab = activeTabOverride || internalActiveTab;
  const setActiveTab = (t: 'intents' | 'simulator' | 'settlements' | 'webhooks' | 'channels') => {
    setInternalActiveTab(t);
    if (onTabChange) onTabChange(t);
  };

  const [gatewayRails, setGatewayRails] = useState<GatewayRail[]>(DEFAULT_GATEWAY_RAILS);
  const [editingRail, setEditingRail] = useState<GatewayRail | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nwuchas_gateway_rails');
      if (saved) {
        setGatewayRails(JSON.parse(saved));
      }
    } catch (_) {}
  }, []);

  function handleSaveRail(updated: GatewayRail) {
    const next = gatewayRails.map((r) => (r.id === updated.id ? updated : r));
    setGatewayRails(next);
    try {
      localStorage.setItem('nwuchas_gateway_rails', JSON.stringify(next));
    } catch (_) {}
    showNotification(`Gateway rail [${updated.name}] configuration updated successfully.`, 'success');
  }
  const [intents, setIntents] = useState<any[]>(initialIntents);
  const [batches, setBatches] = useState<any[]>(initialBatches);
  const [webhooks, setWebhooks] = useState<any[]>(initialWebhooks);
  const [learnersList, setLearnersList] = useState<any[]>(learners);
  const [invoicesList, setInvoicesList] = useState<any[]>(invoices);

  const [notice, setNotice] = useState<string>('');
  const [noticeType, setNoticeType] = useState<'success' | 'error' | 'info'>('success');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Modals state
  const [showNewIntentModal, setShowNewIntentModal] = useState<boolean>(false);
  const [selectedVoucherIntent, setSelectedVoucherIntent] = useState<any | null>(null);
  const [selectedWebhookPayload, setSelectedWebhookPayload] = useState<any | null>(null);

  // Filters
  const [intentFilterChannel, setIntentFilterChannel] = useState<string>('ALL');
  const [intentFilterStatus, setIntentFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Simulator Form State
  const [simChannel, setSimChannel] = useState<'MTN_MOMO' | 'AIRTEL_MONEY' | 'ZAMTEL_MONEY' | 'CARD_HOSTED'>('MTN_MOMO');
  const [simLearnerId, setSimLearnerId] = useState<string>(learners[0]?.id || '');
  const [simInvoiceId, setSimInvoiceId] = useState<string>(invoices[0]?.id || '');
  const [simAmount, setSimAmount] = useState<number>(1500);
  const [simPayerPhone, setSimPayerPhone] = useState<string>('0967812903');
  const [simPayerName, setSimPayerName] = useState<string>(
    learners[0] ? `${learners[0].firstName} ${learners[0].lastName} (Student)` : 'Mr. Mwape (Sponsor)'
  );
  const [simPushSent, setSimPushSent] = useState<any | null>(null);
  const [simPin, setSimPin] = useState<string>('');

  // New Intent Form
  const [newIntent, setNewIntent] = useState({
    amountZMW: 2500,
    channel: 'MTN_MOMO',
    payerPhone: '0961234567',
    payerName: 'Parent / Sponsor',
    learnerId: learners[0]?.id || '',
    invoiceId: invoices[0]?.id || '',
  });

  // Client-side fallback fetch to ensure learners and batches are always loaded
  useEffect(() => {
    async function loadFreshData() {
      try {
        const res = await fetch('/api/payments');
        if (res.ok) {
          const json = await res.json();
          if (json.data && intents.length === 0) setIntents(json.data);
          if (json.batches && batches.length === 0) setBatches(json.batches);
          if (json.webhooks && webhooks.length === 0) setWebhooks(json.webhooks);
          if (json.learners && json.learners.length > 0) {
            setLearnersList(json.learners);
            if (!simLearnerId) {
              setSimLearnerId(json.learners[0].id);
              setSimPayerName(`${json.learners[0].firstName} ${json.learners[0].lastName} (Student)`);
            }
          }
          if (json.invoices && json.invoices.length > 0) setInvoicesList(json.invoices);
        }
      } catch (e) {
        console.error('[PaymentsConsole] Fresh data fetch notice:', e);
      }
    }

    if (learnersList.length === 0 || batches.length === 0) {
      loadFreshData();
    }
  }, []);

  // KPI calculations
  const totalSettledZMW = intents
    .filter((i) => i.status === 'CONFIRMED')
    .reduce((sum, i) => sum + Number(i.amountZMW || 0), 0);

  const pendingIntentsCount = intents.filter((i) => i.status === 'CREATED' || i.status === 'INITIATED').length;
  const unreconciledBatchesCount = batches.filter((b) => !b.isReconciled).length;

  function showNotification(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    setNotice(msg);
    setNoticeType(type);
    setTimeout(() => {
      setNotice('');
    }, 6000);
  }

  // Handle Create Intent
  async function handleCreateIntent(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newIntent,
          learnerId: newIntent.learnerId && newIntent.learnerId.trim() !== '' ? newIntent.learnerId.trim() : undefined,
          invoiceId: newIntent.invoiceId && newIntent.invoiceId.trim() !== '' ? newIntent.invoiceId.trim() : undefined,
          amountZMW: Number(newIntent.amountZMW),
          idempotencyKey: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Payment intent creation failed');

      const created = data.data.intent;
      // Enrich with learner info for display
      const learnerObj = learnersList.find((l) => l.id === newIntent.learnerId);
      const invoiceObj = invoicesList.find((inv) => inv.id === newIntent.invoiceId);
      created.learner = learnerObj;
      created.invoice = invoiceObj;

      setIntents([created, ...intents]);
      setShowNewIntentModal(false);
      showNotification(`Payment intent initiated [${created.businessReference}]. Customer USSD prompt dispatched.`, 'success');
    } catch (err: any) {
      showNotification(`Error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle USSD Push Dispatch (Airtel, MTN, Zamtel)
  async function handleSimulatorPush(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const cleanLearnerId = simLearnerId && simLearnerId.trim() !== '' ? simLearnerId.trim() : undefined;
      const cleanInvoiceId = simInvoiceId && simInvoiceId.trim() !== '' ? simInvoiceId.trim() : undefined;

      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initiate-mobile-money',
          channel: simChannel,
          learnerId: cleanLearnerId,
          invoiceId: cleanInvoiceId,
          amountZMW: Number(simAmount),
          payerPhone: simPayerPhone,
          payerName: simPayerName,
          idempotencyKey: `momo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Mobile money push dispatch failed');

      const created = data.data.intent || data.data;
      const learnerObj = learnersList.find((l) => l.id === cleanLearnerId);
      const invoiceObj = invoicesList.find((inv) => inv.id === cleanInvoiceId);
      created.learner = learnerObj;
      created.invoice = invoiceObj;

      setIntents([created, ...intents]);
      setSimPushSent(created);
      const ussdPrompt = data.data.ussdPrompt ? ` [${data.data.ussdPrompt}]` : '';
      showNotification(`Live USSD push dispatched to ${simPayerPhone}${ussdPrompt}. Awaiting subscriber PIN authorization.`, 'info');
    } catch (err: any) {
      showNotification(`Mobile Money Error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Real-Time Mobile Money Network Status Query
  async function handleQueryStatus(intentId: string) {
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'query-status',
          intentId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Network status query failed');

      if (data.data.isSettled) {
        const targetIntent = intents.find((i) => i.id === intentId);
        const updated = {
          ...targetIntent,
          status: 'CONFIRMED',
          settledAt: new Date(),
        };
        setIntents(intents.map((i) => (i.id === intentId ? (updated as any) : i)));
        if (simPushSent?.id === intentId) setSimPushSent(updated);
        showNotification(`Carrier Network Confirmed: ${data.data.message}. Official receipt posted to student ledger.`, 'success');
      } else {
        showNotification(`Carrier Status: ${data.data.message}`, 'info');
      }
    } catch (err: any) {
      showNotification(`Status Enquiry Error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Confirm / Settle Payment
  async function handleConfirmPayment(intentId: string) {
    setIsSubmitting(true);

    try {
      const targetIntent = intents.find((i) => i.id === intentId);
      const channelCode =
        targetIntent?.channel === 'AIRTEL_MONEY'
          ? 'AIRTEL_MONEY_ZM'
          : targetIntent?.channel === 'ZAMTEL_MONEY'
          ? 'ZAMTEL_KWACHA_ZM'
          : 'MTN_MOMO_ZM';
      const providerTxId = `TXN-${channelCode.slice(0, 3)}-${Date.now()}`;

      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm',
          intentId,
          providerTransactionId: providerTxId,
          providerCode: channelCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Payment settlement failed');

      const updated = data.data.intent;
      // Preserve learner and invoice refs
      if (targetIntent) {
        updated.learner = targetIntent.learner;
        updated.invoice = targetIntent.invoice;
      }

      setIntents(intents.map((i) => (i.id === intentId ? updated : i)));
      if (simPushSent?.id === intentId) {
        setSimPushSent(updated);
      }

      showNotification(`Payment confirmed! K${Number(updated.amountZMW).toFixed(2)} settled into student fee ledger. Campus entitlements unlocked.`, 'success');
    } catch (err: any) {
      showNotification(`Settlement Error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Reconcile Batch
  async function handleReconcileBatch(batchId: string) {
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reconcile-batch',
          batchId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Batch reconciliation failed');

      setBatches(batches.map((b) => (b.id === batchId ? data.data : b)));
      showNotification(`Settlement Batch [${data.data.batchReference}] reconciled with commercial bank statement.`, 'success');
    } catch (err: any) {
      showNotification(`Reconciliation Error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Filtered Intents
  const filteredIntents = intents.filter((i) => {
    if (intentFilterChannel !== 'ALL' && i.channel !== intentFilterChannel) return false;
    if (intentFilterStatus !== 'ALL' && i.status !== intentFilterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const refMatch = i.businessReference?.toLowerCase().includes(q);
      const payerMatch = i.payerName?.toLowerCase().includes(q) || i.payerPhone?.toLowerCase().includes(q);
      const studentMatch = i.learner?.studentNumber?.toLowerCase().includes(q) || i.learner?.firstName?.toLowerCase().includes(q) || i.learner?.lastName?.toLowerCase().includes(q);
      if (!refMatch && !payerMatch && !studentMatch) return false;
    }
    return true;
  });

  return (
    <div className="mt-8 space-y-6">
      {/* Toast Notice */}
      {notice && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 shadow-sm transition-all ${
            noticeType === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : noticeType === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-900'
              : 'border-cyan-200 bg-cyan-50 text-cyan-900'
          }`}
        >
          {noticeType === 'success' ? (
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
          ) : noticeType === 'error' ? (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          ) : (
            <Sparkles className="h-5 w-5 shrink-0 text-cyan-600" />
          )}
          <p className="text-sm font-semibold">{notice}</p>
        </div>
      )}

      {!hideHeader && (
        <>
          {/* KPI Metric Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Settled Collections</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-slate-900">
              K{totalSettledZMW.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-emerald-700 flex items-center gap-1">
            <CheckCheck className="h-3.5 w-3.5" /> Direct ledger credits confirmed
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">In-Flight USSD Prompts</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-slate-900">{pendingIntentsCount}</span>
            <span className="text-xs text-slate-500">intents pending</span>
          </div>
          <p className="mt-1 text-xs font-medium text-amber-700">Awaiting customer push authorization</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Provider Settlement Batches</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <Building2 className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-slate-900">{batches.length}</span>
            <span className="text-xs text-slate-500">
              ({unreconciledBatchesCount} unreconciled)
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-cyan-700">MTN & Airtel bank remittances</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Double-Posting SLA</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <ShieldCheck className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-indigo-900">0.00%</span>
            <span className="text-xs font-semibold text-emerald-600">Zero Duplicates</span>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-600">Idempotency mutex locks active</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('intents')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === 'intents'
                ? 'bg-cyan-700 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            Payment Intents & Collections ({intents.length})
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === 'simulator'
                ? 'bg-cyan-700 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Send className="h-4 w-4" />
            USSD Push Simulator
          </button>
          <button
            onClick={() => setActiveTab('settlements')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === 'settlements'
                ? 'bg-cyan-700 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Layers className="h-4 w-4" />
            Settlement Batches & Matching ({batches.length})
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === 'webhooks'
                ? 'bg-cyan-700 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Code2 className="h-4 w-4" />
            Webhook Inbox & Audit ({webhooks.length})
          </button>
          <button
            onClick={() => setActiveTab('channels')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === 'channels'
                ? 'bg-cyan-700 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Gateway Rails & Rules
          </button>
        </div>

        {activeTab === 'intents' && (
          <button
            onClick={() => setShowNewIntentModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-cyan-800 transition"
          >
            <Plus className="h-4 w-4" /> New Payment Intent
          </button>
        )}
      </div>
        </>
      )}

      {/* TAB 1: PAYMENT INTENTS & COLLECTIONS */}
      {activeTab === 'intents' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-1 items-center gap-2 min-w-[260px]">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search reference, student name, student ID, or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <span>Channel:</span>
                <select
                  value={intentFilterChannel}
                  onChange={(e) => setIntentFilterChannel(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="ALL">All Channels</option>
                  <option value="MTN_MOMO">🟡 MTN Mobile Money</option>
                  <option value="AIRTEL_MONEY">🔴 Airtel Money</option>
                  <option value="CARD_HOSTED">💳 Hosted Card / Bank</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span>Status:</span>
                <select
                  value={intentFilterStatus}
                  onChange={(e) => setIntentFilterStatus(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CONFIRMED">Settled & Confirmed</option>
                  <option value="INITIATED">Initiated / Push Sent</option>
                  <option value="CREATED">Created</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {filteredIntents.length === 0 ? (
              <div className="p-12 text-center">
                <Smartphone className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-base font-bold text-slate-800">No payment intents found</p>
                <p className="mt-1 text-xs text-slate-500">
                  {searchQuery || intentFilterChannel !== 'ALL' || intentFilterStatus !== 'ALL'
                    ? 'Try adjusting your filters.'
                    : 'Initiate a mobile money collection intent using the button above or simulator.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-3.5">Business Reference</th>
                      <th className="px-5 py-3.5">Payment Channel</th>
                      <th className="px-5 py-3.5">Student / Allocation</th>
                      <th className="px-5 py-3.5">Payer Details</th>
                      <th className="px-5 py-3.5">Amount (ZMW)</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Date & Time</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredIntents.map((i) => {
                      const isConfirmed = i.status === 'CONFIRMED';
                      const learnerName = i.learner
                        ? `${i.learner.firstName} ${i.learner.lastName}`
                        : 'General Student Balance';
                      const studentNo = i.learner?.studentNumber || 'DIRECT';

                      return (
                        <tr
                          key={i.id}
                          onClick={() => setSelectedVoucherIntent(i)}
                          className="cursor-pointer hover:bg-slate-50 transition"
                        >
                          <td className="px-5 py-3.5">
                            <span className="font-mono font-bold text-slate-900">{i.businessReference}</span>
                            {i.providerReference && (
                              <p className="text-[10px] font-mono text-slate-400">Ref: {i.providerReference}</p>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-semibold text-slate-800">
                              {i.channel === 'MTN_MOMO'
                                ? 'MTN MoMo'
                                : i.channel === 'AIRTEL_MONEY'
                                ? 'Airtel Money'
                                : i.channel === 'ZAMTEL_MONEY'
                                ? 'Zamtel Kwacha'
                                : 'Card / Bank'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-slate-900">{learnerName}</div>
                            <div className="text-[11px] font-mono text-cyan-800">{studentNo}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-slate-800">{i.payerName || 'Direct'}</div>
                            <div className="font-mono text-[11px] text-slate-500">{i.payerPhone || 'Direct App'}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-mono font-medium text-slate-900 text-sm">
                              ZMW {Number(i.amountZMW || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  isConfirmed
                                    ? 'bg-emerald-500'
                                    : i.status === 'INITIATED' || i.status === 'PENDING_CUSTOMER'
                                    ? 'bg-amber-500'
                                    : 'bg-slate-400'
                                }`}
                              />
                              <span className="text-slate-800">
                                {isConfirmed
                                  ? 'Confirmed'
                                  : i.status === 'PENDING_CUSTOMER'
                                  ? 'Handset Prompt'
                                  : i.status === 'INITIATED'
                                  ? 'Initiated'
                                  : 'Pending'}
                              </span>
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-[11px] text-slate-500">
                            {new Date(i.createdAt).toLocaleString()}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                              {isConfirmed ? (
                                <button
                                  onClick={() => setSelectedVoucherIntent(i)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                                >
                                  <Receipt className="h-3.5 w-3.5 text-slate-500" /> Voucher
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleQueryStatus(i.id)}
                                    disabled={isSubmitting}
                                    title="Query status live from carrier network (Airtel/MTN/Zamtel)"
                                    className="inline-flex items-center gap-1 rounded-lg border border-cyan-300 bg-cyan-50 px-2.5 py-1 text-[11px] font-bold text-cyan-800 hover:bg-cyan-100 transition shadow-xs disabled:opacity-50"
                                  >
                                    <RefreshCw className="h-3 w-3 text-cyan-600" /> Query
                                  </button>
                                  <button
                                    onClick={() => handleConfirmPayment(i.id)}
                                    disabled={isSubmitting}
                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-800 transition shadow-xs disabled:opacity-50"
                                  >
                                    <Check className="h-3.5 w-3.5" /> Settle & Post
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: USSD PUSH SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Dispatch Form (Left) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-7">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">LamtonPay Mobile Money Gateway</h3>
                <p className="text-xs text-slate-500">
                  Trigger live mobile money push prompts to Zambian telco networks (MTN MoMo *303# / Airtel Money *778# / Zamtel Kwacha *115#)
                </p>
              </div>
            </div>

            <form onSubmit={handleSimulatorPush} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Telco Gateway Rail</label>
                  <select
                    value={simChannel}
                    onChange={(e: any) => {
                      setSimChannel(e.target.value);
                      if (e.target.value === 'MTN_MOMO') setSimPayerPhone('0967812903');
                      if (e.target.value === 'AIRTEL_MONEY') setSimPayerPhone('0978192034');
                      if (e.target.value === 'ZAMTEL_MONEY') setSimPayerPhone('0955123456');
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                  >
                    <option value="MTN_MOMO">🟡 MTN Mobile Money (*303# Prompt)</option>
                    <option value="AIRTEL_MONEY">🔴 Airtel Money (*778# Prompt)</option>
                    <option value="ZAMTEL_MONEY">🟢 Zamtel Kwacha (*115# Prompt)</option>
                    <option value="CARD_HOSTED">💳 Visa / Mastercard 3DS Card</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Amount (ZMW)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={simAmount}
                    onChange={(e) => setSimAmount(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Student Account Allocation</label>
                <select
                  value={simLearnerId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setSimLearnerId(selectedId);
                    const matchingInvoice = invoicesList.find((inv) => inv.learnerId === selectedId);
                    if (matchingInvoice) {
                      setSimInvoiceId(matchingInvoice.id);
                    } else {
                      setSimInvoiceId('');
                    }
                    const selectedLearner = learnersList.find((l) => l.id === selectedId);
                    if (selectedLearner) {
                      setSimPayerName(`${selectedLearner.firstName} ${selectedLearner.lastName} (Student)`);
                    }
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                >
                  <option value="">-- General / Direct Sponsor Deposit (No specific student) --</option>
                  {learnersList.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.studentNumber} — {l.firstName} {l.lastName}
                    </option>
                  ))}
                </select>
                {learnersList.length === 0 && (
                  <p className="mt-1 text-[11px] text-amber-700">Loading enrolled students...</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Target Tuition Invoice</label>
                <select
                  value={simInvoiceId}
                  onChange={(e) => setSimInvoiceId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                >
                  <option value="">General Student Account Balance</option>
                  {invoicesList.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} (Balance: K{Number(inv.balance || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Payer Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={simPayerPhone}
                    onChange={(e) => setSimPayerPhone(e.target.value)}
                    placeholder="e.g. 0967812903 or 0978192034"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Payer Name / Sponsor</label>
                  <input
                    type="text"
                    required
                    value={simPayerName}
                    onChange={(e) => setSimPayerName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-cyan-800 transition disabled:opacity-50"
              >
                <Smartphone className="h-4 w-4" />
                {isSubmitting ? 'Dispatching Push...' : 'Dispatch USSD Push Prompt to Subscriber'}
              </button>
            </form>
          </div>

          {/* Interactive Phone Mockup (Right) */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm lg:col-span-5">
            <div className="w-full max-w-[320px] rounded-[36px] border-4 border-slate-800 bg-white p-4 shadow-xl">
              {/* Speaker notch */}
              <div className="mx-auto mb-4 h-3 w-20 rounded-full bg-slate-800"></div>

              {/* Screen Area */}
              <div className="min-h-[380px] rounded-2xl border border-slate-300 bg-slate-100 p-4 text-slate-800 shadow-inner">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                  <span>
                    {simChannel === 'AIRTEL_MONEY'
                      ? 'Airtel Zambia'
                      : simChannel === 'ZAMTEL_MONEY'
                      ? 'Zamtel Kwacha'
                      : 'MTN Zambia'}
                  </span>
                  <span>4G LTE • 100%</span>
                </div>

                {simPushSent ? (
                  <div className="mt-8 space-y-4">
                    {simPushSent.status === 'CONFIRMED' ? (
                      <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-center shadow-xs">
                        <CheckCircle className="mx-auto h-10 w-10 text-emerald-600" />
                        <h4 className="mt-2 text-sm font-bold text-emerald-900">Payment Successful!</h4>
                        <p className="mt-1 text-xs text-slate-700">
                          K{Number(simPushSent.amountZMW).toFixed(2)} paid to NWUCHAS Bursary.
                        </p>
                        <p className="mt-2 text-[10px] font-mono text-slate-500">
                          Ref: {simPushSent.providerReference || simPushSent.businessReference}
                        </p>
                        <button
                          onClick={() => setSelectedVoucherIntent(simPushSent)}
                          className="mt-4 inline-flex items-center gap-1 rounded-lg bg-teal-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-900 transition"
                        >
                          <Receipt className="h-3.5 w-3.5" /> View Voucher
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-xs">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                          <Smartphone className="h-4 w-4 text-amber-700" />
                          <span>USSD Push Prompt Received</span>
                        </div>
                        <div className="mt-3 space-y-1 text-xs text-slate-700">
                          <p>
                            Pay <span className="font-bold text-slate-900">K{Number(simPushSent.amountZMW).toFixed(2)}</span> to:
                          </p>
                          <p className="font-semibold text-teal-800">NWUCHAS BURSARY (Manyama)</p>
                          <p className="text-[11px] text-slate-500">Ref: {simPushSent.businessReference}</p>
                        </div>

                        <div className="mt-4">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600">
                            Enter 4-Digit Mobile Money PIN
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            value={simPin}
                            onChange={(e) => setSimPin(e.target.value)}
                            placeholder="••••"
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-sm font-mono tracking-widest text-slate-900 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 focus:outline-none"
                          />
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() => setSimPushSent(null)}
                            className="w-1/2 rounded-lg border border-slate-300 bg-white py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfirmPayment(simPushSent.id)}
                            disabled={isSubmitting}
                            className="w-1/2 rounded-lg bg-teal-800 py-1.5 text-xs font-bold text-white hover:bg-teal-900 transition disabled:opacity-50"
                          >
                            {isSubmitting ? 'Authorizing...' : 'Approve PIN'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-16 text-center text-slate-500">
                    <Smartphone className="mx-auto h-12 w-12 text-slate-400" />
                    <p className="mt-3 text-xs font-semibold text-slate-700">Device Ready</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Dispatch a push prompt from the left panel to test subscriber experience.
                    </p>
                  </div>
                )}
              </div>

              {/* Home indicator bar */}
              <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-slate-300"></div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SETTLEMENT BATCHES & MATCHING */}
      {activeTab === 'settlements' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Provider Settlement Batches & Bank Reconciliation</h3>
            <p className="text-xs text-slate-500">
              Daily consolidated mobile money remittances matching LamtonPay transactions to North Western University commercial bank account.
            </p>
          </div>

          <div className="space-y-4">
            {batches.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <Layers className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-base font-bold text-slate-800">No settlement batches recorded</p>
                <p className="mt-1 text-xs text-slate-500">Daily settlement batches appear here upon provider clearing.</p>
              </div>
            ) : (
              batches.map((b) => {
                const totalAmount = Number(b.totalAmountZMW || 0);
                const feeAmount = Number(b.feeAmountZMW || 0);
                const netAmount = Number(b.netAmountZMW || 0);
                const lines = b.settlementLines || [];

                return (
                  <div key={b.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/80 p-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-xs ${
                            b.providerCode.includes('MTN')
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-rose-100 text-rose-900'
                          }`}
                        >
                          {b.providerCode.includes('MTN') ? 'MTN' : 'AIR'}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 text-sm">{b.batchReference}</span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                b.isReconciled
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {b.isReconciled ? 'Reconciled with Bank' : 'Pending Verification'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500" suppressHydrationWarning>
                            Settlement Date: {new Date(b.settlementDate).toLocaleDateString()} • Provider: {b.providerCode}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[11px] text-slate-500">Gross Cleared</p>
                          <p className="font-mono font-bold text-slate-800">
                            K{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] text-slate-500">Gateway Fees (1.5%)</p>
                          <p className="font-mono font-semibold text-rose-600">
                            -K{feeAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-bold text-emerald-700">Net Credited</p>
                          <p className="font-mono font-black text-emerald-700 text-base">
                            K{netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </div>

                        {!b.isReconciled && (
                          <button
                            onClick={() => handleReconcileBatch(b.id)}
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-1 rounded-xl bg-cyan-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-cyan-800 transition disabled:opacity-50"
                          >
                            <CheckCheck className="h-4 w-4" /> Reconcile
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Settlement Lines Breakdown */}
                    <div className="p-4">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Line Transactions Matching ({lines.length})
                      </p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-500 font-semibold">
                            <tr>
                              <th className="px-4 py-2">Provider Transaction ID</th>
                              <th className="px-4 py-2">Gross (ZMW)</th>
                              <th className="px-4 py-2">Fee (ZMW)</th>
                              <th className="px-4 py-2">Net (ZMW)</th>
                              <th className="px-4 py-2">Matching Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {lines.map((l: any) => (
                              <tr key={l.id} className="hover:bg-slate-50/50">
                                <td className="px-4 py-2 font-mono font-medium text-slate-900">{l.providerTxId}</td>
                                <td className="px-4 py-2 font-mono">K{Number(l.amountZMW).toFixed(2)}</td>
                                <td className="px-4 py-2 font-mono text-slate-500">K{Number(l.feeZMW).toFixed(2)}</td>
                                <td className="px-4 py-2 font-mono font-bold text-slate-800">
                                  K{Number(l.netZMW).toFixed(2)}
                                </td>
                                <td className="px-4 py-2">
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                      l.isMatched
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                                    }`}
                                  >
                                    {l.isMatched ? 'Matched to Ledger' : 'Unmatched'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: WEBHOOK INBOX & AUDIT */}
      {activeTab === 'webhooks' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Cryptographic Webhook Inbox & Event Audit</h3>
            <p className="text-xs text-slate-500">
              Raw HTTP callbacks received from MTN MoMo and Airtel Money gateways with cryptographic HMAC-SHA256 signature verification.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {webhooks.length === 0 ? (
              <div className="p-12 text-center">
                <Code2 className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-base font-bold text-slate-800">No webhook events logged</p>
                <p className="mt-1 text-xs text-slate-500">Inbound HTTP notifications from telcos will be logged here.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5">Provider</th>
                    <th className="px-5 py-3.5">Signature Verification</th>
                    <th className="px-5 py-3.5">Processing Status</th>
                    <th className="px-5 py-3.5">Timestamp</th>
                    <th className="px-5 py-3.5 text-right">Payload Inspection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {webhooks.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-slate-900">{w.providerCode}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            w.isSignatureValid
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {w.isSignatureValid ? (
                            <>
                              <ShieldCheck className="h-3 w-3 text-emerald-600" /> Valid HMAC-SHA256
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 text-rose-600" /> Invalid Signature
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            w.status === 'PROCESSED'
                              ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {formatCleanEnum(w.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[11px] text-slate-500">
                        {new Date(w.createdAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedWebhookPayload(w)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-xs"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-500" /> Inspect JSON
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: GATEWAY RAILS & ZERO DOUBLE-POSTING RULES */}
      {activeTab === 'channels' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Zambian Gateway Rails & Architecture</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Configured telecommunication endpoints and electronic fund transfer clearing rails for North Western University College. Click any rail or use &apos;Configure Rail&apos; to edit endpoints and settlement rules.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRail(gatewayRails[0])}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-xs transition"
              >
                <Sliders className="h-3.5 w-3.5 text-cyan-700" /> Configure Rails
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {gatewayRails.map((rail) => (
                <div
                  key={rail.id}
                  className={`rounded-2xl border p-5 transition relative group ${
                    rail.provider === 'MTN'
                      ? 'border-amber-200 bg-amber-50/50'
                      : rail.provider === 'AIRTEL'
                      ? 'border-rose-200 bg-rose-50/50'
                      : 'border-indigo-200 bg-indigo-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {rail.provider === 'MTN' ? '🟡 ' : rail.provider === 'AIRTEL' ? '🔴 ' : '💳 '}
                      {rail.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          rail.status === 'ONLINE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rail.status === 'DEGRADED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {formatCleanEnum(rail.status)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingRail(rail)}
                        title="Edit Rail Architecture"
                        className="rounded-md bg-white p-1 text-slate-500 shadow-xs border border-slate-200 hover:text-cyan-700 hover:border-cyan-400 transition"
                      >
                        <Sliders className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed min-h-[48px]">{rail.description}</p>
                  <div className="mt-3 text-[11px] space-y-1 font-mono text-slate-700">
                    <div>
                      Endpoint: <span className="font-semibold text-slate-900">{rail.endpoint}</span>
                    </div>
                    <div>
                      Settlement: <span className="font-semibold text-slate-900">{rail.settlementSla}</span>
                    </div>
                    <div>
                      Config: <span className="font-semibold text-slate-900">{rail.merchantCodeOrTerminal}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-[10px] font-mono text-slate-400">{rail.apiVersion}</span>
                    <button
                      type="button"
                      onClick={() => setEditingRail(rail)}
                      className="font-bold text-cyan-800 hover:text-cyan-950 inline-flex items-center gap-1 text-xs"
                    >
                      <Edit3 className="h-3 w-3" /> Edit Architecture
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zero Double-Posting Governance Guarantee */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Zero Double-Posting Guarantee & Ledger Mutex Rules</h4>
                <p className="text-xs text-slate-500">
                  Strict financial safeguards protecting student accounts and institutional audit trails.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 text-xs text-slate-700">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-700 text-white text-[10px]">1</span>
                  Idempotency Mutex Lock
                </div>
                <p className="mt-2 text-slate-600 leading-relaxed">
                  Every initiated payment contains a unique cryptographic `idempotencyKey`. Duplicate inbound requests with the same key are intercepted and resolved without re-posting.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-700 text-white text-[10px]">2</span>
                  Atomic Database Transactions
                </div>
                <p className="mt-2 text-slate-600 leading-relaxed">
                  Receipt generation, invoice balance reduction, payment allocation, and double-entry ledger posting execute inside an all-or-nothing database transaction (`prisma.$transaction`).
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-700 text-white text-[10px]">3</span>
                  Automated Entitlements Release
                </div>
                <p className="mt-2 text-slate-600 leading-relaxed">
                  Upon verified settlement confirmation, `EntitlementService` instantly recalculates student fee clearance to unlock exam eligibility, hostel access, and library privileges.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: NEW PAYMENT INTENT */}
      {showNewIntentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Smartphone className="h-4 w-4 text-cyan-700" /> Initiate Mobile Money Intent
              </div>
              <button
                onClick={() => setShowNewIntentModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateIntent} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment Channel</label>
                <select
                  value={newIntent.channel}
                  onChange={(e) => setNewIntent({ ...newIntent, channel: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                >
                  <option value="MTN_MOMO">🟡 MTN Mobile Money (Zambia - *303#)</option>
                  <option value="AIRTEL_MONEY">🔴 Airtel Money (Zambia - *778#)</option>
                  <option value="CARD_HOSTED">💳 Visa / Mastercard Electronic Payment</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Student Account</label>
                <select
                  value={newIntent.learnerId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setNewIntent({ ...newIntent, learnerId: selectedId });
                    const matchInv = invoicesList.find((inv) => inv.learnerId === selectedId);
                    if (matchInv) {
                      setNewIntent((prev) => ({ ...prev, invoiceId: matchInv.id }));
                    } else {
                      setNewIntent((prev) => ({ ...prev, invoiceId: '' }));
                    }
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                >
                  <option value="">-- General Student Deposit / Unassigned Sponsor --</option>
                  {learnersList.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.studentNumber} — {l.firstName} {l.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Invoice Allocation</label>
                <select
                  value={newIntent.invoiceId}
                  onChange={(e) => setNewIntent({ ...newIntent, invoiceId: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                >
                  <option value="">Direct Tuition Balance</option>
                  {invoicesList.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} (Balance: K{Number(inv.balance || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Amount (ZMW)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newIntent.amountZMW}
                    onChange={(e) => setNewIntent({ ...newIntent, amountZMW: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Payer Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={newIntent.payerPhone}
                    onChange={(e) => setNewIntent({ ...newIntent, payerPhone: e.target.value })}
                    placeholder="e.g. 0961234567"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Payer Full Name / Sponsor</label>
                <input
                  type="text"
                  required
                  value={newIntent.payerName}
                  onChange={(e) => setNewIntent({ ...newIntent, payerName: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewIntentModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-cyan-700 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-cyan-800 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Dispatching...' : 'Dispatch Payment Prompt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: OFFICIAL VOUCHER PRINT MODAL */}
      {selectedVoucherIntent && (
        <PaymentReceiptModal
          intent={selectedVoucherIntent}
          onClose={() => setSelectedVoucherIntent(null)}
        />
      )}

      {/* MODAL 3: WEBHOOK PAYLOAD INSPECTOR */}
      {selectedWebhookPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Code2 className="h-4 w-4 text-cyan-700" /> Inbound Webhook Payload ({selectedWebhookPayload.providerCode})
              </div>
              <button
                onClick={() => setSelectedWebhookPayload(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Signature Header:</span>
                <span className="font-mono text-[11px] text-slate-800 truncate max-w-xs">
                  {selectedWebhookPayload.signatureHeader || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Signature Status:</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    selectedWebhookPayload.isSignatureValid
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {selectedWebhookPayload.isSignatureValid ? 'Verified HMAC-SHA256' : 'Invalid Signature'}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Decoded JSON Payload</label>
                <pre className="mt-1 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-800">
                  {JSON.stringify(JSON.parse(selectedWebhookPayload.payloadJson || '{}'), null, 2)}
                </pre>
              </div>

              {selectedWebhookPayload.processingError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                  <span className="font-bold">Processing Error:</span> {selectedWebhookPayload.processingError}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedWebhookPayload(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Gateway Rail Modal */}
      {editingRail && (
        <EditGatewayRailModal
          isOpen={!!editingRail}
          onClose={() => setEditingRail(null)}
          rail={editingRail}
          onSave={handleSaveRail}
        />
      )}
    </div>
  );
}
