'use client';

import { useState, useEffect } from 'react';
import { Map, Marker, Overlay } from 'pigeon-maps';
import type { Driver } from '@/lib/data';
import type { Point } from 'pigeon-maps';

type MapViewProps = {
  drivers: Driver[];
  selectedDriver: Driver | null;
};

// OpenStreetMap provider
const osmProvider = (x: number, y: number, z: number, dpr?: number): string => {
  return `https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`;
}

export function MapView({ drivers, selectedDriver }: MapViewProps) {
  const [center, setCenter] = useState<Point>([20.5937, 78.9629]); // Centered on India
  const [zoom, setZoom] = useState(5); // Zoom to show most of India
  const [activeMarker, setActiveMarker] = useState<Driver | null>(null);

  useEffect(() => {
    if (selectedDriver && selectedDriver.lastLocation.lat !== 0) {
      setCenter([selectedDriver.lastLocation.lat, selectedDriver.lastLocation.lng]);
      setZoom(13);
    } else {
      // When no driver is selected, default to a view of India
      setCenter([20.5937, 78.9629]);
      setZoom(5);
    }
  }, [selectedDriver]);

  return (
    <div className="h-[60vh] w-full rounded-lg overflow-hidden border relative z-0">
      <Map
        provider={osmProvider}
        center={center}
        zoom={zoom}
        onBoundsChanged={({ center, zoom }) => {
          setCenter(center);
          setZoom(zoom);
        }}
        boxClassname="pigeon-map"
      >
        {drivers.map(driver =>
          driver.lastLocation.lat !== 0 && (
            <Marker
              key={driver.id}
              width={40}
              anchor={[driver.lastLocation.lat, driver.lastLocation.lng]}
              onClick={() => setActiveMarker(driver)}
              color={selectedDriver?.id === driver.id ? '#1980e5' : '#888888'}
            />
          )
        )}
        {activeMarker && (
           <Overlay anchor={[activeMarker.lastLocation.lat, activeMarker.lastLocation.lng]} offset={[0, 0]}>
             <div className="bg-background rounded-lg shadow-lg p-2 min-w-[150px] relative -translate-x-1/2 -translate-y-[calc(100%+10px)]"
                onMouseLeave={() => setActiveMarker(null)}
             >
                <button
                    onClick={() => setActiveMarker(null)}
                    className="absolute top-0 right-1 text-lg font-bold"
                >&times;</button>
                <h4 className="font-bold">{activeMarker.name}</h4>
                <p className="text-sm">{activeMarker.id}</p>
                <p className="text-xs text-muted-foreground">Last seen: {activeMarker.lastSeen}</p>
             </div>
           </Overlay>
        )}
      </Map>
    </div>
  );
}
