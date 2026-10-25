# 09 — Build Plan (ONE PHASE AT A TIME)

Rule: finish → verify → commit → push → next phase. If time runs out, everything before the current phase must already work and be pushed.

## Time-cut guide (pick by hours left)
| Time left | Build |
|---|---|
| ≥ 6 h | Phases 0–7 |
| 3–6 h | Phases 0–5, then 6 (counter-offer only), skip 7 except README |
| 1.5–3 h | Phases 0–4 + 5 (voice) + README/demo; skip 6–7 |
| < 1.5 h | Phases 0–3 + worker quote only + README; record video of what works |
Hackathon asks for ≥ 60 % working MVP + public GitHub repo + 2-min video + 5-slide PPT.

---
## Phase 0 — Scaffold (≈15 min)
Tasks: create folder tree (`docs/02`), `.gitignore`, backend venv + requirements, `GET /api/health`, Vite+React+Tailwind v3 app with tokens (`docs/06`), AppContext (theme/lang/user), `api.js`, i18n skeleton, mobile shell, ThemeToggle, RoleSwitcher (static list for now).
Verify: `curl localhost:8000/api/health` → `{"ok":true}`; `npm run dev` shows Blink'em shell; theme toggle flips light/dark; push to GitHub (public repo).
**Paste to Antigravity:**
> Read AGENTS.md and docs/01, 02, 06. Do ONLY Phase 0 of docs/09_BUILD_PLAN.md. Create the exact folder tree from docs/02, set up backend and frontend, paste the CSS tokens and tailwind config from docs/06, build the app shell (header, bottom nav placeholder, ThemeToggle, LangToggle, RoleSwitcher). Run both servers and prove they work. Commit and push. Do not start Phase 1.

## Phase 1 — Backend core (≈45 min)
Tasks: `models.py`, `db.py`, `seed.py` (docs/08), `deps.py` (X-User-Id), routers `meta` (health, categories, demo/users, demo/reset, nearby-workers), `matching.py` (haversine, eta, score, find_candidates).
Verify: `GET /api/categories` → 8; `GET /api/demo/users` → customer, worker Muthu, admin (+ bots flagged); `nearby-workers?category=plumber&lat=13.0418&lng=80.2341` → Muthu first.
**Paste:**
> Read AGENTS.md, docs/03, 04, 08. Do ONLY Phase 1: SQLAlchemy models exactly as docs/03, seed data exactly as docs/08, matching.py per docs/04 §4.1–4.2, and the meta endpoints. Use curl to verify each acceptance check in docs/09 Phase 1 and show the outputs. Commit and push.

## Phase 2 — Customer shell: Home + request form (≈45 min)
Tasks: i18n strings, components (Button, Chip, Card, Skeleton, Toast, BottomSheet, BottomNav, CategoryTile, WorkerCard, Logo), Home page (docs/07 C1) wired to `/categories` + `/nearby-workers`, RequestForm (C3) UI (submit not wired yet is OK).
Verify: Home matches `design/preview.html` in light + dark at 360 px; category tap opens form with category preselected; loading skeletons visible with throttled network.
**Paste:**
> Read AGENTS.md, docs/06, 07 (C1, C3), design/preview.html. Do ONLY Phase 2. Build the shared components and the Home + RequestForm screens exactly per the docs, using only design tokens (no hardcoded hex). Replace emoji with lucide icons. Make sure light and dark both look right at 360px. Commit and push.

## Phase 3 — Dispatch, offers, booking (backend) (≈60 min)
Tasks: `routers/requests.py` (POST /requests, GET /requests/:id, cancel, offers accept/counter/reject), `routers/worker.py` (me, inbox, quote, decline, respond-counter, jobs), `routers/bookings.py` (get, list, start, extra, respond, complete, confirm-payment, cancel, review), `bots.py`, tracking simulation, `POST /demo/booking/:id/fast-forward`.
Verify with curl script `backend/smoke.sh`: create request as customer(1) → wait 8 s → `GET /requests/:id` shows ≥ 2 offers → accept → booking has otp, `progress_pct` rises → fast-forward → worker(3 or bot-user) `start` with OTP → `complete` → `review`.
**Paste:**
> Read AGENTS.md, docs/03 and 04 fully. Do ONLY Phase 3: implement every endpoint in docs/03 for requests, offers, worker, bookings plus bots and tracking simulation exactly per docs/04. Write backend/smoke.sh that runs the full happy path with curl and prints PASS/FAIL per step. Run it until all PASS. Commit and push.

## Phase 4 — Customer flow UI (≈60 min)
Tasks: wire RequestForm → `/request/:id/searching` (radar, polling) → Offers (OfferCard, sort chips, **Book**) → Tracking (MapCard with Leaflet, StatusStepper, OTP card, FloatingBookingBar on Home) → Complete (payment mock + review) → Bookings list. (Counter sheet = Phase 6.)
Verify: from Home, tap Plumber → Find workers → offers appear within ~10 s → Book → worker pin moves on map in ~1 min → fast-forward → shows "Arrived".
**Paste:**
> Read AGENTS.md, docs/06, 07 (C4–C8). Do ONLY Phase 4. Build Searching, Offers, Tracking, Complete, Bookings screens wired to the real API with polling (usePolling). Every call needs loading + error states. Use Leaflet with OSM tiles and divIcon markers. Verify the whole customer journey in the browser. Commit and push.

## Phase 5 — Voice agent (≈45 min)  ← the "wow"
Tasks: `voice.py` + `routers/voice.py` (docs/05), `lib/wav.js`, `useVoiceRecorder`, VoiceOrb, VoiceSheet, hero mic on Home, sample chips via `/voice/parse-text`.
Verify: `curl -F audio=@sample.wav localhost:8000/api/voice/parse` returns JSON; invalid API key still returns fallback JSON (no 500); in browser speak "Sink la water leak aaguthu" → plumber/now prefilled; test utterances in docs/05.
**Paste:**
> Read AGENTS.md, docs/05 fully and docs/07 C2. Do ONLY Phase 5. Implement the backend voice parsing with Gemini (model from env), the keyword fallback, and the frontend recorder + WAV conversion + VoiceSheet. Test with a wrong API key to prove the fallback works and with the test table in docs/05. Commit and push.

## Phase 6 — Worker app (≈60 min)
Tasks: WorkerHome (online toggle, stats, inbox cards with countdown, quote stepper, send quote, decline), ActiveJob (OTP boxes, extra work, complete), customer **CounterSheet** + counter UI states on Offers, extra-charge approval card on Tracking.
Verify: as Worker (Muthu) go online → customer requests plumber in another tab/window → Muthu receives card → quote → customer sees offer → counter → Muthu accepts → booking → OTP start → extra → customer approves → complete.
**Paste:**
> Read AGENTS.md, docs/07 (W1, W2, C5 counter, C6 extra), docs/03 worker + bookings. Do ONLY Phase 6. Build the worker screens and the customer counter-offer + extra-charge approval UI. Test with two browser windows (customer and worker via RoleSwitcher using separate sessions: use two different browser profiles or an incognito window because userId is in localStorage). Commit and push.

## Phase 7 — Admin, i18n, polish, README (≈45 min)
Tasks: Admin verify queue + stats; fill all `t()` keys EN/TA/HI (docs/07 table + remaining); empty/error states; fair-price chips; haptic-feel press states; README (docs/10); `.env.example`; screenshots into `docs/screens/`.
Verify: admin approves Dinesh K → badge appears in customer offers; language toggle changes every visible string; Lighthouse mobile ≥ 80 (nice-to-have).
**Paste:**
> Read AGENTS.md, docs/07 (A1, i18n), docs/10. Do ONLY Phase 7. Build the admin screens, complete Tamil/Hindi/English strings, polish empty/error/loading states, write README.md per docs/10, commit and push.

## Final checklist before submitting (do manually)
- [ ] Repo is **Public**, `main` has latest push, `.env` NOT committed, `.env.example` present
- [ ] `README.md` has setup in ≤ 6 commands, screenshots, honest-limits section
- [ ] `POST /api/demo/reset` then run the demo path once cleanly
- [ ] 2-min video recorded (docs/10), 5-slide PPT exported
- [ ] Submission form filled before the deadline

## If Gemini (Antigravity) misbehaves
- Give it ONE phase and the phase's paste-prompt; don't chat broadly.
- If it rewrites working files: `git checkout -- <file>` or `git reset --hard HEAD` (that is why we commit every phase).
- If it hallucinates an endpoint: point it at `docs/03` line and say "match the contract exactly".
- If stuck > 15 min on one bug: commit working state, simplify that feature (e.g. static data), move on.
