import { useState } from 'react';
import { MapPin, Mic, Zap, Clock, ShieldCheck, IndianRupee, Wrench, Sparkles, Paintbrush, Hammer, CookingPot } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api';
import { t } from '../../i18n';
import usePolling from '../../hooks/usePolling';
import CategoryTile from '../../components/CategoryTile';
import WorkerCard from '../../components/WorkerCard';
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
  const { userId, setUserId } = useApp();
  const navigate = useNavigate();
  const [railCat, setRailCat] = useState('plumber');
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);

  const { data: categories, loading: catsLoading } = usePolling(
    () => api.get('/categories'), 3000, true
  );
  const { data: workers, loading: railLoading } = usePolling(
    () => api.get(`/nearby-workers?category=${railCat}&lat=13.0418&lng=80.2341`), 3000, true
  );
  const { data: bookings } = usePolling(
    () => api.get('/bookings'), 3000, true
  );

  // find an active confirmed/in_progress booking for the floating bar
  const active = (bookings || []).find((b) => b.status === 'confirmed' || b.status === 'in_progress');
  if (active && !activeBooking) setActiveBooking(active);

  const handleCategory = (slug) => navigate(`/request/new?category=${slug}`);
  const handleVoiceResult = (res) => {
    setVoiceOpen(false);
    navigate(`/request/new?category=${res.category || 'plumber'}`);
  };

  return (
    <div className="space-y-4">
      {/* Headline */}
      <div className="flex flex-col items-start gap-1">
        <h1 className="text-[28px] font-800 tracking-[-0.02em] text-ink">{t('app.tagline')}</h1>
        <Chip tone="accent" className="h-7 px-2 text-xs flex items-center gap-1">
          <Clock className="w-3 h-3" /> <span>~18 min avg arrival</span>
        </Chip>
      </div>

      {/* Hero voice/search card */}
      <Card className="relative overflow-hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Mic className="w-4 h-4 text-primary" />
              <span className="font-700 text-ink text-sm">{t('home.search')}</span>
            </div>
            <p className="text-muted text-[13px]">{t('home.speak')}</p>
          </div>
          <button
            onClick={() => setVoiceOpen(true)}
            className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-onprimary shadow-card"
            aria-label="Voice search"
          >
            <Mic className="w-6 h-6" />
          </button>
        </div>
      </Card>

      {/* Category grid */}
      <div className="flex items-center gap-2">
        <span className="font-700 text-ink text-sm">{t('home.what')}</span>
        <span className="h-4 w-px bg-line mx-2" />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {GRID.map((g) => (
          <CategoryTile
            key={g.slug}
            cat={{ label: t(g.labelKey), icon: g.icon }}
            onSelect={() => handleCategory(g.slug)}
          />
        ))}
      </div>

      {/* Available near you rail */}
      <div className="flex items-center gap-2 mb-1">
        <span className="font-700 text-ink text-sm">{t('home.available')}</span>
        <Chip tone="primary" className="h-5 px-2 text-[10px]">{railCat}</Chip>
        {['plumber', 'electrician', 'cleaner', 'carpenter', 'painter'].map((c) => (
          <button
            key={c}
            onClick={() => setRailCat(c)}
            className={`text-xs font-600 px-2 py-1 rounded-chip transition ${railCat === c ? 'bg-primary text-onprimary' : 'text-muted hover:bg-surface2'}`}
          >
            {t(`cat.${c}`)}
          </button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {railLoading ? (
          [0, 1, 2, 3].map((i) => (
            <div key={i} className="w-44 h-40 bg-surface2 rounded-card animate-shimmer" />
          ))
        ) : workers && workers.length > 0 ? (
          workers.map((w) => <WorkerCard key={w.id} worker={w} compact />)
        ) : (
          <div className="w-44 flex flex-col items-center gap-2 p-3 text-center text-muted text-xs">
            <Chip tone="neutral">—</Chip>
            <span>{t('home.none_online')}</span>
          </div>
        )}
      </div>

      {/* Trust chips */}
      <div className="flex items-center gap-2 px-1">
        <Chip tone="success" className="h-6 px-2 text-xs flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> <span>{t('badge.id')}</span>
        </Chip>
        <Chip tone="primary" className="h-6 px-2 text-xs flex items-center gap-1">
          <Zap className="w-3 h-3" /> <span>{t('home.fast')}</span>
        </Chip>
        <Chip tone="neutral" className="h-6 px-2 text-xs flex items-center gap-1">
          <IndianRupee className="w-3 h-3" /> <span>{t('home.your_price')}</span>
        </Chip>
      </div>

      {voiceOpen && <VoiceSheet open={voiceOpen} onClose={() => setVoiceOpen(false)} onResult={handleVoiceResult} />}
      <div className="fixed bottom-4 left-4 right-4 w-auto">
        <FloatingBookingBarPlaceholder booking={activeBooking} onTap={() => navigate(`/booking/${activeBooking.id}`)} />
      </div>
    </div>
  );
}

function FloatingBookingBarPlaceholder({ booking, onTap }) {
  if (!booking) return null;
  return (
    <div className="fixed bottom-20 left-4 right-4 w-auto mx-auto max-w-[480px] rounded-2xl bg-primary text-onprimary shadow-card p-4 flex items-center gap-3 cursor-pointer z-40" onClick={onTap} role="button" tabIndex={0} aria-label="Floating booking bar">
      <div className="w-10 h-10 rounded-full bg-onprimary/20 flex items-center justify-center text-onprimary flex-shrink-0">
        <MapPin className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1">
          <span className="font-700 text-sm">{booking.worker?.name || 'Worker'}</span>
          <span className="text-xs opacity-80">{t('home.on_the_way')}</span>
        </div>
        <div className="text-xs opacity-80 mt-0.5">{booking.eta_min} min · ₹{booking.agreed_price}</div>
      </div>
      <div className="text-xs font-700 opacity-90">{booking.status}</div>
    </div>
  );
}
