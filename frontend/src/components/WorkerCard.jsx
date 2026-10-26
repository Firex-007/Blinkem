import { useNavigate } from 'react-router-dom';
import { BadgeCheck, MapPin, Star, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { t } from '../i18n';
import { getWorkerImage } from '../utils/workerImages';

export default function WorkerCard({ worker, compact = true, onSelect }) {
  const navigate = useNavigate();
  const workerImage = getWorkerImage(worker);
  const jobs = worker.jobs_done ?? worker.jobsDone ?? 42;
  const rating = worker.rating_avg ?? worker.rating ?? 4.8;

  const handleBook = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(worker);
    } else {
      navigate(`/request/new?category=${worker.category || 'plumber'}&worker_id=${worker.id}`);
    }
  };

  return (
    <article
      className="p-3.5 rounded-2xl liquid-glass-card hover:border-primary/40 transition-all duration-200 flex flex-col justify-between group"
      data-name="worker card"
    >
      <div>
        {/* Top: Real Photo & Verified Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="relative">
            <img
              src={workerImage}
              alt={worker.name || 'Service Provider'}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-line/60 shadow-xs group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success border-2 border-surface flex items-center justify-center text-white text-[9px] shadow-xs">
              ✓
            </span>
          </div>

          <div className="flex flex-col items-end gap-1 flex-1 min-w-0">
            <div className="flex flex-wrap justify-end gap-1">
              {worker.id_verified !== false && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                  <BadgeCheck className="w-3 h-3 flex-shrink-0" />
                  ID Verified
                </span>
              )}
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-ink bg-accent px-2 py-0.5 rounded-full mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              {worker.eta_min ? `${worker.eta_min} min ETA` : 'Online Now'}
            </span>
          </div>
        </div>

        {/* Worker Name & Trade */}
        <div className="mt-2.5">
          <h4 className="font-800 text-ink text-sm sm:text-base leading-tight truncate">
            {worker.name || 'Verified Pro'}
          </h4>
          <p className="text-xs text-muted font-medium capitalize mt-0.5">
            {worker.category ? t(`cat_${worker.category}`) : 'Home Service Specialist'}
          </p>
        </div>

        {/* Rating & Jobs Done */}
        <div className="flex items-center gap-1.5 mt-2 text-xs">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
          </div>
          <span className="text-muted text-[11px] font-semibold">
            ({jobs} jobs)
          </span>
        </div>

        {/* Locality & Distance */}
        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted">
          <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="truncate">{worker.area_name || 'T. Nagar'}</span>
          <span>•</span>
          <span className="font-semibold text-ink">{worker.distance_km ?? '2.4'} km</span>
        </div>
      </div>

      {/* Bottom: Pricing & Call to Action (CTA) */}
      <div className="mt-3 pt-2.5 border-t border-line/60 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted font-medium">Standard Visit</span>
          <span className="font-900 text-sm text-ink">
            ₹{worker.base_rate || 299}
            <span className="text-[11px] font-semibold text-muted ml-0.5">/{worker.rate_unit || 'visit'}</span>
          </span>
        </div>

        {/* The Requested CTA Button */}
        <button
          onClick={handleBook}
          className="w-full py-2 px-3 rounded-xl bg-primary hover:bg-primary600 text-onprimary font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95 group/btn"
        >
          <span>Book Now</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </article>
  );
}
