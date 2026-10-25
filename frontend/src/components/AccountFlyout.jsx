import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  HelpCircle,
  ShieldCheck,
  LogOut,
  User,
  X,
  ChevronRight,
  Briefcase,
  Sliders,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AccountFlyout({ open, onClose }) {
  const navigate = useNavigate();
  const { currentUser, location, setIsLocationModalOpen, setRole, role } = useApp();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleNav = (path) => {
    onClose();
    navigate(path);
  };

  const handleOpenAddresses = () => {
    onClose();
    setIsLocationModalOpen(true);
  };

  return (
    <>
      {/* 1. Backdrop Scrim: The requested effect - back layers are faded/dimmed when front layer is shown */}
      <div
        className="fixed inset-0 bg-black/45 dark:bg-black/60 backdrop-blur-[3px] z-40 transition-opacity duration-200 animate-fade"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Front Layer Flyout Panel: Positioned elegantly below the header */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Account Menu"
        className="fixed top-16 right-3 sm:right-6 md:right-12 lg:right-20 w-[320px] sm:w-[360px] max-w-[94vw] rounded-2xl glass-card border border-line shadow-2xl z-50 p-4 sm:p-5 flex flex-col gap-3 animate-slideDown overflow-hidden"
      >
        {/* Header: User Profile Info */}
        <div className="flex items-start justify-between pb-3 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 border-2 border-primary/30 relative">
              <img
                src={currentUser?.avatarUrl || '/images/users/priya.jpg'}
                alt={currentUser?.name || 'Account'}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-success border-2 border-surface" />
            </div>
            <div className="min-width-0">
              <h3 className="font-800 text-ink text-sm sm:text-base leading-tight truncate">
                {currentUser?.name || 'Customer Account'}
              </h3>
              <p className="text-xs text-muted font-medium mt-0.5 truncate">
                {currentUser?.phone || '+91 98401 23456'}
              </p>
              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {role === 'worker' ? 'Partner Account' : role === 'admin' ? 'Admin Portal' : 'Verified Customer'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Account Menu"
            className="w-8 h-8 rounded-full bg-surface2 hover:bg-soft text-muted hover:text-ink flex items-center justify-center transition flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Menu Navigation Items */}
        <div className="flex flex-col gap-0.5 py-1">
          {/* My Orders / Bookings */}
          <button
            onClick={() => handleNav('/bookings')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-surface2/80 text-ink transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-bold">My Bookings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted group-hover:text-ink group-hover:translate-x-0.5 transition" />
          </button>

          {/* Saved Addresses */}
          <button
            onClick={handleOpenAddresses}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-surface2/80 text-ink transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-bold block">Saved Addresses</span>
                <span className="text-[11px] text-muted truncate block">
                  {location?.name || 'T. Nagar'}, Chennai
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted group-hover:text-ink group-hover:translate-x-0.5 transition" />
          </button>

          {/* Account Profile & Settings */}
          <button
            onClick={() => handleNav('/profile')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-surface2/80 text-ink transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-105 transition">
                <User className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-bold">Profile & Settings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted group-hover:text-ink group-hover:translate-x-0.5 transition" />
          </button>

          {/* Quick Portal Switcher (Customer / Partner / Admin) */}
          <div className="px-2.5 py-2 mt-1 rounded-xl bg-surface2/50 border border-line/60">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-muted block mb-1.5">
              Portal Mode
            </span>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => {
                  setRole('customer');
                  handleNav('/');
                }}
                className={`py-1 text-center rounded-lg text-xs font-bold transition ${
                  role === 'customer'
                    ? 'bg-primary text-onprimary shadow-xs'
                    : 'text-muted hover:text-ink hover:bg-surface'
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => {
                  setRole('worker');
                  handleNav('/worker');
                }}
                className={`py-1 text-center rounded-lg text-xs font-bold transition ${
                  role === 'worker'
                    ? 'bg-primary text-onprimary shadow-xs'
                    : 'text-muted hover:text-ink hover:bg-surface'
                }`}
              >
                Partner
              </button>
              <button
                onClick={() => {
                  setRole('admin');
                  handleNav('/admin');
                }}
                className={`py-1 text-center rounded-lg text-xs font-bold transition ${
                  role === 'admin'
                    ? 'bg-primary text-onprimary shadow-xs'
                    : 'text-muted hover:text-ink hover:bg-surface'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Help & Support */}
          <button
            onClick={() => {
              onClose();
              alert('Blink\'em Support: Contact 24/7 Priority Helpline at 1800-BLINKEM or WhatsApp +91 98401 23456');
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-surface2/80 text-ink transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-105 transition">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-bold">FAQ's & Support</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted group-hover:text-ink group-hover:translate-x-0.5 transition" />
          </button>
        </div>

        {/* QR Code Banner: Exactly like the Blinkit card in the user screenshot */}
        <div className="p-3 rounded-xl bg-surface2/70 border border-line flex items-center gap-3 select-none">
          {/* Crisp QR Code Vector */}
          <div className="w-14 h-14 bg-white p-1 rounded-lg shadow-xs flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full fill-slate-900" viewBox="0 0 33 33">
              <path d="M0 0h11v11H0zM2 2v7h7V2zm2 2h3v3H4zM22 0h11v11H22zM24 2v7h7V2zm2 2h3v3h-3zM0 22h11v11H0zM2 24v7h7v-7zm2 2h3v3H4zM14 0h5v3h-5zM14 5h3v3h-3zM19 5h3v6h-3zM14 10h3v5h-3zM2 13h4v3H2zM8 13h4v3H8zM24 13h5v3h-5zM30 13h3v5h-3zM0 18h4v4H0zM6 18h5v3H6zM17 17h5v4h-5zM24 18h4v4h-4zM13 22h4v3h-4zM19 23h3v4h-3zM24 24h3v3h-3zM29 22h4v5h-4zM14 27h3v6h-3zM19 29h4v4h-4zM25 29h3v4h-3zM30 29h3v4h-3z" />
            </svg>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-extrabold text-ink leading-tight">
              Simple way to book services at your doorstep
            </span>
            <span className="text-[11px] text-primary font-bold mt-1">
              Scan QR code to open Blink'em
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
