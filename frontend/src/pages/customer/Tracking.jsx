import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Wrench,
  Star,
  Clock,
  Phone,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  FastForward,
} from 'lucide-react';
import { api } from '../../api';
import { t } from '../../i18n';
import usePolling from '../../hooks/usePolling';
import MapCard from '../../components/MapCard';
import StatusStepper from '../../components/StatusStepper';
import Button from '../../components/Button';
import Card from '../../components/Card';
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

  // Relaxed heartbeat polling every 8s (graceful backup) instead of aggressive 2s loop
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
      // If endpoint not implemented yet, just refetch
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
      <div className="space-y-4 py-4">
        <Skeleton className="w-full h-48 rounded-card" />
        <Skeleton className="w-full h-24 rounded-card" />
        <Skeleton className="w-full h-32 rounded-card" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-danger mx-auto" />
        <h2 className="text-lg font-700 text-ink">Booking not found</h2>
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
    <div className="max-w-3xl mx-auto space-y-4 pb-24">
      {/* Live WebSocket Status Banner */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-[11px] font-800 bg-surface border border-line/60 px-3 py-1 rounded-full shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isWsConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isWsConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </span>
          <span className={isWsConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'}>
            {isWsConnected ? 'Live WebSocket Stream (<50ms)' : 'Connecting Realtime Stream…'}
          </span>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-3 bg-dangersoft text-danger text-xs font-600 rounded-card flex items-center justify-between">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="underline ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Live Map Card */}
      <MapCard
        customerPos={customerPos}
        workerPos={workerPos}
        workerName={worker.name || 'Worker'}
      />

      {/* ETA & Status Header */}
      <div className="bg-surface border border-line rounded-card shadow-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-800 text-ink capitalize">
                {t(`status.${displayStatus}`) || displayStatus.replace(/_/g, ' ')}
              </span>
              {booking.progress_pct !== undefined && isConfirmed && (
                <Chip tone="primary" className="h-5 px-1.5 text-[10px]">
                  {booking.progress_pct}%
                </Chip>
              )}
            </div>
            <p className="text-xs text-muted mt-0.5">
              {displayStatus === 'on_the_way'
                ? `Arrives in ~${displayEta} min`
                : displayStatus === 'arrived'
                ? 'Worker is at your doorstep'
                : 'Service underway'}
            </p>
          </div>

          {/* Fast-track arrival button */}
          {isConfirmed && (
            <button
              onClick={handleFastForward}
              title="Fast-track worker arrival"
              className="flex items-center gap-1 text-[11px] font-700 bg-surface2 hover:bg-soft text-primary px-2.5 py-1.5 rounded-chip transition"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Fast-track ETA</span>
            </button>
          )}
        </div>

        {/* Stepper */}
        <StatusStepper currentStatus={displayStatus} />
      </div>

      {/* OTP Display Card (Shown to customer to share with worker) */}
      {booking.otp && isConfirmed && (
        <div className="bg-primary/5 border border-primary/20 rounded-card p-5 text-center space-y-2">
          <span className="text-xs font-700 text-primary uppercase tracking-wider block">
            {t('track.code') || 'Share this code when worker arrives'}
          </span>
          <div className="flex items-center justify-center gap-3 py-1">
            {booking.otp.split('').map((digit, idx) => (
              <div
                key={idx}
                className="w-12 h-14 bg-surface border-2 border-primary rounded-xl flex items-center justify-center text-2xl font-800 text-primary shadow-sm"
              >
                {digit}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted">
            The worker will enter this 4-digit code in their app to start the job.
          </p>
        </div>
      )}

      {/* Pending Extra Charge Request Alert */}
      {pendingExtra && (
        <div className="bg-accent/10 border-2 border-accent rounded-card p-4 space-y-3 animate-pulse">
          <div className="flex items-center gap-2 text-ink font-800 text-sm">
            <AlertCircle className="w-4 h-4 text-accent" />
            <span>Extra Work Requested: ₹{pendingExtra.amount}</span>
          </div>
          <p className="text-xs text-ink/80">
            {pendingExtra.reason || 'Additional materials / repairs needed.'}
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
              className="flex-1 text-xs font-700 bg-accent text-onaccent hover:brightness-110"
            >
              Approve ₹{pendingExtra.amount}
            </Button>
          </div>
        </div>
      )}

      {/* Worker Card Info */}
      <div className="bg-surface border border-line rounded-card shadow-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 border-2 border-line/60 relative">
              <img
                src={getWorkerImage(worker)}
                alt={worker.name || 'Worker'}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-success border-2 border-surface" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-700 text-ink text-base">{worker.name}</span>
                {worker.id_verified && (
                  <ShieldCheck className="w-4 h-4 text-success" title="ID verified" />
                )}
                {worker.skill_verified && (
                  <Wrench className="w-3.5 h-3.5 text-success" title="Skill verified" />
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted">
                <Star className="w-3 h-3 fill-accent text-accent" />
                <span className="font-700 text-ink">{worker.rating_avg || '5.0'}</span>
                <span>•</span>
                <span>{booking.category ? t(`cat.${booking.category}`) : 'Expert'}</span>
              </div>
            </div>
          </div>

          <button
            disabled
            title="In-app VoIP calling"
            className="w-10 h-10 rounded-full bg-surface2 text-muted flex items-center justify-center opacity-60 cursor-not-allowed"
          >
            <Phone className="w-4 h-4" />
          </button>
        </div>

        {/* Pricing breakdown */}
        <div className="pt-3 border-t border-line flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <span className="text-muted block">Agreed Price</span>
            <span className="font-800 text-ink text-base">
              ₹{booking.final_price || booking.agreed_price}
            </span>
            {booking.extra_total > 0 && (
              <span className="text-[11px] text-muted block">
                (Includes ₹{booking.extra_total} approved extras)
              </span>
            )}
          </div>
          <Chip tone="success" className="h-6 px-2 text-[11px]">
            Pay after service
          </Chip>
        </div>
      </div>

      {/* Cancel option */}
      {isConfirmed && (
        <div className="text-center pt-2">
          <button
            onClick={handleCancel}
            disabled={actionLoading}
            className="text-xs text-muted hover:text-danger underline transition"
          >
            Cancel this booking
          </button>
        </div>
      )}
    </div>
  );
}
