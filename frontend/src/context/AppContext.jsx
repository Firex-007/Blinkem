import { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_LOCATION, reverseGeocodeGps, CITIES } from '../data/cities';
import {
  getCookieConsent,
  setCookieConsent,
  saveUserPreferences,
  loadUserPreferences,
} from '../utils/cookieManager';
import {
  getSavedSession,
  saveSession,
  logoutAuth,
  isSupabaseConfigured,
  supabase,
} from '../utils/supabase';

const AppContext = createContext(null);

const DEFAULT_GUEST = {
  id: 'guest',
  name: 'Customer',
  phone: '',
  email: '',
  role: 'customer',
  city: 'Chennai',
  avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Customer&backgroundColor=2563EB',
  isVerified: false,
};

export function AppProvider({ children }) {
  const [cookieConsent, setCookieConsentState] = useState(() => getCookieConsent());
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);

  // Active authenticated user session
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = getSavedSession();
    if (saved && saved.id) return saved;
    return DEFAULT_GUEST;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = getSavedSession();
    return Boolean(saved && saved.id && saved.id !== 'guest');
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

  const [location, setLocation] = useState(() => {
    const consent = getCookieConsent();
    if (consent === 'none') return DEFAULT_LOCATION;
    const { location: savedLoc } = loadUserPreferences();
    if (savedLoc) return savedLoc;
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('userLocation');
      try {
        return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
      } catch {
        return DEFAULT_LOCATION;
      }
    }
    return DEFAULT_LOCATION;
  });

  const [locationStatus, setLocationStatus] = useState('idle');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAccountFlyoutOpen, setIsAccountFlyoutOpen] = useState(false);

  // Sync Supabase Auth state listener if configured
  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          const profile = {
            id: session.user.id,
            name: meta.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email?.endsWith('@blinkem.local') ? '' : session.user.email,
            phone: meta.phone || '',
            role: meta.role || 'customer',
            city: meta.city || 'Chennai',
            avatarUrl: meta.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=2563EB`,
            isVerified: true,
          };
          setCurrentUser(profile);
          setIsAuthenticated(true);
          saveSession(profile);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(DEFAULT_GUEST);
          setIsAuthenticated(false);
          saveSession(null);
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

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
      setLocation(DEFAULT_LOCATION);
    } else {
      saveUserPreferences(currentUser, location);
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

  const setLocationPersist = (loc) => {
    setLocation(loc);
    if (cookieConsent !== 'none') {
      saveUserPreferences(currentUser, loc);
    }
  };

  const loginUser = (userProfile) => {
    setCurrentUser(userProfile);
    setIsAuthenticated(true);
    saveSession(userProfile);
    if (cookieConsent !== 'none') {
      saveUserPreferences(userProfile, location);
    }
  };

  const logoutUser = async () => {
    await logoutAuth();
    setCurrentUser(DEFAULT_GUEST);
    setIsAuthenticated(false);
    saveSession(null);
  };

  const updateUserProfile = (fields) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...fields };
      saveSession(updated);
      if (cookieConsent !== 'none') {
        saveUserPreferences(updated, location);
      }
      return updated;
    });
  };

  const role = currentUser?.role || 'customer';
  const userId = currentUser?.id || 'guest';

  const setRole = (targetRole) => {
    updateUserProfile({ role: targetRole });
  };

  // Backwards compatibility helper for demo/legacy call sites
  const login = (roleOrId) => {
    let targetRole = 'customer';
    if (roleOrId === '3' || roleOrId === 'worker') targetRole = 'worker';
    if (roleOrId === '99' || roleOrId === 'admin') targetRole = 'admin';

    const mockProfile = {
      id: `usr_${targetRole}`,
      name: targetRole === 'worker' ? 'Partner Pro' : targetRole === 'admin' ? 'Admin Ops' : 'Customer',
      phone: '+91 98401 23456',
      email: `${targetRole}@blinkem.in`,
      role: targetRole,
      city: location?.city || 'Chennai',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${targetRole}&backgroundColor=2563EB`,
      isVerified: true,
    };
    loginUser(mockProfile);
    return true;
  };

  const setUserId = (id) => {
    login(id);
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
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const detected = await reverseGeocodeGps(latitude, longitude);
            setLocationPersist(detected);
            setLocationStatus('granted');
            resolve(detected);
          } catch (err) {
            setLocationStatus('denied');
            reject(err);
          }
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
        setUserId,
        login,
        loginUser,
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
