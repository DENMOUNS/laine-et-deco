import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons using CDN
const markerIcon = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const markerShadow = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Delivery destination icon (red)
const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Admin/Consultant icon (blue/gold)
const adminIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface OrderMapProps {
  customerLocation: [number, number] | { lat: number, lng: number };
  customerName?: string;
}

const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  map.setView(center);
  return null;
};

export const OrderMap: React.FC<OrderMapProps> = ({ customerLocation, customerName }) => {
  const [adminPos, setAdminPos] = useState<[number, number] | null>(null);

  // Normalize customer location
  const destPos: [number, number] = Array.isArray(customerLocation) 
    ? customerLocation 
    : [customerLocation.lat, customerLocation.lng];

  useEffect(() => {
    // Try to get current admin location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setAdminPos([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn("Geolocation failed or denied", error);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden" id="leaflet-map-container">
      <MapContainer 
        center={destPos} 
        zoom={13} 
        scrollWheelZoom={false}
        className="w-full h-full absolute inset-0"
      >
        <TileLayer
          attribution='Laine & Déco Contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Customer Location */}
        <Marker position={destPos} icon={deliveryIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-bold">Lieu de livraison</p>
              <p className="text-xs text-gray-600">{customerName || 'Client'}</p>
            </div>
          </Popup>
        </Marker>

        {/* Zone de livraison (Circle) */}
        <Circle 
          center={destPos} 
          radius={500} 
          pathOptions={{ fillColor: 'red', color: 'red', opacity: 0.2, fillOpacity: 0.1 }} 
        />

        {/* Admin Location & Route */}
        {adminPos && (
          <>
            <Marker position={adminPos} icon={adminIcon}>
              <Popup>Votre position actuelle</Popup>
            </Marker>
            
            {/* Draw straight line as estimate for path between consultant and delivery */}
            <Polyline 
              positions={[adminPos, destPos]} 
              pathOptions={{ color: '#3b82f6', weight: 3, dashArray: '10, 10', opacity: 0.8 }} 
            >
              <Popup>Chemin estimé vers la livraison</Popup>
            </Polyline>
          </>
        )}

        <ChangeView center={destPos} />
      </MapContainer>
    </div>
  );
};

