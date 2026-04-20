# Personalized Adaptive Learning Path Recommendation System - Backend

## Stack
FastAPI · Async SQLAlchemy (asyncpg) · PostgreSQL (Neon) · Alembic · Pydantic v2 · JWT

## Project Structure
app/
├── core/         # config, security, constants
├── db/           # async engine, session, base
├── models/       # SQLAlchemy ORM models (15 tables)
├── schemas/      # Pydantic request/response schemas
├── repositories/ # async DB query layer
├── services/     # business logic layer
├── api/v1/       # FastAPI routers and deps
└── utils/        # hashing, jwt, pagination, validators
scripts/          # seed_data.py, create_superadmin.py
tests/            # pytest-asyncio test suite
alembic/          # migration management

## Setup
1. Install dependencies:
```bash
pip install -r requirements.txt
```
2. Configure environment:
- Ensure `.env` contains `DATABASE_URL`, `SYNC_DATABASE_URL`, `JWT_SECRET_KEY`.
- `DATABASE_URL` must use async driver format: `postgresql+asyncpg://...`
3. Alembic baseline (existing DB schema already present):
```bash
alembic revision --autogenerate -m "baseline_existing_schema"
alembic stamp head
```
4. Seed reference/demo data:
```bash
python scripts/seed_data.py
```
5. Start API:
```bash
uvicorn app.main:app --reload
```

## API Docs
http://localhost:8000/docs

## Running Tests
```bash
pytest tests/ -v
```
Tests use SQLite (`aiosqlite`) and do not use Neon production DB.

## Architecture
Request flow:
Router -> Dependency (JWT + Role check) -> Service -> Repository -> ORM Model

## Roles
| Role | Access |
|---|---|
| student | Own profile, academic data, learning path, progress |
| faculty | Assigned students read-only monitoring |
| admin | User management, mappings, career track management |

## Key Flows
1. Register/Login -> JWT issued
2. Student enters marks -> `score_percent` computed -> `performance_level` classified
3. Academic save triggers -> `recalculate_skill_gap` -> `generate_learning_path`
4. Learning path order: Attendance Recovery -> Academic Remediation -> Career Skill (deduped)
5. Student marks module complete -> `completion_pct` updated on learning_path

## Business Rules (SRS)
- Strong: score >= 75 | Moderate: 50-74 | Weak: < 50
- Attendance at-risk: `attendance_pct < 75`
- Learning path ordering prioritized by remediation before career-focused modules (REQ-NF-23)
- No duplicate modules per path (REQ-NF-24)
- Faculty can only view assigned students (REQ-NF-22)

## Seed Data
```bash
python scripts/seed_data.py
```
- Idempotent and safe to re-run.

```bash
python scripts/create_superadmin.py
```
- Interactive admin creation utility.

## Non-Functional Controls
- BCrypt cost: 12 rounds
- JWT default expiry: 1440 minutes (24h)
- Generic 500 response: no internal stack details exposed to clients
- SQLAlchemy failures mapped to 503
- RBAC enforced through centralized dependency guards

## Useful Verification Commands
```bash
pytest tests/ -v
pytest tests/ --tb=short
```

```bash
# PowerShell search examples
Get-ChildItem app/repositories -Filter *.py -Recurse | Select-String -Pattern 'db\.commit\('
Get-ChildItem app/services -Filter *.py -Recurse | Select-String -Pattern 'db\.commit\('
```
