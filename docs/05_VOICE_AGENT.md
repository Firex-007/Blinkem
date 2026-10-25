# 05 — Voice Agent (Gemini audio → structured request)

Goal: user taps the mic, speaks in Tamil / Hindi / English (incl. Tanglish & Hinglish), and gets a pre-filled request (category, urgency, description). Must never fail visibly.

## Flow
1. `useVoiceRecorder` → `MediaRecorder` records (max 15 s, auto-stop). States: `idle | recording | processing | error`.
2. `lib/wav.js` converts the blob to **16 kHz mono WAV** (Web Audio API) — safest format for Gemini.
3. `POST /api/voice/parse` (multipart `audio`) → backend → Gemini → JSON.
4. UI fills the request form; user can edit before "Find workers".
5. Any failure → fallback result + toast "Couldn't hear that clearly — please check the details".

## Frontend: `lib/wav.js` (implement exactly this idea)
```js
export async function blobToWav16kMono(blob) {
  const buf = await blob.arrayBuffer();
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const decoded = await ctx.decodeAudioData(buf);
  const off = new OfflineAudioContext(1, Math.ceil(decoded.duration * 16000), 16000);
  const src = off.createBufferSource(); src.buffer = decoded; src.connect(off.destination); src.start();
  const rendered = await off.startRendering();
  const pcm = rendered.getChannelData(0);
  const out = new DataView(new ArrayBuffer(44 + pcm.length * 2));
  const w = (o, s) => [...s].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)));
  w(0,'RIFF'); out.setUint32(4, 36 + pcm.length*2, true); w(8,'WAVE'); w(12,'fmt ');
  out.setUint32(16,16,true); out.setUint16(20,1,true); out.setUint16(22,1,true);
  out.setUint32(24,16000,true); out.setUint32(28,32000,true); out.setUint16(32,2,true); out.setUint16(34,16,true);
  w(36,'data'); out.setUint32(40, pcm.length*2, true);
  pcm.forEach((s,i)=>{ const v=Math.max(-1,Math.min(1,s)); out.setInt16(44+i*2, v<0?v*0x8000:v*0x7fff, true); });
  return new Blob([out], { type: 'audio/wav' });
}
```
`useVoiceRecorder`: `navigator.mediaDevices.getUserMedia({audio:true})`; collect chunks; on stop → `blobToWav16kMono` → `api.postForm('/voice/parse', fd)`. Expose `level` (0..1 from an AnalyserNode) for the orb animation.

## Backend: `voice.py`
```python
from google import genai
from google.genai import types
client = genai.Client(api_key=settings.GEMINI_API_KEY)

class ParsedRequest(BaseModel):     # also used as response_schema
    transcript: str
    detected_language: Literal["ta","en","hi","mixed"]
    category: Optional[str]         # one of slugs or None
    urgency: Literal["now","scheduled"]
    scheduled_hint: Optional[str]
    description: str
    budget_hint: Optional[int]
    confidence: float

def parse_audio(wav_bytes: bytes, lang_hint="auto") -> dict:
    for model in [settings.GEMINI_MODEL, settings.GEMINI_FALLBACK_MODEL]:
        try:
            r = client.models.generate_content(
                model=model,
                contents=[types.Part.from_bytes(data=wav_bytes, mime_type="audio/wav"), PROMPT.format(hint=lang_hint)],
                config=types.GenerateContentConfig(response_mime_type="application/json",
                                                   response_schema=ParsedRequest, temperature=0.1))
            data = json.loads(r.text); data["source"] = "gemini"
            return normalize(data)          # validate category slug, clamp confidence, strip
        except Exception as e:
            log.warning("gemini %s failed: %s", model, e)
    return {"transcript":"", "detected_language":"en", "category":None, "urgency":"now", "scheduled_hint":None,
            "description":"", "budget_hint":None, "confidence":0.0, "source":"fallback"}
```
`parse_text(text)`: same call with text instead of audio part; on failure → `keyword_fallback(text)`.
Run the blocking SDK call with `await run_in_threadpool(...)` inside the async route. Timeout the whole thing at ~12 s.
`normalize`: if `category` not in slugs → try `keyword_fallback(transcript + description)`; if still none → `None`.

## Prompt (`PROMPT`)
```
You are the intake agent for Blink'em, a home-services app for India (pilot city: Chennai, Tamil Nadu).
Listen to the audio (Tamil, Hindi, English, Tanglish or Hinglish — language hint: {hint}). The speaker describes a home/local service problem.
Return ONLY JSON matching the schema.
- transcript: what was said, verbatim, in the original script (Tamil in Tamil script, Hindi in Devanagari, Tanglish/Hinglish as spoken).
- detected_language: ta | en | hi | mixed.
- category: exactly one of: plumber, electrician, cleaner, carpenter, painter, ac_repair, cook, appliance_repair; or null if unclear.
  Mapping hints: leak/tap/pipe/tank/toilet/drain → plumber; fan/light/switch/wiring/MCB/power cut in house → electrician;
  house/bathroom/deep cleaning/maid/sweeping → cleaner; door/cupboard/furniture/bed → carpenter; wall/paint → painter;
  AC/air conditioner/cooling → ac_repair; cooking/cook for function/daily cook → cook; washing machine/fridge/mixer/TV/geyser → appliance_repair.
- urgency: "now" if they want help immediately (now, urgent, immediately, udane, ippove, உடனே, இப்போவே, சீக்கிரம்) or give no time; "scheduled" if they mention a later time (tomorrow, Sunday, naalaiku, நாளைக்கு, evening).
- scheduled_hint: the time phrase if scheduled, else null.
- description: one clear English sentence (<=140 chars) describing the problem for the worker.
- budget_hint: integer rupees if a budget is stated, else null.
- confidence: 0..1 how sure you are about category and meaning.
Never invent details that were not spoken.
```

## Keyword fallback (`keyword_fallback(text) -> category|None`) — lowercase contains-match
| slug | keywords (EN / Tanglish / TA) |
|---|---|
| plumber | leak, tap, pipe, sink, toilet, tank, drain, plumb, kasivu, kuzhai, குழாய், கசிவு, தண்ணீர், டேப் |
| electrician | fan, light, bulb, switch, wiring, current, power, mcb, fuse, electric, மின், மின்சாரம், பல்ப், ஃபேன் |
| cleaner | clean, maid, sweep, mop, bathroom wash, சுத்தம், பெருக்க |
| carpenter | door, cupboard, wood, furniture, table, bed, carpenter, தச்சர், கதவு, மேசை |
| painter | paint, wall, whitewash, பெயிண்ட், சுவர் |
| ac_repair | ac, a/c, air conditioner, cooling, gas refill, ஏசி |
| cook | cook, cooking, chef, catering, சமையல் |
| appliance_repair | washing machine, fridge, refrigerator, mixer, grinder, tv, geyser, microwave, வாஷிங் மெஷின், ஃப்ரிட்ஜ் |
**Hindi / Hinglish keywords:** plumber: नल, पाइप, लीक, टपक, पानी, nal, paani · electrician: पंखा, बिजली, बल्ब, स्विच, तार, bijli, pankha · cleaner: सफाई, झाड़ू, पोछा, safai · carpenter: दरवाज़ा, लकड़ी, अलमारी, बढ़ई, darwaza · painter: पेंट, रंग, दीवार, rang · ac_repair: एसी, ठंडा नहीं, thanda nahi · cook: खाना बनाना, रसोइया, कुक · appliance_repair: वॉशिंग मशीन, फ्रिज, मिक्सर, गीज़र.
Hindi urgency: now = अभी, तुरंत, जल्दी, abhi, jaldi · scheduled = कल, शाम, सुबह, kal, subah.
Urgency fallback: contains (`now, urgent, immediately, udane, ippove, உடனே, இப்போ`) → now; (`tomorrow, naalai, நாளை, evening, morning`) → scheduled; else now.

## UI states (VoiceSheet)
- **idle**: big mic orb, hint "Tap & speak in Tamil, Hindi or English", sample chips ("Fan not working", "Kitchen tap leaking", "வீடு சுத்தம் செய்ய வேண்டும்", "पंखा नहीं चल रहा") that call `/voice/parse-text` when tapped (great for noisy demo rooms).
- **recording**: orb pulses with `level`, waveform bars, live timer, "Tap to stop".
- **processing**: shimmer + "Understanding your request…".
- **result**: transcript (quoted), parsed chips (category, urgency, description) all editable, CTA "Find workers". Low confidence (<0.5) → amber hint "Please confirm the service type".
- **error/denied mic**: explain permission, show typed input fallback.

## Test utterances (use for manual QA)
| Input | Expect |
|---|---|
| "Sink la water leak aaguthu, udane aal venum" | plumber · now · mixed |
| "எங்க வீட்டு ஃபேன் ஓடலை, நாளைக்கு காலைல வர முடியுமா?" | electrician · scheduled ("நாளைக்கு காலைல") · ta |
| "Need deep cleaning for my 2BHK this Sunday, budget 2000" | cleaner · scheduled · budget 2000 · en |
| "AC cooling illa, urgent" | ac_repair · now · mixed |
| "मेरे घर का पंखा नहीं चल रहा, अभी किसी को भेजो" | electrician · now · hi |
| "Kal subah AC theek karne aana hai" | ac_repair · scheduled ("kal subah") · mixed |
| "Hello how are you" | category null, confidence low |

## Privacy note (put in README)
Free-tier Gemini API data may be used by Google to improve products → use only demo voices during the hackathon; no audio is stored by Blink'em (processed in memory, discarded).
