from datetime import datetime
from pydantic import BaseModel


class MessageCreate(BaseModel):
    receiver_email: str
    content: str


class Message(BaseModel):
    message_id: str
    sender_email: str
    receiver_email: str
    content: str
    created_at: datetime
