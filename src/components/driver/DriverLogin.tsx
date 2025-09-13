'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { drivers } from '@/lib/data';

type DriverLoginProps = {
  onLogin: (driverId: string) => void;
};

export function DriverLogin({ onLogin }: DriverLoginProps) {
  const [driverId, setDriverId] = useState(drivers[0]?.id || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const driver = drivers.find(d => d.id === driverId);
    if (driver && driver.password === password) {
      onLogin(driverId);
    } else {
      setError('Invalid Driver ID or password. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="driverId">Driver ID</Label>
          <Input
            id="driverId"
            placeholder="e.g., DRI-001"
            value={driverId}
            onChange={(e) => {
              setDriverId(e.target.value)
              setError('')
            }}
            required
          />
           <p className="text-sm text-muted-foreground">
            Hint: Try {drivers.map(d => d.id).join(', ')}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
                setPassword(e.target.value)
                setError('')
            }}
            required
          />
          <p className="text-sm text-muted-foreground">
            Hint: The password is "password" for all drivers.
          </p>
        </div>
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full">
          Login
        </Button>
      </CardFooter>
    </form>
  );
}
