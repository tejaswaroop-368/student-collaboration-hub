from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class Post(BaseModel):
    post_id: Optional[str]
    type: str
    title: str
    content: str
    file_url: Optional[str] = None
    tags: Optional[List[str]] = None
    created_by: Optional[str] = None
    created_at: Optional[datetime] = None