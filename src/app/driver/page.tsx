'use client';

import { useState } from 'react';
import { DriverLogin } from '@/components/driver/DriverLogin';
import { DriverInterface } from '@/components/driver/DriverInterface';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { type Driver } from '@/lib/data';

export default function DriverPage() {
  const [driver, setDriver] = useState<Driver | null>(null);

  const handleLogin = (loggedInDriver: Driver) => {
    setDriver(loggedInDriver);
  };

  const handleLogout = () => {
    setDriver(null);
  };

  return (
    <div className="w-full max-w-md">
      <Card className="shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold tracking-tight">
            SwiftTrack Driver
          </CardTitle>
        </CardHeader>
        {!driver ? (
          <DriverLogin onLogin={handleLogin} />
        ) : (
          <DriverInterface driver={driver} onLogout={handleLogout} />
        )}
      </Card>
    </div>
  );
}
