import json
import traceback
from app.core.config import settings

TRIAGE_PROMPT = """
You are Meditron, an expert AI medical triage assistant.

INSTRUCTIONS:
1. Analyze the patient symptoms and history carefully.
2. Determine a severity level from 1 to 4:
   - 1 = Routine (mild, non-urgent)
   - 2 = Low urgency (monitor at home)
   - 3 = Moderate (needs attention soon)
   - 4 = Urgent (needs same-day care)
   NOTE: Severity 5 is reserved for emergencies 
         and is handled separately before you are called.
3. Provide up to 3 differential diagnoses.
4. Write a polite, empathetic 2-sentence response 
   addressing the patient's specific symptoms.
5. Output ONLY valid JSON. No extra text, no markdown.

OUTPUT FORMAT:
{
  "reasoning_scratchpad": "your internal clinical reasoning",
  "severity_level": 2,
  "differential_diagnosis": ["Diagnosis 1", "Diagnosis 2", "Diagnosis 3"],
  "patient_message": "Empathetic 2-sentence response to the patient."
}
"""


async def get_ai_assessment(symptoms: str, patient_history: str):
    """
    Calls Gemini API for triage assessment.
    Returns: (assessment, severity, differential_diagnosis)
    """
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        prompt = f"""
{TRIAGE_PROMPT}

Patient Symptoms: {symptoms}
Patient History: {patient_history}
"""

        print(f"DEBUG: Calling Gemini API...")

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1,
            )
        )

        text = response.text
        print(f"DEBUG: Gemini raw response: {text}")

        ai_data = json.loads(text)

        print("\n🧠 GEMINI CLINICAL REASONING:")
        print(ai_data.get("reasoning_scratchpad", "No reasoning provided."))
        print("-" * 40)

        assessment = ai_data.get(
            "patient_message", 
            "Assessment unavailable. Please consult a professional."
        )
        severity = max(1, min(4, int(ai_data.get("severity_level", 2))))
        diff_dx = ai_data.get("differential_diagnosis", [])

        return assessment, severity, diff_dx

    except json.JSONDecodeError as e:
        print(f"❌ Gemini JSON parse error: {e}")
        raise ValueError("Invalid response format from AI service")

    except Exception as e:
        print(f"❌ Gemini API error: {e}")
        traceback.print_exc()
        raise e