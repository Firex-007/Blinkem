import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Toast({ open = true, tone = 'success', message = '', onClose }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose && onClose(), 3000);
    return () => clearTimeout(t);
  }, [open, onClose]);
  if (!open) return null;
  const tones = { success: 'bg-success text-onprimary', error: 'bg-danger text-onprimary' }[tone] || 'bg-primary text-onprimary';
  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-card shadow-card border border-line ${tones} animate-slideUp flex items-center gap-3`}>
      {message}
      <button onClick={onClose} className="ml-auto opacity-70 hover:opacity-100 transition" aria-label="Dismiss">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
