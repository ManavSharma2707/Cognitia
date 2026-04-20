from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.subject_skill_mapping import MappingCreate, MappingResponse
from app.services.admin_service import add_subject_mapping

router = APIRouter()


@router.post("/", response_model=MappingResponse, status_code=201)
async def create_mapping(
    data: MappingCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    return await add_subject_mapping(db, data)
