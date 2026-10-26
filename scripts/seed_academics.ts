import { prisma as db } from '../src/server/db';
const prisma = db as any;

async function main() {
  console.log('--- Seeding/Verifying NWUCHAS Academics ---');

  const org = await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } });
  if (!org) {
    console.error('NWUCHAS organization not found.');
    return;
  }

  // Ensure course modules
  const nur112 = await prisma.courseModule.findFirst({ where: { code: 'NUR-112' } });
  const med111 = await prisma.courseModule.findFirst({ where: { code: 'MED-111' } });

  if (!nur112 || !med111) {
    console.error('Core modules not found.');
    return;
  }

  // 1. Ensure OSCE Stations
  const stations = [
    {
      courseModuleId: nur112.id,
      stationNumber: 1,
      title: 'Station 1: Aseptic Wound Dressing & Suture Removal',
      domain: 'CLINICAL_SKILLS',
      maxScore: 20.00,
      timeAllowedMins: 8,
      checklistJson: JSON.stringify([
        { item: 'Perform correct surgical hand hygiene & donn sterile gloves', marks: 4 },
        { item: 'Prepare sterile field, antiseptic solution and forceps', marks: 4 },
        { item: 'Demonstrate non-touch technique during cleansing', marks: 5 },
        { item: 'Cut suture beneath knot and extract gently without tension', marks: 4 },
        { item: 'Patient communication, sharps disposal and documentation', marks: 3 },
      ]),
    },
    {
      courseModuleId: med111.id,
      stationNumber: 2,
      title: 'Station 2: Adult & Pediatric Cardiopulmonary Resuscitation (CPR)',
      domain: 'EMERGENCY_MANAGEMENT',
      maxScore: 20.00,
      timeAllowedMins: 10,
      checklistJson: JSON.stringify([
        { item: 'Assess scene safety, responsiveness and call for emergency trolley', marks: 3 },
        { item: 'Check carotid pulse & breathing (< 10 seconds)', marks: 3 },
        { item: 'Deliver 30 chest compressions at 100-120 bpm at 5-6 cm depth', marks: 6 },
        { item: 'Open airway (head-tilt chin-lift) and deliver 2 rescue breaths via BVM', marks: 4 },
        { item: 'Operate AED: Attach pads, clear patient, deliver shock if indicated', marks: 4 },
      ]),
    },
    {
      courseModuleId: nur112.id,
      stationNumber: 3,
      title: 'Station 3: Pediatric Drug Dosage Calculation & IV Cannulation',
      domain: 'CLINICAL_SKILLS',
      maxScore: 20.00,
      timeAllowedMins: 7,
      checklistJson: JSON.stringify([
        { item: 'Verify prescription, patient 5 Rights & calculate mg/kg dosage accurately', marks: 5 },
        { item: 'Select appropriate gauge cannula (24G/22G) and inspect vein', marks: 3 },
        { item: 'Apply tourniquet, disinfect site with chlorhexidine/alcohol', marks: 3 },
        { item: 'Cannulate at 15-30 deg angle, confirm flashback, advance catheter', marks: 5 },
        { item: 'Flush with normal saline, secure with dressing and label date/time', marks: 4 },
      ]),
    },
    {
      courseModuleId: nur112.id,
      stationNumber: 4,
      title: 'Station 4: Normal Spontaneous Vertex Delivery & Immediate Newborn Care',
      domain: 'OBSTETRICS_MIDWIFERY',
      maxScore: 20.00,
      timeAllowedMins: 12,
      checklistJson: JSON.stringify([
        { item: 'Support perineum with dominant hand while controlling crowning', marks: 4 },
        { item: 'Check for nuchal cord around neck and slip over head if loose', marks: 3 },
        { item: 'Assist restitution and deliver anterior then posterior shoulder', marks: 4 },
        { item: 'Place infant on maternal abdomen for immediate skin-to-skin', marks: 3 },
        { item: 'Dry infant thoroughly, clamp and cut cord after 1-3 minutes, assess APGAR', marks: 6 },
      ]),
    },
  ];

  for (const st of stations) {
    const existing = await prisma.osceStation.findFirst({
      where: { stationNumber: st.stationNumber },
    });
    if (!existing) {
      await prisma.osceStation.create({ data: st });
      console.log('✓ Created OSCE Station:', st.title);
    } else {
      console.log('✓ OSCE Station already present:', existing.title);
    }
  }

  // 2. Ensure Course Registrations have representative status breakdown (DRAFT, SUBMITTED, MODERATED, APPROVED, PUBLISHED)
  const regs = await prisma.courseRegistration.findMany({ take: 10 });
  console.log(`✓ Total Course Registrations in DB: ${regs.length}`);

  // Seed sample OSCE results if none exist
  const osceCount = await prisma.osceResult.count();
  if (osceCount === 0) {
    const learners = await prisma.learner.findMany({ take: 4 });
    const station1 = await prisma.osceStation.findFirst({ where: { stationNumber: 1 } });
    const station2 = await prisma.osceStation.findFirst({ where: { stationNumber: 2 } });
    const supervisor = await prisma.clinicalSupervisor.findFirst();

    if (station1 && learners[0]) {
      await prisma.osceResult.create({
        data: {
          stationId: station1.id,
          learnerId: learners[0].id,
          examinerId: supervisor?.id || 'EXAM-01',
          scoreObtained: 18.5,
          isPassed: true,
          feedback: 'Excellent aseptic technique. Non-touch handling maintained throughout.',
        },
      });
      console.log('✓ Seeded sample OSCE result for learner 1 on Station 1');
    }
    if (station2 && learners[1]) {
      await prisma.osceResult.create({
        data: {
          stationId: station2.id,
          learnerId: learners[1].id,
          examinerId: supervisor?.id || 'EXAM-01',
          scoreObtained: 17.0,
          isPassed: true,
          feedback: 'Good compression depth (5.5cm) and cadence. Calm resuscitation lead.',
        },
      });
      console.log('✓ Seeded sample OSCE result for learner 2 on Station 2');
    }
  }

  console.log('Academics seed complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
