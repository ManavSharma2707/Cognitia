from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_student, require_student_or_faculty
from app.db.session import get_db
from app.models.user import User
from app.repositories.student_repository import get_student_by_user_id
from app.schemas.skill_gap import SkillGapRecalcResponse, SkillGapResponse
from app.services.analysis_service import get_skill_gap_summary, recalculate_skill_gap

router = APIRouter()


@router.get("/skill-gap", response_model=SkillGapResponse)
async def get_gap(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_student_or_faculty),
):
    student = await get_student_by_user_id(db, current_user.user_id)
    if not student:
        raise HTTPException(status_code=403, detail="Faculty must use /faculty/students/{id} endpoint")
    return await get_skill_gap_summary(db, student.student_id)


@router.post("/skill-gap/recalculate", response_model=SkillGapRecalcResponse)
async def recalculate(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_student),
):
    student = await get_student_by_user_id(db, current_user.user_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return await recalculate_skill_gap(db, student.student_id)
