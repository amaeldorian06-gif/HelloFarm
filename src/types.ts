export interface UserPreferences {
  language: 'fr' | 'en';
  accentColor: string;
  notifications: {
    pestAlerts: boolean;
    marketOrders: boolean;
    weatherAdvisories: boolean;
  };
}

export type AppSection = 'analyse' | 'marche' | 'ai' | 'drone' | 'monitor';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: 'admin' | 'producer' | 'expert';
  preferences: UserPreferences;
}

export interface DroneReport {
  id: string;
  userId: string;
  timestamp: string;
  summary: string;
  status: 'completed' | 'in-progress' | 'alert';
  imageUrl?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'critical';
  read: boolean;
}

export interface IoTData {
  timestamp: string;
  humidity: number;
  temperature: number;
  windSpeed: number;
  precipitation: number;
  zoneId: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  category: string;
  sellerId: string;
  sellerName: string;
  quantity: number;
  createdAt: string;
}

export type ConnectionStatus = 'online' | 'offline' | 'syncing';
