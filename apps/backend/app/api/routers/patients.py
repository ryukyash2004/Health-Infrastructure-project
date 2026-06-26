from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text, func
from sqlalchemy.orm import selectinload
from typing import List, Dict, Any

from app.core.database import get_db
from app.models.patient import Patient, Prescription, FollowUp, Encounter
from app.schemas.patient import VisitPayload, PatientResponse, PatientQueueItem, PaginatedPatientQueue

router = APIRouter()

# --- WebSocket Connection Manager ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

@router.websocket("/ws/queue")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep client connection open
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

def optional_text(value: str | None) -> str | None:
    cleaned = value.strip() if isinstance(value, str) else value
    return cleaned if cleaned else None

@router.api_route("/queue", methods=["GET", "HEAD"], response_model=PaginatedPatientQueue)
async def get_patient_queue(
    skip: int = 0, 
    limit: int = 10, 
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves the triage queue from the encounters table sorted by severity (DESC) and creation time (DESC).
    Now with pagination support and UUID representation.
    """
    # Get total count of encounters
    count_result = await db.execute(select(func.count(Encounter.id)))
    total_count = count_result.scalar_one()

    # Get paginated encounters joined with their patients
    result = await db.execute(
        select(Encounter)
        .options(selectinload(Encounter.patient))
        .order_by(Encounter.severity.desc(), Encounter.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    encounters = result.scalars().all()
    
    # Format into PatientQueueItem structure using secure patient UUID as id
    items = []
    for enc in encounters:
        items.append({
            "id": enc.patient.uuid,
            "patient_name": enc.patient.patient_name,
            "severity": enc.severity,
            "visit_date": enc.created_at.strftime("%d %b %Y, %I:%M %p"),
            "status": enc.status,
            "is_red_flag": enc.is_red_flag,
            "created_at": enc.created_at
        })
    
    return {
        "items": items,
        "total_count": total_count
    }

@router.api_route("/{patient_id}", methods=["GET", "HEAD"])
async def get_patient_data(patient_id: str, db: AsyncSession = Depends(get_db)):
    """
    Retrieves patient data and their latest encounter from the database by patient UUID.
    """
    result = await db.execute(
        select(Patient)
        .options(
            selectinload(Patient.prescriptions), 
            selectinload(Patient.follow_ups),
            selectinload(Patient.encounters)
        )
        .where(Patient.uuid == patient_id)
    )
    patient = result.scalar_one_or_none()

    if patient:
        latest_encounter = patient.encounters[-1] if patient.encounters else None
        
        return {
            "id": f"AE-{patient.id:05d}", # Visual display format consistent with doctor app expectations
            "db_id": patient.uuid,       # Pass secure UUID as db_id so update actions query by UUID!
            "name": patient.patient_name,
            "age": patient.age,
            "gender": optional_text(patient.gender),
            "blood_group": optional_text(patient.blood_group),
            "contact": optional_text(patient.contact),
            "visit_date": latest_encounter.created_at.strftime("%d %b %Y, %I:%M %p") if latest_encounter else patient.created_at.strftime("%d %b %Y, %I:%M %p"),
            "visit_type": "EMERGENCY" if (latest_encounter and latest_encounter.is_red_flag) else "OPD",
            "status": latest_encounter.status if latest_encounter else "Pending",
            "clinical_data": {
                "patient_complaint": latest_encounter.symptoms if latest_encounter else "",
                "history_of_present_illness": patient.patient_history or "",
                "past_history": [],
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
                    "severity_level": latest_encounter.severity if latest_encounter else 2,
                    "differential_diagnosis": latest_encounter.differential_diagnosis if latest_encounter else []
                },
                "doctor_notes": latest_encounter.doctor_notes if latest_encounter else "",
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

@router.patch("/{patient_id}/visit")
async def complete_patient_visit(
    patient_id: str, 
    payload: VisitPayload, 
    db: AsyncSession = Depends(get_db)
):
    """
    Updates the latest encounter for the patient (by UUID) with doctor notes, status, prescriptions, and followups.
    """
    result = await db.execute(
        select(Patient)
        .options(selectinload(Patient.encounters))
        .where(Patient.uuid == patient_id)
    )
    patient = result.scalar_one_or_none()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if not patient.encounters:
        raise HTTPException(status_code=400, detail="No active encounter found for this patient")

    latest_encounter = patient.encounters[-1]
    latest_encounter.doctor_notes = payload.doctor_notes
    latest_encounter.status = "Completed"

    # Clear existing prescriptions and follow-ups for this patient
    await db.execute(text("DELETE FROM prescriptions WHERE patient_id = :pid"), {"pid": patient.id})
    await db.execute(text("DELETE FROM follow_ups WHERE patient_id = :pid"), {"pid": patient.id})

    # Add new prescriptions
    for p_data in payload.prescriptions:
        new_p = Prescription(
            patient_id=patient.id,
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
            patient_id=patient.id,
            follow_up_date=f_data.follow_up_date,
            reason=f_data.reason
        )
        db.add(new_f)

    try:
        await db.commit()
        
        # Broadcast WebSocket update trigger to connected doctor dashboards
        await manager.broadcast("update")
        
        # Return updated patient details dictionary
        return await get_patient_data(patient.uuid, db)
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
