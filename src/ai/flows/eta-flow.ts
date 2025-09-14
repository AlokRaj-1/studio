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
import { getDirections } from '../tools/get-directions';

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
    })).describe('An array of major bus stops along the route.'),
    routePath: z.array(z.object({
        lat: z.number().describe('The latitude of a point on the route.'),
        lng: z.number().describe('The longitude of a point on the route.'),
    })).describe('An array of points that form the route path for drawing on a map.'),
});

export type ETAOutput = z.infer<typeof ETAOutputSchema>;

export async function getETA(input: ETAInput): Promise<ETAOutput> {
  return etaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'etaPrompt',
  input: {schema: ETAInputSchema},
  output: {schema: ETAOutputSchema},
  tools: [getDirections],
  prompt: `You are an expert Punjabi travel assistant. Your task is to provide route details for a bus trip between two locations in Punjab, India.

  Use the attached getDirections tool to get the primary route information. Then, based on the route summary provided by the tool, identify 5-7 major towns or cities that would serve as bus stops. Provide their coordinates.

  From: "{{from}}"
  To: "{{to}}"

  Finally, assemble all the information into the ETAOutputSchema format. Calculate the average speed based on the distance and duration from the tool.
`,
});

const etaFlow = ai.defineFlow(
  {
    name: 'etaFlow',
    inputSchema: ETAInputSchema,
    outputSchema: ETAOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
