// src/components/ServiceWorkerRegistration.tsx — Registers NWUCHAS CMIS Production Service Worker
'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // 1. Clean up deprecated EduSphere caches
    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys
          .filter((k) => k.includes('edusphere'))
          .forEach((k) => {
            console.log('[NWUCHAS] Purging deprecated legacy cache:', k);
            caches.delete(k);
          });
      });
    }

    // 2. Register production NWUCHAS service worker
    const registerWorker = () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[NWUCHAS] ServiceWorker registered with scope:', registration.scope);
          registration.update().catch(() => {});

          registration.onupdatefound = () => {
            const installing = registration.installing;
            if (installing) {
              installing.onstatechange = () => {
                if (installing.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('[NWUCHAS] Updated application shell available; please refresh.');
                  } else {
                    console.log('[NWUCHAS] Application shell cached for honest offline use.');
                  }
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn('[NWUCHAS] ServiceWorker registration notice:', err);
        });
    };

    if (document.readyState === 'complete') {
      registerWorker();
    } else {
      window.addEventListener('load', registerWorker);
      return () => window.removeEventListener('load', registerWorker);
    }
  }, []);

  return null;
}
