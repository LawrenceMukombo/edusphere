import { describe, it, expect } from 'vitest';
import { generateApplicationNumber, generateStudentNumber } from '../src/server/services/sequence.service';

describe('Phase 2: Public Landing Site & Clean Application Journey Verification', () => {
  it('generates formal collision-resistant NWU-APP application numbers without Math.random()', () => {
    const appNum1 = generateApplicationNumber(2026);
    const appNum2 = generateApplicationNumber(2026);
    expect(appNum1).toMatch(/^NWU-APP-2026-\d{4,}$/);
    expect(appNum2).toMatch(/^NWU-APP-2026-\d{4,}$/);
    expect(appNum1).not.toBe(appNum2);
  });

  it('generates formal matriculated student numbers in NWU-YYYY-XXXX format', () => {
    const stuNum1 = generateStudentNumber(2026);
    const stuNum2 = generateStudentNumber(2026);
    expect(stuNum1).toMatch(/^NWU-2026-\d{4}$/);
    expect(stuNum2).toMatch(/^NWU-2026-\d{4}$/);
    expect(stuNum1).not.toBe(stuNum2);
  });

  it('verifies that public landing page content contains official NWUCHAS identity and no school-era EduSphere fixtures', async () => {
    const fs = await import('fs');
    const landingContent = fs.readFileSync('src/app/page.tsx', 'utf-8');

    // Must contain official institutional name and key programmes
    expect(landingContent).toContain('North Western University College of Health and Applied Sciences');
    expect(landingContent).toContain('NWUCHAS');
    expect(landingContent).toContain('Diploma in Registered Nursing');
    expect(landingContent).toContain('Diploma in Clinical Medicine');
    expect(landingContent).toContain('Manyama');
    expect(landingContent).toContain('Lumwana');

    // Must NOT contain school-era or legacy LMS concepts
    expect(landingContent).not.toContain('EduSphere');
    expect(landingContent).not.toContain('Legacy School');
    expect(landingContent).not.toContain('Headteacher');
    expect(landingContent).not.toContain('learnersCount || 420');
    expect(landingContent).not.toContain('totalCollections > 0 ? totalCollections : 2845000');
  });

  it('verifies that prospective application portal has clean initial state without prefilled placeholder candidate details', async () => {
    const fs = await import('fs');
    const applyContent = fs.readFileSync('src/app/apply/page.tsx', 'utf-8');

    // Must NOT have prefilled demo candidate data
    expect(applyContent).not.toContain("dateOfBirth: '2005-04-12'");
    expect(applyContent).not.toContain("gender: 'Female'");
    expect(applyContent).not.toContain("name: 'ECZ_Statement_Of_Results_Certified.pdf'");
    expect(applyContent).not.toContain("name: 'NRC_Identity_Document_Front_Back.pdf'");
    expect(applyContent).not.toContain("{ name: 'English Language', grade: '2' }");

    // Must have clean empty defaults
    expect(applyContent).toContain("dateOfBirth: ''");
    expect(applyContent).toContain("gender: ''");
    expect(applyContent).toContain("documents, setDocuments] = useState<UploadedDocument[]>([])");
  });

  it('verifies that executive dashboard has been relocated to /portal/executive and purged of fabricated fallbacks', async () => {
    const fs = await import('fs');
    expect(fs.existsSync('src/app/portal/executive/page.tsx')).toBe(true);

    const execContent = fs.readFileSync('src/app/portal/executive/page.tsx', 'utf-8');
    // Must NOT contain fabricated fallback numbers
    expect(execContent).not.toContain('learnersCount || 420');
    expect(execContent).not.toContain('placementsCount || 24');
    expect(execContent).not.toContain('clinicalSitesCount || 3');
    expect(execContent).not.toContain('2845000');
  });

  it('verifies NwuchasShell isolates public pages from internal staff command navigation', async () => {
    const fs = await import('fs');
    const shellContent = fs.readFileSync('src/components/NwuchasShell.tsx', 'utf-8');

    // Must detect public routes and bypass internal staff shell
    expect(shellContent).toContain('const isPublicRoute');
    expect(shellContent).toContain("pathname === '/'");
    expect(shellContent).toContain("pathname.startsWith('/apply')");
    expect(shellContent).toContain("pathname.startsWith('/login')");
    expect(shellContent).toContain('if (isPublicRoute)');
    expect(shellContent).toContain('/portal/executive');
  });
});
