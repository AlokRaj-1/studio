'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getRouteETA } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { punjabCities } from '@/lib/cities';
import { ArrowRightLeft, Bus, Clock, LoaderCircle, MapIcon, Milestone, Route, Wind, MapPin } from 'lucide-react';
import { MapView } from '@/components/admin/MapView';
import type { Driver } from '@/lib/data';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import type { Point } from 'pigeon-maps';

const formSchema = z.object({
  from: z.string().min(1, 'Please select a starting city.'),
  to: z.string().min(1, 'Please select a destination city.'),
}).refine(data => data.from !== data.to, {
  message: "From and To cities cannot be the same.",
  path: ["to"],
});

type BusStop = {
  name: string;
  lat: number;
  lng: number;
}

type ETAResult = {
  etaMinutes: number;
  distanceKm: number;
  routeSummary: string;
  avgSpeedKmph: number;
  busStops: BusStop[];
  routePath: Point[];
}

export default function TrackerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ETAResult | null>(null);
  const [busPosition, setBusPosition] = useState<Point | null>(null);
  const [mockDriver, setMockDriver] = useState<Driver>({
    id: 'PB01-BUS-001',
    name: 'Punjab Roadways',
    avatar: { id: 'driver-1', imageUrl: '', imageHint: 'bus', description: 'Bus' },
    lastLocation: { lat: 30.9010, lng: 75.8573 }, // Ludhiana
    lastSeen: new Date().toISOString(),
    status: 'online',
  });
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from: '',
      to: '',
    },
  });

  useEffect(() => {
    let animationFrameId: number;

    if (result && result.routePath.length > 0) {
      setBusPosition(result.routePath[0]);
      const totalSteps = 500; // Number of steps for the animation loop
      let step = 0;

      const animate = () => {
        const pathIndex = Math.floor((step / totalSteps) * (result.routePath.length - 1));
        const nextPathIndex = Math.min(pathIndex + 1, result.routePath.length - 1);
        
        const start = result.routePath[pathIndex];
        const end = result.routePath[nextPathIndex];
        
        const fraction = ((step % (totalSteps / (result.routePath.length -1))) / (totalSteps / (result.routePath.length - 1)));
        
        const lat = start[0] + (end[0] - start[0]) * fraction;
        const lng = start[1] + (end[1] - start[1]) * fraction;
        
        const newBusPosition: Point = [lat, lng];
        setBusPosition(newBusPosition);

        setMockDriver(prev => ({
          ...prev,
          lastLocation: { lat: newBusPosition[0], lng: newBusPosition[1] }
        }));
        
        step = (step + 1) % totalSteps;
        animationFrameId = requestAnimationFrame(animate);
      };
      
      animationFrameId = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [result]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setBusPosition(null);
    try {
      const response = await getRouteETA(values);
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Calculation Failed",
          description: response.error,
        });
      } else {
        const transformedData = {
          ...response.data,
          routePath: response.data.routePath.map((p: {lat: number, lng: number}) => [p.lat, p.lng]) as Point[],
          busStops: response.data.busStops.map((bs: BusStop) => ({...bs}))
        };
        setResult(transformedData);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const driversToShow = busPosition ? [{...mockDriver, lastLocation: {lat: busPosition[0], lng: busPosition[1]}}] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Route className="text-primary"/> Plan Your Trip</CardTitle>
            <CardDescription>Select your start and end points to get an ETA.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="from"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a starting city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {punjabCities.map(city => (
                            <SelectItem key={`from-${city}`} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-center">
                    <ArrowRightLeft className="text-muted-foreground"/>
                </div>
                <FormField
                  control={form.control}
                  name="to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a destination city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {punjabCities.map(city => (
                            <SelectItem key={`to-${city}`} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
                  Get Route & ETA
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {result && (
          <Card className="shadow-lg animate-in fade-in">
             <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bus className="text-primary"/> Trip Estimate</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted col-span-2">
                      <div className="flex items-center gap-2">
                          <Clock className="text-muted-foreground" />
                          <span className="font-medium">Estimated Time</span>
                      </div>
                      <span className="font-bold text-primary">{result.etaMinutes} min</span>
                  </div>
                   <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                          <Milestone className="text-muted-foreground" />
                          <span className="font-medium">Distance</span>
                      </div>
                      <span className="font-bold text-primary">{result.distanceKm} km</span>
                  </div>
                   <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                          <Wind className="text-muted-foreground" />
                          <span className="font-medium">Avg Speed</span>
                      </div>
                      <span className="font-bold text-primary">{result.avgSpeedKmph} km/h</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold my-4 flex items-center gap-2"><MapPin className="text-muted-foreground"/> Major Stops</h4>
                  <div className="border rounded-lg p-2 max-h-40 overflow-y-auto">
                    <ul className="space-y-1">
                      {result.busStops.map((stop, i) => (
                        <li key={i} className="text-sm p-1 bg-background rounded">{stop.name}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Alert>
                    <Route className="h-4 w-4" />
                    <AlertTitle>Route Info</AlertTitle>
                    <AlertDescription>
                        {result.routeSummary}
                    </AlertDescription>
                </Alert>
             </CardContent>
          </Card>
        )}
      </div>

      <div className="lg:col-span-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapIcon className="text-primary"/> Live Bus Location</CardTitle>
            <CardDescription>Real-time location of the bus on the route.</CardDescription>
          </CardHeader>
          <CardContent>
            <MapView 
              drivers={driversToShow} 
              selectedDriver={driversToShow[0]}
              routePath={result?.routePath}
              busStops={result?.busStops}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
