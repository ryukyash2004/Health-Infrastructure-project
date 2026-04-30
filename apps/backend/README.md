# Aegis Backend Service

A high-performance FastAPI medical triage engine with deterministic safety interceptor and clinical reasoning powered by Meditron.

## Features

### Core Functionality
- **Triage Assessment Engine:** FastAPI service for processing patient symptom submissions and generating severity assessments
- **Red Flag Interceptor:** Deterministic safety module that immediately escalates critical symptoms (chest pain, difficulty breathing, etc.)
- **Queue Management:** Real-time patient queue with severity-based prioritization for doctor dashboard
- **Clinical Reasoning:** Integration with Meditron clinical LLM via Ollama for accurate medical assessments
- **Database Persistence:** PostgreSQL storage for patient records, assessments, and triage history
- **Async Architecture:** High-throughput async handlers supporting 100+ concurrent patient assessments

### API Endpoints

#### Patient Endpoints
- `POST /api/patients/submit` - Submit patient symptom data
- `GET /api/patients/{id}` - Retrieve patient record
- `GET /api/patients/{id}/history` - Get patient triage history

#### Triage Endpoints
- `POST /api/triage/assess` - Perform triage assessment on symptoms
- `GET /api/triage/queue` - Get current triage queue (priority ordered)

#### Doctor Dashboard Endpoints
- `GET /api/doctor/queue` - Get live triage queue with all patient details
- `GET /api/doctor/queue/{id}` - Get specific patient assessment details
- `POST /api/doctor/validate/{id}` - Doctor validates/updates assessment

## Tech Stack

- **Framework:** FastAPI (Python 3.11)
- **Database:** PostgreSQL (async via asyncpg)
- **ORM:** SQLAlchemy 2.0 (async support)
- **Validation:** Pydantic V2
- **Clinical AI:** Meditron (via Ollama)
- **Environment:** Python virtual environment

## Setup

### Prerequisites
- Python 3.11+
- PostgreSQL (via Docker Compose recommended)
- Ollama with Meditron model (`ollama pull meditron`)
- WSL 2 (if on Windows)

### Installation

1. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up PostgreSQL (Docker):**
   ```bash
   docker-compose up -d postgres
   ```

4. **Initialize database:**
   ```bash
   # Run migrations or create tables
   python reset_db.py
   ```

### Running the Server

```bash
# From the backend directory with venv activated
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The API will be available at:
- **API:** http://localhost:8000/api/v1
- **Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app initialization
│   ├── api/
│   │   └── routers/            # APIRouter modules (triage, patients, doctor)
│   ├── core/
│   │   ├── ai_service.py       # Meditron integration
│   │   ├── config.py           # Configuration management
│   │   ├── database.py         # Database setup
│   │   └── interceptor.py      # Red Flag Interceptor logic
│   ├── models/
│   │   └── patient.py          # SQLAlchemy ORM models
│   └── schemas/
│       ├── patient.py          # Patient validation schemas
│       └── triage.py           # Triage assessment schemas
├── tests/
│   ├── test_interceptor.py     # Unit tests for Red Flag Interceptor
│   └── run_tests.py
├── requirements.txt
├── reset_db.py                 # Database reset utility
└── README.md
```

## Key Modules

### Red Flag Interceptor (`core/interceptor.py`)
Deterministic safety module that scans symptoms for critical keywords before AI processing:
- Immediate escalation to `severity=5` (CRITICAL)
- Keywords: chest pain, difficulty breathing, unconscious, stroke symptoms, etc.
- Executes before Meditron processing for zero-latency safety

### AI Service (`core/ai_service.py`)
Integrates with Meditron clinical LLM via Ollama:
- Structured symptom assessment
- ICD-11 coded recommendations
- Severity scoring (1-5 scale)

### Database (`core/database.py`)
Async PostgreSQL integration:
- SQLAlchemy 2.0 with async support
- Connection pooling and session management
- Migration support via Alembic

## Testing

Run tests with:
```bash
python tests/run_tests.py
```

### Test Coverage
- Red Flag Interceptor logic
- Triage severity scoring
- Database CRUD operations
- API endpoint validation

## Deployment

### Docker Deployment
```bash
docker build -t aegis-backend .
docker run -p 8000:8000 \
  -e DATABASE_URL="postgresql://user:password@db:5432/aegis" \
  -e OLLAMA_BASE_URL="http://ollama:11434" \
  aegis-backend
```

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `OLLAMA_BASE_URL` - Ollama server URL (default: http://localhost:11434)
- `LOG_LEVEL` - Logging level (default: INFO)

## Known Issues & In Progress

- ⚠️ WebSocket support for real-time queue updates (planned)
- 🔄 RAG pipeline for ICD-11/PubMed context (in development)
- 📋 Authentication & RBAC (scheduled)
- 📋 HIPAA audit logging (scheduled)

## Contributing

Follow these guidelines when contributing:
1. Always use async/await for I/O operations
2. Use Pydantic V2 for validation
3. Include unit tests for new features
4. Follow the module structure in `app/`
5. Never hardcode secrets or API keys

## Support

For issues or questions about the backend service, check:
- API documentation at `/docs` (Swagger UI)
- Error logs in terminal output
- Database logs: `docker logs postgres` (if using Docker)

## License

Part of Project Aegis. See root LICENSE file.
