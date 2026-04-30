# Aegis Backend: AI Coding Instructions

## Context
You are working on the core intelligence layer and REST API for "Aegis", a medical triage platform.
- **Stack:** FastAPI (Python 3.11), PostgreSQL (via asyncpg/SQLAlchemy or Supabase client).
- **Core Features:** Meditron clinical reasoning, RAG pipeline (ICD-11/PubMed), and the Deterministic Red Flag Interceptor.
- **Architecture:** Modular routing with APIRouter, async-first design for high throughput.

## Backend Rules

### FastAPI Paradigms
1. **Modular Routing:** Use `APIRouter` to compartmentalize routes (e.g., `/api/triage`, `/api/patients`, `/api/doctor`). Never dump all routes into `main.py`.
2. **Route Organization:** Group related endpoints:
   - `/api/patients/` - Patient CRUD and history
   - `/api/triage/` - Triage assessment and queueing
   - `/api/doctor/` - Doctor dashboard endpoints (queue, validation)
   - `/api/health/` - Health checks and status

### Data Validation & Schemas
3. **Pydantic V2 Models:** Use Pydantic V2 strictly for all request/response payloads. Define clear schemas:
   - Separate input schemas from output schemas
   - Use descriptive field names with proper types (not `any`)
   - Include validation constraints (e.g., `Field(gt=0, le=5)` for severity levels)
4. **Schema Files:** Organize schemas in dedicated files:
   - `schemas/patient.py` - Patient input/output
   - `schemas/triage.py` - Triage assessment schemas
   - `schemas/doctor.py` - Doctor dashboard request/response models

### Asynchronous Execution
5. **Async-First:** Write asynchronous code (`async def`) for ALL I/O bound operations:
   - Database calls (use asyncpg or async SQLAlchemy)
   - LLM API requests (e.g., to Ollama or Gemini)
   - File I/O operations
6. **Non-Blocking:** Ensure the server remains non-blocking even under high concurrency (100+ patients in queue).

### The Red Flag Interceptor
7. **Safety Module:** This is a deterministic, hardcoded safety net that must:
   - Execute *before* any AI model processes symptoms
   - Scan input for critical keywords (e.g., "chest pain", "difficulty breathing", "loss of consciousness")
   - Immediately return `severity=5` (CRITICAL) and escalate to emergency protocols
   - Be easily auditable and unit-testable
   - Never rely on the AI model; use regex or hardcoded rules

### Environment & Secrets
8. **Never Hardcode:** Do not hardcode API keys or database URLs. Always read from:
   - `os.getenv()` for environment variables
   - `pydantic_settings.BaseSettings` for configuration management
   - Example: `OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")`

### Error Handling
9. **Proper HTTP Status Codes:** Return appropriate HTTPExceptions:
   - `400` for bad input (invalid severity, missing required fields)
   - `401` for unauthorized access
   - `404` for patient/record not found
   - `500` for LLM failures or database errors
   - Always include `detail` with a clear error message

### Database & ORM
10. **Database Sessions:** Use `Depends()` for database session injection:
    ```python
    async def get_db():
        async with SessionLocal() as session:
            yield session
    
    @router.get("/patients/{id}")
    async def get_patient(id: int, db: AsyncSession = Depends(get_db)):
        patient = await db.get(Patient, id)
        return patient
    ```
11. **Proper Foreign Keys:** Ensure cascading deletes and referential integrity in schemas.

### Testing & Debugging
12. **Unit Tests:** Write tests for:
    - Red Flag Interceptor (critical paths)
    - Triage severity scoring logic
    - Database CRUD operations
13. **Logging:** Use Python's logging module with appropriate levels (DEBUG, INFO, WARNING, ERROR).

## Current Implementation Status

### Completed
- ✅ FastAPI triage engine with structured JSON input parsing
- ✅ Deterministic Red Flag Interceptor (hardcoded safety checks)
- ✅ Mock database schema for Patient and TriageAssessment
- ✅ PostgreSQL integration via Docker Compose
- ✅ Async route handlers for scalability
- ✅ Meditron clinical LLM integration

### In Progress
- 🔄 Doctor dashboard queue endpoints (`/api/doctor/queue`)
- 🔄 RAG pipeline for ICD-11/PubMed context retrieval
- 🔄 Patient history tracking and correlation

### Planned
- 📋 Authentication & RBAC (doctor vs patient access)
- 📋 Audit logging for compliance (HIPAA)
- 📋 Real-time WebSocket updates for doctor queue

## Coding Guidelines

### Think Before Coding
1. **Don't Assume:** State assumptions explicitly before implementing.
2. **Surface Tradeoffs:** Identify performance, security, or maintainability tradeoffs early.
3. **Ask Questions:** If uncertain about requirements, ask rather than guess.

### Code Quality
- **Complete, Copyable Code:** Provide full, working code snippets. Never use `# ... rest of code`.
- **Error Handling:** Always include try/except blocks. Never fail silently.
- **Type Hints:** Use full type hints on all functions and methods.
- **Documentation:** Include docstrings for complex functions and business logic.