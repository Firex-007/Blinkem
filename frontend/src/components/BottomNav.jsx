import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, User, Wrench, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';

export default function BottomNav({ className = '' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = useApp();

  // Role aware tabs
  let tabs = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/bookings', icon: Calendar, label: t('bookings') || 'Bookings' },
  ];

  if (userId === '3') {
    tabs = [
      { path: '/worker', icon: Wrench, label: 'Worker' },
      { path: '/bookings', icon: Calendar, label: t('bookings') || 'Jobs' },
    ];
  } else if (userId === '99') {
    tabs = [
      { path: '/admin', icon: Shield, label: 'Admin' },
      { path: '/bookings', icon: Calendar, label: 'All' },
    ];
  }

  return (
    <nav
      className={`fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[440px] h-14 rounded-full bg-surface/95 backdrop-blur border border-line shadow-card px-4 flex items-center justify-around z-40 ${className}`}
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
                ? 'text-primary'
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
