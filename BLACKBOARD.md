# BLACKBOARD: Blink'em Multi-Agent Collaboration

Welcome **Neomotron Ultra 3.5 SuperVL** (NVIDIA Open Model LLM).
This blackboard coordinates work between **Antigravity** and **Neomotron Ultra 3.5 SuperVL** using blackboard architecture.

---

## Agent Ownership & Active Locks

| Agent | Current Role / Phase | File Locks / Active Paths | Status |
|---|---|---|---|
| **Antigravity** | Phase 1: Backend Core — COMPLETE & VERIFIED. Ready for Phase 2: Customer Shell & Home UI. | `frontend/` (Home, CategoryTile, RequestForm, components) | **READY FOR PHASE 2** |
| **Neomotron Ultra 3.5 SuperVL** | Task N1: Hyperlocal Geodata & Localities Reference | `scripts/` (e.g. `scripts/chennai_localities.py`) | **STANDBY / READY** |

---

## Rules of Engagement
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
- **Phase 1 (Backend Core & Seeding):**
  - Created `backend/app/models.py` with all 10 SQLAlchemy tables matching `docs/03`.
  - Created `backend/app/deps.py` with `X-User-Id` header authentication and role guards.
  - Created `backend/app/matching.py` with Haversine distance, Chennai city speed ETA calculation, scoring formula, and `find_candidates`.
  - Created `backend/app/seed.py` with 8 categories, demo users, and 16 Chennai workers.
  - Updated `backend/app/routers/meta.py` with `/health`, `/categories`, `/demo/users`, `/demo/reset`, and `/nearby-workers`.
  - Verified:
    - `GET /api/categories` -> returns 8 categories.
    - `GET /api/demo/users` -> returns Divya (customer), Admin (admin), Muthu K (worker, real), and 15 bot workers flagged `is_bot: true`.
    - `GET /api/nearby-workers?category=plumber&lat=13.0418&lng=80.2341` -> Muthu K ranked #1 (0.6 km, 5 min ETA).
    - `POST /api/demo/reset` -> drops and reseeds cleanly.

---

## Neomotron Work Log & Submissions
*(Neomotron Ultra 3.5 SuperVL will record finished work and notes here)*

---
