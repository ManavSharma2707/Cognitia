from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.career_track import CareerTrack
from app.models.career_track_module import CareerTrackModule


async def get_active_tracks(db: AsyncSession) -> list[CareerTrack]:
    result = await db.execute(select(CareerTrack).where(CareerTrack.is_active == True))
    return list(result.scalars().all())


async def get_track_by_id(db: AsyncSession, track_id: int) -> CareerTrack | None:
    result = await db.execute(select(CareerTrack).where(CareerTrack.track_id == track_id))
    return result.scalar_one_or_none()


async def get_track_by_domain(db: AsyncSession, domain: str) -> CareerTrack | None:
    result = await db.execute(select(CareerTrack).where(CareerTrack.domain == domain))
    return result.scalar_one_or_none()


async def get_track_modules(db: AsyncSession, track_id: int) -> list[CareerTrackModule]:
    result = await db.execute(
        select(CareerTrackModule)
        .where(CareerTrackModule.track_id == track_id)
        .order_by(CareerTrackModule.sequence_order)
    )
    return list(result.scalars().all())


async def add_track_module(
    db: AsyncSession,
    track_id: int,
    module_id: int,
    sequence_order: int,
) -> CareerTrackModule:
    ctm = CareerTrackModule(track_id=track_id, module_id=module_id, sequence_order=sequence_order)
    db.add(ctm)
    await db.flush()
    return ctm


async def track_module_exists(db: AsyncSession, track_id: int, module_id: int) -> bool:
    result = await db.execute(
        select(CareerTrackModule).where(
            CareerTrackModule.track_id == track_id,
            CareerTrackModule.module_id == module_id,
        )
    )
    return result.scalar_one_or_none() is not None
