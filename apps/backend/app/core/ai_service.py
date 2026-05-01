import json
import traceback
from app.core.config import settings

# Models tried in order — if first fails, tries next
GEMINI_MODELS = [
    "gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.5", "gemini-2.0-flash", "gemini-2.0-pro", "gemini-2.0"
]

TRIAGE_PROMPT = """
You are Aegis, an expert AI medical triage assistant.

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
    Calls Gemini API with automatic model fallback.
    Tries each model in GEMINI_MODELS list until one works.
    Returns: (assessment, severity, differential_diagnosis)
    """
    from google import genai
    from google.genai import types
    from google.genai.errors import ServerError, ClientError

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    prompt = f"""
{TRIAGE_PROMPT}

Patient Symptoms: {symptoms}
Patient History: {patient_history}
"""

    last_error = None

    for model in GEMINI_MODELS:
        try:
            print(f"DEBUG: Trying model {model}...")

            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1,
                )
            )

            text = response.text
            print(f"DEBUG: {model} responded successfully")

            ai_data = json.loads(text)

            print(f"\n🧠 GEMINI CLINICAL REASONING ({model}):")
            print(ai_data.get("reasoning_scratchpad", "No reasoning provided."))
            print("-" * 40)

            assessment = ai_data.get(
                "patient_message",
                "Assessment unavailable. Please consult a professional."
            )
            severity = max(1, min(4, int(ai_data.get("severity_level", 2))))
            diff_dx = ai_data.get("differential_diagnosis", [])

            return assessment, severity, diff_dx

        except ServerError as e:
            # 503 overloaded — try next model
            print(f"⚠️  Model {model} unavailable (503), trying next...")
            last_error = e
            continue

        except ClientError as e:
            if "429" in str(e):
                # Quota exceeded — try next model
                print(f"⚠️  Model {model} quota exceeded (429), trying next...")
                last_error = e
                continue
            else:
                # Different client error — log and try next
                print(f"⚠️  Model {model} client error: {e}, trying next...")
                last_error = e
                continue

        except json.JSONDecodeError as e:
            print(f"❌ JSON parse error from {model}: {e}")
            last_error = e
            continue

        except Exception as e:
            print(f"❌ Unexpected error from {model}: {e}")
            last_error = e
            continue

    # All models failed
    print(f"❌ All Gemini models failed. Last error: {last_error}")
    return (
        "Our AI assessment is temporarily unavailable due to high demand. "
        "A doctor will review your case manually. Please wait.",
        2,
        []
    )