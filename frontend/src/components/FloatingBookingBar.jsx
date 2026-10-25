import { ChevronLeft, MapPin, Clock2, Wrench } from 'lucide-react';

export default function FloatingBookingBar({ booking, onTap }) {
  if (!booking) return null;
  return (
    <div
      className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[480px] mx-4 rounded-2xl bg-primary text-onprimary shadow-card p-4 flex items-center gap-3 cursor-pointer z-40"
      onClick={onTap}
      role="button"
      tabIndex={0}
      aria-label="Floating booking bar"
    >
      <div className="w-10 h-10 rounded-full bg-onprimary/20 flex items-center justify-center text-onprimary flex-shrink-0">
        <MapPin className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1">
          <span className="font-700 text-sm">{booking.worker?.name || 'Worker'}</span>
          <span className="text-xs opacity-80">is on the way</span>
        </div>
        <div className="text-xs opacity-80 mt-0.5">{booking.eta_min} min · ₹{booking.agreed_price}</div>
        <div className="w-full bg-onprimary/20 rounded-full h-1.5 mt-2 overflow-hidden">
          <div className="bg-accent h-full w-[60%]" />
        </div>
      </div>
      <div className="text-xs font-700 opacity-90">{booking.status}</div>
    </div>
  );
}
