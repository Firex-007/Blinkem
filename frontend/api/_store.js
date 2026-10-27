// Shared mock store for Vercel Serverless environment
import { WORKERS } from './nearby-workers.js';

// In-memory persistent map across warm serverless invocations
if (!global._blinkemStore) {
  global._blinkemStore = {
    requests: new Map(),
    bookings: new Map(),
    offers: new Map(),
    nextRequestId: 101,
    nextBookingId: 201,
    nextOfferId: 301,
  };
}

export const store = global._blinkemStore;

export function getWorkersForCategory(category) {
  let list = WORKERS.filter((w) => !category || w.categories.includes(category));
  if (list.length === 0) list = WORKERS.slice(0, 3);
  return list;
}

export function createMockRequest({ category, description, lat, lng, address, urgency, budget_hint, voice_transcript }) {
  const id = store.nextRequestId++;
  const matchedWorkers = getWorkersForCategory(category);

  const request = {
    id,
    customer_id: 1,
    category: category || 'plumber',
    description: description || 'General service needed',
    address: address || 'Current Service Location',
    lat: lat || 12.9716,
    lng: lng || 77.5946,
    urgency: urgency || 'now',
    budget_hint: budget_hint || null,
    voice_transcript: voice_transcript || null,
    status: 'offers_ready',
    created_at: new Date().toISOString(),
    first_offer_at: new Date().toISOString(),
    matched_count: matchedWorkers.length,
    booking_id: null,
  };

  const offers = matchedWorkers.map((w, idx) => {
    const offerId = store.nextOfferId++;
    const price = budget_hint ? Math.max(199, Math.round(budget_hint * (0.95 + idx * 0.08))) : (w.base_price || 299 + idx * 50);
    const offer = {
      id: offerId,
      request_id: id,
      worker_id: w.id,
      worker: {
        id: w.id,
        name: w.name,
        avatar_color: w.avatar_color || '#1F5BFF',
        area_name: address ? address.split(',')[0] : 'Local Area',
        rating_avg: w.rating || 4.8,
        rating_count: w.rating_count || 112,
        jobs_done: w.jobs_done || 140,
        id_verified: true,
        skill_verified: true,
        languages: w.languages || ['ta', 'en'],
        categories: w.categories || [category],
        base_rate: w.base_price || 299,
        rate_unit: 'visit',
        is_online: true,
        bio: w.bio || 'Verified professional technician',
      },
      price,
      eta_min: w.eta_min || 12 + idx * 4,
      status: 'open',
      counter_price: null,
      rounds: 0,
      fair_label: 'Fair',
    };
    store.offers.set(String(offerId), offer);
    return offer;
  });

  request.offers = offers;
  store.requests.set(String(id), request);
  return request;
}
