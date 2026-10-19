// src/server/services/schoolAssetData.ts
// Enterprise School Asset Management & Depreciation Engine for Legacy School Solwezi
// Compliant with Zambian Financial Standards & Ministry of Education Asset Registers

export type AssetCategory =
  | 'LABORATORY'
  | 'POWER_ENERGY'
  | 'FLEET_TRANSPORT'
  | 'IT_COMPUTING'
  | 'BOARDING_RESIDENTIAL'
  | 'SPORTS_FACILITIES'
  | 'FURNITURE_CLASSROOM';

export type AssetCondition =
  | 'EXCELLENT'
  | 'GOOD'
  | 'FAIR'
  | 'MAINTENANCE_REQUIRED'
  | 'DECOMMISSIONED';

export interface MaintenanceLogEntry {
  id: string;
  date: string;
  description: string;
  costZMW: number;
  technician: string;
  status: 'COMPLETED' | 'SCHEDULED';
}

export interface SchoolAssetItem {
  id: string;
  assetTag: string;
  barcode: string;
  name: string;
  category: AssetCategory;
  campus: 'Mushitala Campus (Near Kansanshi)' | 'Urban Campus (Solwezi Central)';
  locationRoom: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
  purchaseDate: string;
  purchaseCostZMW: number;
  usefulLifeYears: number;
  salvageValueZMW: number;
  depreciationMethod: 'STRAIGHT_LINE' | 'DECLINING_BALANCE';
  accumulatedDepreciationZMW: number;
  currentNetBookValueZMW: number;
  condition: AssetCondition;
  custodianName: string;
  custodianStaffId: string;
  lastServiceDate: string;
  nextServiceDate: string;
  insurancePolicyNumber?: string;
  maintenanceHistory: MaintenanceLogEntry[];
}

export function calculateStraightLineDepreciation(
  cost: number,
  salvage: number,
  lifeYears: number,
  purchaseDateStr: string,
  asOfDate = new Date()
): { accumulated: number; netBookValue: number } {
  const purchaseDate = new Date(purchaseDateStr);
  const diffYears = Math.max(0, (asOfDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  const annualDepreciation = (cost - salvage) / Math.max(1, lifeYears);
  const accumulated = Math.min(cost - salvage, Math.round(annualDepreciation * diffYears));
  const netBookValue = Math.max(salvage, cost - accumulated);
  return { accumulated, netBookValue };
}

// 25 High-Value Enterprise Assets Seed Data for Solwezi Campuses
export const SEED_SCHOOL_ASSETS: SchoolAssetItem[] = [
  // 1. POWER & STANDBY INFRASTRUCTURE
  {
    id: 'ast-001',
    assetTag: 'LSS-PWR-2024-001',
    barcode: 'BC-PWR-884901',
    name: '250kVA Standby Diesel Generator (Auto-Mains Failure)',
    category: 'POWER_ENERGY',
    campus: 'Mushitala Campus (Near Kansanshi)',
    locationRoom: 'Main Kansanshi Heavy Plant Substation',
    serialNumber: 'FGW-250-ZM-88910',
    manufacturer: 'FG Wilson / Perkins',
    model: 'P250HE Silent Enclosed',
    purchaseDate: '2024-03-15',
    purchaseCostZMW: 685000,
    usefulLifeYears: 10,
    salvageValueZMW: 80000,
    depreciationMethod: 'STRAIGHT_LINE',
    accumulatedDepreciationZMW: 157300,
    currentNetBookValueZMW: 527700,
    condition: 'EXCELLENT',
    custodianName: 'Eng. Patrick Banda',
    custodianStaffId: 'LSS-OPS-004',
    lastServiceDate: '2026-02-10',
    nextServiceDate: '2026-05-10',
    insurancePolicyNumber: 'ZISC-SOL-GEN-2026-091',
    maintenanceHistory: [
      { id: 'mnt-001', date: '2026-02-10', description: '500hr Comprehensive Service: Fuel filters, synthetic oil, starter relay test', costZMW: 14500, technician: 'Kansanshi Power Services Ltd', status: 'COMPLETED' },
      { id: 'mnt-002', date: '2025-08-14', description: 'Battery bank replacement (2x 200Ah AGM batteries)', costZMW: 8800, technician: 'Eng. Patrick Banda', status: 'COMPLETED' },
    ],
  },
  {
    id: 'ast-002',
    assetTag: 'LSS-PWR-2025-002',
    barcode: 'BC-PWR-884902',
    name: '50kVA Commercial Hybrid Solar Inverter System',
    category: 'POWER_ENERGY',
    campus: 'Urban Campus (Solwezi Central)',
    locationRoom: 'Primary Block Solar Power Inverter Bay',
    serialNumber: 'DEYE-50K-HYB-9918',
    manufacturer: 'Deye / FelicitySolar',
    model: 'SUN-50K-SG01HP3-EU',
    purchaseDate: '2025-01-20',
    purchaseCostZMW: 320000,
    usefulLifeYears: 12,
    salvageValueZMW: 30000,
    depreciationMethod: 'STRAIGHT_LINE',
    accumulatedDepreciationZMW: 42300,
    currentNetBookValueZMW: 277700,
    condition: 'EXCELLENT',
    custodianName: 'Eng. Patrick Banda',
    custodianStaffId: 'LSS-OPS-004',
    lastServiceDate: '2026-01-15',
    nextServiceDate: '2026-07-15',
    insurancePolicyNumber: 'ZISC-SOL-SOL-2026-014',
    maintenanceHistory: [
      { id: 'mnt-003', date: '2026-01-15', description: 'Annual firmware upgrade & DC array thermographic scan', costZMW: 4200, technician: 'Solwezi Solar Tech', status: 'COMPLETED' },
    ],
  },
  {
    id: 'ast-003',
    assetTag: 'LSS-PWR-2024-003',
    barcode: 'BC-PWR-884903',
    name: '50,000-Litre High-Level Borehole Water Storage & Booster Rig',
    category: 'POWER_ENERGY',
    campus: 'Mushitala Campus (Near Kansanshi)',
    locationRoom: 'Overhead Steel Tower & Pump House',
    serialNumber: 'WT-50KL-SOL-2024',
    manufacturer: 'Roto Tanks Zambia',
    model: 'Industrial Heavy Duty Cylindrical 5x 10kL',
    purchaseDate: '2024-05-10',
    purchaseCostZMW: 240000,
    usefulLifeYears: 15,
    salvageValueZMW: 20000,
    depreciationMethod: 'STRAIGHT_LINE',
    accumulatedDepreciationZMW: 28100,
    currentNetBookValueZMW: 211900,
    condition: 'GOOD',
    custodianName: 'Eng. Patrick Banda',
    custodianStaffId: 'LSS-OPS-004',
    lastServiceDate: '2026-01-22',
    nextServiceDate: '2026-04-22',
    maintenanceHistory: [
      { id: 'mnt-004', date: '2026-01-22', description: 'Pump impeller servicing & chlorination system calibration', costZMW: 6500, technician: 'North-Western Borehole Eng', status: 'COMPLETED' },
    ],
  },

  // 2. FLEET & STUDENT TRANSPORT
  {
    id: 'ast-004',
    assetTag: 'LSS-FLE-2023-001',
    barcode: 'BC-FLE-991001',
    name: 'Toyota Coaster 32-Seater Executive Campus Bus (Reg: BAA 2914)',
    category: 'FLEET_TRANSPORT',
    campus: 'Mushitala Campus (Near Kansanshi)',
    locationRoom: 'Bus Fleet Depot & Parking Bay 1',
    serialNumber: 'XZB50-0049182',
    manufacturer: 'Toyota Motor Corp',
    model: 'Coaster HZB50 4.2L 1HZ Diesel',
    purchaseDate: '2023-08-10',
    purchaseCostZMW: 920000,
    usefulLifeYears: 8,
    salvageValueZMW: 150000,
    depreciationMethod: 'STRAIGHT_LINE',
    accumulatedDepreciationZMW: 256700,
    currentNetBookValueZMW: 663300,
    condition: 'GOOD',
    custodianName: 'Mr. Moses Chilufya (Senior Driver)',
    custodianStaffId: 'LSS-DRV-001',
    lastServiceDate: '2026-02-18',
    nextServiceDate: '2026-05-18',
    insurancePolicyNumber: 'MADISON-COM-FLEET-8819',
    maintenanceHistory: [
      { id: 'mnt-005', date: '2026-02-18', description: 'Major RTSA Fitness Inspection Prep: Front brake pads, tie-rod ends, new radial tyres', costZMW: 19800, technician: 'Toyota Zambia Kitwe Branch', status: 'COMPLETED' },
      { id: 'mnt-006', date: '2025-10-04', description: 'Differential fluid flush & GPS tracker upgrade', costZMW: 5600, technician: 'AutoCare Solwezi', status: 'COMPLETED' },
    ],
  },
  {
    id: 'ast-005',
    assetTag: 'LSS-FLE-2024-002',
    barcode: 'BC-FLE-991002',
    name: 'Toyota HiAce 16-Seater Commuter Minibus (Reg: ALD 8820)',
    category: 'FLEET_TRANSPORT',
    campus: 'Urban Campus (Solwezi Central)',
    locationRoom: 'Urban Campus Student Drop-off Bay',
    serialNumber: 'KDH200-098412',
    manufacturer: 'Toyota Motor Corp',
    model: 'HiAce Quantum High-Roof 2.5 D-4D',
    purchaseDate: '2024-02-14',
    purchaseCostZMW: 480000,
    usefulLifeYears: 7,
    salvageValueZMW: 80000,
    depreciationMethod: 'STRAIGHT_LINE',
    accumulatedDepreciationZMW: 121900,
    currentNetBookValueZMW: 358100,
    condition: 'EXCELLENT',
    custodianName: 'Mr. Frank Kalumba (Driver)',
    custodianStaffId: 'LSS-DRV-002',
    lastServiceDate: '2026-02-05',
    nextServiceDate: '2026-05-05',
    insurancePolicyNumber: 'MADISON-COM-FLEET-8820',
    maintenanceHistory: [
      { id: 'mnt-007', date: '2026-02-05', description: '10,000km Scheduled Service & Air Filter replacement', costZMW: 6200, technician: 'AutoCare Solwezi', status: 'COMPLETED' },
    ],
  },
  {
    id: 'ast-006',
    assetTag: 'LSS-FLE-2024-003',
    barcode: 'BC-FLE-991003',
    name: 'Toyota Hilux 4WD Double-Cab Administrative Support Vehicle (Reg: BLK 4012)',
    category: 'FLEET_TRANSPORT',
    campus: 'Mushitala Campus (Near Kansanshi)',
    locationRoom: 'Executive Admin Parking Stall A',
    serialNumber: 'GUN126-881924',
    manufacturer: 'Toyota Motor Corp',
    model: 'Hilux Revo 2.8 GD-6 4x4 Raider',
    purchaseDate: '2024-09-01',
    purchaseCostZMW: 720000,
    usefulLifeYears: 6,
    salvageValueZMW: 160000,
    depreciationMethod: 'STRAIGHT_LINE',
    accumulatedDepreciationZMW: 140000,
    currentNetBookValueZMW: 580000,
    condition: 'EXCELLENT',
    custodianName: 'Mr. Emmanuel Mwansa (Principal)',
    custodianStaffId: 'LSS-DIR-001',
    lastServiceDate: '2026-01-10',
    nextServiceDate: '2026-06-10',
    insurancePolicyNumber: 'PROF-INS-ADM-4012',
    maintenanceHistory: [
      { id: 'mnt-008', date: '2026-01-10', description: '15,000km Service, wheel alignment & suspension check', costZMW: 8400, technician: 'Toyota Zambia Kitwe', status: 'COMPLETED' },
    ],
  },

  // 3. SCIENCE LABORATORY EQUIPMENT
  {
    id: 'ast-007',
    assetTag: 'LSS-SCI-2024-001',
    barcode: 'BC-SCI-772001',
    name: 'Olympus CX23 Binocular Biological Microscopes (Set of 20 Units)',
    category: 'LABORATORY',
    campus: 'Mushitala Campus (Near Kansanshi)',
    locationRoom: 'Senior Secondary Biology Laboratory (Room B1)',
    serialNumber: 'OLY-CX23-SET20-SOL',
    manufacturer: 'Olympus Corporation',
    model: 'CX23 LED Plan Achromat',
    purchaseDate: '2024-01-15',
    purchaseCostZMW: 195000,
    usefulLifeYears: 8,
    salvageValueZMW: 25000,
    depreciationMethod: 'STRAIGHT_LINE',
    accumulatedDepreciationZMW: 45700,
    currentNetBookValueZMW: 149300,
    condition: 'EXCELLENT',
    custodianName: 'Dr. Frank Tembo (Head of Science)',
    custodianStaffId: 'LSS-ACA-003',
    lastServiceDate: '2026-01-08',
    nextServiceDate: '2026-07-08',
    maintenanceHistory: [
      { id: 'mnt-009', date: '2026-01-08', description: 'Optical alignment, stage lubrication, and immersion oil lens cleaning', costZMW: 5400, technician: 'MedEquip Zambia', status: 'COMPLETED' },
    ],
  },
  {
    id: 'ast-008',
    assetTag: 'LSS-SCI-2024-002',
    barcode: 'BC-SCI-772002',
    name: 'Industrial Chemistry Fume Extraction Hood & Scrubber Ducting',
    category: 'LABORATORY',
    campus: 'Mushitala Campus (Near Kansanshi)',
    locationRoom: 'Senior Secondary Chemistry Laboratory (Room C1)',
    serialNumber: 'LAB-FM-1500-ZM',
    manufacturer: 'Labconco Corporation',
    model: 'Protector Premier Fume Hood 1500mm',
    purchaseDate: '2024-04-20',
    purchaseCostZMW: 145000,
    usefulLifeYears: 12,
    salvageValueZMW: 15000,
    depreciationMethod: 'STRAIGHT_LINE',
    accumulatedDepreciationZMW: 20600,
    currentNetBookValueZMW: 124400,
    condition: 'EXCELLENT',
    custodianName: 'Dr. Frank Tembo (Head of Science)',
    custodianStaffId: 'LSS-ACA-003',
    lastServiceDate: '2025-11-12',
    nextServiceDate: '2026-05-12',
    maintenanceHistory: [
      { id: 'mnt-010', date: '2025-11-12', description: 'Centrifugal exhaust blower motor servicing & HEPA carbon filter replacement', costZMW: 7200, technician: 'AirFlow Engineering Ndola', status: 'COMPLETED' },
    ],
  },
  {
    id: 'ast-009',
    assetTag: 'LSS-SCI-2025-003',
    barcode: 'BC-SCI-772003',
    name: 'Precision Analytical Electronic Balances (0.0001g Readability, 5 Units)',
    category: 'LABORATORY',
    campus: 'Mushitala Campus (Near Kansanshi)',
    locationRoom: 'Senior Science Preparation & Balance Room',
    serialNumber: 'OHS-EX224-SET5',
    manufacturer: 'Ohaus Corporation',
    model: 'Explorer EX224 Analytical',
    purchaseDate: '2025-02-10',
    purchaseCostZMW: 85000,
    usefulLifeYears: 6,
    salvageValueZMW: 10000,
    depreciationMethod: 'STRAIGHT_LINE',
    accumulatedDepreciationZMW: 14200,
    currentNetBookValueZMW: 70800,
    condition: 'GOOD',
    custodianName: 'Ms. Joyce Kalenga (Chemistry Teacher)',
    custodianStaffId: 'LSS-TCH-005',
    lastServiceDate: '2026-01-14',
    nextServiceDate: '2026-07-14',
    maintenanceHistory: [
      { id: 'mnt-011', date: '2026-01-14', description: 'Metrology standard weights calibration test (ZABS certified)', costZMW: 3800, technician: 'Zambia Bureau of Standards Inspector', status: 'COMPLETED' },
    ],
  },

  // 4. IT & COMPUTING INFRASTRUCTURE
  {
    id: 'ast-010',
    assetTag: 'LSS-IT-2024-001',
    barcode: 'BC-IT-661001',
    name: 'Starlink Enterprise High-Speed Satellite Terminal & Failover Gateway',
    category: 'IT_COMPUTING',
    campus: 'Mushitala Campus (Near Kansanshi)',
    locationRoom: 'Main Server Room (Administration Block B)',
    serialNumber: 'STRLNK-ENT-ZM-0881',
    manufacturer: 'SpaceX / Starlink',
    model: 'High Performance Flat Panel Enterprise Kit',
    purchaseDate: '2024-06-01',
    purchaseCostZMW: 78000,
    usefulLifeYears: 5,
    salvageValueZMW: 8000,
    depreciationMethod: 'STRAIGHT_LINE',
    accumulatedDepreciationZMW: 24500,
    currentNetBookValueZMW: 53500,
    condition: 'EXCELLENT',
    custodianName: 'Mr. Kelvin Mwila (IT Administrator)',
    custodianStaffId: 'LSS-IT-001',
    lastServiceDate: '2026-02-01',
    nextServiceDate: '2026-08-01',
    maintenanceHistory: [
      { id: 'mnt-012', date: '2026-02-01', description: 'POE power injector surge suppressor install & antenna firmware update', costZMW: 2800, technician: 'Mr. Kelvin Mwila', status: 'COMPLETED' },
    ],
  },
  {
    id: 'ast-011',
    assetTag: 'LSS-IT-2024-002',
    barcode: 'BC-IT-661002',
    name: '40-Seat Dell OptiPlex Computer Laboratory Workstations & Smart Server',
    category: 'IT_COMPUTING',
    campus: 'Mushitala Campus (Near Kansanshi)',
    locationRoom: 'Secondary ICT Resource Lab (Room ICT-1)',
    serialNumber: 'DELL-OPT-7090-40SET',
    manufacturer: 'Dell Technologies',
    model: 'OptiPlex 7090 SFF Core i5 16GB 512GB SSD',
    purchaseDate: '2024-03-20',
    purchaseCostZMW: 560000,
    usefulLifeYears: 5,
    salvageValueZMW: 60000,
    depreciationMethod: 'STRAIGHT_LINE',
    accumulatedDepreciationZMW: 191700,
    currentNetBookValueZMW: 368300,
    condition: 'EXCELLENT',
    custodianName: 'Mr. Kelvin Mwila (IT Administrator)',
    custodianStaffId: 'LSS-IT-001',
    lastServiceDate: '2026-01-20',
    nextServiceDate: '2026-04-20',
    maintenanceHistory: [
      { id: 'mnt-013', date: '2026-01-20', description: 'Term 1 OS image deployment, offline Wikipedia Kiwix repository update', costZMW: 4500, technician: 'Mr. Kelvin Mwila', status: 'COMPLETED' },
    ],
  },
  {
    id: 'ast-012',
    assetTag: 'LSS-IT-2025-003',
    barcode: 'BC-IT-661003',
    name: 'Cisco Catalyst 48-Port PoE+ Gigabit Switches & Unifi WiFi 6 AP Network',
    category: 'IT_COMPUTING',
    campus: 'Mushitala Campus (Near Kansanshi)',
    locationRoom: 'Campus Core Network Racks (Rooms A, B, C)',
    serialNumber: 'CSCO-CAT9300-48P-SET',
    manufacturer: 'Cisco Systems / Ubiquiti',
    model: 'Catalyst 9300L + 12x UniFi U6 Pro APs',
    purchaseDate: '2025-01-10',
    purchaseCostZMW: 215000,
    usefulLifeYears: 6,
    salvageValueZMW: 25000,
    depreciationMethod: 'STRAIGHT_LINE',
    accumulatedDepreciationZMW: 36900,
    currentNetBookValueZMW: 178100,
    condition: 'EXCELLENT',
    custodianName: 'Mr. Kelvin Mwila (IT Administrator)',
    custodianStaffId: 'LSS-IT-001',
    lastServiceDate: '2026-01-05',
    nextServiceDate: '2026-07-05',
    maintenanceHistory: [
      { id: 'mnt-014', date: '2026-01-05', description: 'VLAN trunking review & AP channel interference calibration', costZMW: 3200, technician: 'Cisco Certified Partner Solwezi', status: 'COMPLETED' },
    ],
  },
  {
    id: 'ast-013',
    assetTag: 'LSS-IT-2025-004',
    barcode: 'BC-IT-661004',
    name: '25-Seat Primary Computer Lab Touchscreen Tablets & Charging Trolley',
    category: 'IT_COMPUTING',
    campus: 'Urban Campus (Solwezi Central)',
    locationRoom: 'Urban Campus Discovery Lab (Room D1)',
    serialNumber: 'LEN-M10-TAB-SET25',
    manufacturer: 'Lenovo',
    model: 'Tab M10 FHD Plus with Rugged Armor Cases',
    purchaseDate: '2025-04-12',
    purchaseCostZMW: 165000,
    usefulLifeYears: 4,
    salvageValueZMW: 20000,
    depreciationMethod: 'STRAIGHT_LINE',
    accumulatedDepreciationZMW: 34800,
    currentNetBookValueZMW: 130200,
    condition: 'EXCELLENT',
    custodianName: 'Ms. Alice Banda (Primary Head)',
    custodianStaffId: 'LSS-URB-001',
    lastServiceDate: '2026-01-18',
    nextServiceDate: '2026-06-18',
    maintenanceHistory: [
      { id: 'mnt-015', date: '2026-01-18', description: 'Screen protector renewal & literacy app licensing update', costZMW: 2900, technician: 'Mr. Kelvin Mwila', status: 'COMPLETED' },
    ],
  },

  // 5. BOARDING VILLAGE RESIDENTIAL ASSETS
  {
    id: 'ast-014',
    assetTag: 'LSS-BRD-2023-001',
    barcode: 'BC-BRD-551001',
    name: 'Heavy-Duty Industrial Mild Steel Bunk Bed Frames (175 Units / 350 Beds)',
    category: 'BOARDING_RESIDENTIAL',
    campus: 'Mushitala Campus (Near Kansanshi)',
    locationRoom: 'Kansanshi Boys & Kalumbila Girls Boarding Halls',
    serialNumber: 'SOL-BUNK-HD-SET175',
    manufacturer: 'Copperbelt Engineering Fabricators',
    model: 'Heavy Gauge 50mm Round Tube Double Bunk with Guard Rails',
    purchaseDate: '2023-11-20',
    purchaseCostZMW: 420000,
    usefulLifeYears: 12,
    salvageValueZMW: 45000,
    depreciationMethod: 'STRAIGHT_LINE',
    accumulatedDepreciationZMW: 72900,
    currentNetBookValueZMW: 347100,
    condition: 'GOOD',
    custodianName: 'Mr. Davies Mumba (Boarding Master)',
    custodianStaffId: 'LSS-BRD-001',
    lastServiceDate: '2025-12-15',
    nextServiceDate: '2026-06-15',
    maintenanceHistory: [
      { id: 'mnt-016', date: '2025-12-15', description: 'Holiday maintenance: Re-welding ladder rungs and anti-rust gloss paint coat', costZMW: 12800, technician: 'Solwezi Artisan Welder', status: 'COMPLETED' },
    ],
  },
  {
    id: 'ast-015',
    assetTag: 'LSS-BRD-2024-002',
    barcode: 'BC-BRD-551002',
    name: 'Commercial Heavy-Duty Orthopaedic High-Density Mattresses (350 Units)',
    category: 'BOARDING_RESIDENTIAL',
    campus: 'Mushitala Campus (Near Kansanshi)',
    locationRoom: 'Kansanshi & Kalumbila Dormitories',
    serialNumber: 'MAT-VITA-HD-SET350',
    manufacturer: 'Vitafoam Zambia Ltd',
    model: 'Class A High Density Fire-Retardant PVC Water-Resistant Core',
    purchaseDate: '2024-01-05',
    purchaseCostZMW: 385000,
    usefulLifeYears: 5,
    salvageValueZMW: 30000,
    depreciationMethod: 'STRAIGHT_LINE',
    accumulatedDepreciationZMW: 153800,
    currentNetBookValueZMW: 231200,
    condition: 'EXCELLENT',
    custodianName: 'Mrs. Gertrude Mwila (Matron)',
    custodianStaffId: 'LSS-BRD-002',
    lastServiceDate: '2026-01-08',
    nextServiceDate: '2026-07-08',
    maintenanceHistory: [
      { id: 'mnt-017', date: '2026-01-08', description: 'Hygiene sanitization steam cleaning & tear inspection', costZMW: 8500, technician: 'Solwezi Hygiene Services', status: 'COMPLETED' },
    ],
  },
  {
    id: 'ast-016',
    assetTag: 'LSS-BRD-2024-003',
    barcode: 'BC-BRD-551003',
    name: 'Commercial Laundry Washing Machines & Industrial Dryers (Set of 4)',
    category: 'BOARDING_RESIDENTIAL',
    campus: 'Mushitala Campus (Near Kansanshi)',
    locationRoom: 'Boarding Village Laundry Complex',
    serialNumber: 'SPD-QN-COMM-SET4',
    manufacturer: 'Speed Queen / Alliance Laundry',
    model: 'SC030 14kg Industrial Extractor & Dryer Pairs',
    purchaseDate: '2024-06-25',
    purchaseCostZMW: 280000,
    usefulLifeYears: 8,
    salvageValueZMW: 30000,
    depreciationMethod: 'STRAIGHT_LINE',
    accumulatedDepreciationZMW: 53100,
    currentNetBookValueZMW: 226900,
    condition: 'MAINTENANCE_REQUIRED',
    custodianName: 'Mrs. Gertrude Mwila (Matron)',
    custodianStaffId: 'LSS-BRD-002',
    lastServiceDate: '2025-10-15',
    nextServiceDate: '2026-03-25',
    maintenanceHistory: [
      { id: 'mnt-018', date: '2025-10-15', description: 'Drain pump valve replacement on Unit #2', costZMW: 4800, technician: 'ElectroTech Laundry Ndola', status: 'COMPLETED' },
      { id: 'mnt-019', date: '2026-03-25', description: 'Scheduled V-belt drive replacement and drum balance calibration', costZMW: 6200, technician: 'ElectroTech Laundry Ndola', status: 'SCHEDULED' },
    ],
  },

  // 6. SPORTS & RECREATION FACILITIES
  {
    id: 'ast-017',
    assetTag: 'LSS-SPT-2024-001',
    barcode: 'BC-SPT-441001',
    name: 'All-Weather FIFA-Spec Futsal Synthetic Turf Pitch & Perimeter Floodlights',
    category: 'SPORTS_FACILITIES',
    campus: 'Mushitala Campus (Near Kansanshi)',
    locationRoom: 'Campus Sports Complex (North Field)',
    serialNumber: 'TURF-SOL-FUTSAL-2024',
    manufacturer: 'ActGlobal Sports',
    model: 'Xtreme Turf 50mm with High-Lux LED Towers',
    purchaseDate: '2024-07-15',
    purchaseCostZMW: 540000,
    usefulLifeYears: 10,
    salvageValueZMW: 50000,
    depreciationMethod: 'STRAIGHT_LINE',
    accumulatedDepreciationZMW: 81700,
    currentNetBookValueZMW: 458300,
    condition: 'EXCELLENT',
    custodianName: 'Mr. Boyd Chanda (Sports Director)',
    custodianStaffId: 'LSS-SPT-001',
    lastServiceDate: '2026-01-12',
    nextServiceDate: '2026-06-12',
    maintenanceHistory: [
      { id: 'mnt-020', date: '2026-01-12', description: 'Infill grooming & drainage channel de-silting before athletics term', costZMW: 7500, technician: 'PitchMaster Zambia', status: 'COMPLETED' },
    ],
  },
  {
    id: 'ast-018',
    assetTag: 'LSS-SPT-2024-002',
    barcode: 'BC-SPT-441002',
    name: 'Competition Table Tennis Tables & Electronic Scoring Consoles (4 Sets)',
    category: 'SPORTS_FACILITIES',
    campus: 'Mushitala Campus (Near Kansanshi)',
    locationRoom: 'Indoor Student Recreation Hall (Dining Wing)',
    serialNumber: 'STIGA-EXP-SET4',
    manufacturer: 'Stiga Sports',
    model: 'Expert Roller 25mm ITTF Approved',
    purchaseDate: '2024-09-10',
    purchaseCostZMW: 68000,
    usefulLifeYears: 6,
    salvageValueZMW: 8000,
    depreciationMethod: 'STRAIGHT_LINE',
    accumulatedDepreciationZMW: 16000,
    currentNetBookValueZMW: 52000,
    condition: 'EXCELLENT',
    custodianName: 'Mr. Boyd Chanda (Sports Director)',
    custodianStaffId: 'LSS-SPT-001',
    lastServiceDate: '2026-01-05',
    nextServiceDate: '2026-07-05',
    maintenanceHistory: [
      { id: 'mnt-021', date: '2026-01-05', description: 'Net tensioners replacement and edge guard repair', costZMW: 1800, technician: 'SportsWorld Kitwe', status: 'COMPLETED' },
    ],
  },

  // 7. CLASSROOM & AUDITORIUM FURNITURE
  {
    id: 'ast-019',
    assetTag: 'LSS-FRN-2024-001',
    barcode: 'BC-FRN-331001',
    name: 'Ergonomic Secondary Student Steel Desks & Chairs (240 Pairs)',
    category: 'FURNITURE_CLASSROOM',
    campus: 'Mushitala Campus (Near Kansanshi)',
    locationRoom: 'Secondary Academic Classrooms (Forms 1 to 5)',
    serialNumber: 'FRN-SEC-DESK-240SET',
    manufacturer: 'Copperbelt Wood & Steel Works',
    model: 'Single-Seater Powder-Coated Steel Frame with Hardwood Top',
    purchaseDate: '2024-01-02',
    purchaseCostZMW: 265000,
    usefulLifeYears: 10,
    salvageValueZMW: 30000,
    depreciationMethod: 'STRAIGHT_LINE',
    accumulatedDepreciationZMW: 49400,
    currentNetBookValueZMW: 215600,
    condition: 'GOOD',
    custodianName: 'Eng. Patrick Banda',
    custodianStaffId: 'LSS-OPS-004',
    lastServiceDate: '2025-12-18',
    nextServiceDate: '2026-06-18',
    maintenanceHistory: [
      { id: 'mnt-022', date: '2025-12-18', description: 'Rubber feet replacement and varnish top re-coating', costZMW: 8200, technician: 'Solwezi Carpentry Cooperative', status: 'COMPLETED' },
    ],
  },
  {
    id: 'ast-020',
    assetTag: 'LSS-FRN-2024-002',
    barcode: 'BC-FRN-331002',
    name: 'Early Childhood & Primary Modular Group Desks (180 Sets)',
    category: 'FURNITURE_CLASSROOM',
    campus: 'Urban Campus (Solwezi Central)',
    locationRoom: 'Urban Primary & Nursery Classrooms',
    serialNumber: 'FRN-PRI-MOD-180SET',
    manufacturer: 'EduFurniture Lusaka',
    model: 'Trapezoidal Collaborative Desks with Rounded Safety Edges',
    purchaseDate: '2024-02-15',
    purchaseCostZMW: 198000,
    usefulLifeYears: 8,
    salvageValueZMW: 20000,
    depreciationMethod: 'STRAIGHT_LINE',
    accumulatedDepreciationZMW: 46800,
    currentNetBookValueZMW: 151200,
    condition: 'EXCELLENT',
    custodianName: 'Ms. Alice Banda (Primary Head)',
    custodianStaffId: 'LSS-URB-001',
    lastServiceDate: '2026-01-10',
    nextServiceDate: '2026-06-10',
    maintenanceHistory: [
      { id: 'mnt-023', date: '2026-01-10', description: 'Edge trim reinforcement and anti-scratch cleaning', costZMW: 3500, technician: 'Urban Campus Maintenance', status: 'COMPLETED' },
    ],
  },
];

// Helper calculations for Asset KPI Dashboards
export function calculateAssetMetrics(assets: SchoolAssetItem[]) {
  const totalAssetsCount = assets.length;
  const totalPurchaseCost = assets.reduce((sum, a) => sum + a.purchaseCostZMW, 0);
  const totalAccumulatedDepreciation = assets.reduce((sum, a) => sum + a.accumulatedDepreciationZMW, 0);
  const totalNetBookValue = assets.reduce((sum, a) => sum + a.currentNetBookValueZMW, 0);
  const assetsRequiringMaintenance = assets.filter((a) => a.condition === 'MAINTENANCE_REQUIRED').length;
  const excellentConditionCount = assets.filter((a) => a.condition === 'EXCELLENT').length;

  const categoryBreakdown = Object.values(
    assets.reduce((acc: any, a) => {
      if (!acc[a.category]) {
        acc[a.category] = { category: a.category, count: 0, valuationZMW: 0 };
      }
      acc[a.category].count++;
      acc[a.category].valuationZMW += a.currentNetBookValueZMW;
      return acc;
    }, {})
  );

  const campusDistribution = [
    {
      campus: 'Mushitala Campus (Near Kansanshi)',
      count: assets.filter((a) => a.campus.includes('Mushitala')).length,
      valuationZMW: assets
        .filter((a) => a.campus.includes('Mushitala'))
        .reduce((sum, a) => sum + a.currentNetBookValueZMW, 0),
    },
    {
      campus: 'Urban Campus (Solwezi Central)',
      count: assets.filter((a) => a.campus.includes('Urban')).length,
      valuationZMW: assets
        .filter((a) => a.campus.includes('Urban'))
        .reduce((sum, a) => sum + a.currentNetBookValueZMW, 0),
    },
  ];

  return {
    totalAssetsCount,
    totalPurchaseCost,
    totalAccumulatedDepreciation,
    totalNetBookValue,
    assetsRequiringMaintenance,
    excellentConditionCount,
    categoryBreakdown,
    campusDistribution,
  };
}
