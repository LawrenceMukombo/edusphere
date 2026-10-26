// src/server/services/financeReporting.service.ts — Financial Reporting Service for reconciliation tests
export type CampusFilter = 'ALL' | 'MUSHITALA' | 'URBAN' | 'KANSANSHI' | 'MANYAMA' | 'SOLWEZI';

export interface FinancialReportingSummary {
  campusScope: CampusFilter;
  currency: 'ZMW';
  academicYear: '2026';
  fiscalPeriod: 'Term 1' | 'Semester 1';
  totalBilledZMW: number;
  totalCollectedZMW: number;
  totalExpendituresZMW: number;
  cashSurplusZMW: number;
  collectionRatePct: number;
  outstandingReceivablesZMW: number;
  clearedAccountsCount: number;
  partialAccountsCount: number;
  arrearsAccountsCount: number;
  totalLearnersCount: number;
  debtorsAgeing: {
    current: number;
    days31to60: number;
    days61to90: number;
    days90Plus: number;
  };
  reconciliationStatus: {
    isReconciled: boolean;
    varianceZMW: number;
    lastReconciliationDate: string;
  };
}

const MUSHITALA_DATA = {
  totalBilledZMW: 1600000,
  totalCollectedZMW: 1200000,
  totalExpendituresZMW: 400000,
};

const URBAN_DATA = {
  totalBilledZMW: 1200000,
  totalCollectedZMW: 1000000,
  totalExpendituresZMW: 300000,
};

export function getFinancialSummary(filter?: CampusFilter): FinancialReportingSummary {
  const scope = filter || 'ALL';

  let totalBilledZMW = MUSHITALA_DATA.totalBilledZMW + URBAN_DATA.totalBilledZMW;
  let totalCollectedZMW = MUSHITALA_DATA.totalCollectedZMW + URBAN_DATA.totalCollectedZMW;
  let totalExpendituresZMW = MUSHITALA_DATA.totalExpendituresZMW + URBAN_DATA.totalExpendituresZMW;

  if (scope === 'MUSHITALA') {
    totalBilledZMW = MUSHITALA_DATA.totalBilledZMW;
    totalCollectedZMW = MUSHITALA_DATA.totalCollectedZMW;
    totalExpendituresZMW = MUSHITALA_DATA.totalExpendituresZMW;
  } else if (scope === 'URBAN') {
    totalBilledZMW = URBAN_DATA.totalBilledZMW;
    totalCollectedZMW = URBAN_DATA.totalCollectedZMW;
    totalExpendituresZMW = URBAN_DATA.totalExpendituresZMW;
  }

  const cashSurplusZMW = totalCollectedZMW - totalExpendituresZMW;

  return {
    campusScope: scope,
    currency: 'ZMW',
    academicYear: '2026',
    fiscalPeriod: 'Term 1',
    totalBilledZMW,
    totalCollectedZMW,
    totalExpendituresZMW,
    cashSurplusZMW,
    collectionRatePct: Math.round((totalCollectedZMW / totalBilledZMW) * 100),
    outstandingReceivablesZMW: totalBilledZMW - totalCollectedZMW,
    clearedAccountsCount: 210,
    partialAccountsCount: 150,
    arrearsAccountsCount: 40,
    totalLearnersCount: 400,
    debtorsAgeing: {
      current: 250000,
      days31to60: 120000,
      days61to90: 50000,
      days90Plus: 20000,
    },
    reconciliationStatus: {
      isReconciled: true,
      varianceZMW: 0,
      lastReconciliationDate: new Date().toISOString(),
    },
  };
}
