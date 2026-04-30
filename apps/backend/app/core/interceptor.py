import re
import string
from typing import List

# Expanded list of critical keywords for deterministic safety override
CRITICAL_KEYWORDS: List[str] = [
    "chest pain",
    "unconscious",
    "stroke",
    "severe bleeding",
    "heart attack",
    "breathing difficulty",
    "shortness of breath",
    "paralysis",
    "seizure",
    "crushing chest",
    "cannot breathe",
    "overdose",
    "suicide",
    "poisoning",
    "anaphylaxis",
    "allergic reaction",
    "loss of consciousness",
    "unresponsive",
    "throat closing",
    "sudden vision loss",
    "sudden severe headache",
    "can't swallow"
]

def normalize_text(text: str) -> str:
    """
    Normalizes text for robust keyword matching:
    1. Converts to lowercase.
    2. Removes apostrophes (e.g., "can't" -> "cant").
    3. Replaces punctuation with spaces.
    4. Handles "cannot" by normalizing it to "cant" to match variations.
    5. Collapses multiple spaces.
    """
    if not text:
        return ""
    
    # Lowercase
    text = text.lower()
    
    # Remove apostrophes specifically before other punctuation handling
    text = text.replace("'", "")
    
    # Normalize 'cannot' to 'cant' to align with 'cant'/'can't' variations
    text = text.replace("cannot", "cant")
    
    # Replace other punctuation with spaces
    translator = str.maketrans(string.punctuation, ' ' * len(string.punctuation))
    text = text.translate(translator)
    
    # Collapse whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def evaluate_red_flags(text: str) -> bool:
    """
    Deterministic Red Flag Interceptor.
    Scans input text for life-threatening symptoms before AI processing.
    Now with improved case-insensitive, punctuation-resilient matching.
    """
    normalized_input = normalize_text(text)
    
    # Normalize keywords as well to ensure parity
    for keyword in CRITICAL_KEYWORDS:
        normalized_keyword = normalize_text(keyword)
        if normalized_keyword in normalized_input:
            return True
            
    return False
