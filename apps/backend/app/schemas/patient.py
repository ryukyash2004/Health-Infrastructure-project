from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PrescriptionBase(BaseModel):
    medication: str
    dosage: str
    frequency: str
    duration: str
    instructions: Optional[str] = None

class FollowUpBase(BaseModel):
    follow_up_date: str
    reason: str

class VisitPayload(BaseModel):
    doctor_notes: Optional[str] = None
    prescriptions: List[PrescriptionBase] = []
    follow_ups: List[FollowUpBase] = []

class PrescriptionResponse(PrescriptionBase):
    id: int
    patient_id: int
    class Config:
        from_attributes = True

class FollowUpResponse(FollowUpBase):
    id: int
    patient_id: int
    class Config:
        from_attributes = True

class PatientResponse(BaseModel):
    id: int
    patient_name: str
    status: str
    doctor_notes: Optional[str] = None
    prescriptions: List[PrescriptionResponse] = []
    follow_ups: List[FollowUpResponse] = []
    class Config:
        from_attributes = True

class PatientQueueItem(BaseModel):
    id: int
    patient_name: str
    severity: int
    visit_date: str
    status: str
    is_red_flag: bool
    created_at: datetime
    class Config:
        from_attributes = True

class PatientProfile(BaseModel):
    patient_name: str
    baseline_history: str
    lethal_allergies: str
