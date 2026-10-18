// src/lib/offlineSync.ts — Client-Side Offline Storage & Synchronization Engine for EduSphere
'use client';

export interface OfflineMutation {
  id: string;
  timestamp: string;
  action: 'UPDATE_ATTENDANCE' | 'MOBILE_MONEY_PAYMENT' | 'ISSUE_EXEAT' | 'UPDATE_EXEAT' | 'SETTLE_FEE';
  entityType: 'ATTENDANCE' | 'BOARDING' | 'FINANCE' | 'STUDENT';
  payload: any;
  retryCount: number;
  synced: boolean;
}

export interface OfflineSyncStatus {
  isOnline: boolean;
  pendingCount: number;
  lastSyncTime: string | null;
  syncInProgress: boolean;
}

const DB_NAME = 'edusphere_offline_db';
const DB_VERSION = 1;
const MUTATIONS_KEY = 'edusphere_pending_mutations_v1';
const CACHE_PREFIX = 'edusphere_offline_cache_';

// Check if IndexedDB is available in the current environment
const hasIndexedDB = typeof window !== 'undefined' && 'indexedDB' in window;

/**
 * Open or initialize the EduSphere IndexedDB database
 */
export function openEduSphereDB(): Promise<IDBDatabase | null> {
  if (!hasIndexedDB) return Promise.resolve(null);

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('rosters')) {
          db.createObjectStore('rosters', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('attendance')) {
          db.createObjectStore('attendance', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('boarding')) {
          db.createObjectStore('boarding', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('finance')) {
          db.createObjectStore('finance', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('mutations')) {
          db.createObjectStore('mutations', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn('[EduSphere Offline] IndexedDB open error, falling back to LocalStorage.');
        resolve(null);
      };
    } catch (e) {
      console.warn('[EduSphere Offline] IndexedDB initialization error:', e);
      resolve(null);
    }
  });
}

/**
 * Cache data offline (IndexedDB + LocalStorage redundancy)
 */
export async function cacheOfflineRecord<T>(storeName: string, id: string, data: T): Promise<void> {
  if (typeof window === 'undefined') return;

  // LocalStorage fallback for high resilience
  try {
    const key = `${CACHE_PREFIX}${storeName}_${id}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('[EduSphere Offline] LocalStorage write failed:', err);
  }

  // IndexedDB write
  try {
    const db = await openEduSphereDB();
    if (!db) return;
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.put({ id, data, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('[EduSphere Offline] IndexedDB store write failed:', err);
  }
}

/**
 * Retrieve cached offline record
 */
export async function getOfflineRecord<T>(storeName: string, id: string): Promise<T | null> {
  if (typeof window === 'undefined') return null;

  // Try IndexedDB first
  try {
    const db = await openEduSphereDB();
    if (db) {
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
    console.warn('[EduSphere Offline] IndexedDB read error:', err);
  }

  // Fallback to LocalStorage
  try {
    const key = `${CACHE_PREFIX}${storeName}_${id}`;
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch (err) {
    console.warn('[EduSphere Offline] LocalStorage read error:', err);
  }

  return null;
}

/**
 * Enqueue an offline mutation to be synchronized when back online
 */
export function enqueueOfflineMutation(
  action: OfflineMutation['action'],
  entityType: OfflineMutation['entityType'],
  payload: any
): OfflineMutation {
  const mutation: OfflineMutation = {
    id: `MUT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    action,
    entityType,
    payload,
    retryCount: 0,
    synced: false,
  };

  try {
    const existing = getPendingMutations();
    existing.push(mutation);
    localStorage.setItem(MUTATIONS_KEY, JSON.stringify(existing));
    window.dispatchEvent(new CustomEvent('edusphere_offline_queue_changed', { detail: { count: existing.length } }));
  } catch (e) {
    console.warn('[EduSphere Offline] Failed to enqueue mutation:', e);
  }

  return mutation;
}

/**
 * Get all pending offline mutations
 */
export function getPendingMutations(): OfflineMutation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MUTATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Remove a successfully synced mutation
 */
export function removePendingMutation(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getPendingMutations().filter((m) => m.id !== id);
    localStorage.setItem(MUTATIONS_KEY, JSON.stringify(existing));
    window.dispatchEvent(new CustomEvent('edusphere_offline_queue_changed', { detail: { count: existing.length } }));
  } catch (e) {
    console.warn('[EduSphere Offline] Failed to remove mutation:', e);
  }
}

/**
 * Synchronize all pending mutations with the backend
 */
export async function flushPendingMutations(): Promise<{ syncedCount: number; errors: number }> {
  if (typeof window === 'undefined' || !navigator.onLine) {
    return { syncedCount: 0, errors: 0 };
  }

  const mutations = getPendingMutations();
  if (mutations.length === 0) return { syncedCount: 0, errors: 0 };

  console.log(`[EduSphere Offline] Attempting synchronization of ${mutations.length} offline mutations...`);
  let syncedCount = 0;
  let errors = 0;

  for (const mut of mutations) {
    try {
      let endpoint = '/api/attendance';
      if (mut.entityType === 'BOARDING') endpoint = '/api/attendance/boarding';
      if (mut.entityType === 'FINANCE') endpoint = '/api/finance/payments';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-EduSphere-Offline-Sync': 'true',
          'X-EduSphere-Mutation-Id': mut.id,
        },
        body: JSON.stringify({
          ...mut.payload,
          _offlineSyncMeta: {
            mutationId: mut.id,
            originalTimestamp: mut.timestamp,
            action: mut.action,
          },
        }),
      });

      if (response.ok) {
        removePendingMutation(mut.id);
        syncedCount++;
      } else {
        mut.retryCount++;
        errors++;
      }
    } catch (err) {
      console.warn(`[EduSphere Offline] Mutation ${mut.id} sync failed:`, err);
      mut.retryCount++;
      errors++;
    }
  }

  // Update last sync time
  localStorage.setItem('edusphere_last_sync_time', new Date().toISOString());
  window.dispatchEvent(new CustomEvent('edusphere_sync_completed', { detail: { syncedCount, errors } }));

  return { syncedCount, errors };
}
