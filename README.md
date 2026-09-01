# CarePlus Health Services — Dual-Mode Healthcare Website

An AI-powered home healthcare marketing website with two distinct experiences: a classic **Static Site** and an immersive **AI Dynamic Experience** where a conversational assistant drives real-time changes to the on-screen layout.

---

## 1. What This Project Is

CarePlus Health Services is a Dallas-based home healthcare agency (physician-directed nursing, therapy, and home aide services). This app markets those services in two modes:

- **Static Mode**: A traditional marketing site — Home, About, Services, Careers, Contact, Resources.
- **AI Dynamic Mode**: A split-screen "AI Experience" page. The right side is a chat panel (text or voice) with an AI assistant ("CarePlus AI"). The left side is a canvas that morphs in real time based on what the user says — showing a body diagram, a team grid, tour cards, or a patient intake form, without the user manually navigating.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Tailwind CSS, Framer Motion, Radix UI / shadcn components |
| Backend | FastAPI (Python), Motor (async MongoDB driver) |
| Database | MongoDB |
| AI / LLM | Claude Sonnet 4.5 via `emergentintegrations` (Emergent Universal LLM Key) |
| Voice | Web Speech API (browser STT) + OpenAI TTS (`tts-1`, voice `coral`) via `emergentintegrations` |
| Auth | Emergent-managed Google Social Login (session-cookie based) |
| Animations | Framer Motion, `canvas-confetti`, custom ambient particle canvas, self-drawing SVGs |

---

## 3. Repository Structure

```
/app
├── backend/
│   ├── server.py            # All FastAPI routes, models, AI logic, auth
│   ├── requirements.txt
│   └── .env                 # MONGO_URL, DB_NAME, EMERGENT_LLM_KEY, CORS_ORIGINS
│
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── .env                 # REACT_APP_BACKEND_URL
│   └── src/
│       ├── App.js                     # Router setup
│       ├── components/
│       │   ├── DynamicView.jsx        # Maps AI intent -> left-panel view
│       │   ├── ChatPanel.jsx          # Chat UI, STT/TTS, session mgmt
│       │   ├── IntakeWizard.jsx       # Unified booking + patient intake form
│       │   ├── BodyDiagram.jsx        # Interactive symptom-check body map
│       │   ├── TeamCards.jsx          # Flip-card staff bios
│       │   ├── TourCards.jsx          # "What a visit looks like" cards
│       │   ├── AmbientParticles.jsx   # Canvas particle background
│       │   ├── Illustrations.jsx      # Self-drawing SVG illustrations
│       │   ├── Header.jsx / Footer.jsx / Layout.jsx
│       │   ├── AuthButton.jsx         # Google login button + user menu
│       │   ├── ModeToggle.jsx         # Static <-> AI mode switch
│       │   └── ui/                    # shadcn/Radix component library
│       ├── lib/
│       │   ├── ModeContext.jsx        # Static vs AI mode state
│       │   ├── AiThemeContext.jsx     # Light/Dark theme for AI view
│       │   └── AuthContext.jsx        # Current user session state
│       └── pages/
│           ├── Home.jsx, About.jsx, Services.jsx, Careers.jsx,
│           │   Contact.jsx, Resources.jsx     # Static site pages
│           ├── AIExperience.jsx                # AI Dynamic Mode wrapper
│           └── AuthCallback.jsx                # Google OAuth redirect handler
│
├── memory/
│   ├── PRD.md                # Product requirements, changelog, backlog
│   └── test_credentials.md
└── test_reports/              # Testing agent iteration reports
```

---

## 4. Core Features

1. **Dual-mode toggle** — instantly switch between the static marketing site and the AI Experience.
2. **Conversational AI assistant** ("CarePlus AI") — powered by Claude Sonnet 4.5, drives both natural-language replies and structured `intent` + `extracted` JSON output per turn.
3. **Reactive left-panel canvas** — `DynamicView.jsx` renders a different sub-view (welcome, service detail, body diagram, team grid, tour cards, intake form) based on the AI's returned `intent`.
4. **AI Patient Intake Wizard** — a single unified form (`IntakeWizard.jsx`) that auto-fills as the user chats or types manually. Manual keystrokes are debounced (1.2s) and pushed back to the AI via `/api/assistant/note` so the assistant never re-asks for info already typed.
5. **Deterministic regex fallback** — `_regex_extract()` in `server.py` catches names, phone numbers, emails, urgency, and relationship data that the LLM sometimes misses, guaranteeing accurate form population.
6. **Voice interaction** — Speech-to-text via the browser's Web Speech API; text-to-speech via OpenAI TTS (`/api/assistant/tts`).
7. **Google Social Login** — Emergent-managed OAuth; session stored as an httpOnly cookie (`session_token`), 7-day expiry.
8. **Heavy UI animation layer** — ambient particles, self-drawing SVGs, confetti bursts, intent-reactive color theming, staggered entrance animations (Framer Motion).
9. **Light/Dark theme** — independent theme toggle scoped to the AI Experience view only.
10. **Session persistence** — chat history and intake state persist per `session_id` in MongoDB; users can Reset Conversation or return Home from the chat header.

---

## 5. Backend API Reference

All routes are prefixed with `/api`.

### General
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/` | Health check |
| GET | `/api/services` | List of the 6 healthcare services offered |

### Forms
| Method | Route | Purpose |
|---|---|---|
| POST | `/api/contact` | Submit contact form |
| GET | `/api/contact` | List contact submissions |
| POST | `/api/referrals` | Submit a patient referral |
| GET | `/api/referrals` | List referrals |
| POST | `/api/survey` | Submit feedback/survey |
| POST | `/api/appointments` | Create an appointment record |

### AI Assistant
| Method | Route | Purpose |
|---|---|---|
| POST | `/api/assistant/chat` | Main LLM turn — returns `{reply, intent, suggestions, extracted}` |
| POST | `/api/assistant/note` | Records a non-AI system note (e.g. manual form edit) into chat history |
| GET | `/api/assistant/history/{session_id}` | Rehydrate full chat history |
| POST | `/api/assistant/tts` | Convert text to speech (base64 mp3) |

### Auth (Emergent Google Login)
| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/session` | Exchange temporary OAuth `session_id` for a persistent session cookie |
| GET | `/api/auth/me` | Get current logged-in user |
| POST | `/api/auth/logout` | Clear session |

### Intake
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/intake/{session_id}` | Fetch current intake field state |
| PATCH | `/api/intake/{session_id}` | Merge-update intake fields (used by manual form typing) |
| POST | `/api/intake/{session_id}/submit` | Finalize intake into an appointment record |

---

## 6. Data Models (MongoDB Collections)

- **`chat_messages`**: `{ id, session_id, role, content, intent, created_at }`
- **`intakes`**: `{ session_id, fields: {name, phone, email, condition, insurance_provider, insurance_id, preferred_contact_time, service, urgency, caregiver_relationship}, status, created_at, updated_at }`
- **`users`**: `{ user_id, email, name, picture, created_at, last_login }`
- **`user_sessions`**: `{ user_id, session_token, expires_at, created_at }`
- **`appointments`**: `{ id, name, phone, email, preferred_date, service, notes, user_id, source, created_at }`
- **`contacts`**, **`referrals`**, **`surveys`**: raw form submissions

---

## 7. Environment Variables

**backend/.env**
```
MONGO_URL=<mongodb connection string>
DB_NAME=<database name>
EMERGENT_LLM_KEY=<Emergent Universal LLM key>
CORS_ORIGINS=<allowed origins>
```

**frontend/.env**
```
REACT_APP_BACKEND_URL=<public backend URL>
```

> Never hardcode these values. Never commit real secrets to GitHub — replace with placeholders before pushing if `.env` is tracked.

---

## 8. Running Locally

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001   # (Emergent platform uses supervisor instead)

# Frontend
cd frontend
yarn install
yarn start
```

On the Emergent platform, both services are managed by `supervisor` and hot-reload automatically on file changes.

---

## 9. Known Limitations

- **LLM Budget**: `/api/assistant/chat` and `/api/assistant/tts` depend on the Emergent Universal LLM Key. If the key's balance is exhausted, these routes return HTTP 402; the frontend shows a graceful fallback message. Top up via Profile → Manage Plan → Universal Key.
- **Performance Mode (Full/Balanced/Lite)**: Designed but intentionally not implemented — kept as a P2 backlog item for low-end hardware support.

---

## 10. Reusing This Codebase as a Template

This project is intentionally structured so it can be re-skinned for other clients/industries:
- Swap branding/colors in `frontend/src/lib/brand.js` and Tailwind theme config.
- Swap copy/services in `frontend/src/lib/content.js` and `backend/server.py` (`SYSTEM_PROMPT`, `/api/services`).
- Swap the AI's persona and intent map in `SYSTEM_PROMPT` (`backend/server.py`) to fit the new business domain.
- Re-map `DynamicView.jsx` sub-views to the new domain's equivalent interactive elements (e.g. body diagram → business-type selector).

See `/app/memory/PRD.md` for full product history, architecture decisions, and backlog.
