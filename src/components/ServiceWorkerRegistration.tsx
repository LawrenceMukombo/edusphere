// src/components/ServiceWorkerRegistration.tsx — Auto-registers EduSphere Service Worker
'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[EduSphere] ServiceWorker registered with scope:', registration.scope);

            // Periodic updates check
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      console.log('[EduSphere] New offline content is available; please refresh.');
                    } else {
                      console.log('[EduSphere] Content is cached for offline use.');
                    }
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.warn('[EduSphere] ServiceWorker registration failed:', error);
          });
      });
    }
  }, []);

  return null;
}
