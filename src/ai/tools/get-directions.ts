'use server';
/**
 * @fileOverview A Genkit tool for fetching directions from the Google Maps API.
 * 
 * - getDirections - The tool definition for fetching directions.
 */
import { ai } from '@/ai/genkit';
import { getDirections as getGoogleDirections } from '@/services/google-maps';
import { z } from 'zod';

// Define the Zod schema for the tool's input
const DirectionsInputSchema = z.object({
  origin: z.string().describe('The starting point for the directions.'),
  destination: z.string().describe('The ending point for the directions.'),
});

// Define the Zod schema for the tool's output
const DirectionsOutputSchema = z.object({
  distance: z.number().describe('The total distance of the route in kilometers.'),
  duration: z.number().describe('The total duration of the route in minutes.'),
  routePath: z.array(z.object({
    lat: z.number(),
    lng: z.number()
  })).describe('An array of points that form the route path.'),
  summary: z.string().describe('A summary of the route, typically the name of the main highway or road.'),
});

// Define the Genkit tool
export const getDirections = ai.defineTool(
  {
    name: 'getDirections',
    description: 'Fetches driving directions between two locations using Google Maps API.',
    inputSchema: DirectionsInputSchema,
    outputSchema: DirectionsOutputSchema,
  },
  async (input) => {
    try {
      const result = await getGoogleDirections(input.origin, input.destination);
      if (!result) {
        throw new Error("Could not retrieve directions.");
      }
      return result;
    } catch (error: any) {
      console.error("Error in getDirections tool:", error);
      // In a real app, you might want more sophisticated error handling
      throw new Error(`Failed to get directions: ${error.message}`);
    }
  }
);
