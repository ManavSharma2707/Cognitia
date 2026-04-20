from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attendance_record import AttendanceRecord


async def get_attendance_by_student(
    db: AsyncSession,
    student_id: int,
    semester: int | None = None,
) -> list[AttendanceRecord]:
    q = select(AttendanceRecord).where(AttendanceRecord.student_id == student_id)
    if semester is not None:
        q = q.where(AttendanceRecord.semester == semester)
    result = await db.execute(q)
    return list(result.scalars().all())


async def create_attendance(
    db: AsyncSession,
    student_id: int,
    subject_code: str,
    subject_name: str,
    attendance_pct: float,
    at_risk: bool,
    semester: int,
) -> AttendanceRecord:
    record = AttendanceRecord(
        student_id=student_id,
        subject_code=subject_code,
        subject_name=subject_name,
        attendance_pct=attendance_pct,
        at_risk=at_risk,
        semester=semester,
    )
    db.add(record)
    await db.flush()
    return record


async def has_any_at_risk(db: AsyncSession, student_id: int) -> bool:
    result = await db.execute(
        select(AttendanceRecord).where(
            AttendanceRecord.student_id == student_id,
            AttendanceRecord.at_risk == True,
        )
    )
    return result.scalar_one_or_none() is not None
