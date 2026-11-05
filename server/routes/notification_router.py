from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Header, HTTPException

from db import database
from utils import decode_jwt_token

notification_router = APIRouter()


def get_current_email(authorization: str):
    return decode_jwt_token(authorization)["email"]


@notification_router.get("/", response_model=dict)
async def get_notifications(authorization: str = Header(None)):
    email = get_current_email(authorization)
    notifications = list(
        database.get_collection("notifications").find(
            {"recipient_email": email},
            {"_id": 0},
        ).sort("created_at", -1)
    )
    return {
        "status": "success",
        "message": "Notifications fetched successfully!",
        "data": notifications,
    }


@notification_router.patch("/{notification_id}/read", response_model=dict)
async def mark_notification_read(
    notification_id: str,
    authorization: str = Header(None),
):
    email = get_current_email(authorization)
    result = database.get_collection("notifications").update_one(
        {
            "notification_id": notification_id,
            "recipient_email": email,
        },
        {"$set": {"read": True}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {
        "status": "success",
        "message": "Notification marked as read",
    }
