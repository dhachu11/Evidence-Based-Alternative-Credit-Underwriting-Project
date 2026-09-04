from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime
from app.database.database import get_db_connection, log_audit
from app.schemas.schemas import ConsentUpdateRequest
from app.api.auth import get_current_user

router = APIRouter(prefix="/consent", tags=["Consent & Permissions"])

@router.get("/{customer_id}")
def get_consent(customer_id: str, current_user: dict = Depends(get_current_user)):
    # Verify customer identity if role is customer
    if current_user.get("role") == "customer":
        user_cid = current_user.get("customer_id")
        if user_cid and user_cid != customer_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to view consent of other customers.")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM consents WHERE customer_id = ?", (customer_id,))
    consent = cursor.fetchone()
    conn.close()
    if not consent:
        raise HTTPException(status_code=404, detail=f"Consent record not found for customer {customer_id}")
    return dict(consent)

@router.post("")
def update_consent(req: ConsentUpdateRequest, current_user: dict = Depends(get_current_user)):
    # Verify customer identity if role is customer
    if current_user.get("role") == "customer":
        user_cid = current_user.get("customer_id")
        if user_cid and user_cid != req.customer_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to modify consent of other customers.")

    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM consents WHERE customer_id = ?", (req.customer_id,))
    existing = cursor.fetchone()
    now_str = datetime.now().isoformat()
    
    if existing:
        cursor.execute("""
        UPDATE consents SET
            upi_allowed = ?,
            utility_allowed = ?,
            gst_allowed = ?,
            data_period_days = ?,
            purpose = ?,
            consent_status = ?,
            updated_at = ?
        WHERE customer_id = ?
        """, (
            1 if req.upi_allowed else 0,
            1 if req.utility_allowed else 0,
            1 if req.gst_allowed else 0,
            req.data_period_days,
            req.purpose,
            req.consent_status,
            now_str,
            req.customer_id
        ))
    else:
        cursor.execute("""
        INSERT INTO consents (customer_id, upi_allowed, utility_allowed, gst_allowed, data_period_days, purpose, consent_status, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            req.customer_id,
            1 if req.upi_allowed else 0,
            1 if req.utility_allowed else 0,
            1 if req.gst_allowed else 0,
            req.data_period_days,
            req.purpose,
            req.consent_status,
            now_str
        ))
        
    conn.commit()
    conn.close()
    
    action_type = "CONSENT_GRANTED" if req.consent_status == "ACTIVE" else "CONSENT_REVOKED"
    log_audit(req.customer_id, current_user.get("role", "customer"), action_type, f"Updated consent permissions (UPI:{req.upi_allowed}, Utility:{req.utility_allowed}, GST:{req.gst_allowed}, Status:{req.consent_status})")
    
    return {
        "message": f"Consent successfully {'updated' if req.consent_status=='ACTIVE' else 'revoked'}.",
        "customer_id": req.customer_id,
        "status": req.consent_status
    }

@router.post("/revoke/{customer_id}")
def revoke_consent(customer_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") == "customer":
        user_cid = current_user.get("customer_id")
        if user_cid and user_cid != customer_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to revoke consent of other customers.")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE consents SET consent_status = 'REVOKED', upi_allowed = 0, utility_allowed = 0, gst_allowed = 0, updated_at = ? WHERE customer_id = ?",
                   (datetime.now().isoformat(), customer_id))
    conn.commit()
    conn.close()
    log_audit(customer_id, current_user.get("role", "customer"), "CONSENT_REVOKED", "Borrower revoked all alternative financial data permissions.")
    return {"message": "All data permissions successfully revoked.", "customer_id": customer_id, "status": "REVOKED"}
