import { useState } from 'react';
import { ShieldCheck, Cookie, X, Check, Sliders, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function CookieSettingsModal({ open, onClose }) {
  const { cookieConsent, updateCookieConsent } = useApp();
  const [prefToggles, setPrefToggles] = useState({
    essential: true,
    preferences: cookieConsent === 'all' || cookieConsent === null,
    analytics: cookieConsent === 'all',
  });

  if (!open) return null;

  const handleSaveCustom = () => {
    if (!prefToggles.preferences && !prefToggles.analytics) {
      updateCookieConsent('none');
    } else if (prefToggles.preferences && !prefToggles.analytics) {
      updateCookieConsent('essential');
    } else {
      updateCookieConsent('all');
    }
    onClose();
  };

  const handleAcceptAll = () => {
    updateCookieConsent('all');
    onClose();
  };

  const handleRejectAll = () => {
    updateCookieConsent('none');
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-settings-title"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-lg bg-surface border border-line rounded-3xl shadow-2xl z-50 p-6 flex flex-col gap-5 animate-scaleUp"
      >
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 id="cookie-settings-title" className="font-800 text-ink text-base sm:text-lg tracking-tight">
                Cookie Preferences
              </h2>
              <p className="text-xs text-muted">Manage how Blink'em stores data on your device</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="w-8 h-8 rounded-full bg-surface2 hover:bg-soft text-muted hover:text-ink flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
          {/* 1. Essential Cookies */}
          <div className="p-3.5 rounded-2xl bg-surface2/60 border border-line flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-800 text-xs sm:text-sm text-ink">Strictly Necessary Cookies</span>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-800 uppercase tracking-wider">
                  Always Active
                </span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Required for core navigation, request booking, security token, and error prevention. Cannot be turned off.
              </p>
            </div>
            <div className="w-10 h-6 bg-primary rounded-full relative p-0.5 flex items-center justify-end flex-shrink-0 opacity-80 cursor-not-allowed">
              <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
            </div>
          </div>

          {/* 2. User Preferences (Location, Username, Theme) */}
          <div className="p-3.5 rounded-2xl bg-surface2/60 border border-line flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <span className="font-800 text-xs sm:text-sm text-ink block">
                Preferences &amp; Location Memory
              </span>
              <p className="text-xs text-muted leading-relaxed">
                Remembers your selected Chennai neighborhood (e.g. T. Nagar, Adyar), custom profile edits, and light/dark theme across visits.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPrefToggles((p) => ({ ...p, preferences: !p.preferences }))}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 flex items-center flex-shrink-0 ${
                prefToggles.preferences ? 'bg-primary' : 'bg-line'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  prefToggles.preferences ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3. Analytics & Speed Optimization */}
          <div className="p-3.5 rounded-2xl bg-surface2/60 border border-line flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <span className="font-800 text-xs sm:text-sm text-ink block">
                Partner Matching &amp; Performance
              </span>
              <p className="text-xs text-muted leading-relaxed">
                Anonymized performance measurements that help optimize instant provider dispatch times in your area.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPrefToggles((p) => ({ ...p, analytics: !p.analytics }))}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 flex items-center flex-shrink-0 ${
                prefToggles.analytics ? 'bg-primary' : 'bg-line'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  prefToggles.analytics ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            onClick={handleRejectAll}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-800 text-muted hover:text-danger hover:bg-dangersoft transition"
          >
            No Cookies (Reject All)
          </button>
          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              onClick={handleSaveCustom}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-line bg-surface hover:bg-surface2 text-xs font-800 text-ink transition"
            >
              Save Preferences
            </button>
            <button
              onClick={handleAcceptAll}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-ink text-surface hover:opacity-90 text-xs font-800 transition shadow-sm"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CookieBanner() {
  const { cookieConsent, updateCookieConsent, isCookieModalOpen, setIsCookieModalOpen } = useApp();

  // If user has already made an explicit choice, don't show floating banner
  const hasChosen = cookieConsent !== null && cookieConsent !== undefined;

  const handleAccept = () => {
    updateCookieConsent('all');
  };

  const handleReject = () => {
    updateCookieConsent('none');
  };

  return (
    <>
      {/* Floating Bottom-Right Banner - Exact Uber Style */}
      {!hasChosen && (
        <aside
          aria-label="Cookie Consent"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 max-w-[420px] w-[calc(100vw-32px)] sm:w-auto bg-surface border border-line/90 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] z-50 p-5 sm:p-6 flex flex-col gap-4 animate-slideUp backdrop-blur-md"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-ink text-surface flex items-center justify-center flex-shrink-0">
                <Cookie className="w-4 h-4" />
              </div>
              <h3 className="font-800 text-ink text-base sm:text-lg tracking-tight leading-tight">
                We use cookies
              </h3>
            </div>
            <button
              onClick={handleReject}
              aria-label="Close and use no cookies"
              className="text-muted hover:text-ink p-1 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description Body */}
          <p className="text-xs sm:text-[13px] text-muted leading-relaxed font-500">
            Select &ldquo;Accept&rdquo; to enable Blink&apos;em to use cookies to personalize this site.
            We use cookies to remember your location, deliver rapid quotes, and measure service effectiveness.
            Customize your preferences in your{' '}
            <button
              onClick={() => setIsCookieModalOpen(true)}
              className="text-ink font-700 underline underline-offset-2 hover:text-primary transition"
            >
              Cookie settings
            </button>
            , or select Reject if you only want essential session cookies or no persistent cookies.
          </p>

          {/* Action Buttons: Uber Styled */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              onClick={() => setIsCookieModalOpen(true)}
              className="px-3.5 py-2 text-xs font-800 text-ink hover:text-primary hover:bg-surface2 rounded-xl transition"
            >
              Cookie settings
            </button>
            <button
              onClick={handleReject}
              className="px-4 py-2 text-xs font-800 text-ink bg-surface2 hover:bg-surface2/80 rounded-xl border border-line transition active:scale-95"
            >
              Reject
            </button>
            <button
              onClick={handleAccept}
              className="px-5 py-2 text-xs font-800 text-surface bg-ink hover:bg-ink/90 rounded-xl transition shadow-sm active:scale-95"
            >
              Accept
            </button>
          </div>
        </aside>
      )}

      {/* Settings Modal */}
      <CookieSettingsModal
        open={isCookieModalOpen}
        onClose={() => setIsCookieModalOpen(false)}
      />
    </>
  );
}
