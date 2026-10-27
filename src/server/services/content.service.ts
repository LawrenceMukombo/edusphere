// src/server/services/content.service.ts — Institutional Dynamic Content Cards Management Service
import { prisma } from '../db';
import { AuthSession } from '../auth';
import { hasPermission } from '../authorization';
import { DEFAULT_CONTENT_CARDS, ContentCardItem } from '../../lib/contentCards';

export interface UpsertCardInput {
  pageKey: string;
  sectionKey: string;
  cardKey: string;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  body: string;
  iconName?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  metadata?: any;
  displayOrder?: number;
  isPublished?: boolean;
}

export class ContentCardService {
  /**
   * Retrieve merged cards (defaults + database overrides) for a page
   */
  static async getCardsForPage(organisationId?: string, pageKey: string = 'landing') {
    const p = prisma as any;
    let dbCards: any[] = [];

    if (organisationId) {
      dbCards = await p.institutionalContentCard.findMany({
        where: { organisationId, pageKey },
        orderBy: { displayOrder: 'asc' },
      });
    } else {
      // Fallback to first active organisation if not supplied
      const defaultOrg = await prisma.organisation.findFirst({ select: { id: true } });
      if (defaultOrg) {
        dbCards = await p.institutionalContentCard.findMany({
          where: { organisationId: defaultOrg.id, pageKey },
          orderBy: { displayOrder: 'asc' },
        });
      }
    }

    // Map DB overrides by unique composite key
    const dbCardMap = new Map<string, any>();
    for (const card of dbCards) {
      const compositeKey = `${card.pageKey}:${card.sectionKey}:${card.cardKey}`;
      let parsedMeta: any = undefined;
      if (card.metadataJson) {
        try {
          parsedMeta = JSON.parse(card.metadataJson);
        } catch {}
      }
      dbCardMap.set(compositeKey, {
        ...card,
        metadata: parsedMeta,
        isCustomized: true,
      });
    }

    // Merge over defaults
    const relevantDefaults = DEFAULT_CONTENT_CARDS.filter((c) => c.pageKey === pageKey);
    const resultMap = new Map<string, ContentCardItem & { id?: string; isCustomized?: boolean; lastEditedBy?: string }>();

    // 1. Populate defaults
    for (const def of relevantDefaults) {
      const compositeKey = `${def.pageKey}:${def.sectionKey}:${def.cardKey}`;
      resultMap.set(compositeKey, { ...def, isCustomized: false });
    }

    // 2. Overlay DB customizations (using forEach for downlevel ES compatibility)
    dbCardMap.forEach((dbCard, key) => {
      resultMap.set(key, {
        pageKey: dbCard.pageKey,
        sectionKey: dbCard.sectionKey,
        cardKey: dbCard.cardKey,
        id: dbCard.id,
        title: dbCard.title,
        subtitle: dbCard.subtitle || undefined,
        badge: dbCard.badge || undefined,
        body: dbCard.body,
        iconName: dbCard.iconName || undefined,
        ctaLabel: dbCard.ctaLabel || undefined,
        ctaUrl: dbCard.ctaUrl || undefined,
        metadata: dbCard.metadata,
        displayOrder: dbCard.displayOrder,
        isPublished: dbCard.isPublished,
        isCustomized: true,
        lastEditedBy: dbCard.lastEditedBy || undefined,
      });
    });

    const cardsArray = Array.from(resultMap.values());
    cardsArray.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

    // Also build a dictionary indexed by cardKey for instant O(1) lookups in components
    const cardDict: Record<string, typeof cardsArray[0]> = {};
    for (const card of cardsArray) {
      cardDict[card.cardKey] = card;
    }

    return {
      cards: cardsArray,
      cardDict,
    };
  }

  /**
   * Save or update an institutional content card (requires content:manage permission)
   */
  static async upsertCard(organisationId: string, input: UpsertCardInput, session: AuthSession) {
    if (!hasPermission(session.role, 'content:manage') && !session.isSuperAdmin) {
      throw new Error('Unauthorized: You do not have permission to edit institutional content cards.');
    }

    const p = prisma as any;
    const editorTag = `${session.firstName} ${session.lastName} (${session.email}) [${session.role}]`;
    const metadataJson = input.metadata ? JSON.stringify(input.metadata) : null;

    const savedCard = await p.institutionalContentCard.upsert({
      where: {
        organisationId_pageKey_sectionKey_cardKey: {
          organisationId,
          pageKey: input.pageKey,
          sectionKey: input.sectionKey,
          cardKey: input.cardKey,
        },
      },
      create: {
        organisationId,
        pageKey: input.pageKey,
        sectionKey: input.sectionKey,
        cardKey: input.cardKey,
        title: input.title.trim(),
        subtitle: input.subtitle?.trim() || null,
        badge: input.badge?.trim() || null,
        body: input.body.trim(),
        iconName: input.iconName?.trim() || null,
        ctaLabel: input.ctaLabel?.trim() || null,
        ctaUrl: input.ctaUrl?.trim() || null,
        metadataJson,
        displayOrder: input.displayOrder ?? 0,
        isPublished: input.isPublished ?? true,
        lastEditedBy: editorTag,
      },
      update: {
        title: input.title.trim(),
        subtitle: input.subtitle?.trim() || null,
        badge: input.badge?.trim() || null,
        body: input.body.trim(),
        iconName: input.iconName?.trim() || null,
        ctaLabel: input.ctaLabel?.trim() || null,
        ctaUrl: input.ctaUrl?.trim() || null,
        metadataJson,
        displayOrder: input.displayOrder ?? 0,
        isPublished: input.isPublished ?? true,
        lastEditedBy: editorTag,
      },
    });

    // Record institutional audit event
    try {
      await prisma.auditEvent.create({
        data: {
          organisationId,
          userId: session.userId,
          action: 'CONTENT_CARD_UPDATED',
          entityType: 'InstitutionalContentCard',
          entityId: savedCard.id,
          detailsJson: JSON.stringify({
            cardKey: input.cardKey,
            sectionKey: input.sectionKey,
            title: input.title,
            editedBy: editorTag,
          }),
        },
      });
    } catch {}

    let parsedMeta: any = undefined;
    if (savedCard.metadataJson) {
      try {
        parsedMeta = JSON.parse(savedCard.metadataJson);
      } catch {}
    }

    return {
      ...savedCard,
      metadata: parsedMeta,
      isCustomized: true,
    };
  }

  /**
   * Reset a card back to default by removing the custom database override
   */
  static async resetCard(
    organisationId: string,
    pageKey: string,
    sectionKey: string,
    cardKey: string,
    session: AuthSession
  ) {
    if (!hasPermission(session.role, 'content:manage') && !session.isSuperAdmin) {
      throw new Error('Unauthorized: You do not have permission to reset institutional content cards.');
    }

    const p = prisma as any;
    try {
      await p.institutionalContentCard.delete({
        where: {
          organisationId_pageKey_sectionKey_cardKey: {
            organisationId,
            pageKey,
            sectionKey,
            cardKey,
          },
        },
      });
    } catch {
      // Record already absent or default
    }

    // Return default card
    const defaultCard = DEFAULT_CONTENT_CARDS.find(
      (c) => c.pageKey === pageKey && c.sectionKey === sectionKey && c.cardKey === cardKey
    );

    return {
      ...defaultCard,
      isCustomized: false,
    };
  }
}
