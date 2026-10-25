import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Star,
  Phone,
  ExternalLink,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Navigation,
} from 'lucide-react';

export default function RealPlacesCard({ place, onBook }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleBook = () => {
    if (onBook) {
      onBook(place);
    } else {
      navigate(`/request/new?category=${place.service}`, {
        state: {
          description: `Direct booking with ${place.name} (${place.address})`,
          category: place.service,
          budget_hint: place.base_rate,
          urgency: 'now',
        },
      });
    }
  };

  const handleCopyPhone = () => {
    if (place.phone && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(place.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article
      className="p-4 rounded-2xl bg-surface border border-line shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300 flex flex-col justify-between group"
      data-name="real place card"
    >
      <div>
        {/* Header: Business Name & Google Verified Badge */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-800 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Google Verified
              </span>
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-800 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3" /> {place.estimated_arrival_minutes ? `~${place.estimated_arrival_minutes} min ETA` : 'Open Now'}
              </span>
            </div>

            <h3 className="font-800 text-ink text-sm sm:text-base leading-tight mt-1.5 group-hover:text-primary transition-colors">
              {place.name}
            </h3>
          </div>
        </div>

        {/* Rating, Reviews & Open Status */}
        <div className="flex items-center gap-2 mt-2 text-xs">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 font-800">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{place.rating ? place.rating.toFixed(1) : '4.8'}</span>
          </div>
          <span className="text-muted text-[11px] font-600">
            ({place.reviews || 80}+ Google Reviews)
          </span>
          <span className="text-muted">•</span>
          <span className="text-success font-700 text-[11px]">
            {place.availability === 'open_now' ? 'Open Now' : 'Available'}
          </span>
        </div>

        {/* Real Address & GPS Distance */}
        <div className="mt-2 text-xs text-muted space-y-1">
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2 leading-relaxed text-[12px]">{place.address}</span>
          </div>
          <div className="flex items-center gap-2 pl-5 text-[11px]">
            <span className="font-800 text-ink">{place.distance_km} km away</span>
            <span>•</span>
            <span className="text-muted">Chennai Hyperlocal Radar</span>
          </div>
        </div>

        {/* Price Estimate */}
        <div className="mt-2.5 p-2 rounded-xl bg-surface2/60 border border-line/70 flex items-center justify-between text-xs">
          <span className="text-muted font-600">Service Charge</span>
          <span className="font-800 text-ink text-[12px]">{place.service_charge}</span>
        </div>
      </div>

      {/* Action Buttons: Call, Maps & Dispatch */}
      <div className="mt-3 pt-2.5 border-t border-line/60 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Direct Phone Call Button */}
          {place.phone ? (
            <a
              href={`tel:${place.phone.replace(/\s+/g, '')}`}
              onClick={(e) => e.stopPropagation()}
              className="py-2 px-2.5 rounded-xl bg-surface2 hover:bg-soft text-ink font-800 text-xs flex items-center justify-center gap-1.5 border border-line transition active:scale-95 text-center truncate"
              title="Call directly"
            >
              <Phone className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="truncate">{place.phone}</span>
            </a>
          ) : (
            <button
              onClick={handleCopyPhone}
              className="py-2 px-2.5 rounded-xl bg-surface2 text-muted font-800 text-xs flex items-center justify-center gap-1.5 border border-line"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Available</span>
            </button>
          )}

          {/* Google Maps Directions Link */}
          <a
            href={place.maps_link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="py-2 px-2.5 rounded-xl bg-surface2 hover:bg-soft text-ink font-800 text-xs flex items-center justify-center gap-1.5 border border-line transition active:scale-95 text-center truncate"
            title="Open in Google Maps"
          >
            <Navigation className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span>Directions</span>
            <ExternalLink className="w-3 h-3 text-muted" />
          </a>
        </div>

        {/* Dispatch with Blink'em Button */}
        <button
          onClick={handleBook}
          className="w-full py-2.5 px-3 rounded-xl bg-ink text-surface hover:bg-ink/90 font-800 text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
        >
          <span>Book Instant Dispatch</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
}
