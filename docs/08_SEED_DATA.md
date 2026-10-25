# 08 — Seed Data (`seed.py`; run on startup if DB empty; also used by `POST /demo/reset`)

Default customer location: **13.0418, 80.2341** (T. Nagar). Coordinates are approximate demo values.

## Categories
| slug | name_en | name_ta | name_hi | emoji | lucide icon | price_min | price_max | unit | avg_eta_min |
|---|---|---|---|---|---|---|---|---|---|
| plumber | Plumber | பிளம்பர் | प्लंबर | 🔧 | `Wrench` | 250 | 600 | visit | 15 |
| electrician | Electrician | எலக்ட்ரீஷியன் | इलेक्ट्रीशियन | ⚡ | `Zap` | 250 | 600 | visit | 15 |
| cleaner | Cleaning | வீடு சுத்தம் | घर की सफाई | 🧹 | `Sparkles` | 500 | 1500 | visit | 25 |
| carpenter | Carpenter | தச்சர் | बढ़ई | 🪚 | `Hammer` | 300 | 900 | visit | 25 |
| painter | Painter | பெயிண்டர் | पेंटर | 🎨 | `Paintbrush` | 400 | 1200 | visit | 30 |
| ac_repair | AC Repair | ஏசி சர்வீஸ் | एसी रिपेयर | ❄️ | `Snowflake` | 399 | 1200 | visit | 25 |
| cook | Cook | சமையல்காரர் | रसोइया | 🍳 | `ChefHat` | 400 | 1500 | hour | 30 |
| appliance_repair | Appliance Repair | வீட்டு உபகரண பழுது | उपकरण मरम्मत | 🛠️ | `Settings2` | 300 | 900 | visit | 25 |

## Users
| id | role | name | note |
|---|---|---|---|
| 1 | customer | Divya S | demo customer, lang en |
| 2 | admin | Admin | |
| 3 | worker | Muthu K | **REAL** worker (is_bot=false) — plumber, T. Nagar; driven by the human during demo |
| 4+ | worker | (bots below) | is_bot=true |
Use `worker_id` ≠ `user_id`; `/demo/users` returns both.

## Workers (rating_count ≈ jobs_done × 0.8; accept_rate shown; all `service_radius_km` 8 unless noted)
| user | name | cat | area | lat | lng | base | rating | jobs | accept | id✔ | skill✔ | langs | online |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 3 | **Muthu K** (real) | plumber | T. Nagar | 13.0460 | 80.2380 | 299 | 4.8 | 140 | 0.95 | ✔ | ✔ | ta,en | **true** |
| 4 | Selvam R | plumber | Kodambakkam | 13.0521 | 80.2255 | 349 | 4.6 | 96 | 0.90 | ✔ | ✔ | ta | true |
| 5 | Karthik M | plumber | Mylapore | 13.0368 | 80.2676 | 279 | 4.3 | 41 | 0.85 | ✔ | ✘ | ta,en | true |
| 6 | Ramesh P | plumber | Saidapet | 13.0213 | 80.2231 | 399 | 4.9 | 210 | 0.92 | ✔ | ✔ | ta,en,hi | true |
| 7 | Anbu S | electrician | Ashok Nagar | 13.0378 | 80.2123 | 299 | 4.7 | 120 | 0.93 | ✔ | ✔ | ta,en | true |
| 8 | Vignesh T | electrician | Nungambakkam | 13.0569 | 80.2425 | 349 | 4.5 | 77 | 0.88 | ✔ | ✔ | ta,en | true |
| 9 | Dinesh K | electrician | Adyar | 13.0067 | 80.2570 | 249 | 4.2 | 30 | 0.80 | ✘ | ✘ | ta | true |
| 10 | Lakshmi V | cleaner | K.K. Nagar | 13.0415 | 80.1985 | 699 | 4.8 | 160 | 0.96 | ✔ | ✔ | ta,en | true |
| 11 | Fathima B | cleaner | Alwarpet | 13.0339 | 80.2512 | 599 | 4.6 | 88 | 0.91 | ✔ | ✘ | ta,en | true |
| 12 | Saravanan D | carpenter | Vadapalani | 13.0500 | 80.2121 | 450 | 4.5 | 64 | 0.89 | ✔ | ✔ | ta | true |
| 13 | Murugan A | carpenter | Guindy | 13.0067 | 80.2206 | 399 | 4.3 | 38 | 0.84 | ✔ | ✘ | ta,hi | true |
| 14 | Bala N | painter | Velachery | 12.9815 | 80.2180 | 600 | 4.4 | 52 | 0.87 | ✔ | ✘ | ta,en | true |
| 15 | Senthil J | ac_repair | T. Nagar | 13.0390 | 80.2290 | 499 | 4.7 | 130 | 0.94 | ✔ | ✔ | ta,en | true |
| 16 | Rajeshwari M | cook | Mylapore | 13.0330 | 80.2650 | 500 | 4.9 | 175 | 0.97 | ✔ | ✔ | ta,en | true |
| 17 | Priya L | cook | Nungambakkam | 13.0580 | 80.2440 | 450 | 4.5 | 59 | 0.88 | ✔ | ✘ | ta,en | false |
| 18 | Kumar G | appliance_repair | Saidapet | 13.0230 | 80.2200 | 349 | 4.6 | 101 | 0.9 | ✔ | ✔ | ta,en | true |
`avatar_color`: cycle through `#1F5BFF #0EA5E9 #6366F1 #0891B2 #2563EB #7C3AED` (initials rendered white).
`bio` examples: "10 yrs experience · leak & pipe fitting", "Certified wiring & MCB work", "Deep cleaning specialist", etc. (one short line each).
Muthu must be **ranked first for plumber requests from the default location** (nearest + verified). Pending-verification demo: Dinesh K (id✘ skill✘) and Karthik M (skill✘) show in the admin queue.

## Sanity checks after seeding
- `GET /api/nearby-workers?category=plumber&lat=13.0418&lng=80.2341` returns Muthu first, 3–4 results, each ETA ≤ 30.
- `GET /api/admin/workers?verification=pending` returns ≥ 3 entries.
