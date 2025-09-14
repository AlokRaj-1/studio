'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createDriver } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircle, PlusCircle, UserPlus } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';


const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  id: z.string().min(3, { message: "ID must be at least 3 characters." }).regex(/^[A-Z]{2}\d{2}-[A-Z]{2}\d{4}$/, { message: "ID must be in the format 'XX00-XX0000'."}),
  password: z.string().min(6, { message: "Password must be at least 6 characters."}),
});

type CreateDriverDialogProps = {
    onDriverCreated: (newDriverId: string) => void;
    isPrimaryAction?: boolean;
}

export function CreateDriverDialog({ onDriverCreated, isPrimaryAction = false }: CreateDriverDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      id: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
        const result = await createDriver(values);

        if (result.success) {
        toast({
            title: 'Driver Created',
            description: `Driver ${values.name} has been added successfully.`,
        });
        onDriverCreated(result.driverId!);
        setIsOpen(false);
        form.reset();
        } else {
        toast({
            variant: 'destructive',
            title: 'Creation Failed',
            description: result.error || 'An unknown error occurred.',
        });
        }
    });
  }

  const TriggerButton = isPrimaryAction ? (
     <Button size="lg"><UserPlus className="mr-2"/> Create New Driver</Button>
  ) : (
    <Button variant="ghost" size="icon" className="h-8 w-8">
        <PlusCircle />
        <span className="sr-only">Create Driver</span>
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {TriggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Driver</DialogTitle>
          <DialogDescription>
            Enter the details for the new driver. The driver ID must be unique.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Priya Sharma" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Number (ID)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. MH01-AB1234" {...field} />
                  </FormControl>
                  <FormDescription>
                    Must be a valid vehicle registration format.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Create Driver
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
