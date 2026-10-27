import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, X, Clock, RefreshCw, Calendar } from 'lucide-react';
import { api } from '../../api';
import { t } from '../../i18n';
import usePolling from '../../hooks/usePolling';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Chip from '../../components/Chip';

export default function Searching() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cancelling, setCancelling] = useState(false);

  const { data: request, error, loading } = usePolling(
    () => api.get(`/requests/${id}`),
    2000,
    true
  );

  useEffect(() => {
    if (!request) return;
    // If offers already arrived, auto-navigate to offers page
    if (request.offers && request.offers.length > 0) {
      navigate(`/request/${id}/offers`, { replace: true });
    } else if (request.booking_id) {
      navigate(`/booking/${request.booking_id}`, { replace: true });
    }
  }, [request, id, navigate]);

  const handleCancel = async () => {
    try {
      setCancelling(true);
      await api.post(`/requests/${id}/cancel`);
      navigate('/', { replace: true });
    } catch (err) {
      console.error(err);
      navigate('/', { replace: true });
    } finally {
      setCancelling(false);
    }
  };

  const matchedCount = request?.matched_count ?? 4;
  const nearestEta = request?.nearest_eta_min ?? 9;

  return (
    <div className="max-w-xl mx-auto w-full flex flex-col items-center justify-between min-h-[calc(100vh-140px)] py-6 text-center">
      {/* Top info badge */}
      <div className="w-full flex items-center justify-between px-2">
        <Chip tone="primary" className="h-7 px-3 text-xs font-700">
          {request?.category ? t(`cat.${request.category}`) : 'Request'} #{id}
        </Chip>
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="text-xs font-600 text-muted hover:text-danger flex items-center gap-1 p-2 rounded-full hover:bg-surface2 transition"
        >
          <X className="w-4 h-4" />
          <span>{t('cancel')}</span>
        </button>
      </div>

      {/* Radar Animation Area */}
      <div className="relative my-8 flex items-center justify-center">
        {/* Outer expanding rings */}
        <div className="w-64 h-64 rounded-full border border-primary/20 bg-primary/5 animate-pulseRing absolute" />
        <div
          className="w-48 h-48 rounded-full border border-primary/30 bg-primary/10 animate-pulseRing absolute"
          style={{ animationDelay: '0.5s' }}
        />
        <div
          className="w-32 h-32 rounded-full border border-primary/40 bg-primary/15 animate-pulseRing absolute"
          style={{ animationDelay: '1s' }}
        />

        {/* Center pin container */}
        <div className="relative z-10 w-20 h-20 rounded-full bg-primary flex items-center justify-center text-onprimary shadow-card ring-8 ring-primary/20">
          <MapPin className="w-8 h-8 animate-bounce" />
        </div>
      </div>

      {/* Headings & Status */}
      <div className="space-y-3 max-w-sm px-4">
        <h2 className="text-2xl font-800 text-ink tracking-tight">
          {t('search.title')}
        </h2>
        
        {matchedCount > 0 ? (
          <div className="space-y-2">
            <p className="text-muted text-sm">
              We notified {matchedCount} nearby {request?.category || 'workers'}. Quotes usually arrive in seconds.
            </p>
            <div className="flex items-center justify-center gap-2">
              <Chip tone="accent" className="h-6 px-2.5 text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Nearest ~{nearestEta} min</span>
              </Chip>
              <Chip tone="neutral" className="h-6 px-2.5 text-xs">
                {request?.address || 'T. Nagar'}
              </Chip>
            </div>
          </div>
        ) : (
          <div className="bg-surface border border-line rounded-card p-4 space-y-3 mt-4">
            <p className="text-sm text-ink font-600">
              No workers are online in your area right now.
            </p>
            <p className="text-xs text-muted">
              You can schedule this service for a later time or try again in a few minutes.
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/request/new?category=${request?.category || ''}`)}
                className="flex-1 text-xs"
              >
                <Calendar className="w-3.5 h-3.5 mr-1" />
                Schedule
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.location.reload()}
                className="flex-1 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                {t('retry')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom hint */}
      <div className="text-xs text-muted pt-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-success animate-ping" />
        <span>Live dispatching nearby · Average response &lt;10s</span>
      </div>
    </div>
  );
}
