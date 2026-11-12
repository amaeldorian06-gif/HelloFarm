# backend/app/routes/marketplace.py
from fastapi import APIRouter, HTTPException, Depends
from app.models import ProductCreate, ProductResponse
from app.database import supabase
from typing import List
from uuid import uuid4
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=ProductResponse)
async def create_product(product: ProductCreate):
    # Mock create product logic
    new_product = {
        "id": str(uuid4()),
        "producer_id": str(uuid4()), # This would be current_user.id
        "name": product.name,
        "description": product.description,
        "price_per_unit": product.price_per_unit,
        "unit": product.unit,
        "quantity_available": product.quantity_available,
        "image_url": product.image_url,
        "location_name": product.location_name,
        "created_at": datetime.now().isoformat()
    }
    # In production: supabase.table("products").insert(new_product).execute()
    return new_product

@router.get("/", response_model=List[ProductResponse])
async def get_products():
    # Mock get products logic
    # In production: response = supabase.table("products").select("*").execute()
    return []
