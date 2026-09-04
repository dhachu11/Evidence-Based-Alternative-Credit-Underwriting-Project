import os
import sqlite3
import hashlib
import hmac
import json
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "database", "tvs_credit.db")
SECRET_KEY = os.getenv("TVS_APP_SECRET", "tvs-credit-decision-engine-hackathon-secret-key-2026")

def get_db_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str) -> str:
    """Secure SHA-256 with project salt for prototype authentication."""
    salt = "tvs_credit_salt_secure_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hmac.compare_digest(hash_password(plain_password), hashed_password)

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users Table (RBAC with hashed credentials)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        name TEXT NOT NULL,
        branch TEXT,
        customer_id TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # Customers Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        customer_type TEXT NOT NULL,
        phone TEXT NOT NULL,
        location TEXT NOT NULL,
        bureau_status TEXT NOT NULL,
        headline TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # Consents Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS consents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id TEXT NOT NULL,
        upi_allowed INTEGER NOT NULL DEFAULT 1,
        utility_allowed INTEGER NOT NULL DEFAULT 1,
        gst_allowed INTEGER NOT NULL DEFAULT 0,
        data_period_days INTEGER NOT NULL DEFAULT 90,
        purpose TEXT NOT NULL DEFAULT 'Credit assessment',
        consent_status TEXT NOT NULL DEFAULT 'ACTIVE',
        updated_at TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
    """)

    # UPI Transactions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS upi_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id TEXT NOT NULL,
        date TEXT NOT NULL,
        amount REAL NOT NULL,
        transaction_type TEXT NOT NULL,
        category TEXT,
        counterparty TEXT,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
    """)

    # Utility Payments Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS utility_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id TEXT NOT NULL,
        bill_type TEXT NOT NULL,
        due_date TEXT NOT NULL,
        payment_date TEXT,
        amount REAL NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
    """)

    # GST Records Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS gst_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id TEXT NOT NULL,
        filing_month TEXT NOT NULL,
        filing_date TEXT,
        turnover_amount REAL NOT NULL,
        tax_paid REAL NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
    """)

    # Assessments Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id TEXT NOT NULL,
        evidence_status TEXT NOT NULL,
        evidence_quality_score REAL,
        risk_probability REAL,
        risk_band TEXT,
        recommendation TEXT NOT NULL,
        explanation_json TEXT,
        metrics_json TEXT,
        anomaly_flags_json TEXT,
        checklist_json TEXT,
        underwriter_decision TEXT,
        underwriter_notes TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
    """)

    # Audit Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        user_role TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT DEFAULT '127.0.0.1',
        timestamp TEXT NOT NULL
    )
    """)

    # Threshold Configuration Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS threshold_config (
        key TEXT PRIMARY KEY,
        value REAL NOT NULL,
        description TEXT
    )
    """)

    # Retailer Workflow Insights (Round 2 editable placeholder)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS retailer_insights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        current_workflow TEXT,
        manual_verification_steps TEXT,
        documents_requested TEXT,
        typical_delay_hours REAL,
        information_gap TEXT,
        observed_bottleneck TEXT,
        updated_at TEXT NOT NULL
    )
    """)

    # Seed Default Users
    now_str = datetime.now().isoformat()
    demo_users = [
        ("OFFICER-01", "officer@tvscredit.demo", hash_password("demo123"), "loan_officer", "Arunachalam S. (Branch Underwriter)", "Coimbatore Main", None),
        ("ADMIN-01", "admin@tvscredit.demo", hash_password("admin123"), "admin", "Lakshmi Narayanan (Chief Risk Officer)", "Corporate Risk HQ", None),
        ("CUST-101-USER", "ravi@customer.demo", hash_password("demo123"), "customer", "Ravi Kumar", "Coimbatore", "CUST-101"),
        ("CUST-102-USER", "priya@customer.demo", hash_password("demo123"), "customer", "Priya Sharma", "Tiruppur", "CUST-102"),
        ("CUST-103-USER", "arjun@customer.demo", hash_password("demo123"), "customer", "M. Arjun (Arjun Traders)", "Madurai", "CUST-103"),
        ("CUST-105-USER", "suresh@customer.demo", hash_password("demo123"), "customer", "Suresh Nair", "Chennai", "CUST-105"),
    ]
    for uid, email, p_hash, role, name, branch, cid in demo_users:
        cursor.execute("""
        INSERT OR IGNORE INTO users (id, email, password_hash, role, name, branch, customer_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (uid, email, p_hash, role, name, branch, cid, now_str))

    # Seed Default Thresholds
    default_thresholds = [
        ("min_sufficient_days", 90.0, "Minimum history days for SUFFICIENT evidence"),
        ("min_limited_days", 30.0, "Minimum history days for LIMITED evidence (below is INSUFFICIENT)"),
        ("min_completeness_rate", 0.80, "Minimum data completeness ratio required (80%)"),
        ("anomaly_zscore_threshold", 2.5, "Standard deviation multiplier for behavioral anomaly flags"),
        ("low_risk_repayment_prob", 0.75, "Probability cutoff for Low-Medium risk recommendation")
    ]
    for key, val, desc in default_thresholds:
        cursor.execute("INSERT OR IGNORE INTO threshold_config (key, value, description) VALUES (?, ?, ?)", (key, val, desc))

    # Seed Default Retailer Insight
    cursor.execute("SELECT COUNT(*) FROM retailer_insights")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO retailer_insights (
            title, current_workflow, manual_verification_steps, documents_requested,
            typical_delay_hours, information_gap, observed_bottleneck, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "Two-Wheeler & Consumer Durable In-Store Underwriting",
            "Retailer collects physical copies of electricity bill, passbook stamp, and Aadhaar; officer manually calls borrower reference.",
            "Visual check of bank stamp; physical verification of shop location for self-employed; phone verification of landlord.",
            "6-month physical bank passbook, Electricity bill of past 2 months, Rent agreement, Shop license photo",
            36.0,
            "No digital verification of cash/UPI velocity; passbooks often have months of missing entries or manual handwriting.",
            "High turnaround time (24-48 hrs) causing customer drop-off at dealer point of sale; lack of verifiable income trail for delivery workers.",
            now_str
        ))

    conn.commit()
    conn.close()

def log_audit(user_id: str, user_role: str, action: str, details: str = ""):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO audit_logs (user_id, user_role, action, details, timestamp) VALUES (?, ?, ?, ?, ?)",
            (user_id, user_role, action, details, datetime.now().isoformat())
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[AUDIT ERROR] {e}")
