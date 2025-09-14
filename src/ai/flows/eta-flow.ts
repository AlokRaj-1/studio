'use server';

/**
 * @fileOverview AI tool to calculate the estimated time of arrival (ETA) for a bus route.
 *
 * - getETA - A function that takes a start and destination and returns an ETA.
 * - ETAInput - The input type for the getETA function.
 * - ETAOutput - The return type for the getETA function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {app} from '@/lib/firebase';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const db = getFirestore(app);

const ETAInputSchema = z.object({
  from: z.string().describe('The starting location, e.g., a city name.'),
  to: z.string().describe('The destination location, e.g., a city name.'),
});

export type ETAInput = z.infer<typeof ETAInputSchema>;

const ETAOutputSchema = z.object({
    etaMinutes: z.number().describe('The estimated time of arrival in minutes.'),
    distanceKm: z.number().describe('The estimated distance of the route in kilometers.'),
    routeSummary: z.string().describe('A brief summary of the suggested route.'),
    avgSpeedKmph: z.number().describe('The estimated average speed in kilometers per hour.'),
    busStops: z.array(z.object({
        name: z.string().describe('The name of the bus stop.'),
        lat: z.number().describe('The latitude of the bus stop.'),
        lng: z.number().describe('The longitude of the bus stop.'),
    })).describe('An array of 5-7 major bus stops along the route.'),
    routePath: z.array(z.object({
        lat: z.number().describe('The latitude of a point on the route.'),
        lng: z.number().describe('The longitude of a point on the route.'),
    })).describe('An array of 20-30 points that form a plausible route path for drawing on a map.'),
});

export type ETAOutput = z.infer<typeof ETAOutputSchema>;

export async function getETA(input: ETAInput): Promise<ETAOutput> {
  return etaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'etaPrompt',
  input: {schema: ETAInputSchema},
  output: {schema: ETAOutputSchema},
  prompt: `You are an expert Punjabi travel assistant and route planner. Your task is to generate a plausible and detailed bus route between two locations in Punjab, India.

  You must generate all data yourself based on your knowledge. Do not use any tools.

  From: "{{from}}"
  To: "{{to}}"

  1.  **Estimate Route:** Determine a realistic distance in kilometers and a plausible travel time in minutes for a bus.
  2.  **Calculate Speed:** Based on the distance and time, calculate the average speed in km/h.
  3.  **Identify Major Stops:** Identify 5-7 major towns or cities that would serve as bus stops along this route. Provide their names and approximate geographic coordinates (latitude and longitude).
  4.  **Generate Route Path:** Create a detailed route path consisting of 20-30 latitude and longitude points. This path should represent a realistic road route between the start and end points, passing near your identified bus stops.
  5.  **Create Summary:** Write a brief, one-sentence summary of the main highway or roads the route would likely follow.
  6.  **Assemble Output:** Format all of this information into the ETAOutputSchema JSON object.
`,
});

const etaFlow = ai.defineFlow(
  {
    name: 'etaFlow',
    inputSchema: ETAInputSchema,
    outputSchema: ETAOutputSchema,
  },
  async input => {
    // Generate a consistent cache key
    const cacheKey = `eta-${input.from.toLowerCase().replace(/\s/g, '-')}-to-${input.to.toLowerCase().replace(/\s/g, '-')}`;
    const cacheRef = doc(db, 'routeCache', cacheKey);
    
    // Check cache first
    const cacheSnap = await getDoc(cacheRef);
    if (cacheSnap.exists()) {
      console.log(`[Cache Hit] Returning cached route for ${cacheKey}`);
      return ETAOutputSchema.parse(cacheSnap.data());
    }
    
    console.log(`[Cache Miss] Generating new route for ${cacheKey}`);
    
    // If not in cache, call the AI
    const {output} = await prompt(input);
    
    // Save the new result to the cache
    if (output) {
      await setDoc(cacheRef, output);
      console.log(`[Cache Set] Saved new route for ${cacheKey}`);
    }
    
    return output!;
  }
);
