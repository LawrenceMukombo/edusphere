// EduSphere SMIS — Staff & HR Management Service
import { prisma } from '../db';
import { EmploymentStatus } from '@prisma/client';

export class HRService {
  static async listStaff(
    organisationId: string,
    filters?: {
      campusId?: string;
      status?: EmploymentStatus;
      search?: string;
    }
  ) {
    const where: any = { organisationId };
    if (filters?.campusId) where.campusId = filters.campusId;
    if (filters?.status) where.employmentStatus = filters.status;
    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { staffNumber: { contains: filters.search, mode: 'insensitive' } },
        { tczNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.staff.findMany({
      where,
      include: {
        campus: true,
        user: true,
        classesTaught: true,
      },
      orderBy: { lastName: 'asc' },
    });
  }

  /**
   * Get Teaching Council of Zambia (TCZ) certificate compliance summary
   * Flags staff whose certificates are expiring within 90 days or already expired
   */
  static async getTCZComplianceAlerts(organisationId: string) {
    const now = new Date();
    const ninetyDaysFuture = new Date();
    ninetyDaysFuture.setDate(ninetyDaysFuture.getDate() + 90);

    const staffWithCertificates = await prisma.staff.findMany({
      where: {
        organisationId,
        tczCertificateExpiry: { not: null },
      },
      include: { campus: true },
    });

    const expired = staffWithCertificates.filter((s) => s.tczCertificateExpiry && s.tczCertificateExpiry < now);
    const expiringSoon = staffWithCertificates.filter(
      (s) => s.tczCertificateExpiry && s.tczCertificateExpiry >= now && s.tczCertificateExpiry <= ninetyDaysFuture
    );
    const compliant = staffWithCertificates.filter((s) => s.tczCertificateExpiry && s.tczCertificateExpiry > ninetyDaysFuture);

    return {
      totalStaffAudited: staffWithCertificates.length,
      expired,
      expiringSoon,
      compliant,
    };
  }
}
