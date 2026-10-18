// src/app/api/gis/transport/route.ts
// Real-Time School Transport, Live Shuttle Telematics, Multi-Campus Pickups/Dropoffs, Road Network Routing & Traffic Engine

import { NextRequest, NextResponse } from 'next/server';
import { generateLegacyLearners } from '@/server/services/legacySchoolData';

export interface TrafficSegment {
  id: string;
  name: string;
  startCoords: [number, number];
  endCoords: [number, number];
  distanceKm: number;
  trafficCondition: 'CLEAR' | 'MODERATE' | 'HEAVY_JAM';
  speedKmh: number;
  delayMinutes: number;
}

export interface TransportStop {
  id: string;
  name: string;
  routeCode: string;
  latitude: number;
  longitude: number;
  morningPickupTime: string;
  afternoonDropTime: string;
  studentCount: number;
  landmark: string;
  targetCampusCodes: string[]; // Multi-campus assignment (e.g. ['URB', 'MSC'])
  distanceFromPrevStopKm: number;
  trafficCondition: 'CLEAR' | 'MODERATE' | 'HEAVY_JAM';
}

export interface ShuttleVehicle {
  id: string;
  routeCode: string;
  routeName: string;
  vehicleReg: string;
  model: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  assignedCampuses: string[]; // Multiple campuses served by this shuttle
  currentCoordinates: { lat: number; lng: number };
  speedKmh: number;
  headingDegrees: number;
  status: 'IN_TRANSIT' | 'AT_STOP' | 'ARRIVED_CAMPUS' | 'STANDBY';
  currentStopIndex: number;
  nextStop: string;
  etaNextStopMinutes: number;
  boardedCount: number;
  stops: TransportStop[];
  networkPath: [number, number][]; // Street network polyline coordinates
  trafficSegments: TrafficSegment[];
  totalDistanceKm: number;
  fuelMetrics: {
    consumptionRateLPer100Km: number;
    dailyRoundTripKm: number;
    dailyFuelLiters: number;
    fuelPricePerLiterZMW: number; // Solwezi ERB diesel price: K34.20
    dailyFuelCostZMW: number;
    monthlyFuelCostZMW: number; // 22 operating school days
  };
}

export interface BoardingLogEntry {
  id: string;
  studentNumber: string;
  studentName: string;
  className: string;
  routeCode: string;
  stopName: string;
  destinationCampus: string;
  tapTimestamp: string;
  guardianName: string;
  guardianPhone: string;
  notificationStatus: 'SMS_SENT' | 'PUSH_DELIVERED';
  boardingMethod: 'NFC_MIFARE_CARD' | 'QR_CODE_SCAN' | 'MANUAL_MARSHALL';
}

const FUEL_PRICE_PER_LITER = 34.20;

function computeFuelMetrics(distanceKm: number, consumptionRate: number) {
  const dailyKm = Math.round(distanceKm * 2 * 10) / 10;
  const dailyLiters = Math.round((dailyKm * (consumptionRate / 100)) * 100) / 100;
  const dailyCost = Math.round(dailyLiters * FUEL_PRICE_PER_LITER * 100) / 100;
  const monthlyCost = Math.round(dailyCost * 22 * 100) / 100;
  return {
    consumptionRateLPer100Km: consumptionRate,
    dailyRoundTripKm: dailyKm,
    dailyFuelLiters: dailyLiters,
    fuelPricePerLiterZMW: FUEL_PRICE_PER_LITER,
    dailyFuelCostZMW: dailyCost,
    monthlyFuelCostZMW: monthlyCost,
  };
}

// Global in-memory storage for interactive session
let transportRoutesStore: ShuttleVehicle[] = [
  {
    id: 'shuttle-01',
    routeCode: 'BUS-SOL-01',
    routeName: 'Kyawama — Kikombe — Town Centre — Urban & Mushitala Express',
    vehicleReg: 'BAX 3192 ZM',
    model: 'Toyota Coaster (32-Seater, Diesel)',
    driverName: 'Mr. Timothy Kabwe',
    driverPhone: '+260 976 119284',
    capacity: 32,
    assignedCampuses: [
      'Urban Campus (Solwezi Central - opp Kikombe School / Army Mess)',
      'Mushitala Campus (Near Kansanshi)',
    ],
    currentCoordinates: { lat: -12.1830, lng: 26.3842 },
    speedKmh: 14,
    headingDegrees: 52,
    status: 'IN_TRANSIT',
    currentStopIndex: 1,
    nextStop: 'Solwezi Town Post Office / Civic Centre',
    etaNextStopMinutes: 5,
    boardedCount: 26,
    totalDistanceKm: 9.4,
    fuelMetrics: computeFuelMetrics(9.4, 14.2),
    networkPath: [
      [-12.1865, 26.3790],
      [-12.1852, 26.3815],
      [-12.1835, 26.3835], // Kikombe Junction
      [-12.1828, 26.3848],
      [-12.1825, 26.3850], // Civic Centre / Post Office
      [-12.1818, 26.3868],
      [-12.1812, 26.3884], // Urban Campus (opp Kikombe School / Army Mess)
      [-12.1760, 26.3910],
      [-12.1700, 26.3940],
      [-12.1620, 26.3980], // SGC Junction
      [-12.1642, 26.3951], // Mushitala Campus
    ],
    trafficSegments: [
      {
        id: 'seg-01-1',
        name: 'Kyawama Market -> Kikombe Link (opp Kikombe School / Army Mess)',
        startCoords: [-12.1865, 26.3790],
        endCoords: [-12.1835, 26.3835],
        distanceKm: 1.9,
        trafficCondition: 'CLEAR',
        speedKmh: 42,
        delayMinutes: 0,
      },
      {
        id: 'seg-01-2',
        name: 'Kikombe Junction -> Independence Ave Roundabout (Rush Hour Traffic Jam)',
        startCoords: [-12.1835, 26.3835],
        endCoords: [-12.1825, 26.3850],
        distanceKm: 1.4,
        trafficCondition: 'HEAVY_JAM',
        speedKmh: 12,
        delayMinutes: 6,
      },
      {
        id: 'seg-01-3',
        name: 'Independence Ave -> Urban Campus Assembly Forecourt',
        startCoords: [-12.1825, 26.3850],
        endCoords: [-12.1812, 26.3884],
        distanceKm: 0.9,
        trafficCondition: 'MODERATE',
        speedKmh: 22,
        delayMinutes: 2,
      },
      {
        id: 'seg-01-4',
        name: 'Urban Campus -> SGC Filling Station Junction',
        startCoords: [-12.1812, 26.3884],
        endCoords: [-12.1620, 26.3980],
        distanceKm: 3.4,
        trafficCondition: 'CLEAR',
        speedKmh: 48,
        delayMinutes: 0,
      },
      {
        id: 'seg-01-5',
        name: 'SGC Junction -> Mushitala Secondary & Boarding Gate',
        startCoords: [-12.1620, 26.3980],
        endCoords: [-12.1642, 26.3951],
        distanceKm: 1.8,
        trafficCondition: 'CLEAR',
        speedKmh: 45,
        delayMinutes: 0,
      },
    ],
    stops: [
      {
        id: 'stop-01-1',
        name: 'Kyawama Market Terminal',
        routeCode: 'BUS-SOL-01',
        latitude: -12.1865,
        longitude: 26.3790,
        morningPickupTime: '06:35',
        afternoonDropTime: '15:55',
        studentCount: 14,
        landmark: 'Opposite Kyawama Main Market Gate',
        targetCampusCodes: ['URB', 'MSC'],
        distanceFromPrevStopKm: 0,
        trafficCondition: 'CLEAR',
      },
      {
        id: 'stop-01-2',
        name: 'Kikombe Junction (opp Kikombe School / Army Mess)',
        routeCode: 'BUS-SOL-01',
        latitude: -12.1835,
        longitude: 26.3835,
        morningPickupTime: '06:48',
        afternoonDropTime: '15:42',
        studentCount: 10,
        landmark: 'Directly opposite Kikombe School & Zambia Army Mess entrance',
        targetCampusCodes: ['URB', 'MSC'],
        distanceFromPrevStopKm: 1.9,
        trafficCondition: 'CLEAR',
      },
      {
        id: 'stop-01-3',
        name: 'Solwezi Town Post Office / Civic Centre',
        routeCode: 'BUS-SOL-01',
        latitude: -12.1825,
        longitude: 26.3850,
        morningPickupTime: '07:00',
        afternoonDropTime: '15:30',
        studentCount: 8,
        landmark: 'Civic Centre Roundabout Layby',
        targetCampusCodes: ['URB', 'MSC'],
        distanceFromPrevStopKm: 1.4,
        trafficCondition: 'HEAVY_JAM',
      },
      {
        id: 'stop-01-4',
        name: 'Urban Campus Main Gate (opp Kikombe School / Army Mess)',
        routeCode: 'BUS-SOL-01',
        latitude: -12.1812,
        longitude: 26.3884,
        morningPickupTime: '07:10',
        afternoonDropTime: '15:15',
        studentCount: 7,
        landmark: 'Urban Campus Assembly Forecourt — Drops ECE & Primary Pupils',
        targetCampusCodes: ['URB'],
        distanceFromPrevStopKm: 0.9,
        trafficCondition: 'MODERATE',
      },
      {
        id: 'stop-01-5',
        name: 'SGC Filling Station Junction',
        routeCode: 'BUS-SOL-01',
        latitude: -12.1620,
        longitude: 26.3980,
        morningPickupTime: '07:22',
        afternoonDropTime: '15:02',
        studentCount: 4,
        landmark: 'Kansanshi Mine Road opposite SGC Petrol Station',
        targetCampusCodes: ['MSC'],
        distanceFromPrevStopKm: 3.4,
        trafficCondition: 'CLEAR',
      },
      {
        id: 'stop-01-6',
        name: 'Mushitala Boarding Main Gate',
        routeCode: 'BUS-SOL-01',
        latitude: -12.1642,
        longitude: 26.3951,
        morningPickupTime: '07:32',
        afternoonDropTime: '14:50',
        studentCount: 3,
        landmark: 'Mushitala Secondary & Boarding Campus Security Pavilion',
        targetCampusCodes: ['MSC'],
        distanceFromPrevStopKm: 1.8,
        trafficCondition: 'CLEAR',
      },
    ],
  },
  {
    id: 'shuttle-02',
    routeCode: 'BUS-SOL-02',
    routeName: 'Kansanshi Golf Estate — Mess — Mushitala & Urban Corridor',
    vehicleReg: 'BAL 4920 ZM',
    model: 'Nissan Civilian (30-Seater, 4x2)',
    driverName: 'Mr. Patrick Zulu',
    driverPhone: '+260 971 883920',
    capacity: 30,
    assignedCampuses: [
      'Mushitala Campus (Near Kansanshi)',
      'Urban Campus (Solwezi Central - opp Kikombe School / Army Mess)',
    ],
    currentCoordinates: { lat: -12.1570, lng: 26.4025 },
    speedKmh: 46,
    headingDegrees: 220,
    status: 'IN_TRANSIT',
    currentStopIndex: 2,
    nextStop: 'SGC Filling Station Junction',
    etaNextStopMinutes: 3,
    boardedCount: 28,
    totalDistanceKm: 11.4,
    fuelMetrics: computeFuelMetrics(11.4, 14.5),
    networkPath: [
      [-12.1480, 26.4120], // Golf Estate Gate 1
      [-12.1520, 26.4080],
      [-12.1560, 26.4040], // Officers Mess
      [-12.1590, 26.4010], // Kansanshi Mine Gate Turnoff
      [-12.1620, 26.3980], // SGC Junction
      [-12.1642, 26.3951], // Mushitala Campus
      [-12.1700, 26.3920], // Messenger Township
      [-12.1760, 26.3900],
      [-12.1812, 26.3884], // Urban Campus
    ],
    trafficSegments: [
      {
        id: 'seg-02-1',
        name: 'Golf Estate Gate 1 -> Senior Officers Mess Roundabout',
        startCoords: [-12.1480, 26.4120],
        endCoords: [-12.1560, 26.4040],
        distanceKm: 1.9,
        trafficCondition: 'CLEAR',
        speedKmh: 46,
        delayMinutes: 0,
      },
      {
        id: 'seg-02-2',
        name: 'Officers Mess -> Kansanshi Mine Checkpoint Turnoff',
        startCoords: [-12.1560, 26.4040],
        endCoords: [-12.1590, 26.4010],
        distanceKm: 1.5,
        trafficCondition: 'MODERATE',
        speedKmh: 28,
        delayMinutes: 2,
      },
      {
        id: 'seg-02-3',
        name: 'Mine Turnoff -> Mushitala Secondary & Boarding Gate',
        startCoords: [-12.1590, 26.4010],
        endCoords: [-12.1642, 26.3951],
        distanceKm: 2.2,
        trafficCondition: 'CLEAR',
        speedKmh: 45,
        delayMinutes: 0,
      },
      {
        id: 'seg-02-4',
        name: 'Mushitala Gate -> Messenger Township / Mipundu Link',
        startCoords: [-12.1642, 26.3951],
        endCoords: [-12.1700, 26.3920],
        distanceKm: 2.6,
        trafficCondition: 'CLEAR',
        speedKmh: 44,
        delayMinutes: 0,
      },
      {
        id: 'seg-02-5',
        name: 'Messenger Township -> Urban Campus (opp Kikombe School / Army Mess)',
        startCoords: [-12.1700, 26.3920],
        endCoords: [-12.1812, 26.3884],
        distanceKm: 3.2,
        trafficCondition: 'HEAVY_JAM',
        speedKmh: 13,
        delayMinutes: 7,
      },
    ],
    stops: [
      {
        id: 'stop-02-1',
        name: 'Kansanshi Golf Estate Gate 1',
        routeCode: 'BUS-SOL-02',
        latitude: -12.1480,
        longitude: 26.4120,
        morningPickupTime: '06:40',
        afternoonDropTime: '16:00',
        studentCount: 12,
        landmark: 'Main Security Boom, Kansanshi Golf Estate',
        targetCampusCodes: ['MSC', 'URB'],
        distanceFromPrevStopKm: 0,
        trafficCondition: 'CLEAR',
      },
      {
        id: 'stop-02-2',
        name: 'Officers Mess Roundabout',
        routeCode: 'BUS-SOL-02',
        latitude: -12.1560,
        longitude: 26.4040,
        morningPickupTime: '06:52',
        afternoonDropTime: '15:45',
        studentCount: 9,
        landmark: 'Mine Mess Roundabout Bus Layby',
        targetCampusCodes: ['MSC', 'URB'],
        distanceFromPrevStopKm: 1.9,
        trafficCondition: 'CLEAR',
      },
      {
        id: 'stop-02-3',
        name: 'Kansanshi Mine Main Gate Turnoff',
        routeCode: 'BUS-SOL-02',
        latitude: -12.1590,
        longitude: 26.4010,
        morningPickupTime: '07:04',
        afternoonDropTime: '15:35',
        studentCount: 5,
        landmark: 'Kansanshi Mine Smelter Road Junction',
        targetCampusCodes: ['MSC', 'URB'],
        distanceFromPrevStopKm: 1.5,
        trafficCondition: 'MODERATE',
      },
      {
        id: 'stop-02-4',
        name: 'Mushitala Boarding Main Gate',
        routeCode: 'BUS-SOL-02',
        latitude: -12.1642,
        longitude: 26.3951,
        morningPickupTime: '07:15',
        afternoonDropTime: '15:20',
        studentCount: 8,
        landmark: 'Mushitala Secondary School Security Pavilion — Drops Senior Pupils',
        targetCampusCodes: ['MSC'],
        distanceFromPrevStopKm: 2.2,
        trafficCondition: 'CLEAR',
      },
      {
        id: 'stop-02-5',
        name: 'Messenger Township / Mipundu Link',
        routeCode: 'BUS-SOL-02',
        latitude: -12.1700,
        longitude: 26.3920,
        morningPickupTime: '07:26',
        afternoonDropTime: '15:08',
        studentCount: 4,
        landmark: 'Messenger Council Offices layby',
        targetCampusCodes: ['URB'],
        distanceFromPrevStopKm: 2.6,
        trafficCondition: 'CLEAR',
      },
      {
        id: 'stop-02-6',
        name: 'Urban Campus Main Gate (opp Kikombe School / Army Mess)',
        routeCode: 'BUS-SOL-02',
        latitude: -12.1812,
        longitude: 26.3884,
        morningPickupTime: '07:38',
        afternoonDropTime: '14:55',
        studentCount: 5,
        landmark: 'Opposite Kikombe School & Zambia Army Mess — Drops Primary Pupils',
        targetCampusCodes: ['URB'],
        distanceFromPrevStopKm: 3.2,
        trafficCondition: 'HEAVY_JAM',
      },
    ],
  },
  {
    id: 'shuttle-03',
    routeCode: 'BUS-SOL-03',
    routeName: 'Kimasala — Airport Road — Urban & Mushitala Shuttle',
    vehicleReg: 'BCL 8812 ZM',
    model: 'Toyota HiAce Commuter (16-Seater, Petrol)',
    driverName: 'Mr. Charles Musonda',
    driverPhone: '+260 978 221144',
    capacity: 16,
    assignedCampuses: [
      'Urban Campus (Solwezi Central - opp Kikombe School / Army Mess)',
      'Mushitala Campus (Near Kansanshi)',
    ],
    currentCoordinates: { lat: -12.1850, lng: 26.3940 },
    speedKmh: 38,
    headingDegrees: 340,
    status: 'IN_TRANSIT',
    currentStopIndex: 1,
    nextStop: 'Solwezi Airport Junction Link',
    etaNextStopMinutes: 4,
    boardedCount: 14,
    totalDistanceKm: 9.0,
    fuelMetrics: computeFuelMetrics(9.0, 10.5),
    networkPath: [
      [-12.1890, 26.4010], // Kimasala Feeder
      [-12.1850, 26.3940],
      [-12.1780, 26.4050], // Airport Junction
      [-12.1812, 26.3884], // Urban Campus (opp Kikombe School / Army Mess)
      [-12.1700, 26.3920],
      [-12.1642, 26.3951], // Mushitala Campus
    ],
    trafficSegments: [
      {
        id: 'seg-03-1',
        name: 'Kimasala Suburb -> Airport Road Junction',
        startCoords: [-12.1890, 26.4010],
        endCoords: [-12.1780, 26.4050],
        distanceKm: 2.8,
        trafficCondition: 'CLEAR',
        speedKmh: 42,
        delayMinutes: 0,
      },
      {
        id: 'seg-03-2',
        name: 'Airport Road -> Urban Campus (opp Kikombe School / Army Mess)',
        startCoords: [-12.1780, 26.4050],
        endCoords: [-12.1812, 26.3884],
        distanceKm: 2.4,
        trafficCondition: 'MODERATE',
        speedKmh: 25,
        delayMinutes: 2,
      },
      {
        id: 'seg-03-3',
        name: 'Urban Campus -> Mushitala Secondary & Boarding Gate',
        startCoords: [-12.1812, 26.3884],
        endCoords: [-12.1642, 26.3951],
        distanceKm: 3.8,
        trafficCondition: 'CLEAR',
        speedKmh: 46,
        delayMinutes: 0,
      },
    ],
    stops: [
      {
        id: 'stop-03-1',
        name: 'Kimasala Feeder Stop',
        routeCode: 'BUS-SOL-03',
        latitude: -12.1890,
        longitude: 26.4010,
        morningPickupTime: '06:40',
        afternoonDropTime: '15:50',
        studentCount: 7,
        landmark: 'Kimasala Clinic & Primary Turnoff',
        targetCampusCodes: ['URB', 'MSC'],
        distanceFromPrevStopKm: 0,
        trafficCondition: 'CLEAR',
      },
      {
        id: 'stop-03-2',
        name: 'Solwezi Airport Junction Link',
        routeCode: 'BUS-SOL-03',
        latitude: -12.1780,
        longitude: 26.4050,
        morningPickupTime: '06:55',
        afternoonDropTime: '15:35',
        studentCount: 5,
        landmark: 'Airport Road Main Highway Intersection',
        targetCampusCodes: ['URB', 'MSC'],
        distanceFromPrevStopKm: 2.8,
        trafficCondition: 'CLEAR',
      },
      {
        id: 'stop-03-3',
        name: 'Urban Campus Main Gate (opp Kikombe School / Army Mess)',
        routeCode: 'BUS-SOL-03',
        latitude: -12.1812,
        longitude: 26.3884,
        morningPickupTime: '07:12',
        afternoonDropTime: '15:15',
        studentCount: 4,
        landmark: 'Opposite Kikombe School & Zambia Army Mess — Drops Primary Pupils',
        targetCampusCodes: ['URB'],
        distanceFromPrevStopKm: 2.4,
        trafficCondition: 'MODERATE',
      },
      {
        id: 'stop-03-4',
        name: 'Mushitala Boarding Main Gate',
        routeCode: 'BUS-SOL-03',
        latitude: -12.1642,
        longitude: 26.3951,
        morningPickupTime: '07:28',
        afternoonDropTime: '14:55',
        studentCount: 2,
        landmark: 'Mushitala Secondary Campus Main Security Gate',
        targetCampusCodes: ['MSC'],
        distanceFromPrevStopKm: 3.8,
        trafficCondition: 'CLEAR',
      },
    ],
  },
];

let boardingLogsStore: BoardingLogEntry[] = [
  {
    id: 'log-001',
    studentNumber: 'LSS-2026-0042',
    studentName: 'Bupe Mwewa',
    className: 'Form 2 Green',
    routeCode: 'BUS-SOL-02',
    stopName: 'Kansanshi Golf Estate Gate 1',
    destinationCampus: 'Mushitala Campus (Near Kansanshi)',
    tapTimestamp: '2026-10-18T06:46:12Z',
    guardianName: 'Eng. Chileshe Mulenga',
    guardianPhone: '+260 977 889900',
    notificationStatus: 'SMS_SENT',
    boardingMethod: 'NFC_MIFARE_CARD',
  },
  {
    id: 'log-002',
    studentNumber: 'LSS-2026-0043',
    studentName: 'Mulenga Chanda',
    className: 'Form 2 Green',
    routeCode: 'BUS-SOL-02',
    stopName: 'Kansanshi Golf Estate Gate 1',
    destinationCampus: 'Mushitala Campus (Near Kansanshi)',
    tapTimestamp: '2026-10-18T06:47:05Z',
    guardianName: 'Mrs. Brenda Chanda',
    guardianPhone: '+260 971 445566',
    notificationStatus: 'SMS_SENT',
    boardingMethod: 'NFC_MIFARE_CARD',
  },
  {
    id: 'log-003',
    studentNumber: 'LSS-2026-0045',
    studentName: 'Chilufya Tembo',
    className: 'Form 2 Green',
    routeCode: 'BUS-SOL-02',
    stopName: 'Officers Mess Roundabout',
    destinationCampus: 'Mushitala Campus (Near Kansanshi)',
    tapTimestamp: '2026-10-18T07:01:40Z',
    guardianName: 'Dr. Frank Tembo',
    guardianPhone: '+260 978 223344',
    notificationStatus: 'SMS_SENT',
    boardingMethod: 'QR_CODE_SCAN',
  },
  {
    id: 'log-004',
    studentNumber: 'LSS-2026-0155',
    studentName: 'Kondwani Mwewa',
    className: 'Grade 4 Red',
    routeCode: 'BUS-SOL-01',
    stopName: 'Kikombe Junction (opp Kikombe School / Army Mess)',
    destinationCampus: 'Urban Campus (Solwezi Central - opp Kikombe School / Army Mess)',
    tapTimestamp: '2026-10-18T06:49:19Z',
    guardianName: 'Eng. Chileshe Mulenga',
    guardianPhone: '+260 977 889900',
    notificationStatus: 'PUSH_DELIVERED',
    boardingMethod: 'NFC_MIFARE_CARD',
  },
  {
    id: 'log-005',
    studentNumber: 'LSS-2026-0198',
    studentName: 'Natasha Mwewa',
    className: 'Grade 7 Top',
    routeCode: 'BUS-SOL-01',
    stopName: 'Kyawama Market Terminal',
    destinationCampus: 'Urban Campus (Solwezi Central - opp Kikombe School / Army Mess)',
    tapTimestamp: '2026-10-18T06:37:55Z',
    guardianName: 'Eng. Chileshe Mulenga',
    guardianPhone: '+260 977 889900',
    notificationStatus: 'PUSH_DELIVERED',
    boardingMethod: 'NFC_MIFARE_CARD',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const routeCode = searchParams.get('routeCode');

    // Simulate real-time continuous movement along coordinates
    const timeDelta = (Date.now() / 1000) % 60; // 0 to 60s cycle
    const updatedRoutes = transportRoutesStore.map((r) => {
      const stops = r.stops;
      if (stops.length >= 2) {
        // Interpolate along route path based on time
        const path = r.networkPath.length > 0 ? r.networkPath : stops.map(s => [s.latitude, s.longitude] as [number, number]);
        const totalSegments = path.length - 1;
        const currentSegIndex = Math.min(totalSegments - 1, Math.floor((timeDelta / 60) * totalSegments));
        const subFraction = ((timeDelta / 60) * totalSegments) - currentSegIndex;
        const start = path[currentSegIndex];
        const end = path[currentSegIndex + 1];
        const curLat = start[0] + (end[0] - start[0]) * subFraction;
        const curLng = start[1] + (end[1] - start[1]) * subFraction;

        // Check if currently on a congested segment
        const congestedSegment = r.trafficSegments.find(s => s.trafficCondition === 'HEAVY_JAM');
        const isNearCongestion = Boolean(congestedSegment && Math.abs(curLat - congestedSegment.startCoords[0]) < 0.005);
        const dynamicSpeed = isNearCongestion ? Math.round(10 + Math.sin(timeDelta) * 4) : Math.round(38 + Math.cos(timeDelta) * 6);

        return {
          ...r,
          currentCoordinates: { lat: curLat, lng: curLng },
          speedKmh: dynamicSpeed,
          headingDegrees: Math.round((currentSegIndex * 45 + subFraction * 30) % 360),
          boardedCount: r.boardedCount,
        };
      }
      return r;
    });

    let filteredRoutes = updatedRoutes;
    if (routeCode) {
      filteredRoutes = updatedRoutes.filter((r) => r.routeCode === routeCode);
    }

    const totalFleetDailyKm = filteredRoutes.reduce((acc, r) => acc + r.fuelMetrics.dailyRoundTripKm, 0);
    const totalFleetDailyFuelLiters = filteredRoutes.reduce((acc, r) => acc + r.fuelMetrics.dailyFuelLiters, 0);
    const totalFleetDailyCostZMW = filteredRoutes.reduce((acc, r) => acc + r.fuelMetrics.dailyFuelCostZMW, 0);
    const totalFleetMonthlyCostZMW = filteredRoutes.reduce((acc, r) => acc + r.fuelMetrics.monthlyFuelCostZMW, 0);

    return NextResponse.json({
      success: true,
      data: {
        shuttles: filteredRoutes,
        boardingLogs: boardingLogsStore,
        fleetSummary: {
          totalActiveShuttles: transportRoutesStore.length,
          totalStops: transportRoutesStore.reduce((acc, r) => acc + r.stops.length, 0),
          totalBoardedToday: boardingLogsStore.length,
          totalFleetDailyKm: Math.round(totalFleetDailyKm * 10) / 10,
          totalFleetDailyFuelLiters: Math.round(totalFleetDailyFuelLiters * 10) / 10,
          totalFleetDailyCostZMW: Math.round(totalFleetDailyCostZMW * 100) / 100,
          totalFleetMonthlyCostZMW: Math.round(totalFleetMonthlyCostZMW * 100) / 100,
          dieselPricePerLiter: FUEL_PRICE_PER_LITER,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || 'ADD_STOP';

    if (action === 'ADD_STOP') {
      const { routeCode, name, latitude, longitude, morningPickupTime, afternoonDropTime, landmark, targetCampusCodes, distanceFromPrevStopKm } = body;
      if (!routeCode || !name || latitude == null || longitude == null) {
        return NextResponse.json(
          { success: false, message: 'Route code, stop name, latitude, and longitude are required.' },
          { status: 400 }
        );
      }

      const route = transportRoutesStore.find((r) => r.routeCode === routeCode);
      if (!route) {
        return NextResponse.json({ success: false, message: `Route ${routeCode} not found.` }, { status: 404 });
      }

      const distKm = distanceFromPrevStopKm ? Number(distanceFromPrevStopKm) : 1.5;
      const newStop: TransportStop = {
        id: `stop-${routeCode}-${Date.now().toString().slice(-4)}`,
        name,
        routeCode,
        latitude: Number(latitude),
        longitude: Number(longitude),
        morningPickupTime: morningPickupTime || '06:50',
        afternoonDropTime: afternoonDropTime || '15:35',
        studentCount: body.studentCount ? Number(body.studentCount) : 4,
        landmark: landmark || 'Designated Learner Transit Stop',
        targetCampusCodes: targetCampusCodes || ['URB', 'MSC'],
        distanceFromPrevStopKm: distKm,
        trafficCondition: 'CLEAR',
      };

      route.stops.push(newStop);
      route.totalDistanceKm = Math.round((route.totalDistanceKm + distKm) * 10) / 10;
      route.fuelMetrics = computeFuelMetrics(route.totalDistanceKm, route.fuelMetrics.consumptionRateLPer100Km);
      route.networkPath.push([Number(latitude), Number(longitude)]);

      return NextResponse.json({
        success: true,
        message: `Route stop "${name}" successfully added to ${routeCode} with target campuses ${newStop.targetCampusCodes.join(', ')}.`,
        data: { stop: newStop, route },
      });
    }

    if (action === 'ASSIGN_SHUTTLE') {
      const { routeCode, assignedCampuses, stopsList } = body;
      const route = transportRoutesStore.find((r) => r.routeCode === routeCode);
      if (!route) {
        return NextResponse.json({ success: false, message: `Shuttle ${routeCode} not found.` }, { status: 404 });
      }

      if (assignedCampuses && Array.isArray(assignedCampuses)) {
        route.assignedCampuses = assignedCampuses;
      }

      if (stopsList && Array.isArray(stopsList)) {
        route.stops = stopsList;
      }

      return NextResponse.json({
        success: true,
        message: `Shuttle ${routeCode} assignments successfully updated across ${route.assignedCampuses.length} campuses and ${route.stops.length} stops.`,
        data: { route },
      });
    }

    if (action === 'BOARD_STUDENT') {
      const { studentNumber, routeCode, stopName, method, destinationCampus } = body;
      const all780 = generateLegacyLearners(780);
      const student = all780.find((s) => s.studentNumber === studentNumber) || {
        learnerName: body.studentName || 'Learner',
        className: body.className || 'Form 2 Green',
        guardian: { name: 'Eng. Chileshe Mulenga', phone: '+260 977 889900' },
      };

      const newLog: BoardingLogEntry = {
        id: `log-${Date.now()}`,
        studentNumber: studentNumber || `LSS-2026-0042`,
        studentName: student.learnerName,
        className: student.className,
        routeCode: routeCode || 'BUS-SOL-02',
        stopName: stopName || 'Designated Pickup Stop',
        destinationCampus: destinationCampus || 'Mushitala Campus (Near Kansanshi)',
        tapTimestamp: new Date().toISOString(),
        guardianName: student.guardian?.name || 'Guardian',
        guardianPhone: student.guardian?.phone || '+260 970 000000',
        notificationStatus: 'SMS_SENT',
        boardingMethod: method || 'NFC_MIFARE_CARD',
      };

      boardingLogsStore.unshift(newLog);

      // Increment onboard count
      const route = transportRoutesStore.find((r) => r.routeCode === routeCode);
      if (route && route.boardedCount < route.capacity) {
        route.boardedCount += 1;
      }

      return NextResponse.json({
        success: true,
        message: `Learner ${student.learnerName} (${studentNumber}) logged as boarded on ${routeCode}. Guardian SMS alert dispatched.`,
        data: {
          log: newLog,
          guardianNotification: {
            recipientPhone: student.guardian?.phone,
            smsPreview: `[EduSphere Transport Alert] ${student.learnerName} has safely boarded ${routeCode} at ${newLog.stopName} at ${new Date().toLocaleTimeString()} destined for ${newLog.destinationCampus}. ETA school: ~18 mins.`,
          },
        },
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action provided.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
