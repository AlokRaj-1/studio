import type { ReactNode } from 'react';
import { MapView } from '@/components/admin/MapView';
import { punjabCities } from '@/lib/cities';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function TrackerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gray-50">
        <header className="bg-background shadow-md">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-primary">BharatSwift Tracker</h1>
                 <Button variant="outline" asChild>
                    <Link href="/">
                        <Home className="mr-2"/>
                        Home
                    </Link>
                </Button>
            </div>
        </header>
        <main className="container mx-auto p-4 md:p-8">
            {children}
        </main>
    </div>
  );
}
