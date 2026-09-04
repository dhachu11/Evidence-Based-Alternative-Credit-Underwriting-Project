from datetime import datetime
import numpy as np
import json

def get_thresholds(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM threshold_config")
    rows = cursor.fetchall()
    thresholds = {row["key"]: row["value"] for row in rows}
    return {
        "min_sufficient_days": thresholds.get("min_sufficient_days", 90.0),
        "min_limited_days": thresholds.get("min_limited_days", 30.0),
        "min_completeness_rate": thresholds.get("min_completeness_rate", 0.80),
        "anomaly_zscore_threshold": thresholds.get("anomaly_zscore_threshold", 2.5),
        "low_risk_repayment_prob": thresholds.get("low_risk_repayment_prob", 0.75)
    }

def validate_evidence(customer_id: str, conn):
    """
    Evidence Validation Layer:
    Determines whether there is enough reliable evidence to run ML risk scoring.
    Checks:
    - Granular consent status (UPI, Utility, GST)
    - History length (days)
    - Data completeness
    - Cross-source consistency
    - Behavioral stability & anomaly flags
    """
    cursor = conn.cursor()
    thresholds = get_thresholds(conn)

    # 1. Check Consent
    cursor.execute("SELECT * FROM consents WHERE customer_id = ?", (customer_id,))
    consent = cursor.fetchone()
    if not consent or consent["consent_status"] != "ACTIVE":
        return {
            "status": "INSUFFICIENT",
            "quality_score": 0.0,
            "can_run_ml": False,
            "reason": "Borrower consent revoked or not granted. Customer authorization required before accessing alternative data.",
            "metrics": {
                "history_days": 0,
                "completeness_rate": 0.0,
                "consistency_score": 0.0,
                "anomaly_detected": False,
                "anomaly_details": None,
                "total_upi_txns": 0,
                "total_utility_bills": 0,
                "total_gst_filings": 0
            },
            "flags": ["CONSENT_MISSING_OR_REVOKED"]
        }

    # Respect Granular Permissions
    use_upi = bool(consent["upi_allowed"])
    use_utility = bool(consent["utility_allowed"])
    use_gst = bool(consent["gst_allowed"])

    if not use_upi and not use_utility and not use_gst:
        return {
            "status": "INSUFFICIENT",
            "quality_score": 0.0,
            "can_run_ml": False,
            "reason": "All specific data stream permissions (UPI, Utility, GST) have been disabled by borrower.",
            "metrics": {
                "history_days": 0,
                "completeness_rate": 0.0,
                "consistency_score": 0.0,
                "anomaly_detected": False,
                "anomaly_details": None,
                "total_upi_txns": 0,
                "total_utility_bills": 0,
                "total_gst_filings": 0
            },
            "flags": ["NO_ACTIVE_DATA_PERMISSIONS"]
        }

    # 2. Fetch Raw Alternative Data (Only from allowed sources)
    if use_upi:
        cursor.execute("SELECT * FROM upi_transactions WHERE customer_id = ? ORDER BY date ASC", (customer_id,))
        upi_rows = cursor.fetchall()
    else:
        upi_rows = []

    if use_utility:
        cursor.execute("SELECT * FROM utility_payments WHERE customer_id = ? ORDER BY due_date ASC", (customer_id,))
        utility_rows = cursor.fetchall()
    else:
        utility_rows = []

    if use_gst:
        cursor.execute("SELECT * FROM gst_records WHERE customer_id = ? ORDER BY filing_month ASC", (customer_id,))
        gst_rows = cursor.fetchall()
    else:
        gst_rows = []

    # Calculate History Span
    all_dates = []
    for r in upi_rows:
        try:
            all_dates.append(datetime.strptime(r["date"][:10], "%Y-%m-%d"))
        except:
            pass
    for r in utility_rows:
        try:
            all_dates.append(datetime.strptime(r["due_date"][:10], "%Y-%m-%d"))
        except:
            pass
    for r in gst_rows:
        try:
            all_dates.append(datetime.strptime(r["filing_month"][:7] + "-01", "%Y-%m-%d"))
        except:
            pass

    if not all_dates:
        return {
            "status": "INSUFFICIENT",
            "quality_score": 0.0,
            "can_run_ml": False,
            "reason": "No alternative financial records found across consented streams.",
            "metrics": {
                "history_days": 0,
                "completeness_rate": 0.0,
                "consistency_score": 0.0,
                "anomaly_detected": False,
                "anomaly_details": None,
                "total_upi_txns": 0,
                "total_utility_bills": 0,
                "total_gst_filings": 0
            },
            "flags": ["NO_RECORDS_IN_ALLOWED_STREAMS"]
        }

    min_date = min(all_dates)
    max_date = max(all_dates)
    history_days = max(1, (max_date - min_date).days)

    # Calculate Completeness
    expected_cycles = max(1, int(np.ceil(history_days / 30.0)))
    upi_months = set()
    for r in upi_rows:
        upi_months.add(r["date"][:7])
    utility_months = set()
    for r in utility_rows:
        utility_months.add(r["due_date"][:7])
    
    observed_cycles = max(len(upi_months), len(utility_months)) if (use_upi or use_utility) else len(all_dates)
    completeness_rate = min(1.0, round(observed_cycles / expected_cycles, 2))

    # Calculate Behavioral Stability & Anomaly Flag (UPI inflow monthly)
    monthly_inflows = {}
    for r in upi_rows:
        if r["transaction_type"].lower() == "credit":
            m = r["date"][:7]
            monthly_inflows[m] = monthly_inflows.get(m, 0.0) + float(r["amount"])

    anomaly_detected = False
    anomaly_details = None
    flags = []

    if monthly_inflows:
        values = list(monthly_inflows.values())
        if len(values) >= 2:
            recent_month_val = values[-1]
            if len(values) >= 3:
                historical_mean = float(np.mean(values[:-1]))
                if historical_mean > 0 and recent_month_val > (2.5 * historical_mean):
                    anomaly_detected = True
                    anomaly_details = f"Severe inflow surge (₹{recent_month_val:,.0f}) is {recent_month_val/historical_mean:.1f}x above customer's historical baseline (₹{historical_mean:,.0f})."
                    flags.append("UNUSUAL_INFLOW_SPIKE")
                elif historical_mean > 0 and recent_month_val > (1.18 * historical_mean):
                    anomaly_detected = True
                    anomaly_details = f"Recent monthly inflow (₹{recent_month_val:,.0f}) shows a {int((recent_month_val/historical_mean - 1)*100)}% seasonal increase above customer's 60-day baseline (₹{historical_mean:,.0f})."
                    flags.append("SEASONAL_INFLOW_VARIATION")

    # Cross-source Consistency Check
    consistency_score = 0.90 # default good
    
    # Check Utility payment discipline
    if utility_rows:
        paid_on_time = sum(1 for u in utility_rows if u["status"] == "PAID_ON_TIME")
        missed = sum(1 for u in utility_rows if u["status"] in ["MISSED", "DEFAULTED"])
        if missed >= 2 and sum(monthly_inflows.values()) > 50000:
            consistency_score = 0.40
            flags.append("HIGH_INFLOW_UTILITY_DEFAULT_MISMATCH")
            anomaly_detected = True
            anomaly_details = "High reported transaction inflow co-occurs with multiple missed utility bills."
        elif missed >= 1:
            consistency_score = 0.70
            flags.append("UTILITY_DELAY_OBSERVED")
    
    # Check GST vs UPI consistency for merchants
    if gst_rows and upi_rows:
        gst_turnover_sum = sum(float(g["turnover_amount"]) for g in gst_rows)
        upi_credit_sum = sum(float(u["amount"]) for u in upi_rows if u["transaction_type"].lower() == "credit")
        if upi_credit_sum > 0 and gst_turnover_sum > 0:
            ratio = upi_credit_sum / gst_turnover_sum
            if ratio < 0.2 or ratio > 5.0:
                consistency_score = min(consistency_score, 0.45)
                flags.append("GST_UPI_TURNOVER_DISCREPANCY")

    # Check for Inconsistent state
    if "HIGH_INFLOW_UTILITY_DEFAULT_MISMATCH" in flags or "GST_UPI_TURNOVER_DISCREPANCY" in flags:
        status = "INCONSISTENT"
        can_run_ml = False
        quality_score = 0.42
        reason = "Major cross-source discrepancies or conflicting financial signals detected. Manual verification required."
    # Check for Insufficient state (< min_limited_days)
    elif history_days < thresholds["min_limited_days"]:
        status = "INSUFFICIENT"
        can_run_ml = False
        quality_score = round(history_days / thresholds["min_sufficient_days"] * 0.5, 2)
        reason = f"Insufficient history ({history_days} days). Prototype requires at least {int(thresholds['min_limited_days'])} days for limited evaluation and {int(thresholds['min_sufficient_days'])} days for reliable risk scoring."
    # Check for Limited state
    elif history_days < thresholds["min_sufficient_days"] or completeness_rate < thresholds["min_completeness_rate"]:
        status = "LIMITED"
        can_run_ml = False
        quality_score = 0.65
        reason = f"Limited evidence available ({history_days} days history, {int(completeness_rate*100)}% completeness). Additional data records required before running ML risk estimation."
    # Sufficient with Warning vs Sufficient
    elif anomaly_detected:
        status = "SUFFICIENT_WITH_WARNING"
        can_run_ml = True
        quality_score = 0.82
        reason = f"Sufficient history ({history_days} days) with good completeness ({int(completeness_rate*100)}%), but flagged with a behavioral variation."
    else:
        status = "SUFFICIENT"
        can_run_ml = True
        quality_score = 0.95
        reason = f"Sufficient history ({history_days} days) with high completeness ({int(completeness_rate*100)}%) and consistent cross-source evidence."

    return {
        "status": status,
        "quality_score": quality_score,
        "can_run_ml": can_run_ml,
        "reason": reason,
        "metrics": {
            "history_days": history_days,
            "completeness_rate": completeness_rate,
            "consistency_score": consistency_score,
            "anomaly_detected": anomaly_detected,
            "anomaly_details": anomaly_details,
            "total_upi_txns": len(upi_rows),
            "total_utility_bills": len(utility_rows),
            "total_gst_filings": len(gst_rows)
        },
        "flags": flags
    }
