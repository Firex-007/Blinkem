# HANDOFF.md — Blink'em (Nodi) Platform Walkthrough & Hackathon Guide

## 1. Executive Summary
**Blink'em (Nodi)** is a hyperlocal on-demand blue-collar services web application built for the **Vecnaverse Hackathon (24–25 Oct 2026)**.
- **Core Value Proposition**: Connects urban households with verified local blue-collar workers (plumbers, electricians, cleaners, carpenters, painters, AC techs, cooks, appliance repair) in under **10 seconds** through AI-powered voice intake (Tamil / Tanglish / English / Hindi) and real-time reverse auction quotes with 1-round customer countering.
- **Security & Trust**: 4-digit start OTP shared strictly in person, ID/Police/Skill verification queue, extra-charge customer approvals, and two-sided 5-star rating feedback.
- **Tech Stack**:
  - **Frontend**: React 18, Vite, JavaScript (JSX), Tailwind CSS v3, `lucide-react`, `leaflet`, `react-leaflet@4`, `react-router-dom` v6.
  - **Backend**: Python 3.11+ virtualenv, FastAPI, SQLite (`blinkem.db`), SQLAlchemy 2, Pydantic v2.
  - **AI Engine**: Google Gemini API (`GEMINI_MODEL=gemini-3.5-flash`) with structured audio/text schema parsing and resilient keyword fallback.

---

## 2. Key Accomplishments Across All Phases

### Core Architecture & Backend (Neomotron & Antigravity)
- **Phase 0 (System Scaffold)**: FastAPI app, SQLite database setup, CORS middleware, health API (`GET /api/health` -> `{"ok":true}`).
- **Phase 1 (Data Models & Geodata)**: SQLite models for `users`, `categories`, `workers`, `service_requests`, `dispatches`, `offers`, `bookings`, `extras`, `reviews`. Chennai 11 localities geodata helper in `scripts/chennai_localities.py` and `frontend/src/data/chennaiLocalities.js`.
- **Phase 3 (Dispatch Engine & Bots)**: Reverse-auction dispatching algorithm (`matching.py`). Dispatches nearby workers based on Haversine distance, rating, and acceptance score. Background bot workers (`bots.py`) quote automatically with randomized delays (3–8s) and intelligently accept counters at >=85% margin.
- **Phase 5 (AI Voice Agent)**: Multi-lingual voice intake endpoint (`POST /api/voice/parse`) powered by Gemini 3.5 Flash, accepting raw 16 kHz mono WAV audio or Tanglish/English text and returning `{ category, description, urgency, confidence, source }` with zero 500-error tolerance.

### Frontend & UI/UX (Antigravity)
- **Phase 2 & 4 (Customer Flow)**:
  - `Home.jsx`: Category grid, voice intake card, nearby pros rail, and trust badges.
  - `Searching.jsx`: Radar scan animation with live dispatch ETA countdown and auto-navigation.
  - `Offers.jsx`: Real-time incoming quotes, sort chips (cheapest, fastest, highest rated), 1-round Counter-Offer bottom sheet.
  - `Tracking.jsx`: Interactive Leaflet map tracking simulated worker movement toward the customer, 4-digit OTP card, extra charge approval banners, and fast-forward testing button.
  - `Complete.jsx`: Animated job completed celebration, mock UPI / Cash payment selector, 5-star rating with review tags.
  - `Bookings.jsx`: Segmented active vs past bookings with live status chips.
- **Phase 6 (Worker Application)**:
  - `WorkerHome.jsx`: Master online/offline toggle, daily earnings/jobs stats, incoming dispatch cards with ₹10 stepper quote submission, decline action, counter-offer response cards.
  - `ActiveJob.jsx`: 4-digit customer OTP verification inputs, extra-charge request modal with customer approval polling, complete job trigger.
- **Phase 7 (Admin Console)**:
  - `AdminConsole.jsx`: Worker ID/Skill verification queue with 1-click approvals/rejections, live platform metrics tiles, bookings audit table, and 1-tap demo DB reset button.
- **v1.1 (Professional Icon Cleanliness)**:
  - Complete elimination of emoji columns and unicode characters across frontend and backend, fully replaced with SVG Lucide icons.
- **v1.2 (Flagship Visual Overhaul & Navigation)**:
  - Glassmorphism design tokens (`.glass-card`, `.glass-pill`, backdrop blur, mesh gradients).
  - Interactive **Live Chennai Hyperlocal Map Card** right on the Home screen with worker location pins and direct booking popups.
  - GPS device location detection banner (`navigator.geolocation`) with browser permission prompt.
  - Interactive **Location Selector Modal** with search and 11 Chennai localities.
  - Working **Role Switcher** that dynamically switches perspectives (Customer / Worker / Admin) and updates state and route instantly.
  - Complete **Profile & Settings (`/profile`)** screen with user details, address, appearance preferences, language toggles, and demo reset controls.

---

## 3. End-to-End Walkthrough (Script for Demo & PPT)

### Scene 1: Hyperlocal Discovery & Voice Intake (Customer)
1. Open `http://localhost:5173`.
2. Notice the ambient desktop lighting, the location pill (`T. Nagar ▾`), and the "Allow GPS" location banner.
3. Tap `T. Nagar ▾`: Search "Mylapore" or "Velachery" to switch areas, or tap "Use Current Device Location".
4. View the **Live Chennai Map**: Notice pins for nearby verified pros in Chennai. Tap a pin to see their name, rating, and distance.
5. Tap the **Mic** button: Speak or select a sample query: *"Bathroom tap leak aaguthu, udane aal venum"*.
6. Gemini automatically parses the query into `{ category: "plumber", urgency: "now" }` and opens the pre-filled request form.

### Scene 2: Live Reverse-Auction Matching & Countering
1. Submit request: You enter the **Searching** radar screen (`/request/:id/searching`).
2. Within 6–8 seconds, nearby bot workers quote their prices (e.g. ₹280, ₹320, ₹350).
3. Screen auto-navigates to **Offers** (`/request/:id/offers`).
4. Test Counter-Offer: Tap "Counter" on an offer, propose ₹260 (or select the `-10%` discount chip). Worker accepts within 3 seconds!
5. Tap **Book Worker**: Booking is confirmed.

### Scene 3: Live Tracking & 4-Digit OTP Job Start
1. The screen opens **Tracking** (`/booking/:id`).
2. Leaflet map displays the worker moving toward your address.
3. You are shown a secret **4-Digit OTP** (e.g., `4821`). The worker never sees this in their app!
4. Tap the Role Switcher at the top right -> Switch to **Worker** (`Muthu K`).
5. Open the Active Job: Enter the 4-digit OTP. The job transitions to **In Progress**!
6. Test Extra Charge: Worker requests ₹150 for "PVC Pipe Replacement". Customer receives notification and approves.
7. Worker taps "Mark Job as Complete".

### Scene 4: Payment, Review & Admin Verification
1. Customer view opens **Complete** (`/booking/:id/complete`).
2. Customer selects payment method (UPI / Cash), gives a 5-star rating, and submits review.
3. Tap Role Switcher -> Switch to **Admin** (`Meera R`).
4. Review pending worker KYC verifications, inspect platform KPIs (91% completion rate, avg 6s match speed), or reset the DB for a fresh demo run.

---

## 4. Problems Encountered & Exact Solutions

| Issue Encountered | Root Cause | Engineering Solution |
|---|---|---|
| **Python 3.14 pre-release Cython DLL Block** | Windows Application Control blocked `_util_cy.pyd` in global Python 3.14. | Switched strictly to project virtual environment: `backend\.venv\Scripts\python.exe`. |
| **Gemini Model 503 Spikes / 404 Deprecations** | `gemini-3.8-flash` had intermittent 503s; `gemini-2.5-flash` was deprecated (404). | Configured primary model to `gemini-3.5-flash` with resilient keyword fallback. |
| **Leaflet DivIcon Marker Missing** | React Leaflet default icon paths broke in Vite bundled production. | Implemented custom `L.divIcon` HTML markers with CSS styling and zero image asset dependencies. |
| **Booking Model `created_at` Mismatch** | `Booking` table originally used `confirmed_at`; API sorting referenced `created_at`. | Added `created_at` column to `Booking` model, updated queries to `confirmed_at.desc()`, and ran `reset_db()`. |
| **Ghost Port 8000 Lock on Windows** | Terminated Python uvicorn processes held port 8000 in Windows TCP table. | Relocated backend to port **`8001`** and updated Vite proxy in `vite.config.js`. |
| **Role Switcher Unresponsive** | `RoleSwitcher.jsx` only set localStorage without updating `AppContext` or invoking `navigate()`. | Connected `setUserId` to `AppContext` and routed directly to `/`, `/worker`, and `/admin`. |
| **Missing App CSS** | `main.jsx` did not import `index.css`, preventing Tailwind from styling the root tree. | Added `import './index.css';` to `main.jsx`. |

---

## 5. Demo Accounts & Personas

| Role | User ID | Name | Phone | Key Action |
|---|---|---|---|---|
| **Customer** | `1` | Priya S | +91 98401 23456 | Books plumbers, cleaners, tests voice intake, counters quotes, shares OTP. |
| **Worker** | `3` | Muthu K | +91 98403 45678 | Plumber: toggles online status, sends price quotes, enters OTP to start work. |
| **Admin** | `99` | Meera R | +91 98409 99999 | Platform Operations Lead: approves KYC docs, reviews dispatch logs, resets DB. |

---

## 6. How to Run Locally

### Terminal 1: Backend (Port 8001)
```powershell
cd "c:\Users\firex's ideapad\Documents\blink'em\backend"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --port 8001
```

### Terminal 2: Frontend (Port 5173)
```powershell
cd "c:\Users\firex's ideapad\Documents\blink'em\frontend"
npm run dev
```

### Access Application:
👉 **`http://localhost:5173`**
