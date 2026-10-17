import { prisma } from '../db';

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export interface InterCampusDistance {
  fromCampusId: string;
  fromCampusName: string;
  fromCampusCode: string;
  toCampusId: string;
  toCampusName: string;
  toCampusCode: string;
  distanceKm: number;
  estimatedDriveMinutes: number;
}

export class GisService {
  /**
   * Haversine formula to compute great-circle distance between two GPS coordinates in kilometers.
   */
  static calculateDistanceKm(coord1: GeoCoordinate, coord2: GeoCoordinate): number {
    const R = 6371; // Earth's mean radius in km
    const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
    const lat1 = (coord1.latitude * Math.PI) / 180;
    const lat2 = (coord2.latitude * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  /**
   * Approximate urban/peri-urban drive time in minutes based on distance.
   * Assumes average speed of 30 km/h in Lusaka traffic + 3 min base buffer.
   */
  static estimateTravelTimeMinutes(distanceKm: number): number {
    if (distanceKm <= 0) return 0;
    const minutes = (distanceKm / 30) * 60 + 3;
    return Math.round(minutes);
  }

  /**
   * Retrieve all campuses for an organisation with full GIS, capacity, catchment, and transport metadata.
   */
  static async getCampusesGis(organisationId: string) {
    const campuses = await prisma.campus.findMany({
      where: { organisationId },
      include: {
        learners: {
          select: { id: true, status: true, residentialArea: true, latitude: true, longitude: true },
        },
        staff: {
          select: { id: true, jobTitle: true },
        },
        classes: {
          select: { id: true, name: true, stage: true },
        },
        transportRoutes: {
          where: { isActive: true },
        },
        catchmentZones: true,
      },
      orderBy: [{ isMainCampus: 'desc' }, { name: 'asc' }],
    });

    return campuses.map((campus) => {
      const activeLearners = campus.learners.filter((l) => l.status === 'ENROLLED');
      const capacity = campus.capacity || 500;
      const utilizationRate = capacity > 0 ? Math.round((activeLearners.length / capacity) * 1000) / 10 : 0;

      let facilities: string[] = [];
      if (campus.facilitiesJson) {
        try {
          facilities = JSON.parse(campus.facilitiesJson);
        } catch {
          facilities = [];
        }
      }

      return {
        id: campus.id,
        name: campus.name,
        code: campus.code,
        address: campus.address,
        city: campus.city || 'Lusaka',
        phone: campus.phone,
        isMainCampus: campus.isMainCampus,
        isActive: campus.isActive,
        latitude: campus.latitude,
        longitude: campus.longitude,
        elevationMeters: campus.elevationMeters,
        catchmentRadiusKm: campus.catchmentRadiusKm || 5.0,
        capacity,
        campusType: campus.campusType || (campus.isMainCampus ? 'MAIN_CAMPUS' : 'BRANCH'),
        landAreaHectares: campus.landAreaHectares,
        facilities,
        contactEmail: campus.contactEmail,
        headTeacherName: campus.headTeacherName,
        enrolledCount: activeLearners.length,
        staffCount: campus.staff.length,
        classCount: campus.classes.length,
        utilizationRate,
        isOverCapacity: activeLearners.length > capacity,
        transportRoutes: campus.transportRoutes.map((r) => {
          let parsedStops = [];
          if (r.stopsJson) {
            try {
              parsedStops = JSON.parse(r.stopsJson);
            } catch {
              parsedStops = [];
            }
          }
          return {
            id: r.id,
            routeCode: r.routeCode,
            routeName: r.routeName,
            vehicleReg: r.vehicleReg,
            driverName: r.driverName,
            driverPhone: r.driverPhone,
            capacity: r.capacity,
            fareZMW: r.fareZMW ? Number(r.fareZMW) : 0,
            stops: parsedStops,
          };
        }),
        catchmentZones: campus.catchmentZones.map((z) => ({
          id: z.id,
          zoneName: z.zoneName,
          radiusKm: z.radiusKm,
          centerLatitude: z.centerLatitude,
          centerLongitude: z.centerLongitude,
          description: z.description,
        })),
      };
    });
  }

  /**
   * Generate pairwise inter-campus distance matrix for all branches with valid GPS coordinates.
   */
  static async getCampusDistanceMatrix(organisationId: string): Promise<InterCampusDistance[]> {
    const campuses = await prisma.campus.findMany({
      where: { organisationId, isActive: true },
      select: { id: true, name: true, code: true, latitude: true, longitude: true },
    });

    const matrix: InterCampusDistance[] = [];
    for (let i = 0; i < campuses.length; i++) {
      for (let j = 0; j < campuses.length; j++) {
        if (i === j) continue;
        const c1 = campuses[i];
        const c2 = campuses[j];

        if (c1.latitude != null && c1.longitude != null && c2.latitude != null && c2.longitude != null) {
          const dist = this.calculateDistanceKm(
            { latitude: c1.latitude, longitude: c1.longitude },
            { latitude: c2.latitude, longitude: c2.longitude }
          );
          matrix.push({
            fromCampusId: c1.id,
            fromCampusName: c1.name,
            fromCampusCode: c1.code,
            toCampusId: c2.id,
            toCampusName: c2.name,
            toCampusCode: c2.code,
            distanceKm: dist,
            estimatedDriveMinutes: this.estimateTravelTimeMinutes(dist),
          });
        }
      }
    }

    return matrix;
  }

  /**
   * Find nearest campus/branch for a learner's residence or prospective applicant.
   */
  static async findNearestCampus(
    organisationId: string,
    target: GeoCoordinate
  ) {
    const campuses = await this.getCampusesGis(organisationId);
    const validCampuses = campuses.filter((c) => c.latitude != null && c.longitude != null);

    if (validCampuses.length === 0) {
      throw new Error('No campuses with valid GPS coordinates found for this school.');
    }

    const evaluated = validCampuses.map((c) => {
      const distanceKm = this.calculateDistanceKm(target, {
        latitude: c.latitude!,
        longitude: c.longitude!,
      });
      const isWithinCatchment = distanceKm <= c.catchmentRadiusKm;
      const hasAvailableCapacity = c.enrolledCount < c.capacity;

      return {
        campus: c,
        distanceKm,
        estimatedDriveMinutes: this.estimateTravelTimeMinutes(distanceKm),
        isWithinCatchment,
        hasAvailableCapacity,
        spareCapacity: Math.max(0, c.capacity - c.enrolledCount),
      };
    });

    evaluated.sort((a, b) => a.distanceKm - b.distanceKm);

    return {
      nearest: evaluated[0],
      allRecommendations: evaluated,
      targetCoordinates: target,
    };
  }

  /**
   * Return standardized GeoJSON for the multi-campus school network:
   * - Points for Campuses
   * - Circle polygon buffers for Catchment Feeder Zones
   * - LineStrings for Transport / Shuttle Routes
   */
  static async getSchoolNetworkGeoJson(organisationId: string) {
    const campuses = await this.getCampusesGis(organisationId);

    const campusFeatures = campuses
      .filter((c) => c.latitude != null && c.longitude != null)
      .map((c) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [c.longitude!, c.latitude!],
        },
        properties: {
          id: c.id,
          name: c.name,
          code: c.code,
          campusType: c.campusType,
          isMainCampus: c.isMainCampus,
          enrolledCount: c.enrolledCount,
          capacity: c.capacity,
          utilizationRate: c.utilizationRate,
          catchmentRadiusKm: c.catchmentRadiusKm,
          phone: c.phone,
          city: c.city,
        },
      }));

    // Generate circular polygon coordinates for catchment zones (64 points per ring)
    const catchmentFeatures = campuses
      .filter((c) => c.latitude != null && c.longitude != null)
      .map((c) => {
        const centerLat = c.latitude!;
        const centerLng = c.longitude!;
        const radiusKm = c.catchmentRadiusKm;
        const points: [number, number][] = [];
        const numPoints = 64;

        for (let i = 0; i <= numPoints; i++) {
          const angle = (i * 2 * Math.PI) / numPoints;
          // Approximate lat/lng degree offsets for Lusaka latitude (-15 deg)
          const latOffset = (radiusKm / 111.32) * Math.sin(angle);
          const lngOffset = (radiusKm / (111.32 * Math.cos((centerLat * Math.PI) / 180))) * Math.cos(angle);
          points.push([centerLng + lngOffset, centerLat + latOffset]);
        }

        return {
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [points],
          },
          properties: {
            campusId: c.id,
            campusName: c.name,
            campusCode: c.code,
            radiusKm,
            type: 'CATCHMENT_ZONE',
          },
        };
      });

    // Generate Transport Route LineStrings
    const transportFeatures: any[] = [];
    for (const c of campuses) {
      for (const route of c.transportRoutes) {
        if (route.stops && route.stops.length >= 2) {
          const coords = route.stops
            .filter((s: any) => s.longitude != null && s.latitude != null)
            .map((s: any) => [s.longitude, s.latitude]);

          if (coords.length >= 2) {
            transportFeatures.push({
              type: 'Feature' as const,
              geometry: {
                type: 'LineString' as const,
                coordinates: coords,
              },
              properties: {
                routeId: route.id,
                routeCode: route.routeCode,
                routeName: route.routeName,
                campusId: c.id,
                campusName: c.name,
                vehicleReg: route.vehicleReg,
                stopsCount: coords.length,
              },
            });
          }
        }
      }
    }

    return {
      type: 'FeatureCollection' as const,
      features: [...campusFeatures, ...catchmentFeatures, ...transportFeatures],
    };
  }

  /**
   * Update or create Campus GIS coordinates, capacity, and catchment properties.
   */
  static async updateCampusGis(
    organisationId: string,
    campusId: string,
    data: {
      latitude?: number;
      longitude?: number;
      elevationMeters?: number;
      catchmentRadiusKm?: number;
      capacity?: number;
      campusType?: string;
      landAreaHectares?: number;
      facilities?: string[];
      contactEmail?: string;
      headTeacherName?: string;
    }
  ) {
    const campus = await prisma.campus.findFirst({
      where: { id: campusId, organisationId },
    });
    if (!campus) throw new Error('Campus not found.');

    return prisma.campus.update({
      where: { id: campusId },
      data: {
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
        ...(data.elevationMeters !== undefined && { elevationMeters: data.elevationMeters }),
        ...(data.catchmentRadiusKm !== undefined && { catchmentRadiusKm: data.catchmentRadiusKm }),
        ...(data.capacity !== undefined && { capacity: data.capacity }),
        ...(data.campusType !== undefined && { campusType: data.campusType }),
        ...(data.landAreaHectares !== undefined && { landAreaHectares: data.landAreaHectares }),
        ...(data.facilities !== undefined && { facilitiesJson: JSON.stringify(data.facilities) }),
        ...(data.contactEmail !== undefined && { contactEmail: data.contactEmail }),
        ...(data.headTeacherName !== undefined && { headTeacherName: data.headTeacherName }),
      },
    });
  }

  /**
   * Add a new branch/campus with full GIS coordinates.
   */
  static async createBranchCampus(
    organisationId: string,
    data: {
      name: string;
      code: string;
      address?: string;
      city?: string;
      phone?: string;
      isMainCampus?: boolean;
      latitude?: number;
      longitude?: number;
      catchmentRadiusKm?: number;
      capacity?: number;
      campusType?: string;
      landAreaHectares?: number;
      facilities?: string[];
      contactEmail?: string;
      headTeacherName?: string;
    }
  ) {
    return prisma.campus.create({
      data: {
        organisationId,
        name: data.name,
        code: data.code,
        address: data.address,
        city: data.city || 'Lusaka',
        phone: data.phone,
        isMainCampus: data.isMainCampus || false,
        latitude: data.latitude,
        longitude: data.longitude,
        catchmentRadiusKm: data.catchmentRadiusKm || 5.0,
        capacity: data.capacity || 500,
        campusType: data.campusType || 'BRANCH',
        landAreaHectares: data.landAreaHectares,
        facilitiesJson: data.facilities ? JSON.stringify(data.facilities) : null,
        contactEmail: data.contactEmail,
        headTeacherName: data.headTeacherName,
      },
    });
  }
}
