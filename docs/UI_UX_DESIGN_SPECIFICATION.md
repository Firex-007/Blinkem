# Blink'em — UI/UX Design System & Architecture Specification
**Document Version:** 2.4 (Live Production Build)  
**Target Platform:** Mobile-First Responsive Web (PWA-ready)  
**Aesthetic Theme:** *Blink'em Blue* • Modern Utilitarian Quick-Commerce • OLED Pure Black  

---

## 1. Executive Summary & Design Philosophy

Blink'em is a hyperlocal, on-demand blue-collar services platform designed for rapid high-trust service dispatch in Chennai. The design system bridges the **speed and immediacy of modern quick-commerce** (Zepto, Blinkit) with the **high-trust personal marketplace feel** of Uber and Airbnb.

### Core Experience Pillars
1. **Speed & Zero-Friction Utility:** Users can request help in seconds either via a **Voice-First AI agent** (multilingual Gemini audio pipe) or an intuitive **tactile tap/type console**.
2. **People-First Marketplace, Not Commodities:** Unlike grocery delivery, services are performed by skilled human workers. The UI highlights **verified worker personas** (portraits, real names, verified badges, rating, distance, and fair transparent pricing) instead of generic catalog icons.
3. **True Dual-Theme Contrast Ergonomics:** A crisp, trustworthy daylight mode and a **True OLED 0-nit Pure Black (`#000000`)** dark mode engineered to eliminate battery drain on OLED/AMOLED mobile screens with zero bluish haze.
4. **Native Multi-Script Legibility:** Seamless script switching across **English**, **தமிழ் (Tamil)**, and **हिन्दी (Hindi)** with dedicated typographical weight compensation and dynamic line-height expansion.

---

## 2. Color System & Design Tokens

The palette uses a tailored CSS Variable token system mapped into Tailwind CSS v3 utilities.

### 2.1 Daytime Mode (Trust & Utilitarian Clarity)
* **Background (`--bg`):** `#F4F7FF` — Crisp, cool ambient off-white with subtle blue tint for reduced eye strain.
* **Surface Card (`--surface`):** `#FFFFFF` — Pure white card container.
* **Secondary Surface (`--surface-2`):** `#EAF0FF` — Soft blue-ice fill for input pills, chips, and skeleton loaders.
* **Text / Primary Ink (`--text`):** `#0A1A3F` — Deep Oxford Navy delivering WCAG AAA contrast against white.
* **Muted Ink (`--muted`):** `#5A6B8F` — Slate-gray for metadata, sub-labels, and tertiary hints.
* **Border Line (`--border`):** `#DCE5FA` — Subtle structural hair-lines (1px).
* **Brand Primary (`--primary`):** `#1F5BFF` — High-energy Royal Blue expressing modern speed and competence.
* **Primary Hover (`--primary-600`):** `#1747CC` — Deep electric blue for active/hover touch feedback.
* **Primary Soft Fill (`--primary-soft`):** `#E3ECFF` — High-legibility background tint for badges and selected states.

### 2.2 OLED Pure Black Dark Theme (True 0-Nit Obsidian)
* **Background (`--bg`):** `#000000` — Absolute pure pitch-black. Shuts off OLED pixels completely for maximum contrast and battery preservation.
* **Surface Card (`--surface`):** `#0B0B0C` — Sleek obsidian/onyx dark card surface.
* **Secondary Surface (`--surface-2`):** `#141416` — Dark graphite for nested chips and inputs.
* **Text / High-Contrast Ink (`--text`):** `#F3F4F6` — Crisp silver-white text, avoiding harsh glare.
* **Muted Text (`--muted`):** `#9CA3AF` — Apple-grade neutral gray for secondary captions.
* **Border Line (`--border`):** `#222225` — Dark carbon structural hairline, completely eliminating outdated navy/blue tints.
* **Brand Primary (`--primary`):** `#3B82F6` / `#60A5FA` — Vibrant neon-accented blue visible on pure black.
* **Primary Soft Glow (`--primary-soft`):** `rgba(59, 130, 246, 0.12)` — Subtle translucent aura.

### 2.3 Semantic & Status Tokens
| Semantic Role | Token Name | Light Hex | OLED Dark Hex | Purpose |
|---|---|---|---|---|
| **Accent / Urgency** | `--accent` | `#FFB400` | `#FBBF24` | ETA pills, worker radar highlights, live timers |
| **Success / Verified** | `--success` | `#12B76A` | `#10B981` | ID/Skill verified badges, completed bookings |
| **Warning / Caution** | `--warning` | `#F59E0B` | `#F59E0B` | Above-usual price warnings, pending actions |
| **Danger / Critical** | `--danger` | `#E5484D` | `#EF4444` | Cancellations, error toasts, decline triggers |

---

## 3. Typography & Multi-Script Font Hierarchy

### 3.1 Font Stack
* **Display & Headline Font:** `'Outfit'`, sans-serif — Geometric, modern, friendly grotesque with ultra-bold weights (800/900) for punchy headers.
* **UI & Body Font:** `'Plus Jakarta Sans'`, sans-serif — Clean, humanist sans with tall x-height and clear numerals for quick reading.
* **Tamil Script Font:** `'Noto Sans Tamil'`, system-ui — Authentic Tamil glyph rendering with full weights (400–900).
* **Hindi Script Font:** `'Noto Sans Devanagari'`, system-ui — Standard Devanagari ligature support without font-clipping.

### 3.2 Typographic Scale
| Level | Font Family | Size | Weight | Line Height | Tracking | Usage |
|---|---|---|---|---|---|---|
| **Display Hero** | Outfit | 24px–34px (fluid clamp) | 800 / 900 | 1.15 | -0.035em | Top dynamic request headline |
| **Section Title** | Outfit | 16px–18px | 800 | 1.25 | -0.02em | "Popular Instant Fixes", "Select Category" |
| **Card Title** | Plus Jakarta Sans | 14px–15px | 700 / 800 | 1.30 | -0.01em | Service category names, package titles |
| **Body / Inputs** | Plus Jakarta Sans | 14px–15px | 600 | 1.55 | 0.00em | Search bar input, descriptions, prompts |
| **Meta / Badge** | Plus Jakarta Sans | 10px–12px | 700 / 800 | 1.20 | +0.01em | ETA badges, price from, verification chips |
| **Pricing Figures** | Outfit | 15px–22px | 800 / 900 | 1.00 | -0.02em | Currency values with tabular figures (`₹199`) |

*Note on Multi-Script Adjustments:* Whenever `[lang="ta"]` or `[lang="hi"]` is active, line-height automatically expands to `1.6` with `min-h-[1.4em]` vertical containers to prevent truncation of diacritics and descenders.

---

## 4. Layout Architecture & Spatial Grid

### 4.1 Grid & Spacing System
* Built on an **8pt primary grid** with **4pt micro-increments** (`gap-1`, `gap-2`, `gap-2.5`, `gap-3`, `gap-4`, `gap-6`).
* **Mobile-First Container Width:** `360px` to `480px` centered mobile viewport with safe-area insets.
* **Desktop Split-Screen Matrix (`≥ 1024px`):**
  * **Primary Column (58%):** Dynamic Request Console, Service Categories, Popular Instant Fixes.
  * **Secondary Column (42% Sticky):** Live Leaflet Radar Map, Active Nearby Workers, Google Places Live Directory.

### 4.2 Component Anatomy & Specifications

#### 1. Dynamic Kinetic Hero Headline
* **Structure:** Static prefix (`"Tell us what needs"` / `"உங்களுக்கு என்ன"`) stacked above an animated rotating action verb (`"to be fixed..."` / `"சரிசெய்ய வேண்டுமா..."`).
* **Motion Physics:**
  * Dash-out to the right: `translateX(3.5rem)`, `opacity: 0`, `scale(0.95)` over `280ms ease-out`.
  * Position reset to far left (`-3.5rem`).
  * Dash-in from left to center: `translateX(0)`, `opacity: 1`, `scale(1)` over `300ms cubic-bezier(0.16, 1, 0.3, 1)`.
  * Cycle interval: `2400ms`.

#### 2. Unified Request Console (Voice Orb + Type Search)
* **Voice Orb:** `48px` (mobile) to `64px` (desktop) floating radial gradient button (`#1F5BFF` to `#4F46E5`) with an ambient pulsing glow aura and 48px minimum touch target.
* **Direct Search Capsule:** Flex container with `min-w-0` and `w-0 flex-1` text input to eliminate browser default width clipping.
* **Animated Placeholder Suggestions:** Fading italic query prompts (*"kitchen sink tap leaking"*, *"split AC not cooling"*) cycling every `2800ms`.
* **Action Button:** Non-shrinking (`flex-shrink-0`), `h-8 sm:h-9` blue pill with subtle shadow and right arrow glyph.

#### 3. Mobile 2-Column Service Category Grid
* **Mobile Grid (`< 640px`):** 2 Columns (`repeat(2, minmax(0, 1fr))`). Provides ~160px width per card, allowing long titles like **"Appliance Repair"** and **"எலக்ட்ரீஷியன்"** to display fully without truncation or ellipses.
* **Desktop Grid (`≥ 640px`):** 4 Columns (`repeat(4, minmax(0, 1fr))`).
* **Card Ergonomics:**
  * Aspect ratio: balanced card containing a `w-14 h-14` (56px) rounded photographic thumbnail.
  * Interactive states: `-translate-y-1` hover lift, `active:scale-95` tactile feedback, and a glowing top accent line when active.

#### 4. Trust Reassurance Micro-Cards
* 3-card horizontal grid (or 1-column on compact viewports):
  * **Verified Pros:** Govt ID & Skill Checked (Emerald icon badge).
  * **<10s Matching:** Real-time dispatch from online pros (Royal blue clock badge).
  * **Fair Counter:** 1-Round transparent price lock (Amber shield badge).

#### 5. Popular 15-Minute Instant Fix Packages
* 2x2 card matrix displaying fixed upfront pricing, estimated arrival times (`ETA 12 min`), thumbnail photos, and instant one-tap booking pre-fill into the request sheet.
* High-trust banner: `₹10,000 Damage Protection on all bookings • Guaranteed`.

#### 6. Live Chennai Radar & Pro Source Switcher
* **Dual View Mode Switcher:** Tab pill toggling between `All`, `Map`, and `Pros`.
* **Directory Source Filter:**
  * `All`: Combined pool.
  * `Google Places Live`: Verified neighborhood shops & establishments fetched in real-time.
  * `Blink'em Pros`: Active dispatched freelancers on the platform.
* **Interactive Leaflet Radar:** Custom `L.divIcon` markers with pulsing radar rings and dark-mode CSS tile invert filters (`invert(1) hue-rotate(180deg)`).

#### 7. Floating Role Switcher & Navigation
* **Bottom Navigation Bar:** 64px docked mobile navigation bar with active icon glow and haptic-like active states.
* **Role Switcher Portal:** Top header pill enabling instant 1-tap switching between **Customer (Priya)**, **Partner Pro (Muthu)**, and **Operations Admin (Meera)** for seamless hackathon demonstration.

---

## 5. Micro-Interactions & Animation Tokens

* **Fast Tactile Feedback:** `150ms–200ms ease-out` on button presses (`active:scale-[0.97]`).
* **Sheet & Modal Motion:** `280ms cubic-bezier(0.2, 0.8, 0.2, 1)` slide-up from bottom.
* **Scroll Reveal:** Smooth reveal using `opacity: 0.15 -> 1`, `filter: blur(8px) -> blur(0px)`, and `translateY(20px) -> 0` via IntersectionObserver.
* **Reduced Motion:** Fully conforms to `prefers-reduced-motion: reduce` by disabling non-essential transitions.

---

## 6. Internationalization (i18n) Architecture

The application implements a zero-dependency, reactive localization engine:
* Language persistence via `localStorage` with fallback to `en`.
* Root document attribute synchronization (`document.documentElement.lang = 'en' | 'ta' | 'hi'`).
* Interpolated translation function `t('key', { var })` supporting dynamic price and parameter injection.
* Fully translated components: Header, Hero, Typing Suggestions, Category Cards, Packages, Map Filters, Bottom Navigation, and Role Portal.

---

## 7. Accessibility (a11y) & Usability Standards

1. **Touch Ergonomics:** All interactive buttons and category cards maintain a minimum bounding box of **48×48px**.
2. **Contrast Compliance:** All text styles achieve a contrast ratio $> 4.5:1$ against backgrounds (exceeding WCAG 2.1 Level AA).
3. **Screen Reader Optimization:** Every icon-only button features an explicit `aria-label` localized in the user's selected language.
4. **OLED Ergonomics:** True 0-nit pitch black surfaces eliminate backlight bleed and prevent glare during late-night emergency repairs.
