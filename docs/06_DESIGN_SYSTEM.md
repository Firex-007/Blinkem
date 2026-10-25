# 06 — Design System ("Blink'em Blue")

**Feel:** fast, trustworthy, utilitarian-but-friendly. Quick-commerce speed (big ETA, floating booking bar, tile grid) but with **people-first cards, a voice-first hero, and an offers marketplace** so it does not look like Blinkit. Blue + white (light) / near-black navy (dark). No yellow/green brand colours.

## Don't-look-like-Blinkit checklist
- Primary is **royal blue**, not yellow/green. Amber is only a tiny ETA/urgency accent.
- Home hero = **voice/search card with mic orb** (not a delivery-time banner).
- Cards show **a person** (avatar, verified badges, rating, own price) not products.
- Unique screens: Offers (live quotes arriving), Counter sheet, OTP/arrival card, worker inbox with countdown.
- Rounded-2xl everywhere, soft blue-tinted shadows, generous whitespace.

## Tokens — `frontend/src/index.css` (paste exactly)
```css
:root{
  --bg:#F4F7FF; --surface:#FFFFFF; --surface-2:#EAF0FF;
  --text:#0A1A3F; --muted:#5A6B8F; --border:#DCE5FA;
  --primary:#1F5BFF; --primary-600:#1747CC; --primary-ink:#FFFFFF; --primary-soft:#E3ECFF;
  --accent:#FFB400; --accent-ink:#3A2A00;
  --success:#12B76A; --success-soft:#DDF7EA; --warning:#F59E0B; --danger:#E5484D; --danger-soft:#FDE7E8;
  --shadow:0 8px 24px rgba(31,91,255,.10); --shadow-sm:0 2px 8px rgba(10,26,63,.06);
  --radius:20px; --radius-sm:12px;
}
.dark{
  --bg:#050A17; --surface:#0D1630; --surface-2:#142048;
  --text:#EAF0FF; --muted:#8FA1C9; --border:#1D2B57;
  --primary:#4C82FF; --primary-600:#6E9BFF; --primary-ink:#04112E; --primary-soft:#12224F;
  --accent:#FFC93D; --accent-ink:#2B1F00;
  --success:#32D583; --success-soft:#0E2E22; --warning:#FBBF24; --danger:#FF6B70; --danger-soft:#3A1519;
  --shadow:0 8px 24px rgba(0,0,0,.5); --shadow-sm:0 2px 8px rgba(0,0,0,.4);
}
html{background:var(--bg);color:var(--text);font-family:'Plus Jakarta Sans','Noto Sans Tamil','Noto Sans Devanagari',system-ui,sans-serif;}
body{font-size:15px;line-height:1.45} [lang=ta] body,[lang=hi] body,.ta,.hi{line-height:1.6}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
```
Load fonts in `index.html`: Google Fonts `Plus Jakarta Sans` (500,600,700,800) `Noto Sans Tamil` (500,700) and `Noto Sans Devanagari` (500,700), `display=swap`.

## `tailwind.config.js` (extend)
```js
darkMode: 'class',
content: ['./index.html','./src/**/*.{js,jsx}'],
theme:{ extend:{
  colors:{ bg:'var(--bg)', surface:'var(--surface)', surface2:'var(--surface-2)', ink:'var(--text)', muted:'var(--muted)',
           line:'var(--border)', primary:'var(--primary)', primary600:'var(--primary-600)', onprimary:'var(--primary-ink)',
           soft:'var(--primary-soft)', accent:'var(--accent)', onaccent:'var(--accent-ink)',
           success:'var(--success)', successsoft:'var(--success-soft)', warning:'var(--warning)', danger:'var(--danger)', dangersoft:'var(--danger-soft)' },
  borderRadius:{ card:'var(--radius)', chip:'var(--radius-sm)' },
  boxShadow:{ card:'var(--shadow)', sm2:'var(--shadow-sm)' },
  keyframes:{ pulseRing:{'0%':{transform:'scale(.9)',opacity:.6},'100%':{transform:'scale(1.8)',opacity:0}},
              wave:{'0%,100%':{transform:'scaleY(.3)'},'50%':{transform:'scaleY(1)'}},
              shimmer:{'100%':{transform:'translateX(100%)'}},
              slideUp:{'0%':{transform:'translateY(100%)'},'100%':{transform:'translateY(0)'}} },
  animation:{ pulseRing:'pulseRing 1.6s ease-out infinite', wave:'wave 1s ease-in-out infinite',
              shimmer:'shimmer 1.4s infinite', slideUp:'slideUp .28s cubic-bezier(.2,.8,.2,1)' }
}}
```
Usage: `bg-bg text-ink`, `bg-surface border border-line rounded-card shadow-card`, `bg-primary text-onprimary`.

## Typography
| Role | Size / weight |
|---|---|
| Display (home headline) | 28 / 800, tracking -0.02em |
| Title | 20 / 700 |
| Section header | 17 / 700 |
| Body | 15 / 500 |
| Caption / meta | 13 / 500, `text-muted` |
| Price | 22 / 800 (tabular-nums) |
Tamil / Hindi: same sizes, line-height 1.6, never letter-spacing.

## Spacing & shape
4-pt grid (4,8,12,16,20,24,32). Screen padding 16. Card padding 16. Radius: cards 20, chips/inputs 12, buttons 14, avatars full. Min touch 48×48. Icons: `lucide-react`, stroke 1.75, size 20 (24 for nav/mic).

## Components (build in `components/`, props in parentheses)
| Component | Spec |
|---|---|
| `Button` (variant primary/secondary/ghost/danger, size, loading, full) | primary: `bg-primary text-onprimary` h-12 rounded-[14px] font-700; secondary: `bg-soft text-primary`; ghost: text only; active:scale-[.98]; loading shows spinner and disables |
| `Chip` (tone neutral/primary/success/accent/danger, icon) | h-7 px-2.5 rounded-full text-[12px] font-600; `accent` = amber bg for ETA |
| `Card` | `bg-surface border border-line rounded-card shadow-sm2 p-4` |
| `Skeleton` | `bg-surface2` with shimmer overlay; match target shape |
| `Toast` | top-center, slide-down, auto-dismiss 3 s, tones success/error |
| `BottomSheet` (open, onClose, title) | fixed bottom, max-w 480, rounded-t-[28px], grabber bar, backdrop 50 % navy, `animate-slideUp`, trap scroll |
| `BottomNav` (role-aware) | 3 tabs, 64 px high, active = primary icon + label + soft pill; safe-area padding |
| `CategoryTile` (cat) | square-ish 1:1.05, `bg-surface border border-line rounded-card`, 44 px icon bubble `bg-soft text-primary` with lucide icon, label 13/600 centered (2 lines max); press = `bg-soft` |
| `WorkerCard` (compact for rail) | 168 px wide; avatar (initials on `avatar_color`) 48; name; ✔ badge; ★ rating · jobs; `from ₹base`; ETA chip (accent) |
| `OfferCard` | avatar 52, name + badges row (ID ✔, Skill ✔ as small success chips), rating/jobs/distance meta, **price big** + fair-label chip, ETA chip, buttons: **Book** (primary, flex-1) and **Offer your price** (secondary). `countered` state shows "Waiting for {name}…" with spinner |
| `StatusStepper` (steps, current) | vertical on Tracking: Confirmed → On the way → Work in progress → Completed; done = filled primary dot + line, current = pulsing ring |
| `VoiceOrb` (state, level) | 96 px circle primary, mic icon, 2 `pulseRing` rings when recording, scale with `level` |
| `MapCard` | 220 px high rounded-card, Leaflet, customer pin (primary), worker pin (accent circle with wrench icon) `L.divIcon`, polyline dashed primary |
| `FloatingBookingBar` | fixed above BottomNav, mx-4, rounded-2xl `bg-primary text-onprimary` shadow-card; avatar + "Muthu is on the way" + ETA + progress line; tap → `/booking/:id` |
| `RoleSwitcher` | top-right pill "Demo: Customer ▾" → sheet with Customer / Worker / Admin. Always visible (needed for demo) |
| `ThemeToggle`, `LangToggle` | ThemeToggle = sun/moon icon button. LangToggle = pill showing current code (EN / TA / HI) that opens a small menu: English · தமிழ் · हिन्दी |
| `Logo` | rounded-square 32 px `bg-primary` with white bolt-in-wrench glyph (lucide `Zap`) + wordmark "Blink'em" 800 |
| `PriceTag` (amount, label) | ₹ + number, `tabular-nums`; label chip fair/high/low: fair=success, high=danger-soft text danger "Above usual", low=soft "Below usual" |

## States every component/screen needs
default · pressed · disabled · loading (skeleton/spinner) · empty (illustration-free: big icon in `bg-soft` circle + 1 line + CTA) · error (danger-soft card + Retry).

## Motion
150–280 ms ease-out. Sheets slide up. Offers fade+slide in as they arrive (stagger 60 ms). Radar on Searching = 3 expanding rings. No animation > 1.6 s loops except orb/radar. Respect `prefers-reduced-motion`.

## Accessibility
Contrast ≥ 4.5:1 (tokens verified). Never colour-only status (always icon/text). `aria-label` on icon buttons. Focus ring `outline 2px var(--primary)`. Inputs `inputMode="numeric"` for OTP/price.

## Reference
`design/preview.html` shows Home, Voice sheet, Offers, Tracking in light/dark — match it.
