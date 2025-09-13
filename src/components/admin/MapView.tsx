'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { Driver } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useState, useEffect } from 'react';
import L from 'leaflet';

// Fix for default icon not showing in Leaflet
import 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/images/marker-icon-2x.png';


const defaultIcon = L.icon({
    iconUrl: '/marker-icon.png',
    iconRetinaUrl: '/marker-icon-2x.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

type MapViewProps = {
  drivers: Driver[];
  selectedDriver: Driver | null;
};

export function MapView({ drivers, selectedDriver }: MapViewProps) {
  const [map, setMap] = useState<L.Map | null>(null);

  const center: L.LatLngTuple = selectedDriver
    ? [selectedDriver.lastLocation.lat, selectedDriver.lastLocation.lng]
    : [31.1471, 75.3412];
  
  const zoom = selectedDriver ? 13 : 7;

  useEffect(() => {
    if (map && selectedDriver && selectedDriver.lastLocation.lat !== 0) {
      map.flyTo([selectedDriver.lastLocation.lat, selectedDriver.lastLocation.lng], 13);
    }
  }, [selectedDriver, map, selectedDriver?.lastLocation.lat, selectedDriver?.lastLocation.lng]);

  return (
    <div className="h-[60vh] w-full rounded-lg overflow-hidden border relative z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        className="h-full w-full"
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {drivers.map(driver => (
          driver.lastLocation.lat !== 0 &&
          <Marker 
            key={driver.id} 
            position={[driver.lastLocation.lat, driver.lastLocation.lng]}
            icon={defaultIcon}
          >
            <Popup>
              <div className="p-0 m-0">
                <h4 className="font-bold">{driver.name}</h4>
                <p className="text-sm">{driver.id}</p>
                <p className="text-xs text-muted-foreground">Last seen: {driver.lastSeen}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
