// src/server/services/boarding.service.ts — Enterprise Database-Backed Hostel Accommodation Service
import { prisma } from '../db';
import { HostelGenderPolicy, Prisma } from '@prisma/client';

export interface CreateHostelInput {
  name: string;
  campusId: string;
  genderPolicy: HostelGenderPolicy;
  totalRooms?: number;
  totalBeds?: number;
  wardenName?: string;
  wardenPhone?: string;
  feePerSemesterZMW?: number;
}

export interface UpdateHostelInput {
  name?: string;
  campusId?: string;
  genderPolicy?: HostelGenderPolicy;
  totalRooms?: number;
  totalBeds?: number;
  wardenName?: string;
  wardenPhone?: string;
  feePerSemesterZMW?: number;
}

export interface CreateRoomInput {
  roomNumber: string;
  floor?: number;
  capacityBeds?: number;
}

export class BoardingService {
  /**
   * List all hostel buildings with live bed occupancy counts
   */
  static async listHostels(campusId?: string) {
    const where: Prisma.HostelBuildingWhereInput = {};
    if (campusId) where.campusId = campusId;

    return prisma.hostelBuilding.findMany({
      where,
      include: {
        campus: { select: { id: true, name: true, code: true } },
        rooms: {
          include: {
            beds: {
              include: {
                allocations: {
                  where: { isApproved: true, checkOutDate: null },
                  include: {
                    learner: {
                      select: {
                        id: true,
                        studentNumber: true,
                        firstName: true,
                        lastName: true,
                        gender: true,
                        status: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { roomNumber: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Create a new hostel building
   */
  static async createHostel(input: CreateHostelInput) {
    const fee = input.feePerSemesterZMW !== undefined
      ? new Prisma.Decimal(input.feePerSemesterZMW.toFixed(2))
      : new Prisma.Decimal('2200.00');

    return prisma.hostelBuilding.create({
      data: {
        name: input.name.trim(),
        campusId: input.campusId,
        genderPolicy: input.genderPolicy,
        totalRooms: input.totalRooms || 0,
        totalBeds: input.totalBeds || 0,
        wardenName: input.wardenName?.trim() || null,
        wardenPhone: input.wardenPhone?.trim() || null,
        feePerSemesterZMW: fee,
      },
      include: { campus: true },
    });
  }

  /**
   * Update hostel building attributes
   */
  static async updateHostel(id: string, input: UpdateHostelInput) {
    const data: Prisma.HostelBuildingUpdateInput = {};
    if (input.name) data.name = input.name.trim();
    if (input.genderPolicy) data.genderPolicy = input.genderPolicy;
    if (input.totalRooms !== undefined) data.totalRooms = input.totalRooms;
    if (input.totalBeds !== undefined) data.totalBeds = input.totalBeds;
    if (input.wardenName !== undefined) data.wardenName = input.wardenName?.trim() || null;
    if (input.wardenPhone !== undefined) data.wardenPhone = input.wardenPhone?.trim() || null;
    if (input.feePerSemesterZMW !== undefined) {
      data.feePerSemesterZMW = new Prisma.Decimal(input.feePerSemesterZMW.toFixed(2));
    }
    if (input.campusId) {
      data.campus = { connect: { id: input.campusId } };
    }

    return prisma.hostelBuilding.update({
      where: { id },
      data,
      include: { campus: true, rooms: true },
    });
  }

  /**
   * Delete hostel building with safety check for active occupants
   */
  static async deleteHostel(id: string) {
    // Check if any occupied beds exist in this hostel
    const occupiedBeds = await prisma.hostelBed.count({
      where: {
        room: { buildingId: id },
        isOccupied: true,
      },
    });

    if (occupiedBeds > 0) {
      throw new Error(
        `Cannot delete hostel building: ${occupiedBeds} occupied bed(s) currently allocated to students.`
      );
    }

    return prisma.hostelBuilding.delete({
      where: { id },
    });
  }

  /**
   * Add room to a hostel
   */
  static async createRoom(buildingId: string, input: CreateRoomInput) {
    return prisma.hostelRoom.create({
      data: {
        buildingId,
        roomNumber: input.roomNumber.trim(),
        floor: input.floor || 1,
        capacityBeds: input.capacityBeds || 4,
      },
      include: { building: true },
    });
  }

  /**
   * Update room details
   */
  static async updateRoom(
    roomId: string,
    data: { roomNumber?: string; floor?: number; capacityBeds?: number }
  ) {
    return prisma.hostelRoom.update({
      where: { id: roomId },
      data: {
        ...(data.roomNumber && { roomNumber: data.roomNumber.trim() }),
        ...(data.floor !== undefined && { floor: data.floor }),
        ...(data.capacityBeds !== undefined && { capacityBeds: data.capacityBeds }),
      },
    });
  }

  /**
   * Delete room if vacant
   */
  static async deleteRoom(roomId: string) {
    const occupiedBeds = await prisma.hostelBed.count({
      where: { roomId, isOccupied: true },
    });

    if (occupiedBeds > 0) {
      throw new Error(`Cannot delete room: ${occupiedBeds} bed(s) are occupied.`);
    }

    return prisma.hostelRoom.delete({
      where: { id: roomId },
    });
  }

  /**
   * Add bed to a room
   */
  static async createBed(roomId: string, bedNumber: string) {
    return prisma.hostelBed.create({
      data: {
        roomId,
        bedNumber: bedNumber.trim(),
        isOccupied: false,
      },
      include: { room: true },
    });
  }

  /**
   * Delete bed if vacant
   */
  static async deleteBed(bedId: string) {
    const bed = await prisma.hostelBed.findUnique({
      where: { id: bedId },
    });

    if (bed?.isOccupied) {
      throw new Error('Cannot delete bed: Bed is currently occupied by a student.');
    }

    return prisma.hostelBed.delete({
      where: { id: bedId },
    });
  }

  /**
   * Allocate bed to a student
   */
  static async allocateBed(
    bedId: string,
    learnerId: string,
    academicYear = '2026',
    semesterNumber = 1
  ) {
    return prisma.$transaction(async (tx) => {
      const bed = await tx.hostelBed.findUnique({
        where: { id: bedId },
        include: { room: { include: { building: true } } },
      });

      if (!bed) throw new Error('Selected bed does not exist.');
      if (bed.isOccupied) throw new Error('Selected bed is already occupied.');

      // Check gender policy compatibility
      const learner = await tx.learner.findUnique({ where: { id: learnerId } });
      if (!learner) throw new Error('Student record not found.');

      const policy = bed.room.building.genderPolicy;
      if (policy === 'FEMALE_ONLY' && learner.gender === 'MALE') {
        throw new Error('Policy violation: Cannot allocate male student to Female-Only hostel.');
      }
      if (policy === 'MALE_ONLY' && learner.gender === 'FEMALE') {
        throw new Error('Policy violation: Cannot allocate female student to Male-Only hostel.');
      }

      // Check if student already has an active allocation
      const activeAlloc = await tx.hostelAllocation.findFirst({
        where: { learnerId, checkOutDate: null },
      });
      if (activeAlloc) {
        throw new Error('Student is already allocated an active hostel bed. Check out previous allocation first.');
      }

      // Create allocation record
      const allocation = await tx.hostelAllocation.create({
        data: {
          bedId,
          learnerId,
          academicYear,
          semesterNumber,
          isApproved: true,
          checkInDate: new Date(),
        },
        include: { learner: true, bed: { include: { room: { include: { building: true } } } } },
      });

      // Mark bed occupied
      await tx.hostelBed.update({
        where: { id: bedId },
        data: { isOccupied: true, currentLearnerId: learnerId },
      });

      // Update room occupancy count
      await tx.hostelRoom.update({
        where: { id: bed.roomId },
        data: { currentOccupancy: { increment: 1 } },
      });

      return allocation;
    });
  }

  /**
   * Check out resident from bed
   */
  static async checkoutBed(bedId: string) {
    return prisma.$transaction(async (tx) => {
      const bed = await tx.hostelBed.findUnique({
        where: { id: bedId },
      });

      if (!bed) throw new Error('Bed record not found.');

      // Find active allocation
      const alloc = await tx.hostelAllocation.findFirst({
        where: { bedId, checkOutDate: null },
        orderBy: { checkInDate: 'desc' },
      });

      if (alloc) {
        await tx.hostelAllocation.update({
          where: { id: alloc.id },
          data: { checkOutDate: new Date() },
        });
      }

      // Mark bed vacant
      await tx.hostelBed.update({
        where: { id: bedId },
        data: { isOccupied: false, currentLearnerId: null },
      });

      // Decrement room occupancy
      await tx.hostelRoom.update({
        where: { id: bed.roomId },
        data: { currentOccupancy: { decrement: 1 } },
      });

      return { success: true, message: 'Bed marked as vacant and checkout completed.' };
    });
  }
}
