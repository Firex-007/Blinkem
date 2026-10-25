import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  MapPin,
  Globe,
  Moon,
  Sun,
  Navigation,
  CreditCard,
  Phone,
  Mail,
  ChevronRight,
  RefreshCw,
  LogOut,
  Building2,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api';
import { t } from '../../i18n';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import Button from '../../components/Button';
import Toast from '../../components/Toast';

export default function Profile() {
  const {
    currentUser,
    userId,
    setUserId,
    theme,
    setTheme,
    lang,
    setLang,
    location,
    detectLocation,
    setIsLocationModalOpen,
  } = useApp();
  const navigate = useNavigate();

  const [toastMsg, setToastMsg] = useState(null);

  const handleQuickSwitch = (newId, path) => {
    setUserId(newId);
    navigate(path);
  };

  return (
    <div className="space-y-4 pb-32 animate-fade">
      {toastMsg && (
        <Toast
          open={!!toastMsg}
          message={toastMsg}
          onClose={() => setToastMsg(null)}
        />
      )}

      {/* User Header Profile Card */}
      <div className="p-5 rounded-[24px] glass-card border border-line shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md flex-shrink-0 border-2 border-primary/40 relative">
            <img
              src={currentUser.avatarUrl || '/images/users/priya.jpg'}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-success border-2 border-surface" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg font-800 text-ink truncate">{currentUser.name}</h1>
              <Chip tone="success" className="h-5 px-2 text-[10px] uppercase font-800">
                <ShieldCheck className="w-3 h-3 mr-1 inline" /> Verified
              </Chip>
            </div>
            <p className="text-xs text-muted flex items-center gap-1.5 truncate">
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{currentUser.phone}</span>
            </p>
            <p className="text-xs text-muted flex items-center gap-1.5 truncate mt-0.5">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{currentUser.email}</span>
            </p>
          </div>
        </div>

        {/* Current Active Role Badge & Quick Switch */}
        <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs">
          <span className="text-muted font-600">Current Role Mode:</span>
          <div className="flex items-center gap-1.5">
            <span className="font-800 text-primary capitalize px-2 py-0.5 rounded-full bg-primary-soft">
              {currentUser.role}
            </span>
          </div>
        </div>
      </div>

      {/* Platform Portal Switcher */}
      <div className="p-4 rounded-card glass-card border border-line">
        <span className="text-xs font-800 text-ink block mb-2 uppercase tracking-wider">
          Platform Portal
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleQuickSwitch('1', '/')}
            className={`p-2.5 rounded-chip text-center text-xs font-700 border transition ${
              userId === '1'
                ? 'bg-primary text-onprimary border-primary shadow-sm'
                : 'bg-surface2 text-muted hover:text-ink border-line'
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => handleQuickSwitch('3', '/worker')}
            className={`p-2.5 rounded-chip text-center text-xs font-700 border transition ${
              userId === '3'
                ? 'bg-success text-onprimary border-success shadow-sm'
                : 'bg-surface2 text-muted hover:text-ink border-line'
            }`}
          >
            Partner App
          </button>
          <button
            onClick={() => handleQuickSwitch('99', '/admin')}
            className={`p-2.5 rounded-chip text-center text-xs font-700 border transition ${
              userId === '99'
                ? 'bg-purple-600 text-onprimary border-purple-600 shadow-sm'
                : 'bg-surface2 text-muted hover:text-ink border-line'
            }`}
          >
            Ops Console
          </button>
        </div>
      </div>

      {/* Location & GPS Settings */}
      <div className="p-4 rounded-card glass-card border border-line space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-700 text-ink">Active Service Location</span>
          </div>
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="text-xs font-700 text-primary hover:underline"
          >
            Change
          </button>
        </div>

        <div className="p-3 rounded-chip bg-surface2/60 border border-line flex items-center justify-between">
          <div>
            <span className="font-800 text-sm text-ink block">{location?.name || 'T. Nagar'}</span>
            <span className="text-xs text-muted block">{location?.landmark || 'Pondy Bazaar, Chennai'}</span>
          </div>
          <button
            onClick={detectLocation}
            className="p-2 rounded-full bg-soft text-primary hover:bg-primary hover:text-onprimary transition"
            title="Detect GPS"
          >
            <Navigation className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* App Preferences */}
      <div className="p-4 rounded-card glass-card border border-line space-y-3">
        <span className="text-xs font-800 text-ink block uppercase tracking-wider">
          Preferences
        </span>

        {/* Theme */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2 text-sm text-ink font-600">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-accent" />}
            <span>App Appearance</span>
          </div>
          <div className="flex items-center gap-1 bg-surface2 p-1 rounded-full border border-line">
            <button
              onClick={() => setTheme('light')}
              className={`px-3 py-1 text-xs font-700 rounded-full transition ${
                theme === 'light' ? 'bg-surface text-ink shadow-sm' : 'text-muted'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`px-3 py-1 text-xs font-700 rounded-full transition ${
                theme === 'dark' ? 'bg-surface text-ink shadow-sm' : 'text-muted'
              }`}
            >
              Dark
            </button>
          </div>
        </div>

        {/* Language */}
        <div className="flex items-center justify-between py-1 border-t border-line">
          <div className="flex items-center gap-2 text-sm text-ink font-600">
            <Globe className="w-4 h-4 text-primary" />
            <span>Language</span>
          </div>
          <div className="flex items-center gap-1 bg-surface2 p-1 rounded-full border border-line">
            {[
              { code: 'en', label: 'EN' },
              { code: 'ta', label: 'தமிழ்' },
              { code: 'hi', label: 'हिंदी' },
            ].map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-2.5 py-1 text-xs font-700 rounded-full transition ${
                  lang === l.code ? 'bg-surface text-ink shadow-sm' : 'text-muted'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Platform & Account Security */}
      <div className="p-4 rounded-card glass-card border border-line space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-success" />
          <span className="text-xs font-800 text-ink uppercase tracking-wider">
            Verified Platform Guarantee
          </span>
        </div>
        <p className="text-xs text-muted">
          All service professionals are identity-verified with background verification and upfront transparent pricing.
        </p>
      </div>

      {/* App Version Info */}
      <div className="text-center text-xs text-muted pt-3 pb-2 space-y-1">
        <p className="font-700 text-ink text-sm">Blink'em Technologies Inc.</p>
        <p className="text-[11px] text-muted">Hyperlocal On-Demand Service Infrastructure • Chennai</p>
        <p className="text-[10px] text-muted/70">Production Release v2.4.0 • Enterprise Cloud</p>
      </div>
    </div>
  );
}
