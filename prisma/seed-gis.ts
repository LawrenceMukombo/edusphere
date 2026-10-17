import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding GIS Multi-Campus Data ---');

  const org = await prisma.organisation.findFirst({
    where: { code: 'EDS-ZM-001' },
  });

  if (!org) {
    console.error('Organisation EDS-ZM-001 not found.');
    return;
  }

  const orgId = org.id;

  // 1. Update Senior Campus - Kabulonga with GIS coordinates
  const seniorCampus = await prisma.campus.findFirst({
    where: { organisationId: orgId, code: 'MC' },
  });
  if (seniorCampus) {
    await prisma.campus.update({
      where: { id: seniorCampus.id },
      data: {
        latitude: -15.4248,
        longitude: 28.3486,
        elevationMeters: 1280,
        catchmentRadiusKm: 8.0,
        capacity: 750,
        campusType: 'MAIN_CAMPUS',
        landAreaHectares: 4.8,
        contactEmail: 'kabulonga@edusphere.co.zm',
        headTeacherName: 'Mrs. Gertrude Mwape',
        facilitiesJson: JSON.stringify([
          'Senior STEM Laboratories',
          'Olympic-sized Swimming Pool',
          'ICT Innovation Hub',
          'Auditorium (800 seats)',
          'Modern Library & Resource Centre',
          'Full-time Sick Bay & Resident Nurse',
          'Football Pitch & Track',
        ]),
      },
    });
    console.log('Updated Senior Campus GIS.');
  }

  // 2. Update Junior Campus - Woodlands with GIS coordinates
  const juniorCampus = await prisma.campus.findFirst({
    where: { organisationId: orgId, code: 'JC' },
  });
  if (juniorCampus) {
    await prisma.campus.update({
      where: { id: juniorCampus.id },
      data: {
        latitude: -15.4410,
        longitude: 28.3375,
        elevationMeters: 1275,
        catchmentRadiusKm: 6.0,
        capacity: 550,
        campusType: 'BRANCH',
        landAreaHectares: 3.2,
        contactEmail: 'woodlands@edusphere.co.zm',
        headTeacherName: 'Mr. Emmanuel Bwalya',
        facilitiesJson: JSON.stringify([
          'Junior Science Discovery Lab',
          'Early Childhood Learning Pavilion',
          'Junior Computer Centre (40 Workstations)',
          'Multipurpose Sports Hall',
          'Reading Garden & Library',
          'First Aid Station',
        ]),
      },
    });
    console.log('Updated Junior Campus GIS.');
  }

  // 3. Upsert Avondale / Chelstone Branch (AV)
  const avondaleBranch = await prisma.campus.upsert({
    where: { organisationId_code: { organisationId: orgId, code: 'AV' } },
    update: {
      latitude: -15.3780,
      longitude: 28.3890,
      elevationMeters: 1290,
      catchmentRadiusKm: 7.0,
      capacity: 450,
      campusType: 'BRANCH',
      landAreaHectares: 2.8,
      contactEmail: 'avondale@edusphere.co.zm',
      headTeacherName: 'Ms. Namatama Phiri',
      facilitiesJson: JSON.stringify([
        'Primary & Lower Secondary Classrooms',
        'Modern Computer Laboratory',
        'All-weather Basketball Court',
        'Art & Music Studio',
        'Cafeteria',
      ]),
    },
    create: {
      organisationId: orgId,
      name: 'North-East Campus - Avondale',
      code: 'AV',
      address: 'Plot 1044, Gardenia Road, Avondale',
      city: 'Lusaka',
      phone: '+260 211 290123',
      isMainCampus: false,
      isActive: true,
      latitude: -15.3780,
      longitude: 28.3890,
      elevationMeters: 1290,
      catchmentRadiusKm: 7.0,
      capacity: 450,
      campusType: 'BRANCH',
      landAreaHectares: 2.8,
      contactEmail: 'avondale@edusphere.co.zm',
      headTeacherName: 'Ms. Namatama Phiri',
      facilitiesJson: JSON.stringify([
        'Primary & Lower Secondary Classrooms',
        'Modern Computer Laboratory',
        'All-weather Basketball Court',
        'Art & Music Studio',
        'Cafeteria',
      ]),
    },
  });
  console.log('Upserted Avondale Branch.');

  // 4. Upsert Roma / Olympia Early Years Annex (RM)
  const romaBranch = await prisma.campus.upsert({
    where: { organisationId_code: { organisationId: orgId, code: 'RM' } },
    update: {
      latitude: -15.3850,
      longitude: 28.3050,
      elevationMeters: 1285,
      catchmentRadiusKm: 5.0,
      capacity: 350,
      campusType: 'EARLY_YEARS',
      landAreaHectares: 2.1,
      contactEmail: 'roma@edusphere.co.zm',
      headTeacherName: 'Mrs. Chileshe Mulenga',
      facilitiesJson: JSON.stringify([
        'Montessori Kindergarten Units',
        'Sensory Play Garden & Splash Pool',
        'Toddler Dining & Rest Suites',
        'Parents Consultation Hub',
      ]),
    },
    create: {
      organisationId: orgId,
      name: 'North Campus - Roma & Olympia Annex',
      code: 'RM',
      address: 'Plot 55, Zambezi Road, Roma',
      city: 'Lusaka',
      phone: '+260 211 293456',
      isMainCampus: false,
      isActive: true,
      latitude: -15.3850,
      longitude: 28.3050,
      elevationMeters: 1285,
      catchmentRadiusKm: 5.0,
      capacity: 350,
      campusType: 'EARLY_YEARS',
      landAreaHectares: 2.1,
      contactEmail: 'roma@edusphere.co.zm',
      headTeacherName: 'Mrs. Chileshe Mulenga',
      facilitiesJson: JSON.stringify([
        'Montessori Kindergarten Units',
        'Sensory Play Garden & Splash Pool',
        'Toddler Dining & Rest Suites',
        'Parents Consultation Hub',
      ]),
    },
  });
  console.log('Upserted Roma Branch.');

  // 5. Catchment Zones
  const existingCatchments = await prisma.catchmentZone.findMany({ where: { organisationId: orgId } });
  if (existingCatchments.length === 0 && seniorCampus && juniorCampus) {
    await prisma.catchmentZone.createMany({
      data: [
        {
          organisationId: orgId,
          campusId: seniorCampus.id,
          zoneName: 'Kabulonga - Ibex Hill - Sunningdale Zone',
          radiusKm: 8.0,
          centerLatitude: -15.4248,
          centerLongitude: 28.3486,
          description: 'Primary feeder zone for Senior School boarding and day scholars',
        },
        {
          organisationId: orgId,
          campusId: juniorCampus.id,
          zoneName: 'Woodlands - Chalala - Nyumba Yanga Feeder',
          radiusKm: 6.0,
          centerLatitude: -15.4410,
          centerLongitude: 28.3375,
          description: 'High-density urban catchment for Early Childhood & Primary learners',
        },
        {
          organisationId: orgId,
          campusId: avondaleBranch.id,
          zoneName: 'Avondale - Chelstone - Munali Zone',
          radiusKm: 7.0,
          centerLatitude: -15.3780,
          centerLongitude: 28.3890,
          description: 'Eastern suburbs commuter belt catchment',
        },
        {
          organisationId: orgId,
          campusId: romaBranch.id,
          zoneName: 'Roma - Kalundu - Olympia Park Zone',
          radiusKm: 5.0,
          centerLatitude: -15.3850,
          centerLongitude: 28.3050,
          description: 'Early Years and Foundation primary catchment zone',
        },
      ],
    });
    console.log('Created Catchment Zones.');
  }

  // 6. Transport Routes (Inter-campus and shuttle lines)
  if (seniorCampus && juniorCampus) {
    await prisma.transportRoute.upsert({
      where: { organisationId_routeCode: { organisationId: orgId, routeCode: 'BUS-01' } },
      update: {},
      create: {
        organisationId: orgId,
        campusId: seniorCampus.id,
        routeCode: 'BUS-01',
        routeName: 'Woodlands Chalala -> Senior Campus Shuttle',
        vehicleReg: 'BAX 2939 ZM',
        driverName: 'Mr. Patrick Tembo',
        driverPhone: '+260 977 112233',
        capacity: 32,
        fareZMW: 1200.0,
        stopsJson: JSON.stringify([
          { name: 'Chalala Mall', latitude: -15.462, longitude: 28.341, morningTime: '06:30', afternoonTime: '15:45' },
          { name: 'Woodlands Junior Campus', latitude: -15.441, longitude: 28.3375, morningTime: '06:50', afternoonTime: '15:25' },
          { name: 'Crossroads Shopping Centre', latitude: -15.432, longitude: 28.345, morningTime: '07:05', afternoonTime: '15:10' },
          { name: 'Senior Campus - Kabulonga', latitude: -15.4248, longitude: 28.3486, morningTime: '07:20', afternoonTime: '15:00' },
        ]),
      },
    });

    await prisma.transportRoute.upsert({
      where: { organisationId_routeCode: { organisationId: orgId, routeCode: 'BUS-02' } },
      update: {},
      create: {
        organisationId: orgId,
        campusId: avondaleBranch.id,
        routeCode: 'BUS-02',
        routeName: 'Avondale -> Kabulonga Senior Inter-Branch Shuttle',
        vehicleReg: 'ABC 8841 ZM',
        driverName: 'Mr. Moses Lungu',
        driverPhone: '+260 966 445566',
        capacity: 28,
        fareZMW: 1400.0,
        stopsJson: JSON.stringify([
          { name: 'Chelstone Bazaar', latitude: -15.368, longitude: 28.398, morningTime: '06:25', afternoonTime: '15:50' },
          { name: 'Avondale Branch Campus', latitude: -15.378, longitude: 28.389, morningTime: '06:45', afternoonTime: '15:30' },
          { name: 'Chainama Golf Club', latitude: -15.395, longitude: 28.365, morningTime: '07:00', afternoonTime: '15:15' },
          { name: 'Senior Campus - Kabulonga', latitude: -15.4248, longitude: 28.3486, morningTime: '07:25', afternoonTime: '15:00' },
        ]),
      },
    });

    await prisma.transportRoute.upsert({
      where: { organisationId_routeCode: { organisationId: orgId, routeCode: 'BUS-03' } },
      update: {},
      create: {
        organisationId: orgId,
        campusId: romaBranch.id,
        routeCode: 'BUS-03',
        routeName: 'Roma -> Woodlands Foundation Transit',
        vehicleReg: 'BAC 3120 ZM',
        driverName: 'Mr. John Banda',
        driverPhone: '+260 971 778899',
        capacity: 24,
        fareZMW: 1100.0,
        stopsJson: JSON.stringify([
          { name: 'Foxdale Court Roma', latitude: -15.372, longitude: 28.309, morningTime: '06:35', afternoonTime: '15:40' },
          { name: 'Roma Annex Campus', latitude: -15.385, longitude: 28.305, morningTime: '06:50', afternoonTime: '15:25' },
          { name: 'Manda Hill / Arcades Junction', latitude: -15.399, longitude: 28.308, morningTime: '07:05', afternoonTime: '15:10' },
          { name: 'Woodlands Junior Campus', latitude: -15.441, longitude: 28.3375, morningTime: '07:25', afternoonTime: '15:00' },
        ]),
      },
    });
    console.log('Upserted Transport Routes.');
  }

  // 7. Update sample learners with residential area and coordinates
  const learners = await prisma.learner.findMany({
    where: { organisationId: orgId },
    take: 10,
  });

  const sampleAreas = [
    { area: 'Kabulonga', lat: -15.423, lng: 28.351 },
    { area: 'Woodlands Extension', lat: -15.445, lng: 28.335 },
    { area: 'Ibex Hill', lat: -15.418, lng: 28.375 },
    { area: 'Avondale', lat: -15.375, lng: 28.385 },
    { area: 'Roma', lat: -15.388, lng: 28.308 },
    { area: 'Nyumba Yanga', lat: -15.448, lng: 28.352 },
  ];

  for (let i = 0; i < learners.length; i++) {
    const l = learners[i];
    const loc = sampleAreas[i % sampleAreas.length];
    await prisma.learner.update({
      where: { id: l.id },
      data: {
        residentialArea: loc.area,
        latitude: loc.lat,
        longitude: loc.lng,
      },
    });
  }
  console.log('Updated learners with residential coordinates.');

  console.log('--- GIS Multi-Campus Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
