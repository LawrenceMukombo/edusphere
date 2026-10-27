// src/server/services/asset.service.ts — Enterprise Database-Backed Asset Register & Equipment Service
import { prisma } from '../db';
import { AssetCategory, AssetCondition, AssetStatus, Prisma } from '@prisma/client';
import crypto from 'crypto';

export interface CreateAssetInput {
  name: string;
  category: AssetCategory;
  location: string;
  assetTag?: string;
  serialNumber?: string;
  purchaseDate?: Date | string;
  purchaseCostZMW: number;
  currentValueZMW?: number;
  depreciationRatePct?: number;
  condition?: AssetCondition;
  status?: AssetStatus;
  assignedToStaffId?: string;
  custodianName?: string;
  notes?: string;
  campusId?: string;
}

export interface UpdateAssetInput {
  name?: string;
  category?: AssetCategory;
  location?: string;
  serialNumber?: string;
  purchaseCostZMW?: number;
  currentValueZMW?: number;
  depreciationRatePct?: number;
  condition?: AssetCondition;
  status?: AssetStatus;
  assignedToStaffId?: string;
  custodianName?: string;
  notes?: string;
  campusId?: string;
}

export interface MaintenanceLogInput {
  serviceDate?: Date | string;
  description: string;
  costZMW?: number;
  technicianName: string;
  nextScheduledService?: Date | string;
  conditionAfterService?: AssetCondition;
}

export class AssetService {
  /**
   * Generates a unique barcode/asset tag (e.g. NWU-AST-2026-00412)
   */
  static generateAssetTag(prefix = 'NWU-AST'): string {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${year}-${rand}`;
  }

  /**
   * Generates QR verification data for physical barcode scanning
   */
  static generateQrData(tag: string, orgId: string): string {
    const hash = crypto.createHash('sha256').update(`${tag}:${orgId}:NWUCHAS_ASSET`).digest('hex').slice(0, 12);
    return JSON.stringify({
      tag,
      org: orgId,
      verify: hash,
      ts: Date.now(),
    });
  }

  /**
   * List assets with filtering and depreciation calculations
   */
  static async listAssets(
    organisationId: string,
    filters: {
      campusId?: string;
      category?: AssetCategory;
      condition?: AssetCondition;
      status?: AssetStatus;
      search?: string;
    } = {}
  ) {
    const where: Prisma.AssetItemWhereInput = {
      organisationId,
      isDeleted: false,
    };

    if (filters.campusId) where.campusId = filters.campusId;
    if (filters.category) where.category = filters.category;
    if (filters.condition) where.condition = filters.condition;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { assetTag: { contains: filters.search, mode: 'insensitive' } },
        { location: { contains: filters.search, mode: 'insensitive' } },
        { custodianName: { contains: filters.search, mode: 'insensitive' } },
        { serialNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const items = await prisma.assetItem.findMany({
      where,
      include: {
        campus: { select: { id: true, name: true, code: true } },
        maintenanceLogs: {
          orderBy: { serviceDate: 'desc' },
          take: 3,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute live straight-line depreciation
    const now = new Date();
    return items.map((item) => {
      const pDate = new Date(item.purchaseDate);
      const ageYears = Math.max(0, (now.getTime() - pDate.getTime()) / (365.25 * 24 * 3600 * 1000));
      const annualDepreciation = Number(item.purchaseCostZMW) * (item.depreciationRatePct / 100);
      const accumulatedDepreciation = Math.min(Number(item.purchaseCostZMW) * 0.9, annualDepreciation * ageYears);
      const netBookValue = Math.max(
        Number(item.purchaseCostZMW) * 0.1,
        Number(item.purchaseCostZMW) - accumulatedDepreciation
      );

      return {
        ...item,
        purchaseCostZMW: Number(item.purchaseCostZMW),
        currentValueZMW: Number(netBookValue.toFixed(2)),
        accumulatedDepreciationZMW: Number(accumulatedDepreciation.toFixed(2)),
        ageYears: Number(ageYears.toFixed(1)),
      };
    });
  }

  /**
   * Get single asset with complete maintenance history
   */
  static async getAssetById(organisationId: string, assetId: string) {
    const item = await prisma.assetItem.findFirst({
      where: {
        id: assetId,
        organisationId,
        isDeleted: false,
      },
      include: {
        campus: true,
        maintenanceLogs: {
          orderBy: { serviceDate: 'desc' },
        },
      },
    });

    if (!item) return null;

    const now = new Date();
    const pDate = new Date(item.purchaseDate);
    const ageYears = Math.max(0, (now.getTime() - pDate.getTime()) / (365.25 * 24 * 3600 * 1000));
    const annualDepreciation = Number(item.purchaseCostZMW) * (item.depreciationRatePct / 100);
    const accumulatedDepreciation = Math.min(Number(item.purchaseCostZMW) * 0.9, annualDepreciation * ageYears);
    const netBookValue = Math.max(
      Number(item.purchaseCostZMW) * 0.1,
      Number(item.purchaseCostZMW) - accumulatedDepreciation
    );

    return {
      ...item,
      purchaseCostZMW: Number(item.purchaseCostZMW),
      currentValueZMW: Number(netBookValue.toFixed(2)),
      accumulatedDepreciationZMW: Number(accumulatedDepreciation.toFixed(2)),
      ageYears: Number(ageYears.toFixed(1)),
    };
  }

  /**
   * Create asset item with unique tag and initial valuation
   */
  static async createAsset(organisationId: string, input: CreateAssetInput, creatorId?: string) {
    let tag = input.assetTag?.trim();
    if (!tag) {
      tag = this.generateAssetTag();
    }

    // Verify tag uniqueness
    const existing = await prisma.assetItem.findUnique({
      where: { assetTag: tag },
    });
    if (existing) {
      tag = `${tag}-${Math.floor(10 + Math.random() * 90)}`;
    }

    const qrCode = this.generateQrData(tag, organisationId);
    const purchaseCost = new Prisma.Decimal(input.purchaseCostZMW.toFixed(2));
    const currentValue = input.currentValueZMW
      ? new Prisma.Decimal(input.currentValueZMW.toFixed(2))
      : purchaseCost;

    const asset = await prisma.assetItem.create({
      data: {
        organisationId,
        campusId: input.campusId || null,
        assetTag: tag,
        name: input.name.trim(),
        category: input.category,
        location: input.location.trim(),
        serialNumber: input.serialNumber?.trim() || null,
        purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : new Date(),
        purchaseCostZMW: purchaseCost,
        currentValueZMW: currentValue,
        depreciationRatePct: input.depreciationRatePct ?? 10.0,
        condition: input.condition || AssetCondition.EXCELLENT,
        status: input.status || AssetStatus.OPERATIONAL,
        assignedToStaffId: input.assignedToStaffId || null,
        custodianName: input.custodianName?.trim() || null,
        qrCodeData: qrCode,
        notes: input.notes?.trim() || null,
      },
      include: {
        campus: true,
      },
    });

    return asset;
  }

  /**
   * Update asset attributes
   */
  static async updateAsset(
    organisationId: string,
    assetId: string,
    input: UpdateAssetInput,
    updaterId?: string
  ) {
    const existing = await prisma.assetItem.findFirst({
      where: { id: assetId, organisationId, isDeleted: false },
    });

    if (!existing) {
      throw new Error('Asset record not found or access denied.');
    }

    const data: Prisma.AssetItemUpdateInput = {};
    if (input.name) data.name = input.name.trim();
    if (input.category) data.category = input.category;
    if (input.location) data.location = input.location.trim();
    if (input.serialNumber !== undefined) data.serialNumber = input.serialNumber?.trim() || null;
    if (input.purchaseCostZMW !== undefined) {
      data.purchaseCostZMW = new Prisma.Decimal(input.purchaseCostZMW.toFixed(2));
    }
    if (input.currentValueZMW !== undefined) {
      data.currentValueZMW = new Prisma.Decimal(input.currentValueZMW.toFixed(2));
    }
    if (input.depreciationRatePct !== undefined) {
      data.depreciationRatePct = input.depreciationRatePct;
    }
    if (input.condition) data.condition = input.condition;
    if (input.status) data.status = input.status;
    if (input.assignedToStaffId !== undefined) data.assignedToStaffId = input.assignedToStaffId;
    if (input.custodianName !== undefined) data.custodianName = input.custodianName?.trim() || null;
    if (input.notes !== undefined) data.notes = input.notes?.trim() || null;
    if (input.campusId !== undefined) {
      data.campus = input.campusId ? { connect: { id: input.campusId } } : { disconnect: true };
    }

    return prisma.assetItem.update({
      where: { id: assetId },
      data,
      include: { campus: true, maintenanceLogs: true },
    });
  }

  /**
   * Safe soft-delete / decommissioning per enterprise data safety rules
   */
  static async deleteAsset(organisationId: string, assetId: string, deleterId?: string) {
    const existing = await prisma.assetItem.findFirst({
      where: { id: assetId, organisationId },
    });

    if (!existing) {
      throw new Error('Asset record not found.');
    }

    // Soft-delete to preserve audit logs and financial history
    return prisma.assetItem.update({
      where: { id: assetId },
      data: {
        isDeleted: true,
        status: AssetStatus.DECOMMISSIONED,
      },
    });
  }

  /**
   * Record equipment maintenance service event
   */
  static async logMaintenance(
    organisationId: string,
    assetId: string,
    input: MaintenanceLogInput,
    loggerId?: string
  ) {
    const asset = await prisma.assetItem.findFirst({
      where: { id: assetId, organisationId, isDeleted: false },
    });

    if (!asset) {
      throw new Error('Target asset record not found.');
    }

    const log = await prisma.assetMaintenanceLog.create({
      data: {
        assetId,
        serviceDate: input.serviceDate ? new Date(input.serviceDate) : new Date(),
        description: input.description.trim(),
        costZMW: new Prisma.Decimal((input.costZMW || 0).toFixed(2)),
        technicianName: input.technicianName.trim(),
        nextScheduledService: input.nextScheduledService ? new Date(input.nextScheduledService) : null,
        conditionAfterService: input.conditionAfterService || AssetCondition.GOOD,
        performedById: loggerId || null,
      },
    });

    // Update parent asset condition and status
    await prisma.assetItem.update({
      where: { id: assetId },
      data: {
        condition: input.conditionAfterService || AssetCondition.GOOD,
        status: AssetStatus.OPERATIONAL,
      },
    });

    return log;
  }

  /**
   * Aggregate portfolio metrics and depreciation stats
   */
  static async getPortfolioMetrics(organisationId: string) {
    const assets = await this.listAssets(organisationId);

    const totalAssets = assets.length;
    const totalOriginalCost = assets.reduce((sum, a) => sum + a.purchaseCostZMW, 0);
    const totalCurrentValuation = assets.reduce((sum, a) => sum + a.currentValueZMW, 0);
    const totalAccumulatedDepreciation = assets.reduce(
      (sum, a) => sum + (a.accumulatedDepreciationZMW || 0),
      0
    );

    const operationalCount = assets.filter((a) => a.status === AssetStatus.OPERATIONAL).length;
    const underMaintenanceCount = assets.filter((a) => a.status === AssetStatus.UNDER_MAINTENANCE).length;
    const criticalConditionCount = assets.filter(
      (a) => a.condition === AssetCondition.CRITICAL || a.condition === AssetCondition.POOR
    ).length;

    // Breakdown by category
    const byCategory: Record<string, { count: number; valueZMW: number }> = {};
    for (const a of assets) {
      if (!byCategory[a.category]) {
        byCategory[a.category] = { count: 0, valueZMW: 0 };
      }
      byCategory[a.category].count++;
      byCategory[a.category].valueZMW += a.currentValueZMW;
    }

    return {
      totalAssets,
      totalOriginalCost: Number(totalOriginalCost.toFixed(2)),
      totalCurrentValuation: Number(totalCurrentValuation.toFixed(2)),
      totalAccumulatedDepreciation: Number(totalAccumulatedDepreciation.toFixed(2)),
      operationalCount,
      underMaintenanceCount,
      criticalConditionCount,
      byCategory,
    };
  }
}
