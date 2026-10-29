import { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  Clock,
  Calendar,
  Send,
  Sparkles,
  Mic,
  MicOff,
  Camera,
  Video,
  X,
  AlertCircle,
  CheckCircle2,
  FileText,
  Upload,
} from 'lucide-react';
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

const MAX_IMAGES = 3;
const MAX_TOTAL_SIZE_MB = 10;
const MAX_VIDEO_DURATION_SEC = 15;

export default function RequestForm() {
  const { location: appLocation, currentUser } = useApp();
  const [searchParams] = useSearchParams();
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const voiceState = routerLocation.state || {};

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // Service Category & Problem Description
  const [category, setCategory] = useState(voiceState.category || searchParams.get('category') || 'plumber');
  const [description, setDescription] = useState(voiceState.description || voiceState.transcript || '');
  const [urgency, setUrgency] = useState(voiceState.urgency || 'now');
  const [scheduledDate, setScheduledDate] = useState(todayStr);
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [budget, setBudget] = useState(voiceState.budget_hint ? String(voiceState.budget_hint) : '');
  const [voiceTranscript, setVoiceTranscript] = useState(voiceState.transcript || null);

  // Structured Address fields with PIN Code
  const defaultLocality = appLocation ? `${appLocation.name}${appLocation.city ? `, ${appLocation.city}` : ''}` : 'T. Nagar, Chennai';
  const [flatNo, setFlatNo] = useState('');
  const [streetArea, setStreetArea] = useState(defaultLocality);
  const [pincode, setPincode] = useState('600017');
  const [landmark, setLandmark] = useState('');
  const [isPrefilledFromProfile, setIsPrefilledFromProfile] = useState(false);

  // Auto pre-fill saved address and PIN code from user profile
  useEffect(() => {
    if (currentUser) {
      let pinFound = currentUser.pincode || '';
      let rawAddr = (currentUser.address || '').trim();

      if (!pinFound && rawAddr) {
        const match = rawAddr.match(/\b(6\d{5})\b/) || rawAddr.match(/\b(\d{6})\b/);
        if (match) pinFound = match[1];
      }

      if (pinFound) {
        setPincode(pinFound);
      }

      if (rawAddr) {
        const parts = rawAddr.split(',').map((p) => p.trim()).filter(Boolean);
        if (parts.length > 1) {
          const firstPart = parts[0];
          // Check if first segment looks like flat/door no (e.g. "65/15", "Flat 4B", "No. 12")
          if (firstPart.length <= 25 && (/[\d\/\-]/.test(firstPart) || /^(flat|no|door|plot|house)/i.test(firstPart))) {
            setFlatNo(firstPart);
            setStreetArea(parts.slice(1).join(', '));
          } else {
            setStreetArea(rawAddr);
          }
        } else {
          setStreetArea(rawAddr);
        }
        setIsPrefilledFromProfile(true);
      }
    }
  }, [currentUser]);

  // Media attachments: Photos (up to 3) or 1 short video (< 15s), under 10MB total
  const [mediaList, setMediaList] = useState([]);
  const [mediaError, setMediaError] = useState(null);
  const fileInputRef = useRef(null);

  // In-form Voice Recognition
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  // UI States
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  // Setup Web Speech API for inline voice transcription
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Works very well with Indian English & Tanglish

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!speechSupported) {
      setErr('Voice recognition is not supported in this browser. Please type your issue.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        setErr(null);
        setIsListening(true);
        recognitionRef.current?.start();
      } catch (e) {
        console.warn('Error starting speech:', e);
        setIsListening(false);
      }
    }
  };

  // Media Upload & Validation Handler
  const handleMediaSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setMediaError(null);

    // Calculate current total size
    let currentTotalBytes = mediaList.reduce((acc, m) => acc + m.size, 0);
    const updatedMedia = [...mediaList];

    for (const file of files) {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isImage && !isVideo) {
        setMediaError('Only image (JPG/PNG/WebP) and short video formats are supported.');
        continue;
      }

      // Check video limits
      if (isVideo) {
        const hasExistingVideo = updatedMedia.some((m) => m.type === 'video');
        if (hasExistingVideo) {
          setMediaError('You can attach maximum 1 short video clip.');
          continue;
        }
      }

      // Check image limits
      if (isImage) {
        const imageCount = updatedMedia.filter((m) => m.type === 'image').length;
        if (imageCount >= MAX_IMAGES) {
          setMediaError(`You can attach up to ${MAX_IMAGES} photos maximum.`);
          continue;
        }
      }

      // Check total combined size limit (10MB)
      if (currentTotalBytes + file.size > MAX_TOTAL_SIZE_MB * 1024 * 1024) {
        setMediaError(`Total media size must be under ${MAX_TOTAL_SIZE_MB}MB.`);
        break;
      }

      // Read file as preview URL
      const previewUrl = URL.createObjectURL(file);
      currentTotalBytes += file.size;
      updatedMedia.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: isVideo ? 'video' : 'image',
        size: file.size,
        sizeMb: (file.size / (1024 * 1024)).toFixed(1),
        previewUrl,
        file,
      });
    }

    setMediaList(updatedMedia);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveMedia = (id) => {
    setMediaList((prev) => {
      const removed = prev.find((m) => m.id === id);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((m) => m.id !== id);
    });
    setMediaError(null);
  };

  // Compose Full Address
  const fullAddress = [
    flatNo ? flatNo.trim() : null,
    streetArea ? streetArea.trim() : null,
    pincode ? `PIN: ${pincode.trim()}` : null,
    landmark ? `(Near ${landmark.trim()})` : null,
  ]
    .filter(Boolean)
    .join(', ');

  const valid = category && description.trim().length >= 4 && streetArea.trim().length >= 3 && pincode.trim().length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    if (!valid) {
      if (!pincode || pincode.trim().length < 6) {
        setErr('Please enter a valid 6-digit PIN code.');
      } else {
        setErr(t('req.validate') || 'Please fill in all required fields.');
      }
      return;
    }

    setSubmitting(true);
    try {
      const scheduledIso = urgency === 'scheduled'
        ? new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString()
        : null;

      const reqLat = appLocation?.lat || 13.0418;
      const reqLng = appLocation?.lng || 80.2341;

      // Pack media metadata for technician inspection
      const mediaPayload = mediaList.map((m) => ({
        type: m.type,
        name: m.name,
        size_mb: m.sizeMb,
        preview_url: m.previewUrl,
      }));

      const res = await api.post('/requests', {
        category,
        description,
        lat: reqLat,
        lng: reqLng,
        address: fullAddress,
        pincode: pincode.trim(),
        flat_no: flatNo.trim(),
        landmark: landmark.trim(),
        urgency,
        scheduled_at: scheduledIso,
        budget_hint: budget ? parseInt(budget, 10) : null,
        voice_transcript: voiceTranscript,
        media: mediaPayload,
      });

      navigate(`/request/${res.id}/searching`);
    } catch (e) {
      setErr(e.message || t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-28">
      {voiceTranscript && (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-2 text-xs text-primary font-700 animate-slideUp">
          <Sparkles className="w-4 h-4 shrink-0 text-primary" />
          <span>Prefilled from voice: "{voiceTranscript}"</span>
        </div>
      )}

      <Card className="rounded-3xl p-5 shadow-card space-y-5">
        {/* 1. Category Selection */}
        <div>
          <label className="block text-xs font-800 text-muted uppercase tracking-wider mb-2">
            {t('req.service') || 'Select Service Category'}
          </label>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((s) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => setCategory(s.slug)}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-800 border transition ${
                  category === s.slug
                    ? 'bg-primary text-onprimary border-primary shadow-xs'
                    : 'bg-surface text-ink border-line hover:border-primary/40'
                }`}
              >
                {t(s.label)}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Problem Description with Voice & Media Upload */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-800 text-muted uppercase tracking-wider">
              {t('req.problem') || 'Describe the Issue'}
            </label>
            {speechSupported && (
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-800 transition ${
                  isListening
                    ? 'bg-danger text-white animate-pulse'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Listening... Tap to stop</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>Tap to Speak (Voice)</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`w-full px-3.5 py-2.5 rounded-2xl bg-surface border text-sm text-ink outline-none transition ${
                isListening ? 'border-primary ring-2 ring-primary/20' : 'border-line focus:border-primary'
              }`}
              placeholder="e.g. Tap leaking continuously in bathroom, geyser not heating, or fan regulator broken..."
            />
          </div>

          {/* Photo & Video Attachment Section */}
          <div className="p-3.5 rounded-2xl bg-surface2/60 border border-line space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-800 text-ink block">
                  Add Photos / Short Video (Optional)
                </span>
                <span className="text-[11px] text-muted block">
                  Up to 3 photos or 1 video (15s max, &lt;10MB). Helps worker diagnose accurately.
                </span>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-line hover:border-primary text-xs font-800 text-ink transition shadow-xs flex-shrink-0"
              >
                <Camera className="w-3.5 h-3.5 text-primary" />
                <span>Upload</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleMediaSelect}
                className="hidden"
              />
            </div>

            {/* Media Error Toast */}
            {mediaError && (
              <div className="p-2 rounded-xl bg-dangersoft text-danger text-[11px] font-700 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{mediaError}</span>
              </div>
            )}

            {/* Media Previews Grid */}
            {mediaList.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                {mediaList.map((m) => (
                  <div
                    key={m.id}
                    className="relative rounded-xl overflow-hidden border border-line aspect-square bg-surface group"
                  >
                    {m.type === 'video' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 text-white p-2 text-center">
                        <Video className="w-6 h-6 text-primary mb-1" />
                        <span className="text-[9px] font-800 truncate max-w-full">
                          {m.name}
                        </span>
                        <span className="text-[9px] text-muted">{m.sizeMb}MB</span>
                      </div>
                    ) : (
                      <img
                        src={m.previewUrl}
                        alt={m.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(m.id)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-danger transition"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-1 left-1 px-1 rounded bg-black/60 text-[9px] font-700 text-white uppercase">
                      {m.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. Detailed Address with PIN Code */}
        <div className="space-y-3 pt-1 border-t border-line/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              <label className="text-xs font-800 text-ink uppercase tracking-wider">
                Service Address &amp; Location
              </label>
            </div>
            {isPrefilledFromProfile && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-successsoft border border-success/30 text-success text-[10px] font-800 animate-slideUp">
                <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                Pre-filled from profile
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-700 text-muted mb-1">
                Flat / Door No. &amp; Apartment / Building Name
              </label>
              <input
                type="text"
                value={flatNo}
                onChange={(e) => setFlatNo(e.target.value)}
                placeholder="e.g. Flat 3B, Ceebros Heights"
                className="w-full px-3 py-2 rounded-xl bg-surface border border-line focus:border-primary text-xs font-700 text-ink outline-none shadow-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-700 text-muted mb-1">
                  Street &amp; Area / Locality *
                </label>
                <input
                  type="text"
                  value={streetArea}
                  onChange={(e) => setStreetArea(e.target.value)}
                  required
                  placeholder="e.g. Usman Road, T. Nagar, Chennai"
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-line focus:border-primary text-xs font-700 text-ink outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-700 text-muted mb-1">
                  PIN Code *
                </label>
                <input
                  type="text"
                  maxLength="6"
                  inputMode="numeric"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="600017"
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-line focus:border-primary text-xs font-800 text-ink outline-none shadow-xs tracking-wider"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-700 text-muted mb-1">
                Nearby Landmark (Optional)
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Opposite Saravana Stores / Near Post Office"
                className="w-full px-3 py-2 rounded-xl bg-surface border border-line focus:border-primary text-xs font-700 text-ink outline-none shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* 4. Urgency (Now vs Scheduled) */}
        <div className="space-y-2 pt-1 border-t border-line/60">
          <label className="block text-xs font-800 text-muted uppercase tracking-wider">
            {t('req.urgency') || 'When do you need the service?'}
          </label>
          <div className="flex gap-2">
            {['now', 'scheduled'].map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUrgency(u)}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-800 border transition flex items-center justify-center gap-1.5 ${
                  urgency === u
                    ? 'bg-primary text-onprimary border-primary shadow-xs'
                    : 'bg-surface text-ink border-line hover:border-primary/40'
                }`}
              >
                {u === 'now' ? (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>{t('req.now') || 'Arrive Now (<30 mins)'}</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>{t('req.schedule') || 'Schedule for Later'}</span>
                  </>
                )}
              </button>
            ))}
          </div>

          {urgency === 'scheduled' && (
            <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-3 animate-fadeIn">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-700 text-muted">Service Date</label>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setScheduledDate(todayStr)}
                    className={`px-3 py-1.5 rounded-full text-xs font-800 transition ${
                      scheduledDate === todayStr
                        ? 'bg-primary text-onprimary shadow-xs'
                        : 'bg-surface text-ink border border-line'
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
                        : 'bg-surface text-ink border border-line'
                    }`}
                  >
                    Tomorrow
                  </button>
                  <input
                    type="date"
                    min={todayStr}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="px-3 py-1.5 rounded-full bg-surface border border-line text-xs font-700 text-ink outline-none focus:border-primary shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
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
                      <span className="block text-xs font-800">{slot.label}</span>
                      <span className={`block text-[10px] ${scheduledTime === slot.time ? 'text-onprimary/80' : 'text-muted'}`}>
                        {slot.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. Budget Hint */}
        <div className="pt-1 border-t border-line/60">
          <label className="block text-xs font-800 text-muted uppercase tracking-wider mb-1.5">
            {t('req.budget') || 'Suggested Budget Hint (Optional)'}
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex items-center w-36">
              <span className="absolute left-3 text-sm font-800 text-ink">₹</span>
              <input
                type="number"
                inputMode="numeric"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full pl-7 pr-3 py-2 rounded-xl bg-surface border border-line text-sm font-800 text-ink outline-none focus:border-primary shadow-xs"
                placeholder="299"
              />
            </div>
            <span className="text-xs text-muted font-600">/visit standard baseline</span>
          </div>
        </div>

        {/* Form Error Toast */}
        {err && (
          <div className="p-3 rounded-xl bg-dangersoft text-danger text-xs font-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{err}</span>
          </div>
        )}
      </Card>

      {/* Sticky Bottom CTA */}
      <div className="sticky-cta">
        <Button
          full
          variant="primary"
          loading={submitting}
          disabled={!valid || submitting}
          onClick={handleSubmit}
          className="shadow-card py-3.5 text-sm font-800 rounded-2xl"
        >
          {t('req.find') || 'Find Available Technicians Nearby'}
        </Button>
      </div>
    </div>
  );
}
