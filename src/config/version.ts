// src/config/version.ts
/**
 * North Western University College of Health and Applied Sciences (NWUCHAS-CMIS)
 * Central System Versioning & Release Metadata
 */

export interface VersionInfo {
  version: string;
  buildId: string;
  releaseDate: string;
  releaseName: string;
  environment: 'production' | 'staging' | 'development';
  institution: string;
  accreditation: string[];
  changelog: {
    version: string;
    date: string;
    title: string;
    highlights: string[];
  }[];
}

export const SYSTEM_VERSION: VersionInfo = {
  version: 'v2.4.0',
  buildId: 'NWU-CMIS-2026.10-PROD',
  releaseDate: '2026-10-27',
  releaseName: 'Enterprise Hardening & Statutory Governance Release',
  environment: 'production',
  institution: 'North Western University College of Health and Applied Sciences',
  accreditation: [
    'Nursing and Midwifery Council of Zambia (NMCZ)',
    'Health Professions Council of Zambia (HPCZ)',
    'Higher Education Authority (HEA)',
    'Teaching Council of Zambia (TCZ)',
  ],
  changelog: [
    {
      version: 'v2.4.0',
      date: '2026-10-27',
      title: 'Enterprise Security Hardening, Inactivity Auto-Lock & HR Suite',
      highlights: [
        'Removed all mock demo applicant access chips and shortcuts for clean production operations',
        'Added configurable inactivity security auto-lock (15s, 30s, 45s, 60s, 5m, 10m, 15m, 30m)',
        'Implemented Quick PIN Setup and fast re-authentication for clinical & campus workstations',
        'Enhanced HR Console with Statutory Council Licensure Tracking (NMCZ/HPCZ/TCZ) and Leave Management',
        'Unified ECZ O-Level subject results parsing and real-time statutory 5-credit criteria validation',
        'Added interactive Document Verification modal with auditable sign-offs and status tracking',
        'Introduced institutional Notification Center and centralized audit logging',
      ],
    },
    {
      version: 'v2.3.0',
      date: '2026-10-25',
      title: 'Double-Entry Financial Ledger & Mobile Money Collections',
      highlights: [
        'Integrated Airtel Money & MTN Mobile Money collections and statement reconciliations',
        'Enforced real-time double-entry student fee accounting and fee concession allocations',
        'Automatic provisioning of system user accounts for all staff members',
      ],
    },
    {
      version: 'v2.0.0',
      date: '2026-10-15',
      title: 'Separation of Powers & Statutory Indexing Portals',
      highlights: [
        'Separation of Powers between Admissions Registry, Finance Treasury, and Academic Senate',
        'Statutory student indexing and quota enforcement for NMCZ and HPCZ programs',
      ],
    },
    {
      version: 'v1.0.0',
      date: '2026-09-01',
      title: 'Core College Management Information System (CMIS) Launch',
      highlights: [
        'Initial deployment of NWUCHAS student records, course catalog, and campus facilities',
      ],
    },
  ],
};
