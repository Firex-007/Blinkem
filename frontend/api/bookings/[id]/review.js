// Vercel Serverless Function: POST /api/bookings/:id/review
import { store } from '../../_store.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-User-Id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const booking = store.bookings.get(String(id));
  if (booking) {
    booking.review = {
      id: 999,
      rating: body.rating || 5,
      comment: body.comment || '',
      created_at: new Date().toISOString(),
    };
  }
  return res.status(200).json({ ok: true, review: booking?.review });
}
