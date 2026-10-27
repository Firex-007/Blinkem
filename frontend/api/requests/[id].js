// Vercel Serverless Function: GET & POST /api/requests/:id
import { createMockRequest, store } from '../_store.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-User-Id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  const requestId = String(id || '101');

  if (req.method === 'GET') {
    let existing = store.requests.get(requestId);
    if (!existing) {
      existing = createMockRequest({ category: 'plumber' });
      existing.id = parseInt(requestId, 10) || 101;
      store.requests.set(requestId, existing);
    }
    return res.status(200).json(existing);
  }

  if (req.method === 'POST') {
    // Cancellation endpoint
    let existing = store.requests.get(requestId);
    if (existing) {
      existing.status = 'cancelled';
    }
    return res.status(200).json({ ok: true, status: 'cancelled' });
  }

  return res.status(405).json({ detail: 'Method not allowed' });
}
