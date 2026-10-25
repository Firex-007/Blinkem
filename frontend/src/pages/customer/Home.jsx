import { useState } from 'react';
import {
  MapPin,
  Mic,
  Zap,
  Clock,
  ShieldCheck,
  IndianRupee,
  Wrench,
  Sparkles,
  Paintbrush,
  Hammer,
  CookingPot,
  Navigation,
  Layers,
  Map as MapIcon,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api';
import { t } from '../../i18n';
import usePolling from '../../hooks/usePolling';
import CategoryTile from '../../components/CategoryTile';
import WorkerCard from '../../components/WorkerCard';
import HomeMapCard from '../../components/HomeMapCard';
import VoiceSheet from '../../components/VoiceSheet';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import { useNavigate } from 'react-router-dom';

const GRID = [
  { slug: 'plumber', labelKey: 'cat.plumber', icon: <Wrench className="w-6 h-6" /> },
  { slug: 'electrician', labelKey: 'cat.electrician', icon: <Zap className="w-6 h-6" /> },
  { slug: 'cleaner', labelKey: 'cat.cleaner', icon: <Sparkles className="w-6 h-6" /> },
  { slug: 'carpenter', labelKey: 'cat.carpenter', icon: <Hammer className="w-6 h-6" /> },
  { slug: 'painter', labelKey: 'cat.painter', icon: <Paintbrush className="w-6 h-6" /> },
  { slug: 'ac_repair', labelKey: 'cat.ac_repair', icon: <Zap className="w-6 h-6" /> },
  { slug: 'cook', labelKey: 'cat.cook', icon: <CookingPot className="w-6 h-6" /> },
  { slug: 'appliance_repair', labelKey: 'cat.appliance_repair', icon: <Wrench className="w-6 h-6" /> },
];

export default function Home() {
  const { location, detectLocation, locationStatus, setIsLocationModalOpen } = useApp();
  const navigate = useNavigate();
  const [railCat, setRailCat] = useState('plumber');
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'cards'
  const [showLocationBanner, setShowLocationBanner] = useState(true);

  const curLat = location?.lat || 13.0418;
  const curLng = location?.lng || 80.2341;

  const { data: categories, loading: catsLoading } = usePolling(
    () => api.get('/categories'),
    4000,
    true
  );

  const { data: workers, loading: railLoading } = usePolling(
    () => api.get(`/nearby-workers?category=${railCat}&lat=${curLat}&lng=${curLng}`),
    3000,
    true
  );

  const { data: bookings } = usePolling(
    () => api.get('/bookings'),
    3000,
    true
  );

  // find an active confirmed/in_progress booking for the floating bar
  const active = Array.isArray(bookings)
    ? bookings.find((b) => b.status === 'confirmed' || b.status === 'in_progress')
    : null;
  if (active && !activeBooking) setActiveBooking(active);

  const handleCategory = (slug) => navigate(`/request/new?category=${slug}`);
  const handleVoiceResult = (res) => {
    setVoiceOpen(false);
    navigate(`/request/new?category=${res.category || 'plumber'}`, { state: res });
  };

  return (
    <div className="space-y-4 animate-fade">
      {/* Geolocation Permission Request Banner */}
      {showLocationBanner && !location?.isGps && (
        <div className="p-3.5 rounded-card glass-card border border-primary/25 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 animate-pulse">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <span className="font-800 text-xs text-ink block">Enable Hyperlocal GPS</span>
              <span className="text-[11px] text-muted block">
                Allow device location for precise 10-second worker matching in Chennai
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => {
                detectLocation().catch(() => {});
                setShowLocationBanner(false);
              }}
              className="px-2.5 py-1 text-xs font-700 rounded-full bg-primary text-onprimary hover:bg-primary600 transition shadow-sm"
            >
              Allow
            </button>
            <button
              onClick={() => setShowLocationBanner(false)}
              className="p-1 text-muted hover:text-ink text-xs"
              aria-label="Dismiss banner"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Headline & Current Area badge */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-800 tracking-[-0.02em] text-ink">{t('app.tagline')}</h1>
          <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
            <span>Serving</span>
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="font-700 text-primary hover:underline inline-flex items-center gap-0.5"
            >
              {location?.name || 'T. Nagar'}, Chennai
              <ChevronRight className="w-3 h-3 inline" />
            </button>
          </p>
        </div>
        <Chip tone="accent" className="h-6 px-2 text-[11px] font-700 flex items-center gap-1 flex-shrink-0">
          <Clock className="w-3 h-3" /> <span>~18 min arrival</span>
        </Chip>
      </div>

      {/* Hero Voice / Instant Request Card */}
      <div className="p-4 rounded-[24px] glass-card border border-line shadow-card relative overflow-hidden group">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/15 rounded-full blur-2xl group-hover:scale-125 transition duration-500 pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex-1 pr-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-primary-soft text-primary flex items-center justify-center">
                <Mic className="w-3.5 h-3.5" />
              </span>
              <span className="font-800 text-ink text-sm">{t('home.search')}</span>
            </div>
            <p className="text-muted text-xs leading-relaxed">{t('home.speak')}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-700 px-2 py-0.5 rounded-full bg-surface2 text-muted border border-line">
                Tamil • Tanglish • English • Hindi
              </span>
            </div>
          </div>

          <button
            onClick={() => setVoiceOpen(true)}
            className="w-14 h-14 bg-primary hover:bg-primary600 text-onprimary rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition flex-shrink-0"
            aria-label="Voice search"
          >
            <Mic className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Category Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-800 text-ink text-sm">{t('home.what')}</span>
          <span className="text-xs text-muted font-600">8 Services</span>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {GRID.map((g) => (
            <CategoryTile
              key={g.slug}
              cat={{ label: t(g.labelKey), icon: g.icon }}
              onSelect={() => handleCategory(g.slug)}
            />
          ))}
        </div>
      </div>

      {/* Live Hyperlocal Map & Nearby Pros Section */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-800 text-ink text-sm">Nearby Pros in {location?.name}</span>
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          </div>

          {/* Toggle Map / List view */}
          <div className="flex items-center bg-surface2 p-0.5 rounded-full border border-line text-xs">
            <button
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1 rounded-full font-700 flex items-center gap-1 transition ${
                viewMode === 'map' ? 'bg-primary text-onprimary shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              <MapIcon className="w-3 h-3" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded-full font-700 flex items-center gap-1 transition ${
                viewMode === 'cards' ? 'bg-primary text-onprimary shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>List</span>
            </button>
          </div>
        </div>

        {/* Category Filters for Nearby Pros */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {['plumber', 'electrician', 'cleaner', 'carpenter', 'painter'].map((c) => (
            <button
              key={c}
              onClick={() => setRailCat(c)}
              className={`text-xs font-700 px-3 py-1.5 rounded-full border transition flex-shrink-0 ${
                railCat === c
                  ? 'bg-primary text-onprimary border-primary shadow-sm'
                  : 'bg-surface border-line text-muted hover:bg-surface2'
              }`}
            >
              {t(`cat.${c}`)}
            </button>
          ))}
        </div>

        {/* Content: Map View or List View */}
        {viewMode === 'map' ? (
          <HomeMapCard
            center={[curLat, curLng]}
            workers={workers || []}
            selectedCategory={railCat}
          />
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {railLoading ? (
              [0, 1, 2, 3].map((i) => (
                <div key={i} className="w-44 h-40 bg-surface2 rounded-card animate-shimmer" />
              ))
            ) : workers && workers.length > 0 ? (
              workers.map((w) => <WorkerCard key={w.id} worker={w} compact />)
            ) : (
              <div className="w-full flex flex-col items-center gap-2 p-6 text-center text-muted text-xs glass-card rounded-card">
                <Chip tone="neutral">—</Chip>
                <span>{t('home.none_online')}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trust & Guarantees Bar */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        <div className="p-2.5 rounded-card glass-card border border-line text-center space-y-1">
          <ShieldCheck className="w-4 h-4 text-success mx-auto" />
          <span className="text-[11px] font-800 text-ink block">{t('badge.id')}</span>
          <span className="text-[10px] text-muted block">Police & Skill Verified</span>
        </div>
        <div className="p-2.5 rounded-card glass-card border border-line text-center space-y-1">
          <Zap className="w-4 h-4 text-primary mx-auto" />
          <span className="text-[11px] font-800 text-ink block">&lt;10s Response</span>
          <span className="text-[10px] text-muted block">Direct quotes</span>
        </div>
        <div className="p-2.5 rounded-card glass-card border border-line text-center space-y-1">
          <IndianRupee className="w-4 h-4 text-accent mx-auto" />
          <span className="text-[11px] font-800 text-ink block">{t('home.your_price')}</span>
          <span className="text-[10px] text-muted block">1-Round Countering</span>
        </div>
      </div>

      {voiceOpen && (
        <VoiceSheet
          open={voiceOpen}
          onClose={() => setVoiceOpen(false)}
          onResult={handleVoiceResult}
        />
      )}

      {/* Floating Active Booking Bar */}
      {activeBooking && (
        <div className="fixed bottom-20 left-4 right-4 w-auto mx-auto max-w-[480px] z-30">
          <FloatingBookingBarPlaceholder
            booking={activeBooking}
            onTap={() => navigate(`/booking/${activeBooking.id}`)}
          />
        </div>
      )}
    </div>
  );
}

function FloatingBookingBarPlaceholder({ booking, onTap }) {
  if (!booking) return null;
  return (
    <div
      onClick={onTap}
      role="button"
      tabIndex={0}
      aria-label="Floating booking bar"
      className="p-3.5 rounded-2xl bg-primary text-onprimary shadow-2xl flex items-center gap-3 cursor-pointer border border-white/20 hover:scale-[1.01] transition"
    >
      <div className="w-10 h-10 rounded-full bg-onprimary/20 flex items-center justify-center text-onprimary flex-shrink-0">
        <MapPin className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1">
          <span className="font-800 text-sm">{booking.worker?.name || 'Worker'}</span>
          <span className="text-xs opacity-90">{t('home.on_the_way')}</span>
        </div>
        <div className="text-xs opacity-80 mt-0.5">
          {booking.eta_min} min • ₹{booking.agreed_price}
        </div>
      </div>
      <div className="text-xs font-800 bg-white/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
        {booking.status}
      </div>
    </div>
  );
}
