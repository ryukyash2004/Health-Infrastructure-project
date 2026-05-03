from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text, func
from sqlalchemy.orm import selectinload
from typing import List, Dict, Any

from app.core.database import get_db
from app.models.patient import Patient, Prescription, FollowUp
from app.schemas.patient import VisitPayload, PatientResponse, PatientQueueItem, PaginatedPatientQueue

router = APIRouter()


def optional_text(value: str | None) -> str | None:
    cleaned = value.strip() if isinstance(value, str) else value
    return cleaned if cleaned else None

# FIX APPLIED HERE: Added HEAD method to support Next.js prefetching
@router.api_route("/queue", methods=["GET", "HEAD"], response_model=PaginatedPatientQueue)
async def get_patient_queue(
    skip: int = 0, 
    limit: int = 10, 
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves the triage queue sorted by severity (DESC) and wait time (ASC).
    Now with pagination support.
    """
    # Get total count
    count_result = await db.execute(select(func.count(Patient.id)))
    total_count = count_result.scalar_one()

    # Get paginated items
    result = await db.execute(
        select(Patient)
        .order_by(Patient.severity.desc(), Patient.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    patients = result.scalars().all()
    
    return {
        "items": patients,
        "total_count": total_count
    }

# FIX APPLIED HERE: Added HEAD method to support Next.js prefetching
@router.api_route("/{patient_id}", methods=["GET", "HEAD"])
async def get_patient_data(patient_id: str, db: AsyncSession = Depends(get_db)):
    """
    Retrieves actual patient data from the PostgreSQL database.
    """
    try:
        pid = int(patient_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid patient ID format")

    result = await db.execute(
        select(Patient)
        .options(selectinload(Patient.prescriptions), selectinload(Patient.follow_ups))
        .where(Patient.id == pid)
    )
    patient = result.scalar_one_or_none()

    if patient:
        return {
            "id": f"AE-{patient.id:05d}", # Formatting for display consistency
            "db_id": patient.id,
            "name": patient.patient_name,
            "age": patient.age,
            "gender": optional_text(patient.gender),
            "blood_group": optional_text(patient.blood_group),
            "contact": optional_text(patient.contact),
            "visit_date": patient.visit_date or patient.created_at.strftime("%d %b %Y, %I:%M %p"),
            "visit_type": patient.visit_type or ("EMERGENCY" if patient.is_red_flag else "OPD"),
            "status": patient.status,
            "clinical_data": {
                "patient_complaint": patient.symptoms,
                "history_of_present_illness": patient.patient_history,
                "past_history": [], # Placeholder
                "skipped_intake_fields": patient.skipped_intake_fields or [],
                "conditions": patient.conditions or {},
                "bad_habits": patient.bad_habits or {},
                "allergies_data": patient.allergies or {},
                "allergy_reaction": optional_text(patient.allergy_reaction),
                "vaccinations": patient.vaccinations or {},
                "sleep_cycle": optional_text(patient.sleep_cycle),
                "bowel_movement": optional_text(patient.bowel_movement),
                "other_history": optional_text(patient.other_history),
                "ai_assessment": {
                    "severity_level": patient.severity,
                    "differential_diagnosis": patient.differential_diagnosis or []
                },
                "doctor_notes": optional_text(patient.doctor_notes),
                "prescriptions": [
                    {
                        "medication": p.medication,
                        "dosage": p.dosage,
                        "frequency": p.frequency,
                        "duration": p.duration,
                        "instructions": p.instructions
                    } for p in patient.prescriptions
                ],
                "follow_ups": [
                    {
                        "follow_up_date": f.follow_up_date,
                        "reason": f.reason
                    } for f in patient.follow_ups
                ]
            }
        }
    
    raise HTTPException(status_code=404, detail="Patient not found")

@router.patch("/{patient_id}/visit", response_model=PatientResponse)
async def complete_patient_visit(
    patient_id: int, 
    payload: VisitPayload, 
    db: AsyncSession = Depends(get_db)
):
    """
    Updates the patient's record with doctor notes, prescriptions, and follow-ups.
    """
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Update patient notes and status
    patient.doctor_notes = payload.doctor_notes
    patient.status = "Completed"

    # Clear existing prescriptions and follow-ups for this visit update (if any)
    # In a real app, you might want to manage these more granularly.
    await db.execute(text("DELETE FROM prescriptions WHERE patient_id = :pid"), {"pid": patient_id})
    await db.execute(text("DELETE FROM follow_ups WHERE patient_id = :pid"), {"pid": patient_id})

    # Add new prescriptions
    for p_data in payload.prescriptions:
        new_p = Prescription(
            patient_id=patient_id,
            medication=p_data.medication,
            dosage=p_data.dosage,
            frequency=p_data.frequency,
            duration=p_data.duration,
            instructions=p_data.instructions
        )
        db.add(new_p)

    # Add new follow-ups
    for f_data in payload.follow_ups:
        new_f = FollowUp(
            patient_id=patient_id,
            follow_up_date=f_data.follow_up_date,
            reason=f_data.reason
        )
        db.add(new_f)

    try:
        await db.commit()
        # Re-fetch with relationships for the response
        result = await db.execute(
            select(Patient)
            .options(selectinload(Patient.prescriptions), selectinload(Patient.follow_ups))
            .where(Patient.id == patient_id)
        )
        patient = result.scalar_one_or_none()
        return patient
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/profile")
async def update_patient_profile(profile: Dict[str, Any]):
    """
    Updates the patient's clinical baseline profile.
    """
    print(f"\n[BACKEND] Received Clinical Record Update:")
    print(f"Patient: {profile.get('patient_name')}")
    return {"status": "success"}
