import { useState, useEffect, useMemo } from 'react';
import { MapPin, Navigation, Search, Check, AlertCircle, Loader2, X, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CITIES } from '../data/cities';

export default function LocationModal({ open, onClose }) {
  const { location, setLocation, detectLocation } = useApp();
  const [selectedCityId, setSelectedCityId] = useState(() => {
    return location?.cityId || location?.city?.toLowerCase() || 'bengaluru';
  });
  const [search, setSearch] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Sync selected city whenever location or modal opening state changes
  useEffect(() => {
    if (open && location) {
      const cId = location.cityId || location.city?.toLowerCase() || 'bengaluru';
      setSelectedCityId(cId);
      setSearch('');
      setErrorMsg(null);
    }
  }, [open, location]);

  // Selected city object
  const currentCity = CITIES.find((c) => c.id === selectedCityId) || CITIES[0];

  // Filter localities based on active city and search text (always called unconditionally)
  const filteredLocalities = useMemo(() => {
    if (!open) return [];
    const q = search.trim().toLowerCase();
    if (!q) {
      return currentCity.localities.map((loc) => ({ ...loc, city: currentCity.name, cityId: currentCity.id }));
    }

    // If searching, search across the active city first, and if short results, search all cities
    let matches = currentCity.localities
      .filter(
        (loc) =>
          loc.name.toLowerCase().includes(q) ||
          loc.landmark.toLowerCase().includes(q) ||
          loc.pin_code.includes(q)
      )
      .map((loc) => ({ ...loc, city: currentCity.name, cityId: currentCity.id }));

    if (matches.length < 3) {
      // Also check other cities
      for (const city of CITIES) {
        if (city.id === currentCity.id) continue;
        const otherMatches = city.localities
          .filter(
            (loc) =>
              loc.name.toLowerCase().includes(q) ||
              loc.landmark.toLowerCase().includes(q) ||
              loc.pin_code.includes(q)
          )
          .map((loc) => ({ ...loc, city: city.name, cityId: city.id }));
        matches = [...matches, ...otherMatches];
      }
    }

    return matches;
  }, [open, currentCity, search]);

  if (!open) return null;

  const handleDetect = async () => {
    setDetecting(true);
    setErrorMsg(null);
    try {
      const detected = await detectLocation();
      if (detected?.cityId) {
        setSelectedCityId(detected.cityId);
      }
      onClose();
    } catch (err) {
      if (err.code === 1) {
        setErrorMsg('Location permission was denied. Please select your city and area below.');
      } else {
        setErrorMsg('Unable to retrieve current coordinates. Please choose your city from the list.');
      }
    } finally {
      setDetecting(false);
    }
  };

  const handleSelect = (loc) => {
    setLocation({
      name: loc.name,
      city: loc.city || currentCity.name,
      cityId: loc.cityId || currentCity.id,
      state: loc.state || currentCity.state,
      lat: loc.lat,
      lng: loc.lng,
      pin_code: loc.pin_code,
      landmark: loc.landmark,
      isGps: false,
    });
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed bottom-0 sm:bottom-auto sm:top-1/2 left-1/2 -translate-x-1/2 sm:-translate-y-1/2 w-full max-w-[540px] max-h-[90vh] sm:max-h-[85vh] rounded-t-[28px] sm:rounded-[24px] glass-card border border-line shadow-2xl z-50 p-5 flex flex-col animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-soft text-primary flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-800 text-ink text-base">Choose Your City & Area</h2>
              <p className="text-xs text-muted">Hyperlocal on-demand matching across India</p>
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
        <div className="py-2.5">
          <button
            onClick={handleDetect}
            disabled={detecting}
            className="w-full flex items-center gap-3 p-3 rounded-card bg-primary-soft/60 hover:bg-primary-soft text-primary border border-primary/20 transition group"
          >
            <div className="w-8 h-8 rounded-full bg-primary text-onprimary flex items-center justify-center shadow-sm shrink-0">
              {detecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
            </div>
            <div className="text-left flex-1 min-w-0">
              <span className="font-700 text-xs sm:text-sm block text-primary truncate">
                {detecting ? 'Detecting Your City & GPS Location...' : 'Use Current Device Location (Auto-Detect)'}
              </span>
              <span className="text-[11px] text-muted block truncate">
                Automatically detects your city, neighborhood and coordinates
              </span>
            </div>
          </button>

          {errorMsg && (
            <div className="mt-2 p-2.5 rounded-card bg-danger-soft text-danger text-xs flex items-start gap-2 border border-danger/20">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* City Selector Pills */}
        <div className="space-y-1.5 pb-2">
          <div className="flex items-center justify-between text-[11px] font-700 text-muted px-1">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              Select City
            </span>
            <span className="text-[10px] text-primary font-600">
              Active: {currentCity.name}
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
            {CITIES.map((c) => {
              const isActive = c.id === selectedCityId;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCityId(c.id);
                    setSearch('');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-700 whitespace-nowrap transition border ${
                    isActive
                      ? 'bg-primary text-onprimary border-primary shadow-xs'
                      : 'bg-surface text-ink border-line hover:border-primary/50'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-2.5">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${currentCity.name} neighborhood, landmark, pincode...`}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-surface2 border border-line text-xs sm:text-sm text-ink placeholder:text-muted focus:outline-none focus:border-primary transition"
          />
        </div>

        {/* Localities List */}
        <div className="overflow-y-auto space-y-1.5 flex-1 pr-1 max-h-[300px]">
          <span className="text-[10px] font-700 text-muted uppercase tracking-wider block px-1">
            Neighborhoods & Hubs in {currentCity.name} ({filteredLocalities.length})
          </span>
          {filteredLocalities.map((loc) => {
            const isSelected =
              location?.name === loc.name &&
              (location?.city === loc.city || !location?.city);
            return (
              <button
                key={`${loc.city}-${loc.name}`}
                onClick={() => handleSelect(loc)}
                className={`w-full flex items-center justify-between p-2.5 rounded-card border text-left transition ${
                  isSelected
                    ? 'bg-primary-soft/50 border-primary text-ink'
                    : 'bg-surface border-line hover:bg-surface2 text-ink'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-primary text-onprimary' : 'bg-surface2 text-muted'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-700 text-xs sm:text-sm text-ink truncate">{loc.name}</span>
                      <span className="text-[10px] text-muted font-600">
                        ({loc.city})
                      </span>
                      {loc.pin_code && (
                        <span className="text-[9px] font-600 px-1 py-0.2 rounded bg-surface2 text-muted border border-line">
                          {loc.pin_code}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted block truncate">
                      {loc.landmark}
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-primary text-onprimary flex items-center justify-center shrink-0 ml-2">
                    <Check className="w-3 h-3" />
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
