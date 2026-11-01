from fastapi import APIRouter, HTTPException
from models.user import User, UserLogin, UpdateUser
from db import database
from utils import get_hashed_password, check_password, create_jwt_token
from uuid import uuid4

router = APIRouter()

@router.post("/sign-up", response_model = dict)
async def create_user(user: User):
    existing_user = database.get_collection("users").count_documents({"email": user.email}) > 0
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    user.password = get_hashed_password(user.password)
    user.user_id = str(uuid4())
    print(user)
    result = database.get_collection("users").insert_one(user.dict())
    print(f"User created successfully. id: {result}")
    return {
        "status": "success",
        "message": "User created successfully",
        "data": {
            "id": user.user_id,
            "email": user.email
        }
    }

@router.post("/login", response_model=dict)
async def login_user(payload: UserLogin):
    user = database.get_collection("users").find_one({"email": payload.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found! Please signup!")
    if not check_password(user["password"], payload.password):
        raise HTTPException(status_code=401, detail="Unauthorized! Invalid password")
    
    return {
        "status": "success",
        "message": "Login successful!",
        "data": {
            "id": str(user["user_id"]),
            "email": user["email"],
            "token": create_jwt_token({"email": user["email"], "user_id": user["user_id"]})
        }
    }

@router.get("/")
async def get_users():
    users = list(database.get_collection("users").find({}, {"_id": 0}))
    return {
        "status": "success",
        "message": "Users list fetched successfully!",
        "data": users
    }

@router.put("/{user_id}")
async def update_user(user_id: str, request: UpdateUser):
    user = database.get_collection("users").find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found!")
    if (not request.name) or (not request.bio) or (not request.name):
        raise HTTPException(status_code=400, detail="User details required!")
    update_user = {}
    if request.name:
        update_user["name"] = request.name
    if request.bio:
        update_user["bio"] = request.bio
    if request.email:
        update_user["email"] = request.email
    
    latest_user = database.get_collection("users").find_one_and_update(
        {"user_id": user_id},
        {"$set": update_user},
        return_document=True
    )

    return {
        "status": "success",
        "message": "User details updated successfully!",
        "data": latest_user
    }
