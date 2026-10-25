# 02 — Architecture

```
Browser (React PWA-style SPA, mobile-first)
   │  /api/*  (Vite proxy → :8000), header X-User-Id (demo identity)
   ▼
FastAPI  ── SQLAlchemy ── SQLite (backend/blinkem.db)
   │                      ▲
   ├─ matching.py (Haversine + ranking)      
   ├─ bots.py (asyncio tasks: demo workers auto-quote/respond)
   └─ voice.py ── Gemini API (audio → JSON) with keyword fallback
```

## Folder tree (create exactly this)
```
blinkem/
├─ AGENTS.md
├─ README.md
├─ .gitignore                 # node_modules, .env, *.db, __pycache__, dist, .venv
├─ docs/                      # these spec files
├─ design/preview.html
├─ backend/
│  ├─ requirements.txt
│  ├─ .env.example            # GEMINI_API_KEY=  GEMINI_MODEL=gemini-3.8-flash  GEMINI_FALLBACK_MODEL=gemini-2.5-flash
│  │                          # DEMO_AUTO_RESPOND=true  DEMO_SPEED=15  DEFAULT_LAT=13.0418  DEFAULT_LNG=80.2341
│  └─ app/
│     ├─ main.py              # FastAPI app, CORS, include routers, startup: create tables + seed
│     ├─ config.py            # env via python-dotenv
│     ├─ db.py                # engine, SessionLocal, Base, get_db
│     ├─ models.py            # all tables (docs/03)
│     ├─ schemas.py           # Pydantic in/out models
│     ├─ seed.py              # docs/08
│     ├─ deps.py              # get_current_user from X-User-Id
│     ├─ matching.py          # haversine, eta, score, find_candidates
│     ├─ bots.py              # demo bot behaviour
│     ├─ voice.py             # Gemini + fallback
│     └─ routers/
│        ├─ meta.py           # health, categories, demo users, demo reset
│        ├─ voice.py
│        ├─ requests.py       # requests + offers
│        ├─ worker.py
│        ├─ bookings.py
│        └─ admin.py
└─ frontend/
   ├─ package.json  vite.config.js  tailwind.config.js  postcss.config.js  index.html
   └─ src/
      ├─ main.jsx  App.jsx  index.css       # index.css holds CSS variable tokens (docs/06)
      ├─ i18n.js                            # en + ta + hi dictionaries, t()
      ├─ api.js                             # fetch wrapper adds X-User-Id, JSON, errors
      ├─ context/AppContext.jsx             # theme, lang, currentUser
      ├─ hooks/usePolling.js  useVoiceRecorder.js
      ├─ lib/wav.js                         # audio → 16k mono WAV
      ├─ components/                        # Button, Chip, Card, Skeleton, Toast, BottomSheet, BottomNav,
      │                                     # CategoryTile, WorkerCard, OfferCard, StatusStepper, VoiceOrb,
      │                                     # MapCard, FloatingBookingBar, RoleSwitcher, ThemeToggle, Logo
      └─ pages/
         ├─ customer/  Home, VoiceSheet(component), RequestForm, Searching, Offers, Tracking, Complete, Bookings
         ├─ worker/    WorkerHome, QuoteSheet(component), ActiveJob, Earnings(P2)
         └─ admin/     VerifyQueue, Stats(P2)
```

## Routes (react-router)
`/` Home · `/request/new` · `/request/:id/searching` · `/request/:id/offers` · `/booking/:id` · `/booking/:id/complete` · `/bookings`
`/worker` · `/worker/job/:id` · `/admin`
Role switcher changes the active user and navigates to that role's root (`/`, `/worker`, `/admin`).

## Setup commands
```bash
# backend
cd backend && python -m venv .venv
# mac/linux: source .venv/bin/activate     windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env     # then paste GEMINI_API_KEY
uvicorn app.main:app --reload --port 8000

# frontend
cd frontend && npm install && npm run dev      # http://localhost:5173
```
`requirements.txt`: fastapi, uvicorn[standard], sqlalchemy>=2, pydantic>=2, python-multipart, python-dotenv, google-genai

## Vite proxy (vite.config.js)
```js
server: { port: 5173, proxy: { '/api': 'http://localhost:8000' } }
```

## Frontend conventions
- `api.js` exports `api.get(path)`, `api.post(path, body)`, `api.patch`, `api.postForm(path, formData)`; throws `Error(message)` on non-2xx (read `detail`).
- `AppContext` persists `theme` ('light'|'dark', default = system), `lang` ('en'|'ta'|'hi'), `userId` in `localStorage`. Theme = toggle `class="dark"` on `<html>`.
- `usePolling(fn, ms=2000, enabled=true)` — runs immediately, then interval; cleans up.
- Mobile shell: `<div class="mx-auto min-h-dvh w-full max-w-[480px] bg-bg">`; on `md:` screens show soft blue gradient page background with the column centered as a card.
- Map: Leaflet + OpenStreetMap tiles (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`, keep attribution). In dark mode apply CSS filter `invert(1) hue-rotate(180deg) brightness(.9) contrast(.9)` to the tile pane only.
