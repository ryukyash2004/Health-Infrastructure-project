from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import ollama
import re
import json
import traceback
from datetime import datetime
from app.core.config import settings

from app.schemas.triage import PatientInput, TriageResponse
from app.core.interceptor import evaluate_red_flags
from app.core.database import get_db
from app.models.patient import Patient
from app.core.ai_service import get_ai_assessment

router = APIRouter()

@router.post("/", response_model=TriageResponse)
async def perform_triage(patient_data: PatientInput, db: AsyncSession = Depends(get_db)):
    """
    Medical Triage Endpoint.
    1. Runs Deterministic Red Flag Interceptor.
    2. If red flag, saves to DB and returns critical response.
    3. If no red flag, calls local Meditron model via Ollama.
    4. Saves final assessment to the database.
    """
    is_red_flag = evaluate_red_flags(patient_data.symptoms)
    
    now_str = datetime.now().strftime("%d %b %Y, %I:%M %p")
    
    if is_red_flag:
        assessment = "CRITICAL: Life-threatening symptom detected. Emergency protocols initiated. Please call 911 immediately or proceed to the nearest ER."
        severity = 5
        diff_dx = ["URGENT EMERGENCY CARE REQUIRED"]
        
        # Save Red Flag record immediately
        new_patient = Patient(
            patient_name=patient_data.patient_name,
            symptoms=patient_data.symptoms,
            patient_history=patient_data.patient_history,
            assessment=assessment,
            severity=severity,
            is_red_flag=True,
            differential_diagnosis=diff_dx,
            visit_date=now_str,
            visit_type="EMERGENCY"
        )
        db.add(new_patient)
        await db.commit()
        await db.refresh(new_patient)
        
        return TriageResponse(
            patient_id=new_patient.id,
            assessment=assessment,
            severity=severity,
            is_red_flag=True,
            differential_diagnosis=diff_dx
        )
    
    # Call local Meditron for non-red-flag cases, passing the new history string
    history_str = patient_data.patient_history or "No history provided."
    
    try:
        ai_assessment, ai_severity, ai_diff_dx = await get_ai_assessment(
            patient_data.symptoms, 
            history_str
        )
    except Exception as e:
        print(f"ERROR: AI assessment failed: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail={
                "error": "AI_ENGINE_OFFLINE",
                "message": "The AI triage engine is currently unavailable. Please try again later or consult a professional."
            }
        )
    
    # Save Routine/Urgent record to database
    new_patient = Patient(
        patient_name=patient_data.patient_name,
        symptoms=patient_data.symptoms,
        patient_history=history_str,
        assessment=ai_assessment,
        severity=ai_severity,
        is_red_flag=False,
        differential_diagnosis=ai_diff_dx,
        visit_date=now_str,
        visit_type="OPD"
    )
    db.add(new_patient)
    await db.commit()
    await db.refresh(new_patient)
    
    return TriageResponse(
        patient_id=new_patient.id,
        assessment=ai_assessment,
        severity=ai_severity,
        is_red_flag=False,
        differential_diagnosis=ai_diff_dx
    )
