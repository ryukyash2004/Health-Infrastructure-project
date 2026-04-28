from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import ollama
import re
import json
import traceback
from datetime import datetime

from app.schemas.triage import PatientInput, TriageResponse
from app.core.interceptor import evaluate_red_flags
from app.core.database import get_db
from app.models.patient import Patient

router = APIRouter()

SYSTEM_PROMPT = """
You are Meditron, an expert AI triage assistant. 

INSTRUCTIONS:
1. Analyze the patient's symptoms and patient history.
2. Determine a severity level (1-5, where 5 is an emergency).
3. Provide up to 3 differential diagnoses.
4. Write a polite, 2-sentence empathetic response addressing the patient's specific symptom.
5. You MUST output ONLY valid JSON.

EXAMPLE INPUT:
"I have a sharp pain in my lower right abdomen."

EXAMPLE OUTPUT:
{
  "reasoning_scratchpad": "Right lower quadrant pain is highly suspicious for appendicitis. Requires urgent evaluation.",
  "severity_level": 4,
  "differential_diagnosis": ["Acute Appendicitis", "Ovarian Cyst Rupture", "Kidney Stone"],
  "patient_message": "I understand you are experiencing severe abdominal pain, which sounds very uncomfortable. I have logged this with the clinic and a doctor will review your case shortly."
}

Now, process the user's actual input. GENERATE A BRAND NEW JSON RESPONSE. DO NOT COPY THE EXAMPLE ABOVE.
"""

@router.post("/assessment")

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
    
    now_str = datetime.now().strftime("%d %b %Y, %I:%M %p")
    
    if is_red_flag:
        assessment = "CRITICAL: Life-threatening symptom detected. Emergency protocols initiated. Please call 911 immediately or proceed to the nearest ER."
        severity = 5
        diff_dx = ["URGENT EMERGENCY CARE REQUIRED"]
        
        # Save Red Flag record immediately
        new_patient = Patient(
            patient_name=patient_data.patient_name,
            symptoms=patient_data.symptoms,
            patient_history=patient_data.patient_history,
            assessment=assessment,
            severity=severity,
            is_red_flag=True,
            differential_diagnosis=diff_dx,
            visit_date=now_str,
            visit_type="EMERGENCY"
        )
        db.add(new_patient)
        await db.commit()
        await db.refresh(new_patient)
        
        return TriageResponse(
            patient_id=new_patient.id,
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
    new_patient = Patient(
        patient_name=patient_data.patient_name,
        symptoms=patient_data.symptoms,
        patient_history=history_str,
        assessment=ai_assessment,
        severity=ai_severity,
        is_red_flag=False,
        differential_diagnosis=ai_diff_dx,
        visit_date=now_str,
        visit_type="OPD"
    )
    db.add(new_patient)
    await db.commit()
    await db.refresh(new_patient)
    
    return TriageResponse(
        patient_id=new_patient.id,
        assessment=ai_assessment,
        severity=ai_severity,
        is_red_flag=False,
        differential_diagnosis=ai_diff_dx
    )
