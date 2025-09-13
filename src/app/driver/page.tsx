'use client';

import { useState } from 'react';
import { DriverLogin } from '@/components/driver/DriverLogin';
import { DriverInterface } from '@/components/driver/DriverInterface';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default function DriverPage() {
  const [driverId, setDriverId] = useState<string | null>(null);

  const handleLogin = (id: string) => {
    setDriverId(id);
  };

  const handleLogout = () => {
    setDriverId(null);
  };

  return (
    <div className="w-full max-w-md">
      <Card className="shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold tracking-tight">
            SwiftTrack Driver
          </CardTitle>
        </CardHeader>
        {!driverId ? (
          <DriverLogin onLogin={handleLogin} />
        ) : (
          <DriverInterface driverId={driverId} onLogout={handleLogout} />
        )}
      </Card>
    </div>
  );
}
