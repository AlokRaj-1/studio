import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Suspense } from 'react';

export default function AdminPage() {
  return (
    <Suspense>
      <AdminDashboard />
    </Suspense>
  );
}
