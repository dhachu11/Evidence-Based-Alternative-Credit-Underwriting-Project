# TVS Credit Decision Engine — API Documentation

Interactive Swagger documentation is available at `http://127.0.0.1:8000/docs`.

## Base URL
`http://127.0.0.1:8000/api`

---

## 1. Authentication & Session

### `POST /auth/login`
- **Request Body:** `{ "email": "officer@tvscredit.demo", "password": "demo123" }`
- **Response:**
```json
{
  "token": "tvs.eyJzdWIiOiAiT0ZGSUNFUi0wMSIsICJyb2xlIjogImxvYW5fb2ZmaWNlciJ9.9b8d...",
  "user": {
    "id": "OFFICER-01",
    "email": "officer@tvscredit.demo",
    "role": "loan_officer",
    "name": "Arunachalam S. (Branch Underwriter)",
    "branch": "Coimbatore Main"
  }
}
```

### `GET /auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Decoded user identity and active claims.

---

## 2. Customer Management

### `GET /customers`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Array of customers with masked phone numbers, bureau status, and latest assessment overview.

### `GET /customers/{id}`
- **Headers:** `Authorization: Bearer <token>`
- **Description:** Returns detailed customer profile, consented alternative transactions, and assessment history. Customer role can only access their own record.

---

## 3. Consent & Privacy Controls

### `GET /consent/{customer_id}`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Current consent status, allowed data sources (`upi_allowed`, `utility_allowed`, `gst_allowed`), and authorized data period (e.g. 90 days).

### `POST /consent`
- **Request Body:**
```json
{
  "customer_id": "CUST-101",
  "upi_allowed": true,
  "utility_allowed": true,
  "gst_allowed": false,
  "data_period_days": 90,
  "purpose": "Credit assessment",
  "consent_status": "ACTIVE"
}
```

### `POST /consent/revoke/{customer_id}`
- **Headers:** `Authorization: Bearer <token>`
- **Description:** Immediately revokes alternative data permissions and generates an audit log event.

---

## 4. Evidence Validation & Decision Support

### `GET /evidence/{customer_id}`
- **Headers:** `Authorization: Bearer <token>`
- **Description:** Runs Evidence Validation Layer (history span, completeness, consistency, stability, anomaly detection) without running ML.

### `POST /assessment/{customer_id}`
- **Headers:** `Authorization: Bearer <token>` (Requires `loan_officer` or `admin`)
- **Request Body:** `{ "preferred_model": "xgboost" }`
- **Description:** Executes end-to-end decision pipeline. If evidence is `INSUFFICIENT` (<30d), halts ML and returns `"REQUEST ADDITIONAL INFORMATION"`. If `SUFFICIENT`, executes feature engineering, calibrated XGBoost, SHAP explainability, and action recommendation.

### `POST /assessment/{assessment_id}/decision`
- **Headers:** `Authorization: Bearer <token>` (Requires `loan_officer` or `admin`)
- **Request Body:**
```json
{
  "decision": "PROCEED_STAGE_2",
  "notes": "Verified 90-day Swiggy receipts and on-time TNEB records. Proceed to Stage 2 KYC.",
  "officer_id": "OFFICER-01"
}
```

---

## 5. Admin & Risk Governance

### `GET /admin/metrics`
- **Headers:** `Authorization: Bearer <token>` (Requires `admin` or `loan_officer`)
- **Response:** Side-by-side model metrics (ROC-AUC, Precision, Recall, F1, Brier score), calibration curves, and evidence distribution counts.

### `POST /admin/thresholds`
- **Headers:** `Authorization: Bearer <token>` (Requires `admin`)
- **Request Body:**
```json
{
  "min_sufficient_days": 90.0,
  "min_limited_days": 30.0,
  "min_completeness_rate": 0.80,
  "anomaly_zscore_threshold": 2.5,
  "low_risk_repayment_prob": 0.75
}
```

### `GET /admin/audit-logs`
- **Headers:** `Authorization: Bearer <token>` (Requires `admin` or `loan_officer`)
- **Response:** Chronological audit trail of all authentication, consent, assessment, and configuration events.
