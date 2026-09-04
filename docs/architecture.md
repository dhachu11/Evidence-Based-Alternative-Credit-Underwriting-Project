# TVS Credit Decision Engine — Architecture & Technical Design

## System Architecture

```
                                    +----------------------------+
                                    |    Customer Portal         |
                                    |  (Consent & Permissions)   |
                                    +--------------+-------------+
                                                   |
                                                   v
+-------------------------------+   +--------------+-------------+   +----------------------------+
|     Loan Officer Portal       |-->| Evidence Validation Layer  |<--|    Admin & Risk Portal     |
|   (Workbench & Decision Desk) |   | (History, Stability, Flags)|   | (Thresholds & Monitoring)  |
+-------------------------------+   +--------------+-------------+   +----------------------------+
                                                   |
                       +---------------------------+---------------------------+
                       |                                                       |
                       v [Sufficient Evidence]                                 v [Insufficient / Inconsistent]
         +-------------+-------------+                           +-------------+-------------+
         |    Feature Engineering    |                           |  "I Don't Know" Gate      |
         +-------------+-------------+                           |  (Halt ML Risk Estimation)|
                       |                                         +-------------+-------------+
                       v                                                       |
         +-------------+-------------+                                         v
         | Calibrated XGBoost Model  |                           +-------------+-------------+
         +-------------+-------------+                           | Action: Request Info /    |
                       |                                         | Manual Audit Required     |
                       v                                         +---------------------------+
         +-------------+-------------+
         | SHAP Plain-English Explainer
         +-------------+-------------+
                       |
                       v
         +-------------+-------------+
         | Recommended Action Engine |
         | (Proceed to Further UW)   |
         +-------------+-------------+
                       |
                       v
         +-------------+-------------+
         |    Human Underwriter      |
         | (Final Sanction Authority)|
         +---------------------------+
```

## Component Architecture

1. **Frontend (`frontend/src/`)**:
   - Built with **React 19**, **Vite**, and **Tailwind CSS**.
   - State management with `AuthContext` supporting cryptographic JWT/HMAC tokens and role persistence.
   - Reusable fintech enterprise design system: `Card`, `Button`, `Modal`, `Toast`, `StatusBadge`, `ErrorMessage`, `EmptyState`, `ConfirmDialog`.
   - Three distinct role-based experiences: Customer Consent Center, Loan Officer Workbench, and Admin Risk Monitoring.

2. **Backend (`backend/app/`)**:
   - Built with **FastAPI** and **SQLite3**.
   - Modular REST routing: `/auth`, `/customers`, `/consent`, `/assessment`, `/admin`.
   - Robust RBAC security with HMAC signed tokens, password hashing, and customer data isolation.

3. **Evidence Validation Layer (`evidence_validation.py`)**:
   - First-class gateway verifying:
     - Active granular consent permissions
     - History length (default >=90 days for Sufficient, 30-89 for Limited, <30 for Insufficient)
     - Data completeness (% of expected monthly cycles observed)
     - Cross-source consistency (UPI velocity vs GST turnover vs Utility payment timeliness)
     - Behavioral stability and anomaly detection (rolling baseline deviations)

4. **Machine Learning & Calibration Subsystem (`backend/app/ml/`)**:
   - **Logistic Regression Baseline:** Linear benchmark.
   - **XGBoost Classifier v1.0:** Captures multi-source non-linear interactions.
   - **Probability Calibration:** Platt scaling via `CalibratedClassifierCV(method='sigmoid')`.
   - **SHAP Explainability:** TreeExplainer attributing positive and risk factors translated to plain English.
