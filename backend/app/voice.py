import json
import logging
from typing import Optional, Literal
from pydantic import BaseModel
from google import genai
from google.genai import types
from app.config import settings

log = logging.getLogger(__name__)

CATEGORY_SLUGS = [
    "plumber",
    "electrician",
    "cleaner",
    "carpenter",
    "painter",
    "ac_repair",
    "cook",
    "appliance_repair",
]

KEYWORDS = {
    "plumber": [
        "leak", "tap", "pipe", "sink", "toilet", "tank", "drain", "plumb", "kasivu",
        "kuzhai", "குழாய்", "கசிவு", "தண்ணீர்", "டேப்", "नल", "पाइप", "लीक", "टपक",
        "पानी", "nal", "paani", "water",
    ],
    "electrician": [
        "fan", "light", "bulb", "switch", "wiring", "current", "power", "mcb", "fuse",
        "electric", "மின்", "மின்சாரம்", "பல்ப்", "ஃபேன்", "पंखा", "बिजली", "बल्ब",
        "स्विच", "तार", "bijli", "pankha", "short circuit",
    ],
    "cleaner": [
        "clean", "maid", "sweep", "mop", "bathroom wash", "cleaning", "சுத்தம்",
        "பெருக்க", "सफाई", "झाड़ू", "पोछा", "safai", "dusting",
    ],
    "carpenter": [
        "door", "cupboard", "wood", "furniture", "table", "bed", "carpenter",
        "தச்சர்", "கதவு", "மேசை", "दरवाज़ा", "लकड़ी", "अलमारी", "बढ़ई", "darwaza",
    ],
    "painter": [
        "paint", "wall", "whitewash", "painting", "பெயிண்ட்", "சுவர்", "पेंट", "रंग",
        "दीवार", "rang",
    ],
    "ac_repair": [
        "ac", "a/c", "air conditioner", "cooling", "gas refill", "ஏசி", "एसी",
        "ठंडा नहीं", "thanda nahi", "filter",
    ],
    "cook": [
        "cook", "cooking", "chef", "catering", "சமையல்", "खाना बनाना", "रसोइया",
        "कुक", "lunch", "dinner", "breakfast",
    ],
    "appliance_repair": [
        "washing machine", "fridge", "refrigerator", "mixer", "grinder", "tv",
        "geyser", "microwave", "வாஷிங் மெஷின்", "ஃப்ரிட்ஜ்", "वॉशिंग मशीन", "फ्रिज",
        "मिक्सर", "गीज़र", "oven",
    ],
}

URGENCY_SCHEDULED = [
    "tomorrow", "sunday", "naalaiku", "நாளைக்கு", "evening", "morning", "afternoon",
    "next week", "कल", "शाम", "सुबह", "kal", "subah",
]

PROMPT = """You are the AI dispatch intake agent for Blink'em, an on-demand hyperlocal home services platform.
Listen directly to the audio. Automatically detect the spoken language on your own (Tamil, English, Hindi, Tanglish, or Hinglish) using your multimodal audio understanding. Do NOT assume any language in advance.

Analyze what problem the user is describing and determine which skilled trade is required.
Return ONLY valid JSON:
- transcript: what was said verbatim in the original spoken language/script.
- detected_language: exactly one of: "ta", "en", "hi", "mixed". Identify this purely from the audio.
- category: exactly one of: "plumber", "electrician", "cleaner", "carpenter", "painter", "ac_repair", "cook", "appliance_repair".
  Context reasoning:
  * Electrical issues (wires, current, fuse, switch, shock, spark, tripping, fan, light, MCB) -> electrician.
  * Water/pipe/drainage issues (leaks, tap, sink, drainage, toilet, tank, motor) -> plumber.
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
Never invent details that were not spoken."""


class ParsedRequest(BaseModel):
    transcript: str
    detected_language: Literal["ta", "en", "hi", "mixed"]
    category: Optional[str] = None
    urgency: Literal["now", "scheduled"] = "now"
    scheduled_hint: Optional[str] = None
    description: str
    budget_hint: Optional[int] = None
    confidence: float


def keyword_fallback(text: str) -> Optional[str]:
    if not text:
        return None
    lower = text.lower()
    for cat, words in KEYWORDS.items():
        for w in words:
            if w in lower:
                return cat
    return None


def detect_urgency(text: str) -> tuple[str, Optional[str]]:
    if not text:
        return "now", None
    lower = text.lower()
    for w in URGENCY_SCHEDULED:
        if w in lower:
            return "scheduled", w
    return "now", None


def normalize(data: dict) -> dict:
    cat = data.get("category")
    if cat not in CATEGORY_SLUGS:
        fallback_cat = keyword_fallback(f"{data.get('transcript', '')} {data.get('description', '')}")
        data["category"] = fallback_cat
    data["confidence"] = max(0.0, min(1.0, float(data.get("confidence", 0.8))))
    if "urgency" not in data or data["urgency"] not in ("now", "scheduled"):
        data["urgency"], data["scheduled_hint"] = detect_urgency(data.get("transcript", ""))
    return data


def parse_audio(wav_bytes: bytes, lang_hint: str = "auto", client_transcript: str = "") -> dict:
    prompt_text = PROMPT
    if client_transcript:
        prompt_text += f"\n\nPreliminary speech-to-text hint: '{client_transcript}'"

    models_to_try = [
        "gemini-flash-lite-latest",
        "gemini-3.5-flash-lite",
        getattr(settings, "GEMINI_MODEL", "gemini-flash-lite-latest"),
        getattr(settings, "GEMINI_FALLBACK_MODEL", "gemini-3.5-flash-lite"),
    ]
    # Remove duplicates preserving order
    seen = set()
    models_to_try = [m for m in models_to_try if m and not (m in seen or seen.add(m))]

    if settings.GEMINI_API_KEY:
        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            # Only try audio if we have sufficient audio data (>44 byte WAV header)
            if len(wav_bytes) > 200:
                for model in models_to_try:
                    try:
                        r = client.models.generate_content(
                            model=model,
                            contents=[
                                types.Part.from_bytes(data=wav_bytes, mime_type="audio/wav"),
                                prompt_text,
                            ],
                            config=types.GenerateContentConfig(
                                response_mime_type="application/json",
                                response_schema=ParsedRequest,
                                temperature=0.1,
                            ),
                        )
                        data = json.loads(r.text)
                        data["source"] = "gemini"
                        if not data.get("transcript") and client_transcript:
                            data["transcript"] = client_transcript
                        return normalize(data)
                    except Exception as e:
                        log.warning("Gemini audio %s failed: %s", model, e)
        except Exception as e:
            log.warning("Gemini Client init failed: %s", e)

    # If audio parse failed or was empty, but client provided a transcript, parse with Gemini text!
    if client_transcript and settings.GEMINI_API_KEY:
        try:
            res = parse_text(client_transcript, lang_hint)
            if res.get("source") == "gemini":
                return res
        except Exception as e:
            log.warning("Gemini text fallback in parse_audio failed: %s", e)

    # Keyword fallback
    detected_cat = keyword_fallback(client_transcript) if client_transcript else None
    cat = detected_cat or "plumber"
    urgency, scheduled_hint = detect_urgency(client_transcript)
    return {
        "transcript": client_transcript if client_transcript else "Voice service request",
        "detected_language": "mixed" if lang_hint == "auto" else lang_hint,
        "category": cat,
        "urgency": urgency,
        "scheduled_hint": scheduled_hint,
        "description": client_transcript if client_transcript else "Home service request.",
        "budget_hint": None,
        "confidence": 0.85 if detected_cat else 0.6,
        "source": "fallback",
    }


def parse_text(text: str, lang_hint: str = "auto") -> dict:
    models_to_try = [
        "gemini-flash-lite-latest",
        "gemini-3.5-flash-lite",
        getattr(settings, "GEMINI_MODEL", "gemini-flash-lite-latest"),
        getattr(settings, "GEMINI_FALLBACK_MODEL", "gemini-3.5-flash-lite"),
    ]
    seen = set()
    models_to_try = [m for m in models_to_try if m and not (m in seen or seen.add(m))]

    if settings.GEMINI_API_KEY:
        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            for model in models_to_try:
                try:
                    r = client.models.generate_content(
                        model=model,
                        contents=[
                            PROMPT + f"\n\nCustomer query text: '{text}'",
                        ],
                        config=types.GenerateContentConfig(
                            response_mime_type="application/json",
                            response_schema=ParsedRequest,
                            temperature=0.1,
                        ),
                    )
                    data = json.loads(r.text)
                    data["source"] = "gemini"
                    return normalize(data)
                except Exception as e:
                    log.warning("Gemini text %s failed: %s", model, e)
        except Exception as e:
            log.warning("Gemini Client init failed: %s", e)

    # Keyword fallback
    cat = keyword_fallback(text) or "plumber"
    urgency, scheduled_hint = detect_urgency(text)
    return {
        "transcript": text,
        "detected_language": "en",
        "category": cat,
        "urgency": urgency,
        "scheduled_hint": scheduled_hint,
        "description": text[:140] if text else "Home service request",
        "budget_hint": None,
        "confidence": 0.85 if cat else 0.5,
        "source": "fallback",
    }
