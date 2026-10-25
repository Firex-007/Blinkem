// Vercel Serverless Function: POST /api/voice/parse-text
// Gemini text processing for Blink'em

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';

const PROMPT = `You are the AI dispatch intake agent for Blink'em, an on-demand hyperlocal home services platform.
Automatically detect the typed or spoken language on your own (Tamil, English, Hindi, Tanglish, or Hinglish) using contextual understanding. Do NOT assume any language in advance.

Analyze what problem the user is describing and determine which skilled trade is required.
Return ONLY valid JSON:
- transcript: what was said verbatim in the original spoken language/script. If spoken in Tanglish or Hinglish (e.g. Tamil mixed with English like "bathroomla tanni varla" or "veetla kadhavu odanju pochu"), transcribe the FULL sentence verbatim in Romanized characters as spoken.
- detected_language: exactly one of: "ta", "en", "hi", "mixed".
- category: exactly one of: "plumber", "electrician", "cleaner", "carpenter", "painter", "ac_repair", "cook", "appliance_repair".
  Context reasoning:
  * Water/pipe/drainage/bathroom water supply issues (leaks, tap, sink, drainage, toilet, tank, motor, thanni varala, water not coming) -> plumber.
  * Electrical issues (wires, current, fuse, switch, shock, spark, tripping, fan, light, MCB) -> electrician.
  * AC cooling, gas leak, air conditioner repair -> ac_repair.
  * Deep cleaning, sweeping, mopping, bathroom cleaning, maid -> cleaner.
  * Woodwork, doors, cupboards, windows, locks, furniture -> carpenter.
  * Wall painting, dampness, whitewash -> painter.
  * Home appliances (washing machine, fridge, microwave, mixer, TV) -> appliance_repair.
  * Cooking, meal preparation, catering -> cook.
- urgency: "now" for immediate/emergency help, or "scheduled" if a later date/time is specified.
- scheduled_hint: time phrase if scheduled, else null.
- description: one clear English sentence (<=140 characters) summarizing the problem for the worker.
- confidence: 0.0 to 1.0 representing your certainty.
Never invent details that were not spoken.`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-User-Id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const text = req.body?.text || '';
    if (!text) {
      return res.status(400).json({ error: 'Missing text in request body' });
    }

    const apiKey = GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server configuration error: GEMINI_API_KEY environment variable is missing.' });
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${PROMPT}\n\nCustomer query text: '${text}'`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API error:', geminiRes.status, errText);
      return res.status(502).json({ error: 'Gemini upstream error', details: errText });
    }

    const data = await geminiRes.json();
    const rawJsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawJsonText) {
      return res.status(500).json({ error: 'Empty response from Gemini' });
    }

    const parsed = JSON.parse(rawJsonText);
    parsed.source = 'gemini';
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Serverless parse-text error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
