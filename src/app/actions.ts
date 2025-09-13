'use server';

import { analyzeHistoricalRoute, HistoricalRouteAnalysisInput } from '@/ai/flows/historical-route-analysis';
import { z } from 'zod';

const formSchema = z.object({
  driverId: z.string().min(1, 'Driver ID is required.'),
  startDate: z.date({ required_error: 'Start date is required.' }),
  endDate: z.date({ required_error: 'End date is required.' }),
  liveLocationData: z.string().min(1, 'Live location data is required.'),
  expectedRoute: z.string().min(1, 'Expected route is required.'),
});

export async function getHistoricalRouteAnalysis(data: z.infer<typeof formSchema>) {
  try {
    const validatedData = formSchema.safeParse(data);
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
