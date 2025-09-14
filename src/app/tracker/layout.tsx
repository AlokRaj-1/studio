import type { ReactNode } from 'react';
import { MapView } from '@/components/admin/MapView';
import { punjabCities } from '@/lib/cities';

export default function TrackerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gray-50">
        <header className="bg-background shadow-md">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-primary">BharatSwift Tracker</h1>
            </div>
        </header>
        <main className="container mx-auto p-4 md:p-8">
            {children}
        </main>
    </div>
  );
}
