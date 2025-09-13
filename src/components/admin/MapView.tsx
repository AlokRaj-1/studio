'use client';

import { APIProvider, Map, Marker, InfoWindow } from '@vis.gl/react-google-maps';
import type { Driver } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useState } from 'react';

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type MapViewProps = {
  drivers: Driver[];
  selectedDriver: Driver | null;
};

export function MapView({ drivers, selectedDriver }: MapViewProps) {
  const [infoWindowDriver, setInfoWindowDriver] = useState<Driver | null>(null);

  if (!MAPS_API_KEY) {
    return (
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Map Unavailable</AlertTitle>
        <AlertDescription>
          The Google Maps API Key is not configured. Please add it to your environment variables as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to enable the map view.
        </AlertDescription>
      </Alert>
    );
  }

  const center = selectedDriver
    ? selectedDriver.lastLocation
    : { lat: 39.8283, lng: -98.5795 };
  
  const zoom = selectedDriver ? 12 : 4;

  return (
    <div className="h-[60vh] w-full rounded-lg overflow-hidden border">
      <APIProvider apiKey={MAPS_API_KEY}>
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          center={center}
          zoom={zoom}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          mapId="swifttrack-map"
        >
          {drivers.map(driver => (
            <Marker 
              key={driver.id} 
              position={driver.lastLocation} 
              onClick={() => setInfoWindowDriver(driver)}
            />
          ))}

          {infoWindowDriver && (
            <InfoWindow
              position={infoWindowDriver.lastLocation}
              onCloseClick={() => setInfoWindowDriver(null)}
            >
              <div className="p-2">
                <h4 className="font-bold">{infoWindowDriver.name}</h4>
                <p className="text-sm">{infoWindowDriver.id}</p>
                <p className="text-xs text-muted-foreground">Last seen: {infoWindowDriver.lastSeen}</p>
              </div>
            </InfoWindow>
          )}

        </Map>
      </APIProvider>
    </div>
  );
}
