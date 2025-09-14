'use client';

import { useState, useEffect } from 'react';
import { Map, Marker, Overlay } from 'pigeon-maps';
import type { Driver } from '@/lib/data';
import type { Point } from 'pigeon-maps';
import { Bus, MapPin } from 'lucide-react';

type MapViewProps = {
  drivers: Driver[];
  selectedDriver: Driver | null;
  routePath?: Point[];
  busStops?: { name: string; lat: number; lng: number }[];
};

// OpenStreetMap provider
const osmProvider = (x: number, y: number, z: number): string => {
  return `https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`;
};

function RouteOverlay({ routePath, mapState }: { routePath: Point[], mapState: any }) {
    if (!routePath || routePath.length < 2) return null;

    const { width, height } = mapState;
    const pathPoints = routePath.map(p => mapState.latLngToPixel(p)).filter(p => p);

    if (pathPoints.length < 2) return null;

    const pathD = "M" + pathPoints.map(p => `${p[0]},${p[1]}`).join(" L");

    return (
        <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
            <path d={pathD} stroke="hsl(var(--primary))" strokeWidth="3" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    );
}

export function MapView({ drivers, selectedDriver, routePath, busStops }: MapViewProps) {
  const [center, setCenter] = useState<Point>([20.5937, 78.9629]); // Default to India
  const [zoom, setZoom] = useState(5);
  const [activeMarker, setActiveMarker] = useState<Driver | null>(null);
  const [mapState, setMapState] = useState<any>(null);

  useEffect(() => {
    if (selectedDriver && selectedDriver.lastLocation.lat !== 0) {
      setCenter([selectedDriver.lastLocation.lat, selectedDriver.lastLocation.lng]);
      setZoom(13);
    } else if (routePath && routePath.length > 0) {
        // Fit map to route bounds
        const lats = routePath.map(p => p[0]);
        const lngs = routePath.map(p => p[1]);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        const newCenter: Point = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];

        setCenter(newCenter);
        // A simple heuristic for zoom level based on the extent
        const latDiff = maxLat - minLat;
        const lngDiff = maxLng - minLng;
        const maxDiff = Math.max(latDiff, lngDiff);
        const newZoom = Math.floor(8 - Math.log(maxDiff));
        setZoom(newZoom > 14 ? 14 : newZoom);

    } else {
      // If no driver is selected or driver has no location, reset to India view
      setCenter([20.5937, 78.9629]);
      setZoom(5);
    }
  }, [selectedDriver, routePath]);

  return (
    <div className="h-[70vh] w-full rounded-lg overflow-hidden border relative z-0">
      <Map
        provider={osmProvider}
        center={center}
        zoom={zoom}
        onBoundsChanged={({ center, zoom, bounds }) => {
          setCenter(center);
          setZoom(zoom);
        }}
         onAnimationStop={({ center, zoom, bounds }) => {
            setCenter(center);
            setZoom(zoom);
        }}
        metaWheelZoom={true}
      >
        {routePath && <RouteOverlay routePath={routePath} mapState={mapState} />}
        
        {busStops && busStops.map((stop, i) => (
            <Marker
              key={`stop-${i}`}
              width={20}
              anchor={[stop.lat, stop.lng]}
              color={'hsl(var(--secondary-foreground))'}
              payload={stop.name}
            >
                <MapPin className="w-5 h-5"/>
            </Marker>
        ))}

        {drivers.map(driver =>
          driver.lastLocation.lat !== 0 && (
            <Marker
              key={driver.id}
              width={40}
              anchor={[driver.lastLocation.lat, driver.lastLocation.lng]}
              onClick={() => setActiveMarker(driver)}
              color={selectedDriver?.id === driver.id ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
            >
              <Bus className="w-7 h-7 bg-background rounded-full p-1 shadow-lg" style={{transform: 'translate(-14px, -14px)'}}/>
            </Marker>
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
                <p className="text-xs text-muted-foreground">
                  Last seen: {
                    typeof activeMarker.lastSeen === 'string'
                      ? activeMarker.lastSeen
                      : activeMarker.lastSeen?.toDate
                        ? activeMarker.lastSeen.toDate().toLocaleString()
                        : ''
                  }
                </p>
             </div>
           </Overlay>
        )}
         <Overlay>
            {/* This is a hacky way to get the internal map state for projection calculations */}
            {(state: any) => {
                if (mapState !== state) {
                    setMapState(state);
                }
                return null;
            }}
        </Overlay>
      </Map>
    </div>
  );
}
