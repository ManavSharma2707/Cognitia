from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import (
    DeactivateResponse,
    FacultyStudentAssignmentRequest,
    FacultyStudentAssignmentResponse,
    UserListResponse,
)
from app.services.user_service import (
    assign_student_to_faculty_account,
    deactivate_user_account,
    list_all_users,
)

router = APIRouter()


@router.get("/", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    role: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    return await list_all_users(db, page, limit, role)


@router.patch("/{user_id}/deactivate", response_model=DeactivateResponse)
async def deactivate_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    return await deactivate_user_account(db, user_id)


@router.post("/assignments/faculty-student", response_model=FacultyStudentAssignmentResponse)
async def assign_student_to_faculty(
    payload: FacultyStudentAssignmentRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    return await assign_student_to_faculty_account(
        db,
        faculty_user_id=payload.faculty_user_id,
        student_user_id=payload.student_user_id,
    )
