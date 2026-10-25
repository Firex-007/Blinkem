import { useState } from 'react';
import {
  BadgeCheck,
  ChefHat,
  ChevronDown,
  ChevronRight,
  Clock3,
  Hammer,
  Mic,
  Paintbrush,
  PlugZap,
  Search,
  Snowflake,
  Sparkles,
  Wrench,
  Zap,
  ArrowRight,
  MapPin,
  Map as MapIcon,
  Layers,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { api } from '../../api';
import { t } from '../../i18n';
import usePolling from '../../hooks/usePolling';
import VoiceSheet from '../../components/VoiceSheet';
import WorkerCard from '../../components/WorkerCard';
import HomeMapCard from '../../components/HomeMapCard';
import Skeleton from '../../components/Skeleton';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Chip from '../../components/Chip';

const CATEGORIES = [
  { slug: 'plumber', labelKey: 'cat_plumber', icon: Wrench, color: 'text-blue-500 bg-blue-500/10' },
  { slug: 'electrician', labelKey: 'cat_electrician', icon: Zap, color: 'text-amber-500 bg-amber-500/10' },
  { slug: 'cleaner', labelKey: 'cat_cleaner', icon: Sparkles, color: 'text-emerald-500 bg-emerald-500/10' },
  { slug: 'carpenter', labelKey: 'cat_carpenter', icon: Hammer, color: 'text-orange-500 bg-orange-500/10' },
  { slug: 'painter', labelKey: 'cat_painter', icon: Paintbrush, color: 'text-purple-500 bg-purple-500/10' },
  { slug: 'ac_repair', labelKey: 'cat_ac_repair', icon: Snowflake, color: 'text-cyan-500 bg-cyan-500/10' },
  { slug: 'cook', labelKey: 'cat_cook', icon: ChefHat, color: 'text-rose-500 bg-rose-500/10' },
  { slug: 'appliance_repair', labelKey: 'cat_appliance_repair', icon: PlugZap, color: 'text-indigo-500 bg-indigo-500/10' },
];

const FILTERS = CATEGORIES.slice(0, 5);

export default function Home() {
  const { location, setIsLocationModalOpen } = useApp();
  const navigate = useNavigate();
  const [railCat, setRailCat] = useState('plumber');
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [typeQuery, setTypeQuery] = useState('');
  const [rightViewMode, setRightViewMode] = useState('both'); // 'both' | 'map' | 'cards'

  const curLat = location?.lat || 13.0418;
  const curLng = location?.lng || 80.2341;

  const {
    data: categories,
    loading: catsLoading,
    error: catsError,
    refetch: retryCategories,
  } = usePolling(() => api.get('/categories'), 4000, true);

  const {
    data: workers,
    loading: workersLoading,
    error: workersError,
    refetch: retryWorkers,
  } = usePolling(
    () => api.get(`/nearby-workers?category=${railCat}&lat=${curLat}&lng=${curLng}`),
    3000,
    true
  );

  const { data: bookings, error: bookingsError } = usePolling(
    () => api.get('/bookings'),
    3000,
    true
  );

  const activeBooking = Array.isArray(bookings)
    ? bookings.find((booking) => booking.status === 'confirmed' || booking.status === 'in_progress')
    : null;

  const availableCategories = categories?.length
    ? CATEGORIES.filter((item) => categories.some((category) => category.slug === item.slug))
    : CATEGORIES;

  const handleVoiceResult = (result) => {
    setVoiceOpen(false);
    navigate(`/request/new?category=${result.category || railCat || 'plumber'}`, { state: result });
  };

  const handleTypeSubmit = (e) => {
    e.preventDefault();
    const query = typeQuery.trim();
    navigate(`/request/new?category=${railCat}`, {
      state: {
        description: query || undefined,
        category: railCat,
        urgency: 'now',
      },
    });
  };

  const handleSelectCategory = (slug) => {
    setRailCat(slug);
  };

  const handleStartRequestForCat = (slug) => {
    navigate(`/request/new?category=${slug}`);
  };

  return (
    <div className="home-page animate-fade" data-name="customer home">
      <div className="home-desktop-grid">
        {/* LEFT COLUMN: The Request Console */}
        <div className="home-primary-column space-y-6">
          <section className="request-console" data-name="request console">
            {/* Headline & Locality Subtitle */}
            <div className="space-y-1">
              <h1 className="home-display text-ink" data-name="request headline">
                {t('home_search')}
              </h1>
              <p className="home-helper flex items-center gap-1.5">
                <span>{t('home_speak')}</span>
                <span className="text-muted/60">•</span>
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="text-primary font-700 hover:underline inline-flex items-center gap-0.5"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {location?.name || 'T. Nagar'}
                </button>
              </p>
            </div>

            {/* Unified Voice & Typing Action Console */}
            <div className="request-actions my-4">
              {/* Voice Orb Trigger with Tooltip */}
              <button
                className="voice-orb hover:scale-105 active:scale-95 transition flex-shrink-0 shadow-lg relative group"
                onClick={() => setVoiceOpen(true)}
                aria-label={t('home_speak')}
                title="Tap mic or hold [Space] to speak"
              >
                <Mic className="h-7 w-7" />
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-surface2 text-muted text-[10px] font-700 border border-line opacity-0 group-hover:opacity-100 transition pointer-events-none">
                  Hold [Space]
                </span>
              </button>

              {/* Direct Typing Input Box */}
              <form
                onSubmit={handleTypeSubmit}
                className="flex-1 flex items-center bg-surface2/70 hover:bg-surface2 focus-within:bg-surface rounded-chip border border-line focus-within:border-primary transition pl-3 pr-1.5 py-1.5 shadow-sm"
              >
                <Search className="w-5 h-5 text-muted flex-shrink-0" />
                <input
                  type="text"
                  value={typeQuery}
                  onChange={(e) => setTypeQuery(e.target.value)}
                  placeholder="What needs fixing? (e.g. kitchen sink leak, fan sparking)"
                  className="flex-1 px-2.5 py-1.5 bg-transparent text-sm text-ink placeholder:text-muted/70 focus:outline-none font-600 min-w-0"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-chip bg-primary hover:bg-primary600 text-onprimary font-800 text-xs flex items-center gap-1 transition shadow-sm flex-shrink-0 active:scale-95"
                >
                  <span className="hidden sm:inline">Find Pros</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Service Category Matrix */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-800 text-ink uppercase tracking-wider">
                  Select Service Category
                </span>
                <span className="text-muted font-600">8 Core Trades</span>
              </div>

              <div className="service-grid" data-name="service category matrix">
                {catsLoading
                  ? CATEGORIES.map((category) => (
                      <div className="category-skeleton" key={category.slug}>
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))
                  : availableCategories.map((category) => {
                      const Icon = category.icon;
                      const isSelected = railCat === category.slug;
                      return (
                        <button
                          key={category.slug}
                          className={`service-choice transition-all duration-200 ${
                            isSelected
                              ? 'ring-2 ring-primary bg-primary-soft shadow-md scale-[1.03] z-10 opacity-100'
                              : 'hover:bg-surface hover:shadow-sm opacity-70 hover:opacity-100 hover:scale-[1.01]'
                          }`}
                          onClick={() => handleSelectCategory(category.slug)}
                          onDoubleClick={() => handleStartRequestForCat(category.slug)}
                          aria-label={t(category.labelKey)}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                              isSelected ? 'bg-primary text-onprimary scale-110' : 'bg-surface text-primary'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-800">{t(category.labelKey)}</span>
                        </button>
                      );
                    })}
              </div>

              {catsError && (
                <div className="section-error" role="alert">
                  <span>{t('error')}</span>
                  <button onClick={retryCategories}>{t('retry')}</button>
                </div>
              )}
            </div>

            {/* Trust Reassurance Footnote */}
            <div className="reassurance grid grid-cols-3 gap-2 text-center pt-3 mt-3 border-t border-line">
              <div className="space-y-0.5">
                <BadgeCheck className="w-4 h-4 text-success mx-auto" />
                <span className="text-[11px] font-800 text-ink block">Verified Pros</span>
                <span className="text-[10px] text-muted block">Identity &amp; skills check</span>
              </div>
              <div className="space-y-0.5">
                <Clock3 className="w-4 h-4 text-primary mx-auto" />
                <span className="text-[11px] font-800 text-ink block">&lt;10s Matching</span>
                <span className="text-[10px] text-muted block">Real-time local quotes</span>
              </div>
              <div className="space-y-0.5">
                <ShieldCheck className="w-4 h-4 text-accent mx-auto" />
                <span className="text-[11px] font-800 text-ink block">Fair Counter</span>
                <span className="text-[10px] text-muted block">1-round price lock</span>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Live Chennai Radar Map & Nearby Active Workers */}
        <aside className="home-secondary-column space-y-4">
          <section className="nearby-section" data-name="nearby workers">
            {/* Section Header with Locality & View Toggle */}
            <div className="section-heading flex items-center justify-between pb-2 border-b border-line">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-800 text-ink">{t('home_available')}</h2>
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              </div>

              {/* View Switcher: Map vs List */}
              <div className="flex items-center bg-surface2 p-0.5 rounded-full border border-line text-xs">
                <button
                  onClick={() => setRightViewMode('both')}
                  className={`px-2.5 py-1 rounded-full font-700 transition ${
                    rightViewMode === 'both' ? 'bg-primary text-onprimary shadow-sm' : 'text-muted hover:text-ink'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setRightViewMode('map')}
                  className={`px-2.5 py-1 rounded-full font-700 flex items-center gap-1 transition ${
                    rightViewMode === 'map' ? 'bg-primary text-onprimary shadow-sm' : 'text-muted hover:text-ink'
                  }`}
                >
                  <MapIcon className="w-3 h-3" />
                  <span>Map</span>
                </button>
                <button
                  onClick={() => setRightViewMode('cards')}
                  className={`px-2.5 py-1 rounded-full font-700 flex items-center gap-1 transition ${
                    rightViewMode === 'cards' ? 'bg-primary text-onprimary shadow-sm' : 'text-muted hover:text-ink'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>Pros</span>
                </button>
              </div>
            </div>

            {/* Quick Filter Row */}
            <div className="filter-row my-2" aria-label={t('home_service_filter')}>
              {FILTERS.map((filter) => {
                const isFilterActive = railCat === filter.slug;
                return (
                  <button
                    key={filter.slug}
                    className={`filter-chip transition-all duration-200 ${
                      isFilterActive
                        ? 'is-active scale-[1.02] shadow-xs opacity-100'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    onClick={() => setRailCat(filter.slug)}
                  >
                    {t(filter.labelKey)}
                  </button>
                );
              })}
            </div>

            {/* Live Leaflet Radar Map (Shown in 'both' and 'map' modes) */}
            {(rightViewMode === 'both' || rightViewMode === 'map') && (
              <div className="mb-3">
                <HomeMapCard
                  center={[curLat, curLng]}
                  workers={workers || []}
                  selectedCategory={railCat}
                />
              </div>
            )}

            {/* Nearby Verified Pros Rail / Grid (Shown in 'both' and 'cards' modes) */}
            {(rightViewMode === 'both' || rightViewMode === 'cards') && (
              <div className="space-y-2">
                {workersLoading ? (
                  <div className="worker-rail" aria-label={t('loading')}>
                    <Skeleton className="worker-skeleton" />
                    <Skeleton className="worker-skeleton" />
                  </div>
                ) : workersError ? (
                  <Card className="section-error-card">
                    <p>{t('error')}</p>
                    <Button variant="secondary" size="sm" onClick={retryWorkers}>
                      {t('retry')}
                    </Button>
                  </Card>
                ) : workers?.length ? (
                  <div className="worker-rail" data-name="nearby worker rail">
                    {workers.map((worker) => (
                      <WorkerCard key={worker.id} worker={worker} compact />
                    ))}
                  </div>
                ) : (
                  <Card className="empty-workers">
                    <div className="empty-icon">
                      <Clock3 className="h-5 w-5" />
                    </div>
                    <p>{t('home_none_online')}</p>
                    <Button variant="secondary" size="sm" onClick={() => navigate('/request/new')}>
                      {t('home_create_request')}
                    </Button>
                  </Card>
                )}
              </div>
            )}

            <p className="reassurance text-[11px] text-muted pt-2 border-t border-line mt-2">
              {t('home_quote_reassurance')}
            </p>
          </section>

          {/* Desktop Support & Verified Platform Panel */}
          <section className="desktop-support-panel" data-name="location support">
            <div className="support-icon">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div>
              <strong>{t('home_verified_workers')}</strong>
              <p>
                {location?.name || 'T. Nagar'}, Chennai · {t('home_pay_after')}
              </p>
            </div>
          </section>

          {bookingsError && (
            <p className="booking-refresh-warning">{t('home_booking_refresh_error')}</p>
          )}
        </aside>
      </div>

      {/* Voice Assistant Sheet */}
      {voiceOpen && (
        <VoiceSheet
          open={voiceOpen}
          onClose={() => setVoiceOpen(false)}
          onResult={handleVoiceResult}
        />
      )}

      {/* Active Booking Floating / Docked Bar */}
      {activeBooking && (
        <ActiveBookingBar
          booking={activeBooking}
          onTap={() => navigate(`/booking/${activeBooking.id}`)}
        />
      )}
    </div>
  );
}

function ActiveBookingBar({ booking, onTap }) {
  return (
    <button
      className="active-booking-bar transition hover:scale-[1.02] shadow-2xl"
      onClick={onTap}
      aria-label={t('home_view_booking')}
    >
      <span className="booking-avatar">
        {booking.worker?.name?.slice(0, 2).toUpperCase() || 'W'}
      </span>
      <span className="booking-copy">
        <strong>
          {booking.worker?.name || 'Worker'} {t('home_on_the_way')}
        </strong>
        <span>
          {booking.eta_min} min · ₹{booking.agreed_price}
        </span>
      </span>
      <ChevronRight className="h-5 w-5" />
    </button>
  );
}
