from datetime import datetime, timedelta
import random
from app.database.database import get_db_connection

def seed_demo_data():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Clear existing tables for fresh demo consistency
    cursor.execute("DELETE FROM customers")
    cursor.execute("DELETE FROM consents")
    cursor.execute("DELETE FROM upi_transactions")
    cursor.execute("DELETE FROM utility_payments")
    cursor.execute("DELETE FROM gst_records")
    cursor.execute("DELETE FROM assessments")
    cursor.execute("DELETE FROM audit_logs")

    now = datetime.now()

    # 1. PERSONAS
    customers = [
        {
            "id": "CUST-101",
            "name": "Ravi Kumar",
            "customer_type": "Gig Worker",
            "phone": "+91 98401 23456",
            "location": "Coimbatore, Tamil Nadu",
            "bureau_status": "No meaningful bureau history (Thin File)",
            "headline": "Delivery Partner at Swiggy & Zepto. Steady 90-day daily payout trail with disciplined utility payment history."
        },
        {
            "id": "CUST-102",
            "name": "Priya Sharma",
            "customer_type": "Salaried First-Timer",
            "phone": "+91 97100 67890",
            "location": "Tiruppur, Tamil Nadu",
            "bureau_status": "No bureau record (Score: NH / -1)",
            "headline": "Junior Textile Merchandiser. 45 days of digital receipts with missing utility records."
        },
        {
            "id": "CUST-103",
            "name": "Arjun Traders (M. Arjun)",
            "customer_type": "Merchant",
            "phone": "+91 94432 11223",
            "location": "Madurai, Tamil Nadu",
            "bureau_status": "Thin Commercial Bureau (1 closed loan)",
            "headline": "Provisions & Kirana Store Owner. 90-day verified QR inflows with 100% on-time GST-3B filings."
        },
        {
            "id": "CUST-104",
            "name": "Vikram Patel",
            "customer_type": "Contractor",
            "phone": "+91 98840 55443",
            "location": "Salem, Tamil Nadu",
            "bureau_status": "No bureau record",
            "headline": "Sub-contractor. Severe 5x inflow spike combined with 2 consecutive unpaid utility bills."
        },
        {
            "id": "CUST-105",
            "name": "Suresh Nair",
            "customer_type": "Gig Worker",
            "phone": "+91 99620 99887",
            "location": "Chennai, Tamil Nadu",
            "bureau_status": "New to Credit (NTC)",
            "headline": "Auto Ride-hail Driver. Account opened recently with only 15 days of digital transaction records."
        }
    ]

    for c in customers:
        cursor.execute("""
        INSERT INTO customers (id, name, customer_type, phone, location, bureau_status, headline, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (c["id"], c["name"], c["customer_type"], c["phone"], c["location"], c["bureau_status"], c["headline"], (now - timedelta(days=100)).isoformat()))

    # 2. CONSENTS
    consents = [
        ("CUST-101", 1, 1, 0, 90, "Credit assessment", "ACTIVE"),
        ("CUST-102", 1, 1, 0, 90, "Credit assessment", "ACTIVE"),
        ("CUST-103", 1, 1, 1, 90, "Credit assessment", "ACTIVE"),
        ("CUST-104", 1, 1, 0, 90, "Credit assessment", "ACTIVE"),
        ("CUST-105", 1, 1, 0, 90, "Credit assessment", "ACTIVE"),
    ]
    for cid, upi, util, gst, period, purp, stat in consents:
        cursor.execute("""
        INSERT INTO consents (customer_id, upi_allowed, utility_allowed, gst_allowed, data_period_days, purpose, consent_status, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (cid, upi, util, gst, period, purp, stat, (now - timedelta(days=5)).isoformat()))

    # 3. ALTERNATIVE DATA SEEDING

    # --- CUSTOMER 101: Ravi Kumar (95 days stable gig worker + mild anomaly spike) ---
    for day in range(95, 0, -1):
        txn_date = (now - timedelta(days=day)).strftime("%Y-%m-%d")
        # Regular daily platform settlements (~₹1,050/day -> ₹31,500/month)
        if day % 7 != 0: # 6 days a week delivery work
            amt = random.uniform(1050, 1350)
            # In last 7 days, generate a mild festive festival bonus incentive ₹4,200
            if day in [3, 4]:
                amt = 4200.0
            cursor.execute("INSERT INTO upi_transactions (customer_id, date, amount, transaction_type, category, counterparty) VALUES (?, ?, ?, ?, ?, ?)",
                           ("CUST-101", txn_date, round(amt, 2), "credit", "Platform Settlement", "Swiggy / Bundl Tech"))
        # Regular expenses (~65% of income)
        if day % 2 == 0:
            cursor.execute("INSERT INTO upi_transactions (customer_id, date, amount, transaction_type, category, counterparty) VALUES (?, ?, ?, ?, ?, ?)",
                           ("CUST-101", txn_date, round(random.uniform(300, 650), 2), "debit", "Fuel & Living Expenses", "Indian Oil / Supermarket"))

    # Ravi's Utilities (3 regular on-time bills)
    for m in [3, 2, 1]:
        d_date = (now - timedelta(days=m*30)).strftime("%Y-%m-%d")
        p_date = (now - timedelta(days=m*30 - 2)).strftime("%Y-%m-%d")
        cursor.execute("INSERT INTO utility_payments (customer_id, bill_type, due_date, payment_date, amount, status) VALUES (?, ?, ?, ?, ?, ?)",
                       ("CUST-101", "TNEB Electricity", d_date, p_date, 1150.0, "PAID_ON_TIME"))
        cursor.execute("INSERT INTO utility_payments (customer_id, bill_type, due_date, payment_date, amount, status) VALUES (?, ?, ?, ?, ?, ?)",
                       ("CUST-101", "Jio Fiber Broadband", d_date, p_date, 699.0, "PAID_ON_TIME"))

    # --- CUSTOMER 102: Priya Sharma (45 days limited data, 1 missing bill) ---
    for day in range(45, 0, -1):
        txn_date = (now - timedelta(days=day)).strftime("%Y-%m-%d")
        if day in [40, 10]:
            cursor.execute("INSERT INTO upi_transactions (customer_id, date, amount, transaction_type, category, counterparty) VALUES (?, ?, ?, ?, ?, ?)",
                           ("CUST-102", txn_date, 24000.0, "credit", "Salary Inflow", "Textile Exporters Ltd"))
        if day % 4 == 0:
            cursor.execute("INSERT INTO upi_transactions (customer_id, date, amount, transaction_type, category, counterparty) VALUES (?, ?, ?, ?, ?, ?)",
                           ("CUST-102", txn_date, round(random.uniform(400, 1100), 2), "debit", "Retail UPI", "Supermarket"))
    cursor.execute("INSERT INTO utility_payments (customer_id, bill_type, due_date, payment_date, amount, status) VALUES (?, ?, ?, ?, ?, ?)",
                   ("CUST-102", "Electricity Board", (now - timedelta(days=35)).strftime("%Y-%m-%d"), (now - timedelta(days=33)).strftime("%Y-%m-%d"), 850.0, "PAID_ON_TIME"))
    cursor.execute("INSERT INTO utility_payments (customer_id, bill_type, due_date, payment_date, amount, status) VALUES (?, ?, ?, ?, ?, ?)",
                   ("CUST-102", "Piped Gas Connection", (now - timedelta(days=8)).strftime("%Y-%m-%d"), None, 450.0, "PENDING_RECORD"))

    # --- CUSTOMER 103: Arjun Traders (95 days Merchant with GST + QR collections) ---
    for day in range(95, 0, -1):
        txn_date = (now - timedelta(days=day)).strftime("%Y-%m-%d")
        # Merchant daily QR settlements
        qr_amt = random.uniform(3500, 6200)
        cursor.execute("INSERT INTO upi_transactions (customer_id, date, amount, transaction_type, category, counterparty) VALUES (?, ?, ?, ?, ?, ?)",
                       ("CUST-103", txn_date, round(qr_amt, 2), "credit", "Merchant UPI QR Settlement", "PhonePe Merchant"))
        if day % 2 == 0:
            cursor.execute("INSERT INTO upi_transactions (customer_id, date, amount, transaction_type, category, counterparty) VALUES (?, ?, ?, ?, ?, ?)",
                           ("CUST-103", txn_date, round(random.uniform(1500, 3200), 2), "debit", "Wholesale Supplier", "Hindustan Unilever Wholesale"))

    for m in [3, 2, 1]:
        m_str = (now - timedelta(days=m*30)).strftime("%Y-%m")
        f_date = (now - timedelta(days=m*30 - 15)).strftime("%Y-%m-%d")
        cursor.execute("INSERT INTO gst_records (customer_id, filing_month, filing_date, turnover_amount, tax_paid, status) VALUES (?, ?, ?, ?, ?, ?)",
                       ("CUST-103", m_str, f_date, round(random.uniform(125000, 145000), 2), round(random.uniform(6200, 7500), 2), "FILED_ON_TIME"))
        cursor.execute("INSERT INTO utility_payments (customer_id, bill_type, due_date, payment_date, amount, status) VALUES (?, ?, ?, ?, ?, ?)",
                       ("CUST-103", "Commercial Power Tariff", (now - timedelta(days=m*30)).strftime("%Y-%m-%d"), (now - timedelta(days=m*30 - 1)).strftime("%Y-%m-%d"), 3400.0, "PAID_ON_TIME"))

    # --- CUSTOMER 104: Vikram Patel (95 days, huge anomalous spike & defaulted utility) ---
    for day in range(95, 0, -1):
        txn_date = (now - timedelta(days=day)).strftime("%Y-%m-%d")
        if day > 15:
            if day % 5 == 0:
                cursor.execute("INSERT INTO upi_transactions (customer_id, date, amount, transaction_type, category, counterparty) VALUES (?, ?, ?, ?, ?, ?)",
                               ("CUST-104", txn_date, round(random.uniform(3000, 6000), 2), "credit", "Peer Transfer", "Individual"))
        else:
            # Sudden anomalous surge in last 2 weeks: ₹1,45,000 lump sum
            if day == 10:
                cursor.execute("INSERT INTO upi_transactions (customer_id, date, amount, transaction_type, category, counterparty) VALUES (?, ?, ?, ?, ?, ?)",
                               ("CUST-104", txn_date, 145000.0, "credit", "Unverified Lump Sum", "Unknown P2P Account"))
    cursor.execute("INSERT INTO utility_payments (customer_id, bill_type, due_date, payment_date, amount, status) VALUES (?, ?, ?, ?, ?, ?)",
                   ("CUST-104", "Electricity Board", (now - timedelta(days=60)).strftime("%Y-%m-%d"), None, 2800.0, "MISSED"))
    cursor.execute("INSERT INTO utility_payments (customer_id, bill_type, due_date, payment_date, amount, status) VALUES (?, ?, ?, ?, ?, ?)",
                   ("CUST-104", "Electricity Board", (now - timedelta(days=30)).strftime("%Y-%m-%d"), None, 3100.0, "MISSED"))

    # --- CUSTOMER 105: Suresh Nair (Only 15 days of data history) ---
    for day in range(15, 0, -1):
        txn_date = (now - timedelta(days=day)).strftime("%Y-%m-%d")
        if day % 2 == 0:
            cursor.execute("INSERT INTO upi_transactions (customer_id, date, amount, transaction_type, category, counterparty) VALUES (?, ?, ?, ?, ?, ?)",
                           ("CUST-105", txn_date, round(random.uniform(600, 1100), 2), "credit", "Ola Mobility Payout", "ANI Technologies"))
    cursor.execute("INSERT INTO utility_payments (customer_id, bill_type, due_date, payment_date, amount, status) VALUES (?, ?, ?, ?, ?, ?)",
                   ("CUST-105", "Mobile Postpaid", (now - timedelta(days=5)).strftime("%Y-%m-%d"), (now - timedelta(days=4)).strftime("%Y-%m-%d"), 399.0, "PAID_ON_TIME"))

    # 4. INITIAL AUDIT LOGS
    logs = [
        ("admin@tvscredit.demo", "admin", "SYSTEM_INIT", "Seeded 5 demo personas and initialized alternative credit decision engine."),
        ("officer@tvscredit.demo", "loan_officer", "VIEW_PORTAL", "Logged into Loan Officer Decision Support Portal."),
        ("ravi@customer.demo", "customer", "GRANT_CONSENT", "Ravi Kumar granted consent for UPI and Utility financial data (90-day scope).")
    ]
    for uid, urole, act, det in logs:
        cursor.execute("INSERT INTO audit_logs (user_id, user_role, action, details, timestamp) VALUES (?, ?, ?, ?, ?)",
                       (uid, urole, act, det, (now - timedelta(minutes=random.randint(10, 180))).isoformat()))

    conn.commit()
    conn.close()
    print("Database successfully seeded with 5 demo customer profiles!")

if __name__ == "__main__":
    from app.database.database import init_db
    init_db()
    seed_demo_data()
