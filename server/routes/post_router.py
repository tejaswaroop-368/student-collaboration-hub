from fastapi import APIRouter, HTTPException, Form, Header
from db import database
from utils import decode_jwt_token
from uuid import uuid4
import json
from datetime import datetime

post_router = APIRouter()


@post_router.post("/create", response_model=dict)
async def create_post(
    type: str = Form(...),
    title: str = Form(...),
    content: str = Form(...),
    tags: str = Form(None),
    authorization: str = Header(None)
):
    user_details = decode_jwt_token(authorization)
    tags_list = []

    if tags:
        try:
            tags_list = json.loads(tags)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid tags format. Use json list")

    post_data = {
        "type": type,
        "title": title,
        "content": content,
        "file_url": None,
        "likes": [],
        "post_id": str(uuid4()),
        "tags": tags_list,
        "created_by": user_details["email"],
        "created_at": datetime.now()
    }

    result = database.get_collection("posts").insert_one(post_data)
    if not result.acknowledged:
        raise HTTPException(status_code=500, detail="Failed to create post")
    
    return {
        "status": "success",
        "message": "Post created successfully!",
        "data": {
            "post_id": post_data["post_id"],
            "type": type,
            "title": title,
            "file_url": None
        }
    }
    
@post_router.get("/all", response_model=dict)
async def get_posts(authorization: str = Header(None)):
    email = decode_jwt_token(authorization)["email"]
    posts = list(database.get_collection("posts").find({}, {"_id": 0}))
    for post in posts:
        likes = post.get("likes", [])
        post["like_count"] = len(likes)
        post["liked"] = email in likes
    return {
        "status": "success",
        "message": "Posts fetched successfully!",
        "data": posts
    }

@post_router.get("/me", response_model=dict)
async def get_my_posts(authorization: str = Header(None)):
    user_details = decode_jwt_token(authorization)
    posts = list(
        database.get_collection("posts").find(
            {"created_by": user_details.get("email")}, {"_id": 0}
        )
    )
    return {
        "status": "success",
        "message": "Posts fetched successfully!",
        "data": posts
    }

@post_router.post("/{post_id}/like", response_model=dict)
async def toggle_like(post_id: str, authorization: str = Header(None)):
    email = decode_jwt_token(authorization)["email"]
    posts = database.get_collection("posts")
    post = posts.find_one({"post_id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found!")

    likes = post.get("likes", [])
    if email in likes:
        posts.update_one({"post_id": post_id}, {"$pull": {"likes": email}})
    else:
        posts.update_one({"post_id": post_id}, {"$addToSet": {"likes": email}})

    updated = posts.find_one({"post_id": post_id}, {"_id": 0})
    updated_likes = updated.get("likes", [])
    return {
        "status": "success",
        "message": "Like updated",
        "data": {
            "like_count": len(updated_likes),
            "liked": email in updated_likes,
        },
    }

@post_router.get("/{post_id}/comments", response_model=dict)
async def get_comments(post_id: str):
    post_exists = database.get_collection("posts").count_documents({"post_id": post_id}) > 0
    if not post_exists:
        raise HTTPException(status_code=404, detail="Post not found!")
    comments = list(database.get_collection("comments").find({"post_id": post_id}, {"_id": 0}))
    
    return {
        "status": "success",
        "message": "Comments fetched successfully!",
        "data": comments
    }