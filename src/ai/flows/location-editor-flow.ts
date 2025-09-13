'use server';

/**
 * @fileOverview AI tool to convert a natural language description of a location into geographic coordinates.
 *
 * - getLocationCoordinates - A function that takes a text description and returns latitude and longitude.
 * - LocationEditorInput - The input type for the getLocationCoordinates function.
 * - LocationEditorOutput - The return type for the getLocationCoordinates function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LocationEditorInputSchema = z.object({
  locationDescription: z.string().describe('A natural language description of a location, like "Eiffel Tower" or "Statue of Liberty".'),
});

export type LocationEditorInput = z.infer<typeof LocationEditorInputSchema>;

const LocationEditorOutputSchema = z.object({
    lat: z.number().describe('The latitude of the location.'),
    lng: z.number().describe('The longitude of the location.'),
    description: z.string().describe('A confirmation of the location that was found.'),
});

export type LocationEditorOutput = z.infer<typeof LocationEditorOutputSchema>;

export async function getLocationCoordinates(input: LocationEditorInput): Promise<LocationEditorOutput> {
  return locationEditorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'locationEditorPrompt',
  input: {schema: LocationEditorInputSchema},
  output: {schema: LocationEditorOutputSchema},
  prompt: `You are an expert geocoding assistant. Your task is to identify the precise geographic coordinates (latitude and longitude) for a given location description.

  Location Description: "{{locationDescription}}"

  Provide the latitude, longitude, and a brief confirmation description of the identified location.
  Ensure the output is formatted as a JSON object matching the LocationEditorOutputSchema.
`,
});

const locationEditorFlow = ai.defineFlow(
  {
    name: 'locationEditorFlow',
    inputSchema: LocationEditorInputSchema,
    outputSchema: LocationEditorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
