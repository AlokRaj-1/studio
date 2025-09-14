'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, CheckCircle } from 'lucide-react';
import { app } from '@/lib/firebase';
import { getFirestore, collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { drivers as mockDrivers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import Link from 'next/link';

const db = getFirestore(app);

export default function SeedPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSeed = async () => {
    setIsLoading(true);
    setIsSuccess(false);
    setError(null);

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
    } catch (e: any) {
      console.error('Error seeding database:', e);
      let errorMessage = 'Could not seed the database. Check the console for errors and ensure your Firebase project is set up correctly.';
      if (e.code === 'permission-denied') {
        errorMessage = 'Firestore permission denied. Please update your Firestore security rules to allow writes to the "drivers" collection.';
        setError(errorMessage);
      }
      toast({
        variant: 'destructive',
        title: 'Seeding Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Seed Firestore Database</CardTitle>
          <CardDescription>
            Click the button below to populate your Firestore 'drivers' collection with 20 sample drivers. This is required for the application to work correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6">
          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Action Required: Update Firestore Rules</AlertTitle>
              <AlertDescription>
                {error} You can find the required rules in the `firestore.rules` file in the root of this project.
              </AlertDescription>
            </Alert>
          )}

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
                Success! You can now navigate to the <Link href="/admin" className="underline font-medium">Admin Dashboard</Link> or <Link href="/driver" className="underline font-medium">Driver Interface</Link>.
            </p>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
