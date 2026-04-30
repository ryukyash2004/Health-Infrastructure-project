from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
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
    doctor_notes = Column(Text)
    status = Column(String(50), default="Pending") # Pending, Completed
    created_at = Column(DateTime, default=func.now())

    prescriptions = relationship("Prescription", back_populates="patient", cascade="all, delete-orphan")
    follow_ups = relationship("FollowUp", back_populates="patient", cascade="all, delete-orphan")

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    medication = Column(String(255))
    dosage = Column(String(100))
    frequency = Column(String(100))
    duration = Column(String(100))
    instructions = Column(Text)

    patient = relationship("Patient", back_populates="prescriptions")

class FollowUp(Base):
    __tablename__ = "follow_ups"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    follow_up_date = Column(String(100))
    reason = Column(Text)

    patient = relationship("Patient", back_populates="follow_ups")
