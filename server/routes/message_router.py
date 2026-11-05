from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Header, HTTPException

from db import database
from models.message import MessageCreate
from utils import decode_jwt_token

message_router = APIRouter()


def current_email(authorization: str) -> str:
    return decode_jwt_token(authorization)["email"]


@message_router.get("/users", response_model=dict)
async def get_message_users(authorization: str = Header(None)):
    email = current_email(authorization)
    users = list(database.get_collection("users").find(
        {"email": {"$ne": email}},
        {"_id": 0, "email": 1, "name": 1},
    ))
    return {"status": "success", "data": users}


@message_router.get("/{other_email}", response_model=dict)
async def get_messages(other_email: str, authorization: str = Header(None)):
    email = current_email(authorization)
    if email == other_email:
        raise HTTPException(status_code=400, detail="Cannot message yourself")
    if not database.get_collection("users").find_one({"email": other_email}):
        raise HTTPException(status_code=404, detail="User not found")
    messages = list(database.get_collection("messages").find({
        "$or": [
            {"sender_email": email, "receiver_email": other_email},
            {"sender_email": other_email, "receiver_email": email},
        ],
        }, {"_id": 0}).sort("created_at", 1))
    return {"status": "success", "data": messages}


@message_router.post("/", response_model=dict)
async def send_message(message: MessageCreate, authorization: str = Header(None)):
    sender_email = current_email(authorization)
    if sender_email == message.receiver_email:
        raise HTTPException(status_code=400, detail="Cannot message yourself")
    receiver = database.get_collection("users").find_one({"email": message.receiver_email})
    if not receiver:
        raise HTTPException(status_code=404, detail="User not found")
    if not message.content.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    document = {
        "message_id": str(uuid4()),
        "sender_email": sender_email,
        "receiver_email": message.receiver_email,
        "content": message.content.strip(),
        "created_at": datetime.utcnow(),
    }
    database.get_collection("messages").insert_one(document)
    return {"status": "success", "data": document}
