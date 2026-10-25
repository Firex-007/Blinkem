import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Sparkles, ArrowUpDown, Loader2, IndianRupee, X } from 'lucide-react';
import { api } from '../../api';
import { t } from '../../i18n';
import usePolling from '../../hooks/usePolling';
import OfferCard from '../../components/OfferCard';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import Skeleton from '../../components/Skeleton';

export default function Offers() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('cheapest'); // 'cheapest' | 'fastest' | 'rating'
  const [counterOffer, setCounterOffer] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [submittingCounter, setSubmittingCounter] = useState(false);
  const [bookingLoadingId, setBookingLoadingId] = useState(null);
  const [errorToast, setErrorToast] = useState(null);

  // Poll request every 2s to catch new incoming quotes & counter status
  const { data: request, error, loading, refetch } = usePolling(
    () => api.get(`/requests/${id}`),
    2000,
    true
  );

  // If already booked, auto-navigate to booking screen
  if (request?.booking_id) {
    navigate(`/booking/${request.booking_id}`, { replace: true });
  }

  const rawOffers = request?.offers || [];

  // Sort offers
  const sortedOffers = useMemo(() => {
    const list = [...rawOffers];
    if (sortBy === 'cheapest') {
      list.sort((a, b) => (a.counter_price || a.price) - (b.counter_price || b.price));
    } else if (sortBy === 'fastest') {
      list.sort((a, b) => a.eta_min - b.eta_min);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.worker?.rating_avg || 0) - (a.worker?.rating_avg || 0));
    }
    return list;
  }, [rawOffers, sortBy]);

  // Handle Booking
  const handleBook = async (offer) => {
    try {
      setBookingLoadingId(offer.id);
      setErrorToast(null);
      const res = await api.post(`/offers/${offer.id}/accept`);
      if (res?.booking_id) {
        navigate(`/booking/${res.booking_id}`);
      } else {
        refetch();
      }
    } catch (err) {
      console.error(err);
      setErrorToast(err.message || 'Failed to book worker. Please retry.');
    } finally {
      setBookingLoadingId(null);
    }
  };

  // Open Counter Modal
  const openCounterModal = (offer) => {
    setCounterOffer(offer);
    const defaultCounter = Math.round((offer.price * 0.85) / 10) * 10;
    setCounterPrice(String(defaultCounter));
  };

  // Submit Counter
  const handleSendCounter = async () => {
    if (!counterOffer || !counterPrice) return;
    try {
      setSubmittingCounter(true);
      setErrorToast(null);
      await api.post(`/offers/${counterOffer.id}/counter`, {
        price: parseInt(counterPrice, 10),
      });
      setCounterOffer(null);
      refetch();
    } catch (err) {
      console.error(err);
      setErrorToast(err.message || 'Counter price must be at least 40% of offer.');
    } finally {
      setSubmittingCounter(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-24">
      {/* Header with Title and Offer Count */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-800 text-ink tracking-tight">
            {t('offers.title')}
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Compare prices &amp; ratings, book in one tap
          </p>
        </div>
        <Chip tone="accent" className="h-7 px-3 text-xs font-700">
          {rawOffers.length} {rawOffers.length === 1 ? 'offer' : 'offers'}
        </Chip>
      </div>

      {/* Sorting bar & Live searching indicator */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5">
          {[
            { key: 'cheapest', label: 'Cheapest' },
            { key: 'fastest', label: 'Fastest' },
            { key: 'rating', label: 'Top rated' },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={`px-3 py-1.5 rounded-chip text-xs font-600 transition ${
                sortBy === s.key
                  ? 'bg-primary text-onprimary shadow-sm'
                  : 'bg-surface2 text-muted hover:bg-line'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {rawOffers.length < 4 && (
          <div className="flex items-center gap-1.5 text-xs text-muted shrink-0 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            <span className="text-[11px]">Searching for more…</span>
          </div>
        )}
      </div>

      {/* Error Toast */}
      {errorToast && (
        <div className="p-3 bg-dangersoft text-danger text-xs font-600 rounded-card flex items-center justify-between">
          <span>{errorToast}</span>
          <button onClick={() => setErrorToast(null)} className="underline ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Offers List */}
      <div className="space-y-3">
        {loading && rawOffers.length === 0 ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-surface border border-line rounded-card p-4">
              <Skeleton className="w-full h-full" />
            </div>
          ))
        ) : sortedOffers.length > 0 ? (
          sortedOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onBook={handleBook}
              onCounter={openCounterModal}
              bookingLoading={bookingLoadingId === offer.id}
            />
          ))
        ) : (
          <div className="p-8 text-center bg-surface border border-line rounded-card space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-sm font-700 text-ink">Waiting for quotes…</p>
            <p className="text-xs text-muted">
              Nearby workers are reviewing your request. Offers will appear right here.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Reassurance */}
      <div className="p-3 rounded-card bg-surface border border-line text-center text-xs text-muted flex items-center justify-center gap-2">
        <Shield className="w-4 h-4 text-success" />
        <span>Pay after the service is completed to your satisfaction.</span>
      </div>

      {/* Counter-Offer BottomSheet */}
      {counterOffer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:p-4">
          <div className="w-full max-w-[480px] bg-surface rounded-t-[28px] sm:rounded-card border-t sm:border border-line shadow-card p-6 space-y-5 animate-slideUp">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-800 text-ink">Offer your price</h3>
                <p className="text-xs text-muted">
                  Worker quoted ₹{counterOffer.price}. Propose your counter-price.
                </p>
              </div>
              <button
                onClick={() => setCounterOffer(null)}
                className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center text-muted hover:text-ink transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick discount chips */}
            <div className="flex gap-2">
              {[
                { pct: 0.9, label: '-10%' },
                { pct: 0.85, label: '-15%' },
                { pct: 0.8, label: '-20%' },
              ].map((c) => {
                const discounted = Math.round((counterOffer.price * c.pct) / 10) * 10;
                return (
                  <button
                    key={c.label}
                    onClick={() => setCounterPrice(String(discounted))}
                    className="flex-1 py-1.5 bg-surface2 hover:bg-soft rounded-chip text-xs font-700 text-ink transition"
                  >
                    {c.label} (₹{discounted})
                  </button>
                );
              })}
            </div>

            {/* Price input */}
            <div className="relative">
              <label className="text-xs font-700 text-muted block mb-1">
                Your Offer (₹)
              </label>
              <div className="flex items-center bg-surface2 border border-line rounded-chip px-3 py-2">
                <IndianRupee className="w-5 h-5 text-muted mr-1" />
                <input
                  type="number"
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value)}
                  className="w-full bg-transparent font-800 text-xl text-ink focus:outline-none"
                  min="50"
                  max="20000"
                />
              </div>
              <p className="text-[11px] text-muted mt-1">
                Maximum 1 counter round. Worker can accept or maintain original price.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => setCounterOffer(null)}
                className="flex-1"
              >
                {t('cancel')}
              </Button>
              <Button
                variant="primary"
                loading={submittingCounter}
                onClick={handleSendCounter}
                className="flex-1 font-700"
              >
                Send offer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
