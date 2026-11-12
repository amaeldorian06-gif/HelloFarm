# backend/app/routes/ai.py
from fastapi import APIRouter, HTTPException
from app.models import PricePredictionRequest, PricePredictionResponse
import random

router = APIRouter()

@router.post("/predict-price", response_model=PricePredictionResponse)
async def predict_price(request: PricePredictionRequest):
    # Placeholder for IA de prédiction de prix
    # In production: Use Gemini 1.5 Flash or a trained model
    # For now, we return a mock prediction
    base_price = request.historical_price or 500.0
    predicted_price = base_price * (1 + random.uniform(-0.1, 0.2)) # Random fluctuation
    
    return {
        "predicted_price": round(predicted_price, 2),
        "confidence_score": 0.85,
        "recommendation": f"Vendez maintenant pour maximiser vos profits sur le {request.crop_type}."
    }
