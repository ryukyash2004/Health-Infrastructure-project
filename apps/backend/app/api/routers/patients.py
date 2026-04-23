from fastapi import APIRouter
from app.schemas.patient import PatientProfile

router = APIRouter()

@router.post("/profile")
async def update_patient_profile(profile: PatientProfile):
    """
    Updates the patient's clinical baseline profile.
    """
    print(f"\n[BACKEND] Received Clinical Record Update:")
    print(f"Patient: {profile.patient_name}")
    print(f"History: {profile.baseline_history}")
    print(f"Allergies: {profile.lethal_allergies}")
    print("-" * 30)
    
    return {"status": "success"}
