import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

function Recenter({ customerPos, workerPos }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    if (customerPos && workerPos) {
      const bounds = L.latLngBounds([
        [customerPos.lat, customerPos.lng],
        [workerPos.lat, workerPos.lng],
      ]);
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 });
    } else if (customerPos) {
      map.setView([customerPos.lat, customerPos.lng], 15);
    }
  }, [map, customerPos?.lat, customerPos?.lng, workerPos?.lat, workerPos?.lng]);
  return null;
}

export default function MapCard({ customerPos, workerPos, workerName = 'Worker', className = '' }) {
  const defaultCenter = [13.0418, 80.2341]; // T. Nagar default
  const center = customerPos ? [customerPos.lat, customerPos.lng] : defaultCenter;

  // Custom divIcons to avoid Leaflet image URL issues
  const customerIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-customer-icon',
      html: `
        <div style="
          width: 24px; height: 24px;
          background: #1F5BFF;
          border: 3px solid #FFFFFF;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
        ">
          <div style="width: 6px; height: 6px; background: #FFFFFF; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }, []);

  const workerIcon = useMemo(() => {
    const initials = workerName.slice(0, 2).toUpperCase();
    return L.divIcon({
      className: 'custom-worker-icon',
      html: `
        <div style="position: relative; width: 32px; height: 32px;">
          <div style="
            position: absolute; inset: -4px;
            background: rgba(31, 91, 255, 0.25);
            border-radius: 50%;
            animation: pulse 1.6s ease-out infinite;
          "></div>
          <div style="
            position: relative;
            width: 32px; height: 32px;
            background: #FFB400;
            color: #3A2A00;
            font-weight: 700;
            font-size: 11px;
            border: 2.5px solid #FFFFFF;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          ">
            ${initials}
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  }, [workerName]);

  const routePositions = useMemo(() => {
    if (workerPos && customerPos) {
      return [
        [workerPos.lat, workerPos.lng],
        [customerPos.lat, customerPos.lng],
      ];
    }
    return [];
  }, [workerPos, customerPos]);

  return (
    <div className={`w-full h-48 rounded-card overflow-hidden border border-line shadow-card relative z-0 ${className}`}>
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={false}
        dragging={true}
        zoomControl={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {customerPos && (
          <Marker position={[customerPos.lat, customerPos.lng]} icon={customerIcon} />
        )}
        {workerPos && (
          <Marker position={[workerPos.lat, workerPos.lng]} icon={workerIcon} />
        )}
        {routePositions.length === 2 && (
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: '#1F5BFF',
              weight: 4,
              opacity: 0.8,
              dashArray: '6, 8',
            }}
          />
        )}
        <Recenter customerPos={customerPos} workerPos={workerPos} />
      </MapContainer>
    </div>
  );
}
