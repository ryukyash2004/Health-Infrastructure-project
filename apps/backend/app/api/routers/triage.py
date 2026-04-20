from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import ollama
import re
from app.schemas.triage import PatientInput, TriageResponse
from app.core.interceptor import evaluate_red_flags
from app.core.database import get_db
from app.models.patient import Patient

import json

router = APIRouter()

async def get_meditron_assessment(symptoms: str):
    """
    Calls local Ollama Meditron model for clinical assessment using JSON mode.
    """
    prompt = f"""
    You are a medical triage AI. Respond ONLY with a valid JSON object containing exactly two keys: 
    "assessment" (a short string) and "severity" (an integer from 1 to 4). 
    Do not include any other text.

    Patient Symptoms: {symptoms}
    """
    
    try:
        # Connect to local Ollama on Windows host via WSL bridge IP
        print(f"DEBUG: Starting Meditron JSON call to http://172.20.192.1:11434...")
        client = ollama.AsyncClient(host="http://172.20.192.1:11434", timeout=300.0)
        
        # Use generate with format="json"
        response = await client.generate(
            model="meditron", 
            prompt=prompt,
            format="json"
        )
        
        text = response['response']
        print(f"DEBUG: Meditron JSON response received: {text}")
        
        # Parse the JSON response
        data = json.loads(text)
        assessment = data.get("assessment", "Assessment unavailable.")
        severity = data.get("severity", 2)
        
        # Clamp severity between 1 and 4
        severity = max(1, min(4, int(severity)))
        
        return assessment, severity
    except Exception as e:
        import traceback
        print(f"Ollama/JSON Error: {e}")
        traceback.print_exc()
        # Fallback if Ollama fails
        return "AI Assessment unavailable. Please consult a professional.", 2

@router.post("/", response_model=TriageResponse)
async def perform_triage(patient_data: PatientInput, db: AsyncSession = Depends(get_db)):
    """
    Medical Triage Endpoint.
    1. Runs Deterministic Red Flag Interceptor.
    2. If red flag, saves to DB and returns critical response.
    3. If no red flag, calls local Meditron model via Ollama.
    4. Saves final assessment to the database.
    """
    is_red_flag = evaluate_red_flags(patient_data.symptoms)
    
    if is_red_flag:
        assessment = "CRITICAL: Life-threatening symptom detected. Emergency protocols initiated. Please call 911 immediately or proceed to the nearest ER."
        severity = 5
        
        # Save Red Flag record immediately
        new_patient = Patient(
            patient_name=patient_data.patient_name,
            symptoms=patient_data.symptoms,
            assessment=assessment,
            severity=severity,
            is_red_flag=True
        )
        db.add(new_patient)
        await db.commit()
        await db.refresh(new_patient)
        
        return TriageResponse(
            assessment=assessment,
            severity=severity,
            is_red_flag=True
        )
    
    # Call local Meditron for non-red-flag cases
    ai_assessment, ai_severity = await get_meditron_assessment(patient_data.symptoms)
    
    # Save Routine/Urgent record to database
    new_patient = Patient(
        patient_name=patient_data.patient_name,
        symptoms=patient_data.symptoms,
        assessment=ai_assessment,
        severity=ai_severity,
        is_red_flag=False
    )
    db.add(new_patient)
    await db.commit()
    await db.refresh(new_patient)
    
    return TriageResponse(
        assessment=ai_assessment,
        severity=ai_severity,
        is_red_flag=False
    )
