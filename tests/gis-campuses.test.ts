// Tests: GIS & Multi-Campus Spatial Network
import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '../src/server/db';
import { GisService } from '../src/server/services/gis.service';

describe('GIS & Multi-Campus Spatial Engine Tests', () => {
  let orgId: string;

  beforeAll(async () => {
    const org = (await prisma.organisation.findUnique({ where: { code: 'NWUCHAS' } })) ?? (await prisma.organisation.findFirst());
    orgId = org!.id;
  });

  it('calculateDistanceKm computes accurate Haversine great-circle distance', () => {
    // Kabulonga (-15.4248, 28.3486) to Woodlands (-15.4410, 28.3375)
    const dist = GisService.calculateDistanceKm(
      { latitude: -15.4248, longitude: 28.3486 },
      { latitude: -15.4410, longitude: 28.3375 }
    );

    expect(dist).toBeGreaterThan(1.8);
    expect(dist).toBeLessThan(2.5);
  });

  it('estimateTravelTimeMinutes computes realistic urban transit minutes', () => {
    const minutes = GisService.estimateTravelTimeMinutes(5.0); // 5 km
    expect(minutes).toBeGreaterThan(10);
    expect(minutes).toBeLessThan(20);
  });

  it('getCampusesGis retrieves all branches with capacity, catchment, and facilities', async () => {
    const campuses = await GisService.getCampusesGis(orgId);
    expect(Array.isArray(campuses)).toBe(true);
    expect(campuses.length).toBeGreaterThanOrEqual(2);

    const mainCampus = campuses.find((c) => c.isMainCampus && c.latitude !== null) ?? campuses.find((c) => c.latitude !== null);
    expect(mainCampus).toBeDefined();
    expect(mainCampus!.latitude).not.toBeNull();
    expect(mainCampus!.longitude).not.toBeNull();
    expect(mainCampus!.catchmentRadiusKm).toBeGreaterThan(0);
    expect(mainCampus!.capacity).toBeGreaterThan(0);
    expect(Array.isArray(mainCampus!.facilities)).toBe(true);
  });

  it('getCampusDistanceMatrix generates pairwise distance matrix between branches', async () => {
    const matrix = await GisService.getCampusDistanceMatrix(orgId);
    expect(Array.isArray(matrix)).toBe(true);
    expect(matrix.length).toBeGreaterThan(0);

    const firstPair = matrix[0];
    expect(firstPair).toHaveProperty('fromCampusId');
    expect(firstPair).toHaveProperty('toCampusId');
    expect(firstPair).toHaveProperty('distanceKm');
    expect(firstPair).toHaveProperty('estimatedDriveMinutes');
    expect(firstPair.distanceKm).toBeGreaterThan(0);
  });

  it('findNearestCampus evaluates feeder zone and capacity accurately', async () => {
    const campuses = await GisService.getCampusesGis(orgId);
    const valid = campuses.find((c) => c.latitude !== null)!;
    const target = { latitude: valid.latitude! + 0.005, longitude: valid.longitude! + 0.005 };
    const recommendation = await GisService.findNearestCampus(orgId, target);

    expect(recommendation).toHaveProperty('nearest');
    expect(recommendation).toHaveProperty('allRecommendations');
    expect(recommendation.nearest.distanceKm).toBeLessThan(3.0);
    expect(recommendation.nearest.isWithinCatchment).toBe(true);
  });

  it('getSchoolNetworkGeoJson generates compliant GeoJSON FeatureCollection', async () => {
    const geoJson = await GisService.getSchoolNetworkGeoJson(orgId);
    expect(geoJson.type).toBe('FeatureCollection');
    expect(Array.isArray(geoJson.features)).toBe(true);
    expect(geoJson.features.length).toBeGreaterThan(0);

    const pointFeature = geoJson.features.find((f: any) => f.geometry.type === 'Point');
    expect(pointFeature).toBeDefined();

    const polygonFeature = geoJson.features.find((f: any) => f.geometry.type === 'Polygon');
    expect(polygonFeature).toBeDefined();
  });
});
