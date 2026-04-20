import asyncio
import os
import sys
from decimal import Decimal
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from sqlalchemy import insert, select
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def ensure_async_database_url() -> None:
    load_dotenv()
    db_url = os.getenv("DATABASE_URL", "")
    if not db_url:
        return

    if db_url.startswith("postgresql://") and "+asyncpg" not in db_url:
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif db_url.startswith("postgres://") and "+asyncpg" not in db_url:
        db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)

    parts = urlsplit(db_url)
    query = parse_qsl(parts.query, keep_blank_values=True)
    normalized_query: list[tuple[str, str]] = []
    for key, value in query:
        if key == "sslmode":
            if value:
                normalized_query.append(("ssl", value))
        else:
            normalized_query.append((key, value))

    db_url = urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(normalized_query), parts.fragment))
    os.environ["DATABASE_URL"] = db_url


ensure_async_database_url()

from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.academic_record import AcademicRecord
from app.models.attendance_record import AttendanceRecord
from app.models.career_track import CareerTrack
from app.models.career_track_module import CareerTrackModule
from app.models.faculty import Faculty
from app.models.faculty_student import FacultyStudent
from app.models.module import Module
from app.models.student import Student
from app.models.subject_skill_mapping import SubjectSkillMapping
from app.models.user import User
from app.repositories.learning_path_repository import get_current_path
from app.services.analysis_service import recalculate_skill_gap
from app.services.recommendation_service import generate_learning_path
from app.utils.validators import compute_at_risk, compute_performance_level, compute_score_percent

MODULES = [
    {"title": "Algebra Basics", "category": "Academic Remediation", "domain": "Mathematics", "level": "beginner", "hours": 6},
    {"title": "Probability and Statistics", "category": "Academic Remediation", "domain": "Mathematics", "level": "intermediate", "hours": 8},
    {"title": "Programming Fundamentals", "category": "Academic Remediation", "domain": "Programming", "level": "beginner", "hours": 10},
    {"title": "Data Structures Basics", "category": "Academic Remediation", "domain": "Programming", "level": "intermediate", "hours": 12},
    {"title": "Python Fundamentals", "category": "Career Skill", "domain": "Machine Learning", "level": "beginner", "hours": 8},
    {"title": "Introduction to Machine Learning", "category": "Career Skill", "domain": "Machine Learning", "level": "intermediate", "hours": 15},
    {"title": "Advanced ML Techniques", "category": "Career Skill", "domain": "Machine Learning", "level": "advanced", "hours": 20},
    {"title": "HTML and CSS Fundamentals", "category": "Career Skill", "domain": "Web Development", "level": "beginner", "hours": 6},
    {"title": "Web Development Basics", "category": "Career Skill", "domain": "Web Development", "level": "intermediate", "hours": 10},
    {"title": "React.js Introduction", "category": "Career Skill", "domain": "Web Development", "level": "advanced", "hours": 12},
    {"title": "SQL Basics", "category": "Academic Remediation", "domain": "DBMS", "level": "beginner", "hours": 6},
    {"title": "Data Analysis with Python", "category": "Career Skill", "domain": "Data Science", "level": "intermediate", "hours": 12},
    {"title": "Machine Learning for Data Science", "category": "Career Skill", "domain": "Data Science", "level": "advanced", "hours": 18},
    {"title": "DSA Fundamentals", "category": "Career Skill", "domain": "DSA", "level": "beginner", "hours": 10},
    {"title": "Advanced Data Structures", "category": "Career Skill", "domain": "DSA", "level": "intermediate", "hours": 15},
    {"title": "Competitive Programming", "category": "Career Skill", "domain": "DSA", "level": "advanced", "hours": 20},
    {"title": "Cloud Computing Overview", "category": "Career Skill", "domain": "Cloud Computing", "level": "beginner", "hours": 8},
    {"title": "AWS/Azure Fundamentals", "category": "Career Skill", "domain": "Cloud Computing", "level": "intermediate", "hours": 12},
    {"title": "Cloud Architecture", "category": "Career Skill", "domain": "Cloud Computing", "level": "advanced", "hours": 16},
    {"title": "UI/UX Design Principles", "category": "Career Skill", "domain": "UI/UX Design", "level": "beginner", "hours": 6},
    {"title": "Figma and Prototyping", "category": "Career Skill", "domain": "UI/UX Design", "level": "intermediate", "hours": 8},
    {"title": "Advanced UX Research", "category": "Career Skill", "domain": "UI/UX Design", "level": "advanced", "hours": 10},
    {"title": "Attendance Improvement Guide", "category": "Attendance Recovery", "domain": "General", "level": "beginner", "hours": 2},
]

CAREER_TRACKS = [
    "Machine Learning",
    "Web Development",
    "Data Science",
    "DSA",
    "Cloud Computing",
    "UI/UX Design",
]

CAREER_TRACK_MODULES = {
    "Machine Learning": [
        ("Python Fundamentals", 1),
        ("Introduction to Machine Learning", 2),
        ("Advanced ML Techniques", 3),
    ],
    "Web Development": [
        ("HTML and CSS Fundamentals", 1),
        ("Web Development Basics", 2),
        ("React.js Introduction", 3),
    ],
    "Data Science": [
        ("SQL Basics", 1),
        ("Data Analysis with Python", 2),
        ("Machine Learning for Data Science", 3),
    ],
    "DSA": [
        ("DSA Fundamentals", 1),
        ("Advanced Data Structures", 2),
        ("Competitive Programming", 3),
    ],
    "Cloud Computing": [
        ("Cloud Computing Overview", 1),
        ("AWS/Azure Fundamentals", 2),
        ("Cloud Architecture", 3),
    ],
    "UI/UX Design": [
        ("UI/UX Design Principles", 1),
        ("Figma and Prototyping", 2),
        ("Advanced UX Research", 3),
    ],
}

SUBJECT_SKILL_MAPPINGS = [
    ("MATH101", "Algebra Basics", 1, "both"),
    ("MATH101", "Probability and Statistics", 2, "weak"),
    ("CS101", "Programming Fundamentals", 1, "both"),
    ("CS101", "Data Structures Basics", 2, "weak"),
    ("DBMS201", "SQL Basics", 1, "both"),
    ("CS201", "Data Structures Basics", 1, "both"),
    ("CS301", "Python Fundamentals", 1, "weak"),
]

DEMO_USERS = [
    {
        "email": "admin@system.com",
        "password": "Admin@1234",
        "full_name": "System Admin",
        "role": "admin",
    },
    {
        "email": "faculty1@college.edu",
        "password": "Faculty@1234",
        "full_name": "Dr. Priya Sharma",
        "role": "faculty",
        "department": "Computer Science",
        "designation": "Assistant Professor",
    },
    {
        "email": "faculty2@college.edu",
        "password": "Faculty@1234",
        "full_name": "Prof. Rahul Mehta",
        "role": "faculty",
        "department": "Information Technology",
        "designation": "Associate Professor",
    },
    {
        "email": "student1@college.edu",
        "password": "Student@1234",
        "full_name": "Ananya Singh",
        "role": "student",
        "roll_number": "CS2021001",
        "department": "Computer Science",
        "semester": 5,
        "interests": ["Machine Learning", "DSA"],
        "career_goal": "Machine Learning",
    },
    {
        "email": "student2@college.edu",
        "password": "Student@1234",
        "full_name": "Rohan Patel",
        "role": "student",
        "roll_number": "CS2021002",
        "department": "Computer Science",
        "semester": 5,
        "interests": ["Web Development"],
        "career_goal": "Web Development",
    },
    {
        "email": "student3@college.edu",
        "password": "Student@1234",
        "full_name": "Meera Nair",
        "role": "student",
        "roll_number": "IT2021001",
        "department": "Information Technology",
        "semester": 4,
        "interests": ["Data Science"],
        "career_goal": "Data Science",
    },
    {
        "email": "student4@college.edu",
        "password": "Student@1234",
        "full_name": "Karan Joshi",
        "role": "student",
        "roll_number": "CS2022001",
        "department": "Computer Science",
        "semester": 3,
        "interests": ["Cloud Computing"],
        "career_goal": "Cloud Computing",
    },
    {
        "email": "student5@college.edu",
        "password": "Student@1234",
        "full_name": "Divya Reddy",
        "role": "student",
        "roll_number": "IT2022001",
        "department": "Information Technology",
        "semester": 3,
        "interests": ["UI/UX Design"],
        "career_goal": "UI/UX Design",
    },
]

ASSIGNMENTS = {
    "faculty1@college.edu": [
        "student1@college.edu",
        "student2@college.edu",
        "student3@college.edu",
    ],
    "faculty2@college.edu": [
        "student4@college.edu",
        "student5@college.edu",
    ],
}

ACADEMIC_SEED = {
    "student1@college.edu": [
        ("MATH101", "Mathematics I", 38.0, 100.0),
        ("CS101", "Programming in C", 65.0, 100.0),
        ("DBMS201", "Database Management", 85.0, 100.0),
    ],
    "student2@college.edu": [
        ("CS101", "Programming in C", 44.0, 100.0),
        ("CS201", "Data Structures", 78.0, 100.0),
        ("MATH101", "Mathematics I", 55.0, 100.0),
    ],
}

ATTENDANCE_SEED = {
    "student1@college.edu": [
        ("MATH101", "Mathematics I", 60.0),
        ("CS101", "Programming in C", 82.0),
    ]
}

SEED_CONTEXT: dict[str, dict] = {"users": {}, "students": {}, "faculty": {}, "modules": {}, "tracks": {}}


async def seed_modules(db):
    for row in MODULES:
        result = await db.execute(select(Module).where(Module.title == row["title"]))
        module = result.scalar_one_or_none()
        if module is None:
            module = Module(
                title=row["title"],
                category=row["category"],
                domain=row["domain"],
                level=row["level"],
                estimated_hours=row["hours"],
                is_active=True,
            )
            db.add(module)
            await db.flush()
        SEED_CONTEXT["modules"][module.title] = module


async def seed_career_tracks(db):
    for domain in CAREER_TRACKS:
        result = await db.execute(select(CareerTrack).where(CareerTrack.domain == domain))
        track = result.scalar_one_or_none()
        if track is None:
            track = CareerTrack(domain=domain, description=f"{domain} learning track", is_active=True)
            db.add(track)
            await db.flush()
        SEED_CONTEXT["tracks"][track.domain] = track


async def seed_career_track_modules(db):
    for track_domain, module_items in CAREER_TRACK_MODULES.items():
        track = SEED_CONTEXT["tracks"].get(track_domain)
        if track is None:
            continue
        for module_title, sequence_order in module_items:
            module = SEED_CONTEXT["modules"].get(module_title)
            if module is None:
                continue
            existing = await db.execute(
                select(CareerTrackModule).where(
                    CareerTrackModule.track_id == track.track_id,
                    CareerTrackModule.module_id == module.module_id,
                )
            )
            ctm = existing.scalar_one_or_none()
            if ctm is None:
                db.add(
                    CareerTrackModule(
                        track_id=track.track_id,
                        module_id=module.module_id,
                        sequence_order=sequence_order,
                    )
                )
                await db.flush()


async def seed_subject_skill_mappings(db):
    for subject_code, module_title, priority, trigger in SUBJECT_SKILL_MAPPINGS:
        module = SEED_CONTEXT["modules"].get(module_title)
        if module is None:
            continue
        existing = await db.execute(
            select(SubjectSkillMapping).where(
                SubjectSkillMapping.subject_code == subject_code,
                SubjectSkillMapping.module_id == module.module_id,
            )
        )
        if existing.scalar_one_or_none() is None:
            db.add(
                SubjectSkillMapping(
                    subject_code=subject_code,
                    module_id=module.module_id,
                    priority=priority,
                    performance_level_trigger=trigger,
                )
            )
            await db.flush()


async def seed_demo_users(db):
    for row in DEMO_USERS:
        user_result = await db.execute(select(User).where(User.email == row["email"]))
        user = user_result.scalar_one_or_none()
        if user is None:
            user = User(
                email=row["email"],
                password_hash=hash_password(row["password"]),
                full_name=row["full_name"],
                role=row["role"],
                is_active=True,
            )
            db.add(user)
            await db.flush()

        SEED_CONTEXT["users"][user.email] = user

        if row["role"] == "faculty":
            faculty_result = await db.execute(select(Faculty).where(Faculty.user_id == user.user_id))
            faculty = faculty_result.scalar_one_or_none()
            if faculty is None:
                faculty = Faculty(
                    user_id=user.user_id,
                    department=row["department"],
                    designation=row.get("designation"),
                )
                db.add(faculty)
                await db.flush()
            SEED_CONTEXT["faculty"][user.email] = faculty

        if row["role"] == "student":
            student_result = await db.execute(select(Student).where(Student.user_id == user.user_id))
            student = student_result.scalar_one_or_none()
            if student is None:
                student = Student(
                    user_id=user.user_id,
                    roll_number=row["roll_number"],
                    department=row["department"],
                    semester=row["semester"],
                    interests=row.get("interests", []),
                    career_goal=row.get("career_goal"),
                )
                db.add(student)
                await db.flush()
            SEED_CONTEXT["students"][user.email] = student


async def seed_faculty_student_assignments(db):
    for faculty_email, student_emails in ASSIGNMENTS.items():
        faculty = SEED_CONTEXT["faculty"].get(faculty_email)
        if faculty is None:
            continue
        for student_email in student_emails:
            student = SEED_CONTEXT["students"].get(student_email)
            if student is None:
                continue
            existing = await db.execute(
                select(FacultyStudent).where(
                    FacultyStudent.faculty_id == faculty.faculty_id,
                    FacultyStudent.student_id == student.student_id,
                )
            )
            if existing.scalar_one_or_none() is None:
                db.add(FacultyStudent(faculty_id=faculty.faculty_id, student_id=student.student_id))
                await db.flush()


async def seed_sample_academic_records(db):
    for student_email, records in ACADEMIC_SEED.items():
        student = SEED_CONTEXT["students"].get(student_email)
        if student is None:
            continue
        semester = student.semester
        for subject_code, subject_name, marks, max_marks in records:
            score_pct = compute_score_percent(marks, max_marks)
            performance = compute_performance_level(score_pct)

            existing = await db.execute(
                select(AcademicRecord).where(
                    AcademicRecord.student_id == student.student_id,
                    AcademicRecord.subject_code == subject_code,
                    AcademicRecord.semester == semester,
                )
            )
            record = existing.scalar_one_or_none()
            if record is None:
                await db.execute(
                    insert(AcademicRecord).values(
                        student_id=student.student_id,
                        subject_code=subject_code,
                        subject_name=subject_name,
                        marks_obtained=Decimal(str(marks)),
                        max_marks=Decimal(str(max_marks)),
                        semester=semester,
                    )
                )
                await db.flush()
                refreshed = await db.execute(
                    select(AcademicRecord).where(
                        AcademicRecord.student_id == student.student_id,
                        AcademicRecord.subject_code == subject_code,
                        AcademicRecord.semester == semester,
                    )
                )
                record = refreshed.scalar_one()

            if record.performance_level != performance:
                record.performance_level = performance
                await db.flush()


async def seed_sample_attendance_records(db):
    for student_email, records in ATTENDANCE_SEED.items():
        student = SEED_CONTEXT["students"].get(student_email)
        if student is None:
            continue
        semester = student.semester
        for subject_code, subject_name, attendance_pct in records:
            existing = await db.execute(
                select(AttendanceRecord).where(
                    AttendanceRecord.student_id == student.student_id,
                    AttendanceRecord.subject_code == subject_code,
                    AttendanceRecord.semester == semester,
                )
            )
            if existing.scalar_one_or_none() is not None:
                continue

            db.add(
                AttendanceRecord(
                    student_id=student.student_id,
                    subject_code=subject_code,
                    subject_name=subject_name,
                    attendance_pct=Decimal(str(attendance_pct)),
                    at_risk=compute_at_risk(attendance_pct),
                    semester=semester,
                )
            )
            await db.flush()


async def trigger_analysis_and_recommendations(db):
    target_emails = ["student1@college.edu", "student2@college.edu"]
    for email in target_emails:
        student = SEED_CONTEXT["students"].get(email)
        if student is None:
            continue

        await recalculate_skill_gap(db, student.student_id)

        current_path = await get_current_path(db, student.student_id)
        if current_path is None:
            await generate_learning_path(db, student.student_id)


async def main():
    async with AsyncSessionLocal() as db:
        await seed_modules(db)
        await seed_career_tracks(db)
        await seed_career_track_modules(db)
        await seed_subject_skill_mappings(db)
        await seed_demo_users(db)
        await seed_faculty_student_assignments(db)
        await seed_sample_academic_records(db)
        await seed_sample_attendance_records(db)
        await trigger_analysis_and_recommendations(db)
        await db.commit()
        print("Seeding complete.")


if __name__ == "__main__":
    asyncio.run(main())
