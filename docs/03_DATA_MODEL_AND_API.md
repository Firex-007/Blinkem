# 03 — Data Model & API Contract (DO NOT DEVIATE)

All routes prefixed `/api`. JSON in/out. Identity: header `X-User-Id: <int>` (see `GET /api/demo/users`). Errors: HTTP 4xx with `{"detail": "message"}`.
Money = integer INR. Times = ISO-8601 UTC strings. Distances = km (1 decimal). ETA = minutes (int).

## Enums
- `role`: `customer | worker | admin`
- `urgency`: `now | scheduled`
- `request.status`: `searching | offers_ready | booked | cancelled | expired`
- `dispatch.status`: `pending | quoted | declined | expired`
- `offer.status`: `open | countered | accepted | rejected | expired`
- `booking.status`: `confirmed | in_progress | completed | cancelled`
- `extra.status`: `pending | approved | rejected`
- `fair_label`: `fair | high | low`
- category slugs: `plumber, electrician, cleaner, carpenter, painter, ac_repair, cook, appliance_repair`

## Tables (SQLAlchemy models; use these names)
```
User(id, role, name, phone, lang='en'|'ta'|'hi')
Category(slug PK, name_en, name_ta, name_hi, emoji, icon, price_min, price_max, unit['visit'|'hour'], avg_eta_min)
Worker(id, user_id FK, categories JSON list[str], bio, base_rate int, rate_unit, lat, lng, service_radius_km float,
       is_online bool, id_verified bool, skill_verified bool, rating_avg float, rating_count int, jobs_done int,
       accept_rate float, languages JSON list[str], is_bot bool, avatar_color str, area_name str)
ServiceRequest(id, customer_id FK User, category, description, lat, lng, address, urgency, scheduled_at null,
               budget_hint int null, voice_transcript null, status, created_at, first_offer_at null)
Dispatch(id, request_id, worker_id, status, distance_km, eta_min, score float, suggested_price int, created_at, expires_at)
Offer(id, request_id, worker_id, price int, eta_min, status, counter_price int null, rounds int default 0, created_at)
Booking(id, request_id, offer_id, customer_id, worker_id, category, description, address, lat, lng,
        agreed_price int, status, otp str(4), eta_min, worker_start_lat, worker_start_lng,
        confirmed_at, started_at null, completed_at null, cancelled_at null, cancel_reason null,
        paid bool default false, pay_method null, cancelled_by null)
Extra(id, booking_id, amount int, reason, status, created_at)
Review(id, booking_id unique, rating int 1-5, comment null, created_at)
Complaint(id, booking_id, text, created_at)          # P2
```

## Shared response shapes
```jsonc
// WorkerCardOut
{ "id": 3, "name": "Muthu K", "avatar_color": "#1F5BFF", "area_name": "T. Nagar", "rating_avg": 4.8, "rating_count": 126,
  "jobs_done": 140, "id_verified": true, "skill_verified": true, "languages": ["ta","en"], "distance_km": 1.4,
  "categories": ["plumber"], "base_rate": 299, "rate_unit": "visit", "is_online": true, "bio": "10 yrs experience" }

// OfferOut
{ "id": 11, "worker": WorkerCardOut, "price": 349, "eta_min": 14, "status": "open",
  "counter_price": null, "rounds": 0, "fair_label": "fair" }

// ExtraOut
{ "id": 2, "amount": 150, "reason": "Replace washer", "status": "pending" }
```

## Meta
| Method | Path | Notes |
|---|---|---|
| GET | `/health` | `{ "ok": true }` |
| GET | `/categories` | `[{slug,name_en,name_ta,name_hi,emoji,icon,price_min,price_max,unit,avg_eta_min}]` |
| GET | `/demo/users` | `[{id, role, name, worker_id|null, is_bot}]` — for role switcher (customer, 1 real worker "Muthu", admin) |
| POST | `/demo/reset` | drops + reseeds DB → `{ok:true}` |
| GET | `/nearby-workers?category=plumber&lat=..&lng=..` | `[WorkerCardOut]` online only, top 6 by ETA (Home rail, no auth needed) |

## Voice
`POST /voice/parse` — multipart form: `audio` (file, `audio/wav`), `lang_hint` (`auto|ta|hi|en`, optional)
```jsonc
→ { "transcript": "Sink la water leak aaguthu, udane aal venum",
    "detected_language": "mixed",          // ta | en | hi | mixed
    "category": "plumber",                 // slug or null
    "urgency": "now",                      // now | scheduled
    "scheduled_hint": null,                // free text like "tomorrow morning" or null
    "description": "Water leaking from kitchen sink, needs urgent help.",   // English, <=140 chars
    "budget_hint": null,                   // int INR or null
    "confidence": 0.92,
    "source": "gemini" }                   // gemini | fallback
```
Also `POST /voice/parse-text` body `{text}` → same shape (used when the user types, and for tests).

## Requests & offers (customer)
`POST /requests` body
```json
{ "category":"plumber","description":"Kitchen sink leaking","lat":13.0418,"lng":80.2341,"address":"12, South Usman Rd, T. Nagar",
  "urgency":"now","scheduled_at":null,"budget_hint":null,"voice_transcript":null }
```
→ `201 { "id": 7, "status": "searching", "matched_count": 4, "nearest_eta_min": 9 }`
Side effects: create Dispatch rows for top 5 candidates (docs/04), start bot tasks.
If no candidates → `status: "searching"`, `matched_count: 0` (UI shows "no workers online nearby — try scheduling").

`GET /requests/{id}` →
```jsonc
{ "id":7, "category":"plumber", "description":"...", "address":"...", "urgency":"now", "status":"offers_ready",
  "created_at":"...", "matched_count":4, "seconds_to_first_offer": 6,
  "offers":[OfferOut,...],           // status open|countered only; sorted by price asc then eta asc
  "booking_id": null }               // set when booked
```
`POST /requests/{id}/cancel` → `{ok:true}` (request.status=cancelled, dispatches expired)

| Method | Path | Body | Result |
|---|---|---|---|
| POST | `/offers/{id}/accept` | — | `{ "booking_id": 5 }` (creates Booking at offer price, OTP, rejects other offers, request→booked) |
| POST | `/offers/{id}/counter` | `{price:int}` | `OfferOut` status=`countered`, `counter_price`, `rounds=1`. Only if `rounds==0` and `price>=40% of offer price` |
| POST | `/offers/{id}/reject` | — | `{ok:true}` |

## Worker (user.role = worker)
| Method | Path | Body | Result |
|---|---|---|---|
| GET | `/worker/me` | — | `{worker: WorkerCardOut+{service_radius_km,is_online}, stats:{earnings_today, jobs_today, jobs_done, rating_avg}}` |
| PATCH | `/worker/me` | `{is_online?, base_rate?, service_radius_km?}` | updated worker |
| GET | `/worker/inbox` | — | `[InboxItem]` see below; empty when offline |
| POST | `/worker/dispatches/{id}/quote` | `{price:int}` | `OfferOut` (dispatch→quoted; first offer sets `first_offer_at`; request→offers_ready) |
| POST | `/worker/dispatches/{id}/decline` | — | `{ok:true}` |
| POST | `/worker/offers/{id}/respond-counter` | `{accept:bool}` | accept → `{booking_id}` at `counter_price`; decline → OfferOut back to `open` (rounds stays 1; customer may only accept at original price or reject) |
| GET | `/worker/jobs` | — | `{active:[BookingBrief], past:[BookingBrief]}` |

```jsonc
// InboxItem
{ "kind": "new",                       // "new" | "counter"
  "dispatch_id": 21, "offer_id": null,
  "request": { "id":7,"category":"plumber","description":"Kitchen sink leaking","address":"...","urgency":"now",
               "budget_hint":null,"distance_km":1.4,"eta_min":9 },
  "suggested_price": 299, "price_min": 250, "price_max": 600,
  "counter_price": null, "customer_price": null,
  "expires_in_s": 48 }
// for kind="counter": dispatch_id=null, offer_id=11, counter_price=280, customer_price=349 (the worker's original quote)
```

## Bookings
`BookingBrief`: `{id,status,category,address,agreed_price,final_price,eta_min,counterpart:{name,avatar_color}, created_at}`

`GET /bookings` → `[BookingBrief]` for current user (customer or worker), newest first.

`GET /bookings/{id}` →
```jsonc
{ "id":5, "status":"confirmed", "display_status":"on_the_way",     // on_the_way | arrived | in_progress | completed | cancelled
  "category":"plumber","description":"...","address":"...","lat":13.04,"lng":80.23,
  "agreed_price":349,"extra_total":0,"final_price":349,
  "otp":"4821",                      // ONLY returned to the customer; null for worker
  "eta_min":14,"eta_remaining_min":9,"progress_pct":36,
  "worker": WorkerCardOut, "worker_pos": {"lat":13.045,"lng":80.239},
  "timeline":[{"key":"confirmed","at":"..."},{"key":"started","at":null},{"key":"completed","at":null}],
  "extras":[ExtraOut], "review": null, "paid": false, "can_cancel": true }
```
| Method | Path | Who | Body | Result |
|---|---|---|---|---|
| POST | `/bookings/{id}/start` | worker | `{otp}` | status→`in_progress`, `started_at`. Wrong OTP → 400 "Incorrect code" |
| POST | `/bookings/{id}/extra` | worker | `{amount, reason}` | `ExtraOut` pending. `amount <= agreed_price` else 400. Only while in_progress |
| POST | `/bookings/{id}/extra/{extra_id}/respond` | customer | `{approve:bool}` | ExtraOut |
| POST | `/bookings/{id}/complete` | worker | — | status→`completed`, worker.jobs_done+1. Blocked if a pending extra exists |
| POST | `/bookings/{id}/confirm-payment` | customer | `{method:"upi"|"cash"}` | `{ok:true}` sets `paid` (MOCK) |
| POST | `/bookings/{id}/cancel` | either | `{reason}` | allowed only while `confirmed`. Worker cancel lowers `accept_rate` by 0.02 |
| POST | `/bookings/{id}/review` | customer | `{rating:1-5, comment?}` | `{ok:true}`; recompute worker `rating_avg`, `rating_count`. Only once, only after completed |
| POST | `/bookings/{id}/complaint` | customer | `{text}` | P2 `{ok:true}` |

## Admin
| Method | Path | Body | Result |
|---|---|---|---|
| GET | `/admin/workers?verification=pending|all` | — | `[WorkerCardOut + {user_name, phone}]` pending = not (id_verified and skill_verified) |
| POST | `/admin/workers/{id}/verify` | `{id_verified:bool, skill_verified:bool}` | updated worker |
| GET | `/admin/bookings` | — | `[BookingBrief]` all |
| GET | `/admin/stats` | — | `{requests_total, bookings_total, completion_rate, cancellations, avg_first_offer_seconds, avg_rating, workers_online}` |

## Authorization rules
- Missing/unknown `X-User-Id` → 401. Wrong role for route → 403. Customer sees only own requests/bookings; worker only own dispatches/bookings; OTP never sent to worker; phone numbers never returned to anyone except admin.
