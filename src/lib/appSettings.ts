// src/lib/appSettings.ts
// Comprehensive System Administration & Module Configuration Store for EduSphere / Legacy School Solwezi
'use client';

export interface ModuleConfig {
  id: string;
  name: string;
  category: 'CORE' | 'OPERATIONS' | 'FINANCE' | 'ACADEMICS' | 'COMPLIANCE';
  description: string;
  enabled: boolean;
  operationalMode: string;
  lastUpdated: string;
  updatedBy: string;
  settings: Record<string, any>;
}

export interface AppSettings {
  // Institutional Profile
  institution: {
    name: string;
    officialName: string;
    code: string;
    motto: string;
    address: string;
    city: string;
    province: string;
    country: string;
    primaryPhone: string;
    officialEmail: string;
    taxNumber: string;
    activeTerm: string;
    activeAcademicYear: string;
    currentWeek: number;
  };

  // Modules Configuration
  modules: {
    attendance: {
      enabled: boolean;
      blockFutureMonths: boolean;
      strictDateValidation: boolean;
      moeForm12AThreshold: number; // e.g. 80%
      rollCallDeadline: string; // '08:30'
      autoSmsAbsentees: boolean;
      allowRetroactiveCorrectionDays: number;
    };
    fees: {
      enabled: boolean;
      autoLockRegisterOnArrears: boolean;
      arrearsGracePeriodDays: number;
      mobileMoneyDirectUnlock: boolean;
      allowPartialInstallments: boolean;
      defaultCurrency: string;
      mobileMoneyWebhooksActive: boolean;
    };
    boarding: {
      enabled: boolean;
      curfewTime: string; // '20:30'
      requireMultiSignoffExeat: boolean;
      headcountAuditRequired: boolean;
      visitorCheckInRequired: boolean;
      maxExeatDaysAllowed: number;
    };
    academics: {
      enabled: boolean;
      moderationTiers: number; // 3 tiers
      caWeightPercent: number; // 40%
      examWeightPercent: number; // 60%
      autoDispatchReportCards: boolean;
      eczGradingScaleEnforced: boolean;
    };
    sis: {
      enabled: boolean;
      strictAgeValidation: boolean;
      studentIdMask: string;
      enrolmentCapAlert: boolean;
      requireNationalNrcOrBirthCert: boolean;
    };
    hr: {
      enabled: boolean;
      tczExpiryWarningDays: number;
      requireTczCompliance: boolean;
      monthlyLeaveAccrual: number;
      biometricClockInToleranceMins: number;
    };
    gis: {
      enabled: boolean;
      liveGpsTrackingIntervalSec: number;
      mushitalaGeofenceRadiusM: number;
      busSpeedAlertKmh: number;
      sosEmergencyAlerts: boolean;
    };
    parentPortal: {
      enabled: boolean;
      allowMobileMoneyCheckout: boolean;
      requireVerifiedPhone: boolean;
      showTermRankings: boolean;
      whatsappAlerts: boolean;
    };
  };

  // Campuses Infrastructure
  campuses: {
    mushitala: {
      name: string;
      code: string;
      capacity: number;
      enrolled: number;
      boardingCapacity: number;
      generatorCapacityKva: number;
      starlinkFailoverEnabled: boolean;
      waterReserveLiters: number;
    };
    urban: {
      name: string;
      code: string;
      capacity: number;
      enrolled: number;
      shiftMode: 'SINGLE_SHIFT' | 'DOUBLE_SHIFT';
      solarInverterCapacityKva: number;
      trafficWardenOnDuty: boolean;
    };
  };

  // Financial Gateways
  financialGateways: {
    mtnMoMo: {
      enabled: boolean;
      merchantCode: string;
      accountName: string;
      autoReconcile: boolean;
    };
    airtelMoney: {
      enabled: boolean;
      paybillNumber: string;
      accountName: string;
      autoReconcile: boolean;
    };
    zamtelKwacha: {
      enabled: boolean;
      merchantId: string;
      accountName: string;
      autoReconcile: boolean;
    };
    bankAccount: {
      bankName: string;
      accountNumber: string;
      branch: string;
      swiftCode: string;
    };
  };

  // Statutory MoE & ECZ Compliance
  compliance: {
    moeRegistrationNumber: string;
    eczCentreCode: string;
    solweziDebsInspectorCode: string;
    retentionYears: number;
    auditLogArchiveEnabled: boolean;
    dataProtectionOfficer: string;
    lastExternalAuditDate: string;
  };
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  institution: {
    name: 'Legacy School Solwezi',
    officialName: 'Legacy School Solwezi Limited',
    code: 'EDS-ZM-SOL-001',
    motto: 'We strive for your academic and moral excellence',
    address: 'Stand # S/SOLWE/3177178, Kansanshi Mine Road (opp. SGC Filling Station), Mushitala',
    city: 'Solwezi',
    province: 'North-Western Province',
    country: 'Zambia',
    primaryPhone: '+260 974 371271',
    officialEmail: 'legacyschool208@gmail.com',
    taxNumber: '1008492019',
    activeTerm: '2026 Term 1',
    activeAcademicYear: '2026',
    currentWeek: 8,
  },
  modules: {
    attendance: {
      enabled: true,
      blockFutureMonths: true,
      strictDateValidation: true,
      moeForm12AThreshold: 80,
      rollCallDeadline: '08:30',
      autoSmsAbsentees: true,
      allowRetroactiveCorrectionDays: 3,
    },
    fees: {
      enabled: true,
      autoLockRegisterOnArrears: true,
      arrearsGracePeriodDays: 5,
      mobileMoneyDirectUnlock: true,
      allowPartialInstallments: true,
      defaultCurrency: 'ZMW',
      mobileMoneyWebhooksActive: true,
    },
    boarding: {
      enabled: true,
      curfewTime: '20:30',
      requireMultiSignoffExeat: true,
      headcountAuditRequired: true,
      visitorCheckInRequired: true,
      maxExeatDaysAllowed: 4,
    },
    academics: {
      enabled: true,
      moderationTiers: 3,
      caWeightPercent: 40,
      examWeightPercent: 60,
      autoDispatchReportCards: true,
      eczGradingScaleEnforced: true,
    },
    sis: {
      enabled: true,
      strictAgeValidation: true,
      studentIdMask: 'LSS-YYYY-XXXX',
      enrolmentCapAlert: true,
      requireNationalNrcOrBirthCert: true,
    },
    hr: {
      enabled: true,
      tczExpiryWarningDays: 60,
      requireTczCompliance: true,
      monthlyLeaveAccrual: 2,
      biometricClockInToleranceMins: 15,
    },
    gis: {
      enabled: true,
      liveGpsTrackingIntervalSec: 15,
      mushitalaGeofenceRadiusM: 350,
      busSpeedAlertKmh: 60,
      sosEmergencyAlerts: true,
    },
    parentPortal: {
      enabled: true,
      allowMobileMoneyCheckout: true,
      requireVerifiedPhone: true,
      showTermRankings: true,
      whatsappAlerts: true,
    },
  },
  campuses: {
    mushitala: {
      name: 'Mushitala Campus (Near Kansanshi)',
      code: 'LSS-MSC',
      capacity: 650,
      enrolled: 420,
      boardingCapacity: 350,
      generatorCapacityKva: 250,
      starlinkFailoverEnabled: true,
      waterReserveLiters: 50000,
    },
    urban: {
      name: 'Urban Campus (Solwezi Central)',
      code: 'LSS-URB',
      capacity: 350,
      enrolled: 240,
      shiftMode: 'SINGLE_SHIFT',
      solarInverterCapacityKva: 15,
      trafficWardenOnDuty: true,
    },
  },
  financialGateways: {
    mtnMoMo: {
      enabled: true,
      merchantCode: 'MOMO-SOL-8890',
      accountName: 'Legacy School Solwezi Ltd',
      autoReconcile: true,
    },
    airtelMoney: {
      enabled: true,
      paybillNumber: '998822',
      accountName: 'Legacy School Mushitala',
      autoReconcile: true,
    },
    zamtelKwacha: {
      enabled: true,
      merchantId: 'ZM-KW-31771',
      accountName: 'Legacy School Central',
      autoReconcile: true,
    },
    bankAccount: {
      bankName: 'Zambia National Commercial Bank (Zanaco)',
      accountNumber: '5677890123412',
      branch: 'Solwezi Branch',
      swiftCode: 'ZNCOZMLU',
    },
  },
  compliance: {
    moeRegistrationNumber: 'MOE/NWP/SOL/SEC/2026/044',
    eczCentreCode: 'ECZ/CENTRE/044/SOL',
    solweziDebsInspectorCode: 'SOL-DEBS-INSP-2026',
    retentionYears: 7,
    auditLogArchiveEnabled: true,
    dataProtectionOfficer: 'Mr. Emmanuel Mwansa (Principal)',
    lastExternalAuditDate: '2026-02-14',
  },
};

const SETTINGS_STORAGE_KEY = 'edusphere_app_settings_v2';
const AUDIT_LOG_STORAGE_KEY = 'edusphere_admin_audit_logs_v1';

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  adminName: string;
  action: string;
  module: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  ipAddress: string;
}

export const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'aud-001',
    timestamp: '2026-10-18 17:42:10 CAT',
    adminName: 'Mr. Emmanuel Mwansa (Principal)',
    action: 'POLICY_UPDATE',
    module: 'Attendance & Operations',
    details: 'Enforced strict future months lock and Form 12A MoE 80% threshold verification.',
    status: 'SUCCESS',
    ipAddress: '192.168.10.4 (Mushitala Admin VLAN)',
  },
  {
    id: 'aud-002',
    timestamp: '2026-10-18 16:15:33 CAT',
    adminName: 'Bursar & Finance Office',
    action: 'GATEWAY_CONFIG',
    module: 'Fees & Arrears Engine',
    details: 'Configured MTN MoMo and Airtel Money instant payment reconciliation & auto-unlock rule.',
    status: 'SUCCESS',
    ipAddress: '192.168.10.8 (Finance Office)',
  },
  {
    id: 'aud-003',
    timestamp: '2026-10-18 14:02:18 CAT',
    adminName: 'Mr. Emmanuel Mwansa (Principal)',
    action: 'INFRASTRUCTURE_AUDIT',
    module: 'Mushitala Boarding Wing',
    details: 'Verified 250kVA standby diesel generator failover switch and water storage capacity.',
    status: 'SUCCESS',
    ipAddress: '192.168.10.4 (Mushitala Admin VLAN)',
  },
  {
    id: 'aud-004',
    timestamp: '2026-10-18 11:30:45 CAT',
    adminName: 'Academic Supervisor',
    action: 'ACADEMIC_MODERATION',
    module: 'Academics & continuous assessment',
    details: 'Activated 3-tier moderation lock: Teacher mark entry -> Supervisor endorsement -> Principal sign-off.',
    status: 'SUCCESS',
    ipAddress: '192.168.20.12 (Staffroom Terminal 3)',
  },
  {
    id: 'aud-005',
    timestamp: '2026-10-17 09:12:00 CAT',
    adminName: 'DEBS External Inspector',
    action: 'STATUTORY_INSPECTION',
    module: 'MoE Statutory Audit',
    details: 'Accessed read-only Form 12A register using inspector code SOL-DEBS-INSP-2026.',
    status: 'SUCCESS',
    ipAddress: '41.216.88.19 (MoE Solwezi DEBS Network)',
  },
];

export function loadAppSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_APP_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_APP_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_APP_SETTINGS, ...parsed };
  } catch (err) {
    console.warn('[AppSettings] Error loading local settings, using default:', err);
    return DEFAULT_APP_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings, logAction?: string, moduleName?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));

    if (logAction) {
      const logs = loadAdminAuditLogs();
      const newLog: AdminAuditLog = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' CAT',
        adminName: 'Mr. Emmanuel Mwansa (Principal)',
        action: 'UPDATE_CONFIG',
        module: moduleName || 'System Settings',
        details: logAction,
        status: 'SUCCESS',
        ipAddress: '127.0.0.1 (Local Session)',
      };
      saveAdminAuditLogs([newLog, ...logs.slice(0, 49)]);
    }
  } catch (err) {
    console.warn('[AppSettings] Error saving settings to localStorage:', err);
  }
}

export function resetAppSettings(): AppSettings {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    } catch {}
  }
  return DEFAULT_APP_SETTINGS;
}

export function loadAdminAuditLogs(): AdminAuditLog[] {
  if (typeof window === 'undefined') return INITIAL_AUDIT_LOGS;
  try {
    const raw = localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
    if (!raw) return INITIAL_AUDIT_LOGS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_AUDIT_LOGS;
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
}

export function saveAdminAuditLogs(logs: AdminAuditLog[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(logs));
  } catch (err) {
    console.warn('[AppSettings] Error saving audit logs:', err);
  }
}
