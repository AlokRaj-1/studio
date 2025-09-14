
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
    if (!routePath || routePath.length < 2 || !mapState.width || !mapState.height || !mapState.latLngToPixel) return null;

    const pathPoints = routePath.map(p => mapState.latLngToPixel(p)).filter(p => p);

    if (pathPoints.length < 2) return null;

    const pathD = "M" + pathPoints.map(p => `${p[0]},${p[1]}`).join(" L");

    return (
        <svg width={mapState.width} height={mapState.height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
            <path d={pathD} stroke="hsl(var(--primary))" strokeWidth="3" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    );
}

// Function to get the bounding box of a route
const getBounds = (points: Point[]) => {
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  for (const [lat, lng] of points) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }
  return { minLat, maxLat, minLng, maxLng };
};

// Function to calculate the zoom level from a bounding box
const getZoom = (bounds: ReturnType<typeof getBounds>, mapDimensions: { width: number, height: number }) => {
  const WORLD_DIM = { height: 256, width: 256 };
  const ZOOM_MAX = 21;

  const latRad = (lat: number) => {
    const sin = Math.sin(lat * Math.PI / 180);
    const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
  }

  const zoom = (mapPx: number, worldPx: number, fraction: number) => {
    return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
  }

  const { minLat, maxLat, minLng, maxLng } = bounds;
  const latFraction = (latRad(maxLat) - latRad(minLat)) / Math.PI;
  const lngDiff = maxLng - minLng;
  const lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

  const latZoom = zoom(mapDimensions.height, WORLD_DIM.height, latFraction);
  const lngZoom = zoom(mapDimensions.width, WORLD_DIM.width, lngFraction);

  return Math.min(latZoom, lngZoom, ZOOM_MAX) - 1; // Subtract 1 for padding
};


export function MapView({ drivers, selectedDriver, routePath, busStops }: MapViewProps) {
  const [center, setCenter] = useState<Point>([20.5937, 78.9629]); // Default to India
  const [zoom, setZoom] = useState(5);
  const [activeMarker, setActiveMarker] = useState<Driver | null>(null);
  const [mapState, setMapState] = useState<any>({ width: 0, height: 0, latLngToPixel: () => [0,0] });

  useEffect(() => {
    if (selectedDriver && selectedDriver.lastLocation.lat !== 0) {
      setCenter([selectedDriver.lastLocation.lat, selectedDriver.lastLocation.lng]);
      setZoom(13);
    } else if (routePath && routePath.length > 0) {
        if (mapState.width > 0 && mapState.height > 0) {
            const bounds = getBounds(routePath);
            const newZoom = getZoom(bounds, { width: mapState.width, height: mapState.height });
            const newCenter: Point = [(bounds.minLat + bounds.maxLat) / 2, (bounds.minLng + bounds.maxLng) / 2];

            setCenter(newCenter);
            setZoom(newZoom);
        }
    } else {
      // If no driver is selected or driver has no location, reset to India view
      setCenter([20.5937, 78.9629]);
      setZoom(5);
    }
  }, [selectedDriver, routePath, mapState.width, mapState.height]);

  return (
    <div className="h-[70vh] w-full rounded-lg overflow-hidden border relative z-0">
      <Map
        provider={osmProvider}
        center={center}
        zoom={zoom}
        onBoundsChanged={(state) => {
          if (state) {
            setCenter(state.center);
            setZoom(state.zoom);
            setMapState(state);
          }
        }}
         onAnimationStop={(state) => {
            if (state) {
                setCenter(state.center);
                setZoom(state.zoom);
                setMapState(state);
            }
        }}
        metaWheelZoom={true}
      >
        <RouteOverlay routePath={routePath || []} mapState={mapState} />
        
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
      </Map>
    </div>
  );
}
