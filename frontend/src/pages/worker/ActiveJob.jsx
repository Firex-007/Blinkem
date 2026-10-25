import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  IndianRupee,
} from 'lucide-react';
import { api } from '../../api';
import { t } from '../../i18n';
import usePolling from '../../hooks/usePolling';
import MapCard from '../../components/MapCard';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import Skeleton from '../../components/Skeleton';

export default function ActiveJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [startLoading, setStartLoading] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [extraOpen, setExtraOpen] = useState(false);
  const [extraAmount, setExtraAmount] = useState('');
  const [extraReason, setExtraReason] = useState('');
  const [extraSubmitting, setExtraSubmitting] = useState(false);
  const [errorToast, setErrorToast] = useState(null);
  const [shakeOtp, setShakeOtp] = useState(false);

  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Poll booking state every 2s
  const { data: booking, error, loading, refetch } = usePolling(
    () => api.get(`/bookings/${id}`),
    2000,
    true
  );

  // OTP input handler
  const handleOtpChange = (index, val) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...otpDigits];
    updated[index] = val;
    setOtpDigits(updated);

    if (val && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  // Start Job with OTP
  const handleStartJob = async () => {
    const code = otpDigits.join('');
    if (code.length !== 4) {
      setErrorToast('Please enter the full 4-digit code provided by the customer.');
      return;
    }
    try {
      setStartLoading(true);
      setErrorToast(null);
      await api.post(`/bookings/${id}/start`, { otp: code });
      refetch();
    } catch (err) {
      console.error(err);
      setErrorToast(err.message || 'Incorrect code. Ask customer for the 4-digit code.');
      setShakeOtp(true);
      setTimeout(() => setShakeOtp(false), 800);
    } finally {
      setStartLoading(false);
    }
  };

  // Add Extra Charge
  const handleAddExtra = async (e) => {
    e.preventDefault();
    const amt = parseInt(extraAmount, 10);
    if (!amt || amt <= 0) return;
    try {
      setExtraSubmitting(true);
      setErrorToast(null);
      await api.post(`/bookings/${id}/extra`, {
        amount: amt,
        reason: extraReason || 'Extra materials / labor',
      });
      setExtraOpen(false);
      setExtraAmount('');
      setExtraReason('');
      refetch();
    } catch (err) {
      console.error(err);
      setErrorToast(err.message || 'Failed to submit extra charge request.');
    } finally {
      setExtraSubmitting(false);
    }
  };

  // Mark Job Complete
  const handleCompleteJob = async () => {
    try {
      setCompleteLoading(true);
      setErrorToast(null);
      await api.post(`/bookings/${id}/complete`);
      refetch();
      setTimeout(() => navigate('/worker'), 1200);
    } catch (err) {
      console.error(err);
      setErrorToast(err.message || 'Cannot complete while an extra charge is pending.');
    } finally {
      setCompleteLoading(false);
    }
  };

  if (loading && !booking) {
    return (
      <div className="space-y-4 py-4">
        <Skeleton className="w-full h-44 rounded-card" />
        <Skeleton className="w-full h-32 rounded-card" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-danger mx-auto" />
        <h2 className="text-lg font-700 text-ink">Job not found</h2>
        <Button variant="secondary" onClick={() => navigate('/worker')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const isConfirmed = booking.status === 'confirmed';
  const isInProgress = booking.status === 'in_progress';
  const isCompleted = booking.status === 'completed';
  const pendingExtra = (booking.extras || []).find((e) => e.status === 'pending');
  const customerPos = { lat: booking.lat || 13.0418, lng: booking.lng || 80.2341 };

  return (
    <div className="space-y-4 pb-20">
      {/* Toast Alert */}
      {errorToast && (
        <div className="p-3 bg-dangersoft text-danger text-xs font-600 rounded-card flex items-center justify-between animate-bounce">
          <span>{errorToast}</span>
          <button onClick={() => setErrorToast(null)} className="underline ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Customer Location Map */}
      <MapCard customerPos={customerPos} workerName="Customer" />

      {/* Status Bar */}
      <div className="bg-surface border border-line rounded-card shadow-card p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-800 text-ink">
              {booking.category ? t(`cat.${booking.category}`) : 'Job'} #{booking.id}
            </h1>
            <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>{booking.address || 'Chennai'}</span>
            </p>
          </div>
          <Chip
            tone={isCompleted ? 'success' : isInProgress ? 'primary' : 'accent'}
            className="h-6 px-2.5 text-xs font-700 capitalize"
          >
            {booking.status}
          </Chip>
        </div>
        <p className="text-xs text-ink/80 pt-1 border-t border-line">
          {booking.description || 'No description provided.'}
        </p>
      </div>

      {/* 1. If CONFIRMED: Enter Customer OTP to Start */}
      {isConfirmed && (
        <div
          className={`bg-surface border border-line rounded-card shadow-card p-5 space-y-4 text-center transition ${
            shakeOtp ? 'animate-bounce border-danger' : ''
          }`}
        >
          <div>
            <h3 className="text-base font-800 text-ink">
              Enter Customer Code to Start
            </h3>
            <p className="text-xs text-muted mt-1">
              Ask the customer for the 4-digit code shown on their screen.
            </p>
          </div>

          <div className="flex justify-center gap-3">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 text-center text-2xl font-800 bg-surface2 border-2 border-line focus:border-primary rounded-xl text-ink focus:outline-none"
              />
            ))}
          </div>

          <Button
            variant="primary"
            loading={startLoading}
            onClick={handleStartJob}
            className="w-full font-700"
          >
            Start Job
          </Button>
        </div>
      )}

      {/* 2. If IN_PROGRESS: Active Job Actions */}
      {isInProgress && (
        <div className="bg-surface border border-line rounded-card shadow-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-700 text-success uppercase block">
                Work in Progress
              </span>
              <span className="font-800 text-lg text-ink">
                Agreed: ₹{booking.agreed_price}
              </span>
            </div>
            {booking.extra_total > 0 && (
              <Chip tone="success" className="h-6 px-2 text-xs">
                + ₹{booking.extra_total} extra approved
              </Chip>
            )}
          </div>

          {/* Pending Extra banner */}
          {pendingExtra && (
            <div className="p-3 bg-accent/15 border border-accent/40 rounded-chip text-xs text-ink space-y-1 animate-pulse">
              <span className="font-700 block">
                Extra Work Proposed: ₹{pendingExtra.amount}
              </span>
              <span className="text-muted block">{pendingExtra.reason}</span>
              <span className="text-[11px] font-600 text-accent">
                Waiting for customer approval…
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2 pt-2">
            {!pendingExtra && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setExtraOpen(true)}
                className="w-full text-xs flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Extra Work / Materials</span>
              </Button>
            )}

            <Button
              variant="primary"
              loading={completeLoading}
              disabled={Boolean(pendingExtra)}
              onClick={handleCompleteJob}
              className="w-full font-700"
            >
              Mark Job Complete
            </Button>
          </div>
        </div>
      )}

      {/* 3. If COMPLETED */}
      {isCompleted && (
        <div className="p-6 text-center bg-surface border border-line rounded-card space-y-3">
          <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
          <h3 className="text-lg font-800 text-ink">Job Completed!</h3>
          <p className="text-xs text-muted">
            Final amount: ₹{booking.final_price || booking.agreed_price}. Payment will be settled
            to your wallet/account.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/worker')}
            className="mt-2"
          >
            Back to Dashboard
          </Button>
        </div>
      )}

      {/* Modal: Propose Extra Work */}
      {extraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleAddExtra}
            className="w-full max-w-sm bg-surface rounded-card border border-line shadow-card p-5 space-y-4 animate-slideUp"
          >
            <h3 className="text-base font-800 text-ink">Request Extra Charges</h3>
            <p className="text-xs text-muted">
              Add costs for extra parts, pipes, or unexpected work. Cannot exceed ₹
              {booking.agreed_price}.
            </p>

            <div>
              <label className="text-xs font-700 text-muted block mb-1">
                Extra Amount (₹)
              </label>
              <div className="flex items-center bg-surface2 border border-line rounded-chip px-3 py-2">
                <IndianRupee className="w-4 h-4 text-muted mr-1" />
                <input
                  type="number"
                  value={extraAmount}
                  onChange={(e) => setExtraAmount(e.target.value)}
                  className="w-full bg-transparent font-700 text-base text-ink focus:outline-none"
                  placeholder="e.g. 150"
                  max={booking.agreed_price}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-700 text-muted block mb-1">
                Reason / Parts
              </label>
              <input
                type="text"
                value={extraReason}
                onChange={(e) => setExtraReason(e.target.value)}
                className="w-full p-2.5 rounded-chip bg-surface2 border border-line text-xs text-ink focus:outline-none"
                placeholder="e.g. Replaced leaking valve"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setExtraOpen(false)}
                className="flex-1 text-xs"
              >
                {t('cancel')}
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={extraSubmitting}
                className="flex-1 text-xs font-700"
              >
                Send Request
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
