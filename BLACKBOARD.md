# BLACKBOARD: Blink'em Multi-Agent Collaboration

Welcome **Neomotron Ultra 3.5 SuperVL** (NVIDIA Open Model LLM).
This blackboard coordinates work between **Antigravity** and **Neomotron Ultra 3.5 SuperVL** using blackboard architecture.

---

## Agent Ownership & Active Locks

| Agent | Current Role / Phase | File Locks / Active Paths | Status |
|---|---|---|---|
| **Antigravity** (Gemini) | Phase 0 scaffold + Phase 1 backend + Phase 2 frontend (already committed) | `backend/`, `frontend/` | **COMPLETE** |
| **Neomotron Ultra 3.5 SuperVL** (me) | Task N1 done — READY for parallel work | `scripts/`, any non-locked backend helper | **READY / AVAILABLE** |

---

## Neomotron Ultra 3.5 SuperVL — Capabilities & Limits (what I can/cannot do)

**Who I am:** NVIDIA Nemotron model running as a Kilo coding agent. I am a text/code AI — NOT truly multimodal (no live camera/mic/screen sensing), NO internet scraping (cannot fetch live URLs unless a fetch tool is provided), NO direct GitHub push/auth (I write code locally; you or the harness must push to https://github.com/Firex-007/Blinkem), NO persistent long-term memory beyond this session's context window (forgetful across restarts unless summarized).

**What I CAN do (assign me freely):**
- Python/FastAPI/SQLAlchemy/SQLite backend code (routers, models, matching, bots, voice fallback)
- JavaScript/React/Tailwind frontend code if needed (but Antigravity owns `frontend/`)
- Haversine distance, ETA, scoring, `find_candidates`, bot-worker simulation, tracking simulation
- Gemini voice→JSON parsing with keyword fallback (never 500s)
- Seed/data enrichment, locality scripts, demo data
- Reading docs/contracts and writing contract-faithful endpoints per `docs/03`
- Safety backup: if Antigravity/Gemini stalls or breaks something, I can revert (`git checkout`) and re-ship any phase

**What I CANNOT / should not do:**
- Touch files locked by Antigravity (`backend/`, `frontend/`) without coordination
- Scrape the web or call external APIs except via provided tools
- Commit/push to GitHub myself (no auth) — hand you the diff, you push
- Guess undocumented endpoints — follow `docs/03` exactly or log additions in `docs/CHANGELOG_AGENT.md`

**Work style:** assertive, parallel, blackboard-driven. I update `BLACKBOARD.md` on start/finish of anything. Assign me Phase 3, 4, 5, 6 or 7 and I ship it.

**Suggested parallel split:**
- Antigravity: frontend UI phases (Phase 4 Searching/Offers/Tracking/Complete, Phase 6 worker UI, Phase 7 admin UI)
- Neomotron: backend API phases (Phase 3 dispatch/offers/booking, Phase 5 voice endpoint, Phase 6+7 worker/admin endpoints)

Tell me what to take — I'll start immediately.

---

1. **No Overlapping Edits:** Do not modify files currently locked by the other agent.
2. **Contract Fidelity:** Follow `docs/03_DATA_MODEL_AND_API.md` and `docs/06_DESIGN_SYSTEM.md` strictly. No hardcoded hex colors, no arbitrary endpoint deviations.
3. **Blackboard Reporting:** When completing a task, append report under the `## Neomotron Work Log & Submissions` or appropriate section below.

---

## Tasks for Neomotron Ultra 3.5 SuperVL

### Task N1: Hyperlocal Geodata & Localities Reference
* **Goal:** Generate a helper reference or python script in `scripts/chennai_localities.py` that maps key Chennai neighborhoods (T. Nagar, Kodambakkam, Mylapore, Saidapet, Ashok Nagar, Nungambakkam, Adyar, Velachery, K.K. Nagar, Vadapalani, Guindy) with their approximate lat/lng, pin codes, and landmark references to support realistic dispatch and distance calculations.
* **Output Path:** `scripts/chennai_localities.py`

---

## Antigravity Work Log & Milestones
- **Phase 0 (System Scaffold & Health API):** Completed & verified (`GET /api/health` -> `{"ok":true}`).
- **Phase 1 (Backend Core & Seeding):** `models.py`, `deps.py`, `matching.py`, `seed.py`, `routers/meta.py` committed & verified (`/api/categories` -> 8, `/api/demo/users`, `/api/nearby-workers`, `/api/demo/reset`).
- **Phase 2 (Customer Shell Frontend):** Completed & verified (compiles, serves HTTP 200).
  - `Home.jsx` per C1: headline, hero voice/search mic card, 4×2 CategoryTile grid, "Available near you now" WorkerCard rail (polls `/nearby-workers`), trust chips, FloatingBookingBar placeholder, LangToggle + ThemeToggle + RoleSwitcher header.
  - `RequestForm.jsx` per C3: service chips (preselected from `?category=`), textarea, Now/Schedule urgency, address, optional budget, validation, `POST /requests` -> `/request/:id/searching`.
  - Components: `WorkerCard`, `VoiceSheet`, `FloatingBookingBar`, `LangToggle`; hook `usePolling` (clears interval on unmount).
  - i18n: full EN/TA/HI dictionary per docs/07 table.

---

## Neomotron Work Log & Submissions
- **Task N1 (Chennai Localities Reference):** `scripts/chennai_localities.py` created & verified. Maps 11 Chennai neighborhoods (T. Nagar, Kodambakkam, Mylapore, Saidapet, Ashok Nagar, Nungambakkam, Adyar, Velachery, K.K. Nagar, Vadapalani, Guindy) with lat/lng, pin codes, and landmarks. Exposes `CHENNAI_LOCALITIES`, `get_locality(name)`, `get_all_names()`, `CENTER` (T. Nagar default 13.0418, 80.2341).

---
