import numpy as np
import pandas as pd
from datetime import datetime

FEATURE_NAMES = [
    "avg_monthly_inflow",
    "income_stability_score",
    "utility_ontime_rate",
    "expense_to_income_ratio",
    "active_days_ratio",
    "inflow_trend_slope",
    "gst_compliance_rate",
    "merchant_revenue_stability"
]

def extract_customer_features(customer_id: str, conn, customer_type: str = "Gig Worker"):
    """
    Transforms raw alternative transactions into standardized numerical feature vector for ML modeling.
    """
    cursor = conn.cursor()
    
    # 1. Fetch UPI Data
    cursor.execute("SELECT * FROM upi_transactions WHERE customer_id = ? ORDER BY date ASC", (customer_id,))
    upi_rows = cursor.fetchall()
    
    # 2. Fetch Utility Data
    cursor.execute("SELECT * FROM utility_payments WHERE customer_id = ? ORDER BY due_date ASC", (customer_id,))
    utility_rows = cursor.fetchall()
    
    # 3. Fetch GST Data
    cursor.execute("SELECT * FROM gst_records WHERE customer_id = ? ORDER BY filing_month ASC", (customer_id,))
    gst_rows = cursor.fetchall()

    # Process UPI inflows and debits over chronological 30-day window buckets
    parsed_dates = [datetime.fromisoformat(r["date"][:10]) for r in upi_rows]
    unique_dates = {r["date"][:10] for r in upi_rows}
    
    if parsed_dates:
        min_d = min(parsed_dates)
        max_d = max(parsed_dates)
        total_days = max(1, (max_d - min_d).days + 1)
        
        bucket_size = 30
        buckets_credit = {}
        buckets_debit = {}
        for r in upi_rows:
            dt = datetime.fromisoformat(r["date"][:10])
            b_idx = (dt - min_d).days // bucket_size
            amt = float(r["amount"])
            if r["transaction_type"].lower() == "credit":
                buckets_credit[b_idx] = buckets_credit.get(b_idx, 0.0) + amt
            else:
                buckets_debit[b_idx] = buckets_debit.get(b_idx, 0.0) + amt

        num_full_windows = total_days // 30
        if num_full_windows >= 1:
            credit_vals = [buckets_credit[i] for i in range(num_full_windows) if i in buckets_credit]
            debit_vals = [buckets_debit[i] for i in range(num_full_windows) if i in buckets_debit]
        else:
            credit_vals = list(buckets_credit.values()) if buckets_credit else [0.0]
            debit_vals = list(buckets_debit.values()) if buckets_debit else [0.0]

        total_credit = sum(buckets_credit.values())
        total_debit = sum(buckets_debit.values())
    else:
        credit_vals = [0.0]
        debit_vals = [0.0]
        total_credit = 0.0
        total_debit = 0.0

    avg_monthly_inflow = float(np.mean(credit_vals)) if credit_vals else 0.0
    
    # Income Stability (1 - Coefficient of Variation, bounded [0.0, 1.0])
    if len(credit_vals) > 1 and avg_monthly_inflow > 0:
        std_inflow = float(np.std(credit_vals))
        cv = std_inflow / avg_monthly_inflow
        income_stability_score = max(0.0, min(1.0, 1.0 - (cv / 2.0)))
    elif len(credit_vals) == 1 and avg_monthly_inflow > 0:
        income_stability_score = 0.75
    else:
        income_stability_score = 0.10

    # Utility Ontime Rate
    if utility_rows:
        ontime_count = sum(1 for u in utility_rows if u["status"] == "PAID_ON_TIME")
        utility_ontime_rate = round(ontime_count / len(utility_rows), 3)
    else:
        utility_ontime_rate = 0.50 # Neutral default

    # Expense to Income Ratio
    if total_credit > 0:
        expense_to_income_ratio = min(1.5, round(total_debit / total_credit, 3))
    else:
        expense_to_income_ratio = 0.80

    # Active Transaction Days Ratio (out of 90 days)
    active_days_ratio = min(1.0, round(len(unique_dates) / 90.0, 3))

    # Inflow Trend Slope
    if len(credit_vals) >= 2:
        x = np.arange(len(credit_vals))
        slope, _ = np.polyfit(x, credit_vals, 1)
        # Normalized slope relative to average
        inflow_trend_slope = round(float(slope / (avg_monthly_inflow + 1e-5)), 3)
    else:
        inflow_trend_slope = 0.0

    # GST Compliance and Revenue Stability (For merchants)
    if gst_rows:
        ontime_gst = sum(1 for g in gst_rows if g["status"] == "FILED_ON_TIME")
        gst_compliance_rate = round(ontime_gst / len(gst_rows), 3)
        turnovers = [float(g["turnover_amount"]) for g in gst_rows]
        mean_turnover = float(np.mean(turnovers)) if turnovers else 0.0
        if len(turnovers) > 1 and mean_turnover > 0:
            std_turnover = float(np.std(turnovers))
            merchant_revenue_stability = max(0.0, min(1.0, 1.0 - (std_turnover / (2.0 * mean_turnover))))
        else:
            merchant_revenue_stability = 0.60
    else:
        # Not applicable / gig worker default
        gst_compliance_rate = 0.0
        merchant_revenue_stability = 0.0

    feature_dict = {
        "avg_monthly_inflow": round(avg_monthly_inflow, 2),
        "income_stability_score": round(income_stability_score, 3),
        "utility_ontime_rate": round(utility_ontime_rate, 3),
        "expense_to_income_ratio": round(expense_to_income_ratio, 3),
        "active_days_ratio": round(active_days_ratio, 3),
        "inflow_trend_slope": round(inflow_trend_slope, 3),
        "gst_compliance_rate": round(gst_compliance_rate, 3),
        "merchant_revenue_stability": round(merchant_revenue_stability, 3)
    }

    feature_vector = [feature_dict[name] for name in FEATURE_NAMES]
    return feature_dict, feature_vector
