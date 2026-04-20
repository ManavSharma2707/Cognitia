from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_faculty
from app.db.session import get_db
from app.models.user import User
from app.schemas.faculty import FacultyStudentListResponse
from app.services.faculty_service import get_assigned_students_summary, get_student_detail

router = APIRouter()


@router.get("/students", response_model=FacultyStudentListResponse)
async def assigned_students(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_faculty),
):
    return await get_assigned_students_summary(db, current_user.user_id)


@router.get("/students/{student_id}")
async def student_detail(
    student_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_faculty),
):
    return await get_student_detail(db, current_user.user_id, student_id)
