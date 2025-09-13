'use server';

/**
 * @fileOverview AI tool to analyze historical route data and live locations to identify and flag any driver locations that deviate from established or expected routes.
 *
 * - analyzeHistoricalRoute - A function that analyzes historical route data and live locations.
 * - HistoricalRouteAnalysisInput - The input type for the analyzeHistoricalRoute function.
 * - HistoricalRouteAnalysisOutput - The return type for the analyzeHistoricalRoute function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HistoricalRouteAnalysisInputSchema = z.object({
  driverId: z.string().describe('The ID of the driver to analyze.'),
  startDate: z.string().describe('The start date for the historical route data (ISO format).'),
  endDate: z.string().describe('The end date for the historical route data (ISO format).'),
  liveLocationData: z.string().describe('The current live location data of the driver.'),
  expectedRoute: z.string().describe('A description of the expected route.'),
});

export type HistoricalRouteAnalysisInput = z.infer<typeof HistoricalRouteAnalysisInputSchema>;

const HistoricalRouteAnalysisOutputSchema = z.object({
  deviations: z.array(
    z.object({
      timestamp: z.string().describe('The timestamp of the deviation.'),
      latitude: z.number().describe('The latitude of the deviation.'),
      longitude: z.number().describe('The longitude of the deviation.'),
      reason: z.string().describe('The reason for the deviation.'),
    })
  ).describe('An array of deviations from the expected route.'),
  summary: z.string().describe('A summary of the historical route analysis.'),
});

export type HistoricalRouteAnalysisOutput = z.infer<typeof HistoricalRouteAnalysisOutputSchema>;

export async function analyzeHistoricalRoute(input: HistoricalRouteAnalysisInput): Promise<HistoricalRouteAnalysisOutput> {
  return historicalRouteAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'historicalRouteAnalysisPrompt',
  input: {schema: HistoricalRouteAnalysisInputSchema},
  output: {schema: HistoricalRouteAnalysisOutputSchema},
  prompt: `You are an AI assistant specialized in analyzing driver routes and identifying deviations from expected paths.

  Analyze the historical route data from {{startDate}} to {{endDate}} for driver {{driverId}}, considering their current live location data: {{liveLocationData}}.
  The expected route is described as: {{expectedRoute}}.

  Identify any significant deviations from the expected route, providing the timestamp, latitude, longitude, and a brief reason for each deviation.
  Also, provide a summary of the overall route analysis, highlighting any patterns or notable issues.

  Ensure the output is formatted as a JSON object matching the HistoricalRouteAnalysisOutputSchema.
`,
});

const historicalRouteAnalysisFlow = ai.defineFlow(
  {
    name: 'historicalRouteAnalysisFlow',
    inputSchema: HistoricalRouteAnalysisInputSchema,
    outputSchema: HistoricalRouteAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
