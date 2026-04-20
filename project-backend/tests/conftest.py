import asyncio
import os
from pathlib import Path

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import JSON
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Force test-safe settings before app import.
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test.db"
os.environ["SYNC_DATABASE_URL"] = "sqlite:///./test.db"
os.environ["JWT_SECRET_KEY"] = "test-secret-key"
os.environ["JWT_ALGORITHM"] = "HS256"
os.environ["JWT_EXPIRE_MINUTES"] = "1440"

from app.main import app as fastapi_app
import app.models as app_models  # noqa: F401
from app.db.base import Base
from app.db.session import get_db
from app.models.career_track import CareerTrack
from app.models.career_track_module import CareerTrackModule
from app.models.module import Module
from app.models.subject_skill_mapping import SubjectSkillMapping

TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"
TEST_DB_PATH = Path("test.db")

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(test_engine, expire_on_commit=False, class_=AsyncSession)

# SQLite cannot compile PostgreSQL ARRAY type, so patch this test-only.
from app.models.student import Student

Student.__table__.c.interests.type = JSON()


async def override_get_db():
    async with TestSessionLocal() as session:
        yield session


fastapi_app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


async def _seed_reference_data(db: AsyncSession):
    modules_data = [
        ("Algebra Basics", "Academic Remediation", "Mathematics", "beginner", 6),
        ("Programming Fundamentals", "Academic Remediation", "Programming", "beginner", 10),
        ("Python Fundamentals", "Career Skill", "Machine Learning", "beginner", 8),
        ("Introduction to Machine Learning", "Career Skill", "Machine Learning", "intermediate", 15),
        ("Attendance Improvement Guide", "Attendance Recovery", "General", "beginner", 2),
    ]

    modules_by_title: dict[str, Module] = {}
    for title, category, domain, level, hours in modules_data:
        mod = Module(
            title=title,
            category=category,
            domain=domain,
            level=level,
            estimated_hours=hours,
            is_active=True,
        )
        db.add(mod)
        await db.flush()
        modules_by_title[title] = mod

    ml_track = CareerTrack(domain="Machine Learning", description="ML track", is_active=True)
    web_track = CareerTrack(domain="Web Development", description="Web track", is_active=True)
    db.add_all([ml_track, web_track])
    await db.flush()

    db.add_all(
        [
            CareerTrackModule(track_id=ml_track.track_id, module_id=modules_by_title["Python Fundamentals"].module_id, sequence_order=1),
            CareerTrackModule(track_id=ml_track.track_id, module_id=modules_by_title["Introduction to Machine Learning"].module_id, sequence_order=2),
        ]
    )

    db.add_all(
        [
            SubjectSkillMapping(
                subject_code="MATH101",
                module_id=modules_by_title["Algebra Basics"].module_id,
                priority=1,
                performance_level_trigger="both",
            ),
            SubjectSkillMapping(
                subject_code="CS101",
                module_id=modules_by_title["Programming Fundamentals"].module_id,
                priority=1,
                performance_level_trigger="both",
            ),
            SubjectSkillMapping(
                subject_code="WEAKSUBJ",
                module_id=modules_by_title["Programming Fundamentals"].module_id,
                priority=1,
                performance_level_trigger="weak",
            ),
            SubjectSkillMapping(
                subject_code="SUBJ001",
                module_id=modules_by_title["Programming Fundamentals"].module_id,
                priority=1,
                performance_level_trigger="weak",
            ),
        ]
    )

    await db.commit()


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db():
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await test_engine.dispose()

    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()


@pytest_asyncio.fixture(autouse=True)
async def reset_db():
    async with test_engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            await conn.execute(table.delete())

    async with TestSessionLocal() as db:
        await _seed_reference_data(db)

    yield


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=fastapi_app), base_url="http://test") as c:
        yield c


async def _register(client: AsyncClient, email: str, password: str, role: str, **kwargs):
    payload = {
        "email": email,
        "password": password,
        "full_name": "Test User",
        "role": role,
        "department": "CS",
        **kwargs,
    }
    return await client.post("/api/v1/auth/register", json=payload)


async def _login(client: AsyncClient, email: str, password: str) -> str:
    r = await client.post("/api/v1/auth/login", json={"email": email, "password": password})
    return r.json()["access_token"]


@pytest_asyncio.fixture
async def student_token(client: AsyncClient):
    await _register(
        client,
        "stu@test.com",
        "password123",
        "student",
        roll_number="R001",
        semester=3,
    )
    token = await _login(client, "stu@test.com", "password123")
    await client.put(
        "/api/v1/students/profile",
        headers={"Authorization": f"Bearer {token}"},
        json={"interests": ["Machine Learning"], "career_goal": "Machine Learning"},
    )
    return token


@pytest_asyncio.fixture
async def faculty_token(client: AsyncClient):
    await _register(client, "fac@test.com", "password123", "faculty")
    return await _login(client, "fac@test.com", "password123")


@pytest_asyncio.fixture
async def admin_token(client: AsyncClient):
    async with TestSessionLocal() as db:
        from app.core.security import hash_password
        from app.repositories.user_repository import create_user, get_user_by_email

        existing = await get_user_by_email(db, "admin@test.com")
        if not existing:
            await create_user(db, "admin@test.com", hash_password("Admin@1234"), "Admin", "admin")
            await db.commit()
    return await _login(client, "admin@test.com", "Admin@1234")
