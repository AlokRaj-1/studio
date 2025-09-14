'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthenticated = !!user;
    const isLoginPage = pathname === '/admin/login';
    const isSeedPage = pathname === '/admin/seed';

    if (isLoginPage || isSeedPage) return;


    if (!isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const isLoginPage = pathname === '/admin/login';
  const isSeedPage = pathname === '/admin/seed';

  if ((isLoginPage || isSeedPage) && user) {
     router.replace('/admin');
     return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
        </div>
     );
  }

  if (!isLoginPage && !isSeedPage && !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }


  return <>{children}</>;
}
