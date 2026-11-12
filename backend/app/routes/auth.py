# backend/app/routes/auth.py
from fastapi import APIRouter, HTTPException, status
from app.models import UserCreate, UserResponse
from app.database import supabase
from uuid import uuid4
from datetime import datetime

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    # 1. Register with Supabase Auth (Email or Phone)
    # For MVP, we mock the Supabase Auth call if not configured
    try:
        # In production: response = supabase.auth.sign_up({"email": user.email, "password": user.password})
        # 2. Create profile in public.users
        new_user = {
            "id": str(uuid4()), # This would be the auth.uid()
            "phone_number": user.phone_number,
            "full_name": user.full_name,
            "role": user.role,
            "created_at": datetime.now().isoformat()
        }
        # supabase.table("users").insert(new_user).execute()
        return new_user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(credentials: dict):
    # Mock login logic
    # In production: response = supabase.auth.sign_in_with_password(credentials)
    return {"access_token": "mock_token", "token_type": "bearer"}
