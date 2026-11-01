from fastapi import APIRouter, HTTPException, Header
from models.comment import Comment
from db import database
from utils import decode_jwt_token
from datetime import datetime
from uuid import uuid4

comment_router = APIRouter()

@comment_router.post("/create", response_model=dict)
async def create_comment(comment: Comment, authorization: str = Header(None)):
    post_exists = database.get_collection("posts").count_documents({"post_id": comment.post_id}) > 0
    if not post_exists:
        raise HTTPException(status_code=404, detail="Post not found!")
    
    user_details = decode_jwt_token(authorization)

    comment_data = comment.dict()
    comment_data["comment_id"] = str(uuid4())
    comment_data["created_by"] = user_details.get("email")
    comment_data["created_at"] = datetime.now()

    result = database.get_collection("comments").insert_one(comment_data)

    if not result.acknowledged:
        raise HTTPException(status_code=500, detail="Failed to create comment")
    
    return {
        "status": "success",
        "message": "Comment created successfully",
        "data": {
            "comment_id": comment_data["comment_id"],
            "post_id": comment.post_id,
            "created_by": comment_data["created_by"],
            "created_at":comment_data["created_at"]
        }
    }