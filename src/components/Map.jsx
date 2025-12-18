import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// Fix default icon paths for bundlers (Vite/browser-safe imports)
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      if (setPosition) setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });

  return position ? <Marker position={[position.lat, position.lng]} /> : null;
};

const Map = ({ center = { lat: 20.5937, lng: 78.9629 }, zoom = 6, position, setPosition, height = 300, path = [] }) => {
  const centerArr = [center.lat, center.lng];
  const mapCenter = position ? [position.lat, position.lng] : (path && path.length ? [path[0].lat, path[0].lng] : centerArr);
  const polylinePoints = (path && path.length) ? path.map(p => [p.lat, p.lng]) : null;
  return (
    <div style={{ height }} className="rounded overflow-hidden">
      <MapContainer center={mapCenter} zoom={position ? 13 : zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
        {polylinePoints && polylinePoints.length >= 2 && (
          <Polyline positions={polylinePoints} pathOptions={{ color: 'blue', weight: 4 }} />
        )}
      </MapContainer>
    </div>
  );
};

export default Map;
