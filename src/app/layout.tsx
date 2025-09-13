import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { ThemeWrapper } from '@/components/ThemeWrapper';
import './globals.css';
import 'leaflet/dist/leaflet.css';

export const metadata: Metadata = {
  title: 'SwiftTrack',
  description: 'Driver tracking and route analysis.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <ThemeWrapper>
        {children}
        <Toaster />
      </ThemeWrapper>
    </html>
  );
}
