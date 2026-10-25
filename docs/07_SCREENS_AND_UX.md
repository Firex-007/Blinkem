# 07 — Screens & UX

Shell: header (Logo · location chip · LangToggle · ThemeToggle · RoleSwitcher) + content + BottomNav (role-aware). Default demo location = `DEFAULT_LAT/LNG` (T. Nagar, Chennai), address string "T. Nagar, Chennai" (editable text; no geocoding).

## Primary flow (customer)
```
Home ─(tap category | speak)→ RequestForm ─→ Searching ─→ Offers ─(Book | Offer your price)→ Tracking ─→ Complete(review)
```
Worker flow: `WorkerHome (go online) → new request card → Send quote → (counter → accept/decline) → ActiveJob (enter OTP → extra? → Complete)`.

---
## C1 Home `/`
```
┌────────────────────────────┐
│ 📍 Home · T. Nagar ▾   ◐ த  [Demo: Customer ▾] │
│ Skilled hands,             │   Display text
│ in minutes.   [⚡ ~18 min avg arrival]│
│ ┌────────────────────────┐ │
│ │ 🔍 Tell us what needs fixing…  (●mic) │  ← HERO voice/search card
│ │ Speak in Tamil, Hindi or English │ │
│ └────────────────────────┘ │
│ What do you need?          │
│ [Plumber][Electric][Clean][Carpenter]│  4×2 grid CategoryTile
│ [Painter][AC][Cook][Appliance]       │
│ Available near you now  →  │  horizontal rail of WorkerCard (GET /nearby-workers, default category=plumber, chips to switch)
│ Why Blink'em: ✔ Verified · ⚡ Fast · ₹ Your price │ 3 small trust chips row
│ ▢ FloatingBookingBar (only if active booking) │
│ [Home] [Bookings] [Account]│
└────────────────────────────┘
```
- Tap hero card text → `/request/new` (keyboard); tap mic → opens VoiceSheet.
- Tap CategoryTile → `/request/new?category=slug`.
- Data: `GET /categories`, `GET /nearby-workers`, `GET /bookings` (find active). Skeletons for tiles + rail.
- Empty rail: "No one online nearby right now — you can still schedule."

## C2 VoiceSheet (BottomSheet over Home) — see `05` for states
CTA after result → navigates to `/request/new` with state `{category, description, urgency, transcript, budget_hint, scheduled_hint}`.

## C3 RequestForm `/request/new`
Fields (top→bottom): Service (chips row, preselected) · "What's the problem?" textarea (prefilled) · Urgency segmented control **Now / Schedule** (Schedule reveals date + time inputs) · Address (text, prefilled) · Optional budget (₹ numeric) · mini MapCard of location (P1).
CTA fixed bottom: **Find workers** (loading). Validates: category + description ≥ 5 chars.
`POST /requests` → navigate `/request/:id/searching`.

## C4 Searching `/request/:id/searching`
Radar animation (3 expanding rings) around a pin; headline "Finding the nearest workers…"; sub "{matched_count} workers nearby · nearest ~{nearest_eta_min} min"; poll `GET /requests/:id` every 2 s; when `offers.length >= 1` → navigate to Offers (keep polling there). If `matched_count == 0` → empty state with "Schedule for later" button (switches urgency) and "Try again". Cancel link → `POST /requests/:id/cancel`.

## C5 Offers `/request/:id/offers`
Header "Workers ready to help" + live count chip "3 offers" + subtle "Searching for more…" spinner while < 3 offers and request < 60 s old.
List of **OfferCard** (new ones animate in). Sort: price asc (toggle chip: "Cheapest · Fastest · Top rated" client-side sort).
Each card: avatar · name · badges (ID verified, Skill verified) · ★ rating (jobs) · 📍 distance · price (PriceTag + fair label) · ETA chip "Arrives in ~14 min" (+ "Within 30 min" when ≤30) · **Book** / **Offer your price**.
- **Book** → `POST /offers/:id/accept` → `/booking/:bookingId`.
- **Offer your price** → CounterSheet: numeric input prefilled with 85 % of price (rounded to 10), helper "Fair range ₹{min}–₹{max}", quick chips (-10 %, -15 %, -20 %), CTA "Send offer". `POST /offers/:id/counter`. Card turns into "Waiting for {name}…" (poll); accepted → auto-navigate to booking (poll `request.booking_id`); declined → toast "{name} kept ₹{price}" and card returns with only **Book**.
- Footer reassurance: "You only pay after the job is done."

## C6 Tracking `/booking/:id`
```
[ MapCard: customer pin, worker pin moving, dashed route ]
Arrives in ~9 min        (display_status text: On the way / Arrived / Work in progress)
[StatusStepper vertical]
┌ Your code ─────────────────┐
│  4  8  2  1   (big digits) │   "Share this code only when {name} arrives"
└────────────────────────────┘
Worker card (avatar, badges, rating)  [Call 📞 (disabled in demo)]
Price: Agreed ₹349  (+ Extra ₹150 pending → Approve / Reject buttons)
[Cancel booking] (only while confirmed)
```
Poll `GET /bookings/:id` every 2 s. Extra pending → highlighted card "Extra work requested: Replace washer ₹150" with Approve/Reject. When `status == completed` → navigate `/booking/:id/complete`.

## C7 Complete `/booking/:id/complete`
Success check animation · "Job complete" · price breakdown (agreed + extras = final) · payment method segmented (UPI / Cash, mock) · "Confirm payment" · then rating (5 large stars) + optional comment + "Submit review" → Home with toast "Thanks!". Complaint link (P2).

## C8 Bookings `/bookings`
Tabs Active / Past; list of BookingBrief cards with status chip; tap → `/booking/:id`.

## Account (customer)
Name, language, theme, "Reset demo data" (calls `/demo/reset`) — hidden-ish at bottom.

---
## W1 WorkerHome `/worker`
```
Header: avatar · "Muthu K" · ★4.8 · ✔✔
┌ You're online ── [toggle] ┐   (big switch; PATCH /worker/me)
 Today: ₹1,250 · 3 jobs
Category chips (read-only) · Service radius slider (P1)
Incoming (poll /worker/inbox 2 s):
┌ New job nearby · 1.4 km · ~9 min ┐  countdown ring 60 s
│ Plumber — Kitchen sink leaking   │
│ T. Nagar                         │
│ Your price  [ − ₹299 + ]  (fair ₹250–₹600) │
│ [Decline]            [Send quote] │
└──────────────────────────────────┘
Counter card: "Customer offered ₹280 (you quoted ₹349)" [Decline] [Accept ₹280]
Active job card → /worker/job/:id
```
Offline → inbox hidden, illustration-free empty state "Go online to receive jobs".
Quote stepper increments by ₹10; `Send quote` → `POST /worker/dispatches/:id/quote`; card shows "Quote sent — waiting for customer".

## W2 ActiveJob `/worker/job/:id`
Customer address + MapCard (static) · status · **Enter customer code** (4 big OTP boxes, numeric) → **Start job** (`/start`) · once in progress: "Add extra work" (amount + reason → `/extra`), pending state banner, **Mark job complete** (`/complete`, disabled while extra pending). Wrong code → shake + toast "Incorrect code".

## W3 Earnings (P2) — list of completed jobs with totals.

---
## A1 Admin `/admin`
Header "Admin". Tabs: **Verify** · **Bookings** · **Stats (P2)**. Verify: list of workers with two toggles each (ID verified, Skill verified) + "Save" (`POST /admin/workers/:id/verify`). Bookings: table-like list. Stats: 6 KPI tiles from `/admin/stats` (match time, completion rate, cancellations, avg rating, bookings, workers online).

---
## Global UX rules
- Toasts for success/error; **every** failed request shows toast + Retry on the screen.
- Back arrow in header on all non-root screens.
- Role switcher sets `X-User-Id` and navigates to that role's root; also shown on every page.
- LangToggle opens a small menu (English / தமிழ் / हिन्दी), swaps all strings instantly (no reload), sets `<html lang>`, persists. Add any missing key to ALL THREE dictionaries; fall back to English if a key is missing.
- Currency format `₹1,250` (en-IN). Distances "1.4 km". ETA "~9 min".

## i18n starter dictionary (`i18n.js`, key → en / ta / hi). Three languages: English, தமிழ், हिन्दी. Add more keys the same way.
| key | en | ta | hi |
|---|---|---|---|
| app.tagline | Skilled hands, in minutes. | திறமையான கைகள், சில நிமிடங்களில். | हुनरमंद हाथ, चंद मिनटों में। |
| home.search | Tell us what needs fixing… | என்ன சரிசெய்ய வேண்டும் என்று சொல்லுங்கள்… | बताइए क्या ठीक करवाना है… |
| home.speak | Speak in Tamil, Hindi or English | தமிழ், இந்தி அல்லது ஆங்கிலத்தில் பேசுங்கள் | हिंदी, तमिल या अंग्रेज़ी में बोलें |
| home.what | What do you need? | உங்களுக்கு என்ன தேவை? | आपको क्या चाहिए? |
| home.available | Available near you now | உங்கள் அருகில் இப்போது கிடைப்பவர்கள் | आपके पास अभी उपलब्ध |
| cat.plumber | Plumber | பிளம்பர் | प्लंबर |
| cat.electrician | Electrician | எலக்ட்ரீஷியன் | इलेक्ट्रीशियन |
| cat.cleaner | Cleaning | வீடு சுத்தம் | घर की सफाई |
| cat.carpenter | Carpenter | தச்சர் | बढ़ई |
| cat.painter | Painter | பெயிண்டர் | पेंटर |
| cat.ac_repair | AC Repair | ஏசி சர்வீஸ் | एसी रिपेयर |
| cat.cook | Cook | சமையல்காரர் | रसोइया |
| cat.appliance_repair | Appliance Repair | வீட்டு உபகரண பழுது | उपकरण मरम्मत |
| voice.listening | Listening… | கேட்கிறேன்… | सुन रहा हूँ… |
| voice.processing | Understanding your request… | உங்கள் கோரிக்கையைப் புரிந்துகொள்கிறேன்… | आपकी बात समझ रहा हूँ… |
| req.find | Find workers | ஆட்களைத் தேடு | कारीगर खोजें |
| search.title | Finding the nearest workers… | அருகிலுள்ள ஆட்களைத் தேடுகிறோம்… | सबसे नज़दीकी कारीगर खोज रहे हैं… |
| offers.title | Workers ready to help | உதவ தயாராக உள்ளவர்கள் | मदद के लिए तैयार कारीगर |
| offer.book | Book | புக் செய் | बुक करें |
| offer.counter | Offer your price | உங்கள் விலையைச் சொல்லுங்கள் | अपना दाम बताएँ |
| badge.id | ID verified | அடையாளம் சரிபார்க்கப்பட்டது | पहचान सत्यापित |
| badge.skill | Skill verified | திறன் சரிபார்க்கப்பட்டது | हुनर सत्यापित |
| eta.arrives | Arrives in ~{n} min | ~{n} நிமிடத்தில் வருவார் | ~{n} मिनट में पहुँचेंगे |
| fair.fair | Fair price | நியாயமான விலை | वाजिब दाम |
| fair.high | Above usual | வழக்கத்தை விட அதிகம் | सामान्य से ज़्यादा |
| fair.low | Below usual | வழக்கத்தை விட குறைவு | सामान्य से कम |
| track.code | Share this code when the worker arrives | ஆள் வந்தவுடன் இந்த குறியீட்டைச் சொல்லுங்கள் | कारीगर के पहुँचने पर ही यह कोड बताएँ |
| status.on_the_way | On the way | வந்து கொண்டிருக்கிறார் | रास्ते में हैं |
| status.arrived | Arrived | வந்துவிட்டார் | पहुँच गए |
| status.in_progress | Work in progress | வேலை நடக்கிறது | काम चल रहा है |
| status.completed | Completed | முடிந்தது | पूरा हुआ |
| worker.online | You're online | நீங்கள் ஆன்லைனில் உள்ளீர்கள் | आप ऑनलाइन हैं |
| worker.offline | You're offline | நீங்கள் ஆஃப்லைனில் உள்ளீர்கள் | आप ऑफ़लाइन हैं |
| worker.new | New job nearby | அருகில் புதிய வேலை | पास में नया काम |
| worker.quote | Send quote | விலை அனுப்பு | दाम भेजें |
| worker.decline | Decline | வேண்டாம் | मना करें |
| job.start | Enter customer code to start | தொடங்க வாடிக்கையாளர் குறியீட்டை உள்ளிடுங்கள் | शुरू करने के लिए ग्राहक का कोड डालें |
| job.complete | Mark job complete | வேலை முடிந்தது | काम पूरा हुआ |
| review.title | How was the service? | சேவை எப்படி இருந்தது? | सेवा कैसी रही? |
