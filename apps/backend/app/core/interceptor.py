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

NEGATION_WORDS = {
    "no", "not", "without", "never", "free", "absence", "didnt", "dont", "cant",
    "wasnt", "arent", "isnt", "clear", "denies", "denied", "negative", "none"
}

def evaluate_red_flags(text: str) -> bool:
    """
    Deterministic Red Flag Interceptor.
    Scans input text for life-threatening symptoms before AI processing.
    Utilizes a word-level search with prefix negation checking to prevent false positives.
    """
    if not text:
        return False
        
    normalized_input = normalize_text(text)
    input_words = normalized_input.split()
    
    for keyword in CRITICAL_KEYWORDS:
        kw_words = normalize_text(keyword).split()
        if not kw_words:
            continue
            
        # Search for kw_words as a consecutive sublist in input_words
        len_kw = len(kw_words)
        for i in range(len(input_words) - len_kw + 1):
            if input_words[i : i + len_kw] == kw_words:
                # Check for negation words in the preceding 3-word window
                prefix_start = max(0, i - 3)
                prefix_words = input_words[prefix_start : i]
                
                is_negated = any(neg in prefix_words for neg in NEGATION_WORDS)
                if not is_negated:
                    return True  # Found a valid, non-negated red flag
                    
    return False
