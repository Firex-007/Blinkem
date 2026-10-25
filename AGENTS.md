# AGENTS.md — Nodi (READ FULLY BEFORE DOING ANYTHING)

## What we are building
**Nodi** = hyperlocal on-demand blue-collar services web app (mobile-first, responsive).
A customer asks for a plumber / electrician / cleaner etc. by **voice (Tamil/English)** or by tapping a category.
Nearby **online** workers send their **own price**. The customer books, or counters once. The worker arrives
(customer shares a 4-digit OTP to start the job), finishes, customer confirms and reviews.
Built for the Vecnaverse hackathon (24–25 Oct 2026). Time is extremely short.
**A WORKING DEMO BEATS A PERFECT CODEBASE.** Never leave the app in a broken state.

## FIXED STACK — do NOT change or add alternatives
- Frontend: React 18 + Vite + **JavaScript (JSX, NO TypeScript)** + **Tailwind CSS v3 (NOT v4)** + react-router-dom v6 + lucide-react + leaflet + react-leaflet@4
- Backend: Python 3.11+ · FastAPI · Uvicorn · SQLAlchemy 2 · SQLite (file `backend/nodi.db`) · Pydantic v2 · python-multipart · python-dotenv · google-genai
- AI: Gemini API. Key lives ONLY in `backend/.env` as `GEMINI_API_KEY`. Never in frontend code, never committed.
- Forbidden: Docker, Postgres, Redis, websockets, auth libraries, UI kits (MUI/antd/shadcn/chakra), state libs (use React Context + hooks), TypeScript, Tailwind v4.
- Realtime = **polling every 2 s**. Auth = **demo role switcher** (header `X-User-Id`), no login/signup screens.
- Need a new dependency? Don't. If truly unavoidable, write why in `docs/CHANGELOG_AGENT.md` first.

## Docs are the source of truth (read in this order)
1. `docs/01_PRODUCT_SCOPE.md` — what is P0 / P1 / P2 (build P0 first, always)
2. `docs/02_ARCHITECTURE.md` — folder tree, env, run commands
3. `docs/03_DATA_MODEL_AND_API.md` — **the contract**: tables, enums, every endpoint + JSON shape
4. `docs/04_BUSINESS_LOGIC.md` — matching, pricing, state machine, bot workers, tracking simulation
5. `docs/05_VOICE_AGENT.md` — Gemini voice → structured request
6. `docs/06_DESIGN_SYSTEM.md` — tokens, components, light/dark (UI work: read before writing any JSX)
7. `docs/07_SCREENS_AND_UX.md` — every screen, layout, states, copy EN/TA
8. `docs/08_SEED_DATA.md` — categories, workers, demo users
9. `docs/09_BUILD_PLAN.md` — **phases; do ONE phase at a time**
10. `docs/10_DEMO_AND_SUBMISSION.md` — README, demo video script, 5-slide PPT
Visual reference: `design/preview.html` (open in browser; mimic its look, replace emoji with lucide icons).

## How to work (strict)
1. Work on **one phase** of `docs/09_BUILD_PLAN.md` at a time. Do not start the next phase until the current one passes its verification checklist.
2. After each phase: run the verification commands, fix failures, then
   `git add -A && git commit -m "phase N: <short>" && git push`. Commit even if only partly done (working > complete).
3. `docs/03` is a contract. Do **not** invent endpoints, fields, enums or status names. If something is missing, add the smallest possible thing and log it in `docs/CHANGELOG_AGENT.md`.
4. Edit surgically. No mass refactors, no renaming files/functions, no reformatting untouched code, no "improving" working code.
5. Do not ask the user questions. If a doc is ambiguous, choose the simplest option and log it in the changelog.
6. Prefer boring, obvious code. No clever abstractions. One component per file. Keep files under ~250 lines.
7. After writing code, actually run it (backend `uvicorn`, frontend `npm run dev`, `curl` the endpoints) and read the real output. Do not claim success without running.
8. Never delete `docs/` or `design/`. Never commit `.env`, `node_modules`, `*.db`, `__pycache__`.

## UI rules (non-negotiable)
- Colors/radius/shadows come ONLY from design tokens (CSS variables + Tailwind theme in `docs/06`). **No hardcoded hex in components.**
- Every screen works in **light and dark**, at **360 px width**, and scales up to a centered max-width 480 px column on desktop.
- Every network call has a **loading state (skeleton)** and an **error state (toast + retry)**. Never a blank screen.
- Touch targets ≥ 48 px. Body text ≥ 15 px. Tamil text line-height 1.5.
- All user-visible strings go through `t('key')` (`frontend/src/i18n.js`, EN + TA). No inline literal strings in JSX except brand name.

## Known pitfalls (avoid these)
- SQLite + FastAPI: `create_engine(url, connect_args={"check_same_thread": False})`.
- Use Vite `server.proxy` for `/api` → `http://localhost:8000`; do NOT fight CORS (still enable CORSMiddleware with `*` for demo).
- Tailwind v3: `npm i -D tailwindcss@3 postcss autoprefixer` then `npx tailwindcss init -p`. `darkMode: 'class'`.
- react-leaflet@4 needs React 18. Import `leaflet/dist/leaflet.css`. Fix default marker icons by using `L.divIcon` (no image files).
- `MediaRecorder` needs `localhost` or HTTPS. Convert recorded audio to 16 kHz mono WAV in the browser (see `docs/05`).
- Gemini model id comes from env `GEMINI_MODEL` (default `gemini-3.8-flash`, fallback `GEMINI_FALLBACK_MODEL=gemini-2.5-flash`). Never hardcode inside functions.
- Voice endpoint must ALWAYS return a usable result: Gemini failure → keyword fallback (docs/05), never a 500.
- Datetimes: store UTC ISO strings; return ISO with `Z`.
- Polling hooks must clear their interval on unmount.

## Definition of done (whole project)
Demo path works end-to-end without touching code: voice/tap request → offers appear in <10 s → book → map tracking → OTP start → complete → review; plus worker view and admin verify.
