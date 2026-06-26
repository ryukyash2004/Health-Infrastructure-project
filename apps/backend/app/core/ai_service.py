import json
import traceback
import asyncio
from app.core.config import settings

# Models tried in order — if first fails, tries next
GEMINI_MODELS = [
    "gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"
]

TRIAGE_PROMPT = """
You are Aegis, an expert AI medical triage assistant.

INSTRUCTIONS:
1. Analyze the patient symptoms and history carefully.
2. If a patient history field is absent or marked as not provided, do not infer,
   assume, or hallucinate values for that field. Treat missing data as genuinely unknown.
3. Determine a severity level from 1 to 4:
   - 1 = Routine (mild, non-urgent)
   - 2 = Low urgency (monitor at home)
   - 3 = Moderate (needs attention soon)
   - 4 = Urgent (needs same-day care)
   NOTE: Severity 5 is reserved for emergencies 
         and is handled separately before you are called.
4. Provide up to 3 differential diagnoses.
5. Write a polite, empathetic 2-sentence response 
   addressing the patient's specific symptoms.
6. Output ONLY valid JSON. No extra text, no markdown.

OUTPUT FORMAT:
{
  "reasoning_scratchpad": "your internal clinical reasoning",
  "severity_level": 2,
  "differential_diagnosis": ["Diagnosis 1", "Diagnosis 2", "Diagnosis 3"],
  "patient_message": "Empathetic 2-sentence response to the patient."
}
"""


def _is_real_history(value: str | None) -> bool:
    if not value:
        return False
    normalized = value.strip().lower()
    return normalized not in {"", "no history provided.", "no history provided"}


async def get_ai_assessment(symptoms: str, patient_history: str, skipped_fields: list[str] | None = None):
    """
    Calls Gemini API with automatic model fallback.
    Tries each model in GEMINI_MODELS list until one works.
    Returns: (assessment, severity, differential_diagnosis)
    """
    from google import genai
    from google.genai import types
    from google.genai.errors import ServerError, ClientError

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    prompt_sections = [TRIAGE_PROMPT.strip(), f"Patient Symptoms: {symptoms}"]

    if _is_real_history(patient_history):
        prompt_sections.append(f"Patient History: {patient_history}")

    if skipped_fields:
        prompt_sections.append(
            "The following sections were not filled by the patient: "
            + ", ".join(skipped_fields)
            + ". Do not reference or infer these."
        )

    prompt = "\n\n".join(prompt_sections)

    last_error = None

    for model in GEMINI_MODELS:
        try:
            print(f"DEBUG: Trying model {model}...")

            # Run blocking SDK call in a separate thread with a 4-second timeout
            response = await asyncio.wait_for(
                asyncio.to_thread(
                    client.models.generate_content,
                    model=model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.1,
                    )
                ),
                timeout=4.0
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

        except asyncio.TimeoutError as e:
            print(f"⚠️  Model {model} timed out (4s limit reached), trying next...")
            last_error = e
            continue

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
