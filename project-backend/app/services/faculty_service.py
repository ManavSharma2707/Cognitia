from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.academic_repository import get_records_by_student
from app.repositories.faculty_repository import (
    get_assigned_students,
    get_faculty_by_user_id,
    is_student_assigned_to_faculty,
)
from app.repositories.learning_path_repository import get_current_path
from app.repositories.skill_gap_repository import get_skill_gap_by_student
from app.repositories.student_repository import get_student_by_id
from app.repositories.user_repository import get_user_by_id
from app.schemas.academic import AcademicRecordResponse
from app.schemas.faculty import FacultyStudentListResponse, FacultyStudentSummary


async def get_assigned_students_summary(db: AsyncSession, user_id: int) -> FacultyStudentListResponse:
    faculty = await get_faculty_by_user_id(db, user_id)
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty profile not found")

    students = await get_assigned_students(db, faculty.faculty_id)
    summaries: list[FacultyStudentSummary] = []
    for s in students:
        user = await get_user_by_id(db, s.user_id)
        gap = await get_skill_gap_by_student(db, s.student_id)
        path = await get_current_path(db, s.student_id)

        summaries.append(
            FacultyStudentSummary(
                student_id=s.student_id,
                full_name=user.full_name if user else "",
                roll_number=s.roll_number,
                department=s.department,
                semester=s.semester,
                weak_subject_count=gap.weak_subject_count if gap else 0,
                attendance_at_risk=gap.attendance_at_risk if gap else False,
                completion_pct=float(path.completion_pct) if path else 0.0,
            )
        )

    return FacultyStudentListResponse(total=len(summaries), students=summaries)


async def get_student_detail(db: AsyncSession, user_id: int, student_id: int) -> dict:
    faculty = await get_faculty_by_user_id(db, user_id)
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty profile not found")

    assigned = await is_student_assigned_to_faculty(db, faculty.faculty_id, student_id)
    if not assigned:
        raise HTTPException(status_code=403, detail="Student is not assigned to this faculty member")

    student = await get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    user = await get_user_by_id(db, student.user_id)
    records = await get_records_by_student(db, student_id)

    from app.services.analysis_service import get_skill_gap_summary
    from app.services.recommendation_service import get_current_learning_path

    gap = await get_skill_gap_by_student(db, student_id)
    gap_response = await get_skill_gap_summary(db, student_id) if gap else None

    try:
        path_response = await get_current_learning_path(db, student_id)
    except HTTPException:
        path_response = None

    return {
        "student": {
            "student_id": student.student_id,
            "full_name": user.full_name if user else "",
            "roll_number": student.roll_number,
            "department": student.department,
            "semester": student.semester,
        },
        "academic_records": [AcademicRecordResponse.model_validate(r) for r in records],
        "skill_gap": gap_response,
        "learning_path": path_response,
    }
