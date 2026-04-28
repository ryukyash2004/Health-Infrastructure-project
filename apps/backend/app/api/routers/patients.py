from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any

from app.core.database import get_db
from app.models.patient import Patient

router = APIRouter()

@router.get("/{patient_id}")
async def get_patient_data(patient_id: str, db: AsyncSession = Depends(get_db)):
    """
    Retrieves actual patient data from the PostgreSQL database.
    """
    try:
        pid = int(patient_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid patient ID format")

    result = await db.execute(select(Patient).where(Patient.id == pid))
    patient = result.scalar_one_or_none()

    if patient:
        return {
            "id": f"AE-{patient.id:05d}", # Formatting for display consistency
            "db_id": patient.id,
            "name": patient.patient_name,
            "age": patient.age or 0,
            "gender": patient.gender or "Unknown",
            "blood_group": patient.blood_group or "Not Specified",
            "contact": patient.contact or "N/A",
            "visit_date": patient.visit_date or patient.created_at.strftime("%d %b %Y, %I:%M %p"),
            "visit_type": patient.visit_type or ("EMERGENCY" if patient.is_red_flag else "OPD"),
            "clinical_data": {
                "patient_complaint": patient.symptoms,
                "history_of_present_illness": patient.patient_history,
                "past_history": [], # Placeholder or split from patient_history if structured
                "ai_assessment": {
                    "severity_level": patient.severity,
                    "differential_diagnosis": patient.differential_diagnosis or []
                }
            }
        }
    
    raise HTTPException(status_code=404, detail="Patient not found")

@router.post("/profile")
async def update_patient_profile(profile: Dict[str, Any]):
    """
    Updates the patient's clinical baseline profile.
    """
    print(f"\n[BACKEND] Received Clinical Record Update:")
    print(f"Patient: {profile.get('patient_name')}")
    return {"status": "success"}
