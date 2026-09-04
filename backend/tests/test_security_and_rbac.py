import pytest
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app
from app.database.database import init_db
from app.services.data_ingestion import seed_demo_data

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    init_db()
    seed_demo_data()

def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert data["database"]["status"] == "ONLINE"
    assert data["ml_subsystem"]["status"] == "LOADED"

def test_invalid_login():
    res = client.post("/api/auth/login", json={"email": "officer@tvscredit.demo", "password": "wrongpassword"})
    assert res.status_code == 401
    assert "Invalid credentials" in res.json()["detail"]

def test_missing_token_access():
    res = client.get("/api/customers")
    assert res.status_code == 401
    assert "Authentication token missing" in res.json()["detail"]

def test_tampered_token_access():
    res = client.get("/api/customers", headers={"Authorization": "Bearer tvs.fakePayload.fakeSignature"})
    assert res.status_code == 401

def test_customer_isolation():
    # Login as Customer Priya (CUST-102)
    priya_login = client.post("/api/auth/login", json={"email": "priya@customer.demo", "password": "demo123"})
    assert priya_login.status_code == 200
    token = priya_login.json()["token"]

    # Priya accesses her own details -> 200 OK
    res_self = client.get("/api/customers/CUST-102", headers={"Authorization": f"Bearer {token}"})
    assert res_self.status_code == 200
    assert res_self.json()["customer"]["id"] == "CUST-102"

    # Priya attempts to access Ravi Kumar (CUST-101) -> 403 Forbidden
    res_other = client.get("/api/customers/CUST-101", headers={"Authorization": f"Bearer {token}"})
    assert res_other.status_code == 403
    assert "Access denied" in res_other.json()["detail"]

def test_officer_cannot_update_admin_thresholds():
    # Login as Loan Officer
    off_login = client.post("/api/auth/login", json={"email": "officer@tvscredit.demo", "password": "demo123"})
    assert off_login.status_code == 200
    token = off_login.json()["token"]

    # Attempt to post to admin thresholds
    res = client.post("/api/admin/thresholds", json={
        "min_sufficient_days": 90,
        "min_limited_days": 30,
        "min_completeness_rate": 0.8,
        "anomaly_zscore_threshold": 2.5,
        "low_risk_repayment_prob": 0.75
    }, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 403
    assert "Access denied. Required role: admin" in res.json()["detail"]

def test_admin_can_update_thresholds_and_audit():
    # Login as Admin
    admin_login = client.post("/api/auth/login", json={"email": "admin@tvscredit.demo", "password": "admin123"})
    assert admin_login.status_code == 200
    token = admin_login.json()["token"]

    res = client.post("/api/admin/thresholds", json={
        "min_sufficient_days": 90,
        "min_limited_days": 30,
        "min_completeness_rate": 0.8,
        "anomaly_zscore_threshold": 2.5,
        "low_risk_repayment_prob": 0.75
    }, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200

    # Verify audit log was created
    audit_res = client.get("/api/admin/audit-logs?limit=5", headers={"Authorization": f"Bearer {token}"})
    assert audit_res.status_code == 200
    logs = audit_res.json()["audit_logs"]
    actions = [l["action"] for l in logs]
    assert "THRESHOLD_CONFIG_CHANGED" in actions

def test_consent_revocation_blocks_data():
    # Login as Customer Ravi
    ravi_login = client.post("/api/auth/login", json={"email": "ravi@customer.demo", "password": "demo123"})
    assert ravi_login.status_code == 200
    token = ravi_login.json()["token"]

    # Revoke consent
    rev_res = client.post("/api/consent/revoke/CUST-101", headers={"Authorization": f"Bearer {token}"})
    assert rev_res.status_code == 200
    assert rev_res.json()["status"] == "REVOKED"

    # Verify evidence validation now returns INSUFFICIENT with ML blocked
    off_login = client.post("/api/auth/login", json={"email": "officer@tvscredit.demo", "password": "demo123"})
    off_token = off_login.json()["token"]
    
    ev_res = client.get("/api/evidence/CUST-101", headers={"Authorization": f"Bearer {off_token}"})
    assert ev_res.status_code == 200
    assert ev_res.json()["status"] == "INSUFFICIENT"
    assert ev_res.json()["can_run_ml"] is False
    assert "CONSENT_MISSING_OR_REVOKED" in ev_res.json()["flags"]

    # Restore active consent for subsequent tests
    client.post("/api/consent", json={
        "customer_id": "CUST-101",
        "upi_allowed": True,
        "utility_allowed": True,
        "gst_allowed": False,
        "data_period_days": 90,
        "purpose": "Credit assessment",
        "consent_status": "ACTIVE"
    }, headers={"Authorization": f"Bearer {token}"})
