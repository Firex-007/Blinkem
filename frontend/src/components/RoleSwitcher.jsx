import { useState } from 'react';
import { ChevronDown, User, Building2, ShieldCheck } from 'lucide-react';

const ROLES = [
  { id: '1', label: 'Customer', icon: <User className="w-4 h-4" /> },
  { id: '3', label: 'Worker', icon: <ShieldCheck className="w-4 h-4" /> },
  { id: '99', label: 'Admin', icon: <Building2 className="w-4 h-4" /> },
];

export default function RoleSwitcher({ className }) {
  const [open, setOpen] = useState(false);
  const current = ROLES[0];
  const pick = (id) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem('userId', String(id));
    setOpen(false);
  };
  return (
    <div className={`relative inline-block ${className || ''}`}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-surface2 text-muted border border-line hover:bg-primary hover:text-onprimary transition"
        aria-label="Switch demo role"
      >
        {current.icon}
        <span className="text-sm font-700">{current.label}</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-surface border border-line rounded-card shadow-card p-2 z-50 animate-slideUp">
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => pick(r.id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-chip hover:bg-primary-soft transition"
              aria-label={`Switch to ${r.label}`}
            >
              {r.icon}
              <span>{r.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
