'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';

export function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const authStatus = sessionStorage.getItem('isAdminAuthenticated') === 'true';
      setIsAuthenticated(authStatus);

      if (!authStatus && pathname !== '/admin/login') {
        router.replace('/admin/login');
      } else if (authStatus && pathname === '/admin/login') {
        router.replace('/admin');
      }
    } catch (error) {
       // sessionStorage is not available on the server
       setIsAuthenticated(false);
       if (pathname !== '/admin/login') {
        router.replace('/admin/login');
       }
    }
  }, [pathname, router]);

  // If we are checking auth status, show a loader
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // If user is not authenticated and not on the login page, the redirect is happening.
  // We can return a loader here as well to prevent flashing the content.
  if (!isAuthenticated && pathname !== '/admin/login') {
     return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }


  return <>{children}</>;
}
