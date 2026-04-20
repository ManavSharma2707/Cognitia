from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.academic_repository import create_record, get_record, get_records_by_student
from app.repositories.attendance_repository import create_attendance
from app.repositories.student_repository import get_student_by_user_id, update_student
from app.repositories.user_repository import get_user_by_id
from app.schemas.academic import (
    AcademicRecordCreate,
    AcademicRecordCreateResponse,
    AcademicRecordResponse,
    AcademicRecordsListResponse,
)
from app.schemas.attendance import AttendanceRecordCreate, AttendanceRecordResponse
from app.schemas.student import StudentProfileResponse, StudentProfileUpdate, StudentProfileUpdateResponse
from app.utils.validators import compute_at_risk, compute_performance_level, compute_score_percent


async def get_student_profile(db: AsyncSession, user_id: int) -> StudentProfileResponse:
    student = await get_student_by_user_id(db, user_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    user = await get_user_by_id(db, user_id)
    return StudentProfileResponse(
        student_id=student.student_id,
        user_id=student.user_id,
        roll_number=student.roll_number,
        full_name=user.full_name,
        department=student.department,
        semester=student.semester,
        interests=student.interests or [],
        career_goal=student.career_goal,
        created_at=student.created_at,
    )


async def update_student_profile(
    db: AsyncSession,
    user_id: int,
    data: StudentProfileUpdate,
) -> StudentProfileUpdateResponse:
    student = await get_student_by_user_id(db, user_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    fields = {k: v for k, v in data.model_dump(exclude_none=True).items()}
    if fields:
        await update_student(db, student.student_id, **fields)
        await db.commit()

    records = await get_records_by_student(db, student.student_id)
    if records:
        from app.services.analysis_service import recalculate_skill_gap
        from app.services.recommendation_service import generate_learning_path

        await recalculate_skill_gap(db, student.student_id)
        await generate_learning_path(db, student.student_id)

    return StudentProfileUpdateResponse(
        message="Profile updated",
        student_id=student.student_id,
        updated_fields=list(fields.keys()),
    )


async def add_academic_record(
    db: AsyncSession,
    user_id: int,
    data: AcademicRecordCreate,
) -> AcademicRecordCreateResponse:
    student = await get_student_by_user_id(db, user_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    existing = await get_record(db, student.student_id, data.subject_code, data.semester)
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Record already exists for this subject and semester. Use PUT to update.",
        )

    score_pct = compute_score_percent(data.marks_obtained, data.max_marks)
    perf_level = compute_performance_level(score_pct)

    record = await create_record(
        db,
        student.student_id,
        data.subject_code,
        data.subject_name,
        data.marks_obtained,
        data.max_marks,
        score_pct,
        perf_level,
        data.semester,
    )
    await db.commit()

    from app.services.analysis_service import recalculate_skill_gap
    from app.services.recommendation_service import generate_learning_path

    await recalculate_skill_gap(db, student.student_id)
    await generate_learning_path(db, student.student_id)

    return AcademicRecordCreateResponse(
        record_id=record.record_id,
        subject_code=record.subject_code,
        score_percent=float(record.score_percent),
        performance_level=record.performance_level,
        message="Record saved. Recommendations updated.",
    )


async def get_academic_records(
    db: AsyncSession,
    user_id: int,
    semester: int | None,
) -> AcademicRecordsListResponse:
    student = await get_student_by_user_id(db, user_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    records = await get_records_by_student(db, student.student_id, semester)
    return AcademicRecordsListResponse(records=[AcademicRecordResponse.model_validate(r) for r in records])


async def add_attendance_record(
    db: AsyncSession,
    user_id: int,
    data: AttendanceRecordCreate,
) -> AttendanceRecordResponse:
    student = await get_student_by_user_id(db, user_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    at_risk = compute_at_risk(data.attendance_pct)
    record = await create_attendance(
        db,
        student.student_id,
        data.subject_code,
        data.subject_name,
        data.attendance_pct,
        at_risk,
        data.semester,
    )
    await db.commit()

    return AttendanceRecordResponse(
        attendance_id=record.attendance_id,
        subject_code=record.subject_code,
        attendance_pct=float(record.attendance_pct),
        at_risk=record.at_risk,
    )
