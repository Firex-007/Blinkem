import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Wrench,
  Star,
  MapPin,
  Clock,
  IndianRupee,
  Plus,
  Minus,
  Check,
  X,
  AlertCircle,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../api';
import { t } from '../../i18n';
import usePolling from '../../hooks/usePolling';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import Skeleton from '../../components/Skeleton';

export default function WorkerHome() {
  const navigate = useNavigate();
  const [toggleLoading, setToggleLoading] = useState(false);
  const [quotePrices, setQuotePrices] = useState({});
  const [quotingId, setQuotingId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // Poll worker profile & stats
  const { data: meData, refetch: refetchMe } = usePolling(
    () => api.get('/worker/me'),
    4000,
    true
  );

  const worker = meData?.worker || {
    name: 'Muthu K',
    rating_avg: 4.8,
    id_verified: true,
    skill_verified: true,
    is_online: true,
    categories: ['plumber'],
  };
  const stats = meData?.stats || {
    earnings_today: 1250,
    jobs_today: 3,
    jobs_done: 48,
    rating_avg: 4.8,
  };

  const isOnline = worker.is_online;

  // Poll inbox every 2s when online
  const { data: inbox, refetch: refetchInbox } = usePolling(
    () => (isOnline ? api.get('/worker/inbox') : Promise.resolve([])),
    2000,
    isOnline
  );

  // Poll active jobs
  const { data: jobsData } = usePolling(
    () => api.get('/worker/jobs'),
    3000,
    true
  );

  const activeJob = jobsData?.active?.[0];

  // Toggle Online/Offline
  const handleToggleOnline = async () => {
    try {
      setToggleLoading(true);
      await api.patch('/worker/me', { is_online: !isOnline });
      refetchMe();
      refetchInbox();
    } catch (err) {
      console.error(err);
      setToastMsg('Failed to update online status');
    } finally {
      setToggleLoading(false);
    }
  };

  // Stepper for custom quote
  const getPrice = (item) => {
    return quotePrices[item.dispatch_id] ?? item.suggested_price ?? 299;
  };

  const stepPrice = (item, delta) => {
    const cur = getPrice(item);
    const updated = Math.max(50, cur + delta);
    setQuotePrices((prev) => ({ ...prev, [item.dispatch_id]: updated }));
  };

  // Send Quote
  const handleSendQuote = async (item) => {
    try {
      setQuotingId(item.dispatch_id);
      const price = getPrice(item);
      await api.post(`/worker/dispatches/${item.dispatch_id}/quote`, { price });
      refetchInbox();
    } catch (err) {
      console.error(err);
      setToastMsg(err.message || 'Failed to submit quote');
    } finally {
      setQuotingId(null);
    }
  };

  // Decline Dispatch
  const handleDeclineDispatch = async (item) => {
    try {
      setActionLoadingId(item.dispatch_id);
      await api.post(`/worker/dispatches/${item.dispatch_id}/decline`);
      refetchInbox();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Respond to Counter-Offer
  const handleRespondCounter = async (item, accept) => {
    try {
      setActionLoadingId(item.offer_id);
      const res = await api.post(`/worker/offers/${item.offer_id}/respond-counter`, {
        accept,
      });
      if (res?.booking_id) {
        navigate(`/worker/job/${res.booking_id}`);
      } else {
        refetchInbox();
      }
    } catch (err) {
      console.error(err);
      setToastMsg(err.message || 'Failed to respond to counter');
    } finally {
      setActionLoadingId(null);
    }
  };

  const inboxList = inbox || [];

  return (
    <div className="space-y-4 pb-32">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3 bg-dangersoft text-danger text-xs font-600 rounded-card flex items-center justify-between">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="underline ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Worker Profile Header */}
      <div className="bg-surface border border-line rounded-card shadow-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-800 text-sm text-onprimary shadow-sm"
            style={{ backgroundColor: worker.avatar_color || 'var(--primary)' }}
          >
            {worker.name ? worker.name.slice(0, 2).toUpperCase() : 'W'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-800 text-ink text-base">{worker.name}</span>
              {worker.id_verified && (
                <ShieldCheck className="w-4 h-4 text-success" title="ID verified" />
              )}
              {worker.skill_verified && (
                <Wrench className="w-3.5 h-3.5 text-success" title="Skill verified" />
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted">
              <Star className="w-3.5 h-3.5 fill-accent text-accent" />
              <span className="font-700 text-ink">{worker.rating_avg}</span>
              <span>· {worker.area_name || 'T. Nagar'}</span>
            </div>
          </div>
        </div>

        {/* Category badges */}
        <div className="flex gap-1 flex-wrap justify-end max-w-[120px]">
          {(worker.categories || ['plumber']).map((cat) => (
            <Chip key={cat} tone="primary" className="h-5 px-1.5 text-[10px]">
              {t(`cat.${cat}`) || cat}
            </Chip>
          ))}
        </div>
      </div>

      {/* Online / Offline Big Switch Card */}
      <div
        className={`p-4 rounded-card border transition flex items-center justify-between ${
          isOnline
            ? 'bg-successsoft/40 border-success/30'
            : 'bg-surface2 border-line'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`w-3.5 h-3.5 rounded-full ${
              isOnline ? 'bg-success animate-pulse' : 'bg-muted'
            }`}
          />
          <div>
            <span className="font-800 text-ink text-sm block">
              {isOnline ? "You're Online" : "You're Offline"}
            </span>
            <span className="text-[11px] text-muted">
              {isOnline ? 'Receiving job requests nearby' : 'Turn on to get jobs'}
            </span>
          </div>
        </div>

        <button
          onClick={handleToggleOnline}
          disabled={toggleLoading}
          className={`w-14 h-8 rounded-full p-1 transition flex items-center ${
            isOnline ? 'bg-success justify-end' : 'bg-muted justify-start'
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-white shadow-md transform transition" />
        </button>
      </div>

      {/* Today's Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-surface border border-line rounded-card p-3 text-center">
          <span className="text-[11px] text-muted block">Today's Earnings</span>
          <span className="font-800 text-base text-ink flex items-center justify-center">
            <IndianRupee className="w-3.5 h-3.5" />
            <span>{stats.earnings_today || 0}</span>
          </span>
        </div>
        <div className="bg-surface border border-line rounded-card p-3 text-center">
          <span className="text-[11px] text-muted block">Jobs Today</span>
          <span className="font-800 text-base text-ink">{stats.jobs_today || 0}</span>
        </div>
        <div className="bg-surface border border-line rounded-card p-3 text-center">
          <span className="text-[11px] text-muted block">Total Done</span>
          <span className="font-800 text-base text-ink">{stats.jobs_done || 0}</span>
        </div>
      </div>

      {/* Active Job Floating / Card Banner */}
      {activeJob && (
        <div
          onClick={() => navigate(`/worker/job/${activeJob.id}`)}
          role="button"
          tabIndex={0}
          className="bg-primary text-onprimary rounded-card p-4 shadow-card flex items-center justify-between cursor-pointer animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-800 text-sm">Active Job In Progress</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full uppercase font-700">
                  {activeJob.status}
                </span>
              </div>
              <span className="text-xs opacity-90 block">
                {activeJob.address || 'Service Location'} · ₹{activeJob.final_price || activeJob.agreed_price}
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 opacity-80" />
        </div>
      )}

      {/* Incoming Requests Feed */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-800 text-ink">
            Incoming Jobs ({inboxList.length})
          </h2>
          {isOnline && (
            <span className="text-[11px] text-muted flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success animate-ping" />
              Live Feed
            </span>
          )}
        </div>

        {!isOnline ? (
          <div className="p-8 text-center bg-surface border border-line rounded-card space-y-2">
            <p className="text-sm font-700 text-ink">You are currently offline</p>
            <p className="text-xs text-muted">
              Toggle the switch above to go online and receive customer requests in real-time.
            </p>
          </div>
        ) : inboxList.length > 0 ? (
          inboxList.map((item) => {
            const req = item.request || {};
            const isCounter = item.kind === 'counter';
            const price = getPrice(item);

            if (isCounter) {
              return (
                <div
                  key={item.offer_id}
                  className="bg-surface border-2 border-accent rounded-card shadow-card p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Chip tone="warning" className="h-6 px-2 text-xs font-700">
                      Counter-Offer Received
                    </Chip>
                    <span className="text-xs text-muted">
                      Original: ₹{item.customer_price}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-800 text-ink text-base">
                      Customer offered ₹{item.counter_price}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">
                      {req.category} · {req.address}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={actionLoadingId === item.offer_id}
                      onClick={() => handleRespondCounter(item, false)}
                      className="flex-1 text-xs"
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      Decline
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      loading={actionLoadingId === item.offer_id}
                      onClick={() => handleRespondCounter(item, true)}
                      className="flex-1 text-xs font-700 bg-accent text-onaccent hover:brightness-110"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Accept ₹{item.counter_price}
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item.dispatch_id}
                className="bg-surface border border-line rounded-card shadow-card p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Chip tone="primary" className="h-6 px-2 text-xs font-700 capitalize">
                      {t(`cat.${req.category}`) || req.category}
                    </Chip>
                    {req.distance_km !== undefined && (
                      <span className="text-xs text-muted font-600">
                        {req.distance_km} km away
                      </span>
                    )}
                  </div>
                  <Chip tone="accent" className="h-5 px-1.5 text-[10px]">
                    ~{req.eta_min || 10} min arrival
                  </Chip>
                </div>

                <div>
                  <p className="text-sm font-700 text-ink">
                    {req.description || 'Service required'}
                  </p>
                  <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{req.address || 'Service Location'}</span>
                  </p>
                </div>

                {/* Price Quote Stepper */}
                <div className="p-3 bg-surface2 rounded-chip flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-muted block font-600">
                      Your Price Quote
                    </span>
                    <span className="text-[10px] text-muted">
                      (Fair: ₹{item.price_min} – ₹{item.price_max})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => stepPrice(item, -10)}
                      className="w-8 h-8 rounded-full bg-surface border border-line flex items-center justify-center text-ink hover:bg-soft transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-800 text-base text-ink min-w-[50px] text-center">
                      ₹{price}
                    </span>
                    <button
                      onClick={() => stepPrice(item, 10)}
                      className="w-8 h-8 rounded-full bg-surface border border-line flex items-center justify-center text-ink hover:bg-soft transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={actionLoadingId === item.dispatch_id}
                    onClick={() => handleDeclineDispatch(item)}
                    className="flex-1 text-xs"
                  >
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={quotingId === item.dispatch_id}
                    onClick={() => handleSendQuote(item)}
                    className="flex-1 text-xs font-700"
                  >
                    Send Quote (₹{price})
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-surface border border-line rounded-card space-y-2">
            <Clock className="w-8 h-8 text-primary/60 mx-auto animate-pulse" />
            <p className="text-sm font-700 text-ink">Waiting for new requests…</p>
            <p className="text-xs text-muted">
              You will be alerted instantly when customers near T. Nagar request a{' '}
              {worker.categories?.[0] || 'worker'}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
