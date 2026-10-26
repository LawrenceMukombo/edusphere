// src/components/OfflineIndicator.tsx — NWUCHAS CMIS Offline Status & Synchronization Controller
'use client';

import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  X,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  getPendingMutations,
  flushPendingMutations,
  OfflineCommand,
} from '@/lib/offlineSync';
import { formatCleanEnum } from '@/lib/formatters';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [pendingList, setPendingList] = useState<OfflineCommand[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const commands = getPendingMutations();
      setPendingCount(commands.length);
      setPendingList(commands);
      setLastSyncTime(localStorage.getItem('nwuchas_last_sync_time'));

      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      ) {
        setIsInstalled(true);
      }
    }

    const handleOnline = async () => {
      setIsOnline(true);
      setIsSyncing(true);
      try {
        await flushPendingMutations();
      } finally {
        setIsSyncing(false);
        const commands = getPendingMutations();
        setPendingCount(commands.length);
        setPendingList(commands);
        setLastSyncTime(new Date().toLocaleTimeString());
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleQueueChanged = () => {
      const commands = getPendingMutations();
      setPendingCount(commands.length);
      setPendingList(commands);
    };

    const handleSyncCompleted = () => {
      const commands = getPendingMutations();
      setPendingCount(commands.length);
      setPendingList(commands);
      setLastSyncTime(new Date().toLocaleTimeString());
    };

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('nwuchas_offline_queue_changed', handleQueueChanged);
    window.addEventListener('nwuchas_sync_completed', handleSyncCompleted);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('nwuchas_offline_queue_changed', handleQueueChanged);
      window.removeEventListener('nwuchas_sync_completed', handleSyncCompleted);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleManualSync = async () => {
    if (!isOnline) {
      alert('Cannot sync while offline. Please connect to a verified network.');
      return;
    }
    setIsSyncing(true);
    try {
      await flushPendingMutations();
    } finally {
      setIsSyncing(false);
      const commands = getPendingMutations();
      setPendingCount(commands.length);
      setPendingList(commands);
      setLastSyncTime(new Date().toLocaleTimeString());
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('[NWUCHAS PWA] User accepted installation prompt');
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* PWA Install Button */}
        {deferredPrompt && !isInstalled && (
          <button
            type="button"
            onClick={handleInstallClick}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition animate-pulse"
            title="Install NWUCHAS CMIS as an Offline Desktop/Mobile App"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-200" />
            <span>Install CMIS</span>
          </button>
        )}

        {/* Network & Offline Status Pill */}
        <button
          type="button"
          onClick={() => setShowStatusModal(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition border shadow-xs ${
            !isOnline
              ? 'bg-amber-500/10 text-amber-900 dark:text-amber-300 border-amber-400 hover:bg-amber-500/20'
              : pendingCount > 0
              ? 'bg-sky-50 text-sky-800 border-sky-300 hover:bg-sky-100'
              : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
          }`}
          title="Click to view NWUCHAS Offline Storage & Synchronization Queue"
        >
          {!isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Offline Mode</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-600 text-white rounded-full text-[10px] font-black">
                  {pendingCount}
                </span>
              )}
            </>
          ) : isSyncing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-sky-600 animate-spin" />
              <span className="hidden sm:inline">Syncing...</span>
            </>
          ) : pendingCount > 0 ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">Sync Queue ({pendingCount})</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Online</span>
            </>
          )}
        </button>
      </div>

      {/* Offline Status & Sync Queue Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Offline Operations & Sync Queue
                  </h3>
                  <span className="text-xs text-slate-500">
                    NWUCHAS CMIS • Resilient Offline Architecture
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Network Condition */}
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                isOnline
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              {isOnline ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span className="font-bold text-sm block">
                  {isOnline ? 'Connected to NWUCHAS Network' : 'Operating in Disconnected Offline Mode'}
                </span>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {isOnline
                    ? 'Records are synchronized with the primary database. Permitted offline data is cached in IndexedDB.'
                    : 'Permitted operations (attendance capture, clinical logbook drafts, hostel roll-calls) are queued locally with cryptographic idempotency keys.'}
                </p>
              </div>
            </div>

            {/* Diagnostics & Stats */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">
                  Queued Operations
                </span>
                <span className="font-black text-slate-900 text-lg">
                  {pendingCount} Pending
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">
                  Last Server Sync
                </span>
                <span className="font-mono font-bold text-slate-800 text-xs">
                  {lastSyncTime ? `${lastSyncTime} CAT` : 'Not yet synced'}
                </span>
              </div>
            </div>

            {/* Pending Commands List */}
            {pendingList.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Queued Offline Operations:
                </span>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {pendingList.map((cmd) => (
                    <div
                      key={cmd.operationId}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{cmd.action}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[9px] ${
                            cmd.status === 'QUEUED'
                              ? 'bg-amber-100 text-amber-800'
                              : cmd.status === 'SYNCHRONISING'
                              ? 'bg-blue-100 text-blue-800 animate-pulse'
                              : cmd.status === 'CONFLICTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-slate-200 text-slate-800'
                          }`}
                        >
                          {formatCleanEnum(cmd.status)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>ID: {cmd.operationId}</span>
                        <span>Retries: {cmd.retryCount}/{cmd.maxRetries}</span>
                      </div>
                      {cmd.errorMessage && (
                        <div className="flex items-center gap-1 text-[10px] text-red-600 bg-red-50 p-1 rounded">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>{cmd.errorMessage}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                disabled={!isOnline || isSyncing}
                onClick={handleManualSync}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold flex items-center gap-1.5 shadow-xs transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Synchronizing...' : 'Sync Now'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
