'use server';

import { analyzeHistoricalRoute, HistoricalRouteAnalysisInput } from '@/ai/flows/historical-route-analysis';
import { getLocationCoordinates, LocationEditorInput } from '@/ai/flows/location-editor-flow';
import { z } from 'zod';
import { app } from '@/lib/firebase';
import { getFirestore, collection, doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const db = getFirestore(app);

const analysisFormSchema = z.object({
  driverId: z.string().min(1, 'Driver ID is required.'),
  startDate: z.date({ required_error: 'Start date is required.' }),
  endDate: z.date({ required_error: 'End date is required.' }),
  liveLocationData: z.string().min(1, 'Live location data is required.'),
  expectedRoute: z.string().min(1, 'Expected route is required.'),
});

export async function getHistoricalRouteAnalysis(data: z.infer<typeof analysisFormSchema>) {
  try {
    const validatedData = analysisFormSchema.safeParse(data);
    if (!validatedData.success) {
      return { error: 'Invalid input data.', details: validatedData.error.format() };
    }

    const analysisInput: HistoricalRouteAnalysisInput = {
      ...validatedData.data,
      startDate: validatedData.data.startDate.toISOString(),
      endDate: validatedData.data.endDate.toISOString(),
    };

    const result = await analyzeHistoricalRoute(analysisInput);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in getHistoricalRouteAnalysis:', error);
    return { error: 'An unexpected error occurred during analysis.' };
  }
}

const createDriverFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  id: z.string().min(3, { message: "ID must be at least 3 characters." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters."}),
});

export async function createDriver(data: z.infer<typeof createDriverFormSchema>) {
    try {
        const validatedData = createDriverFormSchema.safeParse(data);
        if (!validatedData.success) {
            return { error: 'Invalid input data.', details: validatedData.error.format() };
        }
        
        const { id, name, password } = validatedData.data;
        
        const driverRef = doc(db, 'drivers', id);

        // Use a random placeholder avatar
        const randomAvatar = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];
        
        await setDoc(driverRef, {
            name,
            password,
            avatar: randomAvatar,
            lastLocation: { lat: 0, lng: 0 },
            status: 'inactive',
            lastSeen: serverTimestamp(),
        });
        
        return { success: true, driverId: id };

    } catch (error: any) {
        console.error('Error creating driver:', error);
        if(error.code === 'permission-denied') {
             return { error: 'Permission denied. Make sure your Firestore security rules allow writes to the drivers collection.' };
        }
        return { error: 'An unexpected error occurred while creating the driver.' };
    }
}


const locationEditorFormSchema = z.object({
  driverId: z.string().min(1, 'Driver ID is required.'),
  locationDescription: z.string().min(3, 'Location description is required.'),
});

export async function editDriverLocation(data: z.infer<typeof locationEditorFormSchema>) {
  try {
    const validatedData = locationEditorFormSchema.safeParse(data);
    if (!validatedData.success) {
      return { error: 'Invalid input data.', details: validatedData.error.format() };
    }

    const { driverId, locationDescription } = validatedData.data;

    // Use AI to get coordinates from the description
    const locationResult = await getLocationCoordinates({ locationDescription });
    
    if (!locationResult || !locationResult.lat || !locationResult.lng) {
        return { error: 'Could not determine coordinates for the location.' };
    }

    const { lat, lng } = locationResult;

    // Update the driver's location in Firestore
    const driverRef = doc(db, 'drivers', driverId);
    await updateDoc(driverRef, {
      lastLocation: { lat, lng },
      lastSeen: serverTimestamp(),
    });

    return { success: true, data: { ...locationResult, driverId } };

  } catch (error) {
    console.error('Error in editDriverLocation:', error);
    return { error: 'An unexpected error occurred while updating the location.' };
  }
}
