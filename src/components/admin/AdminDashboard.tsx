'use client';

import { useState, useEffect } from 'react';
import { Bot, List, Map as MapIcon, Search, X } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarInput,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapView } from './MapView';
import { HistoricalRouteTool } from './HistoricalRouteTool';
import { type Driver } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, DocumentData } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const avatarMap = new Map(PlaceHolderImages.map(img => [img.id, img]));

export function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'drivers'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const driversData: Driver[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        const avatar = avatarMap.get(data.avatar.id) || data.avatar;
        const lastSeen = data.lastSeen?.toDate ? formatDistanceToNow(data.lastSeen.toDate(), { addSuffix: true }) : 'never';
        
        driversData.push({
          id: doc.id,
          name: data.name,
          avatar: avatar,
          lastLocation: data.lastLocation,
          status: data.status,
          lastSeen: lastSeen,
        });
      });
      setDrivers(driversData);
      if (loading) {
        setSelectedDriver(driversData[0] || null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [loading]);

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <div className="bg-primary p-2 rounded-lg">
              <List className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">SwiftTrack</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <SidebarInput
              placeholder="Search drivers..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && <X onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"/>}
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {filteredDrivers.map(driver => (
              <SidebarMenuItem key={driver.id}>
                <SidebarMenuButton
                  onClick={() => setSelectedDriver(driver)}
                  isActive={selectedDriver?.id === driver.id}
                  tooltip={driver.name}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={driver.avatar.imageUrl} alt={driver.name} data-ai-hint={driver.avatar.imageHint} />
                    <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="font-medium truncate w-full">{driver.name}</span>
                    <span className="text-xs text-muted-foreground">{driver.id}</span>
                  </div>
                  <Badge variant={driver.status === 'online' ? 'default' : 'secondary'} className={cn(
                      "ml-auto h-2 w-2 p-0",
                      driver.status === 'online' && 'bg-green-500',
                      driver.status === 'offline' && 'bg-gray-400',
                      driver.status === 'inactive' && 'bg-red-500',
                  )}></Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 sm:p-6 lg:p-8">
          <Tabs defaultValue="map" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto">
              <TabsTrigger value="map"><MapIcon className="mr-2"/> Live Map</TabsTrigger>
              <TabsTrigger value="ai-tool"><Bot className="mr-2"/> Historical Route Tool</TabsTrigger>
            </TabsList>
            <TabsContent value="map" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Live Driver Locations</CardTitle>
                </CardHeader>
                <CardContent>
                  <MapView drivers={drivers} selectedDriver={selectedDriver} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="ai-tool" className="mt-6">
               <Card>
                <CardHeader>
                  <CardTitle>Historical Route Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <HistoricalRouteTool drivers={drivers} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
