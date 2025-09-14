'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, CheckCircle, Database } from 'lucide-react';
import { app } from '@/lib/firebase';
import { getFirestore, collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { drivers as mockDrivers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

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
          password: password, 
          lastSeen: serverTimestamp(),
        });
      });

      await batch.commit();
      setIsSuccess(true);
      toast({
        title: 'Database Seeded Successfully',
        description: `${mockDrivers.length} sample drivers have been added to your Firestore database.`,
      });
    } catch (e: any) {
      console.error('Error seeding database:', e);
      let errorMessage = 'Could not seed the database. Check the console for errors and ensure your Firebase project is set up correctly.';
      if (e.code === 'permission-denied') {
        errorMessage = 'Firestore permission denied. Please update your Firestore security rules to allow writes to the "drivers" collection.';
      }
      setError(errorMessage);
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
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl">Seed Firestore Database</CardTitle>
          <CardDescription>
            Your application requires initial data to function. Click the button below to populate your Firestore 'drivers' collection with {mockDrivers.length} sample drivers.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6">
          <Button onClick={handleSeed} disabled={isLoading || isSuccess} size="lg" className="w-full max-w-xs">
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
               <>
                <Database className="mr-2 h-5 w-5" />
                Seed Sample Drivers
               </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive" className="w-full">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Action Required: Update Firestore Rules</AlertTitle>
              <AlertDescription>
                {error} You can find the required rules in the `firestore.rules` file in the root of this project.
                 <Separator className="my-4"/>
                 <h4 className="font-semibold mb-2">Steps to update rules:</h4>
                 <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Go to your Firebase Console.</li>
                    <li>Select your project: <strong>{process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'your-project-id'}</strong></li>
                    <li>Navigate to <strong>Firestore Database</strong> &gt; <strong>Rules</strong> tab.</li>
                    <li>Replace the existing rules with the content from `firestore.rules`.</li>
                    <li>Click <strong>Publish</strong>.</li>
                 </ol>
              </AlertDescription>
            </Alert>
          )}

           {isSuccess && (
            <Alert className="w-full">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                     You can now navigate to the <Link href="/admin" className="underline font-medium hover:text-primary">Admin Dashboard</Link> or <Link href="/driver" className="underline font-medium hover:text-primary">Driver Interface</Link>.
                </AlertDescription>
            </Alert>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
