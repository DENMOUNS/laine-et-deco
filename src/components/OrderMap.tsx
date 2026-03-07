import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface OrderMapProps {
  customerLocation: [number, number];
  customerName: string;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export const OrderMap: React.FC<OrderMapProps> = ({ customerLocation, customerName }) => {
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to a default location (e.g., center of Douala/Yaoundé if in Cameroon context)
          setUserCoords([4.0511, 9.7679]); // Douala
        }
      );
    } else {
      setUserCoords([4.0511, 9.7679]); // Douala
    }
  }, []);

  if (!userCoords) return <div className="h-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center">Localisation en cours...</div>;

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm z-0">
      <MapContainer 
        center={customerLocation} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <div className="leaflet-bottom leaflet-right">
          <div className="leaflet-control-attribution leaflet-control" style={{ 
            margin: 0, 
            padding: '4px 10px', 
            background: 'rgba(255,255,255,0.9)', 
            fontSize: '10px',
            fontWeight: 'bold',
            color: '#1e293b',
            borderTopLeftRadius: '12px',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span className="text-accent">Laine & Déco</span>
            <span className="text-slate-300">|</span>
            <span>&copy; OpenStreetMap contributors</span>
          </div>
        </div>
        <ChangeView center={customerLocation} />
        
        {/* Delivery Marker */}
        <Marker position={customerLocation}>
          <Popup>
            <div className="font-bold">Lieu de livraison</div>
            <div className="text-xs">Client: {customerName}</div>
          </Popup>
        </Marker>

        {/* User Marker */}
        <Marker position={userCoords}>
          <Popup>
            <div className="font-bold">Votre position</div>
            <div className="text-xs">Consultation de la commande</div>
          </Popup>
        </Marker>

        {/* Probable Route (Simple line for demo) */}
        <Polyline 
          positions={[userCoords, customerLocation]} 
          color="#F27D26" 
          dashArray="10, 10" 
          weight={4}
          opacity={0.6}
        />
      </MapContainer>
    </div>
  );
};
