import { createContext, useContext, useEffect, useState } from 'react';
import { CHENNAI_LOCALITIES, findClosestLocality } from '../data/chennaiLocalities';
import {
  getCookieConsent,
  setCookieConsent,
  saveUserPreferences,
  loadUserPreferences,
} from '../utils/cookieManager';

const AppContext = createContext(null);

export const REGISTERED_ACCOUNTS = {
  '1': {
    id: 1,
    name: 'Priya S',
    phone: '+91 98401 23456',
    email: 'priya.chennai@example.com',
    role: 'customer',
    avatarUrl: '/images/users/priya.jpg',
    avatarColor: '#1F5BFF',
    address: 'No. 14, Usman Road, T. Nagar, Chennai',
  },
  '3': {
    id: 3,
    name: 'Muthu K',
    phone: '+91 98403 45678',
    email: 'muthu.plumbing@example.com',
    role: 'worker',
    avatarUrl: '/images/users/muthu.jpg',
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
    avatarUrl: '/images/users/meera.jpg',
    avatarColor: '#8B5CF6',
    address: 'Blink\'em Operations HQ, Guindy, Chennai',
  },
};

export const DEMO_USERS = REGISTERED_ACCOUNTS;

export function AppProvider({ children }) {
  const [cookieConsent, setCookieConsentState] = useState(() => getCookieConsent());
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);

  const [accounts, setAccounts] = useState(() => {
    // If cookie consent is 'none', do NOT load stored profile
    const consent = getCookieConsent();
    if (consent === 'none') {
      return { ...REGISTERED_ACCOUNTS };
    }
    const { profile } = loadUserPreferences();
    if (profile && profile.id) {
      return {
        ...REGISTERED_ACCOUNTS,
        [String(profile.id)]: { ...REGISTERED_ACCOUNTS[String(profile.id)], ...profile },
      };
    }
    return { ...REGISTERED_ACCOUNTS };
  });

  const [theme, setTheme] = useState(() => {
    if (typeof localStorage === 'undefined') return 'light';
    const consent = getCookieConsent();
    if (consent === 'none') return 'light';
    return localStorage.getItem('theme') || 'light';
  });

  const [lang, setLang] = useState(() => {
    if (typeof localStorage === 'undefined') return 'en';
    const consent = getCookieConsent();
    if (consent === 'none') return 'en';
    return localStorage.getItem('lang') || 'en';
  });

  const [userId, setUserId] = useState(() => {
    if (typeof localStorage === 'undefined') return '1';
    const consent = getCookieConsent();
    if (consent === 'none') return '1';
    return localStorage.getItem('userId') || '1';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof localStorage === 'undefined') return true;
    const consent = getCookieConsent();
    if (consent === 'none') return true;
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const [location, setLocation] = useState(() => {
    const consent = getCookieConsent();
    if (consent === 'none') return CHENNAI_LOCALITIES[0];
    const { location: savedLoc } = loadUserPreferences();
    if (savedLoc) return savedLoc;
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('userLocation');
      try {
        return saved ? JSON.parse(saved) : CHENNAI_LOCALITIES[0];
      } catch {
        return CHENNAI_LOCALITIES[0];
      }
    }
    return CHENNAI_LOCALITIES[0];
  });

  const [locationStatus, setLocationStatus] = useState('idle');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAccountFlyoutOpen, setIsAccountFlyoutOpen] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = lang || 'en';
  }, [lang]);

  const updateCookieConsent = (level) => {
    setCookieConsent(level);
    setCookieConsentState(level);
    if (level === 'none') {
      // Wipe preferences from storage and reset to default
      setAccounts({ ...REGISTERED_ACCOUNTS });
      setLocation(CHENNAI_LOCALITIES[0]);
    } else {
      // Save current state
      const current = accounts[userId] || accounts['1'];
      saveUserPreferences(current, location);
    }
  };

  const setThemePersist = (v) => {
    setTheme(v);
    if (cookieConsent !== 'none' && typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', v);
    }
  };

  const setLangPersist = (v) => {
    setLang(v);
    if (cookieConsent !== 'none' && typeof localStorage !== 'undefined') {
      localStorage.setItem('lang', v);
    }
  };

  const setUserIdPersist = (v) => {
    setUserId(String(v));
    if (cookieConsent !== 'none' && typeof localStorage !== 'undefined') {
      localStorage.setItem('userId', String(v));
    }
  };

  const setLocationPersist = (loc) => {
    setLocation(loc);
    if (cookieConsent !== 'none') {
      saveUserPreferences(accounts[userId] || accounts['1'], loc);
    }
  };

  const updateUserProfile = (fields) => {
    setAccounts((prev) => {
      const activeId = String(userId);
      const current = prev[activeId] || prev['1'];
      const updated = { ...current, ...fields };
      const nextAccounts = { ...prev, [activeId]: updated };
      if (cookieConsent !== 'none') {
        saveUserPreferences(updated, location);
      }
      return nextAccounts;
    });
  };

  const currentUser = accounts[userId] || accounts['1'];
  const role = currentUser?.role || 'customer';

  const setRole = (targetRole) => {
    if (targetRole === 'worker') setUserIdPersist('3');
    else if (targetRole === 'admin') setUserIdPersist('99');
    else setUserIdPersist('1');
  };

  const login = (id) => {
    const acct = REGISTERED_ACCOUNTS[String(id)];
    if (!acct) return false;
    setUserId(String(id));
    setIsAuthenticated(true);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userId', String(id));
    }
    return true;
  };

  const logoutUser = () => {
    setUserId('1');
    setIsAuthenticated(false);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userId');
    }
    if (cookieConsent === 'none') {
      setAccounts({ ...REGISTERED_ACCOUNTS });
      setLocation(CHENNAI_LOCALITIES[0]);
    }
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

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme: setThemePersist,
        lang,
        setLang: setLangPersist,
        userId,
        setUserId: setUserIdPersist,
        login,
        isAuthenticated,
        setIsAuthenticated,
        role,
        setRole,
        currentUser,
        updateUserProfile,
        logoutUser,
        location,
        setLocation: setLocationPersist,
        locationStatus,
        detectLocation,
        isLocationModalOpen,
        setIsLocationModalOpen,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isAccountFlyoutOpen,
        setIsAccountFlyoutOpen,
        cookieConsent,
        updateCookieConsent,
        isCookieModalOpen,
        setIsCookieModalOpen,
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
