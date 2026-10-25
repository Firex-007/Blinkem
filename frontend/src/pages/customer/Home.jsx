import { useState } from 'react';
import { BadgeCheck, ChefHat, ChevronDown, ChevronRight, Clock3, Hammer, Mic, Paintbrush, PlugZap, Search, Snowflake, Sparkles, Wrench, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { api } from '../../api';
import { t } from '../../i18n';
import usePolling from '../../hooks/usePolling';
import VoiceSheet from '../../components/VoiceSheet';
import WorkerCard from '../../components/WorkerCard';
import Skeleton from '../../components/Skeleton';
import Button from '../../components/Button';
import Card from '../../components/Card';

const CATEGORIES = [
  { slug: 'plumber', labelKey: 'cat_plumber', icon: Wrench },
  { slug: 'electrician', labelKey: 'cat_electrician', icon: Zap },
  { slug: 'cleaner', labelKey: 'cat_cleaner', icon: Sparkles },
  { slug: 'carpenter', labelKey: 'cat_carpenter', icon: Hammer },
  { slug: 'painter', labelKey: 'cat_painter', icon: Paintbrush },
  { slug: 'ac_repair', labelKey: 'cat_ac_repair', icon: Snowflake },
  { slug: 'cook', labelKey: 'cat_cook', icon: ChefHat },
  { slug: 'appliance_repair', labelKey: 'cat_appliance_repair', icon: PlugZap },
];

const FILTERS = CATEGORIES.slice(0, 5);

export default function Home() {
  const { location } = useApp();
  const navigate = useNavigate();
  const [railCat, setRailCat] = useState('plumber');
  const [voiceOpen, setVoiceOpen] = useState(false);
  const curLat = location?.lat || 13.0418;
  const curLng = location?.lng || 80.2341;
  const { data: categories, loading: catsLoading, error: catsError, refetch: retryCategories } = usePolling(() => api.get('/categories'), 4000, true);
  const { data: workers, loading: workersLoading, error: workersError, refetch: retryWorkers } = usePolling(() => api.get(`/nearby-workers?category=${railCat}&lat=${curLat}&lng=${curLng}`), 3000, true);
  const { data: bookings, error: bookingsError } = usePolling(() => api.get('/bookings'), 3000, true);
  const activeBooking = Array.isArray(bookings) ? bookings.find((booking) => booking.status === 'confirmed' || booking.status === 'in_progress') : null;
  const availableCategories = categories?.length ? CATEGORIES.filter((item) => categories.some((category) => category.slug === item.slug)) : CATEGORIES;

  const handleVoiceResult = (result) => {
    setVoiceOpen(false);
    navigate(`/request/new?category=${result.category || 'plumber'}`, { state: result });
  };

  return (
    <div className="home-page animate-fade" data-name="customer home">
      <div className="home-desktop-grid">
        <div className="home-primary-column">
          <section className="request-console" data-name="request console">
            <h1 className="home-display" data-name="request headline">{t('home_search')}</h1>
            <p className="home-helper">{t('home_speak')}</p>
            <div className="request-actions">
              <button className="voice-orb" onClick={() => setVoiceOpen(true)} aria-label={t('home_speak')}><Mic className="h-7 w-7" /></button>
              <Button variant="secondary" full onClick={() => navigate('/request/new')}><Search className="h-5 w-5" />{t('home_type_request')}</Button>
            </div>
            <div className="service-grid" data-name="service category matrix">
              {catsLoading ? CATEGORIES.map((category) => <div className="category-skeleton" key={category.slug}><Skeleton className="h-5 w-5 rounded-full" /><Skeleton className="h-4 w-16" /></div>) : availableCategories.map((category) => {
                const Icon = category.icon;
                return <button key={category.slug} className="service-choice" onClick={() => navigate(`/request/new?category=${category.slug}`)} aria-label={t(category.labelKey)}><Icon className="h-5 w-5" /><span>{t(category.labelKey)}</span></button>;
              })}
            </div>
            {catsError && <div className="section-error" role="alert"><span>{t('error')}</span><button onClick={retryCategories}>{t('retry')}</button></div>}
          </section>
        </div>

        <aside className="home-secondary-column">
          <section className="nearby-section" data-name="nearby workers">
            <div className="section-heading"><h2>{t('home_available')}</h2><button className="category-filter" onClick={() => setRailCat(railCat === 'plumber' ? 'electrician' : 'plumber')}>{t(`cat_${railCat}`)} <ChevronDown className="h-4 w-4" /></button></div>
            <div className="filter-row" aria-label={t('home_service_filter')}>
              {FILTERS.map((filter) => <button key={filter.slug} className={`filter-chip ${railCat === filter.slug ? 'is-active' : ''}`} onClick={() => setRailCat(filter.slug)}>{t(filter.labelKey)}</button>)}
            </div>
            {workersLoading ? <div className="worker-rail" aria-label={t('loading')}><Skeleton className="worker-skeleton" /><Skeleton className="worker-skeleton" /></div> : workersError ? <Card className="section-error-card"><p>{t('error')}</p><Button variant="secondary" size="sm" onClick={retryWorkers}>{t('retry')}</Button></Card> : workers?.length ? <div className="worker-rail" data-name="nearby worker rail">{workers.map((worker) => <WorkerCard key={worker.id} worker={worker} compact />)}</div> : <Card className="empty-workers"><div className="empty-icon"><Clock3 className="h-5 w-5" /></div><p>{t('home_none_online')}</p><Button variant="secondary" size="sm" onClick={() => navigate('/request/new')}>{t('home_create_request')}</Button></Card>}
            <p className="reassurance">{t('home_quote_reassurance')}</p>
          </section>
          <section className="desktop-support-panel" data-name="location support"><div className="support-icon"><BadgeCheck className="h-5 w-5" /></div><div><strong>{t('home_verified_workers')}</strong><p>{location?.name || 'T. Nagar'}, Chennai · {t('home_pay_after')}</p></div></section>
          {bookingsError && <p className="booking-refresh-warning">{t('home_booking_refresh_error')}</p>}
        </aside>
      </div>
      {voiceOpen && <VoiceSheet open={voiceOpen} onClose={() => setVoiceOpen(false)} onResult={handleVoiceResult} />}
      {activeBooking && <ActiveBookingBar booking={activeBooking} onTap={() => navigate(`/booking/${activeBooking.id}`)} />}
    </div>
  );
}

function ActiveBookingBar({ booking, onTap }) {
  return <button className="active-booking-bar" onClick={onTap} aria-label={t('home_view_booking')}><span className="booking-avatar">{booking.worker?.name?.slice(0, 2).toUpperCase() || 'W'}</span><span className="booking-copy"><strong>{booking.worker?.name || 'Worker'} {t('home_on_the_way')}</strong><span>{booking.eta_min} min · ₹{booking.agreed_price}</span></span><ChevronRight className="h-5 w-5" /></button>;
}
