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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { editDriverLocation } from '@/app/actions';
import { LoaderCircle, MapPin, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Driver } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  driverId: z.string().min(1, 'Please select a driver.'),
  locationDescription: z.string().min(3, 'Please enter a location description.'),
});

type LocationEditorToolProps = {
  drivers: Driver[];
};

export function LocationEditorTool({ drivers }: LocationEditorToolProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ driverId: string; description: string; } | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      driverId: '',
      locationDescription: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await editDriverLocation(values);
      if (response.error) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: response.error,
        });
      } else if (response.success) {
        const driverName = drivers.find(d => d.id === response.data.driverId)?.name;
        toast({
            title: "Location Updated!",
            description: `${driverName} has been moved to ${response.data.description}.`,
        });
        setResult(response.data);
        form.reset();
      }
    } catch (error) {
       toast({
            variant: "destructive",
            title: "Update Failed",
            description: "An unexpected error occurred while updating the location.",
        });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="driverId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Driver</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a driver to move" />
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
          <FormField
            control={form.control}
            name="locationDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 'Eiffel Tower' or 'Sydney Opera House'" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Update Location
          </Button>
        </form>
      </Form>

      {result && (
         <Alert>
            <MapPin className="h-4 w-4" />
            <AlertTitle>Location Updated Successfully!</AlertTitle>
            <AlertDescription>
                The driver has been moved to: <strong>{result.description}</strong>.
                You can verify the new location on the Live Map tab.
            </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
