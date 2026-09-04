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

def get_officer_token():
    res = client.post("/api/auth/login", json={"email": "officer@tvscredit.demo", "password": "demo123"})
    return res.json()["token"]

def test_hero_persona_ravi_kumar():
    """
    Ravi Kumar (CUST-101):
    Gig worker, 95d daily payouts, regular utilities, mild bonus variation.
    Expected: SUFFICIENT_WITH_WARNING / SUFFICIENT, ML Enabled, Calibrated Probability >= 0.65 (Low-Medium), PROCEED TO FURTHER UNDERWRITING.
    """
    token = get_officer_token()
    res = client.post("/api/assessment/CUST-101", json={"preferred_model": "xgboost"}, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert "SUFFICIENT" in data["evidence_status"]
    assert data["can_score_ml"] is True
    assert data["risk_probability"] is not None
    assert data["risk_probability"] >= 0.50
    assert data["recommendation"] == "PROCEED TO FURTHER UNDERWRITING"
    assert data["explanation"] is not None
    assert len(data["explanation"]["positive_narratives"]) >= 1

def test_insufficient_persona_suresh_nair():
    """
    Suresh Nair (CUST-105):
    Auto driver with only 15 days data (< 30 days minimum).
    Expected: INSUFFICIENT, ML Disabled, Risk Probability is None, Action: REQUEST ADDITIONAL INFORMATION.
    """
    token = get_officer_token()
    res = client.post("/api/assessment/CUST-105", json={"preferred_model": "xgboost"}, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["evidence_status"] == "INSUFFICIENT"
    assert data["can_score_ml"] is False
    assert data["risk_probability"] is None
    assert data["recommendation"] == "REQUEST ADDITIONAL INFORMATION"
    assert "Insufficient" in data["action_summary"]

def test_limited_persona_priya_sharma():
    """
    Priya Sharma (CUST-102):
    First-time salaried borrower with 45 days data and missing utility record.
    Expected: LIMITED, ML Disabled, Risk Probability is None, Action: REQUEST ADDITIONAL INFORMATION.
    """
    token = get_officer_token()
    res = client.post("/api/assessment/CUST-102", json={"preferred_model": "xgboost"}, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["evidence_status"] == "LIMITED"
    assert data["can_score_ml"] is False
    assert data["risk_probability"] is None
    assert data["recommendation"] == "REQUEST ADDITIONAL INFORMATION"

def test_inconsistent_persona_vikram_patel():
    """
    Vikram Patel (CUST-104):
    Contractor with 5x lump-sum surge + 2 defaulted electricity bills.
    Expected: INCONSISTENT, ML Disabled, Action: MANUAL VERIFICATION REQUIRED.
    """
    token = get_officer_token()
    res = client.post("/api/assessment/CUST-104", json={"preferred_model": "xgboost"}, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["evidence_status"] == "INCONSISTENT"
    assert data["can_score_ml"] is False
    assert data["risk_probability"] is None
    assert data["recommendation"] == "MANUAL VERIFICATION REQUIRED"

def test_merchant_persona_arjun_traders():
    """
    Arjun Traders (CUST-103):
    Merchant with 95d GST-3B filings + UPI QR settlements.
    Expected: SUFFICIENT / SUFFICIENT_WITH_WARNING, ML Enabled, Prob > 0.70, PROCEED TO FURTHER UNDERWRITING.
    """
    token = get_officer_token()
    res = client.post("/api/assessment/CUST-103", json={"preferred_model": "xgboost"}, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert "SUFFICIENT" in data["evidence_status"]
    assert data["can_score_ml"] is True
    assert data["risk_probability"] is not None
    assert data["recommendation"] == "PROCEED TO FURTHER UNDERWRITING"
