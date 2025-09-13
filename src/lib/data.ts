import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';
import { Timestamp } from 'firebase/firestore';

export type Driver = {
  id: string;
  name: string;
  avatar: ImagePlaceholder;
  lastLocation: {
    lat: number;
    lng: number;
  };
  lastSeen: string | Timestamp;
  status: 'online' | 'offline' | 'inactive';
  password?: string;
};

const avatarMap = new Map(PlaceHolderImages.map(img => [img.id, img]));

export const drivers: Omit<Driver, 'lastSeen'>[] = [
  {
    id: 'DRI-001',
    name: 'Alex Ray',
    avatar: avatarMap.get('driver-1')!,
    lastLocation: { lat: 34.0522, lng: -118.2437 },
    status: 'online',
    password: 'password',
  },
  {
    id: 'DRI-002',
    name: 'Maria Garcia',
    avatar: avatarMap.get('driver-2')!,
    lastLocation: { lat: 40.7128, lng: -74.0060 },
    status: 'offline',
    password: 'password',
  },
  {
    id: 'DRI-003',
    name: 'Kenji Tanaka',
    avatar: avatarMap.get('driver-3')!,
    lastLocation: { lat: 35.6895, lng: 139.6917 },
    status: 'online',
    password: 'password',
  },
  {
    id: 'DRI-004',
    name: 'Fatima Al-Fassi',
    avatar: avatarMap.get('driver-4')!,
    lastLocation: { lat: 51.5074, lng: -0.1278 },
    status: 'inactive',
    password: 'password',
  },
  {
    id: 'DRI-005',
    name: 'John Smith',
    avatar: avatarMap.get('driver-5')!,
    lastLocation: { lat: 48.8566, lng: 2.3522 },
    status: 'online',
    password: 'password',
  },
];
