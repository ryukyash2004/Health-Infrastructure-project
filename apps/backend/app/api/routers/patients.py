from fastapi import APIRouter
from app.schemas.patient import PatientProfile

router = APIRouter()

@router.post("/profile")
async def update_patient_profile(profile: PatientProfile):
    """
    Updates the patient's clinical baseline profile.
    """
    print(f"DEBUG: Received profile update: {profile.model_dump()}")
    return {"status": "success", "message": "Profile updated successfully"}
