from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
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


def apply_structured_profile(patient: Patient, patient_data: PatientInput) -> None:
    patient.age = patient_data.age
    patient.gender = patient_data.gender
    patient.blood_group = patient_data.blood_group
    patient.contact = patient_data.contact
    patient.skipped_intake_fields = patient_data.skipped_fields
    patient.conditions = patient_data.conditions
    patient.other_history = patient_data.other_history
    patient.sleep_cycle = patient_data.sleep_cycle
    patient.bad_habits = patient_data.bad_habits
    patient.bowel_movement = patient_data.bowel_movement
    patient.allergies = patient_data.allergies
    patient.allergy_reaction = patient_data.allergy_reaction
    patient.vaccinations = patient_data.vaccinations

@router.post("/", response_model=TriageResponse)
async def perform_triage(patient_data: PatientInput, db: AsyncSession = Depends(get_db)):
    """
    Medical Triage Endpoint with Session Persistence.
    1. Checks for existing patient session.
    2. Runs Deterministic Red Flag Interceptor.
    3. If red flag, updates/saves to DB and returns critical response.
    4. If no red flag, calls local Meditron model via Ollama.
    5. Updates/Saves final assessment to the database.
    """
    # 1. Try to find existing patient session
    existing_patient = None
    if patient_data.patient_id:
        result = await db.execute(select(Patient).where(Patient.id == patient_data.patient_id))
        existing_patient = result.scalar_one_or_none()

    is_red_flag = evaluate_red_flags(patient_data.symptoms)
    now_str = datetime.now().strftime("%d %b %Y, %I:%M %p")
    
    if is_red_flag:
        assessment = "CRITICAL: Life-threatening symptom detected. Emergency protocols initiated. Please call 911 immediately or proceed to the nearest ER."
        severity = 5
        diff_dx = ["URGENT EMERGENCY CARE REQUIRED"]
        
        if existing_patient:
            existing_patient.symptoms += f"\n[Update {now_str}] {patient_data.symptoms}"
            existing_patient.assessment = assessment
            existing_patient.severity = severity
            existing_patient.is_red_flag = True
            existing_patient.differential_diagnosis = diff_dx
            existing_patient.visit_type = "EMERGENCY"
            apply_structured_profile(existing_patient, patient_data)
            patient = existing_patient
        else:
            new_patient = Patient(
                patient_name=patient_data.patient_name,
                symptoms=patient_data.symptoms,
                patient_history=patient_data.patient_history,
                assessment=assessment,
                severity=severity,
                is_red_flag=True,
                differential_diagnosis=diff_dx,
                visit_date=now_str,
                visit_type="EMERGENCY",
                age=patient_data.age,
                gender=patient_data.gender,
                blood_group=patient_data.blood_group,
                contact=patient_data.contact,
                skipped_intake_fields=patient_data.skipped_fields,
                conditions=patient_data.conditions,
                other_history=patient_data.other_history,
                sleep_cycle=patient_data.sleep_cycle,
                bad_habits=patient_data.bad_habits,
                bowel_movement=patient_data.bowel_movement,
                allergies=patient_data.allergies,
                allergy_reaction=patient_data.allergy_reaction,
                vaccinations=patient_data.vaccinations
            )
            db.add(new_patient)
            patient = new_patient
            
        await db.commit()
        await db.refresh(patient)
        
        return TriageResponse(
            patient_id=patient.id,
            assessment=assessment,
            severity=severity,
            is_red_flag=True,
            differential_diagnosis=diff_dx
        )
    
    # 2. Call local AI for non-red-flag cases
    history_str = patient_data.patient_history or "No history provided."
    
    try:
        ai_assessment, ai_severity, ai_diff_dx = await get_ai_assessment(
            patient_data.symptoms, 
            history_str,
            patient_data.skipped_fields
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
    
    # 3. Update or Save record to database
    if existing_patient:
        existing_patient.symptoms += f"\n[Update {now_str}] {patient_data.symptoms}"
        existing_patient.assessment = ai_assessment
        existing_patient.severity = ai_severity
        existing_patient.differential_diagnosis = ai_diff_dx
        existing_patient.patient_history = history_str
        apply_structured_profile(existing_patient, patient_data)
        patient = existing_patient
    else:
        new_patient = Patient(
            patient_name=patient_data.patient_name,
            symptoms=patient_data.symptoms,
            patient_history=history_str,
            assessment=ai_assessment,
            severity=ai_severity,
            is_red_flag=False,
            differential_diagnosis=ai_diff_dx,
            visit_date=now_str,
            visit_type="OPD",
            age=patient_data.age,
            gender=patient_data.gender,
            blood_group=patient_data.blood_group,
            contact=patient_data.contact,
            skipped_intake_fields=patient_data.skipped_fields,
            conditions=patient_data.conditions,
            other_history=patient_data.other_history,
            sleep_cycle=patient_data.sleep_cycle,
            bad_habits=patient_data.bad_habits,
            bowel_movement=patient_data.bowel_movement,
            allergies=patient_data.allergies,
            allergy_reaction=patient_data.allergy_reaction,
            vaccinations=patient_data.vaccinations
        )
        db.add(new_patient)
        patient = new_patient

    await db.commit()
    await db.refresh(patient)
    
    return TriageResponse(
        patient_id=patient.id,
        assessment=ai_assessment,
        severity=ai_severity,
        is_red_flag=False,
        differential_diagnosis=ai_diff_dx
    )
