// src/components/OfflineIndicator.tsx — Offline Status & PWA Installation Controller
'use client';

import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  DownloadCloud,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Smartphone,
  X,
  ShieldCheck,
} from 'lucide-react';
import {
  getPendingMutations,
  flushPendingMutations,
  OfflineMutation,
} from '@/lib/offlineSync';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [pendingList, setPendingList] = useState<OfflineMutation[]>([]);

  useEffect(() => {
    // Initial connectivity state
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const mutations = getPendingMutations();
      setPendingCount(mutations.length);
      setPendingList(mutations);
      setLastSyncTime(localStorage.getItem('edusphere_last_sync_time'));

      // Check if already running in standalone/installed mode
      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      ) {
        setIsInstalled(true);
      }
    }

    const handleOnline = async () => {
      setIsOnline(true);
      // Auto-flush pending mutations when connection is restored
      setIsSyncing(true);
      try {
        await flushPendingMutations();
      } finally {
        setIsSyncing(false);
        const mutations = getPendingMutations();
        setPendingCount(mutations.length);
        setPendingList(mutations);
        setLastSyncTime(new Date().toLocaleTimeString());
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleQueueChanged = () => {
      const mutations = getPendingMutations();
      setPendingCount(mutations.length);
      setPendingList(mutations);
    };

    const handleSyncCompleted = () => {
      const mutations = getPendingMutations();
      setPendingCount(mutations.length);
      setPendingList(mutations);
      setLastSyncTime(new Date().toLocaleTimeString());
    };

    // PWA Install prompt listener
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
    window.addEventListener('edusphere_offline_queue_changed', handleQueueChanged);
    window.addEventListener('edusphere_sync_completed', handleSyncCompleted);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('edusphere_offline_queue_changed', handleQueueChanged);
      window.removeEventListener('edusphere_sync_completed', handleSyncCompleted);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleManualSync = async () => {
    if (!isOnline) {
      alert('Cannot sync while offline. Please connect to a network.');
      return;
    }
    setIsSyncing(true);
    try {
      await flushPendingMutations();
    } finally {
      setIsSyncing(false);
      const mutations = getPendingMutations();
      setPendingCount(mutations.length);
      setPendingList(mutations);
      setLastSyncTime(new Date().toLocaleTimeString());
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('[EduSphere PWA] User accepted installation prompt');
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* PWA Install Button (if browser offers installation) */}
        {deferredPrompt && !isInstalled && (
          <button
            type="button"
            onClick={handleInstallClick}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition animate-pulse"
            title="Install EduSphere as an Offline Desktop/Mobile App"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-200" />
            <span>Install App</span>
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
          title="Click to view Offline Storage & Synchronization Status"
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
              <span className="hidden sm:inline">Sync ({pendingCount})</span>
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

      {/* Offline Status & Sync Inspection Modal */}
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
                    Offline Operations & Sync Center
                  </h3>
                  <span className="text-xs text-slate-500">
                    Legacy School Solwezi • Local-First Architecture
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
                  {isOnline ? 'Connected to Internet' : 'Offline Mode Active'}
                </span>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {isOnline
                    ? 'All school records are in real-time sync with cloud servers. Offline cache is pre-loaded for all modules.'
                    : 'Your device is operating completely offline. All roll-calls, student lookups, and exeat passes remain 100% operational and will be safely queued locally.'}
                </p>
              </div>
            </div>

            {/* Offline Diagnostics & Stats */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">
                  Local Queue
                </span>
                <span className="font-black text-slate-900 text-lg">
                  {pendingCount} Changes Pending
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">
                  Last Cloud Sync
                </span>
                <span className="font-mono font-bold text-slate-800 text-xs">
                  {lastSyncTime ? `${lastSyncTime} CAT` : 'Pending Connection'}
                </span>
              </div>
            </div>

            {/* PWA Standalone Status */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="font-bold text-slate-800 block">App Installation Status</span>
                  <span className="text-slate-500 text-[11px]">
                    {isInstalled ? 'Installed as Standalone PWA App' : 'Running in Web Browser Mode'}
                  </span>
                </div>
              </div>
              {deferredPrompt && !isInstalled && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  Install App
                </button>
              )}
            </div>

            {/* Pending Mutations List */}
            {pendingList.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Pending Offline Operations:
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {pendingList.map((m) => (
                    <div
                      key={m.id}
                      className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-[11px] flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{m.action}</span>
                        <span className="text-slate-500 font-mono text-[9px]">{m.timestamp}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[9px]">
                        Queued
                      </span>
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
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold flex items-center gap-1.5 shadow-xs transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing Now...' : 'Force Cloud Sync'}</span>
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
