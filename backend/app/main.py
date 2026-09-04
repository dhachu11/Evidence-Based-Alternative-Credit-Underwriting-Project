import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

# Ensure parent path is in pythonpath
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.database import init_db, get_db_connection
from app.services.data_ingestion import seed_demo_data
from app.api import auth, customer, consent, assessment, admin

app = FastAPI(
    title="TVS Credit — Evidence-Based Alternative Credit Decision Engine API",
    description="Enterprise-grade decision support platform providing evidence validation, feature engineering, calibrated ML risk estimation, SHAP explainability, and underwriter action recommendations.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(customer.router, prefix="/api")
app.include_router(consent.router, prefix="/api")
app.include_router(assessment.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

@app.on_event("startup")
def on_startup():
    print("[INIT] Initializing SQLite database and schema...")
    init_db()
    
    # Check if DB has customers, if not seed demo data
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM customers")
    count = c.fetchone()[0]
    conn.close()
    
    if count == 0:
        print("[SEED] Seeding initial demo personas...")
        seed_demo_data()
    else:
        print(f"[OK] Database online with {count} customer profiles.")

@app.get("/api/health")
def health_check():
    # Verify DB connectivity
    db_status = "UNKNOWN"
    cust_count = 0
    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT COUNT(*) FROM customers")
        cust_count = c.fetchone()[0]
        conn.close()
        db_status = "ONLINE"
    except Exception as e:
        db_status = f"ERROR: {str(e)}"

    # Verify ML model existence
    models_dir = os.path.join(os.path.dirname(__file__), "ml", "saved_models")
    xgb_exists = os.path.exists(os.path.join(models_dir, "xgboost_model.joblib"))
    lr_exists = os.path.exists(os.path.join(models_dir, "logistic_model.joblib"))
    metrics_exists = os.path.exists(os.path.join(models_dir, "model_metrics.json"))
    
    ml_status = "LOADED" if (xgb_exists and lr_exists) else "BENCHMARK_FALLBACK"

    return {
        "status": "online",
        "service": "TVS Credit Evidence-Based Decision Engine API",
        "version": "1.0.0",
        "database": {
            "status": db_status,
            "customer_records": cust_count
        },
        "ml_subsystem": {
            "status": ml_status,
            "models_available": ["Calibrated XGBoost v1.0", "Logistic Regression Baseline"] if (xgb_exists and lr_exists) else ["Heuristic Prototype"],
            "metrics_available": metrics_exists
        },
        "server_time": datetime.now().isoformat(),
        "disclaimer": "Prototype uses synthetic data. Model metrics demonstrate the methodology and workflow, not production credit performance."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
