'use client';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const themeClass = pathname.startsWith('/admin') ? 'admin-theme' : 'driver-theme';

  return (
    <body className={cn('font-body antialiased', themeClass)}>
        {children}
    </body>
  );
}
