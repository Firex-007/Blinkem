import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { t } from '../../i18n';
import CategoryTile from '../../components/CategoryTile';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { Mic, Search, MapPin } from 'lucide-react';

const CATEGORIES = [
  { key: 'plumber', label: t('plumber'), icon: <MapPin className="w-6 h-6" /> },
  { key: 'electrician', label: t('electrician'), icon: <Search className="w-6 h-6" /> },
  { key: 'cleaner', label: t('cleaner'), icon: <Mic className="w-6 h-6" /> },
  { key: 'cook', label: t('cook'), icon: <MapPin className="w-6 h-6" /> },
  { key: 'painter', label: t('painter'), icon: <Search className="w-6 h-6" /> },
];

export default function Home() {
  const { lang, setLang } = useApp();
  const [active, setActive] = useState(null);
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start gap-1">
        <h1 className="text-[28px] font-800 tracking-[-0.02em] text-ink">{t('home_headline')}</h1>
        <p className="text-muted text-[15px]">{t('home_sub')}</p>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="px-3 py-2 rounded-chip bg-surface border border-line text-sm text-ink outline-none"
          aria-label="Language"
        >
          <option value="en">{t('en')}</option>
          <option value="ta">{t('ta')}</option>
          <option value="hi">{t('hi')}</option>
        </select>
        <button className="p-2 rounded-full bg-primary-soft text-primary" aria-label="Voice search" title="Voice search">
          <Mic className="w-5 h-5" />
        </button>
      </div>
      <Card>
        <div className="grid grid-cols-3 gap-3">
          {CATEGORIES.map((c) => (
            <CategoryTile key={c.key} cat={c} onSelect={(cat) => setActive(cat.key)} />
          ))}
        </div>
      </Card>
      {active && (
        <Card className="bg-soft">
          <div className="flex items-center gap-3">
            <span className="text-primary font-700">{active}</span>
            <span className="text-muted text-sm">{t('find_workers')}</span>
          </div>
          <Button full variant="primary" className="mt-3">{t('book_now')}</Button>
        </Card>
      )}
    </div>
  );
}
