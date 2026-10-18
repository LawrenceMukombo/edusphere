import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Legacy School Solwezi — EduSphere SMIS Enterprise',
    short_name: 'EduSphere',
    description:
      'Zambia-first, enterprise-grade, offline-first School Management Information System for Legacy School Solwezi.',
    start_url: '/',
    id: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#1e3a8a',
    orientation: 'any',
    icons: [
      {
        src: '/icons/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/legacy-logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
