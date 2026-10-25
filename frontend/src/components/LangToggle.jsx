import { useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';

const LANGS = [{ code: 'en', label: 'EN' }, { code: 'ta', label: 'TA' }, { code: 'hi', label: 'HI' }];

export default function LangToggle({ className }) {
  const { lang, setLang } = useApp();
  const [open, setOpen] = useState(false);
  const cur = LANGS.find((l) => l.code === lang) || LANGS[0];
  return (
    <div className={`relative inline-block ${className || ''}`}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-surface2 text-muted border border-line hover:bg-primary hover:text-onprimary transition"
        aria-label="Language"
      >
        <Globe className="w-3 h-3" />
        <span className="text-xs font-700">{cur.label}</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-28 bg-surface border border-line rounded-card shadow-card p-2 z-50 animate-slideUp">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-chip hover:bg-primary-soft transition"
              aria-label={`Switch to ${l.label}`}
            >
              <span className="font-700">{l.label}</span>
              {lang === l.code && <Check className="w-3.5 h-3.5 text-primary ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
