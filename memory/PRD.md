# Careplus Health Services — Dual-Mode Interactive Website

## Original Problem Statement
Started: "can you build a website?" with https://careplus-usa.lovable.app/ as inspiration.
Grew into: dual-mode site (static marketing + AI-powered dynamic) with 10 interactive features + real testimonials + Forest Apothecary palette.

## Architecture
- **Frontend**: React 19 + Router 7 + Tailwind + framer-motion + sonner + lucide-react + canvas-confetti.
- **Backend**: FastAPI + Motor (async MongoDB) + emergentintegrations (Claude Sonnet 4.5 chat + OpenAI TTS-1 coral voice).
- **Styling**: Forest Apothecary — parchment #F4F1EA + deep forest #2D4A2B + mustard #C9A227 accent (static); pine-black #0A1410 + mustard glow + moss ambient (dynamic). Cormorant Garamond / Outfit / Manrope.
- **Collections**: contacts, referrals, surveys, appointments, chat_messages.

## User Personas
- Families/patients seeking home healthcare in Dallas area
- Potential hires (RN, PT, OT, SLP, HHA, MSW)
- Existing clients sharing satisfaction feedback

## Core Requirements (static)
Multi-page static site (Home, About, Services, Careers, Resources, Contact) + dynamic AI experience at /ai with intent-driven left-panel views.

## What's Been Implemented

**Iter 1 — Static MVP**: 6 pages, contact/referral/survey/appointment endpoints, Mongo storage.

**Iter 2 — AI Dynamic mode**: /api/assistant/chat with Claude Sonnet 4.5, /ai split layout, intent routing (11 intents), rehydration on reload, mode toggle, 25+ data-testids.

**Iter 3 (palette)** — Forest Apothecary applied globally; service images switched to reliable Pexels URLs.

**Iter 4 — 10 Interactive features + Testimonials**
1. Living ambient particles (14 drifting breath-orbs, hue shifts per intent)
2. Intent-reactive ambient color (welcome→mustard, contact→forest, careers→moss, etc.)
3. Typing-responsive glow on chat input; thinking aura on left panel while AI works
4. Hand-drawn animated SVG illustrations for all 6 services (self-drawing on view entry)
5. AI voice mode — Web Speech API mic input + OpenAI TTS-1 "coral" voice playback per assistant message (POST /api/assistant/tts → base64 mp3)
6. Body diagram "Where does it hurt?" with 7 clickable regions auto-generating AI prompt
7. "Help me find the right care" card-stack with 6 guided options
8. Team flip cards (4 clinicians, tap to reveal bio) for action:meet_team intent
9. Gratitude confetti + personalized first-name thank-you toast on every form submit
10. "Tour of a visit" 5-step animated scroll for action:tour_visit intent
- 3 real testimonials (Sarah J., Robert M., Elena R., all 5-star) rendered on static Home + dynamic AboutView + as callout on service-detail views.

### New intents added
action:find_care, action:meet_team, action:tour_visit, action:symptom_check — all verified routing end-to-end with Claude.

## Testing status
- Backend: **26/26 pytest passing** (includes 4 new-intent tests + 3 TTS tests).
- Frontend: 100% pass on all iter-6 features (welcome chips, mic, TTS, confetti, intent→view transitions, testimonials, mode toggle regression).

## Prioritized Backlog
- **P2**: Replace native date input with shadcn Calendar in dynamic appointment form for visual consistency.
- **P2**: Admin auth + protected GET endpoints for contacts/referrals (PHI risk pre-production).
- **P2**: SendGrid/Resend email notifications on every form submission.
- **P2**: Deduplicate mobile+desktop ChatPanel instances (minor duplicate history fetch).
- **P3**: Streaming LLM responses, Spanish i18n, rate-limiting on /api/assistant endpoints, appointment calendar time-slots.

## Next Actions
- Gather user feedback on new interactive features.
- Decide on P2 items (email notifications, admin auth) for production readiness.
