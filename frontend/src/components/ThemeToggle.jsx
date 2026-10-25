import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ className }) {
  const [dark, setDark] = useState(() => typeof localStorage !== 'undefined' && localStorage.getItem('theme') === 'dark');
  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (typeof localStorage !== 'undefined') localStorage.setItem('theme', next ? 'dark' : 'light');
    if (typeof document !== 'undefined') {
      if (next) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
  };
  return (
    <button onClick={toggle} className={`p-2 rounded-full bg-surface2 text-muted hover:bg-primary hover:text-onprimary transition ${className || ''}`} aria-label="Toggle theme">
      {dark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </button>
  );
}
