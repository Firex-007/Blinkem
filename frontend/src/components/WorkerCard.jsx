import { ShieldCheck, Star, MapPin, Clock, Wrench } from 'lucide-react';

export default function WorkerCard({ worker, compact = true }) {
  const badges = [];
  if (worker.id_verified) badges.push(<ShieldCheck key="id" className="w-3 h-3 text-success" />);
  if (worker.skill_verified) badges.push(<Wrench key="skill" className="w-3 h-3 text-success" />);

  const style = compact
    ? 'w-44 flex flex-col gap-2 p-3'
    : 'flex flex-col gap-2';

  return (
    <div className={`bg-surface border border-line rounded-card shadow-sm2 p-3 ${style}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="w-12 h-12 rounded-full bg-soft text-primary flex items-center justify-center shrink-0 font-700 text-xs">
          {worker.name ? worker.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'W'}
        </div>
        <div className="flex gap-1">{badges}</div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-700 text-ink text-sm leading-tight">{worker.name}</span>
        <span className="text-muted text-[11px] ml-auto">{worker.rating_avg}</span>
        <Star className="w-3 h-3 fill-yellow-400 text-accent" />
      </div>
      <div className="flex items-center gap-1 text-muted text-[11px]">
        <MapPin className="w-3 h-3" />
        <span>{worker.area_name} · {worker.distance_km !== undefined ? worker.distance_km + ' km' : ''}</span>
      </div>
      <div className="flex items-center justify-between text-xs text-muted mt-1">
        <span>₹{worker.base_rate} / {worker.rate_unit}</span>
        <Chip tone="accent" className="h-5 px-2 text-[10px]">{worker.is_online ? 'Online' : 'Offline'}</Chip>
      </div>
    </div>
  );
}

function Chip({ children, tone = 'neutral', className }) {
  const tones = { neutral: 'bg-surface2 text-muted', primary: 'bg-soft text-primary', success: 'bg-successsoft text-success', accent: 'bg-accent text-onaccent', danger: 'bg-dangersoft text-danger' }[tone] || '';
  return <span className={`inline-flex items-center h-6 px-2 rounded-full text-[10px] font-600 ${tones} ${className || ''}`}>{children}</span>;
}
