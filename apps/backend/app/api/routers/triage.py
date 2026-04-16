from fastapi import APIRouter
from app.schemas.triage import PatientInput, TriageResponse
from app.core.interceptor import evaluate_red_flags

router = APIRouter()

@router.post("/", response_model=TriageResponse)
async def perform_triage(patient_data: PatientInput):
    """
    Medical Triage Endpoint.
    1. Runs Deterministic Red Flag Interceptor.
    2. (Placeholder) Runs RAG-based AI assessment.
    3. Returns prioritized triage plan for HITL dashboard.
    """
    is_red_flag = evaluate_red_flags(patient_data.symptoms)
    
    if is_red_flag:
        # Emergency Override (Critical)
        return TriageResponse(
            assessment="CRITICAL: Life-threatening symptom detected. Emergency protocols initiated. Please call 911 immediately or proceed to the nearest ER.",
            severity=1,
            is_red_flag=True
        )
    
    # Mock Routine AI Response (Routine)
    return TriageResponse(
        assessment="ROUTINE: Symptoms do not indicate an immediate emergency. Please schedule a routine appointment with your primary care physician.",
        severity=3,
        is_red_flag=False
    )
