# Aegis Backend: AI Coding Instructions

## Context
You are working on the core intelligence layer and REST API for "Aegis", a medical triage platform.
- **Stack:** FastAPI (Python 3.11), PostgreSQL (via asyncpg/SQLAlchemy or Supabase client).
- **Core Features:** Med-Gemini/PaLM integration, RAG pipeline (ICD-11/PubMed), and the Deterministic Red Flag Interceptor.

## Backend Rules
1. **FastAPI Paradigms:** Use `APIRouter` to compartmentalize routes (e.g., `/triage`, `/doctor`). Never dump all routes into `main.py`.
2. **Data Validation:** Use Pydantic V2 strictly for all request/response payloads. Define clear schemas for Patient Input and LLM Outputs.
3. **Asynchronous Execution:** Write asynchronous code (`async def`) for all I/O bound operations (database calls, LLM API requests) to ensure the server remains non-blocking.
4. **The Red Flag Interceptor:** This is a deterministic safety net. When writing triage logic, always apply a hardcoded keyword/regex scan on the input/output *before* returning the final payload to the frontend.
5. **Environment Management:** Never hardcode API keys or database URLs. Always read from `os.getenv` or use `pydantic-settings`.
6. **Error Handling:** Return proper HTTP status codes using `HTTPException` (e.g., 400 for bad input, 500 for LLM failure).