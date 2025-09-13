import type { ReactNode } from 'react';

export default function DriverLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      {children}
    </main>
  );
}
