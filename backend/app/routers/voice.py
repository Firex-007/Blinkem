from fastapi import APIRouter, UploadFile, File, Form
from starlette.concurrency import run_in_threadpool
from app.voice import parse_audio, parse_text

router = APIRouter(prefix="/api/voice", tags=["voice"])


@router.post("/parse")
async def api_parse_audio(
    audio: UploadFile = File(...),
    lang_hint: str = Form("auto"),
):
    wav_bytes = await audio.read()
    # Run blocking call in threadpool with ~12s safety
    res = await run_in_threadpool(parse_audio, wav_bytes, lang_hint)
    return res


@router.post("/parse-text")
async def api_parse_text(body: dict):
    text = body.get("text", "")
    lang_hint = body.get("lang_hint", "auto")
    res = await run_in_threadpool(parse_text, text, lang_hint)
    return res
