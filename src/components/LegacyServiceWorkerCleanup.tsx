'use client';

import { useEffect } from 'react';

/** Removes inherited EduSphere offline caches so the NWUCHAS portal is not served stale school UI. */
export function LegacyServiceWorkerCleanup() {
  useEffect(() => {
    void navigator.serviceWorker?.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => void registration.unregister());
    });
    void caches?.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))));
  }, []);

  return null;
}
