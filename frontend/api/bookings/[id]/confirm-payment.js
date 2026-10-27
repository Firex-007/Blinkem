// Vercel Serverless Function: POST /api/bookings/:id/confirm-payment
import { store } from '../../_store.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-User-Id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  const booking = store.bookings.get(String(id));
  if (booking) {
    booking.paid = true;
  }
  return res.status(200).json({ ok: true, paid: true });
}
