from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Comment(BaseModel):
    comment_id: Optional[str] = None
    post_id: str
    content: str
    created_by: Optional[str] = None
    created_at: Optional[datetime] = None
