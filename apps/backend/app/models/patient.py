from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_name = Column(String(255))
    symptoms = Column(Text)
    assessment = Column(Text)
    severity = Column(Integer)
    is_red_flag = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
