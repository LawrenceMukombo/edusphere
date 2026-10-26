import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const app = await prisma.admissionApplication.findFirst({
    where: { firstName: 'Kabaso' },
    include: { statusHistory: true },
  });
  if (!app) {
    console.log('Applicant not found');
    return;
  }
  console.log('=== VERIFIED SAVED EXPANDED APPLICANT ===');
  console.log('App Number:', app.applicationNumber);
  console.log('Full Name:', app.firstName, app.middleName, app.lastName);
  console.log('Status:', app.status);
  console.log('Intake:', app.intakeLabel);
  console.log('Programme:', app.programmeChoice);

  const m = JSON.parse(app.statusHistory[0].metadataJson || '{}');
  console.log('Zambian NRC:', m.nrc);
  console.log('Secondary School:', m.school);
  console.log('ECZ Exam #:', m.examNumber);
  console.log('Sponsor Body:', m.sponsor);
  console.log('Residential Address:', m.residentialAddress);
  console.log('Evaluated Subjects Count:', m.subjects?.length);
  console.log('Subjects:');
  m.subjects?.forEach((s: any) => console.log(`  - ${s.name}: Grade ${s.grade}`));
  console.log('Uploaded Documents Count:', m.documents?.length);
  console.log('Documents:');
  m.documents?.forEach((d: any) => console.log(`  - [${d.category}] ${d.name} (${d.size})`));
}

check().catch(console.error).finally(() => prisma.$disconnect());
