import numpy as np
import pandas as pd
import os

def generate_synthetic_training_data(n_samples: int = 1200, seed: int = 42):
    """
    Generates a realistic synthetic alternative financial training dataset.
    Follows behavioral customer profiles (Gig Workers, Merchants, Salaried first-timers).
    Includes noise, variations, and realistic target correlations.
    """
    np.random.seed(seed)
    
    profiles = []
    
    for i in range(n_samples):
        cust_type = np.random.choice(["Gig Worker", "Merchant", "Salaried First-Timer"], p=[0.45, 0.35, 0.20])
        is_stable = np.random.choice([True, False], p=[0.65, 0.35])
        
        if cust_type == "Gig Worker":
            if is_stable:
                avg_inflow = np.random.normal(32000, 4000)
                cv = np.random.uniform(0.08, 0.22)
                utility_ontime = np.random.choice([1.0, 0.85, 0.75], p=[0.7, 0.2, 0.1])
                exp_ratio = np.random.uniform(0.60, 0.85)
                active_days = np.random.uniform(0.70, 0.95)
                slope = np.random.uniform(-0.05, 0.08)
                repay_prob = 0.88 - (cv * 0.4) - ((1.0 - utility_ontime) * 0.3)
            else:
                avg_inflow = np.random.normal(24000, 9000)
                cv = np.random.uniform(0.40, 0.85)
                utility_ontime = np.random.choice([0.6, 0.4, 0.0], p=[0.4, 0.4, 0.2])
                exp_ratio = np.random.uniform(0.85, 1.25)
                active_days = np.random.uniform(0.35, 0.65)
                slope = np.random.uniform(-0.25, 0.10)
                repay_prob = 0.45 - (cv * 0.2) + (utility_ontime * 0.2)
            
            gst_comp = 0.0
            merch_stab = 0.0

        elif cust_type == "Merchant":
            if is_stable:
                avg_inflow = np.random.normal(120000, 25000)
                cv = np.random.uniform(0.10, 0.25)
                utility_ontime = np.random.choice([1.0, 0.9], p=[0.8, 0.2])
                exp_ratio = np.random.uniform(0.70, 0.88)
                active_days = np.random.uniform(0.85, 0.98)
                slope = np.random.uniform(-0.02, 0.12)
                gst_comp = np.random.choice([1.0, 0.90], p=[0.85, 0.15])
                merch_stab = np.random.uniform(0.80, 0.98)
                repay_prob = 0.92 - (cv * 0.3) - ((1.0 - gst_comp) * 0.3)
            else:
                avg_inflow = np.random.normal(85000, 45000)
                cv = np.random.uniform(0.50, 0.95)
                utility_ontime = np.random.choice([0.65, 0.35, 0.0], p=[0.5, 0.3, 0.2])
                exp_ratio = np.random.uniform(0.90, 1.40)
                active_days = np.random.uniform(0.40, 0.70)
                slope = np.random.uniform(-0.30, 0.05)
                gst_comp = np.random.choice([0.60, 0.30, 0.0], p=[0.4, 0.4, 0.2])
                merch_stab = np.random.uniform(0.20, 0.55)
                repay_prob = 0.40 - (cv * 0.2) + (gst_comp * 0.25)

        else: # Salaried First-Timer
            if is_stable:
                avg_inflow = np.random.normal(45000, 6000)
                cv = np.random.uniform(0.05, 0.15)
                utility_ontime = 1.0
                exp_ratio = np.random.uniform(0.55, 0.78)
                active_days = np.random.uniform(0.60, 0.80)
                slope = np.random.uniform(0.0, 0.05)
                repay_prob = 0.90
            else:
                avg_inflow = np.random.normal(30000, 12000)
                cv = np.random.uniform(0.35, 0.70)
                utility_ontime = np.random.choice([0.5, 0.25], p=[0.6, 0.4])
                exp_ratio = np.random.uniform(0.88, 1.20)
                active_days = np.random.uniform(0.30, 0.55)
                slope = np.random.uniform(-0.20, 0.05)
                repay_prob = 0.50

            gst_comp = 0.0
            merch_stab = 0.0

        # Feature normalization & bounding
        income_stability_score = max(0.0, min(1.0, 1.0 - (cv / 2.0)))
        repay_prob = max(0.08, min(0.96, repay_prob))
        
        # Add random outcome based on probability
        repayment_outcome = 1 if np.random.rand() < repay_prob else 0

        profiles.append({
            "avg_monthly_inflow": max(5000, avg_inflow),
            "income_stability_score": round(income_stability_score, 3),
            "utility_ontime_rate": round(utility_ontime, 3),
            "expense_to_income_ratio": round(exp_ratio, 3),
            "active_days_ratio": round(active_days, 3),
            "inflow_trend_slope": round(slope, 3),
            "gst_compliance_rate": round(gst_comp, 3),
            "merchant_revenue_stability": round(merch_stab, 3),
            "repayment_outcome": repayment_outcome
        })

    df = pd.DataFrame(profiles)
    return df

if __name__ == "__main__":
    df = generate_synthetic_training_data()
    out_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed")
    os.makedirs(out_dir, exist_ok=True)
    df.to_csv(os.path.join(out_dir, "synthetic_training_data.csv"), index=False)
    print(f"Generated {len(df)} synthetic samples. Positive class rate: {df['repayment_outcome'].mean():.2%}")
