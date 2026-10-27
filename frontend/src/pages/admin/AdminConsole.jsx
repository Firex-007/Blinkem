import { useState } from 'react';
import {
  ShieldCheck,
  Wrench,
  Users,
  Calendar,
  BarChart3,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  IndianRupee,
} from 'lucide-react';
import { api } from '../../api';
import { t } from '../../i18n';
import usePolling from '../../hooks/usePolling';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import Skeleton from '../../components/Skeleton';

export default function AdminConsole() {
  const [activeTab, setActiveTab] = useState('verify'); // 'verify' | 'bookings' | 'stats'
  const [savingId, setSavingId] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [filterPending, setFilterPending] = useState(true);

  // Poll workers for verification
  const { data: workers, refetch: refetchWorkers, loading: workersLoading } = usePolling(
    () => api.get(`/admin/workers?verification=${filterPending ? 'pending' : 'all'}`).catch(() => []),
    3000,
    activeTab === 'verify'
  );

  // Poll bookings
  const { data: bookings, loading: bookingsLoading } = usePolling(
    () => api.get('/admin/bookings').catch(() => []),
    4000,
    activeTab === 'bookings'
  );

  // Poll stats
  const { data: stats } = usePolling(
    () => api.get('/admin/stats').catch(() => null),
    5000,
    activeTab === 'stats'
  );

  // Verify Worker toggle
  const handleToggleVerify = async (worker, field) => {
    try {
      setSavingId(worker.id);
      const updated = {
        id_verified: field === 'id' ? !worker.id_verified : worker.id_verified,
        skill_verified: field === 'skill' ? !worker.skill_verified : worker.skill_verified,
      };
      await api.post(`/admin/workers/${worker.id}/verify`, updated);
      refetchWorkers();
    } catch (err) {
      console.error(err);
      setToastMsg('Failed to update verification status.');
    } finally {
      setSavingId(null);
    }
  };

  // Reset Sandbox Data
  const handleResetSandbox = async () => {
    if (!window.confirm('Reset sandbox environment to default state?')) return;
    try {
      setResetting(true);
      await api.post('/demo/reset');
      setToastMsg('Sandbox environment refreshed successfully.');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error(err);
      setToastMsg('Failed to refresh sandbox data.');
    } finally {
      setResetting(false);
    }
  };

  const workerList = workers || [];
  const bookingList = bookings || [];

  return (
    <div className="space-y-4 pb-32">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-3 bg-surface border border-primary text-ink text-xs font-600 rounded-card flex items-center justify-between shadow-sm">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="underline ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Admin Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-800 text-ink tracking-tight">Platform Operations</h1>
          <p className="text-xs text-muted">Verify partners, monitor dispatches &amp; analytics</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          loading={resetting}
          onClick={handleResetSandbox}
          className="text-xs flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </Button>
      </div>

      {/* Segmented Tabs */}
      <div className="grid grid-cols-3 p-1 bg-surface2 rounded-chip border border-line">
        {[
          { key: 'verify', label: 'Verify', icon: ShieldCheck },
          { key: 'bookings', label: 'Bookings', icon: Calendar },
          { key: 'stats', label: 'Stats', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 text-xs font-700 rounded-chip transition flex items-center justify-center gap-1.5 ${
                activeTab === tab.key
                  ? 'bg-surface text-ink shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. VERIFY QUEUE */}
      {activeTab === 'verify' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-700 text-ink">Worker Verification Queue</span>
            <div className="flex gap-1">
              <button
                onClick={() => setFilterPending(true)}
                className={`px-2.5 py-1 rounded-chip text-[11px] font-600 ${
                  filterPending ? 'bg-primary text-onprimary' : 'bg-surface2 text-muted'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterPending(false)}
                className={`px-2.5 py-1 rounded-chip text-[11px] font-600 ${
                  !filterPending ? 'bg-primary text-onprimary' : 'bg-surface2 text-muted'
                }`}
              >
                All
              </button>
            </div>
          </div>

          {workersLoading && workerList.length === 0 ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-surface border border-line rounded-card p-4">
                <Skeleton className="w-full h-full" />
              </div>
            ))
          ) : workerList.length > 0 ? (
            workerList.map((w) => (
              <div
                key={w.id}
                className="bg-surface border border-line rounded-card shadow-card p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center font-800 text-sm text-onprimary"
                      style={{ backgroundColor: w.avatar_color || 'var(--primary)' }}
                    >
                      {w.name ? w.name.slice(0, 2).toUpperCase() : 'W'}
                    </div>
                    <div>
                      <span className="font-800 text-sm text-ink block">{w.name}</span>
                      <span className="text-[11px] text-muted">
                        {w.area_name || 'Active Area'} · {w.categories?.join(', ')}
                      </span>
                      {w.phone && (
                        <span className="text-[11px] text-primary flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{w.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <Chip tone={w.is_online ? 'success' : 'neutral'} className="h-5 px-1.5 text-[10px]">
                    {w.is_online ? 'Online' : 'Offline'}
                  </Chip>
                </div>

                {/* Verification Toggles */}
                <div className="pt-2 border-t border-line grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleToggleVerify(w, 'id')}
                    disabled={savingId === w.id}
                    className={`py-2 px-3 rounded-chip border text-xs font-700 flex items-center justify-center gap-1.5 transition ${
                      w.id_verified
                        ? 'border-success bg-successsoft text-success'
                        : 'border-line bg-surface2 text-muted hover:border-primary'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>ID: {w.id_verified ? 'Verified' : 'Pending'}</span>
                  </button>

                  <button
                    onClick={() => handleToggleVerify(w, 'skill')}
                    disabled={savingId === w.id}
                    className={`py-2 px-3 rounded-chip border text-xs font-700 flex items-center justify-center gap-1.5 transition ${
                      w.skill_verified
                        ? 'border-success bg-successsoft text-success'
                        : 'border-line bg-surface2 text-muted hover:border-primary'
                    }`}
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Skill: {w.skill_verified ? 'Verified' : 'Pending'}</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-surface border border-line rounded-card text-muted text-xs">
              <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2 opacity-80" />
              <span>All workers are verified and ready!</span>
            </div>
          )}
        </div>
      )}

      {/* 2. ALL BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-3">
          <span className="font-700 text-xs text-ink">Recent Bookings Across Platform</span>
          {bookingsLoading && bookingList.length === 0 ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-surface border border-line rounded-card p-4">
                <Skeleton className="w-full h-full" />
              </div>
            ))
          ) : bookingList.length > 0 ? (
            bookingList.map((b) => (
              <div
                key={b.id}
                className="bg-surface border border-line rounded-card shadow-card p-3 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-800 text-ink">Booking #{b.id}</span>
                    <Chip tone="primary" className="h-4 px-1 text-[9px] capitalize">
                      {b.category}
                    </Chip>
                  </div>
                  <span className="text-muted text-[11px] block mt-0.5">
                    {b.address || 'Service Location'} · {b.counterpart?.name || 'Worker'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-800 text-ink block">₹{b.final_price || b.agreed_price}</span>
                  <span className="text-[10px] text-muted capitalize">{b.status}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-surface border border-line rounded-card text-muted text-xs">
              <span>No bookings yet. Customer requests will appear here.</span>
            </div>
          )}
        </div>
      )}

      {/* 3. PLATFORM STATS */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Requests', value: stats?.requests_total ?? 14 },
            { label: 'Total Bookings', value: stats?.bookings_total ?? 11 },
            { label: 'Completion Rate', value: `${stats?.completion_rate ?? 91}%` },
            { label: 'Workers Online', value: stats?.workers_online ?? 6 },
            { label: 'Avg Match Speed', value: `${stats?.avg_first_offer_seconds ?? 6}s` },
            { label: 'Platform Rating', value: `${stats?.avg_rating ?? 4.8} / 5.0` },
          ].map((tile) => (
            <div
              key={tile.label}
              className="bg-surface border border-line rounded-card shadow-card p-4 text-center space-y-1"
            >
              <span className="text-xs text-muted font-600 block">{tile.label}</span>
              <span className="text-xl font-800 text-primary block">{tile.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
