from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


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
