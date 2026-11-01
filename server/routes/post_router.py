from fastapi import APIRouter, HTTPException, Form, UploadFile, Header, File
from db import database
from utils import decode_jwt_token
from uuid import uuid4
from cloudinary_util import upload_file
import json
from datetime import datetime

post_router = APIRouter()


@post_router.post("/create", response_model=dict)
async def create_post(
    type: str = Form(...),
    title: str = Form(...),
    content: str = Form(...),
    tags: str = Form(None), 
    file: UploadFile = File(None),
    authorization: str = Header(None)
):
    user_details = decode_jwt_token(authorization)
    tags_list = []

    if tags:
        try:
            tags_list = json.loads(tags)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid tags format. Use json list")

    file_url = None
    if file:
        file_url = upload_file(file.file)
        if not file_url:
            raise HTTPException(status_code=500, detail="Failed to upload file to cloudinary")
        
    post_data = {
        "type": type,
        "title": title,
        "content": content,
        "file_url": file_url,
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
            "file_url": post_data["file_url"]
        }
    }
    
@post_router.get("/all", response_model=dict)
async def get_posts():
    posts = list(database.get_collection("posts").find({}, {"_id": 0}))
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