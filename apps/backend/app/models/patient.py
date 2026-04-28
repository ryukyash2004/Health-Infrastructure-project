from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB
from app.core.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String(255))
    age = Column(Integer)
    gender = Column(String(50))
    blood_group = Column(String(20))
    contact = Column(String(50))
    visit_date = Column(String(100))
    visit_type = Column(String(50))
    symptoms = Column(Text)
    patient_history = Column(Text)
    assessment = Column(Text)
    severity = Column(Integer)
    is_red_flag = Column(Boolean, default=False)
    differential_diagnosis = Column(JSONB, default=[])
    created_at = Column(DateTime, default=func.now())
