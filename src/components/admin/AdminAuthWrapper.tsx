
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth.tsx';

export function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (loading) {
      return; // Wait until authentication state is loaded
    }

    const isAuthPage = pathname === '/admin/login' || pathname === '/admin/signup';
    const isSeedPage = pathname === '/admin/seed';
    const isAuthenticated = !!user;

    // If user is not authenticated and not on an auth/seed page, redirect to login
    if (!isAuthenticated && !isAuthPage && !isSeedPage) {
      router.replace('/admin/login');
    }
    
    // If user is authenticated and on an auth page, redirect to the dashboard
    if (isAuthenticated && isAuthPage) {
      router.replace('/admin');
    }

  }, [user, loading, pathname, router]);

  // While loading authentication state, show a spinner
  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/signup';
  const isAuthenticated = !!user;

  // Prevent flicker for redirects
  if (!isAuthenticated && !isAuthPage && pathname !== '/admin/seed') {
    return (
       <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated && isAuthPage) {
     return (
       <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
