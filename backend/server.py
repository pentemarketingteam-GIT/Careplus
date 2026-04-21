from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
import re
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai import OpenAITextToSpeech
import base64


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
    "service:skilled-nursing", "service:physical-therapy", "service:occupational-therapy",
    "service:speech-therapy", "service:home-health-aide", "service:medical-social-work",
}

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
- If user wants to call/email/reach you → page:contact
- If user mentions jobs/careers/hiring → page:careers
- If user wants to schedule/book/set appointment → action:book_appointment
- If user wants to refer a patient → action:submit_referral
- If user wants to leave feedback/review → action:share_feedback
- Otherwise general → welcome (or null if unrelated)

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


class ChatRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str  # "user" | "assistant"
    content: str
    intent: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


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
        logger.exception("LLM call failed")
        raise HTTPException(status_code=502, detail=f"AI unavailable: {e}")

    parsed = _extract_json(raw if isinstance(raw, str) else str(raw))
    reply_text = (parsed.get("reply") or (raw if isinstance(raw, str) else "")).strip()
    intent = parsed.get("intent")
    if intent not in VALID_INTENTS:
        intent = None
    suggestions = parsed.get("suggestions") or []
    if not isinstance(suggestions, list):
        suggestions = []
    suggestions = [str(s)[:40] for s in suggestions][:4]

    if not reply_text:
        reply_text = "I'm here to help with Careplus home healthcare. Could you tell me a bit more about what you're looking for?"

    # Persist assistant message
    asst_rec = ChatRecord(session_id=session_id, role="assistant", content=reply_text, intent=intent)
    adoc = asst_rec.model_dump()
    adoc["created_at"] = adoc["created_at"].isoformat()
    await db.chat_messages.insert_one(adoc)

    return AssistantReply(session_id=session_id, reply=reply_text, intent=intent, suggestions=suggestions)


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
    text = text[:2000]  # keep TTS costs sane
    try:
        tts = OpenAITextToSpeech(api_key=api_key)
        audio_bytes = await tts.generate_speech(text=text, model="tts-1", voice="coral")
        b64 = base64.b64encode(audio_bytes).decode("utf-8")
        return {"audio_base64": b64, "mime": "audio/mpeg"}
    except Exception as e:
        logger.exception("TTS failed")
        raise HTTPException(status_code=502, detail=f"TTS unavailable: {e}")


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
