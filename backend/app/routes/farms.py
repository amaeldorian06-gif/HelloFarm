# backend/app/routes/farms.py
from fastapi import APIRouter, HTTPException, Depends
from app.models import FarmCreate, FarmResponse
from app.database import supabase
from typing import List
from uuid import uuid4
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=FarmResponse)
async def create_farm(farm: FarmCreate):
    # Mock create farm logic
    new_farm = {
        "id": str(uuid4()),
        "owner_id": str(uuid4()), # This would be current_user.id
        "name": farm.name,
        "location_lat": farm.location_lat,
        "location_lng": farm.location_lng,
        "surface_area": farm.surface_area,
        "crop_type": farm.crop_type,
        "created_at": datetime.now().isoformat()
    }
    # In production: supabase.table("farms").insert(new_farm).execute()
    return new_farm

@router.get("/", response_model=List[FarmResponse])
async def get_farms():
    # Mock get farms logic
    # In production: response = supabase.table("farms").select("*").execute()
    return []
