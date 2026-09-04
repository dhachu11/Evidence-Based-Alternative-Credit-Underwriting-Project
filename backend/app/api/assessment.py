from fastapi import APIRouter, HTTPException, Depends, status
from app.database.database import get_db_connection, log_audit
from app.services.evidence_validation import validate_evidence
from app.services.risk_engine import run_customer_assessment
from app.schemas.schemas import AssessmentTriggerRequest, UnderwritingDecisionRequest
from app.api.auth import get_current_user, require_role

router = APIRouter(tags=["Assessment & Evidence Validation"])

@router.get("/evidence/{customer_id}")
def get_evidence_validation(customer_id: str, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    res = validate_evidence(customer_id, conn)
    conn.close()
    return res

@router.post("/assessment/{customer_id}")
def trigger_assessment(
    customer_id: str, 
    req: AssessmentTriggerRequest = None,
    current_user: dict = Depends(require_role(["loan_officer", "admin"]))
):
    preferred_model = req.preferred_model if req and req.preferred_model else "xgboost"
    conn = get_db_connection()
    try:
        assessment = run_customer_assessment(customer_id, conn, preferred_model=preferred_model)
        log_audit(
            current_user["id"], 
            current_user["role"], 
            "RUN_ASSESSMENT", 
            f"Underwriter {current_user['name']} ran decision assessment for customer {customer_id}. Result: {assessment['evidence_status']} -> {assessment['recommendation']}"
        )
        return assessment
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assessment execution error: {str(e)}")
    finally:
        conn.close()

@router.get("/assessment/{customer_id}")
def get_latest_assessment(customer_id: str, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM assessments WHERE customer_id = ? ORDER BY id DESC LIMIT 1", (customer_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="No assessment found for this customer. Please run assessment.")
    return dict(row)

@router.post("/assessment/{assessment_id}/decision")
def record_underwriting_decision(
    assessment_id: int, 
    req: UnderwritingDecisionRequest,
    current_user: dict = Depends(require_role(["loan_officer", "admin"]))
):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM assessments WHERE id = ?", (assessment_id,))
    assessment = cursor.fetchone()
    if not assessment:
        conn.close()
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    cursor.execute("""
    UPDATE assessments SET
        underwriter_decision = ?,
        underwriter_notes = ?
    WHERE id = ?
    """, (req.decision, req.notes, assessment_id))
    
    conn.commit()
    conn.close()
    
    log_audit(
        current_user["id"], 
        current_user["role"], 
        "UNDERWRITING_DECISION_RECORDED", 
        f"Officer {current_user['name']} recorded decision: '{req.decision}' for assessment #{assessment_id} (Customer {assessment['customer_id']})"
    )
    
    return {
        "message": "Human underwriter decision successfully logged to audit records.",
        "assessment_id": assessment_id,
        "decision": req.decision,
        "notes": req.notes,
        "officer": current_user["name"]
    }
