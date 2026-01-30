// src/utils/constants.js
export const SOCKET_SERVER_URL = import.meta.env.VITE_BACKEND_URL  || 'http://localhost:5000';

export const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' }
];

export const THEMES = {
  midnight: 'from-gray-900 to-black',
  ocean: 'from-blue-900/30 to-teal-900/30',
  cosmic: 'from-purple-900/30 to-pink-900/30',
  forest: 'from-emerald-900/30 to-green-900/30',
  sunset: 'from-orange-900/30 to-rose-900/30'
};

export const MAX_RECONNECT_ATTEMPTS = 3;
export const MAX_STREAM_RETRIES = 3;
export const OFFER_DELAY = 1000;
export const OFFER_WAIT_TIMEOUT = 15000;

export const CONNECTION_STATUS = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  FAILED: 'failed',
  CLOSED: 'closed',
  NEW: 'new'
};


export const commonInterests = [
  'Movies', 'Music', 'Gaming', 'Sports', 'Technology',
  'Travel', 'Food', 'Art', 'Books', 'Fitness',
  'Science', 'Fashion', 'Photography', 'Animals'
];

export const safetyResources = [
  {
    title: 'Parental Controls',
    description: 'Tools to help parents monitor and restrict online access',
    link: 'https://www.connectsafely.org/controls/',
    color: 'blue'
  },
  {
    title: 'Online Safety Guide',
    description: 'Comprehensive guide to staying safe online',
    link: 'https://www.commonsensemedia.org/articles/online-safety',
    color: 'green'
  },
  {
    title: 'Report Issues',
    description: 'Report illegal or suspicious activity to authorities',
    link: 'https://www.missingkids.org/cybertipline',
    color: 'red'
  }
];