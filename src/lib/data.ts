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
  {
    id: 'TS09-FG4321',
    name: 'Sanjay Patel',
    avatar: avatarMap.get('driver-11')!,
    lastLocation: { lat: 17.4065, lng: 78.4772 }, // Hyderabad
    status: 'online',
    password: 'password',
  },
  {
    id: 'MP04-AB1111',
    name: 'Rajesh Singh',
    avatar: avatarMap.get('driver-12')!,
    lastLocation: { lat: 23.2599, lng: 77.4126 }, // Bhopal
    status: 'online',
    password: 'password',
  },
  {
    id: 'BR01-CD2222',
    name: 'Sunita Devi',
    avatar: avatarMap.get('driver-13')!,
    lastLocation: { lat: 25.5941, lng: 85.1376 }, // Patna
    status: 'offline',
    password: 'password',
  },
  {
    id: 'HR26-EF3333',
    name: 'Deepak Kumar',
    avatar: avatarMap.get('driver-14')!,
    lastLocation: { lat: 28.4595, lng: 77.0266 }, // Gurugram
    status: 'inactive',
    password: 'password',
  },
  {
    id: 'MH12-GH4444',
    name: 'Aisha Khan',
    avatar: avatarMap.get('driver-15')!,
    lastLocation: { lat: 18.5204, lng: 73.8567 }, // Pune
    status: 'online',
    password: 'password',
  },
  {
    id: 'CH01-IJ5555',
    name: 'Amit Sharma',
    avatar: avatarMap.get('driver-16')!,
    lastLocation: { lat: 30.7333, lng: 76.7794 }, // Chandigarh
    status: 'offline',
    password: 'password',
  },
  {
    id: 'OR02-KL6677',
    name: 'Geeta Singh',
    avatar: avatarMap.get('driver-17')!,
    lastLocation: { lat: 20.2961, lng: 85.8245 }, // Bhubaneswar
    status: 'online',
    password: 'password',
  },
  {
    id: 'AS01-MN8899',
    name: 'Manoj Tiwari',
    avatar: avatarMap.get('driver-18')!,
    lastLocation: { lat: 26.1445, lng: 91.7362 }, // Guwahati
    status: 'inactive',
    password: 'password',
  },
  {
    id: 'KL01-OP0011',
    name: 'Fatima Ali',
    avatar: avatarMap.get('driver-19')!,
    lastLocation: { lat: 8.5241, lng: 76.9366 }, // Thiruvananthapuram
    status: 'online',
    password: 'password',
  },
  {
    id: 'GA03-QR2233',
    name: 'Alok Nath',
    avatar: avatarMap.get('driver-20')!,
    lastLocation: { lat: 15.4909, lng: 73.8278 }, // Panaji
    status: 'offline',
    password: 'password',
  },
];
