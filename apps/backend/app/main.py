from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routers import triage, patients, clinical
import httpx
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # This runs exactly once when you start Uvicorn
    print("\n" + "="*40)
    print("🏥 Starting Project Aegis Backend...")
    print("Checking AI Engine Status...")
    
    try:
        # Ping the Windows host Ollama IP
        async with httpx.AsyncClient() as client:
            response = await client.get("http://172.20.192.1:11434/", timeout=2.0)
            if response.status_code == 200:
                print("✅ AI Engine (Ollama): ONLINE & READY")
            else:
                print(f"⚠️ AI Engine connected, but returned weird status: {response.status_code}")
    except httpx.ConnectError:
        print("❌ CRITICAL WARNING: AI Engine (Ollama) is OFFLINE!")
        print("❌ Please open the Ollama app on your Windows desktop.")
    except Exception as e:
        print(f"⚠️ AI Engine status unknown: {e}")
        
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
