import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, User, Wrench, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';

export default function BottomNav({ className = '' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = useApp();

  // Role aware tabs with Profile always accessible
  let tabs = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/bookings', icon: Calendar, label: t('bookings') || 'Bookings' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  if (userId === '3') {
    tabs = [
      { path: '/worker', icon: Wrench, label: 'Worker' },
      { path: '/bookings', icon: Calendar, label: t('bookings') || 'Jobs' },
      { path: '/profile', icon: User, label: 'Profile' },
    ];
  } else if (userId === '99') {
    tabs = [
      { path: '/admin', icon: Shield, label: 'Admin' },
      { path: '/bookings', icon: Calendar, label: 'All' },
      { path: '/profile', icon: User, label: 'Profile' },
    ];
  }

  return (
    <nav
      className={`fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[440px] h-14 rounded-full glass-card border border-line shadow-2xl px-4 flex items-center justify-around z-40 ${className}`}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[11px] font-700 transition ${
              isActive
                ? 'text-primary scale-105'
                : 'text-muted hover:text-ink'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
