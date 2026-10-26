import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'North Western University College of Health and Applied Sciences — CMIS',
    short_name: 'NWUCHAS CMIS',
    description:
      'Enterprise College Management Information System for North Western University College of Health and Applied Sciences (NWUCHAS), Manyama, Lumwana, Zambia.',
    start_url: '/',
    id: 'zm.edu.nwuc.cmis',
    display: 'standalone',
    background_color: '#0a192f',
    theme_color: '#007B99',
    orientation: 'portrait',
    scope: '/',
    lang: 'en-ZM',
    categories: ['education', 'productivity', 'health-sciences'],
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
    ],
    shortcuts: [
      {
        name: 'Clinical Rotations & Logbooks',
        url: '/modules/clinical-learning',
        description: 'Track hospital rotations, competencies, and clinical logbooks',
        icons: [{ src: '/icons/icon-192.svg', sizes: '192x192' }],
      },
      {
        name: 'Academic Delivery & Timetable',
        url: '/modules/academics',
        description: 'Manage tertiary programmes, course modules, and rosters',
        icons: [{ src: '/icons/icon-192.svg', sizes: '192x192' }],
      },
      {
        name: 'Student & Sponsor Portal',
        url: '/modules/parent-portal',
        description: 'View statements, results releases, and institutional notices',
        icons: [{ src: '/icons/icon-192.svg', sizes: '192x192' }],
      },
      {
        name: 'Admissions & Enrolment',
        url: '/modules/admissions',
        description: 'Review applications and process health sciences enrolment',
        icons: [{ src: '/icons/icon-192.svg', sizes: '192x192' }],
      },
    ],
  };
}
