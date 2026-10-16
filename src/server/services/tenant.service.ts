// EduSphere SMIS — Multi-Tenant Service
import { prisma } from '../db';
import { OrgType, SubscriptionTier, SubscriptionStatus } from '@prisma/client';

export class TenantService {
  /**
   * Provision a new school organisation with isolated tenancy, default subscription and campus
   */
  static async provisionSchool(data: {
    code: string;
    name: string;
    officialName?: string;
    type: OrgType;
    registrationNo?: string;
    taxNumber?: string;
    email: string;
    phone: string;
    city?: string;
    province?: string;
    tier?: SubscriptionTier;
  }) {
    // Check if code is already taken
    const existing = await prisma.organisation.findUnique({
      where: { code: data.code },
    });
    if (existing) {
      throw new Error(`Organisation code '${data.code}' is already registered.`);
    }

    const tier = data.tier || SubscriptionTier.GROWING_SCHOOL;
    const learnerCap = tier === SubscriptionTier.COMMUNITY_STARTER ? 80 :
                       tier === SubscriptionTier.GROWING_SCHOOL ? 250 :
                       tier === SubscriptionTier.PROFESSIONAL ? 600 :
                       tier === SubscriptionTier.CAMPUS_PLUS ? 1500 : 5000;
    const priceZMW = tier === SubscriptionTier.COMMUNITY_STARTER ? 149.00 :
                     tier === SubscriptionTier.GROWING_SCHOOL ? 399.00 :
                     tier === SubscriptionTier.PROFESSIONAL ? 799.00 :
                     tier === SubscriptionTier.CAMPUS_PLUS ? 1499.00 : 3500.00;

    return prisma.$transaction(async (tx) => {
      const org = await tx.organisation.create({
        data: {
          code: data.code,
          name: data.name,
          officialName: data.officialName || data.name,
          type: data.type,
          registrationNo: data.registrationNo,
          taxNumber: data.taxNumber,
          email: data.email,
          phone: data.phone,
          city: data.city || 'Lusaka',
          province: data.province || 'Lusaka',
        },
      });

      // Default Main Campus
      const campus = await tx.campus.create({
        data: {
          organisationId: org.id,
          name: `${data.name} - Main Campus`,
          code: 'MC',
          isMainCampus: true,
          city: data.city || 'Lusaka',
        },
      });

      // Active Subscription
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);

      const subscription = await tx.subscription.create({
        data: {
          organisationId: org.id,
          tier,
          status: SubscriptionStatus.ACTIVE,
          activeLearnerCap: learnerCap,
          priceZMW,
          startDate: new Date(),
          endDate,
        },
      });

      return { org, campus, subscription };
    });
  }

  static async listOrganisations() {
    return prisma.organisation.findMany({
      include: {
        campuses: true,
        subscriptions: { where: { status: SubscriptionStatus.ACTIVE }, take: 1 },
        _count: {
          select: {
            learners: true,
            staff: true,
            users: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getOrganisationById(organisationId: string) {
    return prisma.organisation.findUnique({
      where: { id: organisationId },
      include: {
        campuses: true,
        subscriptions: true,
        entitlements: true,
        academicYears: {
          include: { terms: true },
        },
      },
    });
  }
}
