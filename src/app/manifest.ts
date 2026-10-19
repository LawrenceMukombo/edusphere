import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Legacy School Solwezi — EduSphere SMIS Enterprise',
    short_name: 'EduSphere',
    description:
      'Zambia-first, enterprise-grade, offline-first School Management Information System for Legacy School Solwezi.',
    start_url: '/',
    id: 'com.legacyschool.edusphere',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#1e3a8a',
    orientation: 'portrait',
    scope: '/',
    lang: 'en-ZM',
    categories: ['education', 'productivity', 'finance'],
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
    shortcuts: [
      {
        name: 'Attendance & Roll-Call',
        url: '/attendance',
        description: 'Conduct live roll-call and exeat gate passes',
        icons: [{ src: '/icons/icon-192.svg', sizes: '192x192' }],
      },
      {
        name: 'Boarding Houses & Village',
        url: '/boarding',
        description: 'Manage 318 dormitory beds and student 360 dossiers',
        icons: [{ src: '/icons/icon-192.svg', sizes: '192x192' }],
      },
      {
        name: 'Fee Ledger & Payments',
        url: '/finance',
        description: 'Record fees, receipts and operational expenses',
        icons: [{ src: '/icons/icon-192.svg', sizes: '192x192' }],
      },
      {
        name: 'Admissions & SIS',
        url: '/admissions',
        description: 'Admit new learners and generate official letters',
        icons: [{ src: '/icons/icon-192.svg', sizes: '192x192' }],
      },
    ],
  };
}
