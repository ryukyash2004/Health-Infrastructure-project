import os
import json
import httpx
from datetime import datetime
from pathlib import Path

# Configuration
BASE_URL = "http://127.0.0.1:8000/api/v1/triage/"
TESTS_DIR = Path(__file__).parent
RUNS_DIR = TESTS_DIR / "runs"

# Mock Payloads
MOCK_PATIENTS = [
    {
        "name": "Red Flag Case",
        "payload": {
            "patient_name": "Emergency Patient",
            "symptoms": "I have severe chest pain, left arm numbness, and I am struggling to breathe."
        }
    },
    {
        "name": "Routine Case",
        "payload": {
            "patient_name": "Routine Patient",
            "symptoms": "Slightly sore throat and some nasal congestion for two days."
        }
    },
    {
        "name": "Borderline Case",
        "payload": {
            "patient_name": "Concerned Patient",
            "symptoms": "I have a mild headache but I am also feeling very dizzy when I stand up."
        }
    },
    {
        "name": "Urgent Case",
        "payload": {
            "patient_name": "Urgent Patient",
            "symptoms": "I fell and I think I might have broken my wrist. It is swelling rapidly and I cannot move it."
        }
    },
    {
        "name": "Pediatric Routine",
        "payload": {
            "patient_name": "Child Patient",
            "symptoms": "Low grade fever and a mild rash on the torso. The child is eating and playing normally."
        }
    }
]

def run_tests():
    # 1. Create timestamped folder
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    current_run_dir = RUNS_DIR / timestamp
    current_run_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Starting test run: {timestamp}")
    print(f"Stashing results in: {current_run_dir}")

    # 2. Save inputs
    inputs_path = current_run_dir / "inputs.json"
    with open(inputs_path, "w") as f:
        json.dump([p["payload"] for p in MOCK_PATIENTS], f, indent=4)

    results = []

    # 3. Fire requests
    with httpx.Client() as client:
        for item in MOCK_PATIENTS:
            name = item["name"]
            payload = item["payload"]
            
            print(f"Testing: {name}...", end=" ", flush=True)
            try:
                response = client.post(BASE_URL, json=payload, timeout=300.0)

                status_code = response.status_code
                try:
                    data = response.json()
                except:
                    data = response.text

                results.append({
                    "test_name": name,
                    "input": payload,
                    "status_code": status_code,
                    "response": data
                })
                print(f"Done (Status: {status_code})")
            except Exception as e:
                print(f"Failed: {str(e)}")
                results.append({
                    "test_name": name,
                    "input": payload,
                    "error": str(e)
                })

    # 4. Save results
    results_path = current_run_dir / "results.json"
    with open(results_path, "w") as f:
        json.dump(results, f, indent=4)

    print(f"\nTest run complete. Summary saved to {results_path}")

if __name__ == "__main__":
    run_tests()
