// Vercel Serverless Function: POST /api/demo/booking/:id/fast-forward
import { store } from '../../../_store.js';

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
    if (booking.status === 'confirmed') {
      booking.status = 'in_progress';
      booking.display_status = 'in_progress';
      booking.eta_remaining_min = 0;
      booking.progress_pct = 100;
    } else if (booking.status === 'in_progress') {
      booking.status = 'completed';
      booking.display_status = 'completed';
    }
  }
  return res.status(200).json({ ok: true });
}
