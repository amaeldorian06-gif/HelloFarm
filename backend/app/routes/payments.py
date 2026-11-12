# backend/app/routes/payments.py
from fastapi import APIRouter, HTTPException
from app.models import PaymentRequest, PaymentResponse
from uuid import uuid4
import random

router = APIRouter()

@router.post("/momo", response_model=PaymentResponse)
async def initiate_momo_payment(request: PaymentRequest):
    # Structure pour l'initiation de paiements Orange Money / MTN MoMo (Escrow)
    # In production: Use Orange Money API or MTN MoMo API
    # For now, we return a mock transaction
    transaction_id = f"MOMO-{uuid4().hex[:8].upper()}"
    
    # Mock status check
    # In production: This would involve a webhook or polling the provider API
    status = "pending"
    message = f"Paiement {request.provider.upper()} initié pour {request.amount} FCFA. Veuillez valider sur votre téléphone."
    
    return {
        "transaction_id": transaction_id,
        "status": status,
        "message": message
    }
