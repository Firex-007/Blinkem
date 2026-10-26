import { CalendarDays, Home, Shield, UserRound, Wrench } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';

export default function BottomNav({ className = '' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, lang } = useApp();

  let tabs = [
    { path: '/',         icon: Home,         label: t('home_tab') },
    { path: '/bookings', icon: CalendarDays,  label: t('bookings') },
    { path: '/profile',  icon: UserRound,     label: t('account_tab') },
  ];
  if (userId === '3') {
    tabs = [
      { path: '/worker',   icon: Wrench,       label: t('worker_tab') },
      { path: '/bookings', icon: CalendarDays,  label: t('jobs_tab') },
      { path: '/profile',  icon: UserRound,     label: t('account_tab') },
    ];
  }
  if (userId === '99') {
    tabs = [
      { path: '/admin',    icon: Shield,        label: t('admin_tab') },
      { path: '/bookings', icon: CalendarDays,  label: t('all_bookings_tab') },
      { path: '/profile',  icon: UserRound,     label: t('account_tab') },
    ];
  }

  return (
    <nav className={`bottom-nav ${className}`} aria-label={t('main_navigation')}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          tab.path === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.path);
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`bottom-nav-item ${isActive ? 'is-active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="h-6 w-6" strokeWidth={isActive ? 2.4 : 1.8} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

