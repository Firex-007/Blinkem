import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  Star,
  Wrench,
  AlertCircle,
  CheckCircle2,
  FastForward,
  Navigation,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { api } from '../../api';
import { t } from '../../i18n';
import usePolling from '../../hooks/usePolling';
import MapCard from '../../components/MapCard';
import StatusStepper from '../../components/StatusStepper';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import Skeleton from '../../components/Skeleton';
import { getWorkerImage } from '../../utils/workerImages';
import { subscribeToRealtimeTracking } from '../../utils/realtimeTracking';

export default function Tracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Real-time WebSocket telemetry states (<50ms latency)
  const [realtimePos, setRealtimePos] = useState(null);
  const [realtimeStatus, setRealtimeStatus] = useState(null);
  const [realtimeEta, setRealtimeEta] = useState(null);
  const [isWsConnected, setIsWsConnected] = useState(false);

  // Relaxed heartbeat polling every 8s as reliable background backup
  const { data: booking, error, loading, refetch } = usePolling(
    () => api.get(`/bookings/${id}`),
    8000,
    true
  );

  // Subscribe to live WebSocket Broadcast channel (<50ms updates)
  useEffect(() => {
    if (!id) return;
    const sub = subscribeToRealtimeTracking(id, {
      onPositionUpdate: (payload) => {
        if (payload?.lat && payload?.lng) {
          setRealtimePos({ lat: payload.lat, lng: payload.lng, heading: payload.heading });
          if (payload.eta_remaining_min !== undefined && payload.eta_remaining_min !== null) {
            setRealtimeEta(payload.eta_remaining_min);
          }
        }
      },
      onStatusUpdate: (payload) => {
        if (payload?.status) {
          setRealtimeStatus(payload.status);
          if (payload.status === 'completed') {
            navigate(`/booking/${id}/complete`, { replace: true });
          }
        }
        refetch();
      },
      onConnectionChange: (status) => {
        setIsWsConnected(status === 'SUBSCRIBED');
      },
    });

    return () => sub.unsubscribe();
  }, [id, navigate, refetch]);

  useEffect(() => {
    if (booking?.status === 'completed') {
      navigate(`/booking/${id}/complete`, { replace: true });
    }
  }, [booking?.status, id, navigate]);

  // Respond to extra charge
  const handleExtraRespond = async (extraId, approve) => {
    try {
      setActionLoading(true);
      await api.post(`/bookings/${id}/extra/${extraId}/respond`, { approve });
      refetch();
    } catch (err) {
      console.error(err);
      setToastMsg(err.message || 'Failed to respond to extra charge.');
    } finally {
      setActionLoading(false);
    }
  };

  // Fast-track arrival
  const handleFastForward = async () => {
    try {
      setActionLoading(true);
      await api.post(`/demo/booking/${id}/fast-forward`);
      refetch();
    } catch (err) {
      console.error(err);
      refetch();
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel booking
  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      setActionLoading(true);
      await api.post(`/bookings/${id}/cancel`, { reason: 'Customer cancelled' });
      navigate('/bookings', { replace: true });
    } catch (err) {
      console.error(err);
      setToastMsg(err.message || 'Cannot cancel booking at this stage.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !booking) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 py-4">
        <Skeleton className="w-full h-72 rounded-3xl" />
        <Skeleton className="w-full h-44 rounded-3xl" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-danger mx-auto" />
        <h2 className="text-lg font-800 text-ink">Booking not found</h2>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Go to Home
        </Button>
      </div>
    );
  }

  const worker = booking.worker || {};
  const customerPos = { lat: booking.lat || 13.0418, lng: booking.lng || 80.2341 };
  const workerPos = realtimePos || booking.worker_pos || customerPos;
  const displayStatus = realtimeStatus || booking.display_status || booking.status;
  const displayEta = realtimeEta !== null ? realtimeEta : (booking.eta_remaining_min || booking.eta_min || 10);
  const isConfirmed = booking.status === 'confirmed';
  const pendingExtra = (booking.extras || []).find((e) => e.status === 'pending');

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-28">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-3 bg-dangersoft text-danger text-xs font-700 rounded-2xl flex items-center justify-between shadow-sm">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="underline ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Immersive Hero Map with Overlaid Realtime Indicators */}
      <div className="relative w-full h-72 sm:h-80 rounded-3xl overflow-hidden border border-line/70 shadow-lg">
        <MapCard
          customerPos={customerPos}
          workerPos={workerPos}
          workerName={worker.name || 'Worker'}
          className="w-full h-full rounded-none border-0 shadow-none"
        />

        {/* Floating Top Bar on Map: Live WebSocket Stream Indicator */}
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center gap-2 text-[11px] font-800 bg-surface/90 dark:bg-black/75 backdrop-blur-md border border-line/80 px-3 py-1.5 rounded-full shadow-md text-ink">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isWsConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isWsConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
            <span className={isWsConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'}>
              {isWsConnected ? 'Live Stream (<50ms)' : 'Connecting stream…'}
            </span>
          </div>
        </div>

        {/* Floating Fast-Track ETA button */}
        {isConfirmed && (
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={handleFastForward}
              title="Fast-track worker arrival"
              className="flex items-center gap-1.5 text-xs font-800 bg-surface/90 dark:bg-black/75 backdrop-blur-md hover:bg-surface text-primary border border-primary/30 px-3 py-1.5 rounded-full transition shadow-md active:scale-95"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Fast-track</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Single Unified Cohesive Tracking Panel (No fragmented boxed divs) */}
      <div className="bg-surface border border-line/80 rounded-3xl shadow-xl p-5 sm:p-6 space-y-5">
        {/* Status Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-900 text-ink tracking-tight capitalize">
                {t(`status.${displayStatus}`) || displayStatus.replace(/_/g, ' ')}
              </h1>
              {booking.progress_pct !== undefined && isConfirmed && (
                <Chip tone="primary" className="h-5 px-2 text-[10px] font-800">
                  {booking.progress_pct}%
                </Chip>
              )}
            </div>

            <p className="text-xs sm:text-sm text-muted font-600 mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span>
                {displayStatus === 'on_the_way'
                  ? `Arrives in ~${displayEta} mins at ${booking.address || 'your location'}`
                  : displayStatus === 'arrived'
                  ? 'Technician has reached your doorstep'
                  : 'Service is underway at your address'}
              </span>
            </p>
          </div>

          <Chip
            tone={booking.status === 'completed' ? 'success' : isConfirmed ? 'primary' : 'accent'}
            className="h-7 px-3 text-xs font-800 capitalize flex-shrink-0"
          >
            {booking.category ? t(`cat.${booking.category}`) : 'Service'}
          </Chip>
        </div>

        {/* Stepper (Clean & integrated) */}
        <div className="pt-1">
          <StatusStepper currentStatus={displayStatus} />
        </div>

        {/* Doorstep Arrival OTP Code (Unified sleek security element) */}
        {booking.otp && isConfirmed && (
          <div className="p-4 rounded-2xl bg-surface2/80 border border-primary/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 shadow-xs">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-800 text-primary uppercase tracking-wider block">
                  Arrival Code (Share at Doorstep)
                </span>
                <span className="text-xs text-muted font-medium block">
                  Share this 4-digit code with the technician to verify &amp; start the job.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 justify-center sm:justify-end">
              {booking.otp.split('').map((digit, idx) => (
                <span
                  key={idx}
                  className="w-10 h-12 rounded-xl bg-surface border-2 border-primary/40 text-xl font-900 text-primary flex items-center justify-center shadow-xs font-mono"
                >
                  {digit}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Pending Extra Charge Approval Banner */}
        {pendingExtra && (
          <div className="p-4 rounded-2xl bg-accent/10 border-2 border-accent space-y-3 animate-pulse">
            <div className="flex items-center gap-2 text-ink font-800 text-sm">
              <AlertCircle className="w-4 h-4 text-accent flex-shrink-0" />
              <span>Extra Work Requested: ₹{pendingExtra.amount}</span>
            </div>
            <p className="text-xs text-ink/80">
              {pendingExtra.reason || 'Additional materials or extra labor needed.'}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                loading={actionLoading}
                onClick={() => handleExtraRespond(pendingExtra.id, false)}
                className="flex-1 text-xs"
              >
                Decline
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={actionLoading}
                onClick={() => handleExtraRespond(pendingExtra.id, true)}
                className="flex-1 text-xs font-800 bg-accent text-onaccent hover:brightness-110"
              >
                Approve ₹{pendingExtra.amount}
              </Button>
            </div>
          </div>
        )}

        {/* Worker Profile & Details Row */}
        <div className="pt-4 border-t border-line/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-13 h-13 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 border-2 border-line/80 relative">
              <img
                src={getWorkerImage(worker)}
                alt={worker.name || 'Worker'}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-success border-2 border-surface" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-800 text-ink text-base truncate">{worker.name || 'Technician'}</span>
                {worker.id_verified && (
                  <ShieldCheck className="w-4 h-4 text-success flex-shrink-0" title="ID verified" />
                )}
                {worker.skill_verified && (
                  <Wrench className="w-3.5 h-3.5 text-success flex-shrink-0" title="Skill verified" />
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted font-medium mt-0.5">
                <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                <span className="font-800 text-ink">{worker.rating_avg || '4.8'}</span>
                <span>•</span>
                <span className="truncate">{worker.jobs_done || 120}+ jobs completed</span>
              </div>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="text-[11px] text-muted block font-700">Agreed Price</span>
            <span className="font-900 text-ink text-lg sm:text-xl block">
              ₹{booking.final_price || booking.agreed_price}
            </span>
            <span className="text-[10px] text-success font-700 uppercase tracking-wide block">
              Pay After Fix
            </span>
          </div>
        </div>

        {/* Service Details & Address */}
        <div className="p-3.5 rounded-2xl bg-surface2/60 border border-line/60 text-xs space-y-1.5">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-muted leading-tight font-medium">
              {booking.address || 'Service Location'}
            </span>
          </div>
          {booking.description && (
            <p className="text-ink/80 text-[11px] font-semibold pl-5">
              "{booking.description}"
            </p>
          )}
        </div>

        {/* Cancel Booking Link */}
        {isConfirmed && (
          <div className="text-center pt-1 border-t border-line/40">
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="text-xs text-muted hover:text-danger font-700 transition"
            >
              Need to cancel this booking?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
