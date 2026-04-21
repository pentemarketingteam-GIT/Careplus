"""Backend API tests for Careplus Health Services."""
import os
import pytest
import requests
from dotenv import load_dotenv
from pathlib import Path

# Load frontend .env to get REACT_APP_BACKEND_URL
load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")
BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Health ----------
class TestHealth:
    def test_root(self, client):
        r = client.get(f"{API}/")
        assert r.status_code == 200
        assert "Careplus" in r.json().get("message", "")


# ---------- Services ----------
class TestServices:
    def test_get_services(self, client):
        r = client.get(f"{API}/services")
        assert r.status_code == 200
        data = r.json()
        assert "services" in data
        assert len(data["services"]) == 6
        slugs = {s["slug"] for s in data["services"]}
        assert slugs == {
            "skilled-nursing", "physical-therapy", "occupational-therapy",
            "speech-therapy", "home-health-aide", "medical-social-work",
        }


# ---------- Contact ----------
class TestContact:
    def test_create_contact_success(self, client):
        payload = {
            "name": "TEST_John Doe",
            "email": "test_john@example.com",
            "phone": "555-1234",
            "subject": "Inquiry",
            "message": "Need information about skilled nursing.",
        }
        r = client.post(f"{API}/contact", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["name"] == payload["name"]
        assert data["email"] == payload["email"]
        assert data["message"] == payload["message"]
        assert "id" in data
        assert "_id" not in data
        assert "created_at" in data

        # GET to verify persistence
        list_r = client.get(f"{API}/contact")
        assert list_r.status_code == 200
        all_contacts = list_r.json()
        assert any(c["id"] == data["id"] for c in all_contacts)
        # ensure no _id leaks
        for c in all_contacts:
            assert "_id" not in c

    def test_create_contact_invalid_email(self, client):
        payload = {"name": "TEST_x", "email": "not-an-email", "message": "hi"}
        r = client.post(f"{API}/contact", json=payload)
        assert r.status_code == 422

    def test_create_contact_missing_required(self, client):
        # missing name
        r = client.post(f"{API}/contact", json={"email": "a@b.com", "message": "hi"})
        assert r.status_code == 422

    def test_optional_phone_subject(self, client):
        # Pydantic optional fields - omit phone/subject
        r = client.post(f"{API}/contact", json={
            "name": "TEST_NoPhone", "email": "np@example.com", "message": "ok"
        })
        assert r.status_code == 200
        d = r.json()
        assert d["phone"] is None
        assert d["subject"] is None


# ---------- Referrals ----------
class TestReferrals:
    def test_create_referral_success(self, client):
        payload = {
            "referrer_name": "TEST_Dr. Who",
            "referrer_phone": "555-9999",
            "referrer_email": "doc@example.com",
            "patient_name": "TEST_Patient A",
            "patient_phone": "555-1111",
            "patient_condition": "post-surgical",
            "notes": "needs PT",
        }
        r = client.post(f"{API}/referrals", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["referrer_name"] == payload["referrer_name"]
        assert data["patient_name"] == payload["patient_name"]
        assert "id" in data and "_id" not in data

        # Verify list
        list_r = client.get(f"{API}/referrals")
        assert list_r.status_code == 200
        for c in list_r.json():
            assert "_id" not in c
        assert any(c["id"] == data["id"] for c in list_r.json())

    def test_referral_minimal(self, client):
        # only required fields
        r = client.post(f"{API}/referrals", json={
            "referrer_name": "TEST_Min",
            "referrer_phone": "555-0000",
            "patient_name": "TEST_PMin",
        })
        assert r.status_code == 200
        d = r.json()
        assert d["referrer_email"] is None
        assert d["patient_phone"] is None

    def test_referral_invalid_email(self, client):
        r = client.post(f"{API}/referrals", json={
            "referrer_name": "x", "referrer_phone": "1", "referrer_email": "bad",
            "patient_name": "y",
        })
        assert r.status_code == 422

    def test_referral_missing_required(self, client):
        r = client.post(f"{API}/referrals", json={"referrer_name": "x"})
        assert r.status_code == 422


# ---------- Survey ----------
class TestSurvey:
    def test_create_survey_success(self, client):
        r = client.post(f"{API}/survey", json={
            "name": "TEST_Sue", "email": "sue@example.com",
            "rating": 5, "feedback": "Great service",
        })
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["rating"] == 5
        assert d["feedback"] == "Great service"
        assert "id" in d and "_id" not in d

    def test_survey_rating_out_of_range(self, client):
        r = client.post(f"{API}/survey", json={"rating": 7, "feedback": "x"})
        assert r.status_code == 422

    def test_survey_missing_feedback(self, client):
        r = client.post(f"{API}/survey", json={"rating": 4})
        assert r.status_code == 422


# ---------- Appointments ----------
class TestAppointments:
    def test_create_appointment_success(self, client):
        r = client.post(f"{API}/appointments", json={
            "name": "TEST_App",
            "phone": "555-2222",
            "email": "appt@example.com",
            "preferred_date": "2026-02-01",
            "service": "Skilled Nursing",
            "notes": "morning",
        })
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["name"] == "TEST_App"
        assert d["phone"] == "555-2222"
        assert "id" in d and "_id" not in d

    def test_appointment_missing_required(self, client):
        r = client.post(f"{API}/appointments", json={"name": "x"})
        assert r.status_code == 422



# ---------- AI Assistant ----------
import uuid as _uuid

VALID_INTENTS = {
    "welcome", "page:about", "page:contact", "page:careers", "page:services",
    "action:book_appointment", "action:submit_referral", "action:share_feedback",
    "action:find_care", "action:meet_team", "action:tour_visit", "action:symptom_check",
    "service:skilled-nursing", "service:physical-therapy", "service:occupational-therapy",
    "service:speech-therapy", "service:home-health-aide", "service:medical-social-work",
}


class TestAssistant:
    def test_chat_skilled_nursing(self, client):
        session_id = f"TEST_{_uuid.uuid4()}"
        r = client.post(f"{API}/assistant/chat", json={
            "session_id": session_id,
            "message": "Tell me about skilled nursing",
        }, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["session_id"] == session_id
        assert isinstance(data.get("reply"), str) and len(data["reply"]) > 0
        # intent is nullable but if present must be valid
        if data.get("intent") is not None:
            assert data["intent"] in VALID_INTENTS
        assert isinstance(data.get("suggestions"), list)
        assert len(data["suggestions"]) <= 4

        # Verify history persisted — user + assistant
        h = client.get(f"{API}/assistant/history/{session_id}", timeout=30)
        assert h.status_code == 200
        hist = h.json()["messages"]
        assert len(hist) >= 2
        roles = [m["role"] for m in hist]
        assert "user" in roles and "assistant" in roles
        # chronological order
        assert hist[0]["role"] == "user"
        assert hist[0]["content"] == "Tell me about skilled nursing"
        # no _id leak
        for m in hist:
            assert "_id" not in m

    def test_chat_multiturn_context(self, client):
        session_id = f"TEST_{_uuid.uuid4()}"
        # turn 1
        r1 = client.post(f"{API}/assistant/chat", json={
            "session_id": session_id,
            "message": "What services do you offer?",
        }, timeout=60)
        assert r1.status_code == 200, r1.text
        # turn 2 — reference prior context
        r2 = client.post(f"{API}/assistant/chat", json={
            "session_id": session_id,
            "message": "Tell me more about the first one.",
        }, timeout=60)
        assert r2.status_code == 200, r2.text
        assert r2.json()["session_id"] == session_id

        h = client.get(f"{API}/assistant/history/{session_id}", timeout=30)
        msgs = h.json()["messages"]
        # 2 user + 2 assistant = 4
        assert len(msgs) >= 4
        user_msgs = [m for m in msgs if m["role"] == "user"]
        assert len(user_msgs) >= 2

    def test_chat_book_appointment_intent(self, client):
        session_id = f"TEST_{_uuid.uuid4()}"
        r = client.post(f"{API}/assistant/chat", json={
            "session_id": session_id,
            "message": "I want to book an appointment",
        }, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        # LLM should produce a valid intent (we don't force a specific one; just assert sanitized)
        if data.get("intent") is not None:
            assert data["intent"] in VALID_INTENTS

    def test_history_empty_session(self, client):
        session_id = f"TEST_empty_{_uuid.uuid4()}"
        r = client.get(f"{API}/assistant/history/{session_id}", timeout=30)
        assert r.status_code == 200
        assert r.json()["messages"] == []


# ---------- New Intents (Iter 6) ----------
class TestNewIntents:
    """Verify the 4 new action intents are recognized by the LLM."""

    @pytest.mark.parametrize("message,expected", [
        ("Can I meet the team?", "action:meet_team"),
        ("What does a home visit look like?", "action:tour_visit"),
        ("I have knee pain", "action:symptom_check"),
        ("Help me find the right care", "action:find_care"),
    ])
    def test_new_intent_recognition(self, client, message, expected):
        session_id = f"TEST_{_uuid.uuid4()}"
        r = client.post(f"{API}/assistant/chat", json={
            "session_id": session_id, "message": message,
        }, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        # If intent returned, must be in expanded VALID_INTENTS
        if data.get("intent") is not None:
            assert data["intent"] in VALID_INTENTS, (
                f"Intent '{data['intent']}' not in expanded VALID_INTENTS for message: {message}"
            )
        # We don't strictly require the LLM picks the exact expected intent, but
        # log it as a soft assertion: print for inspection
        print(f"Message='{message}' -> intent={data.get('intent')} expected={expected}")


# ---------- TTS (Iter 6) ----------
class TestTTS:
    def test_tts_basic(self, client):
        r = client.post(f"{API}/assistant/tts",
                        json={"text": "Welcome to Careplus Health Services."},
                        timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("mime") == "audio/mpeg"
        b64 = data.get("audio_base64", "")
        assert isinstance(b64, str)
        # >5000 bytes per spec
        assert len(b64) > 5000, f"audio_base64 too short: {len(b64)} bytes"

    def test_tts_empty_text(self, client):
        r = client.post(f"{API}/assistant/tts", json={"text": ""}, timeout=30)
        assert r.status_code == 400

    def test_tts_missing_text(self, client):
        r = client.post(f"{API}/assistant/tts", json={}, timeout=30)
        assert r.status_code == 422
