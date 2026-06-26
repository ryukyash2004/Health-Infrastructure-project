from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    patient_name = Column(String(255))
    age = Column(Integer)
    gender = Column(String(50))
    blood_group = Column(String(20))
    contact = Column(String(50))
    skipped_intake_fields = Column(JSONB, nullable=True, default=None)
    conditions = Column(JSONB, nullable=True, default=None)
    other_history = Column(Text, nullable=True)
    sleep_cycle = Column(String(100), nullable=True)
    bad_habits = Column(JSONB, nullable=True, default=None)
    bowel_movement = Column(String(100), nullable=True)
    allergies = Column(JSONB, nullable=True, default=None)
    allergy_reaction = Column(Text, nullable=True)
    vaccinations = Column(JSONB, nullable=True, default=None)
    visit_date = Column(String(100), nullable=True)
    visit_type = Column(String(50), nullable=True)
    symptoms = Column(Text, nullable=True)
    patient_history = Column(Text, nullable=True)
    assessment = Column(Text, nullable=True)
    severity = Column(Integer, nullable=True)
    is_red_flag = Column(Boolean, default=False)
    differential_diagnosis = Column(JSONB, default=[])
    doctor_notes = Column(Text, nullable=True)
    status = Column(String(50), default="Pending") # Pending, Completed
    created_at = Column(DateTime, default=func.now())

    prescriptions = relationship("Prescription", back_populates="patient", cascade="all, delete-orphan")
    follow_ups = relationship("FollowUp", back_populates="patient", cascade="all, delete-orphan")
    encounters = relationship("Encounter", back_populates="patient", cascade="all, delete-orphan")

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

class Encounter(Base):
    __tablename__ = "encounters"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"))
    symptoms = Column(Text)
    assessment = Column(Text)
    severity = Column(Integer)
    is_red_flag = Column(Boolean, default=False)
    differential_diagnosis = Column(JSONB, default=[])
    doctor_notes = Column(Text, nullable=True)
    status = Column(String(50), default="Pending") # Pending, Completed
    created_at = Column(DateTime, default=func.now())

    patient = relationship("Patient", back_populates="encounters")
