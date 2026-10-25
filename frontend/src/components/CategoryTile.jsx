export default function CategoryTile({ cat, onSelect, className }) {
  return (
    <button
      onClick={() => onSelect && onSelect(cat)}
      className={`aspect-[1/1.05] bg-surface border border-line rounded-card flex flex-col items-center gap-2 p-3 hover:bg-soft transition touch-manipulation ${className || ''}`}
      aria-label={cat.label || cat.name || cat}
    >
      <div className="w-12 h-12 rounded-full bg-soft text-primary flex items-center justify-center">{cat.icon || '•'}</div>
      <span className="text-[12px] font-600 text-ink text-center leading-none">{cat.label || cat.name || cat}</span>
    </button>
  );
}
