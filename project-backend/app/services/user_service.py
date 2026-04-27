from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.faculty_repository import (
    assign_student,
    get_faculty_by_user_id,
    is_student_assigned_to_faculty,
)
from app.repositories.student_repository import get_student_by_user_id
from app.repositories.user_repository import deactivate_user, get_user_by_id, list_users
from app.schemas.user import (
    DeactivateResponse,
    FacultyStudentAssignmentResponse,
    UserListResponse,
    UserSummary,
)


async def list_all_users(
    db: AsyncSession,
    page: int,
    limit: int,
    role_filter: str | None,
) -> UserListResponse:
    total, users = await list_users(db, page, limit, role_filter)
    return UserListResponse(total=total, users=[UserSummary.model_validate(u) for u in users])


async def deactivate_user_account(db: AsyncSession, user_id: int) -> DeactivateResponse:
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await deactivate_user(db, user_id)
    await db.commit()
    return DeactivateResponse(message="User deactivated", user_id=user_id)


async def assign_student_to_faculty_account(
    db: AsyncSession,
    faculty_user_id: int,
    student_user_id: int,
) -> FacultyStudentAssignmentResponse:
    faculty_user = await get_user_by_id(db, faculty_user_id)
    if not faculty_user or faculty_user.role != "faculty":
        raise HTTPException(status_code=404, detail="Faculty user not found")

    student_user = await get_user_by_id(db, student_user_id)
    if not student_user or student_user.role != "student":
        raise HTTPException(status_code=404, detail="Student user not found")

    faculty = await get_faculty_by_user_id(db, faculty_user_id)
    if not faculty:
        raise HTTPException(status_code=400, detail="Faculty profile not found")

    student = await get_student_by_user_id(db, student_user_id)
    if not student:
        raise HTTPException(status_code=400, detail="Student profile not found")

    already_assigned = await is_student_assigned_to_faculty(db, faculty.faculty_id, student.student_id)
    if already_assigned:
        raise HTTPException(status_code=409, detail="Student already assigned to this faculty")

    await assign_student(db, faculty.faculty_id, student.student_id)
    await db.commit()

    return FacultyStudentAssignmentResponse(
        message="Student assigned successfully",
        faculty_user_id=faculty_user_id,
        student_user_id=student_user_id,
        faculty_id=faculty.faculty_id,
        student_id=student.student_id,
    )
