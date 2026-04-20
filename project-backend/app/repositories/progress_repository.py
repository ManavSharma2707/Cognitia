from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.progress import Progress


async def get_progress(db: AsyncSession, student_id: int, module_id: int, path_id: int) -> Progress | None:
    result = await db.execute(
        select(Progress).where(
            Progress.student_id == student_id,
            Progress.module_id == module_id,
            Progress.path_id == path_id,
        )
    )
    return result.scalar_one_or_none()


async def upsert_progress(
    db: AsyncSession,
    student_id: int,
    module_id: int,
    path_id: int,
    status: str,
) -> Progress:
    prog = await get_progress(db, student_id, module_id, path_id)
    if prog:
        prog.status = status
        prog.updated_at = datetime.now(timezone.utc)
    else:
        prog = Progress(student_id=student_id, module_id=module_id, path_id=path_id, status=status)
        db.add(prog)

    await db.flush()
    return prog


async def initialize_progress_for_path(
    db: AsyncSession,
    student_id: int,
    path_id: int,
    module_ids: list[int],
) -> None:
    for mid in module_ids:
        existing = await get_progress(db, student_id, mid, path_id)
        if not existing:
            db.add(Progress(student_id=student_id, module_id=mid, path_id=path_id, status="not_started"))

    await db.flush()


async def get_path_progress(db: AsyncSession, student_id: int, path_id: int) -> list[Progress]:
    result = await db.execute(
        select(Progress).where(
            Progress.student_id == student_id,
            Progress.path_id == path_id,
        )
    )
    return list(result.scalars().all())


async def count_by_status(db: AsyncSession, student_id: int, path_id: int) -> dict:
    records = await get_path_progress(db, student_id, path_id)
    counts = {"not_started": 0, "in_progress": 0, "completed": 0}
    for r in records:
        counts[r.status] = counts.get(r.status, 0) + 1
    return counts
