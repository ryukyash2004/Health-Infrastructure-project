# Aegis: An Agentic Medical AI Ecosystem

## Project Overview
Aegis is a full-stack, hybrid Human-in-the-Loop (HITL) healthcare platform designed as a force multiplier for medical professionals. It bridges the gap between AI diagnostics and emergency intervention by allowing a single physician to efficiently validate assessments for up to 100 patients.

### Architecture Layers
1.  **Multimodal Presentation Layer:** Web App (Next.js), Mobile App (React Native/Expo), and Voice Hotline (Twilio/CCAI).
2.  **AI Intelligence Layer (AI Shield):** Clinical reasoning engine powered by Med-PaLM/Gemini 1.5 Pro with RAG pipeline (LangChain/LlamaIndex) grounded in ICD-11 and PubMed.
3.  **Deterministic Red Flag Interceptor:** Parallel safety module for immediate override on life-threatening symptoms.
4.  **HITL Validation Layer:** Prioritized Doctor Dashboard ranking assessments by severity (Critical, Serious, Routine).
5.  **Autonomous Action Layer:** Industry-standard protocol execution (HL7 FHIR R4 for EHR/Booking, NG911 for emergency dispatch).

### Technology Stack
-   **Languages:** Python 3.11, TypeScript (ES2024).
-   **Frontend:** Next.js with Tailwind CSS, React Native (Expo).
-   **Backend:** FastAPI (Python).
-   **Database:** PostgreSQL (Supabase/Neon), ChromaDB/pgvector for RAG.
-   **Auth/State:** Supabase Auth, Upstash Redis.
-   **Compliance:** AES-256/TLS 1.3 (HIPAA standards).

## Monorepo Structure
This project is managed using **Turborepo** and **pnpm**.

### Applications (`/apps`)
-   **`doctor-dashboard`**: Next.js application for medical professionals to review and validate AI triage assessments.
-   **`docs`**: Technical documentation and system guides.

### Packages (`/packages`)
-   **`medical-logic`**: Core clinical reasoning definitions, triage priorities, and HITL status interfaces.
-   **`ui`**: Shared React component library.
-   **`eslint-config`**: Centralized ESLint configurations.
-   **`typescript-config`**: Shared TypeScript configuration files.

## Building and Running

### Prerequisites
- Node.js (>=18)
- pnpm (>=9)

### Key Commands
```bash
# Install dependencies
pnpm install

# Run all applications in development mode
pnpm dev

# Build all applications and packages
pnpm build

# Lint the entire codebase
pnpm lint

# Run type-checking across all packages
pnpm check-types

# Format code with Prettier
pnpm format
```

## Development Conventions
-   **Strict Typing:** Always use TypeScript for frontend and package logic.
-   **Component Sharing:** UI components should be developed in `packages/ui` for consistency.
-   **HITL Priority:** Triage priorities are defined as `RED` (Critical), `AMBER` (Serious), and `GREEN` (Routine).
-   **Safety First:** The `Red Flag Interceptor` logic must always take precedence over AI-generated assessments.


## General AI Coding Rules
- **Think Before You Write:** Always provide a brief, logical step-by-step plan before writing large blocks of code.
- **No Boilerplate Omissions:** Do not use comments like `// ... rest of code`. Provide complete, copy-pasteable snippets unless explicitly asked to summarize.
- **Error Handling:** Always include robust error handling (e.g., `try/catch` blocks in TS, `try/except` with HTTPExceptions in FastAPI). Never fail silently.
- **Environment Variables:** Never hardcode secrets, API keys, or database URLs. Always use `process.env` (TS) or `os.getenv` / `pydantic-settings` (Python).

## Frontend Best Practices (Next.js, TypeScript, Tailwind)
- **Strict TypeScript:** Strictly type all props, state, and API responses. Avoid using `any`. Use `interfaces` and `types` consistently.
- **Component Architecture:** - Default to React Server Components (RSC) to minimize client bundle size. 
  - Use Client Components (`"use client"`) only when hooks (`useState`, `useEffect`) or browser APIs are strictly required.
- **Styling:** Use Tailwind CSS utility classes exclusively. Keep class strings organized.
- **Data Fetching:** Use standard Next.js fetch API for server-side fetching, and tools like React Query or SWR if client-side data mutation and caching are necessary.

## Backend Best Practices (FastAPI, Python)
- **Modular Routing:** Do not put everything in `main.py`. Use `APIRouter` to break endpoints into logical modules (e.g., `/api/triage`, `/api/patients`, `/api/auth`).
- **Pydantic Models:** Use Pydantic V2 models for all request and response validation. Keep schemas in dedicated files (e.g., `schemas.py`).
- **Dependency Injection:** Utilize FastAPI's `Depends()` for database sessions, rate limiting algorithms (e.g., token/leaky bucket implementations), and user authentication checks.
- **Asynchronous Code:** Write `async def` route handlers and use async database drivers (like `asyncpg` or Supabase async clients) to maintain high throughput.

## Specific Architectural Guidelines
- **RAG Pipeline:** Keep the retrieval logic and prompt construction cleanly separated from the API route handlers.
- **Red Flag Interceptor:** The deterministic logic must be hardcoded, easily auditable, and unit-testable. It must execute *before* final AI generation to ensure zero latency on critical safety checks.
- **Database Schemas:** Use clear, relational structures. When generating SQL or ORM models, ensure proper foreign keys and cascading deletes are configured.