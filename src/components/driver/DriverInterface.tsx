'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, MapPin, Play, Square, LoaderCircle } from 'lucide-react';
import { type Driver } from '@/lib/data';
import { app } from '@/lib/firebase';
import { getFirestore, doc, updateDoc, serverTimestamp, Timestamp, onSnapshot } from 'firebase/firestore';

const db = getFirestore(app);

type DriverInterfaceProps = {
  driver: Driver;
  onLogout: () => void;
};

type Position = {
  lat: number;
  lng: number;
};

export function DriverInterface({ driver, onLogout }: DriverInterfaceProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [position, setPosition] = useState<Position | null>(driver.lastLocation);
  const [currentStatus, setCurrentStatus] = useState<'idle' | 'tracking' | 'error' | 'loading'>('idle');
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "drivers", driver.id), (doc) => {
      const data = doc.data();
      if(data?.status === 'online') {
        setCurrentStatus('tracking');
        setIsTracking(true);
      } else {
        setCurrentStatus('idle');
        setIsTracking(false);
      }
    });
    return () => unsub();
  }, [driver.id]);


  const startTracking = () => {
    if (!navigator.geolocation) {
      setCurrentStatus('error');
      console.error('Geolocation is not supported by your browser.');
      return;
    }
    
    setCurrentStatus('loading');
    watchId.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const newPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setPosition(newPosition);
        
        const driverRef = doc(db, 'drivers', driver.id);
        await updateDoc(driverRef, {
          lastLocation: newPosition,
          lastSeen: serverTimestamp(),
          status: 'online',
        });
        
        setIsTracking(true);
        setCurrentStatus('tracking');
      },
      (err) => {
        console.error('Error watching position:', err);
        setCurrentStatus('error');
        setIsTracking(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const stopTracking = async () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    const driverRef = doc(db, 'drivers', driver.id);
    await updateDoc(driverRef, {
      status: 'offline',
      lastSeen: serverTimestamp()
    });
    setIsTracking(false);
    setCurrentStatus('idle');
  };

  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  const handleToggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };
  
  const getStatusBadge = () => {
    switch (currentStatus) {
      case 'tracking':
        return <Badge variant="default" className="bg-green-600">Tracking Active</Badge>;
      case 'loading':
        return <Badge variant="secondary"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Starting...</Badge>;
      case 'error':
        return <Badge variant="destructive">GPS Error</Badge>;
      case 'idle':
      default:
        return <Badge variant="secondary">Tracking Inactive</Badge>;
    }
  };

  return (
    <>
      <CardContent className="flex flex-col items-center space-y-6 pt-6">
        <div className="text-center">
            <p className="text-muted-foreground">Welcome</p>
            <h3 className="text-xl font-semibold">{driver?.name}</h3>
            <p className="text-sm text-muted-foreground">{driver.id}</p>
        </div>
        
        <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg font-medium">
                {position ? `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}` : 'No Location Data'}
            </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <p className="font-medium">Status:</p>
          {getStatusBadge()}
        </div>

        <Button
          onClick={handleToggleTracking}
          size="lg"
          className="w-full"
          disabled={currentStatus === 'loading'}
        >
          {isTracking ? (
            <>
              <Square className="mr-2 h-5 w-5" /> Stop Tracking
            </>
          ) : (
            <>
              <Play className="mr-2 h-5 w-5" /> Start Tracking
            </>
          )}
        </Button>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button onClick={onLogout} variant="ghost" className="w-full text-muted-foreground">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </CardFooter>
    </>
  );
}
