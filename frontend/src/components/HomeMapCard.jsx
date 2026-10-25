import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Star, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function MapController({ center }) {
  const map = useMap();
  const prevCenterRef = useRef([0, 0]);

  useEffect(() => {
    if (!center || !center[0] || !center[1]) return;
    const [lat, lng] = center;
    const [prevLat, prevLng] = prevCenterRef.current;

    // Only animate flyTo if latitude/longitude genuinely changed
    if (Math.abs(lat - prevLat) > 0.0001 || Math.abs(lng - prevLng) > 0.0001) {
      prevCenterRef.current = [lat, lng];
      map.flyTo(center, 14, { duration: 1.0 });
    }
  }, [center?.[0], center?.[1], map]);

  return null;
}

export default function HomeMapCard({ center, workers = [], selectedCategory = 'plumber', onSelectWorker }) {
  const navigate = useNavigate();
  const safeWorkers = Array.isArray(workers) ? workers : [];

  // Custom User Marker DivIcon
  const userIcon = L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div style="position: relative; width: 28px; height: 28px;">
        <div style="position: absolute; inset: -8px; background: rgba(31, 91, 255, 0.25); border-radius: 9999px; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 28px; height: 28px; background: #1F5BFF; border: 3px solid #FFFFFF; border-radius: 9999px; box-shadow: 0 4px 12px rgba(31,91,255,0.4); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  return (
    <div className="relative w-full h-64 rounded-card overflow-hidden border border-line shadow-card glass-card">
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={false}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={center} />

        {/* User Location Marker */}
        <Marker position={center} icon={userIcon}>
          <Popup>
            <div className="p-1 text-center font-sans">
              <span className="font-700 text-xs text-ink block">Your Current Location</span>
              <span className="text-[11px] text-muted block">Hyperlocal Dispatch Radius: 8 km</span>
            </div>
          </Popup>
        </Marker>

        {/* Workers Markers */}
        {/* Workers & Real Google Places Markers */}
        {safeWorkers.map((w, idx) => {
          const lat = w.lat ?? w.latitude;
          const lng = w.lng ?? w.longitude;
          if (!lat || !lng) return null;

          const isGooglePlace = Boolean(w.is_real_place);
          const pinColor = isGooglePlace ? '#10B981' : (w.avatar_color || '#1F5BFF');
          const initials = w.name
            ? `${w.name.split(' ')[0][0] || 'P'}${w.name.split(' ')[1] ? w.name.split(' ')[1][0] : ''}`
            : 'P';

          const workerIcon = L.divIcon({
            className: 'custom-worker-pin',
            html: `
              <div style="background: ${pinColor}; color: white; width: 32px; height: 32px; border-radius: 10px; border: 2.5px solid white; box-shadow: 0 4px 14px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px;">
                ${initials}
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const ratingVal = w.rating_avg ?? w.rating ?? 4.8;
          const key = w.id || `place-${idx}-${lat}`;

          return (
            <Marker key={key} position={[lat, lng]} icon={workerIcon}>
              <Popup>
                <div className="p-1 text-left min-w-[170px] font-sans">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-800 text-sm text-ink truncate">{w.name}</span>
                    <span className="text-primary text-[10px]" title={isGooglePlace ? 'Google Verified' : 'ID Verified'}>
                      ✓
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted mb-2">
                    <span className="flex items-center gap-0.5 text-accent font-700">
                      ★ {typeof ratingVal === 'number' ? ratingVal.toFixed(1) : ratingVal}
                    </span>
                    <span>•</span>
                    <span>{w.distance_km} km away</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-line">
                    <span className="font-800 text-xs text-primary">
                      {w.service_charge || `₹${w.base_rate}/${w.rate_unit || 'visit'}`}
                    </span>
                    <button
                      onClick={() => navigate(`/request/new?category=${selectedCategory}`)}
                      className="text-[11px] font-700 px-2 py-1 rounded bg-primary text-white hover:bg-primary600 transition flex items-center gap-1"
                    >
                      <span>Book</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Info Overlay */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none">
        <div className="px-3 py-1.5 rounded-full glass-card border border-white/40 shadow-sm flex items-center gap-2 text-xs font-700 text-ink">
          <span>{safeWorkers.length} verified pros live in your area</span>
        </div>
      </div>
    </div>
  );
}
