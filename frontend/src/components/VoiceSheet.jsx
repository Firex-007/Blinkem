import { useState, useEffect } from 'react';
import {
  Mic,
  Square,
  Loader2,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  X,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  CookingPot,
} from 'lucide-react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { useApp } from '../context/AppContext';
import { classifyTradeFromText } from '../lib/tradeClassifier';
import { api } from '../api';
import { t } from '../i18n';
import Button from './Button';

const CATEGORY_META = {
  plumber: { label: 'Plumber', icon: Wrench, color: 'text-blue-500 bg-blue-500/10' },
  electrician: { label: 'Electrician', icon: Zap, color: 'text-amber-500 bg-amber-500/10' },
  cleaner: { label: 'Cleaning', icon: Sparkles, color: 'text-emerald-500 bg-emerald-500/10' },
  carpenter: { label: 'Carpenter', icon: Hammer, color: 'text-orange-500 bg-orange-500/10' },
  painter: { label: 'Painter', icon: Paintbrush, color: 'text-purple-500 bg-purple-500/10' },
  ac_repair: { label: 'AC Repair', icon: Zap, color: 'text-cyan-500 bg-cyan-500/10' },
  cook: { label: 'Cook', icon: CookingPot, color: 'text-rose-500 bg-rose-500/10' },
  appliance_repair: { label: 'Appliance Repair', icon: Wrench, color: 'text-indigo-500 bg-indigo-500/10' },
};

const SAMPLE_CHIPS = [
  { text: 'Hall fan not running, switch board sparking', cat: 'electrician', urgency: 'now', desc: 'Ceiling fan stopped working and switch sparking.' },
  { text: 'Kitchen sink la pipe leak aaguthu, udane aal venum', cat: 'plumber', urgency: 'now', desc: 'Water leaking from kitchen sink pipe, urgent repair.' },
  { text: 'AC not cooling properly, gas check needed', cat: 'ac_repair', urgency: 'now', desc: 'Air conditioner not cooling, requires inspection.' },
  { text: 'Bathroom deep cleaning and floor sweeping', cat: 'cleaner', urgency: 'now', desc: 'Bathroom deep cleaning and mopping.' },
];

export default function VoiceSheet({ open, onClose, onResult }) {
  const { lang } = useApp();
  const [textLoading, setTextLoading] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [micDenied, setMicDenied] = useState(false);
  const [typedFallback, setTypedFallback] = useState('');
  const [editedDesc, setEditedDesc] = useState('');
  const [editedCat, setEditedCat] = useState('');

  const {
    isRecording,
    isProcessing,
    audioLevel,
    liveTranscript,
    startRecording,
    stopRecording,
    cleanup,
  } = useVoiceRecorder({
    lang,
    autoStopSilence: true,
    silenceThresholdMs: 3500,
    onResult: (res) => {
      setReviewData(res);
      setEditedDesc(res.description || '');
      setEditedCat(res.category || '');
    },
    onError: (err) => {
      if (err && (err.name === 'NotAllowedError' || (err.message && err.message.includes('Permission')))) {
        setMicDenied(true);
      }
      console.warn('Voice recording issue:', err);
    },
  });

  // Hold Spacebar to speak (Push-to-Talk)
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat) {
        const activeTag = document.activeElement?.tagName;
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;
        if (!isRecording && !isProcessing && !reviewData) {
          e.preventDefault();
          startRecording();
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        const activeTag = document.activeElement?.tagName;
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;
        if (isRecording) {
          e.preventDefault();
          stopRecording();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [open, isRecording, isProcessing, reviewData, startRecording, stopRecording]);

  if (!open) return null;

  const handleClose = () => {
    cleanup();
    setReviewData(null);
    setMicDenied(false);
    setTypedFallback('');
    onClose();
  };

  const handleProceed = () => {
    if (reviewData && onResult) {
      onResult({ ...reviewData, description: editedDesc || reviewData.description, category: editedCat || reviewData.category });
    }
  };

  const handleTypedSubmit = async (e) => {
    e.preventDefault();
    const text = typedFallback.trim();
    if (!text) return;
    try {
      setTextLoading(true);
      try {
        const res = await api.post('/voice/parse-text', { text });
        setReviewData(res); setEditedDesc(res.description || ''); setEditedCat(res.category || '');
      } catch {
        const classified = classifyTradeFromText(text);
        const fb = {
          category: classified.category,
          description: text,
          urgency: classified.urgency,
          transcript: text,
          confidence: classified.confidence,
          source: 'local_ai',
        };
        setReviewData(fb);
        setEditedDesc(text);
        setEditedCat(classified.category);
      }
    } finally { setTextLoading(false); }
  };

  const handleReRecord = () => {
    setReviewData(null);
    startRecording();
  };

  // Handle sample click
  const handleSampleClick = async (sample) => {
    try {
      setTextLoading(true);
      try {
        const res = await api.post('/voice/parse-text', { text: sample.text });
        setReviewData(res); setEditedDesc(res.description || ''); setEditedCat(res.category || '');
      } catch (e) {
        const fb = { category: sample.cat, description: sample.desc, urgency: sample.urgency, transcript: sample.text, detected_language: 'mixed', confidence: 1.0, source: 'sample' };
        setReviewData(fb); setEditedDesc(sample.desc); setEditedCat(sample.cat);
      }
    } finally {
      setTextLoading(false);
    }
  };

  const lowConfidence = reviewData && typeof reviewData.confidence === 'number' && reviewData.confidence < 0.5;

  const selectedMeta = CATEGORY_META[editedCat || reviewData?.category] || CATEGORY_META.plumber;
  const CategoryIcon = selectedMeta.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Centered Floating Modal Card */}
      <div className="relative w-full max-w-[480px] rounded-[28px] glass-card border border-line shadow-[0_24px_64px_rgba(0,0,0,0.3)] p-6 sm:p-7 flex flex-col space-y-5 animate-scaleIn max-h-[85dvh] overflow-y-auto z-10 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="font-800 text-ink text-base">Voice Assistant</span>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-surface2 hover:bg-soft flex items-center justify-center text-muted hover:text-ink transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MIC DENIED STATE */}
        {micDenied && !reviewData && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-card bg-dangersoft border border-danger/30 space-y-2">
              <div className="flex items-center gap-2 text-danger font-800 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Microphone access denied</span>
              </div>
              <p className="text-xs text-ink/80 leading-relaxed">Allow mic access in browser settings, or type your request below.</p>
            </div>
            <form onSubmit={handleTypedSubmit} className="space-y-3">
              <label className="text-xs font-700 text-muted uppercase tracking-wider block">Type your service request</label>
              <textarea
                value={typedFallback}
                onChange={(e) => setTypedFallback(e.target.value)}
                placeholder="e.g. Kitchen sink leaking, need plumber urgently"
                rows={3}
                className="w-full px-4 py-3 rounded-[14px] bg-surface2 border border-line text-sm text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none font-500 transition-all"
              />
              <Button variant="primary" full loading={textLoading} type="submit">Find workers</Button>
            </form>
          </div>
        )}

        {/* REVIEW & CONFIRMATION SCREEN */}
        {reviewData && (
          <div className="space-y-4 animate-fade py-1">
            <div className="text-center space-y-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-800 text-success uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Speech Understood
              </span>
              <h3 className="font-800 text-lg text-ink">Review your request</h3>
            </div>

            {/* Low confidence warning */}
            {lowConfidence && (
              <div className="flex items-center gap-2 p-3 rounded-[14px] bg-accent/10 border border-accent/30 text-xs font-700 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Please confirm the service type — we weren't entirely sure</span>
              </div>
            )}

            {/* Transcript Quote Bubble */}
            <div className="p-4 rounded-card bg-surface2/70 border border-line space-y-1 relative">
              <span className="text-[10px] font-800 text-muted uppercase tracking-wider block">
                You said (Transcript)
              </span>
              <p className="text-sm font-700 text-ink italic leading-relaxed">
                "{reviewData.transcript || 'Voice request recorded'}"
              </p>
              {reviewData.detected_language && (
                <span className="text-[10px] text-muted font-600 block mt-1">
                  Detected language: <span className="uppercase text-primary font-700">{reviewData.detected_language}</span>
                </span>
              )}
            </div>

            {/* AI Identified Details Card */}
            <div className="p-4 rounded-card bg-surface border border-line shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-700 text-muted uppercase tracking-wider">
                  Target Service
                </span>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-800 ${selectedMeta.color}`}>
                  <CategoryIcon className="w-3.5 h-3.5" />
                  <span>{selectedMeta.label}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 border-t border-line">
                <span className="text-xs font-700 text-muted uppercase tracking-wider block">
                  Problem Summary
                </span>
                <textarea
                  value={editedDesc}
                  onChange={(e) => setEditedDesc(e.target.value)}
                  rows={2}
                  placeholder="Describe the problem…"
                  className="w-full px-3 py-2 rounded-[10px] bg-surface2 border border-line text-sm text-ink focus:outline-none focus:border-primary resize-none font-500 transition-all"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted pt-1">
                <span>Urgency</span>
                <span className="font-800 text-primary capitalize">
                  {reviewData.urgency === 'scheduled' ? 'Scheduled Service' : 'Immediate Dispatch (Now)'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleReRecord}
                className="py-3 px-4 rounded-chip bg-surface2 hover:bg-soft text-ink font-700 text-xs flex items-center justify-center gap-1.5 border border-line transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-record</span>
              </button>
              <button
                onClick={handleProceed}
                className="py-3 px-4 rounded-chip bg-primary hover:bg-primary600 text-onprimary font-800 text-xs flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98] transition"
              >
                <span>Find workers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE RECORDING / LISTENING SCREEN */}
        {!reviewData && !micDenied && (
          <div className="space-y-4 py-2">
            {/* Live Wave & Mic Button */}
            <div className="text-center space-y-4">
              <div className="relative inline-flex items-center justify-center">
                {/* Audio pulse rings */}
                {isRecording && (
                  <>
                    <div
                      className="absolute rounded-full bg-primary/25 transition-all duration-75"
                      style={{
                        width: `${100 + audioLevel * 80}px`,
                        height: `${100 + audioLevel * 80}px`,
                      }}
                    />
                    <div
                      className="absolute rounded-full bg-primary/15 animate-ping pointer-events-none"
                      style={{ width: '130px', height: '130px' }}
                    />
                  </>
                )}

                {/* Primary Mic Trigger */}
                <button
                  onClick={
                    isProcessing || textLoading
                      ? undefined
                      : isRecording
                      ? stopRecording
                      : startRecording
                  }
                  disabled={isProcessing || textLoading}
                  className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-onprimary shadow-2xl transition-all transform active:scale-95 ${
                    isRecording
                      ? 'bg-danger animate-pulse ring-4 ring-danger/40 scale-105'
                      : isProcessing || textLoading
                      ? 'bg-primary/70 cursor-wait'
                      : 'bg-primary hover:bg-primary600 ring-4 ring-primary/20 hover:scale-105'
                  }`}
                  aria-label={isRecording ? 'Stop recording' : 'Start voice request'}
                >
                  {isProcessing || textLoading ? (
                    <Loader2 className="w-10 h-10 animate-spin" />
                  ) : isRecording ? (
                    <Square className="w-8 h-8 fill-current" />
                  ) : (
                    <Mic className="w-10 h-10" />
                  )}
                </button>
              </div>

              {/* Status & Guidance */}
              <div className="space-y-1">
                <span className="font-800 text-ink text-sm block">
                  {isProcessing || textLoading
                    ? 'Processing & understanding request…'
                    : isRecording
                    ? 'Listening… (Auto-stops when you pause)'
                    : 'Tap mic or hold [Space] to speak'}
                </span>

                {isRecording && (
                  <div className="flex items-center justify-center gap-2 py-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-danger animate-ping" />
                    <span className="text-xs font-700 text-danger animate-pulse">Recording audio... speak naturally</span>
                  </div>
                )}

                {!isRecording && !isProcessing && (
                  <p className="text-xs text-muted max-w-xs mx-auto leading-relaxed">
                    Speak in Tamil, English, Hindi, or Tanglish. Mention what is broken and when you need it.
                  </p>
                )}
              </div>

              {/* Spacebar Push-To-Talk Badge Hint */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface2 border border-line text-[11px] font-700 text-muted">
                <kbd className="px-1.5 py-0.5 rounded bg-surface border border-line text-[10px] font-800 text-ink shadow-sm">
                  Space
                </kbd>
                <span>Hold to speak • Release to process</span>
              </div>
            </div>

            {/* Quick Sample Queries */}
            <div className="space-y-2 pt-2 border-t border-line">
              <div className="flex items-center gap-1.5 text-xs font-700 text-muted">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Or select a common service request:</span>
              </div>
              <div className="flex flex-col gap-2">
                {SAMPLE_CHIPS.map((sample, idx) => (
                  <button
                    key={idx}
                    disabled={isRecording || isProcessing || textLoading}
                    onClick={() => handleSampleClick(sample)}
                    className="text-left p-3 rounded-[14px] bg-surface2 hover:bg-soft text-ink text-xs font-600 transition flex items-center justify-between group border border-line/60 disabled:opacity-50"
                  >
                    <span className="truncate pr-2">"{sample.text}"</span>
                    <span className="text-[10px] text-muted group-hover:text-primary shrink-0 uppercase font-800">
                      {sample.cat}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
