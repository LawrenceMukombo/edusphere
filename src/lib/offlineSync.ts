// src/lib/offlineSync.ts — NWUCHAS CMIS Secure Offline-First IndexedDB Engine & Sync Manager
'use client';

export type OfflineOperationStatus =
  | 'QUEUED'
  | 'SYNCHRONISING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CONFLICTED'
  | 'BLOCKED';

export type PermittedOfflineAction =
  | 'CAPTURE_ATTENDANCE'
  | 'DRAFT_CLINICAL_LOGBOOK'
  | 'RECORD_HOSTEL_ROLLCALL';

/** Strictly enforced policy table: online-only vs potentially offline-capable */
export const OFFLINE_ELIGIBILITY_POLICY = {
  PERMITTED_OFFLINE: [
    'CAPTURE_ATTENDANCE',
    'DRAFT_CLINICAL_LOGBOOK',
    'RECORD_HOSTEL_ROLLCALL',
  ] as const,
  ONLINE_ONLY: [
    'MOBILE_MONEY_PAYMENT',
    'SETTLE_FEE',
    'POST_JOURNAL',
    'PROCESS_PAYROLL',
    'APPROVE_LEAVE',
    'RELEASE_RESULTS',
    'GENERATE_OFFICIAL_TRANSCRIPT',
    'CREATE_USER',
    'ASSIGN_ROLES',
    'DELETE_RECORD',
  ] as const,
};

export interface OfflineCommand {
  operationId: string; // Immutable UUID
  idempotencyKey: string;
  correlationId: string;
  actorId?: string;
  action: PermittedOfflineAction;
  entityType: 'ATTENDANCE' | 'CLINICAL' | 'HOSTEL';
  payload: any;
  status: OfflineOperationStatus;
  retryCount: number;
  maxRetries: number;
  createdAt: string; // ISO String
  lastAttemptAt?: string;
  errorMessage?: string;
}

export interface OfflineSyncStatus {
  isOnline: boolean;
  pendingCount: number;
  lastSyncTime: string | null;
  syncInProgress: boolean;
}

const DB_NAME = 'nwuchas_cmis_offline_db';
const DB_VERSION = 2;
const MUTATIONS_KEY = 'nwuchas_offline_pending_commands_v2';
const CACHE_PREFIX = 'nwuchas_offline_cache_';
const LAST_SYNC_KEY = 'nwuchas_last_sync_time';

let memoryQueue: OfflineCommand[] = [];

function savePendingCommands(commands: OfflineCommand[]): void {
  memoryQueue = commands;
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(MUTATIONS_KEY, JSON.stringify(commands));
    } catch (e) {
      console.warn('[NWUCHAS Offline] LocalStorage write failed:', e);
    }
  }
}

const hasIndexedDB = typeof window !== 'undefined' && 'indexedDB' in window;

/**
 * Open or initialize the NWUCHAS CMIS IndexedDB database
 */
export function openNwuchasDB(): Promise<IDBDatabase | null> {
  if (!hasIndexedDB) return Promise.resolve(null);

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('commands')) {
          db.createObjectStore('commands', { keyPath: 'operationId' });
        }
        if (!db.objectStoreNames.contains('rosters')) {
          db.createObjectStore('rosters', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('clinical_drafts')) {
          db.createObjectStore('clinical_drafts', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn('[NWUCHAS Offline] IndexedDB open failed; utilizing local storage fallback.');
        resolve(null);
      };
    } catch (e) {
      console.warn('[NWUCHAS Offline] IndexedDB initialization error:', e);
      resolve(null);
    }
  });
}

export { openNwuchasDB as openEduSphereDB };
export type { OfflineCommand as OfflineMutation };

/**
 * Cache least-privilege read model data locally
 */
export async function cacheOfflineRecord<T>(storeName: string, id: string, data: T): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const key = `${CACHE_PREFIX}${storeName}_${id}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('[NWUCHAS Offline] LocalStorage write failed:', err);
  }

  try {
    const db = await openNwuchasDB();
    if (!db) return;
    if (db.objectStoreNames.contains(storeName)) {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put({ id, data, updatedAt: new Date().toISOString() });
    }
  } catch (err) {
    console.warn('[NWUCHAS Offline] IndexedDB cache write failed:', err);
  }
}

/**
 * Retrieve cached offline read record
 */
export async function getOfflineRecord<T>(storeName: string, id: string): Promise<T | null> {
  if (typeof window === 'undefined') return null;

  try {
    const db = await openNwuchasDB();
    if (db && db.objectStoreNames.contains(storeName)) {
      const record = await new Promise<any>((resolve) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result ? req.result.data : null);
        req.onerror = () => resolve(null);
      });
      if (record) return record as T;
    }
  } catch (err) {
    console.warn('[NWUCHAS Offline] IndexedDB read error:', err);
  }

  try {
    const key = `${CACHE_PREFIX}${storeName}_${id}`;
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch (err) {
    console.warn('[NWUCHAS Offline] LocalStorage read error:', err);
  }

  return null;
}

/**
 * Enqueue an offline command with policy verification, immutable ID, and idempotency key
 */
export function enqueueOfflineMutation(
  action: string,
  entityType: 'ATTENDANCE' | 'CLINICAL' | 'HOSTEL',
  payload: any,
  actorId?: string
): OfflineCommand {
  // 1. Strict Eligibility Gate
  const isPermitted = OFFLINE_ELIGIBILITY_POLICY.PERMITTED_OFFLINE.includes(action as any);
  if (!isPermitted) {
    throw new Error(
      `Action "${action}" is designated ONLINE-ONLY under NWUCHAS CMIS offline policy. ` +
      `Financial transactions, payroll, credentials, and sensitive results release cannot be queued offline.`
    );
  }

  const timestamp = new Date().toISOString();
  const randomSuffix = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  const operationId = `NWU-OP-${Date.now()}-${randomSuffix}`;
  const idempotencyKey = `IDEMP-${operationId}`;
  const correlationId = `CORR-${Date.now()}-${randomSuffix}`;

  const command: OfflineCommand = {
    operationId,
    idempotencyKey,
    correlationId,
    actorId,
    action: action as PermittedOfflineAction,
    entityType,
    payload,
    status: 'QUEUED',
    retryCount: 0,
    maxRetries: 5,
    createdAt: timestamp,
  };

  try {
    const existing = getPendingMutations();
    existing.push(command);
    savePendingCommands(existing);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('nwuchas_offline_queue_changed', { detail: { count: existing.length } })
      );
    }

    // Also persist to IndexedDB commands store asynchronously
    openNwuchasDB().then((db) => {
      if (!db) return;
      const tx = db.transaction('commands', 'readwrite');
      tx.objectStore('commands').put(command);
    }).catch(() => {});
  } catch (e) {
    console.warn('[NWUCHAS Offline] Failed to enqueue offline command:', e);
  }

  return command;
}

/**
 * Retrieve all pending offline commands
 */
export function getPendingMutations(): OfflineCommand[] {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(MUTATIONS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
  }
  return [...memoryQueue];
}

/**
 * Remove an acknowledged, accepted command from the pending queue
 */
export function removePendingMutation(operationId: string): void {
  try {
    const existing = getPendingMutations().filter((m) => m.operationId !== operationId);
    savePendingCommands(existing);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('nwuchas_offline_queue_changed', { detail: { count: existing.length } })
      );
    }

    openNwuchasDB().then((db) => {
      if (!db) return;
      const tx = db.transaction('commands', 'readwrite');
      tx.objectStore('commands').delete(operationId);
    }).catch(() => {});
  } catch (e) {
    console.warn('[NWUCHAS Offline] Failed to remove pending command:', e);
  }
}

/**
 * Synchronize all pending commands with server validation
 */
export async function flushPendingMutations(): Promise<{ syncedCount: number; errors: number }> {
  if (typeof window === 'undefined' || !navigator.onLine) {
    return { syncedCount: 0, errors: 0 };
  }

  const commands = getPendingMutations();
  if (commands.length === 0) return { syncedCount: 0, errors: 0 };

  console.log(`[NWUCHAS Offline] Reconciling ${commands.length} offline operations with server...`);
  let syncedCount = 0;
  let errors = 0;

  for (const cmd of commands) {
    try {
      cmd.status = 'SYNCHRONISING';
      cmd.lastAttemptAt = new Date().toISOString();

      let endpoint = '/api/attendance';
      if (cmd.entityType === 'HOSTEL') endpoint = '/api/attendance/boarding';
      if (cmd.entityType === 'CLINICAL') endpoint = '/api/clinical/logbook';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-NWUCHAS-Offline-Sync': 'true',
          'X-NWUCHAS-Operation-Id': cmd.operationId,
          'X-NWUCHAS-Idempotency-Key': cmd.idempotencyKey,
        },
        body: JSON.stringify({
          ...cmd.payload,
          _offlineMetadata: {
            operationId: cmd.operationId,
            idempotencyKey: cmd.idempotencyKey,
            correlationId: cmd.correlationId,
            createdAt: cmd.createdAt,
            action: cmd.action,
          },
        }),
      });

      if (response.ok) {
        removePendingMutation(cmd.operationId);
        syncedCount++;
      } else {
        const errPayload = await response.json().catch(() => ({}));
        cmd.status = response.status === 409 ? 'CONFLICTED' : 'REJECTED';
        cmd.errorMessage = errPayload.message || `Server returned HTTP ${response.status}`;
        cmd.retryCount++;
        errors++;
      }
    } catch (err: any) {
      console.warn(`[NWUCHAS Offline] Operation ${cmd.operationId} transmission error:`, err);
      cmd.status = 'QUEUED';
      cmd.retryCount++;
      cmd.errorMessage = err.message || 'Network transport failure';
      errors++;
    }
  }

  // Update last sync time
  const syncTime = new Date().toISOString();
  localStorage.setItem(LAST_SYNC_KEY, syncTime);
  window.dispatchEvent(
    new CustomEvent('nwuchas_sync_completed', { detail: { syncedCount, errors, timestamp: syncTime } })
  );

  return { syncedCount, errors };
}
