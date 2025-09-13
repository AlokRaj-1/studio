'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, CheckCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { drivers as mockDrivers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

export default function SeedPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSeed = async () => {
    setIsLoading(true);
    setIsSuccess(false);

    try {
      const batch = writeBatch(db);
      const driversCollection = collection(db, 'drivers');

      mockDrivers.forEach((driver) => {
        const driverRef = doc(driversCollection, driver.id);
        const { password, ...driverData } = driver;
        batch.set(driverRef, {
          ...driverData,
          password: password, // Note: Storing passwords in plaintext is not secure. For demo purposes only.
          lastSeen: serverTimestamp(),
        });
      });

      await batch.commit();
      setIsSuccess(true);
      toast({
        title: 'Database Seeded',
        description: 'The mock driver data has been added to your Firestore database.',
      });
    } catch (error) {
      console.error('Error seeding database:', error);
      toast({
        variant: 'destructive',
        title: 'Seeding Failed',
        description: 'Could not seed the database. Check the console for errors and ensure your Firebase project is set up correctly.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Seed Firestore Database</CardTitle>
          <CardDescription>
            Populate your Firestore 'drivers' collection with the initial mock data. This is required for the application to work correctly with the new Firebase integration.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6">
          <Button onClick={handleSeed} disabled={isLoading || isSuccess} size="lg">
            {isLoading ? (
              <>
                <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                Seeding...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Seeding Complete
              </>
            ) : (
              'Seed Database'
            )}
          </Button>
           {isSuccess && (
            <p className="text-sm text-green-600 text-center">
                Success! You can now navigate to the <a href="/admin" className="underline font-medium">Admin Dashboard</a> or <a href="/driver" className="underline font-medium">Driver Interface</a>.
            </p>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
