
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';

export function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We can only access sessionStorage on the client
    const checkAuth = () => {
      const adminLoggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';
      setIsAuthenticated(adminLoggedIn);
      setLoading(false);

      const isLoginPage = pathname === '/admin/login';
      const isSeedPage = pathname === '/admin/seed';

      if (!isLoginPage && !isSeedPage && !adminLoggedIn) {
        router.replace('/admin/login');
      }

      if ((isLoginPage || isSeedPage) && adminLoggedIn) {
        router.replace('/admin');
      }
    };
    checkAuth();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  const isLoginPage = pathname === '/admin/login';
  const isSeedPage = pathname === '/admin/seed';

  if (!isAuthenticated && !isLoginPage && !isSeedPage) {
     return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated && (isLoginPage || isSeedPage)) {
     return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }


  return <>{children}</>;
}
