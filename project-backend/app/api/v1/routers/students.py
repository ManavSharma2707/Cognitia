from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_student
from app.db.session import get_db
from app.models.user import User
from app.schemas.student import StudentProfileResponse, StudentProfileUpdate, StudentProfileUpdateResponse
from app.services.profile_service import get_student_profile, update_student_profile

router = APIRouter()


@router.get("/profile", response_model=StudentProfileResponse)
async def get_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_student),
):
    return await get_student_profile(db, current_user.user_id)


@router.put("/profile", response_model=StudentProfileUpdateResponse)
async def update_profile(
    data: StudentProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_student),
):
    return await update_student_profile(db, current_user.user_id, data)
