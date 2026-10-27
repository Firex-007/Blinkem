import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, User, Building2, ShieldCheck, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';

const MODES = [
  {
    role: 'customer',
    labelKey: 'role_customer',
    descKey: 'role_customer_desc',
    path: '/',
    icon: User,
    color: 'text-primary bg-primary-soft',
  },
  {
    role: 'worker',
    labelKey: 'role_worker',
    descKey: 'role_worker_desc',
    path: '/worker',
    icon: ShieldCheck,
    color: 'text-success bg-success-soft',
  },
  {
    role: 'admin',
    labelKey: 'role_admin',
    descKey: 'role_admin_desc',
    path: '/admin',
    icon: Building2,
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-950 dark:text-purple-300',
  },
];

export default function RoleSwitcher({ className }) {
  const { role, setRole } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const current = MODES.find((m) => m.role === role) || MODES[0];
  const CurrentIcon = current.icon;
  const currentLabel = t(current.labelKey);

  const handleSelectMode = (mode) => {
    setRole(mode.role);
    setOpen(false);
    navigate(mode.path);
  };

  return (
    <div className={`relative inline-block ${className || ''}`}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill text-ink hover:border-primary transition shadow-sm"
        aria-label="Switch Mode"
      >
        <span className={`w-5 h-5 rounded-full flex items-center justify-center ${current.color} shadow-xs`}>
          <CurrentIcon className="w-3 h-3" />
        </span>
        <span className="text-xs font-800">{currentLabel}</span>
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
            {MODES.map((m) => {
              const isSelected = m.role === role;
              const Icon = m.icon;
              const rLabel = t(m.labelKey);
              const rDesc = t(m.descKey);
              return (
                <button
                  key={m.role}
                  onClick={() => handleSelectMode(m)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-chip transition ${
                    isSelected
                      ? 'bg-primary-soft/60 text-ink font-700 border border-primary/20'
                      : 'hover:bg-surface2 text-muted hover:text-ink'
                  }`}
                  aria-label={`Switch to ${rLabel}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-700 block text-ink">{rLabel}</span>
                    <span className="text-[10px] text-muted block line-clamp-1">{rDesc}</span>
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
