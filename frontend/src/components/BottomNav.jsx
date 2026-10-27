import { CalendarDays, Home, Shield, UserRound, Wrench } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import LiquidGlass from './LiquidGlass';

export default function BottomNav({ className = '' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useApp();

  let tabs = [
    { path: '/',         icon: Home,         label: t('home_tab') },
    { path: '/bookings', icon: CalendarDays,  label: t('bookings') },
    { path: '/profile',  icon: UserRound,     label: t('account_tab') },
  ];
  if (role === 'worker') {
    tabs = [
      { path: '/worker',   icon: Wrench,       label: t('worker_tab') },
      { path: '/bookings', icon: CalendarDays,  label: t('jobs_tab') },
      { path: '/profile',  icon: UserRound,     label: t('account_tab') },
    ];
  }
  if (role === 'admin') {
    tabs = [
      { path: '/admin',    icon: Shield,        label: t('admin_tab') },
      { path: '/bookings', icon: CalendarDays,  label: t('all_bookings_tab') },
      { path: '/profile',  icon: UserRound,     label: t('account_tab') },
    ];
  }

  return (
    <LiquidGlass
      as="nav"
      radius={24}
      glow={0.8}
      className={`bottom-nav ${className}`}
      aria-label={t('main_navigation')}
    >
      <div className="flex items-center justify-around w-full h-full gap-1">
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
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 1.8} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </LiquidGlass>
  );
}


