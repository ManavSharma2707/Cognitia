from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.career_track_repository import add_track_module, get_track_by_id, track_module_exists
from app.repositories.subject_skill_mapping_repository import create_mapping, mapping_exists
from app.schemas.career_track import AddTrackModuleRequest, AddTrackModuleResponse
from app.schemas.subject_skill_mapping import MappingCreate, MappingResponse


async def add_subject_mapping(db: AsyncSession, data: MappingCreate) -> MappingResponse:
    if await mapping_exists(db, data.subject_code, data.module_id):
        raise HTTPException(status_code=409, detail="Mapping already exists")

    mapping = await create_mapping(
        db,
        data.subject_code,
        data.module_id,
        data.priority,
        data.performance_level_trigger,
    )
    await db.commit()

    return MappingResponse(
        map_id=mapping.map_id,
        subject_code=mapping.subject_code,
        module_id=mapping.module_id,
        priority=mapping.priority,
    )


async def add_career_track_module(
    db: AsyncSession,
    track_id: int,
    data: AddTrackModuleRequest,
) -> AddTrackModuleResponse:
    track = await get_track_by_id(db, track_id)
    if not track:
        raise HTTPException(status_code=404, detail="Career track not found")

    if await track_module_exists(db, track_id, data.module_id):
        raise HTTPException(status_code=409, detail="Module already exists in this track")

    ctm = await add_track_module(db, track_id, data.module_id, data.sequence_order)
    await db.commit()

    return AddTrackModuleResponse(
        id=ctm.id,
        track_id=ctm.track_id,
        module_id=ctm.module_id,
        sequence_order=ctm.sequence_order,
    )
