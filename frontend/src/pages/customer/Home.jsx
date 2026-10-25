import { useState, useEffect, useMemo } from 'react';
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
  { slug: 'plumber', labelKey: 'cat_plumber', image: '/images/categories/plumber.jpg', color: 'text-blue-500 bg-blue-500/10' },
  { slug: 'electrician', labelKey: 'cat_electrician', image: '/images/categories/electrician.jpg', color: 'text-amber-500 bg-amber-500/10' },
  { slug: 'cleaner', labelKey: 'cat_cleaner', image: '/images/categories/cleaner.jpg', color: 'text-emerald-500 bg-emerald-500/10' },
  { slug: 'carpenter', labelKey: 'cat_carpenter', image: '/images/categories/carpenter.jpg', color: 'text-orange-500 bg-orange-500/10' },
  { slug: 'painter', labelKey: 'cat_painter', image: '/images/categories/painter.jpg', color: 'text-purple-500 bg-purple-500/10' },
  { slug: 'ac_repair', labelKey: 'cat_ac_repair', image: '/images/categories/ac_repair.jpg', color: 'text-cyan-500 bg-cyan-500/10' },
  { slug: 'cook', labelKey: 'cat_cook', image: '/images/categories/cook.jpg', color: 'text-rose-500 bg-rose-500/10' },
  { slug: 'appliance_repair', labelKey: 'cat_appliance_repair', image: '/images/categories/appliance_repair.jpg', color: 'text-indigo-500 bg-indigo-500/10' },
];

const SEARCH_SUGGESTIONS = [
  'kitchen sink tap leaking',
  'split AC not cooling properly',
  'switchboard sparking / MCB trip',
  'wooden door lock & latch repair',
  'bathroom wall dampness & painting',
  'washing machine drum not spinning',
  'deep home floor & tile cleaning',
  'cook for party or dinner',
];

function SearchSuggestions() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SEARCH_SUGGESTIONS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute left-9 sm:left-10 right-28 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1.5 overflow-hidden text-xs sm:text-sm select-none opacity-45">
      <span className="text-ink dark:text-white font-500 whitespace-nowrap">
        Search
      </span>
      <span
        key={index}
        className="text-primary font-700 italic truncate"
      >
        &ldquo;{SEARCH_SUGGESTIONS[index]}&rdquo;
      </span>
    </div>
  );
}

const INSTANT_FIX_PACKAGES = [
  {
    id: 'pipe-leak',
    title: 'Tap & Pipe Leak Fix',
    category: 'plumber',
    description: 'Fix leaking kitchen/bathroom tap, loose pipe joint, or low pressure valve',
    price: 199,
    eta: '12 min',
    image: '/images/categories/plumber.jpg',
  },
  {
    id: 'mcb-spark',
    title: 'Switchboard / MCB Repair',
    category: 'electrician',
    description: 'Diagnose tripped circuit breaker, replace burnt 16A socket or switch',
    price: 249,
    eta: '15 min',
    image: '/images/categories/electrician.jpg',
  },
  {
    id: 'ac-service',
    title: 'AC Cooling & Filter Service',
    category: 'ac_repair',
    description: 'Deep filter wash, coil inspection, and cooling gas pressure check',
    price: 399,
    eta: '20 min',
    image: '/images/categories/ac_repair.jpg',
  },
  {
    id: 'door-lock',
    title: 'Door Lock & Hinge Fix',
    category: 'carpenter',
    description: 'Realign jammed wooden door, replace faulty cylinder lock or loose hinges',
    price: 279,
    eta: '18 min',
    image: '/images/categories/carpenter.jpg',
  },
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
  const mapCenter = useMemo(() => [curLat, curLng], [curLat, curLng]);

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
    <div className="home-page" data-name="customer home">
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
                className="relative flex-1 flex items-center bg-surface2/70 hover:bg-surface2 focus-within:bg-surface rounded-chip border border-line focus-within:border-primary transition pl-3 pr-1.5 py-1.5 shadow-sm"
              >
                <Search className="w-5 h-5 text-muted flex-shrink-0 z-10" />

                {/* Dynamic running suggestion text with lesser opacity */}
                {!typeQuery && <SearchSuggestions />}

                <input
                  type="text"
                  value={typeQuery}
                  onChange={(e) => setTypeQuery(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-transparent text-sm text-ink focus:outline-none font-600 min-w-0 z-10"
                  aria-label="Search services"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-chip bg-primary hover:bg-primary600 text-onprimary font-800 text-xs flex items-center gap-1 transition shadow-sm flex-shrink-0 active:scale-95 z-10"
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
                      const isSelected = railCat === category.slug;
                      return (
                        <button
                          key={category.slug}
                          className={`service-choice transition-all duration-200 group flex flex-col items-center justify-center p-2 rounded-2xl ${
                            isSelected
                              ? 'ring-2 ring-primary bg-primary-soft/80 shadow-md scale-[1.03] z-10 opacity-100'
                              : 'hover:bg-surface hover:shadow-sm opacity-75 hover:opacity-100 hover:scale-[1.02]'
                          }`}
                          onClick={() => handleSelectCategory(category.slug)}
                          onDoubleClick={() => handleStartRequestForCat(category.slug)}
                          aria-label={t(category.labelKey)}
                        >
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shadow-xs border border-line/60 flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                            <img
                              src={category.image}
                              alt={t(category.labelKey)}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <span className="font-800 text-xs sm:text-[13px] leading-tight text-ink mt-1.5 truncate max-w-full">
                            {t(category.labelKey)}
                          </span>
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

          {/* 4 Instant Fix Packages (2x2 Grid) to fill the left blank space */}
          <section className="bg-surface border border-line rounded-card shadow-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-sm font-800 text-ink tracking-tight">
                  Popular 15-Min Instant Fixes
                </h2>
              </div>
              <span className="text-[11px] font-700 text-muted bg-surface2 px-2 py-0.5 rounded-full border border-line">
                ⚡ Rapid Dispatch
              </span>
            </div>

            {/* 2x2 Grid of 4 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {INSTANT_FIX_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => {
                    navigate(`/request/new?category=${pkg.category}`, {
                      state: {
                        description: pkg.description,
                        category: pkg.category,
                        urgency: 'now',
                        budget_hint: pkg.price,
                      },
                    });
                  }}
                  role="button"
                  tabIndex={0}
                  className="group p-3 rounded-2xl bg-surface2/60 hover:bg-surface border border-line hover:border-primary/50 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-md hover:scale-[1.01]"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-line/60 flex-shrink-0 group-hover:scale-105 transition-transform">
                      <img
                        src={pkg.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-800 text-ink group-hover:text-primary transition-colors line-clamp-1">
                        {pkg.title}
                      </h3>
                      <p className="text-[11px] text-muted line-clamp-1 mt-0.5">
                        {pkg.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-line/60 text-xs">
                    <div className="flex items-center gap-1.5 font-800 text-ink">
                      <span>₹{pkg.price}</span>
                      <span className="text-[10px] text-muted font-600 bg-surface px-1.5 py-0.5 rounded border border-line">
                        ETA {pkg.eta}
                      </span>
                    </div>
                    <span className="text-[11px] font-800 text-primary flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Book <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust & Direct Guarantee Footnote */}
            <div className="p-2.5 rounded-xl bg-primary-soft/40 border border-primary/20 flex items-center justify-between text-xs text-primary font-700">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span className="text-[11px]">₹10,000 Damage Protection on all bookings</span>
              </div>
              <span className="text-[10px] bg-primary text-onprimary font-800 px-2 py-0.5 rounded-full">
                Guaranteed
              </span>
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
                    className={`filter-chip flex items-center gap-1.5 transition-all duration-200 ${
                      isFilterActive
                        ? 'is-active scale-[1.02] shadow-xs opacity-100 ring-2 ring-primary/20'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    onClick={() => setRailCat(filter.slug)}
                  >
                    <img
                      src={filter.image}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover border border-white/30 flex-shrink-0"
                    />
                    <span>{t(filter.labelKey)}</span>
                  </button>
                );
              })}
            </div>

            {/* Live Leaflet Radar Map (Shown in 'both' and 'map' modes) */}
            {(rightViewMode === 'both' || rightViewMode === 'map') && (
              <div className="mb-3">
                <HomeMapCard
                  center={mapCenter}
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
