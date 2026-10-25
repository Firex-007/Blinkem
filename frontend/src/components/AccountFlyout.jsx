import { useState, useEffect } from 'react';
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
  Edit3,
  Check,
  Moon,
  Sun,
  Globe,
  Cookie,
  Phone,
  Mail,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CHENNAI_LOCALITIES } from '../data/chennaiLocalities';

export default function AccountFlyout({ open, onClose }) {
  const navigate = useNavigate();
  const {
    currentUser,
    updateUserProfile,
    logoutUser,
    location,
    setLocation,
    setIsLocationModalOpen,
    setRole,
    role,
    theme,
    setTheme,
    lang,
    setLang,
    setIsCookieModalOpen,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || 'Priya S',
    phone: currentUser?.phone || '+91 98401 23456',
    email: currentUser?.email || 'priya.chennai@example.com',
    address: currentUser?.address || 'No. 14, Usman Road, T. Nagar, Chennai',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync form data whenever current user changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        email: currentUser.email || '',
        address: currentUser.address || '',
      });
    }
  }, [currentUser]);

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

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile({
      name: formData.name.trim() || currentUser.name,
      phone: formData.phone.trim() || currentUser.phone,
      email: formData.email.trim() || currentUser.email,
      address: formData.address.trim() || currentUser.address,
    });
    setSaveSuccess(true);
    setIsEditing(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogout = () => {
    logoutUser();
    onClose();
    navigate('/');
  };

  return (
    <>
      {/* 1. Backdrop Scrim */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300 animate-fade"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Full-Height Slide-in Side Navigation Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Account and Profile Navigation"
        className="fixed top-0 right-0 h-full w-full sm:w-[420px] max-w-[100vw] bg-surface text-ink border-l border-line shadow-2xl z-50 flex flex-col justify-between overflow-hidden animate-slideLeft"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-line flex items-center justify-between bg-surface/90 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <h2 className="font-800 text-base sm:text-lg text-ink tracking-tight">
              Account &amp; Settings
            </h2>
            {saveSuccess && (
              <span className="flex items-center gap-1 text-[11px] font-800 text-success bg-successsoft px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Saved!
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="w-9 h-9 rounded-full bg-surface2 hover:bg-soft text-muted hover:text-ink flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* User Profile Card with Edit Toggle */}
          <div className="p-4 rounded-3xl bg-surface2/60 border border-line/80 relative overflow-hidden space-y-3 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 border-2 border-primary/40 relative">
                  <img
                    src={currentUser?.avatarUrl || '/images/users/priya.jpg'}
                    alt={currentUser?.name || 'Account'}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-success border-2 border-surface" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-800 text-ink text-base sm:text-lg leading-tight truncate">
                    {currentUser?.name || 'Customer Account'}
                  </h3>
                  <p className="text-xs text-muted font-medium mt-0.5 truncate flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {currentUser?.phone || '+91 98401 23456'}
                  </p>
                  <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-800 uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3" />
                    {role === 'worker' ? 'Partner Pro' : role === 'admin' ? 'Admin Ops' : 'Verified Customer'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsEditing((prev) => !prev)}
                className={`p-2 rounded-xl transition flex items-center gap-1 text-xs font-800 flex-shrink-0 ${
                  isEditing
                    ? 'bg-primary text-onprimary shadow-xs'
                    : 'bg-surface hover:bg-soft text-primary border border-line'
                }`}
                title={isEditing ? 'Cancel Edit' : 'Edit Name and Address'}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>

            {/* Editable Form Fields */}
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-3 pt-3 border-t border-line/80 animate-fade">
                <div>
                  <label className="block text-[11px] font-800 text-muted uppercase tracking-wider mb-1">
                    Full Name / Username
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-line focus:border-primary text-xs font-700 text-ink outline-none"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-800 text-muted uppercase tracking-wider mb-1">
                    Door No. &amp; Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-line focus:border-primary text-xs font-700 text-ink outline-none"
                    placeholder="e.g. No. 14, Usman Road, T. Nagar"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-800 text-muted uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-line focus:border-primary text-xs font-700 text-ink outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-800 text-muted uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-line focus:border-primary text-xs font-700 text-ink outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-primary text-onprimary font-800 text-xs flex items-center justify-center gap-1.5 shadow-sm hover:bg-primary600 transition"
                >
                  <Check className="w-4 h-4" /> Save Profile Details
                </button>
              </form>
            ) : (
              <div className="pt-2 border-t border-line/60 text-xs space-y-1">
                <p className="text-muted flex items-start gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="truncate">{currentUser?.address || 'No. 14, Usman Road, T. Nagar, Chennai'}</span>
                </p>
              </div>
            )}
          </div>

          {/* Portal Switcher (Customer / Partner / Admin) */}
          <div className="p-3 rounded-2xl bg-surface2/50 border border-line">
            <span className="text-[10px] uppercase tracking-wider font-800 text-muted block mb-2">
              Select Platform Role
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => {
                  setRole('customer');
                  handleNav('/');
                }}
                className={`py-2 text-center rounded-xl text-xs font-800 transition ${
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
                className={`py-2 text-center rounded-xl text-xs font-800 transition ${
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
                className={`py-2 text-center rounded-xl text-xs font-800 transition ${
                  role === 'admin'
                    ? 'bg-primary text-onprimary shadow-xs'
                    : 'text-muted hover:text-ink hover:bg-surface'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-800 text-muted px-2 block mb-1">
              Main Menu
            </span>

            {/* My Bookings */}
            <button
              onClick={() => handleNav('/bookings')}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-surface2 text-ink transition group text-left border border-transparent hover:border-line"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-800 block">My Bookings</span>
                  <span className="text-[11px] text-muted">Track live &amp; past service requests</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted group-hover:text-ink group-hover:translate-x-1 transition" />
            </button>

            {/* Saved Addresses & Chennai Localities */}
            <button
              onClick={handleOpenAddresses}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-surface2 text-ink transition group text-left border border-transparent hover:border-line"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-800 block">Service Location &amp; GPS</span>
                  <span className="text-[11px] text-muted">Active: {location?.name || 'T. Nagar'}, Chennai</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted group-hover:text-ink group-hover:translate-x-1 transition" />
            </button>

            {/* Profile Page Link */}
            <button
              onClick={() => handleNav('/profile')}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-surface2 text-ink transition group text-left border border-transparent hover:border-line"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-105 transition">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-800 block">Full Account Settings</span>
                  <span className="text-[11px] text-muted">Security, payments &amp; credentials</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted group-hover:text-ink group-hover:translate-x-1 transition" />
            </button>
          </div>

          {/* Preferences Section (Theme, Lang, Cookies) */}
          <div className="space-y-2 pt-2 border-t border-line">
            <span className="text-[10px] uppercase tracking-wider font-800 text-muted px-2 block mb-1">
              Preferences &amp; Privacy
            </span>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-surface2/50 border border-line/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-ink shadow-xs">
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-warning" />}
                </div>
                <span className="text-xs font-800">Dark Appearance</span>
              </div>
              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 flex items-center ${
                  theme === 'dark' ? 'bg-primary' : 'bg-line'
                }`}
                aria-label="Toggle dark mode"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                    theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-surface2/50 border border-line/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-ink shadow-xs">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-800">Language</span>
              </div>
              <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-line">
                <button
                  onClick={() => setLang('en')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-800 transition ${
                    lang === 'en' ? 'bg-primary text-onprimary' : 'text-muted hover:text-ink'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLang('ta')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-800 transition ${
                    lang === 'ta' ? 'bg-primary text-onprimary' : 'text-muted hover:text-ink'
                  }`}
                >
                  தமிழ்
                </button>
              </div>
            </div>

            {/* Cookie & Storage Settings Button */}
            <button
              onClick={() => {
                onClose();
                setIsCookieModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-surface2 text-ink transition group text-left border border-transparent hover:border-line"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition">
                  <Cookie className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-800 block">Cookie &amp; Storage Settings</span>
                  <span className="text-[10px] text-muted">Essential, all cookies or no cookies</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted group-hover:text-ink transition" />
            </button>

            {/* Help & Support */}
            <button
              onClick={() => {
                onClose();
                alert('Blink\'em Support: Contact 24/7 Priority Helpline at 1800-BLINKEM or WhatsApp +91 98401 23456');
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-surface2 text-ink transition group text-left border border-transparent hover:border-line"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-105 transition">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-800 block">24/7 Helpline &amp; WhatsApp</span>
                  <span className="text-[10px] text-muted">Instant customer assistance</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted group-hover:text-ink transition" />
            </button>
          </div>
        </div>

        {/* Drawer Footer: Logout / Reset Session */}
        <div className="p-4 border-t border-line bg-surface2/40">
          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-2xl border border-line/80 bg-surface hover:bg-dangersoft hover:text-danger hover:border-danger/30 text-ink font-800 text-xs flex items-center justify-center gap-2 transition active:scale-98 shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout / Reset Session</span>
          </button>
        </div>
      </aside>
    </>
  );
}
