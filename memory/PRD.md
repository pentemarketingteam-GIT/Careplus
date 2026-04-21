# Careplus Health Services — Dual-Mode Website (Static + AI Dynamic)

## Original Problem Statement
Initial: "can you build a website?" with reference https://careplus-usa.lovable.app/ (home healthcare agency).
Follow-up: Add a **dual-mode experience** — keep the static marketing site AND add a dynamic AI-powered experience where an AI assistant chats with users and the left panel changes in real-time based on the conversation (services, about, contact, appointment booking, referral).

## Architecture
- **Frontend**: React 19 + React Router 7 + TailwindCSS + framer-motion + sonner + lucide-react. "Organic & Earthy" palette (sage, terracotta, warm cream) on static; deep midnight + terracotta accents on dynamic. Typography: Cormorant Garamond + Outfit + Manrope.
- **Backend**: FastAPI + Motor (async MongoDB) + emergentintegrations (Claude Sonnet 4.5). Collections: `contacts`, `referrals`, `surveys`, `appointments`, `chat_messages`.
- **AI**: Anthropic Claude Sonnet 4.5 via Emergent universal LLM key. Each user message → LLM returns a structured JSON `{reply, intent, suggestions}`. Intent drives the left-panel view on `/ai`.
- **Mode toggle**: fixed-position `+STATIC / +DYNAMIC` pill auto-synced with the current route (`/` vs `/ai`). Session id persists in localStorage; chat history rehydrates from backend on reload.

## User Personas
- Families/patients seeking home healthcare — browse services, converse with AI, book appointments, submit referrals.
- Potential hires — view Careers (both modes).
- Existing clients — submit Client Satisfaction Survey.

## Core Requirements
1. Full static marketing site: Home, About, Services, Careers, Resources, Contact (preserves original copy).
2. Dynamic AI experience `/ai`: dark split layout — left panel renders dynamic view (Welcome, Service detail x6, About, Contact, Careers, Services grid, Book Appointment, Submit Referral, Share Feedback) driven by AI intent.
3. Right-side chat panel with Claude Sonnet 4.5, multi-turn memory, suggestion chips, typing indicator.
4. Mode toggle at top-center; visual state matches current URL.
5. All forms persist to MongoDB with UUID ids.
6. Distinctive, non-clinical aesthetic across both modes.

## What's Been Implemented
**Iter 1 (2026-04-21) — Static site MVP**
- 6 pages, full Lovable copy preserved, 4 backend form endpoints (contact, referrals, survey, appointments), services catalog, MongoDB storage, glass nav, dark footer, framer-motion animations.

**Iter 2 (2026-04-21) — AI Dynamic mode**
- `/api/assistant/chat` + `/api/assistant/history/{session_id}` backend endpoints (Claude Sonnet 4.5 via emergentintegrations).
- `/ai` route with split-screen: DynamicView (left) + ChatPanel (right).
- Intent system with 15+ intents driving left-panel views (welcome / page:about / page:contact / page:careers / page:services / action:book_appointment / action:submit_referral / action:share_feedback / service:<slug>).
- ModeToggle with route-synced active state; auto-resets mode when URL changes.
- Suggestion chips regenerated per assistant reply, default 4 chips.
- Dark-themed inline forms (Appointment, Referral, Feedback) inside the dynamic view.
- Conversation rehydration on reload via GET history endpoint; last assistant intent re-dispatched so the left panel matches where the user left off.

## Testing status
- Backend: 19/19 pytest passing (includes 4 AI assistant tests: single-turn, multi-turn context, invalid-intent sanitization, empty-history).
- Frontend: All critical flows verified by testing agent (iter 5): mode toggle, chat send (direct click + Enter), intent→view transition, appointment/referral/feedback form submit, chat rehydration on reload, static-page regression.

## Prioritized Backlog
- **P1**: Dedicated Service Areas page with ZIP list or map (currently handled via contact info card).
- **P1**: Admin auth + protected routes for GET /api/contacts, /api/referrals (currently public — PHI-adjacent risk before production).
- **P1**: Email notifications (SendGrid/Resend) on form submission + new chat sessions for instant lead response.
- **P2**: Deduplicate the mobile+desktop ChatPanel instances into a single responsive component (minor, wasteful double history fetch).
- **P2**: Rate limiting + session ownership on /api/assistant/history.
- **P2**: Stream LLM responses for lower perceived latency.
- **P3**: Multilingual support (Spanish), testimonials, blog library.

## Next Actions
- Confirm the dual-mode UX with the user.
- Decide on P1 items: admin auth + email notifications.
