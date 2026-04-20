from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.student import Student


async def get_student_by_user_id(db: AsyncSession, user_id: int) -> Student | None:
    result = await db.execute(select(Student).where(Student.user_id == user_id))
    return result.scalar_one_or_none()


async def get_student_by_id(db: AsyncSession, student_id: int) -> Student | None:
    result = await db.execute(select(Student).where(Student.student_id == student_id))
    return result.scalar_one_or_none()


async def get_student_by_roll_number(db: AsyncSession, roll_number: str) -> Student | None:
    result = await db.execute(select(Student).where(Student.roll_number == roll_number))
    return result.scalar_one_or_none()


async def create_student(
    db: AsyncSession,
    user_id: int,
    roll_number: str,
    department: str,
    semester: int,
) -> Student:
    student = Student(
        user_id=user_id,
        roll_number=roll_number,
        department=department,
        semester=semester,
        interests=[],
        career_goal=None,
    )
    db.add(student)
    await db.flush()
    return student


async def update_student(db: AsyncSession, student_id: int, **fields) -> Student:
    student = await get_student_by_id(db, student_id)
    for k, v in fields.items():
        setattr(student, k, v)
    await db.flush()
    return student
