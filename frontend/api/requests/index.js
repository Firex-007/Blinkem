// Vercel Serverless Function: POST & GET /api/requests
import { createMockRequest, store } from '../_store.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-User-Id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const created = createMockRequest(body);
      return res.status(201).json({
        id: created.id,
        status: created.status,
        matched_count: created.matched_count,
        nearest_eta_min: 12,
      });
    } catch (e) {
      return res.status(400).json({ detail: e.message || 'Invalid request payload' });
    }
  }

  if (req.method === 'GET') {
    const { id } = req.query;
    if (id) {
      const existing = store.requests.get(String(id));
      if (!existing) {
        const fallback = createMockRequest({ category: 'plumber' });
        return res.status(200).json(fallback);
      }
      return res.status(200).json(existing);
    }
    const all = Array.from(store.requests.values());
    return res.status(200).json(all);
  }

  return res.status(405).json({ detail: 'Method not allowed' });
}
