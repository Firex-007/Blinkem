import { useState } from 'react';
import { MapPin, Clock, Calendar, Send, ChevronLeft, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api';
import { t } from '../../i18n';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

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
  const { userId, location: appLocation } = useApp();
  const [searchParams] = useSearchParams();
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const voiceState = routerLocation.state || {};

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const defaultAddress = appLocation
    ? `${appLocation.name}${appLocation.city ? `, ${appLocation.city}` : ''}`
    : 'Local Area';

  const [category, setCategory] = useState(voiceState.category || searchParams.get('category') || 'plumber');
  const [description, setDescription] = useState(voiceState.description || voiceState.transcript || '');
  const [urgency, setUrgency] = useState(voiceState.urgency || 'now');
  const [scheduledDate, setScheduledDate] = useState(todayStr);
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [address, setAddress] = useState(defaultAddress);
  const [budget, setBudget] = useState(voiceState.budget_hint ? String(voiceState.budget_hint) : '');
  const [voiceTranscript, setVoiceTranscript] = useState(voiceState.transcript || null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  const valid = category && description.length >= 5 && address;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    if (!valid) { setErr(t('req.validate')); return; }
    setSubmitting(true);
    try {
      const scheduledIso = urgency === 'scheduled'
        ? new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString()
        : null;

      const reqLat = appLocation?.lat || 12.9716;
      const reqLng = appLocation?.lng || 77.5946;

      const res = await api.post('/requests', {
        category, description, lat: reqLat, lng: reqLng, address,
        urgency, scheduled_at: scheduledIso,
        budget_hint: budget ? parseInt(budget, 10) : null,
        voice_transcript: voiceTranscript,
      });
      navigate(`/request/${res.id}/searching`);
    } catch (e) {
      setErr(e.message || t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-24">
      {voiceTranscript && (
        <div className="p-3 bg-soft border border-primary/20 rounded-card flex items-center gap-2 text-xs text-primary font-600 animate-slideUp">
          <Sparkles className="w-4 h-4 shrink-0 text-primary" />
          <span>Prefilled from voice: "{voiceTranscript}"</span>
        </div>
      )}
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
                  className={`flex-1 py-2.5 rounded-chip text-sm font-800 border transition flex items-center justify-center gap-1.5 ${urgency === u ? 'bg-primary text-onprimary border-primary shadow-sm' : 'bg-surface text-ink border-line hover:border-primary/40'}`}
                >
                  {u === 'now' ? (
                    <>
                      <Clock className="w-4 h-4" />
                      <span>{t('req.now')}</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>{t('req.schedule')}</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Date, Time and Calendar Picker (when Schedule is clicked) */}
          {urgency === 'scheduled' && (
            <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/25 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-800 text-primary uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Select Service Date &amp; Time Slot</span>
              </div>

              {/* Date selection: Quick pills + native date input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-700 text-muted">Service Date</label>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setScheduledDate(todayStr)}
                    className={`px-3 py-1.5 rounded-full text-xs font-800 transition ${
                      scheduledDate === todayStr
                        ? 'bg-primary text-onprimary shadow-xs'
                        : 'bg-surface text-ink border border-line hover:border-primary'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduledDate(tomorrowStr)}
                    className={`px-3 py-1.5 rounded-full text-xs font-800 transition ${
                      scheduledDate === tomorrowStr
                        ? 'bg-primary text-onprimary shadow-xs'
                        : 'bg-surface text-ink border border-line hover:border-primary'
                    }`}
                  >
                    Tomorrow
                  </button>

                  <div className="relative flex items-center min-w-[150px] flex-1">
                    <input
                      type="date"
                      min={todayStr}
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-full bg-surface border border-line text-xs font-700 text-ink outline-none focus:border-primary shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Time slot selection: Quick slots + custom time */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-[11px] font-700 text-muted">Arrival Time Slot</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Morning', time: '10:00', desc: '9 AM - 12 PM' },
                    { label: 'Afternoon', time: '13:30', desc: '12 PM - 3 PM' },
                    { label: 'Evening', time: '17:00', desc: '3 PM - 6 PM' },
                    { label: 'Night', time: '20:00', desc: '6 PM - 9 PM' },
                  ].map((slot) => (
                    <button
                      key={slot.label}
                      type="button"
                      onClick={() => setScheduledTime(slot.time)}
                      className={`p-2 rounded-xl text-left border transition ${
                        scheduledTime === slot.time
                          ? 'bg-primary text-onprimary border-primary shadow-xs'
                          : 'bg-surface text-ink border-line hover:border-primary/50'
                      }`}
                    >
                      <span className="block text-xs font-800 leading-tight">{slot.label}</span>
                      <span className={`block text-[10px] mt-0.5 ${scheduledTime === slot.time ? 'text-onprimary/80' : 'text-muted'}`}>
                        {slot.desc}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className="text-muted font-600">Custom Time:</span>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="px-3 py-1 rounded-lg bg-surface border border-line font-700 text-ink text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

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
            <div className="flex items-center gap-2">
              <div className="relative flex items-center w-36">
                <span className="absolute left-3 text-sm font-800 text-ink">₹</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-chip bg-surface border border-line text-sm font-bold text-ink outline-none focus:border-primary"
                  placeholder="299"
                />
              </div>
              <span className="text-xs text-muted font-600">/visit standard</span>
            </div>
          </div>
          {err && (
            <div className="p-2 rounded-chip bg-dangersoft text-danger text-xs">{err}</div>
          )}
        </div>
      </Card>
      <div className="sticky-cta">
        <Button full variant="primary" loading={submitting} disabled={!valid || submitting} onClick={handleSubmit} className="shadow-card">
          {t('req.find')}
        </Button>
      </div>
    </div>
  );
}
