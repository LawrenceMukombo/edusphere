'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CampusId = 'ALL' | 'MUSHITALA' | 'KANSANSHI';

export interface CampusMetadata {
  id: CampusId;
  name: string;
  code: string;
  type: string;
  address: string;
  city: string;
  capacity: number;
  enrolled: number;
  hasBoarding: boolean;
  dormitories?: string[];
  color: string;
  badge: string;
}

export const LEGACY_CAMPUSES: Record<CampusId, CampusMetadata> = {
  ALL: {
    id: 'ALL',
    name: 'All Campuses (Consolidated)',
    code: 'LSS-ALL',
    type: 'Multi-Campus Institutional Overview',
    address: 'Kansanshi Mine Road Corridor, Solwezi',
    city: 'Solwezi, North-Western Province',
    capacity: 1100,
    enrolled: 780,
    hasBoarding: true,
    dormitories: ['Mopani Boys Hall', 'Mukwa Girls Hall'],
    color: '#1e3a8a',
    badge: 'Consolidated View',
  },
  MUSHITALA: {
    id: 'MUSHITALA',
    name: 'Mushitala Day Campus',
    code: 'LSS-MDC',
    type: 'ECE & Primary Day School (Baby Class to Grade 7)',
    address: 'Stand # S/SOLWE/3177178, Kansanshi Mine Rd (opp. SGC)',
    city: 'Mushitala, Solwezi',
    capacity: 450,
    enrolled: 410,
    hasBoarding: false,
    color: '#0284c7',
    badge: 'Day Campus',
  },
  KANSANSHI: {
    id: 'KANSANSHI',
    name: 'Kansanshi Boarding Campus',
    code: 'LSS-KBC',
    type: 'Secondary & Boarding Wing (Grade 8 to 12)',
    address: 'Kansanshi Mine Road Educational Corridor',
    city: 'Solwezi, North-Western Province',
    capacity: 650,
    enrolled: 370,
    hasBoarding: true,
    dormitories: ['Mopani Boys Hall (180 beds)', 'Mukwa Girls Hall (170 beds)'],
    color: '#4338ca',
    badge: 'Secondary & Boarding',
  },
};

interface CampusContextType {
  selectedCampus: CampusId;
  setSelectedCampus: (campus: CampusId) => void;
  campusInfo: CampusMetadata;
  allCampuses: CampusMetadata[];
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export function CampusProvider({ children }: { children: ReactNode }) {
  const [selectedCampus, setSelectedCampusState] = useState<CampusId>('ALL');

  useEffect(() => {
    const saved = localStorage.getItem('edusphere_selected_campus') as CampusId;
    if (saved && (saved === 'ALL' || saved === 'MUSHITALA' || saved === 'KANSANSHI')) {
      setSelectedCampusState(saved);
    }
  }, []);

  const setSelectedCampus = (campus: CampusId) => {
    setSelectedCampusState(campus);
    localStorage.setItem('edusphere_selected_campus', campus);
  };

  const campusInfo = LEGACY_CAMPUSES[selectedCampus];
  const allCampuses = [
    LEGACY_CAMPUSES.ALL,
    LEGACY_CAMPUSES.MUSHITALA,
    LEGACY_CAMPUSES.KANSANSHI,
  ];

  return (
    <CampusContext.Provider
      value={{
        selectedCampus,
        setSelectedCampus,
        campusInfo,
        allCampuses,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  const context = useContext(CampusContext);
  if (!context) {
    throw new Error('useCampus must be used within a CampusProvider');
  }
  return context;
}
