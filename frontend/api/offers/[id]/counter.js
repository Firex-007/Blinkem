// Vercel Serverless Function: POST /api/offers/:id/counter
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
  const counterPrice = body.counter_price || 250;

  const offer = store.offers.get(String(id));
  if (offer) {
    offer.status = 'countered';
    offer.counter_price = counterPrice;
    offer.rounds = 1;
  }

  return res.status(200).json({ ok: true, status: 'countered' });
}
