import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, ChevronRight, Calendar, AlertCircle } from 'lucide-react';
import { api } from '../../api';
import { t } from '../../i18n';
import usePolling from '../../hooks/usePolling';
import Chip from '../../components/Chip';
import Skeleton from '../../components/Skeleton';
import Button from '../../components/Button';

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
    <div className="space-y-4 pb-32">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-800 text-ink tracking-tight">
          {t('bookings') || 'Your Bookings'}
        </h1>
      </div>

      {/* Segmented tabs */}
      <div className="grid grid-cols-2 p-1 bg-surface2 rounded-chip border border-line">
        <button
          onClick={() => setTab('active')}
          className={`py-2 text-xs font-700 rounded-chip transition ${
            tab === 'active'
              ? 'bg-surface text-ink shadow-sm'
              : 'text-muted hover:text-ink'
          }`}
        >
          Active ({activeBookings.length})
        </button>
        <button
          onClick={() => setTab('past')}
          className={`py-2 text-xs font-700 rounded-chip transition ${
            tab === 'past'
              ? 'bg-surface text-ink shadow-sm'
              : 'text-muted hover:text-ink'
          }`}
        >
          Past ({pastBookings.length})
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {loading && allBookings.length === 0 ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-surface border border-line rounded-card p-4">
              <Skeleton className="w-full h-full" />
            </div>
          ))
        ) : displayed.length > 0 ? (
          displayed.map((b) => {
            const counterpart = b.counterpart || {};
            const isFinished = b.status === 'completed';
            const statusTone =
              b.status === 'completed'
                ? 'success'
                : b.status === 'cancelled'
                ? 'danger'
                : 'primary';

            return (
              <div
                key={b.id}
                onClick={() =>
                  navigate(isFinished ? `/booking/${b.id}/complete` : `/booking/${b.id}`)
                }
                role="button"
                tabIndex={0}
                className="bg-surface border border-line hover:border-primary/50 rounded-card shadow-card p-4 transition cursor-pointer flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-700 text-onprimary"
                      style={{ backgroundColor: counterpart.avatar_color || 'var(--primary)' }}
                    >
                      {counterpart.name ? counterpart.name.slice(0, 2).toUpperCase() : 'W'}
                    </div>
                    <div>
                      <span className="font-700 text-sm text-ink block leading-tight">
                        {counterpart.name || 'Worker'}
                      </span>
                      <span className="text-[11px] text-muted">
                        {b.category ? t(`cat.${b.category}`) : 'Service'}
                      </span>
                    </div>
                  </div>

                  <Chip tone={statusTone} className="h-5 px-2 text-[10px] capitalize">
                    {t(`status.${b.status}`) || b.status}
                  </Chip>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-line text-xs text-muted">
                  <div className="flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{b.address || 'Chennai'}</span>
                  </div>
                  <div className="flex items-center gap-1 font-800 text-ink">
                    <span>₹{b.final_price || b.agreed_price}</span>
                    <ChevronRight className="w-4 h-4 text-muted" />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-10 text-center bg-surface border border-line rounded-card space-y-3">
            <Calendar className="w-10 h-10 text-muted mx-auto opacity-50" />
            <p className="text-sm font-700 text-ink">
              {tab === 'active' ? 'No active bookings' : 'No past bookings'}
            </p>
            <p className="text-xs text-muted">
              {tab === 'active'
                ? 'Need a plumber, electrician, or cleaner? Book in seconds.'
                : 'Your completed services will appear here.'}
            </p>
            {tab === 'active' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/')}
                className="mt-2 font-700 text-xs"
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
