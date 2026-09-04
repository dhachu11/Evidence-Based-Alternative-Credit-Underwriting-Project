from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user: Dict[str, Any]

class ConsentUpdateRequest(BaseModel):
    customer_id: str
    upi_allowed: bool
    utility_allowed: bool
    gst_allowed: bool
    data_period_days: int = 90
    purpose: str = "Credit assessment"
    consent_status: str = "ACTIVE"

class AssessmentTriggerRequest(BaseModel):
    preferred_model: Optional[str] = "xgboost"

class UnderwritingDecisionRequest(BaseModel):
    decision: str # "PROCEED_STAGE_2", "REQUEST_MORE_DOCS", "ESCALATE_FIELD_VISIT", "REJECT"
    notes: str
    officer_id: str

class ThresholdUpdateRequest(BaseModel):
    min_sufficient_days: float
    min_limited_days: float
    min_completeness_rate: float
    anomaly_zscore_threshold: float
    low_risk_repayment_prob: float

class RetailerInsightUpdateRequest(BaseModel):
    title: str
    current_workflow: str
    manual_verification_steps: str
    documents_requested: str
    typical_delay_hours: float
    information_gap: str
    observed_bottleneck: str
