from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routers import triage, patients, clinical
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # This runs exactly once when you start Uvicorn
    print("\n" + "="*40)
    print("🏥 Starting Project Aegis Backend...")
    print("Checking AI Engine Status...")
    
    # Check for Gemini configuration
    try:
        if settings.AI_PROVIDER == "gemini":
            if settings.GEMINI_API_KEY:
                print("✅ AI Engine (Gemini) is CONFIGURED and ONLINE!")
            else:
                print("❌ CRITICAL WARNING: Gemini API Key is missing in your .env file!")
        else:
            print(f"⚠️ Unknown AI Provider configured: {settings.AI_PROVIDER}")
    except Exception as e:
        print(f"⚠️ AI Engine status check failed: {e}")
        
    print("="*40 + "\n")
    
    yield # This tells FastAPI to continue starting the server
    
    # Anything after yield runs when the server shuts down
    print("Project Aegis shutting down.")

# Initialize the FastAPI app with the lifespan handler
app = FastAPI(
    title=settings.PROJECT_NAME, 
    lifespan=lifespan,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"], # Allow your frontend ports,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(
    triage.router, 
    prefix=f"{settings.API_V1_STR}/triage", 
    tags=["triage"]
)

app.include_router(
    patients.router,
    prefix=f"{settings.API_V1_STR}/patients",
    tags=["patients"]
)

app.include_router(
    clinical.router,
    prefix=f"{settings.API_V1_STR}/clinical",
    tags=["clinical"]
)

@app.get("/")
async def health_check():
    """
    Simple health check endpoint for the Aegis Backend.
    """
    return {"status": "Aegis Backend is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)