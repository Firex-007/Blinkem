// Vercel Serverless Function: Unified handler for /api/offers/:id/accept and counter
import { store } from '../_store.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-User-Id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { slug } = req.query;
  const slugParts = Array.isArray(slug) ? slug : (slug ? slug.split('/') : ['101', 'accept']);
  const offerId = String(slugParts[0] || '101');
  const action = slugParts[1] || 'accept';

  const offer = store.offers.get(offerId);

  if (action === 'accept') {
    const bookingId = store.nextBookingId++;
    const otp = '4821';
    const reqObj = offer ? store.requests.get(String(offer.request_id)) : null;
    const bLat = reqObj?.lat || 12.9716;
    const bLng = reqObj?.lng || 77.5946;
    const bAddress = reqObj?.address || 'Current Service Location';

    const worker = offer ? offer.worker : {
      id: 1,
      name: 'Muthu K',
      avatar_color: '#1F5BFF',
      area_name: bAddress.split(',')[0],
      rating_avg: 4.8,
      rating_count: 112,
      jobs_done: 140,
      id_verified: true,
      skill_verified: true,
      languages: ['ta', 'en'],
      base_rate: 299,
    };

    const agreedPrice = offer ? (offer.counter_price || offer.price) : 299;

    const booking = {
      id: bookingId,
      status: 'confirmed',
      display_status: 'on_the_way',
      category: reqObj?.category || 'plumber',
      description: reqObj?.description || 'Service appointment',
      address: bAddress,
      lat: bLat,
      lng: bLng,
      agreed_price: agreedPrice,
      extra_total: 0,
      final_price: agreedPrice,
      otp,
      eta_min: 12,
      eta_remaining_min: 8,
      progress_pct: 35,
      worker_pos: { lat: bLat + 0.004, lng: bLng + 0.003 },
      worker,
      timeline: [
        { key: 'confirmed', at: new Date().toISOString() },
        { key: 'started', at: null },
        { key: 'completed', at: null },
      ],
      extras: [],
      review: null,
      paid: false,
      created_at: new Date().toISOString(),
    };

    store.bookings.set(String(bookingId), booking);
    return res.status(200).json({ booking_id: bookingId });
  }

  if (action === 'counter') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const counterPrice = body.counter_price || 250;
    if (offer) {
      offer.status = 'countered';
      offer.counter_price = counterPrice;
      offer.rounds = 1;
    }
    return res.status(200).json({ ok: true, status: 'countered' });
  }

  return res.status(400).json({ detail: 'Unknown offer action' });
}
