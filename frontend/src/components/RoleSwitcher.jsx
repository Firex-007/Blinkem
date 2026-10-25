import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, User, Building2, ShieldCheck, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ROLES = [
  {
    id: '1',
    label: 'Customer',
    desc: 'Priya Sharma • Browse & book services',
    path: '/',
    image: '/images/users/priya.jpg',
  },
  {
    id: '3',
    label: 'Partner Pro',
    desc: 'Muthu K • Live jobs & send quotes',
    path: '/worker',
    image: '/images/users/muthu.jpg',
  },
  {
    id: '99',
    label: 'Operations',
    desc: 'Meera R • KYC approvals & metrics',
    path: '/admin',
    image: '/images/users/meera.jpg',
  },
];

export default function RoleSwitcher({ className }) {
  const { userId, setUserId } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const current = ROLES.find((r) => r.id === String(userId)) || ROLES[0];

  const handleSelectRole = (role) => {
    setUserId(role.id);
    setOpen(false);
    navigate(role.path);
  };

  return (
    <div className={`relative inline-block ${className || ''}`}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill text-ink hover:border-primary transition shadow-sm"
        aria-label="Switch Role"
      >
        <img
          src={current.image}
          alt={current.label}
          className="w-5 h-5 rounded-full object-cover border border-line/80 shadow-xs"
        />
        <span className="text-xs font-800">{current.label}</span>
        <ChevronDown className={`w-3 h-3 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-2 w-64 glass-card border border-line rounded-card shadow-2xl p-2 z-50 animate-slideUp">
            <div className="px-2 py-1.5 border-b border-line mb-1">
              <span className="text-[11px] font-700 text-muted uppercase tracking-wider block">
                Platform Portal
              </span>
            </div>
            {ROLES.map((r) => {
              const isSelected = r.id === String(userId);
              return (
                <button
                  key={r.id}
                  onClick={() => handleSelectRole(r)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-chip transition ${
                    isSelected
                      ? 'bg-primary-soft/60 text-ink font-700 border border-primary/20'
                      : 'hover:bg-surface2 text-muted hover:text-ink'
                  }`}
                  aria-label={`Switch to ${r.label}`}
                >
                  <img
                    src={r.image}
                    alt={r.label}
                    className="w-8 h-8 rounded-full object-cover border border-line flex-shrink-0 shadow-xs"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-700 block text-ink">{r.label}</span>
                    <span className="text-[10px] text-muted block line-clamp-1">{r.desc}</span>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-primary ml-auto flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
