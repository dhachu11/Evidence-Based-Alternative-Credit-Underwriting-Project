# TVS Credit — Evidence-Based Alternative Credit Decision Engine

> **"New-to-credit does not mean high-risk. It means traditional evidence is insufficient. When evidence is insufficient, we don't manufacture confidence."**
> 
> *An evidence-aware decision-support platform that validates customer-consented alternative financial data before statistical ML risk inference, explains predictions via SHAP, and recommends next underwriting actions for human credit officers.*

---

## 🏛️ System Overview & Problem Statement
Traditional lending relies heavily on bureau credit scores (CIBIL). When a new-to-credit (NTC) borrower or gig worker applies for a two-wheeler or consumer durable loan, their bureau file is often "Thin" or non-existent (`NH / -1`), leading to manual delays or unfair rejections.

**The TVS Credit Evidence-Based Decision Engine** solves this by:
1. Collecting explicit customer consent for alternative financial streams (UPI cash flows, utility bill payment history, and GST returns for merchants).
2. Executing an **Evidence Validation Layer** to verify history length, data completeness, cross-source consistency, and behavioral stability *before* attempting machine learning inference.
3. Explicitly saying **"I Don't Know"** when evidence is insufficient (< 30 days or inconsistent), prompting for supplementary information rather than manufacturing an arbitrary credit score.
4. Estimating calibrated **repayment probability** only when evidence is sufficient.
5. Providing **human-readable SHAP explanations** to underwriters.
6. Recommending actionable next steps (`PROCEED TO FURTHER UNDERWRITING`, `REQUEST ADDITIONAL INFORMATION`, `MANUAL VERIFICATION REQUIRED`) while keeping final sanction authority strictly with the **human underwriter**.

---

## 🌟 Core Product Principles
- **Principle 1 — Do NOT Replace CIBIL:** Supplements bureau history; never claims alternative data completely replaces traditional records.
- **Principle 2 — Do NOT Automatically Approve Loans:** The system is an evidence decision-support tool, never an automated auto-sanction or auto-rejection engine.
- **Principle 3 — Evidence Comes Before ML:** History length, completeness, consistency, and anomalies are validated before ML feature extraction.
- **Principle 4 — The System Can Say "I Don't Know":** Refuses to score thin or conflicting evidence.
- **Principle 5 — Separate Risk from Affordability:** Projects alternative repayment probability without calculating artificial loan ticket sizing or replacing debt-to-income (FOIR) underwriting.
- **Principle 6 — Synthetic Benchmark Transparency:** Discloses synthetic training data and highlights methodology over production performance claims.

---

## 🖥️ Three Role-Based Portals

### 1. Customer Portal
- **Granular Consent Center:** Interactive toggles for UPI, Utility, and GST records.
- **Scope & Purpose Limitation:** Declared 90-day scope for credit assessment purposes only.
- **Instant Revocation:** 1-click revocation of all alternative permissions with real-time audit logging and data blocking.
- **Activity Preview:** Transparent view of verified UPI transactions and utility payment timeliness.

### 2. Loan Officer Portal (⭐ Main Hub)
- **Borrower Queue:** Real-time customer search, filtering by segment, evidence status, and anomaly flags.
- **Fast Persona Bar:** 1-click evaluation of 5 distinct borrower archetypes.
- **7-Stage Assessment Runner:** Live animated execution sequence illustrating validation gates.
- **Evidence Quality Matrix:** History days vs thresholds, completeness %, consistency score, and behavioral anomaly alerts.
- **Calibrated Repayment Probability Gauge:** Platt-calibrated probability mapped to risk bands (Low, Low–Medium, Medium–High, High).
- **Human-Readable SHAP Factors:** Plain-English positive drivers and risk factor breakdowns.
- **Interactive Underwriting Checklist:** 6-point verification checklist for branch underwriters.
- **Human Decision Logger:** Direct underwriter notes and decision recording.

### 3. Admin & Risk Manager Portal
- **Model Validation & Comparison:** Side-by-side performance benchmarking between Logistic Regression Baseline and Calibrated XGBoost v1.0 (ROC-AUC, PR-AUC, Precision, Recall, F1, Brier Score).
- **Probability Calibration Curve:** Visual reliability diagram comparing observed fraction of positives vs predicted probability.
- **Evidence Quality Distribution:** Interactive analytics breakdown of borrower evidence states.
- **Real-Time Configurable Thresholds:** Live editing of minimum history days, completeness ratio, and anomaly z-score cutoffs.
- **System Audit & Governance Logs:** Searchable audit trail of all authentication, consent, assessment, and threshold updates.
- **Prototype → Production Roadmap:** 12-step transition framework to enterprise deployment.
- **Retailer Workflow Insight:** Point-of-sale dealer interaction observation section with live editor.

---

## 🧑‍🤝‍🧑 Seeded Demo Personas

| Persona | Segment & Location | History & Profile | Evidence Status | ML Risk Probability | Recommended Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Ravi Kumar ⭐ HERO** | Gig Worker (Coimbatore) | 95d Swiggy/Zepto daily credits (~₹32K/mo), 100% on-time TNEB bills, mild bonus spike | `SUFFICIENT WITH WARNING` | **82% (Low–Medium Risk)** | **PROCEED TO FURTHER UNDERWRITING** |
| **Priya Sharma** | Salaried First-Timer (Tiruppur) | 45d history, 1 missing piped gas record | `LIMITED EVIDENCE` | *Unassessed (No ML Score)* | **REQUEST ADDITIONAL INFORMATION** |
| **Arjun Traders** | Merchant (Madurai Kirana) | 95d GST-3B filings + UPI QR settlements | `SUFFICIENT` | **91% (Low Risk)** | **PROCEED TO FURTHER UNDERWRITING** |
| **Vikram Patel** | Contractor (Salem) | 95d history, 5x lump-sum surge + 2 missed bills | `INCONSISTENT EVIDENCE` | *Unassessed (Halted)* | **MANUAL VERIFICATION REQUIRED** |
| **Suresh Nair** | Auto Driver (Chennai) | 15d history (< 30d prototype minimum) | `INSUFFICIENT EVIDENCE` | *Unassessed ("I Don't Know")* | **REQUEST ADDITIONAL INFORMATION** |

---

## 🔐 Security & Privacy Implementation
1. **Password Hashing:** SHA-256 with cryptographic salt; no plaintext passwords stored.
2. **HMAC-Signed Session Tokens:** Cryptographically signed Bearer tokens verifying user identity and claims.
3. **Role-Based Access Control (RBAC):** Customer can only access their own data (`403 Forbidden` on other IDs). Officers cannot modify admin thresholds.
4. **Consent-Driven Data Blocking:** Revoking consent immediately blocks alternative data access in the validation engine.
5. **Data Minimization:** Masked phone numbers in all views (`+91 98401 •••••`).
6. **SQL Injection Defense:** Strict parameterized SQLite queries across all endpoints.

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup & Run
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000 --reload
```
API Documentation will be available at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup & Run
```bash
cd frontend
npm install
npm run dev
```
Frontend Web UI will be available at `http://localhost:5173/`.

### 4. Running Automated Tests
```bash
pytest backend/tests -v
```
All 13 security, authorization, evidence validation, and ML tests will execute and report passing results.

---

## 🔑 Demo Credentials

| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Loan Officer** | `officer@tvscredit.demo` | `demo123` | Main Underwriting Workbench |
| **Admin / CRO** | `admin@tvscredit.demo` | `admin123` | Model Telemetry & Governance |
| **Customer (Ravi)** | `ravi@customer.demo` | `demo123` | Borrower Consent Center |

---

## 📚 Technical Documentation Directory
- [Architecture & Design (`docs/architecture.md`)](file:///C:/Users/dhara/OneDrive/Desktop/TVS%20CREDIT/docs/architecture.md)
- [ML Subsystem & Explainability (`docs/model_notes.md`)](file:///C:/Users/dhara/OneDrive/Desktop/TVS%20CREDIT/docs/model_notes.md)
- [REST API Specification (`docs/api.md`)](file:///C:/Users/dhara/OneDrive/Desktop/TVS%20CREDIT/docs/api.md)
- [Security & Privacy Governance (`docs/security_and_privacy.md`)](file:///C:/Users/dhara/OneDrive/Desktop/TVS%20CREDIT/docs/security_and_privacy.md)
#   E v i d e n c e - B a s e d - A l t e r n a t i v e - C r e d i t - U n d e r w r i t i n g - P r o j e c t  
 #   E v i d e n c e - B a s e d - A l t e r n a t i v e - C r e d i t - U n d e r w r i t i n g - P r o j e c t  
 