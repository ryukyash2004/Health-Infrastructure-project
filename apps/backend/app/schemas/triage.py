from pydantic import BaseModel
from typing import List, Optional

class PatientInput(BaseModel):
    patient_id: Optional[str] = None
    patient_name: str
    symptoms: str
    patient_history: Optional[str] = "No history provided."
    skipped_fields: Optional[List[str]] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    contact: Optional[str] = None
    conditions: Optional[dict] = None
    other_history: Optional[str] = None
    sleep_cycle: Optional[str] = None
    bad_habits: Optional[dict] = None
    bowel_movement: Optional[str] = None
    allergies: Optional[dict] = None
    allergy_reaction: Optional[str] = None
    vaccinations: Optional[dict] = None

class TriageResponse(BaseModel):
    patient_id: str
    assessment: str
    severity: int
    is_red_flag: bool
    differential_diagnosis: Optional[List[str]] = []
    session_token: Optional[str] = None
