// Vercel Serverless Function: POST /api/voice/parse
// Multimodal Gemini audio processing for Blink'em

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';

const PROMPT = `You are the AI dispatch intake agent for Blink'em, an on-demand hyperlocal home services platform.
Listen directly to the audio. Automatically detect the spoken language on your own (Tamil, English, Hindi, Tanglish, or Hinglish) using your multimodal audio understanding. Do NOT assume any language in advance.

Analyze what problem the user is describing and determine which skilled trade is required.
Return ONLY valid JSON:
- transcript: what was said verbatim in the original spoken language/script. If spoken in Tanglish or Hinglish (e.g. Tamil mixed with English like "bathroomla tanni varla" or "veetla kadhavu odanju pochu"), transcribe the FULL sentence verbatim in Romanized characters as spoken. DO NOT truncate to single words, and DO NOT drop non-English words.
- detected_language: exactly one of: "ta", "en", "hi", "mixed". Identify this purely from the audio.
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

function extractWavFromMultipart(buffer, contentType) {
  const match = contentType?.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!match) return buffer;
  const boundary = match[1] || match[2];
  const boundaryBuf = Buffer.from('--' + boundary);
  const headerEndBuf = Buffer.from('\r\n\r\n');

  const startIdx = buffer.indexOf(boundaryBuf);
  if (startIdx === -1) return buffer;

  const headerEndIdx = buffer.indexOf(headerEndBuf, startIdx);
  if (headerEndIdx === -1) return buffer;

  const contentStart = headerEndIdx + 4;
  const nextBoundaryIdx = buffer.indexOf(boundaryBuf, contentStart);
  const contentEnd = nextBoundaryIdx !== -1 ? (nextBoundaryIdx - 2) : buffer.length;

  return buffer.subarray(contentStart, contentEnd);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

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
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const fullBuffer = Buffer.concat(chunks);

    const contentType = req.headers['content-type'] || '';
    let wavBuffer;

    if (contentType.includes('application/json')) {
      const jsonStr = fullBuffer.toString('utf-8');
      const body = JSON.parse(jsonStr || '{}');
      if (body.audio_base64) {
        wavBuffer = Buffer.from(body.audio_base64, 'base64');
      } else {
        return res.status(400).json({ error: 'Missing audio_base64' });
      }
    } else {
      wavBuffer = extractWavFromMultipart(fullBuffer, contentType);
    }

    if (!wavBuffer || wavBuffer.length < 50) {
      return res.status(400).json({ error: 'Audio too short or empty' });
    }

    const base64Audio = wavBuffer.toString('base64');
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
                inlineData: {
                  mimeType: 'audio/wav',
                  data: base64Audio,
                },
              },
              {
                text: PROMPT,
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
    console.error('Serverless voice handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
