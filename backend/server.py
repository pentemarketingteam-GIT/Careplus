from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Cookie
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
import re
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai import OpenAITextToSpeech
import base64
import httpx


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Careplus Health Services API")
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class ContactSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str


class ReferralSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    referrer_name: str
    referrer_phone: str
    referrer_email: Optional[EmailStr] = None
    patient_name: str
    patient_phone: Optional[str] = None
    patient_condition: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ReferralCreate(BaseModel):
    referrer_name: str
    referrer_phone: str
    referrer_email: Optional[EmailStr] = None
    patient_name: str
    patient_phone: Optional[str] = None
    patient_condition: Optional[str] = None
    notes: Optional[str] = None


class SurveySubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    rating: int
    feedback: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SurveyCreate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    rating: int = Field(ge=1, le=5)
    feedback: str


class AppointmentSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: Optional[EmailStr] = None
    preferred_date: Optional[str] = None
    service: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AppointmentCreate(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    preferred_date: Optional[str] = None
    service: Optional[str] = None
    notes: Optional[str] = None


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Careplus Health Services API"}


@api_router.post("/contact", response_model=ContactSubmission)
async def create_contact(payload: ContactCreate):
    obj = ContactSubmission(**payload.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contacts.insert_one(doc)
    return obj


@api_router.get("/contact", response_model=List[ContactSubmission])
async def list_contacts():
    rows = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for r in rows:
        if isinstance(r.get('created_at'), str):
            r['created_at'] = datetime.fromisoformat(r['created_at'])
    return rows


@api_router.post("/referrals", response_model=ReferralSubmission)
async def create_referral(payload: ReferralCreate):
    obj = ReferralSubmission(**payload.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.referrals.insert_one(doc)
    return obj


@api_router.get("/referrals", response_model=List[ReferralSubmission])
async def list_referrals():
    rows = await db.referrals.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for r in rows:
        if isinstance(r.get('created_at'), str):
            r['created_at'] = datetime.fromisoformat(r['created_at'])
    return rows


@api_router.post("/survey", response_model=SurveySubmission)
async def create_survey(payload: SurveyCreate):
    obj = SurveySubmission(**payload.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.surveys.insert_one(doc)
    return obj


@api_router.post("/appointments", response_model=AppointmentSubmission)
async def create_appointment(payload: AppointmentCreate):
    obj = AppointmentSubmission(**payload.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.appointments.insert_one(doc)
    return obj


@api_router.get("/services")
async def get_services():
    return {
        "services": [
            {"slug": "skilled-nursing", "name": "Skilled Nursing", "desc": "Professional nursing care delivered in the comfort of your home, including medication management, wound care, and chronic disease monitoring."},
            {"slug": "physical-therapy", "name": "Physical Therapy", "desc": "Regain strength, balance, and mobility with personalized physical therapy programs designed by licensed therapists."},
            {"slug": "occupational-therapy", "name": "Occupational Therapy", "desc": "Recover independence in daily living activities with tailored therapy focused on real-world tasks and adaptive techniques."},
            {"slug": "speech-therapy", "name": "Speech Therapy", "desc": "Speech-language pathology for patients recovering from stroke, injury, or managing communication and swallowing disorders."},
            {"slug": "home-health-aide", "name": "Home Health Aide", "desc": "Compassionate aides assisting with bathing, dressing, grooming, and light household tasks to support everyday comfort."},
            {"slug": "medical-social-work", "name": "Medical Social Work", "desc": "Social workers helping families navigate resources, counseling, and care planning for long-term wellbeing."},
        ]
    }


# ---------- AI Assistant ----------
VALID_INTENTS = {
    "welcome", "page:about", "page:contact", "page:careers", "page:services",
    "action:book_appointment", "action:submit_referral", "action:share_feedback",
    "action:find_care", "action:meet_team", "action:tour_visit", "action:symptom_check",
    "action:start_intake",
    "service:skilled-nursing", "service:physical-therapy", "service:occupational-therapy",
    "service:speech-therapy", "service:home-health-aide", "service:medical-social-work",
}

INTAKE_FIELDS = [
    "name", "phone", "email", "condition",
    "insurance_provider", "insurance_id",
    "preferred_contact_time", "service", "urgency", "caregiver_relationship",
]

SYSTEM_PROMPT = """You are CarePlus AI, a warm, knowledgeable assistant for Careplus Health Services, Inc. — a Dallas-based home healthcare agency offering physician-directed care at home.

Company facts (use these confidently):
- Phone: 214-234-1612
- Service area: Dallas, TX and surrounding counties
- Services: Skilled Nursing, Physical Therapy, Occupational Therapy, Speech Therapy, Home Health Aide, Medical Social Work
- All services are physician-directed, licensed, and insured
- Hours: Mon–Fri 8:00 AM – 6:00 PM
- You help families learn about services, book appointments, submit referrals, explore careers, and share feedback.

Your tone: warm, concise, compassionate, and human. Answer in 2–4 short sentences unless detail is required.

CRITICAL OUTPUT RULES:
You MUST ALWAYS reply with a single valid JSON object — nothing else, no markdown, no code fences. Shape:
{
  "reply": "<your natural-language answer, 2-4 sentences>",
  "intent": "<one of: welcome | page:about | page:contact | page:careers | page:services | action:book_appointment | action:submit_referral | action:share_feedback | service:skilled-nursing | service:physical-therapy | service:occupational-therapy | service:speech-therapy | service:home-health-aide | service:medical-social-work | null>",
  "suggestions": ["<up to 4 short next-step chip labels, max 3 words each>"]
}

Intent selection:
- If user asks about a specific service → service:<slug>
- If user asks about company/team/history → page:about
- If user wants to meet the team / staff photos → action:meet_team
- If user asks what a visit looks like / day in the life / process → action:tour_visit
- If user mentions pain, symptoms, body area, or "what care do I need" → action:symptom_check
- If user wants guided help choosing care → action:find_care
- If user wants to start intake / onboarding / get registered / new patient setup / pre-fill appointment → action:start_intake
- If user wants to call/email/reach you → page:contact
- If user mentions jobs/careers/hiring → page:careers
- If user wants to schedule/book/set appointment → action:book_appointment
- If user wants to refer a patient → action:submit_referral
- If user wants to leave feedback/review → action:share_feedback
- Otherwise general → welcome (or null if unrelated)

INTAKE EXTRACTION (always run):
Scan EVERY user message for patient-intake data. Extract any of these fields that appear:
  name, phone, email, condition, insurance_provider, insurance_id,
  preferred_contact_time, service (one of: skilled-nursing, physical-therapy, occupational-therapy, speech-therapy, home-health-aide, medical-social-work),
  urgency (routine | soon | urgent), caregiver_relationship (self | spouse | child | parent | sibling | other)
Only include fields you are CONFIDENT about from the current message. Omit fields not mentioned.

Add this to your JSON response:
  "extracted": { "<field>": "<value>", ... }   // omit the key if nothing to extract

When intent is action:start_intake OR the conversation is clearly in intake mode, ask ONE focused question at a time for the next missing field in this order:
name → phone → email → caregiver_relationship → condition → service → urgency → preferred_contact_time → insurance_provider → insurance_id
When all required fields (name, phone, condition, service) are present, confirm and suggest booking.

Always offer 2–4 helpful suggestion chips that move the conversation forward.
Never fabricate medical advice. If asked medical questions, gently redirect them to talk to a clinician and offer to book an appointment.
"""


class AssistantMessage(BaseModel):
    session_id: str
    message: str


class AssistantReply(BaseModel):
    session_id: str
    reply: str
    intent: Optional[str] = None
    suggestions: List[str] = []
    extracted: Dict[str, Any] = Field(default_factory=dict)


class ChatRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str  # "user" | "assistant"
    content: str
    intent: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


def _regex_extract(text: str, history_tail: List[dict]) -> Dict[str, Any]:
    """Deterministic fallback extraction. Catches patterns Claude sometimes misses
    (bare names, phone numbers, emails) especially on short replies."""
    out: Dict[str, Any] = {}
    t = (text or "").strip()
    if not t:
        return out

    # Email
    m = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", t)
    if m:
        out["email"] = m.group(0)

    # Phone: 7+ digits (with optional separators / country code)
    phone_match = re.search(r"(?:\+?\d[\s().-]*){7,}", t)
    if phone_match:
        digits_only = re.sub(r"\D", "", phone_match.group(0))
        if 7 <= len(digits_only) <= 15:
            out["phone"] = phone_match.group(0).strip()

    # Urgency keywords
    low = t.lower()
    if re.search(r"\burgent\b|\basap\b|emergency|right away|immediately", low):
        out["urgency"] = "urgent"
    elif re.search(r"this week|soon|next few days|few days", low):
        out["urgency"] = "soon"
    elif re.search(r"\broutine\b|no rush|whenever", low):
        out["urgency"] = "routine"

    # Caregiver relationship
    rel_map = {
        r"\b(myself|for me|i am the patient|it's for me)\b": "self",
        r"\bmy (wife|husband|spouse|partner)\b": "spouse",
        r"\bmy (mom|mother|dad|father|parent)\b": "parent",
        r"\bmy (son|daughter|kid|child)\b": "child",
        r"\bmy (sister|brother|sibling)\b": "sibling",
    }
    for pat, val in rel_map.items():
        if re.search(pat, low):
            out["caregiver_relationship"] = val
            break

    # Service slug detection
    service_map = {
        "skilled-nursing": r"skilled nursing|\bnurse|nursing care",
        "physical-therapy": r"physical therapy|\bpt\b|physio",
        "occupational-therapy": r"occupational therapy|\bot\b",
        "speech-therapy": r"speech therapy|speech[- ]language|\bslp\b|swallow",
        "home-health-aide": r"home health aide|\bhha\b|aide|personal care",
        "medical-social-work": r"social work|social worker|\bmsw\b",
    }
    for slug, pat in service_map.items():
        if re.search(pat, low):
            out["service"] = slug
            break

    # Bare name detection: if the previous assistant message asked "name" AND
    # current message is 1-5 capitalized words without keywords, treat as name.
    last_asst = next(
        (m for m in reversed(history_tail) if m.get("role") == "assistant"),
        None,
    )
    if last_asst and re.search(r"\bname\b", last_asst.get("content", "").lower()):
        stripped = re.sub(r"[^\w\s.'-]", "", t).strip()
        words = stripped.split()
        if (
            1 <= len(words) <= 5
            and all(w[:1].isalpha() for w in words)
            and not re.search(r"\d", stripped)
            and len(stripped) <= 60
            and "name" not in low
        ):
            out["name"] = stripped

    # Bare insurance-id (alphanumeric 6-20 when asked)
    if last_asst and re.search(r"insurance (id|member id|number)", last_asst.get("content", "").lower()):
        id_m = re.search(r"[A-Za-z0-9-]{6,20}", t)
        if id_m and not out.get("phone") and not out.get("email"):
            out["insurance_id"] = id_m.group(0)

    return out


def _extract_json(text: str) -> dict:
    """Pull the first JSON object out of a string (robust to stray prose)."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except Exception:
        pass
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(0))
        except Exception:
            return {}
    return {}


@api_router.post("/assistant/chat", response_model=AssistantReply)
async def assistant_chat(payload: AssistantMessage):
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="LLM key not configured")

    session_id = payload.session_id or str(uuid.uuid4())

    # Persist user message
    user_rec = ChatRecord(session_id=session_id, role="user", content=payload.message)
    doc = user_rec.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.chat_messages.insert_one(doc)

    # Build the chat with full history so Claude has full context each call
    chat = LlmChat(
        api_key=api_key,
        session_id=session_id,
        system_message=SYSTEM_PROMPT,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    # Replay prior history so the model has the full thread (LlmChat creates new instance each time)
    history = await db.chat_messages.find(
        {"session_id": session_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(200)

    # Compose a single user turn that includes short recent context if needed.
    # LlmChat supports send_message with the current user message; we rely on it,
    # but also prepend last few turns inline for safety.
    context_lines = []
    for rec in history[-10:-1]:  # last 9 prior turns
        prefix = "User" if rec["role"] == "user" else "Assistant"
        context_lines.append(f"{prefix}: {rec['content']}")
    context_blob = "\n".join(context_lines)

    user_text = payload.message
    if context_blob:
        user_text = f"[Recent conversation]\n{context_blob}\n\n[Current user message]\n{payload.message}"

    try:
        raw = await chat.send_message(UserMessage(text=user_text))
    except Exception as e:
        err = str(e)
        logger.exception("LLM call failed")
        if "budget" in err.lower() or "exceeded" in err.lower():
            raise HTTPException(status_code=402, detail="AI budget exceeded. Please top up the Emergent Universal Key.")
        raise HTTPException(status_code=502, detail=f"AI unavailable: {err}")

    parsed = _extract_json(raw if isinstance(raw, str) else str(raw))
    reply_text = (parsed.get("reply") or (raw if isinstance(raw, str) else "")).strip()
    intent = parsed.get("intent")
    if intent not in VALID_INTENTS:
        intent = None
    suggestions = parsed.get("suggestions") or []
    if not isinstance(suggestions, list):
        suggestions = []
    suggestions = [str(s)[:40] for s in suggestions][:4]

    extracted = parsed.get("extracted") or {}
    if not isinstance(extracted, dict):
        extracted = {}
    # keep only whitelisted fields
    extracted = {k: v for k, v in extracted.items() if k in INTAKE_FIELDS and v not in (None, "")}

    # Deterministic regex fallback — backfills fields Claude missed
    regex_hits = _regex_extract(payload.message, history[-6:] if history else [])
    for k, v in regex_hits.items():
        extracted.setdefault(k, v)

    if not reply_text:
        reply_text = "I'm here to help with Careplus home healthcare. Could you tell me a bit more about what you're looking for?"

    # Persist assistant message
    asst_rec = ChatRecord(session_id=session_id, role="assistant", content=reply_text, intent=intent)
    adoc = asst_rec.model_dump()
    adoc["created_at"] = adoc["created_at"].isoformat()
    await db.chat_messages.insert_one(adoc)

    # Persist/merge extracted intake data keyed by chat session
    if extracted:
        await db.intakes.update_one(
            {"session_id": session_id},
            {
                "$set": {**{f"fields.{k}": v for k, v in extracted.items()},
                         "updated_at": datetime.now(timezone.utc).isoformat()},
                "$setOnInsert": {"session_id": session_id,
                                 "created_at": datetime.now(timezone.utc).isoformat()},
            },
            upsert=True,
        )

    return AssistantReply(session_id=session_id, reply=reply_text, intent=intent,
                          suggestions=suggestions, extracted=extracted)


@api_router.get("/assistant/history/{session_id}")
async def assistant_history(session_id: str):
    rows = await db.chat_messages.find(
        {"session_id": session_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(500)
    for r in rows:
        if isinstance(r.get("created_at"), str):
            r["created_at"] = datetime.fromisoformat(r["created_at"])
    return {"session_id": session_id, "messages": rows}


class TTSRequest(BaseModel):
    text: str


@api_router.post("/assistant/tts")
async def assistant_tts(payload: TTSRequest):
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="LLM key not configured")
    text = (payload.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="text is required")
    text = text[:2000]
    try:
        tts = OpenAITextToSpeech(api_key=api_key)
        audio_bytes = await tts.generate_speech(text=text, model="tts-1", voice="coral")
        b64 = base64.b64encode(audio_bytes).decode("utf-8")
        return {"audio_base64": b64, "mime": "audio/mpeg"}
    except Exception as e:
        logger.exception("TTS failed")
        raise HTTPException(status_code=502, detail=f"TTS unavailable: {e}")


# ---------- AUTH (Emergent Google Auth) ----------
# REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None


async def get_current_user(
    request: Request,
    session_token: Optional[str] = Cookie(default=None),
) -> Optional[User]:
    """Resolve current user from session_token cookie or Authorization header. Returns None if guest."""
    token = session_token
    if not token:
        auth = request.headers.get("Authorization") or ""
        if auth.lower().startswith("bearer "):
            token = auth[7:].strip()
    if not token:
        return None
    sess = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not sess:
        return None
    expires_at = sess.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and expires_at < datetime.now(timezone.utc):
        return None
    user_doc = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0})
    if not user_doc:
        return None
    return User(**user_doc)


class SessionExchange(BaseModel):
    session_id: str


@api_router.post("/auth/session")
async def auth_session(payload: SessionExchange, response: Response):
    """Exchange temporary session_id (from Emergent OAuth URL fragment) for a persistent session_token."""
    sid = (payload.session_id or "").strip()
    if not sid:
        raise HTTPException(status_code=400, detail="session_id required")

    async with httpx.AsyncClient(timeout=15) as client:
        try:
            r = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": sid},
            )
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"OAuth provider unreachable: {e}")
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session_id")
    data = r.json()

    email = data.get("email")
    name = data.get("name") or email
    picture = data.get("picture")
    session_token = data.get("session_token")
    if not email or not session_token:
        raise HTTPException(status_code=502, detail="OAuth response missing fields")

    # Upsert user
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture, "last_login": datetime.now(timezone.utc).isoformat()}},
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_login": datetime.now(timezone.utc).isoformat(),
        })

    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 3600,
    )
    return {"user_id": user_id, "email": email, "name": name, "picture": picture}


@api_router.get("/auth/me")
async def auth_me(request: Request, session_token: Optional[str] = Cookie(default=None)):
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user.model_dump()


@api_router.post("/auth/logout")
async def auth_logout(response: Response, session_token: Optional[str] = Cookie(default=None)):
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie(key="session_token", path="/", samesite="none", secure=True)
    return {"ok": True}


# ---------- INTAKE ----------
@api_router.get("/intake/{session_id}")
async def get_intake(session_id: str):
    doc = await db.intakes.find_one({"session_id": session_id}, {"_id": 0})
    if not doc:
        return {"session_id": session_id, "fields": {}}
    return doc


class IntakePatch(BaseModel):
    fields: Dict[str, Any]


@api_router.patch("/intake/{session_id}")
async def patch_intake(session_id: str, payload: IntakePatch):
    updates = {f"fields.{k}": v for k, v in payload.fields.items() if k in INTAKE_FIELDS}
    if not updates:
        return {"session_id": session_id, "fields": {}}
    await db.intakes.update_one(
        {"session_id": session_id},
        {"$set": {**updates, "updated_at": datetime.now(timezone.utc).isoformat()},
         "$setOnInsert": {"session_id": session_id,
                          "created_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    doc = await db.intakes.find_one({"session_id": session_id}, {"_id": 0})
    return doc


@api_router.post("/intake/{session_id}/submit")
async def submit_intake(
    session_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(default=None),
):
    user = await get_current_user(request, session_token)
    doc = await db.intakes.find_one({"session_id": session_id}, {"_id": 0})
    if not doc or not doc.get("fields"):
        raise HTTPException(status_code=400, detail="No intake data to submit")
    fields = doc["fields"]
    if not fields.get("name") or not fields.get("phone"):
        raise HTTPException(status_code=400, detail="Name and phone are required")

    appt = {
        "id": str(uuid.uuid4()),
        "name": fields.get("name"),
        "phone": fields.get("phone"),
        "email": fields.get("email"),
        "preferred_date": fields.get("preferred_contact_time"),
        "service": fields.get("service"),
        "notes": (
            f"Condition: {fields.get('condition','')}\n"
            f"Insurance: {fields.get('insurance_provider','')} / {fields.get('insurance_id','')}\n"
            f"Urgency: {fields.get('urgency','')}\n"
            f"Caregiver: {fields.get('caregiver_relationship','')}"
        ),
        "user_id": user.user_id if user else None,
        "source": "ai_intake",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.appointments.insert_one(appt)
    await db.intakes.update_one(
        {"session_id": session_id},
        {"$set": {"status": "submitted", "appointment_id": appt["id"],
                  "user_id": user.user_id if user else None,
                  "submitted_at": datetime.now(timezone.utc).isoformat()}},
    )
    return {"ok": True, "appointment_id": appt["id"], "logged_in": bool(user)}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
