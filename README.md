# TVS Credit — Evidence-Based Alternative Credit Underwriting

<p align="center">
  <strong>New-to-credit doesn't mean high-risk.</strong><br/>
  <em>It means there isn't enough traditional evidence.</em>
</p>

<p align="center">
  <strong>When the evidence isn't sufficient, we don't manufacture confidence.</strong>
</p>

<p align="center">

`Responsible AI` · `Alternative Data` · `Credit Risk` · `Explainable ML` · `Human-in-the-Loop`

</p>

---

## 🎯 The Idea

Traditional credit assessment works well when a customer has a meaningful bureau history.

But what happens when the customer is applying for their **first loan**?

A gig worker may have consistent digital income.
A small merchant may have regular UPI settlements and GST records.
A young salaried employee may pay every bill on time.

Yet their traditional credit file can still be thin.

Our solution introduces an **evidence-aware decision-support layer** that helps a credit officer use consented alternative financial evidence without turning missing history into an arbitrary risk score.

> **We don't replace traditional underwriting. We strengthen the evidence available to it.**

---

# 🧠 What We Are Solving

### The traditional evidence gap

```text
Customer Application
        │
        ▼
Traditional / Bureau Evidence
        │
        ├── Strong history ─────────► Assessment
        │
        └── Thin / No history
                 │
                 ▼
          Limited Evidence
                 │
                 ▼
        Additional Verification
                 │
                 ▼
          Human Underwriting
```

For New-to-Credit customers, the challenge is not necessarily poor repayment ability.

The challenge is:

**insufficient, fragmented or inconsistent evidence.**

Our system addresses that gap by adding a controlled alternative-data evidence layer.

---

# 💡 Our Solution

## Evidence-Based Alternative Credit Underwriting

A responsible AI decision-support engine that:

1. Obtains **explicit customer consent**.
2. Collects permitted alternative financial evidence.
3. Validates evidence **before ML inference**.
4. Measures evidence sufficiency and consistency.
5. Extracts repayment-related behavioral signals.
6. Estimates repayment risk only when evidence quality permits.
7. Explains model behavior using **SHAP**.
8. Flags unusual behavioral patterns.
9. Recommends the next underwriting action.
10. Keeps the **final lending decision with the human underwriter**.

### Core principle

> **Evidence → Validation → Risk Inference → Explanation → Human Decision**

Not:

> **Data → Black-box Score → Automatic Approval**

---

# 🔍 Alternative Data Layer

We intentionally focus on a small set of financially meaningful sources.

| Source                  | Potential Evidence            | Example Signals                                                      |
| ----------------------- | ----------------------------- | -------------------------------------------------------------------- |
| 🟢 **UPI**              | Digital transaction behaviour | Inflow stability, transaction regularity, inflow/outflow patterns    |
| 🔵 **Utility Payments** | Recurring payment behaviour   | Timeliness, missed payments, payment consistency                     |
| 🟠 **GST**              | Merchant/business evidence    | Revenue consistency, filing patterns, GST-vs-transaction consistency |

**GST is primarily applicable to eligible merchant/business customers.**

The goal is not to collect more data.

> **The goal is to find better evidence.**

---

# 🛡️ Evidence Validation Comes Before AI

This is the core differentiator of our solution.

Before a customer receives a repayment-risk estimate, the system evaluates whether the available evidence is actually usable.

### Evidence Gate

```text
                    ┌─────────────────────┐
                    │  Customer Consent   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Data Ingestion    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Evidence Validation │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
         SUFFICIENT          LIMITED       INCONSISTENT
              │                │                │
              ▼                ▼                ▼
        ML Assessment     More Evidence     Manual Review
```

### Validation dimensions

* Consent validity
* History length
* Data completeness
* Cross-source consistency
* Behavioural stability
* Missing information
* Unusual behavioural patterns

### Evidence states

| State               | System Behaviour                     |
| ------------------- | ------------------------------------ |
| 🟢 **Sufficient**   | Proceed to repayment-risk assessment |
| 🟡 **Limited**      | Request additional information       |
| 🔴 **Inconsistent** | Manual verification required         |
| ⚪ **Insufficient**  | Do not manufacture a risk estimate   |

> **Our system is designed to know when it does not know enough.**

---

# 🤖 Machine Learning Pipeline

Once evidence passes the validation gate, the system converts raw financial behaviour into structured underwriting features.

```text
Validated Evidence
        │
        ▼
Feature Engineering
        │
        ▼
Logistic Regression
Baseline Model
        │
        ▼
XGBoost
Candidate Model
        │
        ▼
Model Evaluation
        │
        ▼
Probability Calibration
        │
        ▼
Repayment-Risk Probability
        │
        ▼
Explanation + Recommended Action
```

### Model philosophy

We do not assume that a more complex model is automatically better.

The system evaluates:

* ROC-AUC
* PR-AUC
* Precision
* Recall
* F1
* Brier Score
* Probability calibration
* Stability across customer segments

If a simpler model performs comparably, **simplicity and interpretability matter.**

---

# 🔎 Explainability

A credit officer should not receive:

> `Risk Score = 0.18`

and be expected to trust it.

Instead, the system provides:

### Risk Estimate

**Estimated repayment probability**

### Positive Factors

* Regular digital inflows
* Consistent utility payments
* Stable transaction behaviour

### Risk Factors

* Recent income volatility
* Unusual transaction spike
* Limited evidence history

### Explanation Layer

We use **SHAP** to understand model contribution and translate the output into human-readable factors.

> **SHAP explains model behaviour; it does not establish causality or fairness.**

---

# 🚨 Behavioural Anomaly Detection

Alternative data can contain unusual patterns.

For example:

```text
Historical UPI inflow
₹20K — ₹35K / month

              ↓

Current period
₹91K

              ↓

Behavioural Anomaly ⚠
```

The system does **not** label this as fraud.

Instead:

> **Behavioral Anomaly Flagged**

The officer can investigate the underlying evidence before making a lending decision.

---

# 👤 Human-in-the-Loop Underwriting

Our AI does **not** approve or reject loans.

It provides structured evidence to the person responsible for the lending decision.

```text
                    AI SYSTEM
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
     Evidence        Risk Estimate   Explanation
        │               │               │
        └───────────────┼───────────────┘
                        ▼
                Recommended Action
                        │
                        ▼
                ┌───────────────┐
                │ LOAN OFFICER  │
                │ / UNDERWRITER │
                └───────┬───────┘
                        │
                        ▼
                 FINAL DECISION
```

### Possible recommendations

* **PROCEED TO FURTHER UNDERWRITING**
* **REQUEST ADDITIONAL INFORMATION**
* **MANUAL VERIFICATION REQUIRED**
* **ENHANCED UNDERWRITING REVIEW**

The final sanction decision remains with the human underwriting process.

---

# 🖥️ Product Experience

## 01 — Customer Portal

Designed around transparency and consent.

**Key capabilities**

* Alternative-data consent
* Source-level permissions
* Purpose visibility
* Assessment status
* Data activity preview
* Consent revocation
* Privacy-aware information display

---

## 02 — Loan Officer Portal ⭐

The primary decision-support workspace.

### Officer sees:

**Customer Profile**

→ Traditional evidence
→ Alternative evidence
→ Evidence quality
→ Repayment-risk estimate
→ Confidence/evidence status
→ Positive factors
→ Risk factors
→ Behavioural anomalies
→ Recommended next action
→ Underwriting checklist
→ Decision notes
→ Audit history

### Design principle

> **One customer. One evidence view. One explainable decision-support workflow.**

---

## 03 — Admin & Risk Manager Portal

Designed for governance and model oversight.

### Capabilities

* Model comparison
* Performance metrics
* Calibration monitoring
* Evidence-quality distribution
* Anomaly analytics
* Configurable prototype thresholds
* Model version visibility
* Audit logs
* Governance monitoring
* Prototype-to-production roadmap

---

# 🧪 Proof of Concept

The prototype demonstrates the complete journey:

```text
Customer
   ↓
Consent
   ↓
Alternative Data
   ↓
Evidence Validation
   ↓
Feature Engineering
   ↓
ML Risk Assessment
   ↓
SHAP Explanation
   ↓
Recommended Action
   ↓
Loan Officer
   ↓
Human Underwriting
```

### Demo personas

| Customer                               | Evidence State            | System Behaviour                      |
| -------------------------------------- | ------------------------- | ------------------------------------- |
| **Ravi Kumar** — Gig Worker            | `SUFFICIENT WITH WARNING` | Proceed to Further Underwriting       |
| **Priya Sharma** — First-time Salaried | `LIMITED EVIDENCE`        | Request Additional Information        |
| **Arjun Traders** — Merchant           | `SUFFICIENT`              | Proceed to Further Underwriting       |
| **Vikram Patel** — Contractor          | `INCONSISTENT EVIDENCE`   | Manual Verification Required          |
| **Suresh Nair** — Auto Driver          | `INSUFFICIENT EVIDENCE`   | No ML estimate; request more evidence |

---

# 🧩 The Most Important Scenario

Consider a customer with only **15 days of alternative transaction history**.

A conventional system may be tempted to force an assessment.

Our system does something different:

```text
15 Days of Evidence
       ↓
Evidence Gate
       ↓
INSUFFICIENT EVIDENCE
       ↓
No Risk Score
       ↓
Request Additional Information
       ↓
Human Review
```

### Why?

Because:

> **A lack of evidence is not evidence of high risk.**

This is the central responsible-AI principle behind the solution.

---

# ⚖️ Risk ≠ Affordability

A critical design decision in our architecture is keeping these concepts separate.

### Our alternative-data layer focuses on:

**Repayment-related behavioural signals**

while existing underwriting can continue evaluating:

* Affordability
* Existing obligations
* Loan amount
* Policy criteria
* Debt burden / FOIR
* Traditional bureau information
* Required verification

We do not create an artificial affordability calculation simply because alternative data is available.

---

# 📊 How We Prove the Solution Works

A strong model score alone is not enough.

The key experiment is:

### Baseline

**Existing underwriting information**

versus

### Enhanced

**Existing underwriting information + validated alternative data**

```text
                Does Alternative Data
                Add Incremental Value?
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
      BASELINE                       ENHANCED
 Existing Information       Existing + Alternative Data
          │                             │
          └──────────────┬──────────────┘
                         ▼
                 Compare Outcomes
```

### Evaluation areas

* Incremental predictive performance
* Calibration
* False positives
* False negatives
* Thin-file customer performance
* Segment stability
* Fairness
* Robustness
* Behavioural drift
* Operational usefulness

> **The proof is not a pretty AUC. The proof is measurable incremental value.**

---

# 🔐 Security & Privacy by Design

The platform is designed around controlled access to financial evidence.

### Security principles

* Role-Based Access Control
* Customer-level authorization
* Consent-driven data access
* Password protection
* Signed session tokens
* Parameterized database queries
* Input validation
* Sensitive-data masking
* Restricted administrative access
* Audit logging
* Environment-based secrets
* Consent revocation controls

### Privacy principles

**Consent → Purpose Limitation → Data Minimization → Controlled Access → Revocation → Auditability**

We do not treat alternative financial data as something that should simply be collected because it is available.

---

# 🏗️ Technical Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                    CUSTOMER PORTAL                      │
│              Consent & Transparency Layer               │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 ALTERNATIVE DATA LAYER                  │
│             UPI │ Utility │ GST (Merchants)             │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 EVIDENCE VALIDATION                     │
│ Consent │ Completeness │ History │ Consistency │ Anomaly│
└──────────────────────────┬──────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
                Insufficient   Sufficient
                    │             │
                    ▼             ▼
             More Evidence     ML Pipeline
                                  │
                                  ▼
                        Logistic Regression
                                  │
                                  ▼
                              XGBoost
                                  │
                                  ▼
                             Calibration
                                  │
                                  ▼
                       Repayment-Risk Estimate
                                  │
                                  ▼
                         SHAP Explanation
                                  │
                                  ▼
                       Recommended Action
                                  │
                                  ▼
                        Loan Officer Portal
                                  │
                                  ▼
                         Human Underwriter
```

---

# 🛠️ Technology Stack

| Layer           | Technology                            |
| --------------- | ------------------------------------- |
| Frontend        | React + Vite                          |
| UI              | Tailwind CSS                          |
| Backend         | Python + FastAPI                      |
| Database        | SQLite — Prototype                    |
| Data Processing | Pandas + NumPy                        |
| ML              | Scikit-learn + XGBoost                |
| Explainability  | SHAP                                  |
| APIs            | REST                                  |
| Authentication  | Role-based session/token architecture |
| Charts          | Recharts / Chart.js                   |

---

# 📁 Project Structure

```text
TVS-Credit-Decision-Engine/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── utils/
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── ml/
│   │   ├── schemas/
│   │   └── database/
│   └── requirements.txt
│
├── ml/
│   ├── data/
│   ├── generate_data.py
│   ├── feature_engineering.py
│   ├── train_logistic.py
│   ├── train_xgboost.py
│   ├── evaluate.py
│   └── saved_models/
│
├── data/
├── database/
├── docs/
│   ├── architecture.md
│   ├── model_notes.md
│   ├── api.md
│   └── security_and_privacy.md
│
├── README.md
└── requirements.txt
```

---

# 🚀 Getting Started

## Prerequisites

* Python 3.10+
* Node.js 18+
* npm

## Backend

```bash
cd backend

pip install -r requirements.txt

python -m uvicorn app.main:app --port 8000 --reload
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Application:

```text
http://localhost:5173
```

## Tests

```bash
pytest backend/tests -v
```

---

# 🔑 Demo Access

> **Prototype credentials only — not production credentials.**

| Role            | Email                    | Password   |
| --------------- | ------------------------ | ---------- |
| Loan Officer    | `officer@tvscredit.demo` | `demo123`  |
| Admin / CRO     | `admin@tvscredit.demo`   | `admin123` |
| Customer — Ravi | `ravi@customer.demo`     | `demo123`  |

---

# 📈 Prototype → Production

The prototype is intentionally designed as a foundation rather than a claim of production readiness.

### Phase 01 — Prototype

Synthetic data + working decision-support platform.

### Phase 02 — Workflow Validation

Validate the actual retailer and underwriting workflow with field observations.

### Phase 03 — Secure Data Integration

Integrate consented, production-grade alternative data sources.

### Phase 04 — Outcome Validation

Train and validate against real historical repayment outcomes.

### Phase 05 — Incremental Value Testing

Compare existing underwriting against existing + alternative evidence.

### Phase 06 — Controlled Pilot

Human-in-the-loop deployment with monitoring and governance.

### Phase 07 — Production Monitoring

Monitor:

* Calibration
* Drift
* Segment stability
* Error costs
* Fairness
* Anomalies
* Model performance
* Operational outcomes

---

# ⚠️ Responsible Prototype Disclosure

This project is a **proof of concept**.

### Synthetic Data

Prototype data is synthetic.

Therefore:

> **Model metrics demonstrate the methodology and workflow, not production credit performance.**

### Thresholds

Any evidence thresholds shown in the prototype are:

> **Prototype policy thresholds — to be validated and tuned using real TVS repayment outcomes.**

### Decision Authority

This system is:

> **A decision-support assessment, not an automated loan approval.**

### Explainability

> **SHAP explains model behaviour; it does not establish causality or fairness.**

### Anomalies

> **Anomaly flags are investigation signals, not fraud determinations.**

---

# 📚 Documentation

* [`Architecture & Design`](docs/architecture.md)
* [`ML & Explainability`](docs/model_notes.md)
* [`REST API`](docs/api.md)
* [`Security & Privacy`](docs/security_and_privacy.md)

---

# 👥 Team 404 NOT FOUND

| Role            | Member         |
| --------------- | -------------- |
| **Team Lead**   | Dharanikumar S |
| **Team Member** | Jawahar Ram S  |

### Project

**Evidence-Based Alternative Credit Underwriting**

### Process Chosen

**Credit Assessment & Underwriting**

---

# 🌱 Why This Matters

Financial inclusion should not mean lowering the standard for credit decisions.

It should mean improving the **evidence available to make those decisions responsibly.**

Our approach is simple:

> **More evidence.
> Better understanding.
> Explainable risk.
> Human judgment.**

And when the evidence still isn't enough:

> **We don't manufacture confidence.**

---

<p align="center">

### New-to-credit doesn't mean high-risk.

### It means there isn't enough traditional evidence.

**404 NOT FOUND · TVS Credit E.P.I.C. Case Study Challenge · Round 2**

</p>
