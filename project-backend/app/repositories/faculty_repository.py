from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.faculty import Faculty
from app.models.faculty_student import FacultyStudent
from app.models.student import Student


async def get_faculty_by_user_id(db: AsyncSession, user_id: int) -> Faculty | None:
    result = await db.execute(select(Faculty).where(Faculty.user_id == user_id))
    return result.scalar_one_or_none()


async def get_faculty_by_id(db: AsyncSession, faculty_id: int) -> Faculty | None:
    result = await db.execute(select(Faculty).where(Faculty.faculty_id == faculty_id))
    return result.scalar_one_or_none()


async def create_faculty(
    db: AsyncSession,
    user_id: int,
    department: str,
    designation: str | None = None,
) -> Faculty:
    faculty = Faculty(user_id=user_id, department=department, designation=designation)
    db.add(faculty)
    await db.flush()
    return faculty


async def get_assigned_students(db: AsyncSession, faculty_id: int) -> list[Student]:
    result = await db.execute(
        select(Student)
        .join(FacultyStudent, FacultyStudent.student_id == Student.student_id)
        .where(FacultyStudent.faculty_id == faculty_id)
    )
    return list(result.scalars().all())


async def assign_student(db: AsyncSession, faculty_id: int, student_id: int) -> FacultyStudent:
    assignment = FacultyStudent(faculty_id=faculty_id, student_id=student_id)
    db.add(assignment)
    await db.flush()
    return assignment


async def is_student_assigned_to_faculty(db: AsyncSession, faculty_id: int, student_id: int) -> bool:
    result = await db.execute(
        select(FacultyStudent).where(
            FacultyStudent.faculty_id == faculty_id,
            FacultyStudent.student_id == student_id,
        )
    )
    return result.scalar_one_or_none() is not None
