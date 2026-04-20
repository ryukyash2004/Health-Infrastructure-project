from pydantic import BaseModel
from typing import Optional

class PatientProfile(BaseModel):
    patient_name: str
    age: str
    gender: str
    medical_history: str
    allergies: str
