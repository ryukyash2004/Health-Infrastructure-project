# Project Aegis

Project Aegis is a healthcare triage monorepo with:

- `apps/patient-app`: patient-facing Next.js triage chat
- `apps/doctor-app`: doctor-facing Next.js triage dashboard
- `apps/backend`: FastAPI + PostgreSQL backend
- `packages/ui`: shared UI components

## Stack

- Frontend: Next.js 16, React 19, Tailwind CSS, Zustand
- Backend: FastAPI, SQLAlchemy async, PostgreSQL
- Monorepo: pnpm workspaces + Turborepo
- AI: Gemini via `google-genai`

## Prerequisites

- Node.js 18+
- `pnpm`
- Python 3.12 recommended
- PostgreSQL running locally
- WSL for backend development

## Backend Environment

Create `apps/backend/.env` with:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/aegis
GEMINI_API_KEY=your_key_here
AI_PROVIDER=gemini
```

Update the values to match your local PostgreSQL and Gemini setup.

## Install

From the repo root:

```bash
pnpm install
```

For the backend, in WSL:

```bash
cd /mnt/e/code/Health\ Infrastructure\ project/apps/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## First Startup

### 1. Start the backend in WSL

```bash
cd /mnt/e/code/Health\ Infrastructure\ project/apps/backend
source venv/bin/activate
python reset_db.py
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Notes:

- `reset_db.py` drops and recreates backend tables.
- Run it on first setup and any time the SQLAlchemy schema changes.
- It deletes existing backend table data.

### 2. Start the patient app

From Windows PowerShell in the repo root:

```powershell
pnpm --filter patient-app dev
```

Patient app:

- `http://localhost:3000`

### 3. Start the doctor app

From Windows PowerShell in the repo root:

```powershell
pnpm --filter doctor-app dev
```

Doctor app:

- `http://localhost:3001`

## Daily Startup

If the database schema has not changed:

### Terminal 1: backend in WSL

```bash
cd /mnt/e/code/Health\ Infrastructure\ project/apps/backend
source venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Terminal 2: patient app

```powershell
pnpm --filter patient-app dev
```

### Terminal 3: doctor app

```powershell
pnpm --filter doctor-app dev
```

## Useful Commands

Repo-wide:

```powershell
pnpm dev
pnpm build
pnpm lint
pnpm check-types
```

Backend schema reset:

```bash
cd /mnt/e/code/Health\ Infrastructure\ project/apps/backend
source venv/bin/activate
python reset_db.py
```

## Important Notes

- The backend is expected to run from WSL.
- The frontends run from Windows and talk to the backend at `http://localhost:8000`.
- If the backend starts failing with missing-column database errors, run `python reset_db.py` again in WSL.
- Some older app-specific README files in the repo may be outdated.
