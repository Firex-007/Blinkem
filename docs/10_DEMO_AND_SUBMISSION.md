# 10 — Demo, README & Submission

## README.md outline (write this at the end)
1. **Blink'em — Skilled hands, in minutes.** One-paragraph pitch + hackathon PS name ("Hyperlocal On-Demand Blue-Collar Services Platform").
2. Screenshots (home light/dark, voice sheet, offers, tracking, worker inbox).
3. Features (P0/P1 actually built — tick only what works).
4. Tech stack + architecture diagram (from docs/02).
5. **Run locally** (≤ 6 commands, from docs/02) + `.env` instructions.
6. Demo guide: roles via the role switcher; use `POST /api/demo/reset`; use two browser profiles for customer + worker.
7. **Honest limits**: demo auth, simulated bot workers, simulated tracking, mock payments, seeded data, no user research claims beyond what was done, Gemini free-tier privacy note.
8. Roadmap: real OTP login, KYC partner verification, live GPS + routing, payments (UPI), push notifications, regional-language TTS, apartment-association onboarding.

## 2-minute video script (max 2:00, skip login)
| Time | Screen | Say (short) |
|---|---|---|
| 0:00–0:12 | Home (dark→light toggle) | "Finding a plumber means calling five people. Blink'em finds an available, verified worker near you in minutes." |
| 0:12–0:35 | Tap mic, speak Tanglish: "Sink la water leak aaguthu, udane aal venum" | "Voice in Tamil, Hindi or English — Gemini turns it into a structured request." Show prefilled chips → Find workers |
| 0:35–1:00 | Searching → Offers arriving | "Only online, free workers nearby get the job. They set their own price — fair-price tags keep it transparent." Point at badges (ID ✔ / Skill ✔) |
| 1:00–1:20 | Offer your price → worker window accepts | "Customers can negotiate once. Price locks when both agree." (split-screen with Worker Muthu accepting) |
| 1:20–1:42 | Tracking map, OTP | "Live ETA, and a 4-digit code the customer shares on arrival — safety for both sides." Worker enters OTP, adds extra work, customer approves |
| 1:42–1:55 | Complete + review, brief admin verify | "Pay after the job, rate, and admins verify identity and skill separately." |
| 1:55–2:00 | Logo | "Blink'em — skilled hands, in minutes." |
Tips: pre-warm backend; use `fast-forward` if map is slow; record at 1080×1920 phone frame or a narrow browser window; keep demo voice clean (typed sample chips are the backup).

## 5-slide PPT (mandatory format)
1. **Problem statement & understanding** — scattered WhatsApp/justdial/word-of-mouth; availability, price opacity, trust gaps, accessibility; the 30-minute target. (Use "potential gaps", per research doc; do not claim surveys unless done.)
2. **Technical approach** — architecture diagram; matching score formula; booking state machine; Gemini voice pipeline; polling realtime; stack.
3. **Feasibility & viability** — works today on free tier + SQLite; seeded pilot in one locality + 3–8 categories; revenue: small commission on completed jobs / worker subscription / lead fee; cost: hosting, maps, verification, support; supply–demand: start with one area and apartment associations; legal: Indian data-protection, consumer, payments compliance to review.
4. **Impact & benefit** — workers: steady work, own pricing, simple voice-first UX in Tamil, Hindi, English; customers: faster, fair, safer; community: local income, verified workforce. Metrics we track: time-to-first-offer, completion rate, cancellations, ratings.
5. **Comparison with existing platforms (our unique features)** — table below.

### Slide 5 comparison table (verify each claim yourselves before presenting — based on the team's research doc)
| Capability | Blink'em | Urban Company-style managed catalogue | Directories (Justdial / Sulekha) | Job platforms (WorkIndia / Apna) | Domestic-help (BookMyBai etc.) |
|---|---|---|---|---|---|
| On-demand, available-now matching | ✔ online + free only | Typically scheduled slots (verify) | Directory/lead model (verify) | Hiring, not one-time jobs | Hiring/staffing (verify) |
| Worker-set price + customer counter | ✔ | Typically fixed catalogue prices (verify) | Quotes by calling | — | — |
| Voice request in Tamil/Hindi/English | ✔ Gemini | (verify) | (verify) | — | — |
| Separate ID vs skill verification | ✔ | (verify) | varies | — | varies |
| OTP arrival + extra-charge approval | ✔ | (verify) | — | — | — |
Mark anything you could not verify as "not verified" — the research doc stresses distinguishing available / unavailable / unverified features.

## Submission checklist (from the organisers)
1. PPT (5 slides) 2. ≥ 60 % MVP matching the problem statement 3. Demo video (≤ 2 min) 4. **Public** GitHub repo with complete code.
Pushes: initial (24 Oct 12–3 PM), updated (24 Oct 8–10 PM), final (25 Oct 7–9 AM); submission form 25 Oct 9 AM–12 PM.
