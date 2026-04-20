from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_student
from app.db.session import get_db
from app.models.user import User
from app.schemas.academic import AcademicRecordCreate, AcademicRecordCreateResponse, AcademicRecordsListResponse
from app.services.profile_service import add_academic_record, get_academic_records

router = APIRouter()


@router.post("/records", response_model=AcademicRecordCreateResponse, status_code=201)
async def add_record(
    data: AcademicRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_student),
):
    return await add_academic_record(db, current_user.user_id, data)


@router.get("/records", response_model=AcademicRecordsListResponse)
async def get_records(
    semester: int | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_student),
):
    return await get_academic_records(db, current_user.user_id, semester)
