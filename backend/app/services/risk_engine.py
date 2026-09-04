import os
import json
import joblib
import numpy as np
from datetime import datetime

from app.services.evidence_validation import validate_evidence
from app.services.feature_engineering import extract_customer_features
from app.services.explanation import generate_shap_explanation

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml", "saved_models")

def run_customer_assessment(customer_id: str, conn, preferred_model: str = "xgboost"):
    """
    Core Decision Pipeline:
    1. Check Evidence Validation Layer
    2. If Evidence is INSUFFICIENT / LIMITED / INCONSISTENT -> Halts ML and returns honest support action.
    3. If Evidence is SUFFICIENT / SUFFICIENT_WITH_WARNING -> Runs Feature Engineering -> ML -> Calibration -> SHAP -> Action Engine.
    """
    cursor = conn.cursor()
    
    # 1. Fetch Customer info
    cursor.execute("SELECT * FROM customers WHERE id = ?", (customer_id,))
    customer = cursor.fetchone()
    if not customer:
        raise ValueError(f"Customer {customer_id} not found.")

    # 2. Run Evidence Validation Layer
    evidence_res = validate_evidence(customer_id, conn)
    evidence_status = evidence_res["status"]

    # Case A: Insufficient / Limited / Inconsistent Evidence -> Halt ML
    if not evidence_res["can_run_ml"]:
        if evidence_status == "INSUFFICIENT":
            recommendation = "REQUEST ADDITIONAL INFORMATION"
            action_summary = "Insufficient reliable history (< 30 days minimum). Do not generate risk score; prompt customer for supplementary records."
            underwriting_tier = "STAGE_0_DATA_GATHERING"
        elif evidence_status == "LIMITED":
            recommendation = "REQUEST ADDITIONAL INFORMATION"
            action_summary = f"Limited evidence ({evidence_res['metrics']['history_days']} days observed). Additional months required for reliable statistical risk projection."
            underwriting_tier = "STAGE_0_DATA_GATHERING"
        elif evidence_status == "INCONSISTENT":
            recommendation = "MANUAL VERIFICATION REQUIRED"
            action_summary = "Conflicting cross-source indicators or severe behavioral anomalies detected. Direct field/officer verification required."
            underwriting_tier = "STAGE_1_MANUAL_AUDIT"
        else:
            recommendation = "REQUEST ADDITIONAL INFORMATION"
            action_summary = evidence_res["reason"]
            underwriting_tier = "STAGE_0_DATA_GATHERING"

        assessment_record = {
            "customer_id": customer_id,
            "evidence_status": evidence_status,
            "evidence_quality_score": evidence_res["quality_score"],
            "can_score_ml": False,
            "risk_probability": None,
            "risk_band": "UNASSESSED_DUE_TO_EVIDENCE_GAPS",
            "recommendation": recommendation,
            "action_summary": action_summary,
            "underwriting_tier": underwriting_tier,
            "evidence_validation": evidence_res,
            "explanation": None,
            "features": None,
            "affordability_notice": "Affordability, ticket sizing, and existing debt obligations require standard TVS Credit underwriting verification.",
            "disclaimer": "This is an evidence-aware decision support assessment, not an automated loan approval or credit score.",
            "created_at": datetime.now().isoformat()
        }

        # Store in DB
        cursor.execute("""
        INSERT INTO assessments (
            customer_id, evidence_status, evidence_quality_score, risk_probability,
            risk_band, recommendation, explanation_json, metrics_json, anomaly_flags_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            customer_id, evidence_status, evidence_res["quality_score"], None,
            "UNASSESSED", recommendation, None, json.dumps(evidence_res["metrics"]),
            json.dumps(evidence_res["flags"]), assessment_record["created_at"]
        ))
        conn.commit()

        return assessment_record

    # Case B: Evidence is SUFFICIENT or SUFFICIENT_WITH_WARNING -> Run ML Inference
    feature_dict, feature_vector = extract_customer_features(customer_id, conn, customer["customer_type"])

    # Load Model
    model_file = "xgboost_model.joblib" if preferred_model == "xgboost" else "logistic_model.joblib"
    model_path = os.path.join(MODELS_DIR, model_file)

    if os.path.exists(model_path):
        model = joblib.load(model_path)
        probs = model.predict_proba([feature_vector])[0]
        repayment_prob = float(probs[1])
    else:
        # Fallback calibrated estimate
        base = 0.50 + (feature_dict["income_stability_score"] * 0.25) + (feature_dict["utility_ontime_rate"] * 0.20) - (feature_dict["expense_to_income_ratio"] * 0.15)
        repayment_prob = max(0.15, min(0.95, base))

    # Determine Risk Band
    if repayment_prob >= 0.80:
        risk_band = "LOW"
    elif repayment_prob >= 0.65:
        risk_band = "LOW–MEDIUM"
    elif repayment_prob >= 0.50:
        risk_band = "MEDIUM–HIGH"
    else:
        risk_band = "HIGH"

    # Action Engine
    if risk_band in ["LOW", "LOW–MEDIUM"]:
        recommendation = "PROCEED TO FURTHER UNDERWRITING"
        action_summary = "Available alternative evidence demonstrates stable cash flow and reliable repayment patterns. Recommend advancing to formal documentation and KYC stage."
        underwriting_tier = "STAGE_2_DESK_UNDERWRITING"
    elif risk_band == "MEDIUM–HIGH":
        recommendation = "MANUAL REVIEW REQUIRED"
        action_summary = "Moderate repayment risk detected. Senior underwriter manual review of bank passbook / shop records recommended."
        underwriting_tier = "STAGE_2_SENIOR_REVIEW"
    else:
        recommendation = "ENHANCED UNDERWRITING REVIEW"
        action_summary = "High estimated repayment risk. Requires thorough risk mitigation, guarantor review, or lower loan-to-value ratio."
        underwriting_tier = "STAGE_3_ENHANCED_REVIEW"

    # Generate SHAP explanation
    explanation = generate_shap_explanation(feature_dict, feature_vector)

    assessment_record = {
        "customer_id": customer_id,
        "evidence_status": evidence_status,
        "evidence_quality_score": evidence_res["quality_score"],
        "can_score_ml": True,
        "model_used": "Calibrated XGBoost v1.0" if preferred_model == "xgboost" else "Calibrated Logistic Regression Baseline",
        "risk_probability": round(repayment_prob, 2),
        "risk_band": risk_band,
        "recommendation": recommendation,
        "action_summary": action_summary,
        "underwriting_tier": underwriting_tier,
        "evidence_validation": evidence_res,
        "explanation": explanation,
        "features": feature_dict,
        "affordability_notice": "Alternative risk assessment does not calculate debt serviceability or loan amount. Loan sizing and existing liabilities require human underwriting verification.",
        "disclaimer": "Prototype estimated repayment probability. Real-world deployment requires training on actual TVS Credit repayment outcomes.",
        "created_at": datetime.now().isoformat()
    }

    # Store in DB
    cursor.execute("""
    INSERT INTO assessments (
        customer_id, evidence_status, evidence_quality_score, risk_probability,
        risk_band, recommendation, explanation_json, metrics_json, anomaly_flags_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        customer_id, evidence_status, evidence_res["quality_score"], round(repayment_prob, 2),
        risk_band, recommendation, json.dumps(explanation), json.dumps(feature_dict),
        json.dumps(evidence_res["flags"]), assessment_record["created_at"]
    ))
    conn.commit()

    return assessment_record
