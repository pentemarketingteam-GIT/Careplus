# Careplus Health Services — Dual-Mode Interactive Website + AI Intake

## Original Problem Statement (evolving)
Start: "can you build a website?" with https://careplus-usa.lovable.app/ as inspiration. Now a production-ready **dual-mode interactive healthcare site** with an AI-guided patient intake flow, optional Google sign-in, voice interaction, and a dynamic visual experience.

## Architecture
- **Frontend**: React 19 + Router 7 + Tailwind + framer-motion + sonner + lucide-react + canvas-confetti.
- **Backend**: FastAPI + Motor (async MongoDB) + emergentintegrations (Claude Sonnet 4.5 for chat + OpenAI TTS-1 coral voice). httpx for Emergent OAuth session exchange.
- **Auth**: Optional Emergent-managed Google social login. httpOnly `session_token` cookie (7-day), Authorization Bearer fallback. Guest mode is the default.
- **Palette**: Forest Apothecary — parchment + deep forest + mustard (static); pine-black + mustard glow + moss ambient (dynamic).
- **Collections**: users, user_sessions, contacts, referrals, surveys, appointments, chat_messages, intakes.

## User Personas
- Families/patients seeking home healthcare in Dallas (guest or signed-in)
- Returning users wanting saved intake + booking history
- Potential hires, existing clients giving feedback

## Core Capabilities
1. **Static site**: Home, About, Services, Careers, Resources, Contact.
2. **Dynamic AI site** at `/ai`: intent-driven left-panel view switcher controlled by Claude Sonnet 4.5 chat.
3. **Optional auth** — Sign in with Google via Emergent OAuth or continue as guest.
4. **AI-guided patient intake** — conversational flow collects 10 fields; IntakeWizard mirrors extraction live; submits to /api/appointments.
5. **Voice mode** — Web Speech API mic for STT + OpenAI TTS playback on every AI reply.
6. 10 interactive features: ambient particles, intent-reactive color, typing/thinking glow, line-art illustrations, body diagram, find-care wizard, team flip cards, visit tour, confetti on submit, testimonials.

## What's Been Implemented (chronological)

**Iter 1** — Static MVP: 6 pages + 4 form endpoints + MongoDB.
**Iter 2** — AI dynamic mode: Claude Sonnet 4.5 chat, intent routing, left-panel switcher.
**Iter 3** — Forest Apothecary palette applied globally.
**Iter 4** — 10 interactive features + 3 testimonials on both static + dynamic.
**Iter 5 (this session)** — Optional Emergent Google Auth (guest-first) + AI patient intake:
- `/api/auth/session`, `/api/auth/me`, `/api/auth/logout` (httpOnly cookie + Bearer fallback).
- `/api/intake/{sid}` GET/PATCH + `/api/intake/{sid}/submit` POST — writes to `appointments` with `source: 'ai_intake'` and optional `user_id`.
- `/api/assistant/chat` now extracts intake fields from every user message and auto-persists to `db.intakes`.
- IntakeWizard component: live form with progress bar, 10 fields (name, phone, email, caregiver relationship, condition, service, urgency, preferred contact time, insurance provider, insurance ID), guest banner with inline sign-in.
- AuthButton (light + dark variants) in Header and /ai top bar.
- AuthContext with race-condition-safe `/me` check (skipped when `session_id` in hash).
- AuthCallback page with synchronous `useRef` guard against StrictMode double-invocation.

## Testing Status
- **Backend: 42/42 pytest passing** (26 regression + 16 new auth/intake/extraction).
- **Frontend: 100%** — all iter-7 flows verified by testing agent (intake auto-fill from chat, guest submit, auth button, mode toggle, all 10 iter-4 features intact).
- Seeded test user in /app/memory/test_credentials.md for future agents.

## Prioritized Backlog
- **P2**: Split server.py into modules (auth.py, intake.py, assistant.py, models.py) — nearing 700 lines.
- **P2**: SendGrid/Resend email notifications on appointment + referral + intake submit.
- **P2**: Admin dashboard (authenticated staff role) for reviewing intake/appointments/referrals.
- **P2**: shadcn Calendar for appointment date fields (replace native pickers).
- **P2**: Swallow 401s from /auth/me as non-error state to reduce console noise.
- **P3**: Streaming LLM responses, Spanish i18n, rate-limiting on /assistant + /auth/session, claim-guest-intake-on-login flow.

## Next Actions
- User review of the intake experience.
- Decide on P2 items: email notifications, admin dashboard.
