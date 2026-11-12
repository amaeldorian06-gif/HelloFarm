# backend/app/models.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

# --- Auth Models ---
class UserBase(BaseModel):
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: str
    role: str = Field(..., pattern="^(producer|buyer|transporter)$")

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: UUID
    created_at: datetime

# --- Farm Models ---
class FarmBase(BaseModel):
    name: str
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    surface_area: float
    crop_type: str

class FarmCreate(FarmBase):
    pass

class FarmResponse(FarmBase):
    id: UUID
    owner_id: UUID
    created_at: datetime

# --- Marketplace Models ---
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price_per_unit: float
    unit: str = "kg"
    quantity_available: float
    image_url: Optional[str] = None
    location_name: str

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: UUID
    producer_id: UUID
    created_at: datetime

# --- AI Models ---
class PricePredictionRequest(BaseModel):
    crop_type: str
    surface_area: float
    location: str
    current_season: str
    historical_price: Optional[float] = None

class PricePredictionResponse(BaseModel):
    predicted_price: float
    confidence_score: float
    recommendation: str

# --- Payment Models ---
class PaymentRequest(BaseModel):
    order_id: UUID
    amount: float
    phone_number: str
    provider: str = Field(..., pattern="^(mtn|orange)$")

class PaymentResponse(BaseModel):
    transaction_id: str
    status: str
    message: str
