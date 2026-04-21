# Careplus Health Services — Marketing Website

## Original Problem Statement
User asked: "can you build an website?" — provided https://careplus-usa.lovable.app/ as inspiration. Chose "Inspired by (same vibe but improved/customized)" and asked to keep original content/copy from the Lovable reference.

## Architecture
- **Frontend**: React 19 + React Router 7 + TailwindCSS + framer-motion + sonner (toasts) + lucide-react (icons). Custom "Organic & Earthy" theme (sage #4A6741 + terracotta #C17767 + warm cream #FDFBF7), typography: Cormorant Garamond (display) + Outfit (body) + Manrope (labels).
- **Backend**: FastAPI + Motor (async MongoDB). Endpoints all prefixed `/api`. Collections: `contacts`, `referrals`, `surveys`, `appointments`.
- **No authentication** (marketing MVP).

## User Personas
- **Families / patients** seeking home healthcare in Dallas area — browse services, submit referrals, set appointments.
- **Potential hires** (nurses, therapists, aides) — view careers, apply.
- **Existing clients** — submit satisfaction surveys and feedback.

## Core Requirements (static)
1. Multi-page marketing site with six pages: Home, About, Services, Careers, Resources, Contact.
2. Full brand copy preserved from reference site (hero, welcome, services list, quick access cards).
3. Primary CTAs: click-to-call 214-234-1612 and appointment/contact form.
4. Referral submission form with two sections (about you / about patient).
5. Client satisfaction survey with 1–5 star rating.
6. Distinctive, non-clinical visual design (avoid medical-blue cliché).

## What's Been Implemented (2026-04-21)
- Backend endpoints:
  - `GET /api/` (health), `GET /api/services` (6 service catalogue)
  - `POST /api/contact` + `GET /api/contact`
  - `POST /api/referrals` + `GET /api/referrals`
  - `POST /api/survey`
  - `POST /api/appointments`
- Frontend pages (all mobile-responsive with framer-motion entrance animations):
  - **Home**: asymmetric hero with floating glass card, 3-up bento quick-access (Service Areas, Survey, Referrals), welcome section with "Home Health Care is" bullets + photo + 15+ yrs stat, services grid (6 cards), dark CTA strip with grain texture.
  - **About**: hero, image + 4-value grid (Compassion/Safety/Partnership/Quality), tan resource box.
  - **Services**: alternating image/content rows for all 6 services with per-service CTAs.
  - **Careers**: hero, 4 perks, 6 open positions with Apply buttons.
  - **Resources**: 4-item FAQ accordion + Client Satisfaction Survey form with 5-star rating.
  - **Contact**: 2 tabs (Contact/Appointment + Referral), sidebar with phone/email/hours + urgent call card.
- Forms persist to MongoDB with UUID ids + ISO timestamps; `_id` excluded on reads.
- Glassmorphism sticky header, mobile hamburger menu, deep dark footer with nav + contact.
- Toast notifications via Sonner for form feedback.
- Testing: backend 15/15 pytest passing; frontend 25/25 passing after survey empty-email fix.

## Prioritized Backlog
- **P1**: Add dedicated Service Areas page with map/zip code list; wire "View areas" card correctly.
- **P1**: Admin dashboard (protected) to view contacts/referrals/surveys — currently GET endpoints expose PII publicly.
- **P2**: SendGrid/Resend integration to email submissions to agency inbox.
- **P2**: Appointment scheduling calendar (time-slot picker).
- **P2**: Testimonials / case study section on Home.
- **P3**: Blog/resources library (articles, PDFs).
- **P3**: Multilingual support (Spanish).

## Next Actions
- Get confirmation from user, then (optionally) add admin auth + email notifications.
