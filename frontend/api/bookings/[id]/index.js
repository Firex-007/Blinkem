// Vercel Serverless Function: GET /api/bookings/:id
import { store } from '../../_store.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-User-Id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  const bookingId = String(id || '201');

  let booking = store.bookings.get(bookingId);
  if (!booking) {
    // Generate realistic demo booking if not found
    booking = {
      id: parseInt(bookingId, 10) || 201,
      status: 'confirmed',
      display_status: 'on_the_way',
      category: 'plumber',
      description: 'Kitchen sink pipe repair',
      address: 'Main Street, Active City',
      lat: 12.9716,
      lng: 77.5946,
      agreed_price: 299,
      extra_total: 0,
      final_price: 299,
      otp: '4821',
      eta_min: 12,
      eta_remaining_min: 6,
      progress_pct: 50,
      worker_pos: { lat: 12.9750, lng: 77.5980 },
      worker: {
        id: 1,
        name: 'Muthu K',
        avatar_color: '#1F5BFF',
        area_name: 'Local Area',
        rating_avg: 4.8,
        rating_count: 112,
        jobs_done: 140,
        id_verified: true,
        skill_verified: true,
        languages: ['ta', 'en'],
        categories: ['plumber'],
        base_rate: 299,
        rate_unit: 'visit',
        is_online: true,
        bio: '10 yrs experience • leak & pipe fitting specialist',
      },
      timeline: [
        { key: 'confirmed', at: new Date(Date.now() - 300000).toISOString() },
        { key: 'started', at: null },
        { key: 'completed', at: null },
      ],
      extras: [],
      review: null,
      paid: false,
    };
    store.bookings.set(bookingId, booking);
  }

  return res.status(200).json(booking);
}
