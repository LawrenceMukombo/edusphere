'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CampusId = 'ALL' | 'MUSHITALA' | 'URBAN' | 'KANSANSHI';

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
    address: 'Kansanshi Mine Road & Urban Corridor, Solwezi',
    city: 'Solwezi, North-Western Province',
    capacity: 1100,
    enrolled: 780,
    hasBoarding: true,
    dormitories: ['Kansanshi Boys Boarding Hall (180 beds)', 'Kalumbila Girls Boarding Hall (170 beds)'],
    color: '#1e3a8a',
    badge: 'Consolidated View',
  },
  MUSHITALA: {
    id: 'MUSHITALA',
    name: 'Mushitala Campus (Near Kansanshi)',
    code: 'LSS-MSC',
    type: 'Secondary & Boarding Wing (Forms 1 to 5)',
    address: 'Stand # S/SOLWE/3177178, Kansanshi Mine Rd (opp. SGC Filling Station), Mushitala',
    city: 'Mushitala, Solwezi',
    capacity: 650,
    enrolled: 420,
    hasBoarding: true,
    dormitories: ['Kansanshi Boys Boarding Hall (180 beds)', 'Kalumbila Girls Boarding Hall (170 beds)'],
    color: '#4338ca',
    badge: 'Near Kansanshi / Boarding',
  },
  URBAN: {
    id: 'URBAN',
    name: 'Urban Campus (Solwezi Central)',
    code: 'LSS-URB',
    type: 'Early Childhood Education (ECE) & Primary Day School',
    address: 'Urban Educational Zone, Solwezi Town Center',
    city: 'Solwezi Urban, North-Western Province',
    capacity: 450,
    enrolled: 360,
    hasBoarding: false,
    color: '#0284c7',
    badge: 'ECE & Primary Day',
  },
  // Alias for backward compatibility
  KANSANSHI: {
    id: 'KANSANSHI',
    name: 'Mushitala Campus (Near Kansanshi)',
    code: 'LSS-MSC',
    type: 'Secondary & Boarding Wing (Forms 1 to 5)',
    address: 'Stand # S/SOLWE/3177178, Kansanshi Mine Rd (opp. SGC Filling Station), Mushitala',
    city: 'Mushitala, Solwezi',
    capacity: 650,
    enrolled: 420,
    hasBoarding: true,
    dormitories: ['Kansanshi Boys Boarding Hall (180 beds)', 'Kalumbila Girls Boarding Hall (170 beds)'],
    color: '#4338ca',
    badge: 'Near Kansanshi / Boarding',
  },
};

interface CampusContextType {
  selectedCampus: CampusId;
  setSelectedCampus: (campus: CampusId) => void;
  campusInfo: CampusMetadata;
  allCampuses: CampusMetadata[];
  allowedCampuses: CampusMetadata[];
  isCampusRestricted: boolean;
  userCampusId: CampusId;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export function CampusProvider({ children }: { children: ReactNode }) {
  const [selectedCampus, setSelectedCampusState] = useState<CampusId>('ALL');
  const [activeUserCampus, setActiveUserCampus] = useState<CampusId>('ALL');

  useEffect(() => {
    const syncUserAndCampus = () => {
      try {
        const raw = localStorage.getItem('edusphere_active_user_v1');
        let userCampus: CampusId = 'ALL';
        if (raw) {
          const user = JSON.parse(raw);
          if (user?.campusId) {
            userCampus = user.campusId;
          }
        }
        setActiveUserCampus(userCampus);

        // If user is restricted to a single campus, enforce that campus immediately
        if (userCampus !== 'ALL') {
          setSelectedCampusState(userCampus);
          localStorage.setItem('edusphere_selected_campus', userCampus);
        } else {
          // If user has multi-campus access, respect previous selection or default to ALL
          const saved = localStorage.getItem('edusphere_selected_campus') as CampusId;
          if (saved && (saved === 'ALL' || saved === 'MUSHITALA' || saved === 'URBAN' || saved === 'KANSANSHI')) {
            setSelectedCampusState(saved);
          } else {
            setSelectedCampusState('ALL');
          }
        }
      } catch (e) {
        console.error('Error syncing user campus scope', e);
      }
    };

    syncUserAndCampus();
    window.addEventListener('edusphere:user-updated', syncUserAndCampus);
    window.addEventListener('storage', syncUserAndCampus);
    return () => {
      window.removeEventListener('edusphere:user-updated', syncUserAndCampus);
      window.removeEventListener('storage', syncUserAndCampus);
    };
  }, []);

  const setSelectedCampus = (campus: CampusId) => {
    // If user is restricted to a specific campus, reject switching outside their campus
    if (activeUserCampus !== 'ALL' && campus !== activeUserCampus) {
      return;
    }
    setSelectedCampusState(campus);
    localStorage.setItem('edusphere_selected_campus', campus);
  };

  const campusInfo = LEGACY_CAMPUSES[selectedCampus] || LEGACY_CAMPUSES.ALL;
  const allCampuses = [
    LEGACY_CAMPUSES.ALL,
    LEGACY_CAMPUSES.MUSHITALA,
    LEGACY_CAMPUSES.URBAN,
  ];

  // Dynamically compute campuses visible to the active user
  const allowedCampuses = activeUserCampus === 'ALL'
    ? allCampuses
    : activeUserCampus === 'MUSHITALA' || activeUserCampus === 'KANSANSHI'
    ? [LEGACY_CAMPUSES.MUSHITALA]
    : [LEGACY_CAMPUSES.URBAN];

  return (
    <CampusContext.Provider
      value={{
        selectedCampus,
        setSelectedCampus,
        campusInfo,
        allCampuses,
        allowedCampuses,
        isCampusRestricted: activeUserCampus !== 'ALL',
        userCampusId: activeUserCampus,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  const context = useContext(CampusContext);
  if (!context) {
    const campusInfo = LEGACY_CAMPUSES.ALL;
    const allCampuses = [LEGACY_CAMPUSES.ALL, LEGACY_CAMPUSES.MUSHITALA, LEGACY_CAMPUSES.URBAN];
    return {
      selectedCampus: 'ALL' as CampusId,
      setSelectedCampus: () => {},
      campusInfo,
      allCampuses,
      allowedCampuses: allCampuses,
      isCampusRestricted: false,
      userCampusId: 'ALL' as CampusId,
    };
  }
  return context;
}
