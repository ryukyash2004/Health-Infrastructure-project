from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import ollama
import re
import json
import traceback

from app.schemas.triage import PatientInput, TriageResponse
from app.core.interceptor import evaluate_red_flags
from app.core.database import get_db
from app.models.patient import Patient

router = APIRouter()

# 1. The highly constrained JSON-Scratchpad Prompt
SYSTEM_PROMPT = """
You are Meditron, an elite clinical triage AI for Project Aegis.
You will receive patient symptoms and history. Your job is to assess the clinical risk and provide a differential diagnosis.

CRITICAL RULES:
1. You must output ONLY valid, raw JSON. No markdown formatting, no text before or after.
2. You MUST think step-by-step inside the "reasoning_scratchpad" field BEFORE outputting your final assessment.

Use this EXACT JSON format:
{
  "reasoning_scratchpad": "1. Analyze symptoms. 2. Note patient history. 3. Identify red flags. 4. Determine diagnoses.",
  "severity_level": 3,
  "differential_diagnosis": ["Diagnosis A", "Diagnosis B", "Diagnosis C"],
  "patient_message": "A polite, concise message to the patient explaining the assessment."
}
"""

async def get_meditron_assessment(symptoms: str, patient_history: str):
    """
    Calls local Ollama Meditron model using the structured JSON Scratchpad technique.
    """
    full_prompt = f"Patient Symptoms: {symptoms} | Patient History: {patient_history}"
    
    try:
        # Connect to local Ollama on Windows host via WSL bridge IP
        print(f"DEBUG: Starting Meditron Scratchpad call to http://172.20.192.1:11434...")
        client = ollama.AsyncClient(host="http://172.20.192.1:11434", timeout=300.0)
        
        # Use generate with format="json" and low temperature
        response = await client.generate(
            model="meditron", 
            prompt=full_prompt,
            system=SYSTEM_PROMPT,
            format="json",
            options={
                "temperature": 0.1, # Keep this extremely low to stop hallucinations!
                "top_p": 0.9
            }
        )
        
        text = response['response']
        print(f"DEBUG: Meditron Raw Response received: {text}")
        
        # Parse the JSON response
        ai_data = json.loads(text)
        
        # Print the AI's internal thoughts to your terminal for debugging
        print("\n🧠 MEDITRON'S INTERNAL THOUGHTS:")
        print(ai_data.get("reasoning_scratchpad", "No scratchpad generated."))
        print("-" * 40)
        
        # Safely extract the required fields
        assessment = ai_data.get("patient_message", "Assessment unavailable.")
        severity = ai_data.get("severity_level", 2)
        diff_dx = ai_data.get("differential_diagnosis", [])
        
        # Clamp severity between 1 and 4 (since 5 is reserved for deterministic red flags)
        severity = max(1, min(4, int(severity)))
        
        return assessment, severity, diff_dx
        
    except json.JSONDecodeError:
        print(f"Ollama/JSON Parse Error: Failed to decode -> {text}")
        return "AI Assessment unavailable due to format error. Please consult a professional.", 2, []
    except Exception as e:
        print(f"Ollama Connection Error: {e}")
        traceback.print_exc()
        # Fallback if Ollama completely fails or times out
        return "AI Assessment unavailable. Please consult a professional.", 2, []

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
        diff_dx = ["URGENT EMERGENCY CARE REQUIRED"]
        
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
            is_red_flag=True,
            differential_diagnosis=diff_dx
        )
    
    # Call local Meditron for non-red-flag cases, passing the new history string
    history_str = patient_data.patient_history or "No history provided."
    ai_assessment, ai_severity, ai_diff_dx = await get_meditron_assessment(
        patient_data.symptoms, 
        history_str
    )
    
    # Save Routine/Urgent record to database
    # Note: We are saving the patient_message as the DB 'assessment'. 
    # If you later want to save the Differential Diagnosis to the DB, you will need to add a JSON/Array column to your Patient model.
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
        is_red_flag=False,
        differential_diagnosis=ai_diff_dx
    )