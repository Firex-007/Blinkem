# Blink'em nearby marketplace: Antigravity handoff

## Assets in this handoff

- `demo/nearby-marketplace.json` — Chennai demo fixture (10 workers, 8 local shops).
- `demo/nearby-marketplace-api.py` — dependency-free local JSON API with distance sorting, category filtering, radius filtering, and ETA estimates.
- This file — integration steps and a ready-to-send Antigravity prompt.

These are separate additions. `BLACKBOARD.md` currently marks `frontend/` and
`HANDOFF.md` as Antigravity-owned. Do not edit either file as part of the data
setup. No backend route or design token is changed here.

## Run the demo API

From the repository root:

```bash
python demo/nearby-marketplace-api.py --port 8787
```

The fixture requires only Python's standard library. The API is then available at:

```text
GET http://127.0.0.1:8787/api/demo/nearby-marketplace?lat=13.0418&lng=80.2341&category=plumber&radius_km=8
```

Parameters are optional. The default center is T. Nagar, Chennai. `category`
accepts the existing contract slugs (`plumber`, `electrician`, `cleaner`,
`carpenter`, `painter`, `ac_repair`, `cook`, `appliance_repair`). The response
contains `location`, `filters`, `workers[]`, and `shops[]`. Worker and shop
distances/ETAs are calculated for the requested coordinates and results sort
nearest first. Only workers with `availability: "available_now"` are returned.

Example response shape:

```json
{
  "schema_version": 1,
  "source": "demo_fixture",
  "demo_only": true,
  "location": { "lat": 13.0418, "lng": 80.2341, "city": "Chennai" },
  "filters": { "category": "plumber", "radius_km": 8.0 },
  "workers": [{
    "id": "demo-w-101", "name": "Muthu K", "categories": ["plumber"],
    "service": "Plumber", "locality": "T. Nagar", "rating": 4.8,
    "rating_count": 126, "phone": "+91 90000 00001",
    "availability": "available_now", "id_verified": true,
    "skill_verified": true, "bio": "...", "distance_km": 0.4,
    "eta_min": 5
  }],
  "shops": [{
    "id": "demo-s-202", "name": "ABC Plumbing & Hardware",
    "category": "Plumbing and hardware", "locality": "T. Nagar",
    "address": "...", "phone": "+91 90000 00102",
    "hours": "8:30 AM–9:00 PM", "open_now": true,
    "distance_km": 0.3, "eta_min": 5
  }]
}
```

## Frontend integration checklist

1. Keep the current home page structure, existing components, and design tokens.
   Add only two data-backed sections: **Available nearby workers** and
   **Nearby shops**. Use existing card/button/chip components and CSS variables
   or Tailwind tokens from `docs/06_DESIGN_SYSTEM.md`; do not add hex colors.
2. Fetch the endpoint when the selected location or service category changes.
   Use the selected locality coordinates when present; otherwise use the API's
   T. Nagar default. Add a short debounce only if the existing location search
   emits keystrokes while typing.
3. Render worker fields: name, service, locality, rating and review count,
   distance, ETA, available-now label, ID/skill verification badges, short bio,
   and a contact action. Show a small **Demo profile** label for this fixture.
4. Render shop fields: name, category, locality, full address, distance, hours,
   open/closed label, and a contact action.
5. Contact actions may use `tel:` links for the fixture values. Keep them marked
   as demo contacts in UI or accessibility text. These numbers are synthetic;
   they are not real workers or businesses.
6. Include existing-system-consistent loading, retryable error, and empty states.
   Do not show a false empty state while the request is pending.
7. Keep the production `GET /api/nearby-workers` response unchanged. The
   contract in `docs/03_DATA_MODEL_AND_API.md` intentionally excludes worker
   phone numbers from customer responses; this isolated sidecar endpoint is for
   demo integration only. Do not copy the demo contacts into production data.
8. Do not add shops to a locked backend route. The sidecar already supplies the
   shop list for a reliable presentation. A production `/api/nearby-shops` route
   can be coordinated separately after backend ownership is clear.

## Ready-to-send Antigravity prompt

```text
Integrate the new nearby marketplace demo data in this branch. BLACKBOARD.md
marks frontend/ and HANDOFF.md as Antigravity-owned, so you may work in the
frontend files you own; do not modify HANDOFF.md. Keep the current UI and design
system intact; this is a narrow MVP enhancement, not a redesign.

Start the local fixture with:
  python demo/nearby-marketplace-api.py --port 8787

Fetch:
  http://127.0.0.1:8787/api/demo/nearby-marketplace?lat=<selected-lat>&lng=<selected-lng>&category=<selected-category>&radius_km=8

Add data-backed “Available nearby workers” and “Nearby shops” sections to the
existing customer home page. Reuse existing cards, buttons, chips, typography,
and CSS/Tailwind design tokens. Do not introduce hardcoded hex colors. Render
the fixture's name/service/locality/rating/distance/ETA/availability/verification/
bio/contact for workers, and name/category/locality/address/hours/distance/contact
for shops. Use tel: actions and clearly mark all contacts/profiles as demo data.
The fixture values are synthetic.

Refetch when location or category changes. Use T. Nagar fallback coordinates.
Include loading, retryable error, and empty states. Preserve the current home
flow and all existing API contracts. In particular, do not alter
GET /api/nearby-workers or expose phone numbers through it; its contract excludes
worker phone values. Do not edit backend/ or scripts/ because their locks are
owned by the other agent. After integration, report exact frontend files changed
and confirm the two sections work at desktop and mobile widths.
```

