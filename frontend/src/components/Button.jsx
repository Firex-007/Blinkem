import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({ children, variant = 'primary', size, loading, full, onClick, disabled, className }) {
  const base = 'inline-flex items-center justify-center gap-2 font-700 transition-active active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none';
  const vars = {
    primary: 'bg-primary text-onprimary h-12 rounded-[14px] px-4',
    secondary: 'bg-soft text-primary h-12 rounded-[14px] px-4 border border-line',
    ghost: 'text-primary h-12 rounded-[14px] px-4',
    danger: 'bg-danger text-onprimary h-12 rounded-[14px] px-4',
  }[variant];
  const s = size === 'sm' ? 'h-8 text-xs px-3' : size === 'lg' ? 'h-14 text-lg px-6' : '';
  const f = full ? 'w-full' : '';
  return (
    <button
      className={`${base} ${vars} ${s} ${f} ${className || ''}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
