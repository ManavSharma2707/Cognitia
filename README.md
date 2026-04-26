# Cognitia - Personalized Adaptive Learning Path Recommendation System

Cognitia is a full-stack role-based academic intelligence platform that turns student profile data, academic records, and attendance trends into adaptive learning paths.

It is composed of:
- A React + Vite frontend for Student, Faculty, and Admin experiences
- A FastAPI backend with async SQLAlchemy for business logic and API orchestration
- PostgreSQL (Neon-compatible) for persistent data
- Alembic for migration/version control

---

## 1) What the System Does

Cognitia helps institutions:
- Detect weak and moderate performance areas by subject
- Detect attendance risk
- Map risk areas to remediation modules
- Generate ordered, de-duplicated learning paths
- Track module progress and completion percentage
- Allow faculty monitoring of assigned students
- Allow admins to manage users and mapping/track configuration

---

## 2) Repository Structure

```text
Cognitia/
├── render.yaml                    # Backend deployment config (Render)
├── cognitia-frontend/             # React app
│   ├── src/
│   │   ├── api/                   # Axios client + endpoint constants
│   │   ├── services/              # Frontend API wrappers by domain
│   │   ├── context/               # Auth context/session state
│   │   ├── router/                # Route protection + role routing
│   │   ├── pages/                 # Student/Faculty/Admin/Auth pages
│   │   └── components/            # Layout/UI/charts
│   └── vercel.json                # SPA routing config for Vercel
└── project-backend/
    ├── app/
    │   ├── api/v1/routers/        # FastAPI routers
    │   ├── services/              # Business workflow layer
    │   ├── repositories/          # Data access layer
    │   ├── models/                # SQLAlchemy ORM models
    │   ├── schemas/               # Pydantic request/response contracts
    │   ├── core/                  # Settings/security/constants
    │   └── db/                    # Async engine/session/base
    ├── alembic/                   # Migration environment + revisions
    ├── scripts/                   # Seed + admin utility scripts
    └── tests/                     # Async API integration tests
```

---

## 3) High-Level Architecture

## 3.1 Request and Data Flow

```text
React UI
  -> frontend service (axios wrapper)
  -> FastAPI router
  -> dependency guard (JWT decode + role check)
  -> service layer (business rules)
  -> repository layer (queries/updates)
  -> SQLAlchemy ORM
  -> PostgreSQL
```

## 3.2 Layer Responsibilities

- Router layer:
  - HTTP contract, status codes, dependency injection, schema validation
- Dependency layer:
  - OAuth2 bearer extraction, JWT decode, active user checks, RBAC gatekeeping
- Service layer:
  - End-to-end use-case orchestration, cross-domain workflows
- Repository layer:
  - Narrow data operations, joins, pagination, upserts, bulk inserts
- Model layer:
  - Table definitions, keys, relationships, constraints

---

## 4) Database Design

The backend models define a normalized, role-aware relational schema.

## 4.1 Core Identity and Role Tables

### users
- Primary key: user_id
- Key fields: email (unique), password_hash, full_name, role, is_active, timestamps
- Role values: student, faculty, admin

### students
- Primary key: student_id
- Foreign key: user_id -> users.user_id (unique 1:1)
- Key fields: roll_number (unique), department, semester, interests (ARRAY), career_goal

### faculty
- Primary key: faculty_id
- Foreign key: user_id -> users.user_id (unique 1:1)
- Key fields: department, designation

### faculty_student
- Primary key: id
- Foreign keys: faculty_id -> faculty.faculty_id, student_id -> students.student_id
- Constraint: unique(faculty_id, student_id)
- Purpose: faculty-to-student assignment map

## 4.2 Academic and Attendance Tables

### academic_records
- Primary key: record_id
- Foreign key: student_id -> students.student_id
- Unique constraint: unique(student_id, subject_code, semester)
- Key fields:
  - marks_obtained
  - max_marks
  - score_percent
  - performance_level
- Note:
  - Current runtime computes score_percent/performance_level in service code before insert
  - Existing production schema may treat score_percent as generated, so seed/runtime writes avoid explicit generated-column conflicts

### attendance_records
- Primary key: attendance_id
- Foreign key: student_id -> students.student_id
- Key fields: attendance_pct, at_risk, semester

## 4.3 Recommendation and Progress Tables

### modules
- Primary key: module_id
- Key fields: title, category, domain, level, estimated_hours, is_active
- Categories used:
  - Academic Remediation
  - Career Skill
  - Interest-Based
  - Attendance Recovery

### subject_skill_mappings
- Primary key: map_id
- Foreign key: module_id -> modules.module_id
- Key fields: subject_code, priority, performance_level_trigger (weak/moderate/both)
- Purpose: maps underperformance in a subject to recommended remediation modules

### skill_gaps
- Primary key: gap_id
- Foreign key: student_id -> students.student_id (unique)
- Key fields: weak_subject_count, moderate_subject_count, attendance_at_risk

### skill_gap_modules
- Primary key: id
- Foreign keys:
  - gap_id -> skill_gaps.gap_id (ON DELETE CASCADE)
  - module_id -> modules.module_id
- Key fields: source_subject_code, priority

### career_tracks
- Primary key: track_id
- Key fields: domain (unique), description, is_active

### career_track_modules
- Primary key: id
- Foreign keys: track_id -> career_tracks.track_id, module_id -> modules.module_id
- Unique constraint: unique(track_id, module_id)
- Key field: sequence_order

### learning_paths
- Primary key: path_id
- Foreign key: student_id -> students.student_id
- Key fields: is_current, completion_pct, generated_at

### learning_path_modules
- Primary key: id
- Foreign keys:
  - path_id -> learning_paths.path_id (ON DELETE CASCADE)
  - module_id -> modules.module_id
- Unique constraint: unique(path_id, module_id)
- Key field: sequence_order

### progress
- Primary key: progress_id
- Foreign keys:
  - student_id -> students.student_id
  - module_id -> modules.module_id
  - path_id -> learning_paths.path_id
- Unique constraint: unique(student_id, module_id, path_id)
- Key field: status (not_started, in_progress, completed)

---

## 5) Business Rules and Computation Logic

## 5.1 Threshold Rules

- Strong performance: score_percent >= 75
- Moderate performance: 50 <= score_percent < 75
- Weak performance: score_percent < 50
- Attendance risk: attendance_pct < 75

## 5.2 Validation Rules

- semester must be between 1 and 10
- attendance_pct must be between 0 and 100
- marks_obtained must be >= 0 and <= max_marks
- interests must be within allowed interests list
- progress status must be one of not_started/in_progress/completed

## 5.3 Triggered Workflows

### When a student adds an academic record
1. Backend computes score_percent and performance_level
2. Record is saved
3. Skill gap is recalculated
4. Learning path is generated/re-generated

### When a student updates profile interests/career_goal
1. Profile fields are saved
2. If academic data exists, skill gap is recalculated
3. Learning path is generated/re-generated

### When a student updates module status
1. Module ownership is verified against active path
2. Progress row is upserted
3. completion_pct is recomputed as completed/total * 100
4. learning_paths.completion_pct is updated

---

## 6) API Design and Workflow

All backend API routes are under /api/v1 except /health.

## 6.1 Authentication and Authorization

- Auth mechanism: JWT bearer token
- Token source: OAuth2PasswordBearer
- Claims used: sub (user_id)
- Role checks: require_student, require_faculty, require_admin, require_student_or_faculty
- Inactive users are rejected at dependency layer

## 6.2 Endpoint Matrix

### Auth
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/auth/me

### Student Profile
- GET /api/v1/students/profile
- PUT /api/v1/students/profile

### Academic
- POST /api/v1/academic/records
- GET /api/v1/academic/records?semester={n}

### Attendance
- POST /api/v1/attendance/records

### Analysis
- GET /api/v1/analysis/skill-gap
- POST /api/v1/analysis/skill-gap/recalculate

### Recommendations
- GET /api/v1/recommendations/learning-path
- POST /api/v1/recommendations/learning-path/generate
- GET /api/v1/recommendations/learning-path/history
- GET /api/v1/recommendations/career-tracks
- GET /api/v1/recommendations/career-tracks/{track_id}/modules

### Progress
- PATCH /api/v1/progress/modules/{module_id}
- GET /api/v1/progress/summary

### Faculty
- GET /api/v1/faculty/students
- GET /api/v1/faculty/students/{student_id}

### Admin
- GET /api/v1/users/?page=1&limit=20&role=student
- PATCH /api/v1/users/{user_id}/deactivate
- POST /api/v1/admin/mappings/
- POST /api/v1/admin/tracks/{track_id}/modules

### Health
- GET /health

## 6.3 Error Mapping Strategy

- IntegrityError -> HTTP 409
  - duplicate roll_number/email handled explicitly
- SQLAlchemyError -> HTTP 503
- Unhandled exceptions -> HTTP 500

---

## 7) Frontend Architecture and API Integration

## 7.1 Frontend Runtime Stack

- React 18 + Vite
- React Router
- Axios
- Tailwind CSS
- Framer Motion
- Chart.js + react-chartjs-2

## 7.2 API Client Contract

- axios instance base URL comes from VITE_API_BASE_URL
- Request interceptor:
  - Injects Authorization: Bearer <token> from localStorage
- Response interceptor:
  - On 401, clears localStorage session and redirects to /login

## 7.3 Client-Side Auth Lifecycle

- Auth context hydrates token and user from localStorage at startup
- ProtectedRoute enforces auth + role-based access
- Root route redirects authenticated users to role home:
  - student -> /student
  - faculty -> /faculty
  - admin -> /admin

## 7.4 Frontend Service Layer

Each domain has a dedicated file in cognitia-frontend/src/services:
- authService
- studentService
- academicService
- attendanceService
- analysisService
- recommendationService
- progressService
- facultyService
- adminService
- healthService

This keeps pages clean and centralizes endpoint usage.

---

## 8) End-to-End Functional Workflows

## 8.1 Student Onboarding and First Path

1. Student registers via auth/register
2. Student logs in via auth/login and receives JWT
3. Student updates interests and career_goal (optional but important)
4. Student submits academic record(s)
5. Backend recalculates skill gap
6. Backend generates ordered learning path
7. Student views path and starts modules
8. Progress updates modify overall completion percentage

## 8.2 Faculty Monitoring Workflow

1. Faculty logs in
2. Faculty opens assigned student summary
3. Faculty reviews weak subject counts, attendance risk, and completion status
4. Faculty opens student detail for academic + skill gap + path context

## 8.3 Admin Configuration Workflow

1. Admin logs in
2. Admin lists/deactivates user accounts
3. Admin creates subject->module mappings
4. Admin adds modules to career tracks
5. Student recommendations improve as mapping/track data gets richer

---

## 9) Local Development Setup

## 9.1 Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (or Neon)
- pip and npm

## 9.2 Backend Setup

```bash
cd project-backend
pip install -r requirements.txt
```

Create project-backend/.env:

```env
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST:PORT/DBNAME
SYNC_DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME
JWT_SECRET_KEY=change-this-secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
CORS_ORIGINS=["http://localhost:5173"]
```

Run migrations:

```bash
alembic upgrade head
```

Seed data (optional but recommended):

```bash
python scripts/seed_data.py
```

Create superadmin (optional):

```bash
python scripts/create_superadmin.py
```

Run backend:

```bash
uvicorn app.main:app --reload
```

Docs:
- Swagger UI: http://localhost:8000/docs
- Health: http://localhost:8000/health

## 9.3 Frontend Setup

```bash
cd cognitia-frontend
npm install
```

Create cognitia-frontend/.env:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Run frontend:

```bash
npm run dev
```

Build frontend:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## 10) Testing Strategy

Backend tests use pytest + pytest-asyncio + HTTPX ASGI transport.

- Test database: local SQLite (test.db)
- FastAPI dependency override injects test session
- Reference data seeded before each test

Run tests:

```bash
cd project-backend
pytest tests -v
```

Coverage focus includes:
- auth flows
- academic and attendance validations
- skill-gap computation
- recommendation generation and dedupe
- progress summaries/updates
- faculty role constraints
- admin routes and deactivation

---

## 11) Deployment Notes

## 11.1 Backend (Render)

render.yaml config:
- Service type: web
- Runtime: Python
- Start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
- Root dir: project-backend

Required env vars in deployment:
- DATABASE_URL
- SYNC_DATABASE_URL
- JWT_SECRET_KEY
- JWT_ALGORITHM
- JWT_EXPIRE_MINUTES
- CORS_ORIGINS

## 11.2 Frontend (Vercel)

- vercel.json rewrites all routes to index.html
- Supports SPA routing for nested React Router paths

---

## 12) Practical Notes and Known Nuances

- Backend settings are loaded at import time, so DATABASE_URL, SYNC_DATABASE_URL, and JWT_SECRET_KEY must be present.
- Alembic uses SYNC_DATABASE_URL, while app runtime uses DATABASE_URL (async).
- Utility scripts normalize postgres/postgresql URLs to asyncpg form and translate sslmode to ssl for async drivers.
- Existing Alembic history currently contains baseline-style revisions; align migration policy before adding structural schema changes.
- In environments where academic_records.score_percent is generated by DB schema, avoid explicitly inserting that field to prevent generated-column errors.

---

## 13) Quick API Workflow Examples

## 13.1 Register -> Login -> Me

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"student@example.com",
    "password":"Student@1234",
    "full_name":"Student One",
    "role":"student",
    "roll_number":"CS2026001",
    "department":"Computer Science",
    "semester":3
  }'

curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"Student@1234"}'

curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

## 13.2 Add Academic Record (Auto-Recommendation Trigger)

```bash
curl -X POST http://localhost:8000/api/v1/academic/records \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "subject_code":"MATH101",
    "subject_name":"Mathematics I",
    "marks_obtained":42,
    "max_marks":100,
    "semester":3
  }'
```

Then fetch:

```bash
curl http://localhost:8000/api/v1/analysis/skill-gap \
  -H "Authorization: Bearer <TOKEN>"

curl http://localhost:8000/api/v1/recommendations/learning-path \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 14) Why This Design Works

- Role-safe: strict server-side RBAC dependencies
- Explainable: explicit mapping from subject weakness to remediation modules
- Adaptive: path regeneration based on latest performance/profile
- Maintainable: clear router/service/repository split
- Scalable enough for educational pilot programs with evolving career tracks

---

## 15) Future Improvements (Optional Roadmap)

- Add explicit DB indexes for common analytical/filter paths
- Add migration squashing/rebase policy and clean baseline chain
- Add refresh token flow and token revocation list
- Add audit trail tables for path generation events
- Add frontend pagination/sorting for large faculty/admin datasets
- Add CI pipeline with linting, tests, and deployment checks
