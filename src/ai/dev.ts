import { config } from 'dotenv';
config();

import '@/ai/flows/historical-route-analysis.ts';
import '@/ai/flows/location-editor-flow.ts';
import '@/ai/flows/eta-flow.ts';
import '@/ai/tools/get-directions.ts';
