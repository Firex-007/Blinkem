import { Mic } from 'lucide-react';

export default function VoiceSheet({ open, onClose, onResult }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} aria-hidden="true" />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] rounded-t-[28px] bg-surface border-t border-l border-r border-line shadow-card z-50 p-6 animate-slideUp">
        <div className="flex items-center justify-between mb-3">
          <span className="font-700 text-ink">Voice request</span>
          <button onClick={onClose} className="p-1 rounded-full text-muted hover:bg-surface2" aria-label="Close">✕</button>
        </div>
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <button onClick={() => onResult && onResult({ category: 'plumber', transcript: 'Water leak', urgency: 'now' })} className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-onprimary shadow-card">
              <Mic className="w-10 h-10" />
            </button>
            <span className="absolute -top-3 -left-3 bg-accent text-onaccent text-[10px] font-700 rounded-full px-2 py-0.5">Tap to speak</span>
          </div>
          <p className="text-muted text-sm">Tell us what needs fixing — in Tamil, Hindi or English.</p>
        </div>
      </div>
    </>
  );
}
