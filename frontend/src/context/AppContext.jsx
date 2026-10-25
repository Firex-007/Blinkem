import { createContext, useContext, useEffect, useState } from 'react';

const AppContext = createContext(null);

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

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const setThemePersist = (v) => { setTheme(v); if (typeof localStorage !== 'undefined') localStorage.setItem('theme', v); };
  const setLangPersist = (v) => { setLang(v); if (typeof localStorage !== 'undefined') localStorage.setItem('lang', v); };
  const setUserIdPersist = (v) => { setUserId(v); if (typeof localStorage !== 'undefined') localStorage.setItem('userId', v); };

  return (
    <AppContext.Provider value={{ theme, setTheme: setThemePersist, lang, setLang: setLangPersist, userId, setUserId: setUserIdPersist }}>
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
