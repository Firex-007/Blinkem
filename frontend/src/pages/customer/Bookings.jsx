import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, ChevronRight, Calendar, AlertCircle, Plus, ShieldCheck, Star, ArrowRight } from 'lucide-react';
import { api } from '../../api';
import { t } from '../../i18n';
import usePolling from '../../hooks/usePolling';
import Chip from '../../components/Chip';
import Skeleton from '../../components/Skeleton';
import Button from '../../components/Button';
import { getWorkerImage } from '../../utils/workerImages';

const CATEGORY_THUMBS = {
  plumber: '/images/categories/plumber.jpg',
  electrician: '/images/categories/electrician.jpg',
  cleaner: '/images/categories/cleaner.jpg',
  carpenter: '/images/categories/carpenter.jpg',
  painter: '/images/categories/painter.jpg',
  ac_repair: '/images/categories/ac_repair.jpg',
  cook: '/images/categories/cook.jpg',
  appliance_repair: '/images/categories/appliance_repair.jpg',
};

export default function Bookings() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('active'); // 'active' | 'past'

  const { data: bookings, error, loading } = usePolling(
    () => api.get('/bookings'),
    3000,
    true
  );

  const allBookings = Array.isArray(bookings) ? bookings : [];
  const activeBookings = allBookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'in_progress'
  );
  const pastBookings = allBookings.filter(
    (b) => b.status === 'completed' || b.status === 'cancelled'
  );

  const displayed = tab === 'active' ? activeBookings : pastBookings;

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-32">
      {/* Header with Title & Quick Book CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-800 text-ink tracking-tight">
            {t('bookings') || 'Your Bookings'}
          </h1>
          <p className="text-xs text-muted mt-0.5">
            {allBookings.length} total orders placed
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/')}
          className="font-800 text-xs flex items-center gap-1 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </Button>
      </div>

      {/* Segmented tabs */}
      <div className="grid grid-cols-2 p-1 bg-surface2 rounded-chip border border-line max-w-md">
        <button
          onClick={() => setTab('active')}
          className={`py-2 text-xs font-700 rounded-chip transition flex items-center justify-center gap-1.5 ${
            tab === 'active'
              ? 'bg-surface text-ink shadow-sm'
              : 'text-muted hover:text-ink'
          }`}
        >
          <span>Active</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-800 ${
            tab === 'active' ? 'bg-primary text-onprimary' : 'bg-surface2 text-muted'
          }`}>
            {activeBookings.length}
          </span>
        </button>
        <button
          onClick={() => setTab('past')}
          className={`py-2 text-xs font-700 rounded-chip transition flex items-center justify-center gap-1.5 ${
            tab === 'past'
              ? 'bg-surface text-ink shadow-sm'
              : 'text-muted hover:text-ink'
          }`}
        >
          <span>Past</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-800 ${
            tab === 'past' ? 'bg-primary text-onprimary' : 'bg-surface2 text-muted'
          }`}>
            {pastBookings.length}
          </span>
        </button>
      </div>

      {/* Bookings List (1 col on mobile, 2 cols on desktop for ideal card proportion) */}
      <div>
        {loading && allBookings.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-surface border border-line rounded-card p-4">
                <Skeleton className="w-full h-full" />
              </div>
            ))}
          </div>
        ) : displayed.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayed.map((b) => {
              const counterpart = b.counterpart || {};
              const isFinished = b.status === 'completed';
              const statusTone =
                b.status === 'completed'
                  ? 'success'
                  : b.status === 'cancelled'
                  ? 'danger'
                  : 'primary';
              const workerPhoto = getWorkerImage(counterpart.name);
              const catThumb = CATEGORY_THUMBS[b.category] || '/images/categories/plumber.jpg';

              return (
                <div
                  key={b.id}
                  onClick={() =>
                    navigate(isFinished ? `/booking/${b.id}/complete` : `/booking/${b.id}`)
                  }
                  role="button"
                  tabIndex={0}
                  className="group bg-surface border border-line hover:border-primary/50 rounded-card shadow-card hover:shadow-lg p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3"
                >
                  {/* Top: Worker Photo & Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 shadow-xs flex-shrink-0 relative">
                        <img
                          src={workerPhoto}
                          alt={counterpart.name || 'Worker'}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-success text-white rounded-full flex items-center justify-center border border-white">
                          <ShieldCheck className="w-2.5 h-2.5" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <span className="font-800 text-sm text-ink group-hover:text-primary transition-colors block truncate leading-snug">
                          {counterpart.name || 'Home Pro'}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-4 h-4 rounded overflow-hidden flex-shrink-0">
                            <img src={catThumb} alt="" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-xs text-muted font-600 truncate">
                            {b.category ? t(`cat.${b.category}`) : 'Service'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Chip tone={statusTone} className="h-6 px-2.5 text-[10px] font-800 uppercase tracking-wider shrink-0">
                      {t(`status.${b.status}`) || b.status}
                    </Chip>
                  </div>

                  {/* Description / Problem preview */}
                  {b.description && (
                    <p className="text-xs text-muted line-clamp-1 italic bg-surface2/60 px-2 py-1 rounded border border-line/50">
                      &ldquo;{b.description}&rdquo;
                    </p>
                  )}

                  {/* Middle: OTP & Address info */}
                  <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-line/60">
                    <div className="flex items-center gap-1.5 truncate max-w-[220px]">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-muted" />
                      <span className="truncate">{b.address || 'Chennai'}</span>
                    </div>

                    {b.otp_code && !isFinished && (
                      <div className="flex items-center gap-1 bg-primary-soft text-primary font-800 px-2 py-0.5 rounded text-[11px]">
                        <span>OTP:</span>
                        <span className="tracking-widest font-mono">{b.otp_code}</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom: Price & Tracking CTA */}
                  <div className="flex items-center justify-between pt-2 border-t border-line text-xs">
                    <div>
                      <span className="text-[11px] text-muted block">Total Amount</span>
                      <span className="font-800 text-base text-ink">
                        ₹{b.final_price || b.agreed_price || b.price || b.budget_hint || 299}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-primary font-800 text-xs group-hover:translate-x-1 transition-transform">
                      <span>{isFinished ? 'View Details' : 'Track Live'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center bg-surface border border-line rounded-card space-y-3">
            <Calendar className="w-10 h-10 text-muted mx-auto opacity-50" />
            <p className="text-sm font-700 text-ink">
              {tab === 'active' ? 'No active bookings' : 'No past bookings'}
            </p>
            <p className="text-xs text-muted max-w-sm mx-auto">
              {tab === 'active'
                ? 'Need a plumber, electrician, or cleaner? Book in seconds.'
                : 'Your completed services will appear here.'}
            </p>
            {tab === 'active' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/')}
                className="mt-2 font-700 text-xs shadow-sm"
              >
                Find Services
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
