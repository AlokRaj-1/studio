import type { ReactNode } from 'react';
import { AdminAuthWrapper } from '@/components/admin/AdminAuthWrapper';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthWrapper>
      <div className="min-h-screen w-full bg-background text-foreground">
        {children}
      </div>
    </AdminAuthWrapper>
  );
}
