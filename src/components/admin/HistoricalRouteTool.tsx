'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { getHistoricalRouteAnalysis } from '@/app/actions';
import { type HistoricalRouteAnalysisOutput } from '@/ai/flows/historical-route-analysis';
import { LoaderCircle, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { type Driver } from '@/lib/data';

const formSchema = z.object({
  driverId: z.string().min(1, 'Driver ID is required.'),
  startDate: z.date({ required_error: 'Start date is required.' }),
  endDate: z.date({ required_error: 'End date is required.' }),
  liveLocationData: z.string().min(1, 'Live location data is required.'),
  expectedRoute: z.string().min(1, 'Expected route is required.'),
});

type HistoricalRouteToolProps = {
  drivers: Driver[];
  onBack: () => void;
};

export function HistoricalRouteTool({ drivers, onBack }: HistoricalRouteToolProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<HistoricalRouteAnalysisOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      driverId: '',
      liveLocationData: 'Current location near India Gate, New Delhi',
      expectedRoute: 'Standard delivery route from warehouse in Gurgaon to various points in South Delhi.',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const result = await getHistoricalRouteAnalysis(values);
      if (result.error) {
        toast({
            variant: "destructive",
            title: "Analysis Failed",
            description: result.error,
        });
      } else if (result.success) {
        setAnalysisResult(result.data);
      }
    } catch (error) {
       toast({
            variant: "destructive",
            title: "Analysis Failed",
            description: "An unexpected error occurred.",
        });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="driverId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Driver</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a driver" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {drivers.map(driver => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name} ({driver.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div/>
             <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                     <DatePicker date={field.value} setDate={field.onChange} placeholder="Pick a start date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                     <DatePicker date={field.value} setDate={field.onChange} placeholder="Pick an end date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="liveLocationData"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Live Location Data</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter current GPS data..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expectedRoute"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Expected Route Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the expected route..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
                {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                Analyze Route
            </Button>
            <Button type="button" variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
          </div>
        </form>
      </Form>

      {isLoading && (
        <div className="flex items-center justify-center p-8">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">AI is analyzing the route data...</p>
        </div>
      )}

      {analysisResult && (
        <Card className="mt-8 bg-card/50">
            <CardHeader>
                <CardTitle>Analysis Complete</CardTitle>
                <CardDescription>{analysisResult.summary}</CardDescription>
            </CardHeader>
            <CardContent>
                <h4 className="font-semibold mb-4">Detected Deviations</h4>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Reason</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {analysisResult.deviations.length > 0 ? analysisResult.deviations.map((deviation, index) => (
                            <TableRow key={index}>
                                <TableCell>{new Date(deviation.timestamp).toLocaleString()}</TableCell>
                                <TableCell>{deviation.latitude.toFixed(4)}, {deviation.longitude.toFixed(4)}</TableCell>
                                <TableCell>{deviation.reason}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground">No deviations found.</TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
