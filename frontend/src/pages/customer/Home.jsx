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
import RealPlacesCard from '../../components/RealPlacesCard';
import HomeMapCard from '../../components/HomeMapCard';
import Skeleton from '../../components/Skeleton';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import useScrollReveal from '../../hooks/useScrollReveal';
import { getRealPlaces } from '../../utils/placesFinder';

const CATEGORIES = [
  { slug: 'plumber', labelKey: 'cat_plumber', image: '/images/categories/plumber.jpg', startingPrice: 199 },
  { slug: 'electrician', labelKey: 'cat_electrician', image: '/images/categories/electrician.jpg', startingPrice: 149 },
  { slug: 'cleaner', labelKey: 'cat_cleaner', image: '/images/categories/cleaner.jpg', startingPrice: 299 },
  { slug: 'carpenter', labelKey: 'cat_carpenter', image: '/images/categories/carpenter.jpg', startingPrice: 249 },
  { slug: 'painter', labelKey: 'cat_painter', image: '/images/categories/painter.jpg', startingPrice: 399 },
  { slug: 'ac_repair', labelKey: 'cat_ac_repair', image: '/images/categories/ac_repair.jpg', startingPrice: 349 },
  { slug: 'cook', labelKey: 'cat_cook', image: '/images/categories/cook.jpg', startingPrice: 299 },
  { slug: 'appliance_repair', labelKey: 'cat_appliance_repair', image: '/images/categories/appliance_repair.jpg', startingPrice: 249 },
];

const SEARCH_SUGGESTIONS = {
  en: [
    'kitchen sink tap leaking',
    'split AC not cooling properly',
    'switchboard sparking / MCB trip',
    'wooden door lock & latch repair',
    'bathroom wall dampness & painting',
    'washing machine drum not spinning',
    'deep home floor & tile cleaning',
    'cook for party or dinner',
  ],
  ta: [
    'சமையலறை குழாய் கசிகிறது',
    'ஏசி கூலிங் வரவில்லை',
    'சுவிட்ச்போர்டு ஸ்பார்க் ஆகிறது',
    'மரக் கதவு பூட்டு பழுது',
    'சுவர் பெயிண்டிங் வேலை',
    'வாஷிங் மெஷின் ஓடவில்லை',
    'வீடு தரை சுத்தம் செய்தல்',
    'விசேஷத்திற்கு சமையல்காரர்',
  ],
  hi: [
    'किचन सिंक का नल लीक कर रहा है',
    'एसी सही से ठंडा नहीं कर रहा',
    'स्विचबोर्ड में स्पार्क / MCB ट्रिप',
    'दरवाजे का ताला और कुंडी मरम्मत',
    'दीवार की सीलन और पेंटिंग',
    'वॉशिंग मशीन नहीं चल रही',
    'घर के फर्श और टाइल्स की गहरी सफाई',
    'पार्टी या डिनर के लिए रसोइया',
  ],
};

const DYNAMIC_ACTIONS = {
  en: {
    prefix: 'Tell us what needs',
    actions: [
      'to be fixed...',
      'to be cleaned...',
      'to be cooked...',
      'to be repaired...',
      'to be serviced...',
      'to be painted...',
      'fixing...',
    ],
  },
  ta: {
    prefix: 'உங்களுக்கு என்ன',
    actions: [
      'சரிசெய்ய வேண்டும்...',
      'சுத்தம் செய்ய வேண்டும்...',
      'சமைக்க வேண்டும்...',
      'பழுதுபார்க்க வேண்டும்...',
      'சர்வீஸ் செய்ய வேண்டும்...',
      'பெயிண்ட் செய்ய வேண்டும்...',
      'தேவைப்படுகிறது...',
    ],
  },
  hi: {
    prefix: 'बताइए क्या काम',
    actions: [
      'करवाना है...',
      'सफाई करवानी है...',
      'खाना बनवाना है...',
      'मरम्मत करवानी है...',
      'सर्विस करवानी है...',
      'पेंट करवाना है...',
      'ठीक करवाना है...',
    ],
  },
};

function SearchSuggestions({ lang = 'en' }) {
  const [index, setIndex] = useState(0);
  const suggestions = SEARCH_SUGGESTIONS[lang] || SEARCH_SUGGESTIONS.en;

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % suggestions.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [suggestions]);

  return (
    <div className="absolute left-8 sm:left-9 right-12 sm:right-28 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1.5 overflow-hidden text-xs sm:text-sm select-none opacity-50">
      <span className="text-ink dark:text-white font-600 whitespace-nowrap">
        {t('search_label')}
      </span>
      <span
        key={`${lang}-${index}`}
        className="text-primary font-700 italic truncate"
      >
        &ldquo;{suggestions[index % suggestions.length]}&rdquo;
      </span>
    </div>
  );
}

const INSTANT_FIX_PACKAGES = [
  {
    id: 'pipe-leak',
    titleKey: 'pkg_tap_title',
    descKey: 'pkg_tap_desc',
    category: 'plumber',
    price: 199,
    eta: '12 min',
    image: '/images/categories/plumber.jpg',
  },
  {
    id: 'mcb-spark',
    titleKey: 'pkg_mcb_title',
    descKey: 'pkg_mcb_desc',
    category: 'electrician',
    price: 249,
    eta: '15 min',
    image: '/images/categories/electrician.jpg',
  },
  {
    id: 'ac-service',
    titleKey: 'pkg_ac_title',
    descKey: 'pkg_ac_desc',
    category: 'ac_repair',
    price: 399,
    eta: '20 min',
    image: '/images/categories/ac_repair.jpg',
  },
  {
    id: 'door-lock',
    titleKey: 'pkg_door_title',
    descKey: 'pkg_door_desc',
    category: 'carpenter',
    price: 279,
    eta: '18 min',
    image: '/images/categories/carpenter.jpg',
  },
];

const FILTERS = CATEGORIES.slice(0, 5);

export default function Home() {
  const { location, setIsLocationModalOpen, lang } = useApp();
  const navigate = useNavigate();
  useScrollReveal();
  const [railCat, setRailCat] = useState('plumber');
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [typeQuery, setTypeQuery] = useState('');
  const [rightViewMode, setRightViewMode] = useState('both'); // 'both' | 'map' | 'cards'
  const [proSourceTab, setProSourceTab] = useState('all'); // 'all' | 'blinkem' | 'google'
  const [realPlaces, setRealPlaces] = useState([]);
  const [actionIndex, setActionIndex] = useState(0);
  const [animPhase, setAnimPhase] = useState('idle'); // 'idle' | 'exit' | 'enter'

  useEffect(() => {
    let enterTimer;
    let idleTimer;
    const interval = setInterval(() => {
      // 1. Dash out towards the right
      setAnimPhase('exit');

      // 2. After slide-out (280ms), switch word and reset position to far left
      enterTimer = setTimeout(() => {
        setActionIndex((prev) => (typeof prev === 'number' && !isNaN(prev) ? (prev + 1) % 7 : 0));
        setAnimPhase('enter');

        // 3. Immediately transition into place from left
        idleTimer = setTimeout(() => {
          setAnimPhase('idle');
        }, 40);
      }, 280);
    }, 2400);

    return () => {
      clearInterval(interval);
      if (enterTimer) clearTimeout(enterTimer);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  const curLat = location?.lat || 13.0418;
  const curLng = location?.lng || 80.2341;
  const mapCenter = useMemo(() => [curLat, curLng], [curLat, curLng]);

  useEffect(() => {
    let isMounted = true;
    getRealPlaces(railCat, curLat, curLng).then((data) => {
      if (isMounted) setRealPlaces(data || []);
    });
    return () => {
      isMounted = false;
    };
  }, [railCat, curLat, curLng]);

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

  const safeWorkers = Array.isArray(workers) ? workers : [];
  const safeRealPlaces = Array.isArray(realPlaces) ? realPlaces : [];

  const allMapEntities = useMemo(() => {
    const list = [...safeWorkers];
    if (safeRealPlaces.length > 0) {
      list.push(...safeRealPlaces);
    }
    return list;
  }, [safeWorkers, safeRealPlaces]);

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

  const curDynamic = DYNAMIC_ACTIONS[lang] || DYNAMIC_ACTIONS.en;
  const actionsList = curDynamic?.actions || DYNAMIC_ACTIONS.en.actions;
  const safeActionIndex = (typeof actionIndex === 'number' && !isNaN(actionIndex) ? actionIndex : 0) % actionsList.length;
  const currentActionText = actionsList[safeActionIndex] || actionsList[0];

  return (
    <div className="home-page" data-name="customer home">
      <div className="home-desktop-grid">
        {/* LEFT COLUMN: The Request Console */}
        <div className="home-primary-column space-y-6">
          <section className="request-console scroll-reveal" data-name="request console">
            {/* Locality & Header */}
            <div className="space-y-1.5">
              <h1 className="home-display font-uber text-ink leading-tight" data-name="request headline">
                <span className="block text-ink font-800">
                  {curDynamic.prefix}
                </span>
                <span className="block overflow-hidden relative pt-0.5 pb-1 min-h-[1.4em]">
                  <span
                    className={`inline-block text-primary dark:text-blue-400 italic font-black tracking-tight whitespace-nowrap transition-all duration-300 ease-out transform ${
                      animPhase === 'enter'
                        ? '-translate-x-14 opacity-0 scale-95'
                        : animPhase === 'exit'
                        ? 'translate-x-14 opacity-0 scale-95'
                        : 'translate-x-0 opacity-100 scale-100'
                    }`}
                  >
                    {currentActionText}
                  </span>
                </span>
              </h1>

              <p className="home-helper flex items-center gap-2 flex-wrap">
                <span>{t('home_speak')}</span>
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface2/80 hover:bg-surface2 text-primary font-700 text-xs border border-primary/20 hover:border-primary/40 shadow-xs transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>{location?.name || 'T. Nagar'}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
              </p>
            </div>

            {/* Unified Voice & Typing Action Console */}
            <div className="request-actions my-4 sm:my-5 flex items-center gap-2.5 sm:gap-3 w-full min-w-0">
              {/* Voice Orb Trigger with Tooltip & Pulsing Glow Aura */}
              <div className="relative flex-shrink-0">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-blue-400 opacity-30 blur-md group-hover:opacity-60 transition duration-500 animate-pulse pointer-events-none" />
                <button
                  className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-primary via-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-[0_8px_24px_rgba(31,91,255,0.38)] hover:shadow-[0_12px_32px_rgba(31,91,255,0.55)] hover:scale-105 active:scale-95 transition-all duration-300 group border-2 border-white/30"
                  onClick={() => setVoiceOpen(true)}
                  aria-label={t('home_speak')}
                  title="Tap mic or hold [Space] to speak"
                >
                  <Mic className="h-5 w-5 sm:h-7 sm:w-7 group-hover:scale-110 transition-transform duration-300" />

                  <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-surface2 text-muted text-[10px] font-700 border border-line opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-xs">
                    Hold [Space]
                  </span>
                </button>
              </div>

              {/* Direct Typing Input Box */}
              <form
                onSubmit={handleTypeSubmit}
                className="relative flex-1 min-w-0 flex items-center bg-surface2/60 hover:bg-surface2/90 focus-within:bg-surface rounded-2xl border border-line/80 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300 pl-3 pr-1.5 sm:pr-2 py-1.5 sm:py-2 shadow-xs hover:shadow-sm"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-muted flex-shrink-0 z-10 transition-colors group-focus-within:text-primary" />

                {/* Dynamic running suggestion text with lesser opacity */}
                {!typeQuery && <SearchSuggestions lang={lang} />}

                <input
                  type="text"
                  value={typeQuery}
                  onChange={(e) => setTypeQuery(e.target.value)}
                  className="flex-1 w-0 min-w-0 px-2 py-1 bg-transparent text-xs sm:text-sm text-ink focus:outline-none font-600 z-10"
                  aria-label="Search services"
                />
                <button
                  type="submit"
                  className="h-8 sm:h-9 px-2.5 sm:px-4 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary600 hover:to-blue-700 text-onprimary font-800 text-xs flex items-center justify-center gap-1.5 transition-all duration-200 shadow-[0_4px_12px_rgba(31,91,255,0.25)] flex-shrink-0 active:scale-95 z-10"
                >
                  <span className="hidden sm:inline">{t('find_pros')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Service Category Matrix */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-uber text-sm text-ink tracking-tight uppercase">
                  {t('home_select_category')}
                </span>
              </div>

              <div className="service-grid" data-name="service category matrix">
                {catsLoading
                  ? CATEGORIES.map((category) => (
                      <div className="category-skeleton p-3 rounded-2xl" key={category.slug}>
                        <Skeleton className="h-14 w-14 rounded-xl" />
                        <Skeleton className="h-4 w-20 mt-2" />
                        <Skeleton className="h-3 w-12 mt-1" />
                      </div>
                    ))
                  : availableCategories.map((category) => {
                      const isSelected = railCat === category.slug;
                      return (
                        <button
                          key={category.slug}
                          className={`group relative flex flex-col items-center justify-between p-3 sm:p-3.5 rounded-2xl transition-all duration-300 text-center outline-none ${
                            isSelected
                              ? 'bg-gradient-to-b from-primary/15 via-primary/5 to-surface dark:from-primary/25 dark:via-primary/10 dark:to-surface2/60 border-2 border-primary shadow-[0_12px_28px_-6px_rgba(31,91,255,0.28)] scale-[1.02] sm:scale-[1.03] -translate-y-0.5 sm:-translate-y-1 z-10'
                              : 'bg-surface/90 dark:bg-surface2/50 hover:bg-surface dark:hover:bg-surface2/80 border border-line hover:border-primary/50 shadow-xs hover:shadow-md hover:-translate-y-1 active:scale-95'
                          }`}
                          onClick={() => handleSelectCategory(category.slug)}
                          onDoubleClick={() => handleStartRequestForCat(category.slug)}
                          aria-label={t(category.labelKey)}
                        >
                          {/* Top Selected Indicator Line */}
                          {isSelected && (
                            <div className="absolute top-0 inset-x-3 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
                          )}

                          {/* Thumbnail: Clean and clear photo without icons */}
                          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shadow-xs border border-line/70 group-hover:shadow-[0_8px_18px_rgba(31,91,255,0.2)] group-hover:scale-105 transition-all duration-300">
                            <img
                              src={category.image}
                              alt={t(category.labelKey)}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-60 group-hover:opacity-10 transition-opacity" />
                          </div>

                          {/* Category Label and Pricing Tag - 2 columns gives ample room, zero truncation! */}
                          <div className="w-full text-center mt-2 min-w-0 px-1">
                            <span className="font-900 font-uber text-sm sm:text-base leading-tight text-ink block group-hover:text-primary transition-colors tracking-tight">
                              {t(category.labelKey)}
                            </span>
                            <span className="text-xs font-800 text-primary block mt-0.5 tracking-tight">
                              {t('from_price', { price: category.startingPrice || 199 })}
                            </span>
                          </div>
                        </button>
                      );
                    })}
              </div>

              {catsError && availableCategories.length === 0 && (
                <div className="section-error" role="alert">
                  <span>{t('error')}</span>
                  <button onClick={retryCategories}>{t('retry')}</button>
                </div>
              )}
            </div>

            {/* Trust Reassurance Footnote - Prominent display cards */}
            <div className="reassurance grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 mt-4 border-t border-line/70">
              <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl bg-surface border border-line shadow-xs hover:border-success/40 hover:shadow-sm transition-all group">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-success/15 text-success flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <BadgeCheck className="w-5 h-5 text-success" />
                </div>
                <div className="min-w-0">
                  <span className="text-[13px] sm:text-sm font-900 font-uber text-ink block leading-tight tracking-tight">
                    {t('verified_pros')}
                  </span>
                  <span className="text-[11px] text-muted font-600 block leading-tight truncate mt-0.5">
                    {t('verified_pros_hint')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl bg-surface border border-line shadow-xs hover:border-primary/40 hover:shadow-sm transition-all group">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Clock3 className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <span className="text-[13px] sm:text-sm font-900 font-uber text-ink block leading-tight tracking-tight">
                    {t('matching_speed')}
                  </span>
                  <span className="text-[11px] text-muted font-600 block leading-tight truncate mt-0.5">
                    {t('matching_speed_hint')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl bg-surface border border-line shadow-xs hover:border-accent/40 hover:shadow-sm transition-all group">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5 text-accent" />
                </div>
                <div className="min-w-0">
                  <span className="text-[13px] sm:text-sm font-900 font-uber text-ink block leading-tight tracking-tight">
                    {t('fair_counter')}
                  </span>
                  <span className="text-[11px] text-muted font-600 block leading-tight truncate mt-0.5">
                    {t('fair_counter_hint')}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 4 Instant Fix Packages (2x2 Grid) */}
          <section className="bg-surface border border-line rounded-card shadow-card p-4 space-y-3 scroll-reveal">
            <div className="flex items-center justify-between pb-1">
              <h2 className="font-uber text-base sm:text-lg text-ink tracking-tight">
                {t('popular_instant_fixes')}
              </h2>
            </div>

            {/* 2x2 Grid of 4 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {INSTANT_FIX_PACKAGES.map((pkg, idx) => (
                <div
                  key={pkg.id}
                  onClick={() => {
                    navigate(`/request/new?category=${pkg.category}`, {
                      state: {
                        description: t(pkg.descKey),
                        category: pkg.category,
                        urgency: 'now',
                        budget_hint: pkg.price,
                      },
                    });
                  }}
                  role="button"
                  tabIndex={0}
                  className={`group p-3 rounded-2xl bg-surface2/60 hover:bg-surface border border-line hover:border-primary/50 transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-md hover:scale-[1.01] scroll-reveal scroll-reveal-delay-${idx + 1}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-line/60 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={pkg.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-800 text-ink group-hover:text-primary transition-colors line-clamp-1">
                        {t(pkg.titleKey)}
                      </h3>
                      <p className="text-[11px] text-muted line-clamp-1 mt-0.5">
                        {t(pkg.descKey)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-line/60 text-xs">
                    <div className="flex items-center gap-1.5 font-800 text-ink">
                      <span className="font-uber text-sm">₹{pkg.price}</span>
                      <span className="text-[10px] text-muted font-700 bg-surface px-1.5 py-0.5 rounded border border-line">
                        {t('eta_badge', { eta: pkg.eta })}
                      </span>
                    </div>
                    <span className="text-[11px] font-800 text-primary flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      {t('book_now')} <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust & Direct Guarantee Footnote */}
            <div className="p-2.5 rounded-xl bg-primary-soft/40 border border-primary/20 flex items-center justify-between text-xs text-primary font-700">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span className="text-[11px]">{t('damage_protection')}</span>
              </div>
              <span className="text-[10px] bg-primary text-onprimary font-800 px-2 py-0.5 rounded-full">
                {t('guaranteed')}
              </span>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Live Chennai Radar Map & Nearby Active Workers */}
        <aside className="home-secondary-column space-y-4">
          <section className="nearby-section scroll-reveal" data-name="nearby workers">
            {/* Section Header with Locality & View Toggle */}
            <div className="section-heading flex items-center justify-between pb-2 border-b border-line">
              <div className="flex items-center gap-2">
                <h2 className="font-uber text-base sm:text-lg text-ink tracking-tight">{t('home_available')}</h2>
              </div>

              {/* View Switcher: Map vs List */}
              <div className="flex items-center bg-surface2 p-0.5 rounded-full border border-line text-xs">
                <button
                  onClick={() => setRightViewMode('both')}
                  className={`px-2.5 py-1 rounded-full font-700 transition ${
                    rightViewMode === 'both' ? 'bg-primary text-onprimary shadow-sm' : 'text-muted hover:text-ink'
                  }`}
                >
                  {t('all_pros')}
                </button>
                <button
                  onClick={() => setRightViewMode('map')}
                  className={`px-2.5 py-1 rounded-full font-700 flex items-center gap-1 transition ${
                    rightViewMode === 'map' ? 'bg-primary text-onprimary shadow-sm' : 'text-muted hover:text-ink'
                  }`}
                >
                  <MapIcon className="w-3 h-3" />
                  <span>{t('map_view')}</span>
                </button>
                <button
                  onClick={() => setRightViewMode('cards')}
                  className={`px-2.5 py-1 rounded-full font-700 flex items-center gap-1 transition ${
                    rightViewMode === 'cards' ? 'bg-primary text-onprimary shadow-sm' : 'text-muted hover:text-ink'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>{t('pros_view')}</span>
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
                  workers={allMapEntities}
                  selectedCategory={railCat}
                />
              </div>
            )}

            {/* Pro Source Switcher: All / Google Places Live / Blink'em Pros */}
            <div className="flex items-center gap-1.5 my-2.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setProSourceTab('all')}
                className={`px-3 py-1 rounded-full font-800 text-[11px] transition ${
                  proSourceTab === 'all'
                    ? 'bg-ink text-surface shadow-xs'
                    : 'bg-surface2 text-muted hover:text-ink border border-line'
                }`}
              >
                {t('all_pros')} ({(workers?.length || 0) + realPlaces.length})
              </button>
              <button
                onClick={() => setProSourceTab('google')}
                className={`px-3 py-1 rounded-full font-800 text-[11px] flex items-center gap-1 transition ${
                  proSourceTab === 'google'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-surface2 text-muted hover:text-ink border border-line'
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                <span>{t('google_places_live')} ({safeRealPlaces.length})</span>
              </button>
              <button
                onClick={() => setProSourceTab('blinkem')}
                className={`px-3 py-1 rounded-full font-800 text-[11px] transition ${
                  proSourceTab === 'blinkem'
                    ? 'bg-primary text-onprimary shadow-xs'
                    : 'bg-surface2 text-muted hover:text-ink border border-line'
                }`}
              >
                {t('blinkem_pros')} ({safeWorkers.length})
              </button>
            </div>

            {/* Nearby Verified Pros Rail / Grid (Shown in 'both' and 'cards' modes) */}
            {(rightViewMode === 'both' || rightViewMode === 'cards') && (
              <div className="space-y-3">
                {workersLoading && !safeRealPlaces.length ? (
                  <div className="worker-rail" aria-label={t('loading')}>
                    <Skeleton className="worker-skeleton" />
                    <Skeleton className="worker-skeleton" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Render Real Google Places (When tab is 'all' or 'google') */}
                    {(proSourceTab === 'all' || proSourceTab === 'google') && safeRealPlaces.length > 0 && (
                      <div className="space-y-2">
                        {proSourceTab === 'all' && (
                          <div className="flex items-center justify-between text-xs font-800 text-muted px-1">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {t('real_places_nearby')}
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              {t('verified_directory')}
                            </span>
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {safeRealPlaces.map((place, idx) => (
                            <RealPlacesCard key={`place-${idx}-${place.name}`} place={place} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Render Blink'em Pros (When tab is 'all' or 'blinkem') */}
                    {(proSourceTab === 'all' || proSourceTab === 'blinkem') && (
                      <div className="space-y-2">
                        {proSourceTab === 'all' && safeWorkers.length > 0 && (
                          <div className="flex items-center justify-between text-xs font-800 text-muted px-1 mt-2">
                            <span>{t('instant_dispatch_pros')}</span>
                            <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              {t('online_dispatch')}
                            </span>
                          </div>
                        )}
                        {safeWorkers.length ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" data-name="nearby worker rail">
                            {safeWorkers.map((worker) => (
                              <WorkerCard key={worker.id} worker={worker} compact />
                            ))}
                          </div>
                        ) : proSourceTab === 'blinkem' ? (
                          <Card className="empty-workers">
                            <div className="empty-icon">
                              <Clock3 className="h-5 w-5" />
                            </div>
                            <p>{t('home_none_online')}</p>
                            <Button variant="secondary" size="sm" onClick={() => navigate('/request/new')}>
                              {t('home_create_request')}
                            </Button>
                          </Card>
                        ) : null}
                      </div>
                    )}
                  </div>
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

          {bookingsError && activeBooking && (
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
