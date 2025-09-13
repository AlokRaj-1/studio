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
    name: 'Rajesh Patel',
    avatar: avatarMap.get('driver-1')!,
    lastLocation: { lat: 30.7333, lng: 76.7794 }, // Chandigarh
    status: 'online',
    password: 'password',
  },
  {
    id: 'DRI-002',
    name: 'Sunita Devi',
    avatar: avatarMap.get('driver-2')!,
    lastLocation: { lat: 31.6340, lng: 74.8723 }, // Amritsar
    status: 'offline',
    password: 'password',
  },
  {
    id: 'DRI-003',
    name: 'Amit Verma',
    avatar: avatarMap.get('driver-3')!,
    lastLocation: { lat: 30.9010, lng: 75.8573 }, // Ludhiana
    status: 'online',
    password: 'password',
  },
  {
    id: 'DRI-004',
    name: 'Meera Krishnan',
    avatar: avatarMap.get('driver-4')!,
    lastLocation: { lat: 30.3752, lng: 76.7821 }, // Patiala
    status: 'inactive',
    password: 'password',
  },
  {
    id: 'DRI-005',
    name: 'Sanjay Iyer',
    avatar: avatarMap.get('driver-5')!,
    lastLocation: { lat: 31.3260, lng: 75.5762 }, // Jalandhar
    status: 'online',
    password: 'password',
  },
];
