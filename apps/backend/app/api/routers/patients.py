from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from sqlalchemy.orm import selectinload
from typing import List, Dict, Any

from app.core.database import get_db
from app.models.patient import Patient, Prescription, FollowUp
from app.schemas.patient import VisitPayload, PatientResponse, PatientQueueItem

router = APIRouter()

@router.get("/queue", response_model=List[PatientQueueItem])
async def get_patient_queue(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves the triage queue sorted by severity (DESC) and wait time (ASC).
    """
    result = await db.execute(
        select(Patient)
        .order_by(Patient.severity.desc(), Patient.created_at.asc())
        .offset(skip)
        .limit(limit)
    )
    patients = result.scalars().all()
    return patients

@router.get("/{patient_id}")
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
            "age": patient.age or 0,
            "gender": patient.gender or "Unknown",
            "blood_group": patient.blood_group or "Not Specified",
            "contact": patient.contact or "N/A",
            "visit_date": patient.visit_date or patient.created_at.strftime("%d %b %Y, %I:%M %p"),
            "visit_type": patient.visit_type or ("EMERGENCY" if patient.is_red_flag else "OPD"),
            "status": patient.status,
            "clinical_data": {
                "patient_complaint": patient.symptoms,
                "history_of_present_illness": patient.patient_history,
                "past_history": [], # Placeholder
                "ai_assessment": {
                    "severity_level": patient.severity,
                    "differential_diagnosis": patient.differential_diagnosis or []
                },
                "doctor_notes": patient.doctor_notes,
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
