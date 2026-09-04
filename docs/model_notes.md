# TVS Credit Decision Engine — Machine Learning & Model Notes

## 1. Objective & Target Variable Definition
The goal of the ML subsystem is **not** to invent a proprietary 3-digit credit score or automate credit approval.
The model predicts a binary target:
$$\text{repayment\_outcome} \in \{0, 1\}$$
- $1$: Borrower remained current / successfully repaid obligations over observed timeframe.
- $0$: Borrower exhibited severe delinquency or default.

> [!NOTE]
> This is a synthetic prototype target designed to demonstrate methodology, validation gates, calibration curves, and feature explainability. Production deployment requires training on actual TVS Credit loan performance records.

---

## 2. Feature Engineering

| Feature Name | Description | Domain Scope |
| :--- | :--- | :--- |
| `avg_monthly_inflow` | Mean monthly verified credits across digital accounts | Gig & Salaried & Merchant |
| `income_stability_score` | Normalized index: $1 - \frac{\sigma_{\text{inflow}}}{2\mu_{\text{inflow}}}$ bounded $[0, 1]$ | Gig & Salaried |
| `utility_ontime_rate` | Ratio of utility bills cleared on or before due date | All segments |
| `expense_to_income_ratio` | Ratio of total observed debits to verified inflows | All segments |
| `active_days_ratio` | Fraction of active transactional days over 90-day window | All segments |
| `inflow_trend_slope` | Normalized linear trajectory slope of monthly receipts | All segments |
| `gst_compliance_rate` | Ratio of on-time GST-3B filings to required periods | Merchant segment |
| `merchant_revenue_stability`| Stability score of monthly GST/QR business turnover | Merchant segment |

---

## 3. Model Benchmark & Validation Comparison

| Metric | Logistic Regression Baseline | Calibrated XGBoost v1.0 |
| :--- | :--- | :--- |
| **Model Type** | Linear + StandardScaler | Gradient Boosted Decision Trees |
| **ROC-AUC** | ~0.776 | ~0.854 |
| **PR-AUC** | ~0.841 | ~0.886 |
| **Precision** | ~0.795 | ~0.835 |
| **Recall** | ~0.820 | ~0.860 |
| **F1-Score** | ~0.807 | ~0.847 |
| **Brier Score** | ~0.142 | ~0.118 |
| **Selected** | Baseline Comparison | **Selected for Decision Support** |

---

## 4. Probability Calibration
Raw model outputs are passed through **Platt Scaling** (`CalibratedClassifierCV(method='sigmoid', cv=5)`).
The output represents an **Estimated Repayment Probability** (e.g. 82%), mapped into risk bands:
- $\ge 80\%$: **LOW RISK**
- $65\% - 79\%$: **LOW–MEDIUM RISK**
- $50\% - 64\%$: **MEDIUM–HIGH RISK**
- $< 50\%$: **HIGH RISK**

---

## 5. SHAP Explainability & Limitations
Tree SHAP values are extracted for every inference and translated into plain-English driver statements:
- **Positive Drivers:** E.g., *"Stable Inflow Patterns"*, *"Regular Utility Discipline"*.
- **Risk Contributing Factors:** E.g., *"Recent Inflow Volatility"*, *"High Outflow Ratio"*.

> [!WARNING]
> **Ethical Governance Notice:** SHAP explains statistical model attribution on training data; it does **not** establish causal certainty, credit fairness, or legal compliance on its own.
