from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.triage import PatientInput, TriageResponse
from app.core.interceptor import evaluate_red_flags
from app.core.database import get_db
from app.models.patient import Patient

router = APIRouter()

@router.post("/", response_model=TriageResponse)
async def perform_triage(patient_data: PatientInput, db: AsyncSession = Depends(get_db)):
    """
    Medical Triage Endpoint.
    1. Runs Deterministic Red Flag Interceptor.
    2. (Placeholder) Runs RAG-based AI assessment.
    3. Returns prioritized triage plan for HITL dashboard.
    4. Saves assessment results to the database.
    """
    is_red_flag = evaluate_red_flags(patient_data.symptoms)
    
    if is_red_flag:
        # Emergency Override (Critical)
        response = TriageResponse(
            assessment="CRITICAL: Life-threatening symptom detected. Emergency protocols initiated. Please call 911 immediately or proceed to the nearest ER.",
            severity=1,
            is_red_flag=True
        )
    else:
        # Mock Routine AI Response (Routine)
        response = TriageResponse(
            assessment="ROUTINE: Symptoms do not indicate an immediate emergency. Please schedule a routine appointment with your primary care physician.",
            severity=3,
            is_red_flag=False
        )
    
    # Save to database
    new_patient = Patient(
        patient_name=patient_data.patient_name,
        symptoms=patient_data.symptoms,
        assessment=response.assessment,
        severity=response.severity,
        is_red_flag=response.is_red_flag
    )
    db.add(new_patient)
    await db.commit()
    await db.refresh(new_patient)
    
    return response
