import { useEffect } from 'react';
import { Home, Settings, ClipboardList } from 'lucide-react';

const TABS = [
  { href: '/', icon: <Home className="w-5 h-5" />, label: 'Home' },
  { href: '/worker', icon: <ClipboardList className="w-5 h-5" />, label: 'Worker' },
  { href: '/admin', icon: <Settings className="w-5 h-5" />, label: 'Admin' },
];

export default function BottomNav({ className }) {
  return (
    <nav className={`fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-14 rounded-full bg-surface border border-line shadow-card px-3 flex items-center gap-1 z-40 ${className || ''}`}>
      {TABS.map((t) => (
        <a key={t.href} href={t.href} className="flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-700 text-muted hover:text-primary">
          {t.icon}
          <span>{t.label}</span>
        </a>
      ))}
    </nav>
  );
}
