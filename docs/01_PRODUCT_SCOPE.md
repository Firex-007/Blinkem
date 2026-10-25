# 01 — Product Scope

## One-liner
**Blink'em** — *Skilled hands, in minutes.* "Blink and they're there": a nod to quick-commerce speed, *'em* = the workers (நொடி / पल भर = a moment).

**India-wide by design:** English + தமிழ் + हिन्दी UI and voice, ₹ pricing, UPI-style payment, city-agnostic geo logic. The seeded pilot is Chennai; adding a city = adding workers + a default lat/lng. A hyperlocal marketplace where nearby, available blue-collar workers quote their own price and arrive fast, with trust built in.

## Problem (from the hackathon PS)
- Customers can't quickly find reliable, affordable, available plumbers/electricians/cleaners/cooks/painters nearby.
- Local skilled workers struggle to get consistent work, reach nearby customers, and compete digitally.
- Needed: hyperlocal on-demand + scheduled jobs, worker-set rates, customer negotiation, worker verification, quality, fair pricing, safety, trust, match ideally **within 30 minutes**.

## Users / roles
| Role | Does |
|---|---|
| Customer | Requests a service (voice or tap), compares offers, books or counters, tracks, shares OTP, confirms, reviews |
| Worker | Goes online, sees nearby requests, sends own quote, accepts/declines counters, starts job via OTP, proposes extra work, completes |
| Admin | Verifies workers (ID and skill separately), watches bookings and stats |

## Our differentiators (use on slide 5)
1. **Voice-first intake in Tamil/Hindi/English (incl. Tanglish & Hinglish)** (Gemini multimodal) — a worker or elderly customer can just speak.
2. **Availability-first matching** — only ONLINE workers with no active job, ranked by ETA, not just a directory list.
3. **Worker-set price + one-round counter-offer** with a "fair price" indicator — transparent negotiation, price locked on agreement.
4. **Trust loop** — separate ID vs skill verification badges, OTP arrival confirmation, extra-charge approval (cap = 100 % of agreed price), reviews.
5. **Request-to-completion tracking** — one coordinated status flow, simulated live map ETA.

## Scope — build in this order
| Pri | Feature |
|---|---|
| **P0** | Categories + Home; request (tap + voice); matching/dispatch; bot workers auto-quote; offers list; book; booking tracking w/ map + OTP; worker app (online toggle, inbox, quote, OTP start, complete); customer confirm + review; light/dark theme |
| **P1** | Counter-offer (customer → worker); extra-charge approval; fair-price label; EN/TA/HI toggle; cancel flow; admin verify queue; scheduled (non-urgent) requests |
| **P2** | Admin stats dashboard; complaints; earnings screen; share-status link; recurring bookings; TTS replies |

## Explicitly CUT (do not build)
Real payments (mock only), real auth/OTP SMS, real routing/live GPS (simulated), push notifications, chat, PostGIS, admin analytics beyond counters, native apps.

## Coverage of PS requirements
| PS requirement | Where |
|---|---|
| Hyperlocal matching | `04` matching, Haversine + ETA |
| On-demand + scheduled | request `urgency` now/scheduled |
| Workers set own rates | worker quote (prefilled with their base rate, editable) |
| Customers negotiate | counter-offer |
| 30-minute target | ETA filter + "within 30 min" label, nearest-first |
| Verification | admin verify; ID + skill badges |
| Quality / trust / safety | ratings, OTP, extra-charge approval, cancel rules |
| Fair pricing | category price band → Fair / Above usual / Below usual label |
| Accessible | voice + Tamil/Hindi + big touch targets + simple flow |

## Honest limits (must be stated in README + PPT)
Demo auth, simulated bot workers (so a solo demo works), simulated tracking, mock payment, seeded Chennai data. No user interviews were conducted unless the team actually did them — never claim validation we did not do.

## Demo metrics to display (admin/stats)
Match time (request → first offer), booking completion rate, cancellations, avg rating.
