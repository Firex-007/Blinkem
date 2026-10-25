import { useState } from 'react';
import { MapPin, Navigation, Search, Check, AlertCircle, Loader2, Sparkles, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CHENNAI_LOCALITIES } from '../data/chennaiLocalities';

export default function LocationModal({ open, onClose }) {
  const { location, setLocation, detectLocation, locationStatus } = useApp();
  const [search, setSearch] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!open) return null;

  const filtered = CHENNAI_LOCALITIES.filter((loc) =>
    loc.name.toLowerCase().includes(search.toLowerCase()) ||
    loc.landmark.toLowerCase().includes(search.toLowerCase()) ||
    loc.pin_code.includes(search)
  );

  const handleDetect = async () => {
    setDetecting(true);
    setErrorMsg(null);
    try {
      await detectLocation();
      onClose();
    } catch (err) {
      if (err.code === 1) {
        setErrorMsg('Location permission was denied. Please select an area below or allow access in your browser address bar.');
      } else {
        setErrorMsg('Unable to retrieve your current location. Please choose your area from the list.');
      }
    } finally {
      setDetecting(false);
    }
  };

  const handleSelect = (loc) => {
    setLocation(loc);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] max-h-[85vh] rounded-t-[28px] glass-card border-t border-l border-r border-line shadow-2xl z-50 p-5 flex flex-col animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-soft text-primary flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-800 text-ink text-base">Select Your Location</h2>
              <p className="text-xs text-muted">Hyperlocal matching across Chennai</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface2 hover:bg-soft text-muted hover:text-ink flex items-center justify-center transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* GPS Current Location button */}
        <div className="py-3">
          <button
            onClick={handleDetect}
            disabled={detecting}
            className="w-full flex items-center gap-3 p-3.5 rounded-card bg-primary-soft/60 hover:bg-primary-soft text-primary border border-primary/20 transition group"
          >
            <div className="w-9 h-9 rounded-full bg-primary text-onprimary flex items-center justify-center group-hover:scale-110 transition shadow-sm">
              {detecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
            </div>
            <div className="text-left flex-1">
              <span className="font-700 text-sm block text-primary">
                {detecting ? 'Requesting GPS Location...' : 'Use Current Device Location'}
              </span>
              <span className="text-xs text-muted block">
                Requires browser permission for precise coordinates
              </span>
            </div>
            <Sparkles className="w-4 h-4 text-primary opacity-60" />
          </button>

          {errorMsg && (
            <div className="mt-2 p-3 rounded-card bg-danger-soft text-danger text-xs flex items-start gap-2 border border-danger/20">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Chennai area, landmark, pincode..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-surface2 border border-line text-sm text-ink placeholder:text-muted focus:outline-none focus:border-primary transition"
          />
        </div>

        {/* Localities List */}
        <div className="overflow-y-auto space-y-2 flex-1 pr-1 max-h-[340px]">
          <span className="text-[11px] font-700 text-muted uppercase tracking-wider block px-1">
            Chennai Localities ({filtered.length})
          </span>
          {filtered.map((loc) => {
            const isSelected = location?.name === loc.name;
            return (
              <button
                key={loc.name}
                onClick={() => handleSelect(loc)}
                className={`w-full flex items-center justify-between p-3 rounded-card border text-left transition ${
                  isSelected
                    ? 'bg-primary-soft/50 border-primary text-ink'
                    : 'bg-surface border-line hover:bg-surface2 text-ink'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-primary text-onprimary' : 'bg-surface2 text-muted'
                  }`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-700 text-sm text-ink">{loc.name}</span>
                      <span className="text-[10px] font-600 px-1.5 py-0.5 rounded bg-surface2 text-muted border border-line">
                        {loc.pin_code}
                      </span>
                    </div>
                    <span className="text-xs text-muted block line-clamp-1">
                      {loc.landmark}
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-primary text-onprimary flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
