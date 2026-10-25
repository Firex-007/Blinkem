import { BadgeCheck, MapPin, Star, Wrench } from 'lucide-react';
import { t } from '../i18n';

export default function WorkerCard({ worker, compact = true }) {
  const initials = worker.name ? worker.name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2) : 'W';
  const jobs = worker.jobs_done ?? worker.jobsDone ?? 0;
  const cardClass = compact ? 'worker-card worker-card-compact' : 'worker-card';

  return (
    <article className={cardClass} data-name="worker card">
      <div className="worker-card-top">
        <div className="worker-avatar">{initials}</div>
        <div className="worker-badges" aria-label={t('home_verified_workers')}>
          {worker.id_verified && <span className="worker-badge"><BadgeCheck className="h-3.5 w-3.5" />{t('badge_id')}</span>}
          {worker.skill_verified && <span className="worker-badge"><Wrench className="h-3.5 w-3.5" />{t('badge_skill')}</span>}
        </div>
      </div>
      <div className="worker-name">{worker.name || t('worker_tab')}</div>
      <div className="worker-meta"><Star className="h-3.5 w-3.5 fill-accent text-accent" />{worker.rating_avg || '—'} · {jobs} jobs</div>
      <div className="worker-meta"><MapPin className="h-3.5 w-3.5" />{worker.area_name || 'T. Nagar'} · {worker.distance_km ?? '—'} km</div>
      <div className="worker-card-foot"><span className="worker-price">₹{worker.base_rate} / {worker.rate_unit}</span><span className="worker-eta">{worker.eta_min ? `${worker.eta_min} min` : t('online')}</span></div>
    </article>
  );
}
