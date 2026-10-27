import { describe, it, expect } from 'vitest';
import { SystemRole } from '@prisma/client';
import { DEFAULT_CONTENT_CARDS, ContentCardItem } from '../src/lib/contentCards';
import { ContentCardService } from '../src/server/services/content.service';
import { hasPermission } from '../src/server/authorization';
import { prisma } from '../src/server/db';

describe('NWUCHAS Institutional Content Cards & CMS System', () => {
  it('has comprehensive statutory cards registered for landing and about sections', () => {
    expect(DEFAULT_CONTENT_CARDS.length).toBeGreaterThanOrEqual(18);

    const heroCard = DEFAULT_CONTENT_CARDS.find((c) => c.cardKey === 'hero_main');
    expect(heroCard).toBeDefined();
    expect(heroCard?.title).toContain('Empowering the Next Generation');
    expect(heroCard?.sectionKey).toBe('hero');

    const rnCard = DEFAULT_CONTENT_CARDS.find((c) => c.cardKey === 'prog_rn');
    expect(rnCard).toBeDefined();
    expect(rnCard?.title).toBe('Diploma in Registered Nursing (RN)');
    expect(rnCard?.badge).toBe('NMCZ Accredited');

    const clinMedCard = DEFAULT_CONTENT_CARDS.find((c) => c.cardKey === 'prog_coe');
    expect(clinMedCard).toBeDefined();
    expect(clinMedCard?.title).toBe('Diploma in Clinical Medicine (COG)');

    const pubHealthCard = DEFAULT_CONTENT_CARDS.find((c) => c.cardKey === 'prog_ph');
    expect(pubHealthCard).toBeDefined();
    expect(pubHealthCard?.title).toBe('Diploma in Public Health');
  });

  it('enforces RBAC content:manage permissions strictly', () => {
    // Authorized roles
    expect(hasPermission(SystemRole.PLATFORM_SUPER_ADMIN, 'content:manage')).toBe(true);
    expect(hasPermission(SystemRole.SCHOOL_PROPRIETOR, 'content:manage')).toBe(true);
    expect(hasPermission(SystemRole.INSTITUTION_ADMIN, 'content:manage')).toBe(true);
    expect(hasPermission(SystemRole.IT_ADMIN, 'content:manage')).toBe(true);
    expect(hasPermission(SystemRole.REGISTRAR, 'content:manage')).toBe(true);

    // Restricted roles
    expect(hasPermission(SystemRole.LEARNER, 'content:manage')).toBe(false);
    expect(hasPermission(SystemRole.PARENT_GUARDIAN, 'content:manage')).toBe(false);
    expect(hasPermission(SystemRole.CASHIER, 'content:manage')).toBe(false);
    expect(hasPermission(SystemRole.TEACHER, 'content:manage')).toBe(false);
    expect(hasPermission(SystemRole.APPLICANT, 'content:manage')).toBe(false);
  });

  it('retrieves default cards when database has no overrides', async () => {
    const org = await prisma.organisation.findFirst();
    const orgId = org?.id || 'test-org-id';

    const { cards, cardDict } = await ContentCardService.getCardsForPage(orgId, 'landing');
    expect(cards.length).toBeGreaterThanOrEqual(18);
    expect(cardDict['hero_main']).toBeDefined();
    expect(cardDict['hero_main'].cardKey).toBe('hero_main');
    expect(cardDict['vision']).toBeDefined();
    expect(cardDict['step_1']).toBeDefined();
  });

  it('upserts a card override and returns the merged card accurately', async () => {
    const org = await prisma.organisation.findFirst();
    if (!org) return;

    const realUser = await prisma.user.findFirst();

    const testAdminSession = {
      userId: realUser?.id || 'admin-uuid',
      organisationId: org.id,
      role: SystemRole.PLATFORM_SUPER_ADMIN,
      firstName: 'Dr. Joseph',
      lastName: 'Tembo',
      email: 'owner@nwuchas.edu.zm',
      isSuperAdmin: true,
      superAdminRole: 'SUPER_ADMIN' as const,
    };

    const updateInput = {
      pageKey: 'landing',
      sectionKey: 'hero',
      cardKey: 'hero_main',
      title: 'Empowering the Next Generation of Healthcare Leaders & Pioneers',
      subtitle: 'North Western University College of Health and Applied Sciences',
      badge: 'NMCZ & HPCZ Accredited Tertiary Institution',
      body: 'Pioneering healthcare education in Manyama, Lumwana, Zambia.',
      iconName: 'AcademicCapIcon',
      ctaLabel: 'Apply for 2026 Intake',
      ctaUrl: '/apply',
      metadata: {
        items: ['100% Accredited Curricula', 'Practical Hospital Ward Rotations'],
      },
    };

    // Upsert
    const saved = await ContentCardService.upsertCard(
      org.id,
      updateInput,
      testAdminSession as any
    );
    expect(saved.title).toBe(updateInput.title);
    expect(saved.isCustomized).toBe(true);

    // Verify it is returned in merged getCardsForPage
    const { cardDict } = await ContentCardService.getCardsForPage(org.id, 'landing');
    expect(cardDict['hero_main'].title).toBe(updateInput.title);
    expect(cardDict['hero_main'].isCustomized).toBe(true);

    // Reset back to statutory default
    await ContentCardService.resetCard(
      org.id,
      'landing',
      'hero',
      'hero_main',
      testAdminSession as any
    );

    // Verify reset reverts to default
    const resetResult = await ContentCardService.getCardsForPage(org.id, 'landing');
    expect(resetResult.cardDict['hero_main'].title).toBe('Empowering the Next Generation of Healthcare Pioneers');
    expect(resetResult.cardDict['hero_main'].isCustomized).toBe(false);
  });
});
