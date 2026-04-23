from pydantic import BaseModel

class PatientProfile(BaseModel):
    patient_name: str
    baseline_history: str
    lethal_allergies: str
