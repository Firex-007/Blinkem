import { useState } from 'react';
import { Mic, Square, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { api } from '../api';
import { t } from '../i18n';
import Chip from './Chip';

const SAMPLE_CHIPS = [
  { text: 'Sink la water leak aaguthu, udane aal venum', cat: 'plumber', urgency: 'now', desc: 'Water leaking from kitchen sink, urgent repair needed.' },
  { text: 'Hall fan not running, switch board sparking', cat: 'electrician', urgency: 'now', desc: 'Ceiling fan stopped working and switch sparking.' },
  { text: 'Bathroom cleaning and floor sweeping', cat: 'cleaner', urgency: 'now', desc: 'Bathroom deep cleaning and mopping.' },
  { text: 'AC not cooling properly, gas refill needed', cat: 'ac_repair', urgency: 'now', desc: 'Air conditioner not cooling, requires gas check.' },
];

export default function VoiceSheet({ open, onClose, onResult }) {
  const [textLoading, setTextLoading] = useState(false);

  const {
    isRecording,
    isProcessing,
    audioLevel,
    startRecording,
    stopRecording,
  } = useVoiceRecorder({
    onResult: (res) => {
      if (onResult) onResult(res);
    },
    onError: (err) => {
      console.warn('Voice recording failed, using fallback:', err);
    },
  });

  if (!open) return null;

  // Handle sample chip tap
  const handleSampleClick = async (sample) => {
    try {
      setTextLoading(true);
      // Attempt backend text parse first, fallback to pre-structured sample
      try {
        const res = await api.post('/voice/parse-text', { text: sample.text });
        if (onResult) {
          onResult(res);
          return;
        }
      } catch (e) {
        // Fallback to sample definition
      }
      if (onResult) {
        onResult({
          category: sample.cat,
          description: sample.desc,
          urgency: sample.urgency,
          transcript: sample.text,
          detected_language: 'mixed',
          source: 'sample',
        });
      }
    } finally {
      setTextLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Container */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] rounded-t-[28px] bg-surface border-t border-l border-r border-line shadow-card z-50 p-6 space-y-6 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-800 text-ink text-base">Voice Request</span>
            <Chip tone="accent" className="h-5 px-1.5 text-[10px] font-700">
              AI Powered
            </Chip>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-surface2 flex items-center justify-center text-muted hover:text-ink font-700 text-xs transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Central Voice Orb */}
        <div className="text-center space-y-4 py-2">
          <div className="relative inline-flex items-center justify-center">
            {/* Outer pulsating wave rings based on audio level */}
            {isRecording && (
              <>
                <div
                  className="absolute rounded-full bg-primary/20 transition-all duration-75"
                  style={{
                    width: `${96 + audioLevel * 72}px`,
                    height: `${96 + audioLevel * 72}px`,
                  }}
                />
                <div
                  className="absolute rounded-full bg-primary/10 animate-ping"
                  style={{ width: '120px', height: '120px' }}
                />
              </>
            )}

            {/* Main Interactive Button */}
            <button
              onClick={
                isProcessing
                  ? undefined
                  : isRecording
                  ? stopRecording
                  : startRecording
              }
              disabled={isProcessing || textLoading}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-onprimary shadow-card transition-all transform active:scale-95 ${
                isRecording
                  ? 'bg-danger animate-pulse ring-4 ring-danger/30'
                  : isProcessing || textLoading
                  ? 'bg-primary/70 cursor-wait'
                  : 'bg-primary hover:bg-primary600 ring-4 ring-primary/20'
              }`}
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

          <div>
            <span className="font-800 text-ink text-sm block">
              {isProcessing || textLoading
                ? t('voice.processing') || 'Understanding your request…'
                : isRecording
                ? t('voice.listening') || 'Listening… Tap when done'
                : 'Tap mic and speak'}
            </span>
            <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
              Speak in Tamil, English, Hindi, or Tanglish. Mention what is broken and when you need it.
            </p>
          </div>
        </div>

        {/* Sample Utterance Quick Chips */}
        <div className="space-y-2 pt-2 border-t border-line">
          <div className="flex items-center gap-1.5 text-xs font-700 text-muted">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Or tap a sample query:</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {SAMPLE_CHIPS.map((sample, idx) => (
              <button
                key={idx}
                disabled={isRecording || isProcessing || textLoading}
                onClick={() => handleSampleClick(sample)}
                className="text-left p-2.5 rounded-chip bg-surface2 hover:bg-soft text-ink text-xs font-600 transition flex items-center justify-between group"
              >
                <span className="truncate pr-2">"{sample.text}"</span>
                <span className="text-[10px] text-muted group-hover:text-primary shrink-0 uppercase font-700">
                  {sample.cat}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
