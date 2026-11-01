import jwt
from fastapi import HTTPException
from datetime import datetime, timedelta
import bcrypt

KEY = "collaboration-hub"

def create_jwt_token(data: dict) -> str:
    payload = {
        "email": data.get("email"),
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    token = jwt.encode(payload, KEY, algorithm="HS256")
    return token

def decode_jwt_token(token:str) -> dict:
    try:
        payload = jwt.decode(token, KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def validate_jwt_token(token:str) -> dict:
    try:
        jwt.decode(token, KEY, algorithms=["HS256"])
        return True
    except jwt.ExpiredSignatureError as e:
        print(e)
        return False
    except jwt.InvalidTokenError as e:
        print(e)
        return False

def get_hashed_password(password:str) -> str:
    bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(bytes, salt)
    return hashed_password.decode("utf-8")

def check_password(hashed_password: str, password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))