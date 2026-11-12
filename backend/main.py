# backend/main.py
import uvicorn
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, farms, marketplace, ai, payments

app = FastAPI(
    title="Hello Farm API",
    description="Backend MVP for Hello Farm - Precision Agriculture in Cameroon",
    version="1.0.0"
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "https://ais-dev-3w6vofbwy4b62gk333wxxv-429114080415.europe-west2.run.app",
    "https://ais-pre-3w6vofbwy4b62gk333wxxv-429114080415.europe-west2.run.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routes
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(farms.router, prefix="/farms", tags=["Farms"])
app.include_router(marketplace.router, prefix="/marketplace", tags=["Marketplace"])
app.include_router(ai.router, prefix="/ai", tags=["AI Integration"])
app.include_router(payments.router, prefix="/payments", tags=["Payments"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to Hello Farm API",
        "status": "online",
        "docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
