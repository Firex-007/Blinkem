import { useState } from 'react';

export default function BottomSheet({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] rounded-t-[28px] bg-surface border-t border-l border-r border-line shadow-card z-50 p-4 pb-8 animate-slideUp">
        <div className="flex items-center justify-between mb-4">
          <span className="font-700 text-ink">{title}</span>
          <button onClick={onClose} className="p-1 rounded-full text-muted hover:bg-surface2" aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </>
  );
}
