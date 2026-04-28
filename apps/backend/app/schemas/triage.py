from pydantic import BaseModel
from typing import List, Optional

class PatientInput(BaseModel):
    patient_name: str
    symptoms: str
    patient_history: Optional[str] = "No history provided."

class TriageResponse(BaseModel):
    patient_id: int
    assessment: str
    severity: int
    is_red_flag: bool
    differential_diagnosis: Optional[List[str]] = []
