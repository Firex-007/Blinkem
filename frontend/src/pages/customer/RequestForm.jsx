import { useState } from 'react';
import { MapPin, Clock, Send, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api';
import { t } from '../i18n';
import Button from '../components/Button';
import Card from '../components/Card';
import Chip from '../components/Chip';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SERVICES = [
  { slug: 'plumber', label: 'cat.plumber' },
  { slug: 'electrician', label: 'cat.electrician' },
  { slug: 'cleaner', label: 'cat.cleaner' },
  { slug: 'carpenter', label: 'cat.carpenter' },
  { slug: 'painter', label: 'cat.painter' },
  { slug: 'ac_repair', label: 'cat.ac_repair' },
  { slug: 'cook', label: 'cat.cook' },
  { slug: 'appliance_repair', label: 'cat.appliance_repair' },
];

export default function RequestForm() {
  const { userId } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(searchParams.get('category') || 'plumber');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('now');
  const [address, setAddress] = useState('T. Nagar, Chennai');
  const [budget, setBudget] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  const valid = category && description.length >= 5 && address;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    if (!valid) { setErr(t('req.validate')); return; }
    setSubmitting(true);
    try {
      const res = await api.post('/requests', {
        category, description, lat: 13.0418, lng: 80.2341, address,
        urgency, scheduled_at: null,
        budget_hint: budget ? parseInt(budget, 10) : null,
        voice_transcript: null,
      });
      navigate(`/request/${res.id}/searching`);
    } catch (e) {
      setErr(e.message || t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm font-700 text-primary">
        <ChevronLeft className="w-4 h-4" /> {t('back')}
      </button>
      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted mb-1">{t('req.service')}</label>
            <div className="flex flex-wrap gap-2">
              {SERVICES.map((s) => (
                <button
                  key={s.slug}
                  onClick={() => setCategory(s.slug)}
                  className={`px-3 py-2 rounded-chip text-sm font-600 border transition ${category === s.slug ? 'bg-primary text-onprimary border-primary' : 'bg-surface text-ink border-line'}`}
                >
                  {t(s.label)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">{t('req.problem')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-chip bg-surface border border-line text-sm text-ink outline-none focus:border-primary"
              placeholder={t('req.problem_placeholder')}
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">{t('req.urgency')}</label>
            <div className="flex gap-2">
              {['now', 'scheduled'].map((u) => (
                <button
                  key={u}
                  onClick={() => setUrgency(u)}
                  className={`flex-1 py-2 rounded-chip text-sm font-600 border transition ${urgency === u ? 'bg-primary text-onprimary border-primary' : 'bg-surface text-ink border-line'}`}
                >
                  {u === 'now' ? t('req.now') : t('req.schedule')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">{t('req.address')}</label>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted shrink-0" />
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex-1 px-3 py-2 rounded-chip bg-surface border border-line text-sm text-ink outline-none focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">{t('req.budget')}</label>
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                inputMode="numeric"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="px-3 py-2 rounded-chip bg-surface border border-line text-sm text-ink outline-none focus:border-primary w-24"
                placeholder="₹"
              />
              <span className="text-xs text-muted">/visit</span>
            </div>
          </div>
          {err && (
            <div className="p-2 rounded-chip bg-dangersoft text-danger text-xs">{err}</div>
          )}
        </div>
      </Card>
      <Button full variant="primary" loading={submitting} disabled={!valid || submitting} onClick={handleSubmit} className="fixed bottom-4 left-4 right-4 w-auto">
        {t('req.find')}
      </Button>
    </div>
  );
}
