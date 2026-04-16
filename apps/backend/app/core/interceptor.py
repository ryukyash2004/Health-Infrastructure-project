from typing import List

# Pre-defined list of critical keywords for deterministic safety override
CRITICAL_KEYWORDS: List[str] = [
    "chest pain",
    "unconscious",
    "stroke",
    "severe bleeding",
    "heart attack",
    "breathing difficulty",
    "shortness of breath",
    "paralysis",
    "seizure"
]

def evaluate_red_flags(text: str) -> bool:
    """
    Deterministic Red Flag Interceptor.
    Scans input text for life-threatening symptoms before AI processing.
    """
    normalized_text = text.lower()
    return any(keyword in normalized_text for keyword in CRITICAL_KEYWORDS)
