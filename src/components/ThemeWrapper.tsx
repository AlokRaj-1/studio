'use client';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const themeClass = pathname.startsWith('/admin') ? 'admin-theme' : 'driver-theme';

  return (
    <body className={cn('font-body antialiased', 
      // Apply theme only on admin or driver pages
      (pathname.startsWith('/admin') || pathname.startsWith('/driver')) && themeClass
    )}>
        {children}
    </body>
  );
}
