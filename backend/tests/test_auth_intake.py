"""Iter 7: Auth (Emergent Google Auth) + AI Intake flow backend tests."""
import os
import time
import uuid as _uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path

import pytest
import requests
from dotenv import load_dotenv
from pymongo import MongoClient

# Load envs
load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")
load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def mongo():
    c = MongoClient(MONGO_URL)
    db = c[DB_NAME]
    yield db
    # cleanup any TEST_ seeded docs
    db.users.delete_many({"email": {"$regex": r"^TEST_"}})
    db.user_sessions.delete_many({"session_token": {"$regex": r"^TEST_"}})
    db.intakes.delete_many({"session_id": {"$regex": r"^TEST_"}})
    db.appointments.delete_many({"name": {"$regex": r"^TEST_"}})
    c.close()


@pytest.fixture
def seeded_user(mongo):
    """Create a valid user + session doc and return the session_token + user_id."""
    uid = f"TEST_user_{_uuid.uuid4().hex[:10]}"
    token = f"TEST_session_{_uuid.uuid4().hex}"
    email = f"TEST_{uid}@example.com"
    mongo.users.insert_one({
        "user_id": uid,
        "email": email,
        "name": "TEST User",
        "picture": "https://example.com/a.png",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    mongo.user_sessions.insert_one({
        "user_id": uid,
        "session_token": token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    yield {"user_id": uid, "session_token": token, "email": email}
    # Cleanup
    mongo.users.delete_one({"user_id": uid})
    mongo.user_sessions.delete_one({"session_token": token})


# ---------- AUTH ----------
class TestAuthSession:
    def test_missing_session_id_returns_400(self, client):
        r = client.post(f"{API}/auth/session", json={"session_id": ""})
        assert r.status_code == 400

    def test_missing_field_returns_422(self, client):
        r = client.post(f"{API}/auth/session", json={})
        assert r.status_code == 422

    def test_invalid_session_id_returns_401(self, client):
        # This will call Emergent OAuth provider — expect 401 for bogus id
        r = client.post(f"{API}/auth/session",
                        json={"session_id": "definitely-invalid-fake-id-xyz"},
                        timeout=30)
        # Could be 401 (provider rejected) or 502 (provider unreachable) — accept both
        assert r.status_code in (401, 502), r.text


class TestAuthMe:
    def test_me_no_auth_returns_401(self, client):
        # New session to avoid cookie pollution
        s = requests.Session()
        r = s.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_with_valid_bearer_token(self, seeded_user):
        s = requests.Session()
        r = s.get(f"{API}/auth/me",
                  headers={"Authorization": f"Bearer {seeded_user['session_token']}"})
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["user_id"] == seeded_user["user_id"]
        assert body["email"] == seeded_user["email"]
        assert body["name"] == "TEST User"

    def test_me_with_valid_cookie(self, seeded_user):
        s = requests.Session()
        s.cookies.set("session_token", seeded_user["session_token"])
        r = s.get(f"{API}/auth/me")
        assert r.status_code == 200, r.text
        assert r.json()["user_id"] == seeded_user["user_id"]

    def test_me_with_invalid_token(self):
        s = requests.Session()
        r = s.get(f"{API}/auth/me",
                  headers={"Authorization": "Bearer not-a-real-token"})
        assert r.status_code == 401


class TestAuthLogout:
    def test_logout_deletes_session(self, seeded_user, mongo):
        s = requests.Session()
        s.cookies.set("session_token", seeded_user["session_token"])
        r = s.post(f"{API}/auth/logout")
        assert r.status_code == 200
        assert r.json().get("ok") is True
        # Session doc gone
        found = mongo.user_sessions.find_one({"session_token": seeded_user["session_token"]})
        assert found is None

    def test_logout_no_cookie_ok(self, client):
        r = client.post(f"{API}/auth/logout")
        assert r.status_code == 200


# ---------- INTAKE ----------
class TestIntakeCrud:
    def test_get_unknown_session_returns_empty(self, client):
        sid = f"TEST_{_uuid.uuid4()}"
        r = client.get(f"{API}/intake/{sid}")
        assert r.status_code == 200
        data = r.json()
        assert data["session_id"] == sid
        assert data["fields"] == {}

    def test_patch_persists_and_returns_merged(self, client, mongo):
        sid = f"TEST_{_uuid.uuid4()}"
        r = client.patch(f"{API}/intake/{sid}",
                         json={"fields": {"name": "TEST_Jane", "phone": "555-1111"}})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["session_id"] == sid
        assert d["fields"]["name"] == "TEST_Jane"
        assert d["fields"]["phone"] == "555-1111"
        assert "_id" not in d

        # Second patch merges with existing
        r2 = client.patch(f"{API}/intake/{sid}",
                          json={"fields": {"email": "jane@example.com", "condition": "hip pain"}})
        assert r2.status_code == 200
        d2 = r2.json()
        assert d2["fields"]["name"] == "TEST_Jane"  # preserved
        assert d2["fields"]["email"] == "jane@example.com"
        assert d2["fields"]["condition"] == "hip pain"

        # GET returns the same
        g = client.get(f"{API}/intake/{sid}")
        assert g.status_code == 200
        assert g.json()["fields"]["name"] == "TEST_Jane"

    def test_patch_ignores_unknown_fields(self, client):
        sid = f"TEST_{_uuid.uuid4()}"
        r = client.patch(f"{API}/intake/{sid}",
                         json={"fields": {"hacker_field": "x"}})
        # Should just return an empty snapshot when nothing matches whitelist
        assert r.status_code == 200
        assert r.json().get("fields", {}) == {}


class TestIntakeSubmit:
    def test_submit_requires_name_and_phone(self, client):
        sid = f"TEST_{_uuid.uuid4()}"
        # No data at all
        r = client.post(f"{API}/intake/{sid}/submit")
        assert r.status_code == 400

        # Only name
        client.patch(f"{API}/intake/{sid}", json={"fields": {"name": "TEST_Only"}})
        r2 = client.post(f"{API}/intake/{sid}/submit")
        assert r2.status_code == 400

    def test_submit_guest_creates_appointment(self, client, mongo):
        sid = f"TEST_{_uuid.uuid4()}"
        client.patch(f"{API}/intake/{sid}", json={
            "fields": {
                "name": "TEST_GuestUser",
                "phone": "555-7777",
                "email": "guest@test.com",
                "condition": "recovery",
                "service": "physical-therapy",
                "urgency": "soon",
                "caregiver_relationship": "self",
            }
        })
        r = client.post(f"{API}/intake/{sid}/submit")
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["ok"] is True
        assert body["logged_in"] is False
        assert "appointment_id" in body

        appt = mongo.appointments.find_one({"id": body["appointment_id"]})
        assert appt is not None
        assert appt["name"] == "TEST_GuestUser"
        assert appt["phone"] == "555-7777"
        assert appt["user_id"] is None
        assert appt["source"] == "ai_intake"

    def test_submit_authenticated_sets_user_id(self, client, seeded_user, mongo):
        sid = f"TEST_{_uuid.uuid4()}"
        client.patch(f"{API}/intake/{sid}", json={
            "fields": {"name": "TEST_AuthUser", "phone": "555-8888",
                       "condition": "x", "service": "skilled-nursing"}
        })
        s = requests.Session()
        s.cookies.set("session_token", seeded_user["session_token"])
        r = s.post(f"{API}/intake/{sid}/submit")
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["ok"] is True
        assert body["logged_in"] is True

        appt = mongo.appointments.find_one({"id": body["appointment_id"]})
        assert appt is not None
        assert appt["user_id"] == seeded_user["user_id"]


# ---------- ASSISTANT extraction ----------
class TestAssistantExtraction:
    def test_extraction_persists_to_intake(self, client):
        sid = f"TEST_{_uuid.uuid4()}"
        r = client.post(f"{API}/assistant/chat", json={
            "session_id": sid,
            "message": "Hi my name is Jane Smith, my mom needs help after hip surgery",
        }, timeout=90)
        assert r.status_code == 200, r.text
        data = r.json()
        # extracted is a dict
        assert isinstance(data.get("extracted"), dict)
        extracted = data["extracted"]
        # name should be present
        assert "name" in extracted, f"expected name in extracted, got {extracted}"
        assert "jane" in str(extracted["name"]).lower()

        # intent should be action:start_intake (LLM may vary; accept if set)
        if data.get("intent"):
            # soft check — print for visibility
            print(f"intent={data['intent']} extracted={extracted}")

        # Give a moment for write to settle
        time.sleep(0.5)
        # GET intake reflects the extracted fields
        g = client.get(f"{API}/intake/{sid}")
        assert g.status_code == 200
        gf = g.json().get("fields", {})
        assert "name" in gf
        assert "jane" in str(gf["name"]).lower()
