import urllib.request
import json

def post_json(url, payload, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers=headers
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def get_json(url, token=None):
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

print("1. Health Check:", get_json("http://127.0.0.1:8000/api/health"))

# Authenticate as Loan Officer
login_res = post_json("http://127.0.0.1:8000/api/auth/login", {"email": "officer@tvscredit.demo", "password": "demo123"})
officer_token = login_res["token"]
print("\n[Auth] Successfully logged in as Loan Officer:", login_res["user"]["name"])

print("\n2. Customer Listing:")
custs = get_json("http://127.0.0.1:8000/api/customers", token=officer_token)
for c in custs["customers"]:
    print(f" - {c['id']}: {c['name']} ({c['customer_type']}) | Bureau: {c['bureau_status']}")

print("\n3. Testing Personas Assessments:")
for cid in ["CUST-101", "CUST-102", "CUST-103", "CUST-104", "CUST-105"]:
    res = post_json(f"http://127.0.0.1:8000/api/assessment/{cid}", {"preferred_model": "xgboost"}, token=officer_token)
    print(f" [{cid}] Status: {res['evidence_status']} | ML Allowed: {res['can_score_ml']} | Prob: {res.get('risk_probability')} | Action: {res['recommendation']}")

# Authenticate as Admin for Metrics
admin_login = post_json("http://127.0.0.1:8000/api/auth/login", {"email": "admin@tvscredit.demo", "password": "admin123"})
admin_token = admin_login["token"]

print("\n4. Admin Metrics:")
metrics = get_json("http://127.0.0.1:8000/api/admin/metrics", token=admin_token)
print(" Model Version:", metrics["model_version"])
print(" XGBoost ROC-AUC:", metrics["ml_evaluation"]["xgboost"]["roc_auc"])
print(" Logistic ROC-AUC:", metrics["ml_evaluation"]["logistic_regression"]["roc_auc"])
print(" Selected Model:", metrics["ml_evaluation"]["selected_model"])

