
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, LogIn, Mail, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { signInWithEmail, getFirebaseAuthErrorMessage } from '@/lib/auth.tsx';
import { LoaderCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmail(email, password);
      toast({
        title: 'Login Successful',
        description: 'Welcome to the Admin Dashboard.',
      });
      router.push('/admin');
    } catch (authError: any) {
      setError(getFirebaseAuthErrorMessage(authError));
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold tracking-tight text-primary">
            Admin Access
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to manage BharatSwift.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  required
                  placeholder="admin@example.com"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  required
                  placeholder="••••••••"
                  className="pl-10"
                />
              </div>
            </div>
             {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <LoaderCircle className="animate-spin" /> : <LogIn />}
              Sign In
            </Button>
            <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Button variant="link" asChild className="p-0 h-auto">
                    <Link href="/admin/signup">Sign Up</Link>
                </Button>
            </div>
             <Button variant="link" className="w-full" asChild>
                <Link href="/driver">Switch to Driver View</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
