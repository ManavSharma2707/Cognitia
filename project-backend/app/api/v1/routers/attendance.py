from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_student
from app.db.session import get_db
from app.models.user import User
from app.schemas.attendance import AttendanceRecordCreate, AttendanceRecordResponse
from app.services.profile_service import add_attendance_record

router = APIRouter()


@router.post("/records", response_model=AttendanceRecordResponse, status_code=201)
async def add_record(
    data: AttendanceRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_student),
):
    return await add_attendance_record(db, current_user.user_id, data)
