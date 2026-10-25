# ⚡ Blink'em

> **Hyperlocal On-Demand Blue-Collar Services Platform**  
> *Skilled hands, in minutes.*

[![React 18](https://img.shields.io/badge/Frontend-React_18_%7C_Vite_%7C_Tailwind-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_%7C_Python_3.11+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Gemini](https://img.shields.io/badge/AI-Google_Gemini_Multimodal-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 Overview

**Blink'em** is a production-grade, hyperlocal on-demand home services SaaS platform built for Indian urban centers (pilot: **Chennai, Tamil Nadu**). 

Traditional platforms (like Urban Company or Justdial) lock customers into rigid catalogue slots or spam their phones with calls from unverified leads. Blink'em flips the model:

1. **Multimodal Voice Intake**: Speak naturally in **Tamil, Tanglish, Hindi, or English** (or use the unified Request Console). Gemini parses your speech into an actionable service dispatch.
2. **Reverse Auction Quotes**: Nearby **online, verified workers** submit their **own price and live ETA** in real time (<10 seconds).
3. **1-Round Fair Countering**: Customers can counter once; when both agree, the price locks before the worker moves.
4. **Live Leaflet Radar Tracking**: Live GPS tracking of arriving pros with interactive Chennai locality radar.
5. **Two-Sided Doorstep Safety**: Jobs start **only** when the worker inputs the customer’s secure 4-digit OTP. Unforeseen extra work requires in-app customer approval.
6. **Multi-Portal Ecosystem**: Instant switching between **Customer App**, **Partner Pro Portal**, and **Platform Operations Console**.

---

## 🏗️ Architecture & Stack

```
                              ┌─────────────────────────────────────────┐
                              │           BROWSER CLIENT                │
                              │  React 18 • Vite • Tailwind CSS v3      │
                              │  Leaflet Maps • Web Speech API          │
                              └────────────────────┬────────────────────┘
                                                   │
                              Proxy: /api ─────────┼───────────► (Port 8001)
                                                   ▼
┌───────────────────────────────────────────────────────────────────────┐
│                       FASTAPI BACKEND SERVICE                         │
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────────┐  │
│  │  Voice Router    │  │  Matching Engine │  │ State Machine & Bots│  │
│  │  /api/voice/*    │  │  Haversine & ETA │  │ Dispatch Simulation │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────────┬──────────┘  │
│           │                     │                       │             │
│           ▼                     ▼                       ▼             │
│    Google Gemini API       SQLAlchemy 2.0        Background Jobs      │
│  (Multimodal Audio)        SQLite Database         Auto-Quotes        │
└───────────────────────────────────────────────────────────────────────┘
```

### Technology Highlights
* **Frontend**: React 18, Vite, JavaScript (JSX), Tailwind CSS v3, React Router v6, Leaflet & React-Leaflet, Lucide Icons.
* **Audio Engineering**: In-browser Web Audio API downsampling to 16 kHz mono WAV, Web Speech API live speech streaming, and silence Voice Activity Detection (VAD).
* **Backend**: Python 3.11+, FastAPI, Uvicorn, SQLAlchemy 2, Pydantic v2, SQLite (`blinkem.db`).
* **AI & NLP**: Google Gemini API (`gemini-3.5-flash` & `gemini-3.8-flash`) with structured JSON schema output and keyword fallback matching.

---

## ✨ Key Capabilities

| Feature | Description |
|---|---|
| **Unified Request Console** | Multi-modal intake combining voice recording, Spacebar push-to-talk, direct typing, and an 8-trade matrix. |
| **Speech-to-Text Review** | Visual confirmation card showing the verbatim transcript, detected service, issue summary, and urgency before submitting. |
| **Spacebar Push-to-Talk** | Hold `[Space]` to speak and release to process, with intelligent 1.8s silence auto-stop. |
| **Dynamic Desktop & Mobile Shell** | Automatic wide dual-column command center on desktop; compact one-handed shell with bottom navigation on mobile. |
| **Live Chennai Radar Map** | Interactive Leaflet map with 11 Chennai localities, user GPS beacon, worker markers, and 1-tap booking popups. |
| **Reverse Auction Offers** | Online pros receive dispatches and submit quotes; platform tags them as *Fair Price*, *Below Usual*, or *Above Usual*. |
| **1-Round Price Negotiation** | Customer counters with a target budget; worker can accept or maintain initial quote. |
| **Doorstep OTP Verification** | 4-digit code prevents phantom arrivals and ensures job integrity. |
| **Partner Pro App** | Online/offline toggle, live dispatch inbox, quote submission, extra work requests, and earnings summary. |
| **Platform Operations Console** | Independent ID and skill KYC document verification, live dispatch monitors, and sandbox reset. |

---

## 🚀 Quick Start (Run Locally)

### Prerequisites
* **Node.js**: v18+ and `npm`
* **Python**: 3.11+ (Python 3.11 or 3.12 recommended)
* **Git**

---

### Step 1: Clone Repository
```bash
git clone https://github.com/Firex-007/Blinkem.git
cd Blinkem
```

---

### Step 2: Setup & Run Backend (Port 8001)

1. Open a terminal and navigate to `backend`:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   * **Windows (PowerShell)**:
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\activate
     ```
   * **macOS / Linux**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables in `backend/.env`:
   ```ini
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-3.5-flash
   GEMINI_FALLBACK_MODEL=gemini-3.8-flash
   DEMO_AUTO_RESPOND=true
   DEMO_SPEED=15
   DEFAULT_LAT=13.0418
   DEFAULT_LNG=80.2341
   DATABASE_URL=sqlite:///./blinkem.db
   ```

5. Launch the FastAPI server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
   ```
   *Verify API health*: Open [http://127.0.0.1:8001/api/health](http://127.0.0.1:8001/api/health) (returns `{"ok": true}`).

---

### Step 3: Setup & Run Frontend (Port 5173)

1. Open a second terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open the application in your browser:
   👉 **[http://localhost:5173/](http://localhost:5173/)**

---

## 🎭 Multi-Portal Role Switcher

Blink'em includes zero-friction persona switching via the top navigation bar to test all user journeys:

| Role | Profile | Features Available |
|---|---|---|
| **Customer** | Priya S (`userId: 1`) | Voice intake, Request Console, offers comparison, 1-round counter, live map tracking, OTP display, review. |
| **Partner Pro** | Muthu K (`userId: 3`) | Online/offline toggle, incoming dispatch alerts, custom quote submission, OTP validation, extra-work approval. |
| **Operations** | Meera R (`userId: 99`) | Worker identity & skill KYC approvals, platform metrics, booking audit logs, sandbox refresh. |

---

## 🗺️ Supported Services & Localities (Chennai Pilot)

### 8 Service Categories
* 🔧 **Plumber**: Leaks, pipes, taps, drainage, flush tanks
* ⚡ **Electrician**: Ceiling fans, switchboards, MCBs, wiring, lighting
* 🧹 **Cleaning**: Deep cleaning, sweeping, mopping, bathroom sanitization
* 🔨 **Carpenter**: Furniture repairs, doors, cupboards, hinges
* 🎨 **Painter**: Touch-ups, interior painting, whitewashing
* ❄️ **AC Repair**: Cooling issues, gas refills, routine service
* 🍳 **Cook**: Daily meals, event cooking, meal preparation
* 🔌 **Appliance Repair**: Washing machines, refrigerators, microwaves, mixers

### 11 Chennai Localities
T. Nagar • Mylapore • Adyar • Velachery • Anna Nagar • Guindy • Kodambakkam • Saidapet • Nungambakkam • Alwarpet • Pallavaram

---

## 🧪 Testing & Verification

* **Frontend Build Check**:
  ```bash
  cd frontend
  npm run build
  ```
  *(1550+ modules compiled, zero errors)*

* **Voice API Test**:
  ```bash
  # Test speech parsing endpoint
  curl -X POST http://localhost:8001/api/voice/parse-text \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"Kitchen sink pipe is leaking water\"}"
  ```

---

## 📦 Repository Structure

```
blink'em/
├── backend/
│   ├── app/
│   │   ├── routers/         # API endpoints (requests, bookings, worker, voice, meta)
│   │   ├── bots.py          # Simulated worker quote engine
│   │   ├── config.py        # Environment settings
│   │   ├── db.py            # SQLite database engine
│   │   ├── matching.py      # Haversine distance, scoring, ETA calculation
│   │   ├── models.py        # SQLAlchemy relational schema
│   │   ├── seed.py          # Seeded Chennai workers & users
│   │   └── voice.py         # Gemini multimodal audio parsing & fallback
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/      # VoiceSheet, HomeMapCard, RoleSwitcher, LocationModal
│   │   ├── context/         # AppContext (user session, theme, lang, locality)
│   │   ├── data/            # Chennai localities & coordinates
│   │   ├── hooks/           # useVoiceRecorder (VAD, Spacebar push-to-talk), usePolling
│   │   ├── pages/
│   │   │   ├── customer/    # Home (Request Console), Searching, Offers, Tracking, Complete
│   │   │   ├── worker/      # WorkerHome, ActiveJob
│   │   │   └── admin/       # AdminConsole
│   │   ├── i18n.js          # Multi-language dictionary (EN, TA, HI)
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── docs/                    # Complete product specifications and API contract
└── README.md
```

---

## ⚖️ License

Distributed under the **MIT License**. Built with pride for urban home service empowerment.
