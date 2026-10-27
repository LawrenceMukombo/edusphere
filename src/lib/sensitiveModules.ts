// NWUCHAS CMIS — Sensitive Modules Classification & Security Policies
// Identifies operational modules and API routes that require elevated Two-Factor Authentication (2FA/MFA)

export interface SensitiveModulePolicy {
  slug: string;
  name: string;
  category: 'FINANCE' | 'ASSETS' | 'STUDENT_PII' | 'STAFF_HR' | 'GOVERNANCE';
  description: string;
  requiredRole?: string[];
  mfaReason: string;
  regulatoryReference: string;
}

export const SENSITIVE_MODULE_POLICIES: Record<string, SensitiveModulePolicy> = {
  finance: {
    slug: 'finance',
    name: 'Finance & Student Fee Ledger',
    category: 'FINANCE',
    description: 'Student fee invoicing, bank reconciliation, cash collections, and double-entry general ledgers.',
    mfaReason: 'Financial integrity, treasury controls, and anti-fraud statutory compliance (PACRA / ZRA).',
    regulatoryReference: 'Public Finance Management Act & HEA Institutional Financial Standards',
  },
  payments: {
    slug: 'payments',
    name: 'Payment Orchestration & Gateways',
    category: 'FINANCE',
    description: 'Direct mobile money and bank deposit allocation controls.',
    mfaReason: 'Treasury transaction security and sequential audit trail verification.',
    regulatoryReference: 'Bank of Zambia National Payment Systems Regulations',
  },
  assets: {
    slug: 'assets',
    name: 'Institutional Asset Register',
    category: 'ASSETS',
    description: 'Capital assets, hospital laboratory equipment, medical mannequins, and depreciation schedules.',
    mfaReason: 'Prevention of unauthorized asset disposal, physical capital audit, and loss control.',
    regulatoryReference: 'Public Procurement & Asset Disposal Act (ZPPA)',
  },
  admissions: {
    slug: 'admissions',
    name: 'Student Details & Admissions Registry',
    category: 'STUDENT_PII',
    description: 'Candidate identity documents, secondary school certificates, NRC/Passports, and student records.',
    mfaReason: 'Protection of sensitive learner Personally Identifiable Information (PII) and academic offer security.',
    regulatoryReference: 'Zambia Data Protection Act No. 3 of 2021 & HPCZ Registration Standards',
  },
  students: {
    slug: 'students',
    name: 'Student Dossiers & Academic Registry',
    category: 'STUDENT_PII',
    description: 'Official student records, clinical placements, and degree eligibility profiles.',
    mfaReason: 'Protection of learner biometric, personal, and disciplinary records.',
    regulatoryReference: 'Zambia Data Protection Act No. 3 of 2021',
  },
  hr: {
    slug: 'hr',
    name: 'Staff Details & Payroll',
    category: 'STAFF_HR',
    description: 'Faculty dossiers, medical licenses, salary disbursements, NAPSA/PAYE statutory deductions, and contracts.',
    mfaReason: 'Protection of employee personal records, remuneration confidentiality, and payroll authorization.',
    regulatoryReference: 'Employment Code Act No. 3 of 2019 & NAPSA Act',
  },
  payroll: {
    slug: 'payroll',
    name: 'Staff Payroll Preparation & Approvals',
    category: 'STAFF_HR',
    description: 'Monthly payroll runs, bank transfer schedules, and statutory remittances.',
    mfaReason: 'Dual-control disbursement security and payroll fraud prevention.',
    regulatoryReference: 'Employment Code Act & Statutory Instrument No. 48',
  },
  administration: {
    slug: 'administration',
    name: 'College Administration & Security Settings',
    category: 'GOVERNANCE',
    description: 'User accounts, role assignments, security policies, audit trails, and database backup controls.',
    mfaReason: 'Executive governance, privilege escalation prevention, and disaster recovery access.',
    regulatoryReference: 'HEA Good Governance Charter & NWUCHAS Enterprise Security Standards',
  },
  executive: {
    slug: 'executive',
    name: 'Executive Command Center',
    category: 'GOVERNANCE',
    description: 'Institutional KPIs, cash balance aggregation, student enrollment summaries, and high-level audits.',
    mfaReason: 'Executive information security and high-level financial overview access.',
    regulatoryReference: 'NWUCHAS Governing Council Executive Security Policy',
  },
};

/** Set of slugs that mandate 2FA step-up verification */
export const SENSITIVE_SLUGS = new Set<string>(Object.keys(SENSITIVE_MODULE_POLICIES));

/** Check if a module slug or pathname is sensitive */
export function isSensitiveModule(slugOrPath: string): boolean {
  if (!slugOrPath) return false;
  const clean = slugOrPath.toLowerCase().replace(/^\/modules\//, '').replace(/^\/api\//, '').replace(/^\/portal\//, '').split('/')[0];
  return SENSITIVE_SLUGS.has(clean);
}

/** Get sensitive policy for a slug or path */
export function getSensitiveModulePolicy(slugOrPath: string): SensitiveModulePolicy | undefined {
  if (!slugOrPath) return undefined;
  const clean = slugOrPath.toLowerCase().replace(/^\/modules\//, '').replace(/^\/api\//, '').replace(/^\/portal\//, '').split('/')[0];
  return SENSITIVE_MODULE_POLICIES[clean];
}
