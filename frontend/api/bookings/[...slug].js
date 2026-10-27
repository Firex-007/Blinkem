// Vercel Serverless Function: Unified handler for /api/bookings/:id and all sub-actions
import { store } from '../_store.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-User-Id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { slug } = req.query;
  const slugParts = Array.isArray(slug) ? slug : (slug ? slug.split('/') : ['201']);
  const bookingId = String(slugParts[0] || '201');
  const action = slugParts[1] || '';

  let booking = store.bookings.get(bookingId);
  if (!booking) {
    // Generate realistic demo booking if not found
    booking = {
      id: parseInt(bookingId, 10) || 201,
      status: 'confirmed',
      display_status: 'on_the_way',
      category: 'plumber',
      description: 'Kitchen sink pipe repair',
      address: 'Current Service Location',
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

  // Handle Sub-actions
  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    if (action === 'verify-otp') {
      booking.status = 'in_progress';
      booking.display_status = 'in_progress';
      booking.started_at = new Date().toISOString();
      return res.status(200).json({ ok: true, status: 'in_progress' });
    }

    if (action === 'complete') {
      booking.status = 'completed';
      booking.display_status = 'completed';
      booking.completed_at = new Date().toISOString();
      return res.status(200).json({ ok: true, status: 'completed' });
    }

    if (action === 'review') {
      booking.review = {
        id: 999,
        rating: body.rating || 5,
        comment: body.comment || '',
        created_at: new Date().toISOString(),
      };
      return res.status(200).json({ ok: true, review: booking.review });
    }

    if (action === 'confirm-payment') {
      booking.paid = true;
      return res.status(200).json({ ok: true, paid: true });
    }

    if (action === 'fast-forward') {
      if (booking.status === 'confirmed') {
        booking.status = 'in_progress';
        booking.display_status = 'in_progress';
        booking.eta_remaining_min = 0;
        booking.progress_pct = 100;
      } else if (booking.status === 'in_progress') {
        booking.status = 'completed';
        booking.display_status = 'completed';
      }
      return res.status(200).json({ ok: true });
    }

    if (action === 'extra') {
      return res.status(200).json({ ok: true });
    }

    if (action === 'cancel') {
      booking.status = 'cancelled';
      booking.display_status = 'cancelled';
      return res.status(200).json({ ok: true, status: 'cancelled' });
    }
  }

  // Default: Return booking
  return res.status(200).json(booking);
}
