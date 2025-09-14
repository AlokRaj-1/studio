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
    id: 'DL12-CA4567',
    name: 'Rohan Sharma',
    avatar: avatarMap.get('driver-1')!,
    lastLocation: { lat: 28.6139, lng: 77.2090 }, // Delhi
    status: 'online',
    password: 'password',
  },
  {
    id: 'MH01-DJ8910',
    name: 'Priya Mehta',
    avatar: avatarMap.get('driver-2')!,
    lastLocation: { lat: 19.0760, lng: 72.8777 }, // Mumbai
    status: 'offline',
    password: 'password',
  },
  {
    id: 'KA05-MN1122',
    name: 'Arjun Reddy',
    avatar: avatarMap.get('driver-3')!,
    lastLocation: { lat: 12.9716, lng: 77.5946 }, // Bengaluru
    status: 'online',
    password: 'password',
  },
  {
    id: 'TN07-BQ3344',
    name: 'Ananya Krishnan',
    avatar: avatarMap.get('driver-4')!,
    lastLocation: { lat: 13.0827, lng: 80.2707 }, // Chennai
    status: 'inactive',
    password: 'password',
  },
  {
    id: 'WB02-AF5566',
    name: 'Vikram Banerjee',
    avatar: avatarMap.get('driver-5')!,
    lastLocation: { lat: 22.5726, lng: 88.3639 }, // Kolkata
    status: 'online',
    password: 'password',
  },
  {
    id: 'RJ14-CK7890',
    name: 'Suresh Singh',
    avatar: avatarMap.get('driver-6')!,
    lastLocation: { lat: 26.9124, lng: 75.7873 }, // Jaipur
    status: 'offline',
    password: 'password',
  },
  {
    id: 'GJ01-AB1234',
    name: 'Meera Desai',
    avatar: avatarMap.get('driver-7')!,
    lastLocation: { lat: 23.0225, lng: 72.5714 }, // Ahmedabad
    status: 'online',
    password: 'password',
  },
  {
    id: 'AP28-CH5678',
    name: 'Nikhil Kumar',
    avatar: avatarMap.get('driver-8')!,
    lastLocation: { lat: 17.3850, lng: 78.4867 }, // Hyderabad
    status: 'inactive',
    password: 'password',
  },
  {
    id: 'UP32-LJ9012',
    name: 'Kavita Yadav',
    avatar: avatarMap.get('driver-9')!,
    lastLocation: { lat: 26.8467, lng: 80.9462 }, // Lucknow
    status: 'online',
    password: 'password',
  },
  {
    id: 'PB65-DE3456',
    name: 'Harpreet Kaur',
    avatar: avatarMap.get('driver-10')!,
    lastLocation: { lat: 30.9010, lng: 75.8573 }, // Ludhiana
    status: 'offline',
    password: 'password',
  },
];
