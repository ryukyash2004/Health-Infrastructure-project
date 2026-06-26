from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
import hmac
import hashlib
import uuid as py_uuid
from datetime import datetime
from app.core.config import settings

from app.schemas.triage import PatientInput, TriageResponse
from app.core.interceptor import evaluate_red_flags
from app.core.database import get_db
from app.models.patient import Patient, Encounter
from app.core.ai_service import get_ai_assessment

router = APIRouter()

SECRET_KEY = "aegis_super_secret_safety_key"

def generate_patient_signature(patient_uuid: str) -> str:
    return hmac.new(SECRET_KEY.encode(), patient_uuid.encode(), hashlib.sha256).hexdigest()

def verify_patient_signature(patient_uuid: str, signature: str) -> bool:
    if not signature:
        return False
    expected = generate_patient_signature(patient_uuid)
    return hmac.compare_digest(expected, signature)

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
async def perform_triage(
    patient_data: PatientInput, 
    x_session_token: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Medical Triage Endpoint with Session Persistence & Session Validation.
    1. Checks session token if patient_id is provided.
    2. Runs Deterministic Red Flag Interceptor.
    3. Creates a new Encounter record linked to the patient.
    4. Triggers AI assessment if no red flag.
    5. Broadcasts real-time update to WebSocket queue dashboards.
    """
    # 1. Try to find existing patient session
    existing_patient = None
    if patient_data.patient_id:
        if not x_session_token or not verify_patient_signature(patient_data.patient_id, x_session_token):
            raise HTTPException(status_code=403, detail="Forbidden: Invalid or missing session token.")
            
        result = await db.execute(select(Patient).where(Patient.uuid == patient_data.patient_id))
        existing_patient = result.scalar_one_or_none()
        if not existing_patient:
            raise HTTPException(status_code=404, detail="Patient session not found.")

    is_red_flag = evaluate_red_flags(patient_data.symptoms)
    now_str = datetime.now().strftime("%d %b %Y, %I:%M %p")
    
    if is_red_flag:
        assessment = "CRITICAL: Life-threatening symptom detected. Emergency protocols initiated. Please call 112 immediately or proceed to the nearest ER."
        severity = 5
        diff_dx = ["URGENT EMERGENCY CARE REQUIRED"]
        
        if existing_patient:
            apply_structured_profile(existing_patient, patient_data)
            patient = existing_patient
        else:
            new_uuid = str(py_uuid.uuid4())
            new_patient = Patient(
                uuid=new_uuid,
                patient_name=patient_data.patient_name,
                patient_history=patient_data.patient_history,
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
            await db.flush()
            patient = new_patient
            
        # Create a new immutable Encounter record
        new_encounter = Encounter(
            patient_id=patient.id,
            symptoms=patient_data.symptoms,
            assessment=assessment,
            severity=severity,
            is_red_flag=True,
            differential_diagnosis=diff_dx,
            status="Pending"
        )
        db.add(new_encounter)
        
        await db.commit()
        await db.refresh(patient)
        
        # Broadcast to WebSocket connections
        try:
            from app.api.routers.patients import manager
            await manager.broadcast("update")
        except Exception as e:
            print(f"DEBUG: WS broadcast failed: {e}")
            
        session_token = generate_patient_signature(patient.uuid)
        
        return TriageResponse(
            patient_id=patient.uuid,
            assessment=assessment,
            severity=severity,
            is_red_flag=True,
            differential_diagnosis=diff_dx,
            session_token=session_token
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
        apply_structured_profile(existing_patient, patient_data)
        patient = existing_patient
    else:
        new_uuid = str(py_uuid.uuid4())
        new_patient = Patient(
            uuid=new_uuid,
            patient_name=patient_data.patient_name,
            patient_history=history_str,
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
        await db.flush()
        patient = new_patient

    # Create a new immutable Encounter record
    new_encounter = Encounter(
        patient_id=patient.id,
        symptoms=patient_data.symptoms,
        assessment=ai_assessment,
        severity=ai_severity,
        is_red_flag=False,
        differential_diagnosis=ai_diff_dx,
        status="Pending"
    )
    db.add(new_encounter)

    await db.commit()
    await db.refresh(patient)
    
    # Broadcast to WebSocket connections
    try:
        from app.api.routers.patients import manager
        await manager.broadcast("update")
    except Exception as e:
        print(f"DEBUG: WS broadcast failed: {e}")
        
    session_token = generate_patient_signature(patient.uuid)
    
    return TriageResponse(
        patient_id=patient.uuid,
        assessment=ai_assessment,
        severity=ai_severity,
        is_red_flag=False,
        differential_diagnosis=ai_diff_dx,
        session_token=session_token
    )
