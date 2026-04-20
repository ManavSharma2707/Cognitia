from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_student
from app.db.session import get_db
from app.models.user import User
from app.repositories.student_repository import get_student_by_user_id
from app.schemas.progress import ProgressSummaryResponse, ProgressUpdateRequest, ProgressUpdateResponse
from app.services.progress_service import get_progress_summary, update_module_status

router = APIRouter()


@router.patch("/modules/{module_id}", response_model=ProgressUpdateResponse)
async def update_status(
    module_id: int,
    data: ProgressUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_student),
):
    student = await get_student_by_user_id(db, current_user.user_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return await update_module_status(db, student.student_id, module_id, data.status)


@router.get("/summary", response_model=ProgressSummaryResponse)
async def summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_student),
):
    student = await get_student_by_user_id(db, current_user.user_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return await get_progress_summary(db, student.student_id)
