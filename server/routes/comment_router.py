from fastapi import APIRouter, HTTPException, Header
from models.comment import Comment
from db import database
from utils import decode_jwt_token
from datetime import datetime
from uuid import uuid4

comment_router = APIRouter()

@comment_router.post("/create", response_model=dict)
async def create_comment(comment: Comment, authorization: str = Header(None)):
    post = database.get_collection("posts").find_one({"post_id": comment.post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found!")
    
    user_details = decode_jwt_token(authorization)

    comment_data = comment.dict()
    comment_data["comment_id"] = str(uuid4())
    comment_data["created_by"] = user_details.get("email")
    comment_data["created_at"] = datetime.now()

    result = database.get_collection("comments").insert_one(comment_data)

    if not result.acknowledged:
        raise HTTPException(status_code=500, detail="Failed to create comment")

    comment_author = comment_data["created_by"]
    post_owner = post.get("created_by")
    if post_owner and post_owner != comment_author:
        database.get_collection("notifications").update_one(
            {"comment_id": comment_data["comment_id"]},
            {"$setOnInsert": {
                "notification_id": str(uuid4()),
                "recipient_email": post_owner,
                "actor_email": comment_author,
                "type": "comment",
                "post_id": comment.post_id,
                "comment_id": comment_data["comment_id"],
                "text": f"{comment_author} commented on your post",
                "created_at": comment_data["created_at"],
                "read": False,
            }},
            upsert=True,
        )
    
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