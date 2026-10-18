// src/app/api/gis/transport/route.ts
// Real-Time School Transport, Live Shuttle GIS Tracking, Route Stops & RFID/NFC Boarding Engine

import { NextRequest, NextResponse } from 'next/server';
import { generateLegacyLearners } from '@/server/services/legacySchoolData';

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
  assignedCampus: string;
  currentCoordinates: { lat: number; lng: number };
  speedKmh: number;
  headingDegrees: number;
  status: 'IN_TRANSIT' | 'AT_STOP' | 'ARRIVED_CAMPUS' | 'STANDBY';
  currentStopIndex: number;
  nextStop: string;
  etaNextStopMinutes: number;
  boardedCount: number;
  stops: TransportStop[];
}

export interface BoardingLogEntry {
  id: string;
  studentNumber: string;
  studentName: string;
  className: string;
  routeCode: string;
  stopName: string;
  tapTimestamp: string;
  guardianName: string;
  guardianPhone: string;
  notificationStatus: 'SMS_SENT' | 'PUSH_DELIVERED';
  boardingMethod: 'NFC_MIFARE_CARD' | 'QR_CODE_SCAN' | 'MANUAL_MARSHALL';
}

// Global in-memory storage for interactive session
let transportRoutesStore: ShuttleVehicle[] = [
  {
    id: 'shuttle-01',
    routeCode: 'BUS-SOL-01',
    routeName: 'Kyawama — Civic Centre — Urban Campus Express',
    vehicleReg: 'BAX 3192 ZM',
    model: 'Toyota Coaster (32-Seater, Diesel)',
    driverName: 'Mr. Timothy Kabwe',
    driverPhone: '+260 976 119284',
    capacity: 32,
    assignedCampus: 'Urban Campus (Solwezi Central)',
    currentCoordinates: { lat: -12.1840, lng: 26.3820 },
    speedKmh: 36,
    headingDegrees: 48,
    status: 'IN_TRANSIT',
    currentStopIndex: 1,
    nextStop: 'Solwezi Town Post Office / Civic Centre',
    etaNextStopMinutes: 4,
    boardedCount: 25,
    stops: [
      {
        id: 'stop-01-1',
        name: 'Kyawama Market Terminal',
        routeCode: 'BUS-SOL-01',
        latitude: -12.1865,
        longitude: 26.3790,
        morningPickupTime: '06:40',
        afternoonDropTime: '15:45',
        studentCount: 14,
        landmark: 'Opposite Kyawama Main Market Gate',
      },
      {
        id: 'stop-01-2',
        name: 'Solwezi Town Post Office / Civic Centre',
        routeCode: 'BUS-SOL-01',
        latitude: -12.1825,
        longitude: 26.3850,
        morningPickupTime: '06:55',
        afternoonDropTime: '15:30',
        studentCount: 11,
        landmark: 'Civic Centre Roundabout Layby',
      },
      {
        id: 'stop-01-3',
        name: 'Urban Campus Terminal',
        routeCode: 'BUS-SOL-01',
        latitude: -12.1812,
        longitude: 26.3884,
        morningPickupTime: '07:15',
        afternoonDropTime: '15:10',
        studentCount: 7,
        landmark: 'Urban Campus Assembly Forecourt',
      },
    ],
  },
  {
    id: 'shuttle-02',
    routeCode: 'BUS-SOL-02',
    routeName: 'Kansanshi Golf Estate — Mess — Mushitala Campus Corridor',
    vehicleReg: 'BAL 4920 ZM',
    model: 'Nissan Civilian (30-Seater, 4x2)',
    driverName: 'Mr. Patrick Zulu',
    driverPhone: '+260 971 883920',
    capacity: 30,
    assignedCampus: 'Mushitala Campus (Near Kansanshi)',
    currentCoordinates: { lat: -12.1585, lng: 26.4015 },
    speedKmh: 42,
    headingDegrees: 215,
    status: 'IN_TRANSIT',
    currentStopIndex: 2,
    nextStop: 'SGC Filling Station Junction',
    etaNextStopMinutes: 3,
    boardedCount: 27,
    stops: [
      {
        id: 'stop-02-1',
        name: 'Kansanshi Golf Estate Gate 1',
        routeCode: 'BUS-SOL-02',
        latitude: -12.1480,
        longitude: 26.4120,
        morningPickupTime: '06:45',
        afternoonDropTime: '16:00',
        studentCount: 12,
        landmark: 'Main Security Boom, Kansanshi Golf Estate',
      },
      {
        id: 'stop-02-2',
        name: 'Officers Mess Roundabout',
        routeCode: 'BUS-SOL-02',
        latitude: -12.1560,
        longitude: 26.4040,
        morningPickupTime: '07:00',
        afternoonDropTime: '15:45',
        studentCount: 10,
        landmark: 'Mine Mess Roundabout Bus Layby',
      },
      {
        id: 'stop-02-3',
        name: 'SGC Filling Station Junction',
        routeCode: 'BUS-SOL-02',
        latitude: -12.1620,
        longitude: 26.3980,
        morningPickupTime: '07:10',
        afternoonDropTime: '15:30',
        studentCount: 5,
        landmark: 'Kansanshi Mine Road opposite SGC Petrol Station',
      },
      {
        id: 'stop-02-4',
        name: 'Mushitala Boarding Main Gate',
        routeCode: 'BUS-SOL-02',
        latitude: -12.1642,
        longitude: 26.3951,
        morningPickupTime: '07:18',
        afternoonDropTime: '15:20',
        studentCount: 3,
        landmark: 'Secondary School Security Pavilion',
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
    className: 'Grade 6 Silver',
    routeCode: 'BUS-SOL-01',
    stopName: 'Kyawama Market Terminal',
    tapTimestamp: '2026-10-18T06:42:19Z',
    guardianName: 'Eng. Chileshe Mulenga',
    guardianPhone: '+260 977 889900',
    notificationStatus: 'PUSH_DELIVERED',
    boardingMethod: 'NFC_MIFARE_CARD',
  },
  {
    id: 'log-005',
    studentNumber: 'LSS-2026-0198',
    studentName: 'Natasha Mwewa',
    className: 'Reception Stars',
    routeCode: 'BUS-SOL-01',
    stopName: 'Kyawama Market Terminal',
    tapTimestamp: '2026-10-18T06:42:55Z',
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
    const timeDelta = (Date.now() / 1000) % 60; // 0 to 60s loop
    const updatedRoutes = transportRoutesStore.map((r) => {
      const stops = r.stops;
      if (stops.length >= 2) {
        // Interpolate position between first and last stop based on time
        const start = stops[0];
        const end = stops[stops.length - 1];
        const fraction = (timeDelta / 60);
        const curLat = start.latitude + (end.latitude - start.latitude) * fraction;
        const curLng = start.longitude + (end.longitude - start.longitude) * fraction;
        return {
          ...r,
          currentCoordinates: { lat: curLat, lng: curLng },
          speedKmh: Math.round(28 + Math.sin(timeDelta) * 8),
          boardedCount: r.boardedCount,
        };
      }
      return r;
    });

    let filteredRoutes = updatedRoutes;
    if (routeCode) {
      filteredRoutes = updatedRoutes.filter((r) => r.routeCode === routeCode);
    }

    return NextResponse.json({
      success: true,
      data: {
        shuttles: filteredRoutes,
        boardingLogs: boardingLogsStore,
        totalActiveShuttles: transportRoutesStore.length,
        totalStops: transportRoutesStore.reduce((acc, r) => acc + r.stops.length, 0),
        totalBoardedToday: boardingLogsStore.length,
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
      const { routeCode, name, latitude, longitude, morningPickupTime, afternoonDropTime, landmark } = body;
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

      const newStop: TransportStop = {
        id: `stop-${routeCode}-${Date.now().toString().slice(-4)}`,
        name,
        routeCode,
        latitude: Number(latitude),
        longitude: Number(longitude),
        morningPickupTime: morningPickupTime || '06:50',
        afternoonDropTime: afternoonDropTime || '15:35',
        studentCount: body.studentCount ? Number(body.studentCount) : 0,
        landmark: landmark || 'Designated Learner Transit Stop',
      };

      route.stops.push(newStop);

      return NextResponse.json({
        success: true,
        message: `Route stop "${name}" successfully added to ${routeCode}.`,
        data: { stop: newStop, route },
      });
    }

    if (action === 'BOARD_STUDENT') {
      const { studentNumber, routeCode, stopName, method } = body;
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
            smsPreview: `[EduSphere Transport Alert] ${student.learnerName} has safely boarded ${routeCode} at ${newLog.stopName} at ${new Date().toLocaleTimeString()}. ETA school campus: 20 mins.`,
          },
        },
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action provided.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
