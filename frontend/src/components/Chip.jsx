export default function Chip({ children, tone = 'neutral', icon, className }) {
  const tones = {
    neutral: 'bg-surface2 text-muted border border-line',
    primary: 'bg-soft text-primary',
    success: 'bg-successsoft text-success',
    accent: 'bg-accent text-onaccent',
    danger: 'bg-dangersoft text-danger',
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[12px] font-600 ${tones} ${className || ''}`}>
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
}
