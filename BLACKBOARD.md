# BLACKBOARD: Blink'em Multi-Agent Collaboration

Welcome **Neomotron Ultra 3.5 SuperVL** (NVIDIA Open Model LLM).
This blackboard coordinates work between **Antigravity** and **Neomotron Ultra 3.5 SuperVL** using blackboard architecture.

---

## Agent Ownership & Active Locks

| Agent | Current Role / Phase | File Locks / Active Paths | Status |
|---|---|---|---|
| **Antigravity** (Gemini) | Frontend Complete (Phases 0, 2, 4, 5, 6, 7): Customer Flow, Voice Orb, Worker Dashboard, ActiveJob, Admin Console | `frontend/` | **COMPLETE & VERIFIED** |
| **Neomotron Ultra 3.5 SuperVL** | Task N2: Phase 3 Backend (dispatch/offers/bookings routers, bots, tracking simulation, smoke.sh) | `backend/` | **IN PROGRESS** |

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
- **Phase 4 (Customer Flow UI):** Completed & verified.
  - `Searching.jsx` with radar pulse animation, nearby ETA chip, and live auto-navigate.
  - `Offers.jsx` with sort chips, `OfferCard` list, book trigger, and customer `CounterSheet`.
  - `Tracking.jsx` with Leaflet `MapCard` (divIcon markers, dashed route), `StatusStepper`, OTP display card, extra charge approval banner, demo fast-forward.
  - `Complete.jsx` with checkmark animation, mock payment (UPI / Cash), 5-star customer review rating.
  - `Bookings.jsx` with Active / Past tab filters and status cards.
- **Phase 5 & 7 (Frontend Integration):** Completed & verified.
  - `lib/wav.js`: Web Audio API 16 kHz mono WAV converter with 44-byte RIFF header.
  - `useVoiceRecorder.js`: mic stream recording, analyser audio level meter, auto-stop.
  - `VoiceSheet.jsx`: animated voice orb, live level meter, sample query chips with direct request form pre-filling.
  - `AdminConsole.jsx`: worker ID / skill verification queue, bookings table, KPI tiles, demo DB reset.
- **Phase 6 (Worker App UI):** Completed & verified.
  - `WorkerHome.jsx`: big online switch, daily earnings/jobs stats, incoming dispatch cards with 10-rupee price stepper, decline/quote actions, counter-offer cards.
  - `ActiveJob.jsx`: 4-digit customer OTP verification boxes, extra charge request modal, complete job trigger.

---

## Coordination & Status Update (Antigravity ↔ Neomotron)
 
### Response from Antigravity to Neomotron:
@Neomotron: **YES! You are clear to take Phase 3 Backend immediately.**
Frontend build is verified clean and compiles without errors. I am taking **Phase 4 Customer Flow UI** (`Searching.jsx`, `Offers.jsx`, `Tracking.jsx`, `Complete.jsx`, `Bookings.jsx`, `OfferCard.jsx`, `StatusStepper.jsx`, `MapCard.jsx`).

### Task N2: Phase 3 Backend (Dispatch, Offers, Bookings, Bots, Tracking)
* **Assigned to:** Neomotron Ultra 3.5 SuperVL
* **Target Files & Locks:**
  - `backend/app/routers/requests.py` (POST /requests, GET /requests/{id}, POST /requests/{id}/cancel, POST /offers/{id}/accept, POST /offers/{id}/counter, POST /offers/{id}/reject)
  - `backend/app/routers/worker.py` (GET /worker/me, PATCH /worker/me, GET /worker/inbox, POST /worker/dispatches/{id}/quote, POST /worker/dispatches/{id}/decline, POST /worker/offers/{id}/respond-counter, GET /worker/jobs)
  - `backend/app/routers/bookings.py` (GET /bookings, GET /bookings/{id}, POST /bookings/{id}/start, POST /bookings/{id}/extra, POST /bookings/{id}/extra/{extra_id}/respond, POST /bookings/{id}/complete, POST /bookings/{id}/confirm-payment, POST /bookings/{id}/cancel, POST /bookings/{id}/review)
  - `backend/app/bots.py` (async tasks for bot workers with `SessionLocal()`, quote delay 3-6s + rank*2s, counter response)
  - Include demo fast-forward endpoint: `POST /demo/booking/{id}/fast-forward` (sets confirmed_at back so progress=100%)
  - Register the new routers in `backend/app/main.py`
  - Verification script: `backend/smoke.sh` (tests happy path: create request as customer 1 → wait 8s → GET /requests/{id} shows >=2 offers → accept → booking has otp → fast-forward → worker start with otp → complete → review)
* **Contract Rules (Mandatory):**
  - Follow `docs/03_DATA_MODEL_AND_API.md` and `docs/04_BUSINESS_LOGIC.md` strictly.
  - Return ISO UTC timestamps ending in `Z`.
  - Use `X-User-Id` header from `deps.py` (no external auth libs).
  - OTP (4-digit random string) returned ONLY to customer, never to worker.

---

## Neomotron Work Log & Submissions
- **Task N1 (Chennai Localities Reference):** `scripts/chennai_localities.py` created & verified. Maps 11 Chennai neighborhoods (T. Nagar, Kodambakkam, Mylapore, Saidapet, Ashok Nagar, Nungambakkam, Adyar, Velachery, K.K. Nagar, Vadapalani, Guindy) with lat/lng, pin codes, and landmarks. Exposes `CHENNAI_LOCALITIES`, `get_locality(name)`, `get_all_names()`, `CENTER` (T. Nagar default 13.0418, 80.2341).
- **Task N2 (Phase 3 Backend):** In progress.

---
