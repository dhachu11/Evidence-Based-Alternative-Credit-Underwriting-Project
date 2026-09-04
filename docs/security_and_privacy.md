# TVS Credit Decision Engine — Security, Privacy & Compliance Architecture

## 1. Authentication & Cryptography
- **Password Hashing:** Passwords are cryptographically salted and hashed using SHA-256 (`hashlib` / `hmac.compare_digest`). No plaintext passwords are ever stored.
- **Signed Session Tokens:** Bearer tokens are HMAC-SHA256 signed with server-side secrets. Tampered or expired tokens are rejected immediately with `401 Unauthorized`.
- **Environment Isolation:** Secrets are read from environment variables (`TVS_APP_SECRET`) with secure fallback defaults.

---

## 2. Role-Based Access Control (RBAC) & Boundary Enforcement
The platform enforces 3 strict security roles:
1. `customer`: Can **only** read and modify their own customer record and consent permissions. Access to other customer IDs or admin endpoints is blocked with `403 Forbidden`.
2. `loan_officer`: Authorized to search consented borrowers, execute assessments, and log underwriting decisions. Admin threshold editing is blocked with `403 Forbidden`.
3. `admin`: Full system oversight, threshold tuning, and audit log inspection.

---

## 3. Privacy by Design & Data Minimization
- **Masked Phone Numbers:** Borrower contact numbers are masked in all standard views (e.g. `+91 98401 •••••`).
- **Granular Consent Enforcement:** When a borrower revokes permission for a specific stream (e.g. UPI or Utility) or revokes all consent, the Evidence Validation Layer immediately excludes those data records from subsequent assessments.
- **Purpose Limitation:** All alternative data usage is declared strictly for *"Credit assessment"* with clear 90-day time scoping.
- **No Unnecessary Personal Data in Logs:** Audit records log user actions, IDs, and timestamps without dumping raw financial transactions.

---

## 4. Input Validation & Defense in Depth
- **SQL Injection Prevention:** All database operations use parameterized SQLite queries via standard DBAPI bindings. No raw string interpolation is used.
- **Payload Validation:** Every REST request is validated against strict Pydantic schemas.
- **Sanitized Error Handling:** Server errors return sanitized error messages without leaking stack traces, filesystem paths, or internal database metadata to the client.
