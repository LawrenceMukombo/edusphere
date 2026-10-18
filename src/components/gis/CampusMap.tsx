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

export interface LiveShuttleItem {
  id: string;
  routeCode: string;
  routeName: string;
  vehicleReg: string;
  currentCoordinates: { lat: number; lng: number };
  speedKmh: number;
  status: string;
  boardedCount: number;
  capacity: number;
  driverName?: string;
  driverPhone?: string;
  nextStop?: string;
  etaNextStopMinutes?: number;
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

        // Catchment Zone Circular Overlay
        if (showCatchmentZones && campus.catchmentRadiusKm > 0) {
          const circle = L.circle([lat, lng], {
            radius: campus.catchmentRadiusKm * 1000,
            color: color,
            weight: isSelected ? 2.5 : 1.2,
            dashArray: isSelected ? undefined : '4, 4',
            fillColor: color,
            fillOpacity: isSelected ? 0.16 : 0.08,
          });
          circle.bindTooltip(`${campus.name} Catchment Zone (${campus.catchmentRadiusKm} km)`, {
            sticky: true,
          });
          circle.addTo(catchmentLayerRef.current);
        }

        // Transport routes
        if (showTransportRoutes && campus.transportRoutes) {
          campus.transportRoutes.forEach((route, idx) => {
            if (route.stops && route.stops.length >= 2) {
              const stopCoords: [number, number][] = route.stops
                .filter((s) => s.latitude && s.longitude)
                .map((s) => [s.latitude, s.longitude]);

              if (stopCoords.length >= 2) {
                const polyline = L.polyline(stopCoords, {
                  color: '#6366f1',
                  weight: 3,
                  opacity: 0.8,
                  dashArray: '6, 6',
                });
                polyline.bindTooltip(`🚌 ${route.routeCode}: ${route.routeName}`, { sticky: true });
                polyline.addTo(routesLayerRef.current);

                // Bus stop markers
                route.stops.forEach((stop, sIdx) => {
                  const stopMarker = L.circleMarker([stop.latitude, stop.longitude], {
                    radius: 4,
                    color: '#4338ca',
                    fillColor: '#ffffff',
                    fillOpacity: 1,
                    weight: 2,
                  });
                  stopMarker.bindTooltip(`Stop: ${stop.name} (${stop.morningTime || '07:00'})`, {
                    direction: 'top',
                  });
                  stopMarker.addTo(routesLayerRef.current);
                });
              }
            }
          });
        }
      });

      // Render active live moving shuttles with real-time speed & passenger badges
      if (showTransportRoutes && liveShuttles && liveShuttles.length > 0) {
        liveShuttles.forEach((shuttle) => {
          if (shuttle.currentCoordinates?.lat && shuttle.currentCoordinates?.lng) {
            const shuttleHtml = `
              <div style="
                background: #1e40af;
                color: white;
                border: 2px solid #ffffff;
                box-shadow: 0 4px 12px rgba(30,64,175,0.55);
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
                <span style="background: rgba(255,255,255,0.2); padding: 1px 5px; border-radius: 6px; font-size: 10px;">${shuttle.speedKmh} km/h</span>
                <span style="background: #10b981; color: white; padding: 1px 5px; border-radius: 6px; font-size: 9px;">${shuttle.boardedCount}/${shuttle.capacity}</span>
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

            const popupContent = `
              <div style="font-family: sans-serif; padding: 6px; max-width: 240px; font-size: 12px;">
                <div style="font-weight: 800; color: #1e3a8a; font-size: 13px; margin-bottom: 2px;">
                  🚌 ${shuttle.routeCode} &mdash; ${shuttle.routeName}
                </div>
                <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">
                  Vehicle: <strong>${shuttle.vehicleReg}</strong> &bull; ${shuttle.status.replace(/_/g, ' ')}
                </div>
                <div style="background: #f1f5f9; padding: 6px 8px; border-radius: 8px; margin-bottom: 6px;">
                  <div>Driver: <strong>${shuttle.driverName || 'Patrick Zulu'}</strong></div>
                  <div>Phone: <strong>${shuttle.driverPhone || '+260 971 883920'}</strong></div>
                  <div>Passengers: <strong>${shuttle.boardedCount} / ${shuttle.capacity} Learners Boarded</strong></div>
                  <div>Next Stop: <strong>${shuttle.nextStop || 'Next Transit Stop'}</strong> (${shuttle.etaNextStopMinutes || 4} mins)</div>
                </div>
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
