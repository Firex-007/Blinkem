# 04 — Business Logic (implement exactly)

## 4.1 Distance & ETA (`matching.py`)
```python
def haversine_km(lat1, lng1, lat2, lng2): ...   # standard formula, R=6371
CITY_SPEED_KMPH = 20      # Chennai traffic assumption
PREP_MIN = 3
def eta_minutes(distance_km): return max(4, round(distance_km / CITY_SPEED_KMPH * 60 + PREP_MIN))
```
UI wording must be "est." / "about" — distance is not a guarantee of arrival (research doc §9.3).

## 4.2 Candidate selection `find_candidates(db, category, lat, lng, urgency)`
A worker is eligible if ALL true:
1. `category in worker.categories`
2. `worker.is_online`
3. `distance_km <= worker.service_radius_km`
4. worker has **no booking** in `confirmed` or `in_progress` (availability-first)
5. if `urgency == "now"`: `eta_min <= 45`
Score (higher = better):
```
proximity = 1 - min(distance_km / 8, 1)
rating    = (rating_avg - 3) / 2           # clamp 0..1
verified  = 0.5*id_verified + 0.5*skill_verified
score = 0.45*proximity + 0.25*rating + 0.15*verified + 0.15*accept_rate
```
Take top **5**. Create `Dispatch` for each: `suggested_price = worker.base_rate`, `expires_at = now + 60s`.
`matched_count = len(dispatches)`, `nearest_eta_min = min eta`.
UI badge "Within 30 min" if `eta_min <= 30`.

## 4.3 Request state machine
```
searching ──(first quote)──► offers_ready ──(offer accepted)──► booked
    │                              │
    └──────(cancel/timeout 5 min)──┴────► cancelled | expired
```
- Expire stale dispatches lazily: whenever `GET /requests/{id}` or `GET /worker/inbox` runs, mark dispatches past `expires_at` as `expired`.
- Offers whose dispatch expired while still `open` stay valid (customer can still book).

## 4.4 Offer / negotiation rules
- Worker sets price freely (UI pre-fills `suggested_price`, shows category band `price_min–price_max`). Validate `50 <= price <= 20000`.
- `fair_label`: `price > price_max*1.15 → "high"`; `price < price_min*0.8 → "low"`; else `"fair"`.
- Customer may **counter once** (`rounds` 0→1), `counter_price >= 0.4*price`.
- Worker accepts → Booking at `counter_price`. Worker declines → offer `open`, customer can only book at original price or reject. **Max one round.** Price is locked at booking; changes only through approved Extra.

## 4.5 Booking creation (on accept / counter accepted)
In one DB transaction:
- `agreed_price` = offer.price (or counter_price)
- `otp` = random 4 digits (string, zero-padded)
- copy request fields (category, description, address, lat, lng), `eta_min` = offer.eta_min
- `worker_start_lat/lng` = a point **eta-equivalent distance away**: take worker's coords as start (seed coords already ≈ 1–4 km away)
- `confirmed_at = now`; request→`booked`; other open offers→`rejected`; other dispatches→`expired`

## 4.6 Booking state machine
```
confirmed ──start(otp)──► in_progress ──complete──► completed
    └────cancel (before start only)──► cancelled
```
`display_status` (computed for UI):
- `confirmed` and `progress_pct < 100` → `on_the_way`
- `confirmed` and `progress_pct >= 100` → `arrived` (UI: "Share your code")
- else = status.

## 4.7 Simulated live tracking (demo speed)
```python
DEMO_SPEED = float(env DEMO_SPEED, default 15)          # 15x faster than real
elapsed = now - confirmed_at (seconds)
total   = eta_min * 60 / DEMO_SPEED                      # e.g. 14 min → ~56 s
progress = min(1, elapsed / total)
worker_pos = lerp(worker_start, (lat,lng), progress)
eta_remaining_min = ceil(eta_min * (1 - progress))
progress_pct = round(progress*100)
```
Only while `confirmed`. After start, worker_pos = customer location.

## 4.8 Extra charges
Worker may propose Extra while `in_progress` (`amount <= agreed_price`). Customer approves/rejects. `extra_total = sum(approved)`; `final_price = agreed_price + extra_total`. `complete` blocked while any Extra is `pending`.

## 4.9 Ratings
On review: `rating_avg = (rating_avg*rating_count + rating) / (rating_count+1)`, `rating_count += 1`. Round to 1 decimal in responses.

## 4.10 Demo bot workers (`bots.py`) — makes the solo demo work
Enabled when `DEMO_AUTO_RESPOND=true`. Bot = `Worker.is_bot == True`. The ONE real worker (Muthu, `is_bot=False`) always waits for a human.
```python
async def run_bots_for_request(request_id):      # launched with asyncio.create_task() inside POST /requests
    # open its OWN Session (SessionLocal()); never reuse the request's session
    for rank, dispatch in enumerate(bot_dispatches_sorted_by_score):
        asyncio.create_task(bot_quote(dispatch.id, delay=random.uniform(3, 6) + rank*2.0))

async def bot_quote(dispatch_id, delay):
    await asyncio.sleep(delay)
    if random.random() < 0.15: mark declined; return       # realism
    price = round_to_10(worker.base_rate * random.uniform(0.95, 1.30))
    create Offer + mark dispatch quoted + set request first_offer_at/status like the real endpoint

async def bot_respond_counter(offer_id):         # called from POST /offers/{id}/counter if worker.is_bot
    await asyncio.sleep(3)
    accept if counter_price >= 0.85*price else decline   # then same effects as worker endpoints
```
Reuse the same service functions as the real endpoints (put shared logic in `matching.py`/a `services.py`), do not duplicate logic.
Bots also auto-start/complete? **No** — the demo user drives worker flows with the real worker "Muthu" account. For bot bookings, add a hidden helper `POST /demo/booking/{id}/fast-forward` → sets `confirmed_at` back so progress=100%.

## 4.11 Cancellation
Free cancel while `confirmed`. Customer cancel → booking `cancelled`. Worker cancel → `cancelled`, worker `accept_rate -= 0.02` (min 0.5), request is NOT re-dispatched (P2).
