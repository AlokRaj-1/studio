
'use client';

import { useState, useEffect, useTransition } from 'react';
import { getRouteETA, getActiveDrivers } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { punjabCities } from '@/lib/cities';
import { ArrowRight, Bus, Clock, LoaderCircle, MapIcon, RefreshCw, Route, Wind, MapPin, Milestone, Search, X } from 'lucide-react';
import { MapView } from '@/components/admin/MapView';
import type { Driver } from '@/lib/data';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import type { Point } from 'pigeon-maps';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ETAResult = {
  etaMinutes: number;
  distanceKm: number;
  routeSummary: string;
  avgSpeedKmph: number;
  busStops: { name: string; lat: number; lng: number }[];
  routePath: { lat: number, lng: number }[];
}

type LiveRoute = {
  driver: Driver;
  route?: ETAResult;
};

export default function TrackerPage() {
  const [isPending, startTransition] = useTransition();
  const [allRoutes, setAllRoutes] = useState<LiveRoute[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<LiveRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<LiveRoute | null>(null);
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const { toast } = useToast();

  const fetchLiveRoutes = () => {
    startTransition(async () => {
      setAllRoutes([]);
      setFilteredRoutes([]);
      setSelectedRoute(null);

      const { drivers } = await getActiveDrivers();

      if (drivers.length === 0) {
        toast({
          title: "No Active Buses",
          description: "There are currently no buses online. Please check back later.",
        });
        return;
      }
      
      const initialLiveRoutes: LiveRoute[] = drivers.map(driver => ({ driver }));
      setAllRoutes(initialLiveRoutes);
      setFilteredRoutes(initialLiveRoutes);
      if (initialLiveRoutes.length > 0) {
        setSelectedRoute(initialLiveRoutes[0]);
        // Eagerly show the first bus, then generate its route
        generateRouteForBus(initialLiveRoutes[0].driver.id);
      }
      
      // Generate routes for all buses in the background
      initialLiveRoutes.forEach(lr => generateRouteForBus(lr.driver.id));
    });
  };
  
  const generateRouteForBus = async (driverId: string) => {
    try {
        const fromCity = punjabCities[Math.floor(Math.random() * punjabCities.length)];
        const toCity = punjabCities.filter(c => c !== fromCity)[Math.floor(Math.random() * (punjabCities.length - 1))];

        const response = await getRouteETA({ from: fromCity, to: toCity });

        if (response.success && response.data) {
            const liveIndex = Math.floor(response.data.routePath.length / 2);
            const liveLocation = response.data.routePath[liveIndex];

            const newRoute: ETAResult = { ...response.data, routeSummary: `${fromCity} to ${toCity}` };

            setAllRoutes(prev => prev.map(lr => 
                lr.driver.id === driverId 
                ? { ...lr, route: newRoute, driver: { ...lr.driver, lastLocation: liveLocation } } 
                : lr
            ));
             setFilteredRoutes(prev => prev.map(lr => 
                lr.driver.id === driverId 
                ? { ...lr, route: newRoute, driver: { ...lr.driver, lastLocation: liveLocation } } 
                : lr
            ));
        } else {
            throw new Error(response.error || "Failed to generate route");
        }
    } catch (e) {
        console.error("Failed to generate route for driver", driverId, e);
        // The bus remains in the list, just without a route.
    }
  }


  useEffect(() => {
    fetchLiveRoutes();
  }, []);
  
  useEffect(() => {
    // If the selected route is updated in the main list, update the selected state as well
    if (selectedRoute) {
        const updatedSelected = allRoutes.find(r => r.driver.id === selectedRoute.driver.id);
        if (updatedSelected) {
            setSelectedRoute(updatedSelected);
        }
    }
  }, [allRoutes, selectedRoute?.driver.id]);
  
  const handleSelectRoute = (liveRoute: LiveRoute) => {
    setSelectedRoute(liveRoute);
    if (!liveRoute.route) {
        // If route hasn't been generated yet, trigger it now.
        generateRouteForBus(liveRoute.driver.id);
    }
  }

  const handleSearch = () => {
      if (!fromSearch && !toSearch) {
        setFilteredRoutes(allRoutes);
        return;
      }
      const filtered = allRoutes.filter(liveRoute => {
          if (!liveRoute.route) return false; // Can't filter if route doesn't exist yet
          const [routeFrom, routeTo] = liveRoute.route.routeSummary.split(' to ');
          const stops = [routeFrom, ...liveRoute.route.busStops.map(s => s.name), routeTo];
          
          const fromIndex = fromSearch ? stops.findIndex(stop => stop === fromSearch) : 0;
          const toIndex = toSearch ? stops.findIndex(stop => stop === toSearch) : stops.length - 1;

          if (fromSearch && fromIndex === -1) return false;
          if (toSearch && toIndex === -1) return false;

          return fromIndex <= toIndex;
      });

      setFilteredRoutes(filtered);
      if (filtered.length > 0) {
        handleSelectRoute(filtered[0]);
      } else {
        setSelectedRoute(null);
        toast({
            variant: "default",
            title: "No Matching Buses",
            description: "No active buses found for the selected route. Try clearing the search.",
        });
      }
  };

  const clearSearch = () => {
    setFromSearch('');
    setToSearch('');
    setFilteredRoutes(allRoutes);
    if(allRoutes.length > 0) {
        setSelectedRoute(allRoutes[0]);
    }
  };


  const routePathForMap = selectedRoute?.route?.routePath.map(p => [p.lat, p.lng] as Point);
  const driverForMap = selectedRoute ? [selectedRoute.driver] : [];
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Search className="text-primary"/> Find Your Bus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-sm font-medium">From</label>
                    <Select value={fromSearch} onValueChange={setFromSearch}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select starting point" />
                        </SelectTrigger>
                        <SelectContent>
                            {punjabCities.map(city => (
                                <SelectItem key={`from-${city}`} value={city}>{city}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium">To</label>
                     <Select value={toSearch} onValueChange={setToSearch}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select destination" />
                        </SelectTrigger>
                        <SelectContent>
                             {punjabCities.map(city => (
                                <SelectItem key={`to-${city}`} value={city}>{city}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
                 <div className="flex gap-2">
                    <Button onClick={handleSearch} className="w-full"><Search/>Search</Button>
                    <Button onClick={clearSearch} variant="outline" className="w-full"><X/>Clear</Button>
                 </div>
            </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Bus className="text-primary"/> Active Buses</CardTitle>
                <Button variant="ghost" size="icon" onClick={fetchLiveRoutes} disabled={isPending}>
                    <RefreshCw className={cn("h-5 w-5", isPending && "animate-spin")}/>
                </Button>
            </div>
            <CardDescription>Click on a bus to see its live location and route.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[65vh] overflow-y-auto">
             {isPending && filteredRoutes.length === 0 && (
                Array.from({length: 3}).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                ))
             )}
            {!isPending && filteredRoutes.length === 0 && (
                <Alert>
                    <Bus className="h-4 w-4" />
                    <AlertTitle>No buses found</AlertTitle>
                    <AlertDescription>
                        There are no active buses online right now.
                    </AlertDescription>
                </Alert>
            )}
            {filteredRoutes.map((liveRoute) => (
              <Card 
                key={liveRoute.driver.id} 
                className={cn(
                    "cursor-pointer hover:border-primary transition-colors",
                    selectedRoute?.driver.id === liveRoute.driver.id && "border-primary ring-2 ring-primary"
                )}
                onClick={() => handleSelectRoute(liveRoute)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={liveRoute.driver.avatar.imageUrl} alt={liveRoute.driver.name} data-ai-hint={liveRoute.driver.avatar.imageHint} />
                        <AvatarFallback>{liveRoute.driver.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold">{liveRoute.driver.name}</p>
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Online</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{liveRoute.driver.id}</p>
                        <div className="flex items-center gap-2 text-sm mt-1">
                          {liveRoute.route ? (
                            <>
                                <span>{liveRoute.route.routeSummary.split(' to ')[0]}</span>
                                <ArrowRight className="h-4 w-4 text-muted-foreground"/>
                                <span>{liveRoute.route.routeSummary.split(' to ')[1]}</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground text-xs flex items-center gap-1">
                                <LoaderCircle className="h-3 w-3 animate-spin"/> Generating route...
                            </span>
                          )}
                        </div>
                    </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="shadow-lg">
          <CardHeader>
             {selectedRoute ? (
                <>
                <CardTitle className="flex items-center gap-2"><MapIcon className="text-primary"/> Route for {selectedRoute.driver.name}</CardTitle>
                <CardDescription>
                    Showing live location for bus <span className="font-semibold">{selectedRoute.driver.id}</span>
                </CardDescription>
                </>
             ) : (
                <>
                <CardTitle className="flex items-center gap-2"><MapIcon className="text-primary"/> Live Bus Map</CardTitle>
                <CardDescription>Select a bus from the list to see its route.</CardDescription>
                </>
             )}
          </CardHeader>
          <CardContent>
            <MapView 
              drivers={driverForMap}
              selectedDriver={selectedRoute?.driver ?? null}
              routePath={routePathForMap}
              busStops={selectedRoute?.route?.busStops}
            />
          </CardContent>
        </Card>
        {selectedRoute?.route && (
             <Card className="shadow-lg mt-8 animate-in fade-in">
             <CardHeader>
                <CardTitle className="flex items-center gap-2"><Route className="text-primary"/> Trip Estimate</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted col-span-3 sm:col-span-1">
                      <div className="flex items-center gap-2">
                          <Clock className="text-muted-foreground" />
                          <span className="font-medium">ETA</span>
                      </div>
                      <span className="font-bold text-primary">{selectedRoute.route.etaMinutes} min</span>
                  </div>
                   <div className="flex items-center justify-between p-3 rounded-lg bg-muted col-span-3 sm:col-span-1">
                      <div className="flex items-center gap-2">
                          <Milestone className="text-muted-foreground" />
                          <span className="font-medium">Distance</span>
                      </div>
                      <span className="font-bold text-primary">{selectedRoute.route.distanceKm} km</span>
                  </div>
                   <div className="flex items-center justify-between p-3 rounded-lg bg-muted col-span-3 sm:col-span-1">
                      <div className="flex items-center gap-2">
                          <Wind className="text-muted-foreground" />
                          <span className="font-medium">Avg Speed</span>
                      </div>
                      <span className="font-bold text-primary">{selectedRoute.route.avgSpeedKmph.toFixed(0)} km/h</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold my-4 flex items-center gap-2"><MapPin className="text-muted-foreground"/> Major Stops</h4>
                  <div className="border rounded-lg p-2 max-h-40 overflow-y-auto">
                    <ul className="space-y-1">
                      {selectedRoute.route.busStops.map((stop, i) => (
                        <li key={i} className="text-sm p-1 bg-background rounded">{stop.name}</li>
                      ))}
                    </ul>
                  </div>
                </div>
             </CardContent>
          </Card>
        )}
         {selectedRoute && !selectedRoute.route && !isPending && (
             <Card className="shadow-lg mt-8 animate-in fade-in">
             <CardHeader>
                <CardTitle className="flex items-center gap-2"><Route className="text-primary"/> Trip Estimate</CardTitle>
             </CardHeader>
             <CardContent className="flex items-center justify-center p-8 gap-2 text-muted-foreground">
                <LoaderCircle className="h-5 w-5 animate-spin" />
                <span>Calculating route details...</span>
             </CardContent>
          </Card>
         )}
      </div>
    </div>
  );
}

    