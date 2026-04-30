import pytest
from app.core.interceptor import evaluate_red_flags

def test_exact_matches():
    """Test that exact phrases from the dictionary trigger the interceptor."""
    assert evaluate_red_flags("I have chest pain") is True
    assert evaluate_red_flags("heart attack") is True
    assert evaluate_red_flags("sudden severe headache") is True
    assert evaluate_red_flags("anaphylaxis") is True

def test_case_insensitivity():
    """Test that matching works regardless of character casing."""
    assert evaluate_red_flags("CHEST PAIN") is True
    assert evaluate_red_flags("Heart Attack") is True
    assert evaluate_red_flags("SuDdEn SeVeRe HeAdAcHe") is True
    assert evaluate_red_flags("OVERDOSE") is True

def test_punctuation_and_normalization():
    """Test that punctuation and contractions are handled correctly."""
    # Apostrophe removal and 'cant' variation
    assert evaluate_red_flags("I can't breathe") is True
    assert evaluate_red_flags("I cant breathe") is True
    assert evaluate_red_flags("I cannot breathe") is True
    
    # Other punctuation
    assert evaluate_red_flags("Stroke!!!") is True
    assert evaluate_red_flags("Severe-bleeding") is True
    assert evaluate_red_flags("Crushing... chest... pain") is True
    assert evaluate_red_flags("Throat closing?") is True

def test_new_emergency_keywords():
    """Verify that all newly requested phrases trigger the interceptor."""
    keywords = [
        "crushing chest", "cannot breathe", "overdose", "suicide", 
        "poisoning", "anaphylaxis", "allergic reaction", 
        "loss of consciousness", "unresponsive", "throat closing", 
        "sudden vision loss", "sudden severe headache", "can't swallow"
    ]
    for kw in keywords:
        assert evaluate_red_flags(f"The patient has {kw}") is True

def test_false_positives():
    """Test that non-emergency phrases do NOT trigger the interceptor."""
    assert evaluate_red_flags("I have a minor headache") is False
    assert evaluate_red_flags("I am feeling fine") is False
    assert evaluate_red_flags("My chest is slightly itchy") is False
    assert evaluate_red_flags("The cat is sleeping") is False
    assert evaluate_red_flags("I have a stomach ache") is False
    assert evaluate_red_flags("I need a routine checkup") is False

def test_empty_or_whitespace_input():
    """Ensure empty strings or whitespace don't cause errors or false hits."""
    assert evaluate_red_flags("") is False
    assert evaluate_red_flags("   ") is False
    assert evaluate_red_flags("\n\t") is False
