from fastapi import APIRouter, HTTPException, Depends, status
from app.database.database import get_db_connection
from app.api.auth import get_current_user
import json

router = APIRouter(prefix="/customers", tags=["Customers"])

def mask_phone(phone: str) -> str:
    if len(phone) >= 10:
        return phone[:7] + "•••••"
    return "••••••••••"

@router.get("")
def list_customers(current_user: dict = Depends(get_current_user)):
    # If customer role, only return their own customer record
    is_cust = current_user.get("role") == "customer"
    user_cid = current_user.get("customer_id")

    conn = get_db_connection()
    cursor = conn.cursor()
    
    if is_cust and user_cid:
        cursor.execute("""
        SELECT c.*, 
               co.consent_status, co.upi_allowed, co.utility_allowed, co.gst_allowed,
               a.evidence_status, a.risk_probability, a.risk_band, a.recommendation, a.created_at as last_assessed_at
        FROM customers c
        LEFT JOIN consents co ON c.id = co.customer_id
        LEFT JOIN (
            SELECT customer_id, evidence_status, risk_probability, risk_band, recommendation, created_at,
                   ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY id DESC) as rn
            FROM assessments
        ) a ON c.id = a.customer_id AND a.rn = 1
        WHERE c.id = ?
        """, (user_cid,))
    else:
        cursor.execute("""
        SELECT c.*, 
               co.consent_status, co.upi_allowed, co.utility_allowed, co.gst_allowed,
               a.evidence_status, a.risk_probability, a.risk_band, a.recommendation, a.created_at as last_assessed_at
        FROM customers c
        LEFT JOIN consents co ON c.id = co.customer_id
        LEFT JOIN (
            SELECT customer_id, evidence_status, risk_probability, risk_band, recommendation, created_at,
                   ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY id DESC) as rn
            FROM assessments
        ) a ON c.id = a.customer_id AND a.rn = 1
        ORDER BY c.id ASC
        """)
    
    rows = cursor.fetchall()
    customers = []
    for r in rows:
        customers.append({
            "id": r["id"],
            "name": r["name"],
            "customer_type": r["customer_type"],
            "phone_masked": mask_phone(r["phone"]),
            "phone_raw": r["phone"] if not is_cust else mask_phone(r["phone"]),
            "location": r["location"],
            "bureau_status": r["bureau_status"],
            "headline": r["headline"],
            "consent_status": r["consent_status"] or "NO_CONSENT",
            "permissions": {
                "upi": bool(r["upi_allowed"]),
                "utility": bool(r["utility_allowed"]),
                "gst": bool(r["gst_allowed"])
            },
            "latest_assessment": {
                "evidence_status": r["evidence_status"],
                "risk_probability": r["risk_probability"],
                "risk_band": r["risk_band"],
                "recommendation": r["recommendation"],
                "assessed_at": r["last_assessed_at"]
            } if r["evidence_status"] else None
        })
    
    conn.close()
    return {"customers": customers, "total": len(customers)}

@router.get("/{customer_id}")
def get_customer_details(customer_id: str, current_user: dict = Depends(get_current_user)):
    # Authorization: Customer role can ONLY access their own customer_id
    if current_user.get("role") == "customer":
        user_cid = current_user.get("customer_id")
        if user_cid and user_cid != customer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Customer cannot view records belonging to another borrower ({customer_id})."
            )

    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM customers WHERE id = ?", (customer_id,))
    cust = cursor.fetchone()
    if not cust:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Customer {customer_id} not found")
        
    cursor.execute("SELECT * FROM consents WHERE customer_id = ?", (customer_id,))
    consent = cursor.fetchone()
    
    # Check if consent is active for data fetching
    is_upi_active = bool(consent["upi_allowed"]) if consent and consent["consent_status"] == "ACTIVE" else False
    is_util_active = bool(consent["utility_allowed"]) if consent and consent["consent_status"] == "ACTIVE" else False
    is_gst_active = bool(consent["gst_allowed"]) if consent and consent["consent_status"] == "ACTIVE" else False

    if is_upi_active:
        cursor.execute("SELECT * FROM upi_transactions WHERE customer_id = ? ORDER BY date DESC LIMIT 50", (customer_id,))
        upi_txns = [dict(r) for r in cursor.fetchall()]
    else:
        upi_txns = []
    
    if is_util_active:
        cursor.execute("SELECT * FROM utility_payments WHERE customer_id = ? ORDER BY due_date DESC", (customer_id,))
        utility_bills = [dict(r) for r in cursor.fetchall()]
    else:
        utility_bills = []
    
    if is_gst_active:
        cursor.execute("SELECT * FROM gst_records WHERE customer_id = ? ORDER BY filing_month DESC", (customer_id,))
        gst_filings = [dict(r) for r in cursor.fetchall()]
    else:
        gst_filings = []
    
    cursor.execute("SELECT * FROM assessments WHERE customer_id = ? ORDER BY id DESC LIMIT 5", (customer_id,))
    assessments_raw = cursor.fetchall()
    assessments = []
    for a in assessments_raw:
        item = dict(a)
        if item.get("explanation_json"):
            try:
                item["explanation"] = json.loads(item["explanation_json"])
            except:
                item["explanation"] = None
        if item.get("metrics_json"):
            try:
                item["metrics"] = json.loads(item["metrics_json"])
            except:
                item["metrics"] = None
        if item.get("anomaly_flags_json"):
            try:
                item["anomaly_flags"] = json.loads(item["anomaly_flags_json"])
            except:
                item["anomaly_flags"] = []
        if item.get("checklist_json"):
            try:
                item["checklist"] = json.loads(item["checklist_json"])
            except:
                item["checklist"] = None
        assessments.append(item)
        
    conn.close()
    
    return {
        "customer": {
            "id": cust["id"],
            "name": cust["name"],
            "customer_type": cust["customer_type"],
            "phone_masked": mask_phone(cust["phone"]),
            "phone_raw": cust["phone"],
            "location": cust["location"],
            "bureau_status": cust["bureau_status"],
            "headline": cust["headline"],
            "created_at": cust["created_at"]
        },
        "consent": dict(consent) if consent else None,
        "upi_transactions": upi_txns,
        "utility_payments": utility_bills,
        "gst_records": gst_filings,
        "assessments": assessments,
        "latest_assessment": assessments[0] if assessments else None
    }
