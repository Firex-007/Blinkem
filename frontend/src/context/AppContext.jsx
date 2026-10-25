import { createContext, useContext, useEffect, useState } from 'react';
import { CHENNAI_LOCALITIES, findClosestLocality } from '../data/chennaiLocalities';

const AppContext = createContext(null);

export const DEMO_USERS = {
  '1': {
    id: 1,
    name: 'Priya S',
    phone: '+91 98401 23456',
    email: 'priya.chennai@example.com',
    role: 'customer',
    avatarColor: '#1F5BFF',
    address: 'No. 14, Usman Road, T. Nagar, Chennai',
  },
  '3': {
    id: 3,
    name: 'Muthu K',
    phone: '+91 98403 45678',
    email: 'muthu.plumbing@example.com',
    role: 'worker',
    avatarColor: '#1F5BFF',
    category: 'plumber',
    rating: 4.8,
    jobsDone: 140,
    address: 'T. Nagar & Central Chennai Cluster',
  },
  '99': {
    id: 99,
    name: 'Meera R',
    phone: '+91 98409 99999',
    email: 'admin.meera@blinkem.in',
    role: 'admin',
    avatarColor: '#8B5CF6',
    address: 'Blink\'em Operations HQ, Guindy, Chennai',
  },
};

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof localStorage === 'undefined') return 'light';
    return localStorage.getItem('theme') || 'light';
  });

  const [lang, setLang] = useState(() => {
    if (typeof localStorage === 'undefined') return 'en';
    return localStorage.getItem('lang') || 'en';
  });

  const [userId, setUserId] = useState(() => {
    if (typeof localStorage === 'undefined') return '1';
    return localStorage.getItem('userId') || '1';
  });

  const [location, setLocation] = useState(() => {
    if (typeof localStorage === 'undefined') return CHENNAI_LOCALITIES[0];
    const saved = localStorage.getItem('userLocation');
    try {
      return saved ? JSON.parse(saved) : CHENNAI_LOCALITIES[0];
    } catch {
      return CHENNAI_LOCALITIES[0];
    }
  });

  const [locationStatus, setLocationStatus] = useState('idle'); // 'idle' | 'detecting' | 'granted' | 'denied'
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const setThemePersist = (v) => {
    setTheme(v);
    if (typeof localStorage !== 'undefined') localStorage.setItem('theme', v);
  };

  const setLangPersist = (v) => {
    setLang(v);
    if (typeof localStorage !== 'undefined') localStorage.setItem('lang', v);
  };

  const setUserIdPersist = (v) => {
    setUserId(String(v));
    if (typeof localStorage !== 'undefined') localStorage.setItem('userId', String(v));
  };

  const setLocationPersist = (loc) => {
    setLocation(loc);
    if (typeof localStorage !== 'undefined') localStorage.setItem('userLocation', JSON.stringify(loc));
  };

  const detectLocation = () => {
    return new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        setLocationStatus('denied');
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }

      setLocationStatus('detecting');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const closest = findClosestLocality(latitude, longitude);
          const detected = {
            name: closest.name,
            lat: latitude,
            lng: longitude,
            landmark: `GPS Coordinates (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) - Near ${closest.name}`,
            isGps: true,
          };
          setLocationPersist(detected);
          setLocationStatus('granted');
          resolve(detected);
        },
        (err) => {
          setLocationStatus('denied');
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  const currentUser = DEMO_USERS[userId] || DEMO_USERS['1'];

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme: setThemePersist,
        lang,
        setLang: setLangPersist,
        userId,
        setUserId: setUserIdPersist,
        currentUser,
        location,
        setLocation: setLocationPersist,
        locationStatus,
        detectLocation,
        isLocationModalOpen,
        setIsLocationModalOpen,
        isLoginModalOpen,
        setIsLoginModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export default AppContext;
