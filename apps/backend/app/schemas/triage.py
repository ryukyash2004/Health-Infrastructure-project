from pydantic import BaseModel

class PatientInput(BaseModel):
    patient_name: str
    symptoms: str

class TriageResponse(BaseModel):
    assessment: str
    severity: int  # 1: Routine, 2-4: Urgent, 5: Critical (Red Flag)
    is_red_flag: bool
