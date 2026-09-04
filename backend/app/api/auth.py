import hmac
import hashlib
import json
import base64
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, Header, status
from app.schemas.schemas import LoginRequest, LoginResponse
from app.database.database import get_db_connection, log_audit, verify_password, SECRET_KEY

router = APIRouter(prefix="/auth", tags=["Authentication & Security"])

def generate_signed_token(user_data: dict) -> str:
    """Generates an HMAC-signed token containing user claims."""
    payload = {
        "id": user_data["id"],
        "sub": user_data["id"],
        "email": user_data["email"],
        "role": user_data["role"],
        "name": user_data["name"],
        "customer_id": user_data.get("customer_id"),
        "exp": (datetime.now() + timedelta(hours=12)).isoformat()
    }
    payload_bytes = json.dumps(payload).encode('utf-8')
    payload_b64 = base64.urlsafe_b64encode(payload_bytes).decode('utf-8')
    signature = hmac.new(SECRET_KEY.encode('utf-8'), payload_b64.encode('utf-8'), hashlib.sha256).hexdigest()
    return f"tvs.{payload_b64}.{signature}"

def decode_token(token: str) -> dict:
    """Verifies HMAC signature and extracts user claims."""
    if not token or not token.startswith("tvs."):
        # Fallback for simple prototype legacy headers
        if token and token.startswith("demo-"):
            role = "loan_officer" if "officer" in token else ("admin" if "admin" in token else "customer")
            cid = "CUST-101" if "101" in token or "ravi" in token else None
            return {"sub": "DEMO-USER", "email": "demo@tvscredit.demo", "role": role, "customer_id": cid, "name": "Demo User"}
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token format")

    parts = token.split(".")
    if len(parts) != 3:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Malformed authentication token")

    _, payload_b64, signature = parts
    expected_sig = hmac.new(SECRET_KEY.encode('utf-8'), payload_b64.encode('utf-8'), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected_sig):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token signature verification failed")

    try:
        payload_bytes = base64.urlsafe_b64decode(payload_b64.encode('utf-8'))
        claims = json.loads(payload_bytes.decode('utf-8'))
        
        # Check expiration
        exp = datetime.fromisoformat(claims["exp"])
        if datetime.now() > exp:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication token has expired")
        return claims
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Token decode error: {str(e)}")

def get_current_user(authorization: str = Header(None)) -> dict:
    """Dependency to extract authenticated user claims from Authorization header."""
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication token missing. Please log in.")
    token = authorization.replace("Bearer ", "").strip()
    return decode_token(token)

def require_role(allowed_roles: list):
    """Dependency factory to enforce role-based access control (RBAC)."""
    def role_checker(user: dict = Depends(get_current_user)):
        if user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {', '.join(allowed_roles)}. Your role: {user.get('role')}."
            )
        return user
    return role_checker

@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest):
    email = req.email.strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user_row = cursor.fetchone()
    conn.close()

    if not user_row or not verify_password(req.password, user_row["password_hash"]):
        log_audit(email, "unknown", "FAILED_LOGIN_ATTEMPT", "Invalid email or password entered.")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials. Use officer@tvscredit.demo or admin@tvscredit.demo or ravi@customer.demo")

    user_info = {
        "id": user_row["id"],
        "email": user_row["email"],
        "role": user_row["role"],
        "name": user_row["name"],
        "branch": user_row["branch"],
        "customer_id": user_row["customer_id"]
    }
    
    token = generate_signed_token(user_info)
    log_audit(user_row["id"], user_row["role"], "USER_LOGIN", f"User {user_row['name']} logged in successfully as {user_row['role']}.")
    
    return LoginResponse(
        token=token,
        user=user_info
    )

@router.get("/me")
def get_current_user_profile(user: dict = Depends(get_current_user)):
    return {"user": user}
