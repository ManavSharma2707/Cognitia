from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.career_track import AddTrackModuleRequest, AddTrackModuleResponse
from app.services.admin_service import add_career_track_module

router = APIRouter()


@router.post("/{track_id}/modules", response_model=AddTrackModuleResponse, status_code=201)
async def add_module_to_track(
    track_id: int,
    data: AddTrackModuleRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    return await add_career_track_module(db, track_id, data)
