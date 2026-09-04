import os
import joblib
import numpy as np
import shap

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml", "saved_models")

FEATURE_LABELS = {
    "avg_monthly_inflow": "Average Monthly Inflow",
    "income_stability_score": "Income Consistency & Regularity",
    "utility_ontime_rate": "Utility Bill Payment Discipline",
    "expense_to_income_ratio": "Cash Flow Outflow-to-Inflow Ratio",
    "active_days_ratio": "Transaction Frequency & Active Days",
    "inflow_trend_slope": "Income Growth Trend",
    "gst_compliance_rate": "GST Tax Filing Regularity",
    "merchant_revenue_stability": "Merchant Business Turnover Stability"
}

def generate_shap_explanation(feature_dict: dict, feature_vector: list):
    """
    Computes SHAP feature importance for the customer's feature vector
    and translates raw values into human-readable positive and risk factors.
    """
    try:
        model_path = os.path.join(MODELS_DIR, "xgb_standalone.joblib")
        if os.path.exists(model_path):
            xgb_model = joblib.load(model_path)
            explainer = shap.TreeExplainer(xgb_model)
            X = np.array([feature_vector])
            shap_values = explainer.shap_values(X)[0]
        else:
            # Fallback heuristic SHAP approximation
            shap_values = [
                (feature_dict["avg_monthly_inflow"] - 30000) / 50000 * 0.3,
                (feature_dict["income_stability_score"] - 0.5) * 0.8,
                (feature_dict["utility_ontime_rate"] - 0.7) * 0.9,
                -(feature_dict["expense_to_income_ratio"] - 0.8) * 0.6,
                (feature_dict["active_days_ratio"] - 0.6) * 0.4,
                feature_dict["inflow_trend_slope"] * 0.5,
                (feature_dict["gst_compliance_rate"] - 0.5) * 0.4 if feature_dict["gst_compliance_rate"] > 0 else 0,
                (feature_dict["merchant_revenue_stability"] - 0.5) * 0.4 if feature_dict["merchant_revenue_stability"] > 0 else 0
            ]
    except Exception as e:
        print(f"SHAP explanation fallback due to: {e}")
        shap_values = [0.1, 0.25, 0.3, -0.05, 0.1, 0.05, 0.0, 0.0]

    feature_names = list(FEATURE_LABELS.keys())
    contributions = []

    for name, val, shap_val in zip(feature_names, feature_vector, shap_values):
        contributions.append({
            "feature": name,
            "label": FEATURE_LABELS.get(name, name),
            "value": val,
            "shap_value": round(float(shap_val), 3),
            "impact": "positive" if shap_val > 0.02 else ("negative" if shap_val < -0.02 else "neutral")
        })

    # Sort positive and negative contributors
    positive_factors = [c for c in contributions if c["shap_value"] > 0]
    positive_factors.sort(key=lambda x: x["shap_value"], reverse=True)

    risk_factors = [c for c in contributions if c["shap_value"] < 0]
    risk_factors.sort(key=lambda x: x["shap_value"])

    # Human-readable narratives
    positive_narratives = []
    for p in positive_factors[:3]:
        if p["feature"] == "income_stability_score":
            positive_narratives.append({
                "title": "Stable Inflow Patterns",
                "detail": f"Monthly alternative receipts show consistent recurring patterns (Stability index: {p['value']:.2f})."
            })
        elif p["feature"] == "utility_ontime_rate":
            positive_narratives.append({
                "title": "Regular Utility Discipline",
                "detail": f"{int(p['value']*100)}% of utility bills were cleared on or before due date."
            })
        elif p["feature"] == "avg_monthly_inflow":
            positive_narratives.append({
                "title": "Sufficient Inflow Velocity",
                "detail": f"Average verified monthly credits of ₹{p['value']:,.0f} indicate ongoing operational cashflow."
            })
        elif p["feature"] == "gst_compliance_rate":
            positive_narratives.append({
                "title": "Consistent GST Filings",
                "detail": f"Merchant has {int(p['value']*100)}% on-time GST compliance."
            })
        elif p["feature"] == "active_days_ratio":
            positive_narratives.append({
                "title": "High Financial Activity",
                "detail": "Frequent transactional activity indicates an active, engaged business/economic profile."
            })

    risk_narratives = []
    for r in risk_factors[:3]:
        if r["feature"] == "expense_to_income_ratio":
            risk_narratives.append({
                "title": "High Outflow Ratio",
                "detail": f"Debits represent {int(r['value']*100)}% of total monthly inflows, indicating tight discretionary cash buffers."
            })
        elif r["feature"] == "utility_ontime_rate":
            risk_narratives.append({
                "title": "Utility Payment Delays",
                "detail": f"Past utility records show delayed or irregular bill payments (Ontime rate: {int(r['value']*100)}%)."
            })
        elif r["feature"] == "income_stability_score":
            risk_narratives.append({
                "title": "Inflow Volatility",
                "detail": "Monthly inflows exhibit significant variance across observed timeframes."
            })
        elif r["feature"] == "inflow_trend_slope":
            risk_narratives.append({
                "title": "Contracting Inflow Trajectory",
                "detail": "Recent months show a downward trajectory in monthly credits."
            })

    return {
        "contributions": contributions,
        "positive_narratives": positive_narratives,
        "risk_narratives": risk_narratives,
        "disclaimer": "SHAP feature contributions explain model behavior on synthetic benchmark data; they do not establish causal certainty or fairness."
    }
