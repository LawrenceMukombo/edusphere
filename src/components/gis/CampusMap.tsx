'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

export interface CampusGisItem {
  id: string;
  name: string;
  code: string;
  address: string | null;
  city: string;
  phone: string | null;
  isMainCampus: boolean;
  latitude: number | null;
  longitude: number | null;
  elevationMeters: number | null;
  catchmentRadiusKm: number;
  capacity: number;
  campusType: string;
  landAreaHectares: number | null;
  facilities: string[];
  contactEmail: string | null;
  headTeacherName: string | null;
  enrolledCount: number;
  staffCount: number;
  classCount: number;
  utilizationRate: number;
  isOverCapacity: boolean;
  transportRoutes: Array<{
    id: string;
    routeCode: string;
    routeName: string;
    vehicleReg: string | null;
    capacity: number;
    stops: Array<{ name: string; latitude: number; longitude: number; morningTime?: string }>;
  }>;
  catchmentZones: Array<{
    id: string;
    zoneName: string;
    radiusKm: number;
    centerLatitude: number;
    centerLongitude: number;
  }>;
}

export interface TrafficSegmentItem {
  id: string;
  name: string;
  startCoords: [number, number];
  endCoords: [number, number];
  distanceKm: number;
  trafficCondition: 'CLEAR' | 'MODERATE' | 'HEAVY_JAM';
  speedKmh: number;
  delayMinutes: number;
}

export interface LiveShuttleItem {
  id: string;
  routeCode: string;
  routeName: string;
  vehicleReg: string;
  model?: string;
  assignedCampuses?: string[];
  currentCoordinates: { lat: number; lng: number };
  speedKmh: number;
  headingDegrees?: number;
  status: string;
  boardedCount: number;
  capacity: number;
  driverName?: string;
  driverPhone?: string;
  nextStop?: string;
  etaNextStopMinutes?: number;
  totalDistanceKm?: number;
  networkPath?: [number, number][];
  trafficSegments?: TrafficSegmentItem[];
  stops?: Array<{
    id?: string;
    name: string;
    latitude: number;
    longitude: number;
    morningPickupTime?: string;
    afternoonDropTime?: string;
    studentCount?: number;
    landmark?: string;
    targetCampusCodes?: string[];
    distanceFromPrevStopKm?: number;
    trafficCondition?: 'CLEAR' | 'MODERATE' | 'HEAVY_JAM';
  }>;
  fuelMetrics?: {
    dailyRoundTripKm: number;
    dailyFuelLiters: number;
    dailyFuelCostZMW: number;
    monthlyFuelCostZMW: number;
  };
}

interface CampusMapProps {
  campuses: CampusGisItem[];
  selectedCampusId: string | null;
  onSelectCampus: (campus: CampusGisItem | null) => void;
  pickedLocation: { latitude: number; longitude: number } | null;
  onPickLocation?: (coords: { latitude: number; longitude: number }) => void;
  showCatchmentZones?: boolean;
  showTransportRoutes?: boolean;
  liveShuttles?: LiveShuttleItem[];
}

export default function CampusMap({
  campuses,
  selectedCampusId,
  onSelectCampus,
  pickedLocation,
  onPickLocation,
  showCatchmentZones = true,
  showTransportRoutes = true,
  liveShuttles = [],
}: CampusMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const catchmentLayerRef = useRef<any>(null);
  const routesLayerRef = useRef<any>(null);
  const pickedMarkerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const [basemapStyle, setBasemapStyle] = useState<'street' | 'osm' | 'satellite' | 'topo'>('street');
  const [mapLoaded, setMapLoaded] = useState(false);

  // Basemap tile definitions (100% watermark-free, enterprise high-res)
  const basemaps: Record<string, { url: string; attribution: string; maxZoom: number }> = {
    street: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri &mdash; National Geographic, DeLorme, HERE, USGS, OpenStreetMap contributors | EduSphere Sovereign GIS',
      maxZoom: 19,
    },
    osm: {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | EduSphere Sovereign GIS',
      maxZoom: 19,
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri &mdash; Maxar, Earthstar Geographics, CNES/Airbus DS | EduSphere High-Res Satellite',
      maxZoom: 19,
    },
    topo: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri &mdash; USGS, FAO, NPS, NRCAN, GeoBase, IGN | EduSphere Topographic',
      maxZoom: 19,
    },
  };

  // Initialize Leaflet map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;

      // Default centre: Solwezi, North-Western Province (-12.1750, 26.3920)
      const map = L.map(mapContainerRef.current, {
        center: [-12.1750, 26.3920],
        zoom: 13,
        zoomControl: true,
      });

      // Enterprise Unwatermarked Basemap
      const initialStyle = basemaps[basemapStyle];
      tileLayerRef.current = L.tileLayer(initialStyle.url, {
        maxZoom: initialStyle.maxZoom,
        attribution: initialStyle.attribution,
      }).addTo(map);

      // Map click handler for picking location
      map.on('click', (e: any) => {
        if (onPickLocation) {
          onPickLocation({ latitude: e.latlng.lat, longitude: e.latlng.lng });
        }
      });

      markersLayerRef.current = L.layerGroup().addTo(map);
      catchmentLayerRef.current = L.layerGroup().addTo(map);
      routesLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      if (isMounted) setMapLoaded(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Map layers when campuses or toggles change
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    async function renderLayers() {
      const L = (await import('leaflet')).default;

      markersLayerRef.current.clearLayers();
      catchmentLayerRef.current.clearLayers();
      routesLayerRef.current.clearLayers();

      const validCampuses = campuses.filter((c) => c.latitude != null && c.longitude != null);
      const bounds: [number, number][] = [];

      validCampuses.forEach((campus) => {
        const lat = campus.latitude!;
        const lng = campus.longitude!;
        bounds.push([lat, lng]);

        const isSelected = selectedCampusId === campus.id;
        const color = campus.isMainCampus
          ? '#2563eb' // Blue
          : campus.campusType === 'EARLY_YEARS'
          ? '#d97706' // Amber
          : '#059669'; // Emerald

        // Custom HTML Badge Marker
        const iconHtml = `
          <div style="
            background: ${color};
            color: white;
            border: 3px solid ${isSelected ? '#f59e0b' : 'white'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            border-radius: 20px;
            padding: 4px 10px;
            font-size: 11px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 5px;
            white-space: nowrap;
            transform: translate(-50%, -50%);
            cursor: pointer;
            transition: all 0.2s ease;
            ${isSelected ? 'transform: translate(-50%, -50%) scale(1.15);' : ''}
          ">
            <span>${campus.isMainCampus ? '★ ' : ''}${campus.code}</span>
            <span style="font-weight: 500; font-size: 10px; opacity: 0.95;">(${campus.enrolledCount}/${campus.capacity})</span>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-campus-marker',
          iconSize: [0, 0],
        });

        const marker = L.marker([lat, lng], { icon: customIcon });

        const popupContent = `
          <div style="font-family: inherit; font-size: 12px; line-height: 1.5; min-width: 220px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
              <strong style="font-size: 13px; color: #0f172a;">${campus.name}</strong>
              <span style="background: ${color}20; color: ${color}; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;">
                ${campus.code}
              </span>
            </div>
            <div style="color: #64748b; font-size: 11px; margin-bottom: 8px;">
              📍 ${campus.address || campus.city}
            </div>
            <div style="background: #f8fafc; border-radius: 6px; padding: 6px 8px; margin-bottom: 8px; font-size: 11px;">
              <div style="display: flex; justify-content: space-between;">
                <span>Enrollment:</span>
                <strong>${campus.enrolledCount} / ${campus.capacity} (${campus.utilizationRate}%)</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 3px;">
                <span>Catchment Radius:</span>
                <strong>${campus.catchmentRadiusKm} km</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 3px;">
                <span>Staff:</span>
                <strong>${campus.staffCount} educators</strong>
              </div>
            </div>
            <button id="btn-select-${campus.id}" style="
              width: 100%;
              background: #0f172a;
              color: white;
              border: none;
              border-radius: 6px;
              padding: 5px;
              font-size: 11px;
              font-weight: 600;
              cursor: pointer;
            ">
              ${isSelected ? 'Selected Branch' : 'Focus on this Branch'}
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-select-${campus.id}`);
          if (btn) {
            btn.onclick = () => onSelectCampus(isSelected ? null : campus);
          }
        });

        marker.on('click', () => {
          onSelectCampus(campus);
        });

        marker.addTo(markersLayerRef.current);

        // Isochrones explicitly removed per user directive in favor of clean road network routes
        // (Do not draw circular catchment overlays)
      });

      // Render Active Live Shuttles, Road Network Corridors, Traffic Conditions & Transit Stops
      if (showTransportRoutes && liveShuttles && liveShuttles.length > 0) {
        liveShuttles.forEach((shuttle) => {
          // 1. Render Uber-style road network traffic segments
          if (shuttle.trafficSegments && shuttle.trafficSegments.length > 0) {
            shuttle.trafficSegments.forEach((seg) => {
              const segColor =
                seg.trafficCondition === 'HEAVY_JAM'
                  ? '#ef4444' // Red for traffic jam
                  : seg.trafficCondition === 'MODERATE'
                  ? '#f59e0b' // Amber for moderate slow down
                  : '#10b981'; // Green for clear free-flowing traffic

              const segWeight = seg.trafficCondition === 'HEAVY_JAM' ? 6 : seg.trafficCondition === 'MODERATE' ? 5 : 4;

              const segLine = L.polyline([seg.startCoords, seg.endCoords], {
                color: segColor,
                weight: segWeight,
                opacity: 0.9,
                dashArray: seg.trafficCondition === 'HEAVY_JAM' ? '4, 4' : undefined,
              });

              const trafficLabel =
                seg.trafficCondition === 'HEAVY_JAM'
                  ? `🔴 TRAFFIC JAM: ${seg.name} (${seg.speedKmh} km/h, +${seg.delayMinutes}m delay)`
                  : seg.trafficCondition === 'MODERATE'
                  ? `🟠 MODERATE SLOWDOWN: ${seg.name} (${seg.speedKmh} km/h)`
                  : `🟢 CLEAR ROAD: ${seg.name} (${seg.speedKmh} km/h)`;

              segLine.bindTooltip(trafficLabel, { sticky: true });
              segLine.addTo(routesLayerRef.current);
            });
          } else if (shuttle.networkPath && shuttle.networkPath.length >= 2) {
            const pathLine = L.polyline(shuttle.networkPath, {
              color: '#3b82f6',
              weight: 4,
              opacity: 0.85,
            });
            pathLine.bindTooltip(`🚌 ${shuttle.routeCode}: ${shuttle.routeName}`, { sticky: true });
            pathLine.addTo(routesLayerRef.current);
          }

          // 2. Render Clear Transit Stop Pins with Details
          if (shuttle.stops && shuttle.stops.length > 0) {
            shuttle.stops.forEach((stop, sIdx) => {
              const stopHtml = `
                <div style="
                  background: #1e3a8a;
                  color: white;
                  border: 2px solid white;
                  box-shadow: 0 3px 8px rgba(0,0,0,0.35);
                  border-radius: 50%;
                  width: 22px;
                  height: 22px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 11px;
                  font-weight: 800;
                  transform: translate(-50%, -50%);
                  cursor: pointer;
                ">
                  ${sIdx + 1}
                </div>
              `;
              const stopIcon = L.divIcon({
                html: stopHtml,
                className: 'bus-stop-pin',
                iconSize: [0, 0],
              });

              const stopMarker = L.marker([stop.latitude, stop.longitude], { icon: stopIcon });

              const targetCampusesBadge = (stop.targetCampusCodes || ['URB', 'MSC'])
                .map((code) => {
                  const label = code === 'URB' ? 'Urban Campus (opp Kikombe)' : 'Mushitala Boarding';
                  const bg = code === 'URB' ? '#dbeafe; color: #1e40af;' : '#dcfce7; color: #166534;';
                  return `<span style="background: ${bg} padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;">${label}</span>`;
                })
                .join(' ');

              const stopPopup = `
                <div style="font-family: sans-serif; padding: 6px; min-width: 230px; font-size: 12px; line-height: 1.4;">
                  <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                    <strong style="color: #0f172a; font-size: 13px;">Stop ${sIdx + 1}: ${stop.name}</strong>
                    <span style="background: #e0e7ff; color: #3730a3; padding: 1px 5px; border-radius: 4px; font-weight: 700; font-size: 10px;">${shuttle.routeCode}</span>
                  </div>
                  <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">📍 ${stop.landmark || 'Designated Learner Stop'}</div>
                  <div style="background: #f8fafc; padding: 6px 8px; border-radius: 6px; margin-bottom: 6px; font-size: 11px;">
                    <div style="display: flex; justify-content: space-between;">
                      <span>Morning Pickup:</span>
                      <strong>${stop.morningPickupTime || '06:45 AM'}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 3px;">
                      <span>Afternoon Dropoff:</span>
                      <strong>${stop.afternoonDropTime || '15:30 PM'}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 3px;">
                      <span>Learners Boarding:</span>
                      <strong>${stop.studentCount || 8} pupils</strong>
                    </div>
                  </div>
                  <div style="margin-top: 4px;">
                    <div style="font-size: 10px; color: #64748b; margin-bottom: 3px; font-weight: 600;">DROPOFF DESTINATIONS:</div>
                    <div style="display: flex; gap: 4px; flex-wrap: wrap;">${targetCampusesBadge}</div>
                  </div>
                </div>
              `;
              stopMarker.bindPopup(stopPopup);
              stopMarker.addTo(routesLayerRef.current);
            });
          }

          // 3. Render Uber-Style Moving Shuttle Marker with Beacon & Live Traffic Alert
          if (shuttle.currentCoordinates?.lat && shuttle.currentCoordinates?.lng) {
            const isJam = shuttle.speedKmh < 18;
            const trafficColor = isJam ? '#ef4444' : shuttle.speedKmh < 32 ? '#f59e0b' : '#10b981';
            const trafficBadge = isJam ? '🔴 JAM' : shuttle.speedKmh < 32 ? '🟠 SLOW' : '🟢 CLEAR';

            const shuttleHtml = `
              <div style="
                background: #0f172a;
                color: white;
                border: 2px solid ${trafficColor};
                box-shadow: 0 4px 14px ${trafficColor}60;
                border-radius: 20px;
                padding: 4px 10px;
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 11px;
                font-weight: 800;
                transform: translate(-50%, -50%);
                cursor: pointer;
                transition: transform 0.3s ease;
              ">
                <span style="font-size: 13px;">🚌</span>
                <span>${shuttle.routeCode}</span>
                <span style="background: ${trafficColor}; color: white; padding: 1px 5px; border-radius: 6px; font-size: 10px; font-weight: 900;">
                  ${shuttle.speedKmh} km/h
                </span>
                <span style="background: rgba(255,255,255,0.15); padding: 1px 5px; border-radius: 6px; font-size: 10px;">
                  ${trafficBadge}
                </span>
                <span style="background: #3b82f6; color: white; padding: 1px 5px; border-radius: 6px; font-size: 9px;">
                  ${shuttle.boardedCount}/${shuttle.capacity}
                </span>
              </div>
            `;
            const shuttleIcon = L.divIcon({
              html: shuttleHtml,
              className: 'live-shuttle-marker',
              iconSize: [0, 0],
            });

            const shuttleMarker = L.marker(
              [shuttle.currentCoordinates.lat, shuttle.currentCoordinates.lng],
              { icon: shuttleIcon }
            );

            const campusesServed = (shuttle.assignedCampuses || [
              'Urban Campus (opp Kikombe School / Army Mess)',
              'Mushitala Campus',
            ])
              .map((c) => `<li style="margin-left: 14px;">${c}</li>`)
              .join('');

            const fuelText = shuttle.fuelMetrics
              ? `<div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 6px 8px; margin-top: 6px; font-size: 11px; color: #065f46;">
                  <div style="font-weight: 700; margin-bottom: 2px;">⛽ Fuel & Road Distance Telematics:</div>
                  <div>Daily Round-Trip: <strong>${shuttle.fuelMetrics.dailyRoundTripKm} km</strong></div>
                  <div>Daily Fuel Used: <strong>${shuttle.fuelMetrics.dailyFuelLiters} L (~K${shuttle.fuelMetrics.dailyFuelCostZMW})</strong></div>
                  <div>Monthly Fuel Budget: <strong>K${shuttle.fuelMetrics.monthlyFuelCostZMW.toLocaleString()}</strong> (22 school days)</div>
                </div>`
              : '';

            const popupContent = `
              <div style="font-family: sans-serif; padding: 6px; max-width: 270px; font-size: 12px; line-height: 1.4;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                  <strong style="color: #0f172a; font-size: 13px;">🚌 ${shuttle.routeCode} &mdash; ${shuttle.model || 'Toyota Coaster'}</strong>
                </div>
                <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">
                  Reg: <strong>${shuttle.vehicleReg}</strong> &bull; Status: <strong style="color: ${trafficColor};">${isJam ? 'Traffic Jam Encountered' : 'Road Clear'}</strong>
                </div>
                <div style="background: #f1f5f9; padding: 6px 8px; border-radius: 8px; margin-bottom: 6px; font-size: 11px;">
                  <div>Driver: <strong>${shuttle.driverName || 'Patrick Zulu'}</strong> (${shuttle.driverPhone || '+260 971 883920'})</div>
                  <div>Passengers: <strong>${shuttle.boardedCount} / ${shuttle.capacity} Learners Boarded</strong></div>
                  <div>Next Transit Stop: <strong>${shuttle.nextStop || 'Next Transit Stop'}</strong> (~${shuttle.etaNextStopMinutes || 4} mins)</div>
                  <div style="margin-top: 4px; font-weight: 600; color: #334155;">Delivers to Campuses:</div>
                  <ul style="margin: 0; padding: 0; font-size: 10.5px; color: #475569;">${campusesServed}</ul>
                </div>
                ${fuelText}
              </div>
            `;
            shuttleMarker.bindPopup(popupContent);
            shuttleMarker.addTo(routesLayerRef.current);
          }
        });
      }

      // Render picked target location marker
      if (pickedLocation) {
        bounds.push([pickedLocation.latitude, pickedLocation.longitude]);
        const pinHtml = `
          <div style="
            background: #ef4444;
            color: white;
            border: 2px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            transform: translate(-50%, -50%);
            animation: bounce 1s infinite alternate;
          ">
            📍
          </div>
        `;
        const pinIcon = L.divIcon({
          html: pinHtml,
          className: 'picked-pin',
          iconSize: [0, 0],
        });

        if (pickedMarkerRef.current) {
          pickedMarkerRef.current.remove();
        }

        pickedMarkerRef.current = L.marker([pickedLocation.latitude, pickedLocation.longitude], {
          icon: pinIcon,
        })
          .bindPopup(`<strong>Selected Target Point</strong><br/>Lat: ${pickedLocation.latitude.toFixed(4)}, Lng: ${pickedLocation.longitude.toFixed(4)}`)
          .addTo(markersLayerRef.current);
      }

      // Auto-fit map bounds if campuses exist
      if (bounds.length > 0 && !selectedCampusId) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      } else if (selectedCampusId) {
        const selected = validCampuses.find((c) => c.id === selectedCampusId);
        if (selected && selected.latitude && selected.longitude) {
          map.setView([selected.latitude, selected.longitude], 13, { animate: true });
        }
      }
    }

    renderLayers();
  }, [campuses, selectedCampusId, pickedLocation, showCatchmentZones, showTransportRoutes, mapLoaded]);

  // Effect to switch basemap tile layer dynamically
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    async function changeBasemap() {
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current;

      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
      }

      const style = basemaps[basemapStyle];
      tileLayerRef.current = L.tileLayer(style.url, {
        maxZoom: style.maxZoom,
        attribution: style.attribution,
      }).addTo(map);
      tileLayerRef.current.bringToBack();
    }

    changeBasemap();
  }, [basemapStyle, mapLoaded]);

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Basemap Style Switcher Control (Watermark-Free) */}
      <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200/90 shadow-md flex items-center gap-1 text-xs">
        <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Basemap:</span>
        <button
          type="button"
          onClick={() => setBasemapStyle('street')}
          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
            basemapStyle === 'street'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Street Map
        </button>
        <button
          type="button"
          onClick={() => setBasemapStyle('osm')}
          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
            basemapStyle === 'osm'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          OpenStreetMap
        </button>
        <button
          type="button"
          onClick={() => setBasemapStyle('satellite')}
          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
            basemapStyle === 'satellite'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Satellite
        </button>
        <button
          type="button"
          onClick={() => setBasemapStyle('topo')}
          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
            basemapStyle === 'topo'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Topographic
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200/80 shadow-md text-xs space-y-2 pointer-events-auto max-w-xs">
        <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center justify-between">
          <span>Map Spatial Layers</span>
          <span className="text-slate-400 font-normal">North-Western Province (Solwezi Hub)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="w-3 h-3 rounded-full bg-blue-600 border border-white shadow-xs" />
          <span>Mushitala Senior & Boarding Campus</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white shadow-xs" />
          <span>Urban Day Primary & ECE Campus</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="w-3 h-3 rounded-full bg-amber-600 border border-white shadow-xs" />
          <span>Boarding Houses Village & Sickbay</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="w-4 h-0.5 border-b-2 border-dashed border-indigo-500" />
          <span>Inter-Campus Transit & Feeder Shuttles</span>
        </div>
        <div className="pt-1 text-[10px] text-slate-400 border-t border-slate-100">
          💡 Click anywhere on map to calculate closest campus & drive time.
        </div>
      </div>
    </div>
  );
}
