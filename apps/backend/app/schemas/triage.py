from pydantic import BaseModel

class PatientInput(BaseModel):
    symptoms: str

class TriageResponse(BaseModel):
    assessment: str
    severity: int  # 1: Critical, 2: Serious, 3: Routine
    is_red_flag: bool
