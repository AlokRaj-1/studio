import type { ReactNode } from 'react';
import { AdminAuthWrapper } from '@/components/admin/AdminAuthWrapper';
import { AuthProvider } from '@/lib/auth';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AdminAuthWrapper>
        <div className="min-h-screen w-full bg-background text-foreground">
          {children}
        </div>
      </AdminAuthWrapper>
    </AuthProvider>
  );
}
