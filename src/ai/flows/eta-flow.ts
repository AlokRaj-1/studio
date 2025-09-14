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

const ETAInputSchema = z.object({
  from: z.string().describe('The starting location, e.g., a city name.'),
  to: z.string().describe('The destination location, e.g., a city name.'),
});

export type ETAInput = z.infer<typeof ETAInputSchema>;

const ETAOutputSchema = z.object({
    etaMinutes: z.number().describe('The estimated time of arrival in minutes.'),
    distanceKm: z.number().describe('The estimated distance of the route in kilometers.'),
    routeSummary: z.string().describe('A brief summary of the suggested route.'),
});

export type ETAOutput = z.infer<typeof ETAOutputSchema>;

export async function getETA(input: ETAInput): Promise<ETAOutput> {
  return etaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'etaPrompt',
  input: {schema: ETAInputSchema},
  output: {schema: ETAOutputSchema},
  prompt: `You are an expert Punjabi travel assistant. Your task is to calculate the estimated travel time, distance, and provide a route summary for a bus trip between two locations in Punjab, India.

  Consider typical bus travel conditions, traffic, and standard routes.

  From: "{{from}}"
  To: "{{to}}"

  Provide the ETA in minutes, the distance in kilometers, and a short summary of the route.
  Ensure the output is formatted as a JSON object matching the ETAOutputSchema.
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
