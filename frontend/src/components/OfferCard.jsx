import { ShieldCheck, Wrench, Star, MapPin, Clock, IndianRupee } from 'lucide-react';
import { t } from '../i18n';
import Button from './Button';
import Chip from './Chip';

export default function OfferCard({ offer, onBook, onCounter, bookingLoading }) {
  const worker = offer.worker || {};
  const isCountered = offer.status === 'countered';
  const fairTone = offer.fair_label === 'fair' ? 'success' : offer.fair_label === 'high' ? 'warning' : 'neutral';

  return (
    <div className="bg-surface border border-line rounded-card shadow-card p-4 flex flex-col gap-3 transition">
      {/* Top row: Avatar + Name + Badges + Rating */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-700 text-sm shrink-0 text-onprimary shadow-sm"
            style={{ backgroundColor: worker.avatar_color || 'var(--primary)' }}
          >
            {worker.name ? worker.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'W'}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-700 text-ink text-base leading-tight">{worker.name}</span>
              {worker.id_verified && (
                <span title={t('badge.id')} className="inline-flex items-center text-success">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              )}
              {worker.skill_verified && (
                <span title={t('badge.skill')} className="inline-flex items-center text-success">
                  <Wrench className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted mt-0.5">
              <div className="flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                <span className="font-700 text-ink">{worker.rating_avg || '5.0'}</span>
                <span>({worker.rating_count || worker.jobs_done || 0})</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                <span>{worker.area_name || 'Nearby'}</span>
                {worker.distance_km !== undefined && (
                  <span>· {worker.distance_km} km</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Price & Fair Tag */}
        <div className="text-right shrink-0">
          <div className="text-xl font-800 text-primary flex items-center justify-end">
            <IndianRupee className="w-4 h-4" />
            <span>{isCountered ? offer.counter_price : offer.price}</span>
          </div>
          {offer.fair_label && (
            <Chip tone={fairTone} className="h-5 px-1.5 text-[10px]">
              {t(`fair.${offer.fair_label}`) || offer.fair_label}
            </Chip>
          )}
        </div>
      </div>

      {/* ETA and urgency info */}
      <div className="flex items-center gap-2 flex-wrap">
        <Chip tone="accent" className="h-6 px-2 text-xs flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{t('eta.arrives', { n: offer.eta_min })}</span>
        </Chip>
        {offer.eta_min <= 30 && (
          <Chip tone="success" className="h-6 px-2 text-[11px] font-700">
            Within 30 min
          </Chip>
        )}
        {isCountered && (
          <Chip tone="warning" className="h-6 px-2 text-[11px]">
            Counter sent: ₹{offer.counter_price}
          </Chip>
        )}
      </div>

      {/* Action buttons */}
      <div className="pt-1 border-t border-line flex items-center gap-2">
        {isCountered ? (
          <div className="text-xs text-muted flex-1 py-1 italic">
            Waiting for {worker.name} to accept your offer of ₹{offer.counter_price}…
          </div>
        ) : (
          <>
            {offer.rounds === 0 && onCounter && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onCounter(offer)}
                className="flex-1 text-xs"
              >
                {t('offer.counter')}
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              loading={bookingLoading}
              onClick={() => onBook(offer)}
              className="flex-1 font-700"
            >
              {t('offer.book')} · ₹{offer.price}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
