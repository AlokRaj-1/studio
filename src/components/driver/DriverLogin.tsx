'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { type Driver } from '@/lib/data';
import { app } from '@/lib/firebase';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

const db = getFirestore(app);

type DriverLoginProps = {
  onLogin: (driver: Driver) => void;
};

export function DriverLogin({ onLogin }: DriverLoginProps) {
  const [driverId, setDriverId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [driverIds, setDriverIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchDriverIds = async () => {
      const querySnapshot = await getDocs(collection(db, "drivers"));
      setDriverIds(querySnapshot.docs.map(doc => doc.id));
      if(querySnapshot.docs.length > 0) {
        setDriverId(querySnapshot.docs[0].id);
      }
    };
    fetchDriverIds();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!driverId) {
      setError('Please select a driver.');
      return;
    }

    try {
      const driverRef = doc(db, 'drivers', driverId);
      const driverSnap = await getDoc(driverRef);

      if (driverSnap.exists()) {
        const driverData = driverSnap.data();
        if (driverData.password === password) {
          onLogin({ id: driverSnap.id, ...driverData } as Driver);
        } else {
          setError('Invalid password. Please try again.');
        }
      } else {
        setError('Invalid Vehicle Number. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during login. Please check your Firebase setup.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="driverId">Vehicle Number</Label>
          <select
            id="driverId"
            value={driverId}
            onChange={(e) => {
              setDriverId(e.target.value)
              setError('')
            }}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>Select your vehicle number</option>
            {driverIds.map(id => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
                setPassword(e.target.value)
                setError('')
            }}
            required
          />
          <p className="text-sm text-muted-foreground">
            Hint: The password is "password" for all drivers.
          </p>
        </div>
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <Button type="submit" className="w-full">
          Login
        </Button>
        <Button variant="link" asChild>
            <Link href="/admin">Go to Admin Dashboard</Link>
        </Button>
      </CardFooter>
    </form>
  );
}
