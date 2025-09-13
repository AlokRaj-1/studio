import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold tracking-tight text-primary">
            Welcome to BharatSwift
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4 p-6">
          <Link href="/driver" passHref>
            <Button className="w-full justify-between h-14 text-lg" size="lg">
              <span>Driver Interface</span>
              <ArrowRight />
            </Button>
          </Link>
          <Link href="/admin" passHref>
            <Button className="w-full justify-between h-14 text-lg" variant="secondary" size="lg">
              <span>Admin Dashboard</span>
              <ArrowRight />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
