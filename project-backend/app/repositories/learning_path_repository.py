from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.learning_path import LearningPath
from app.models.learning_path_module import LearningPathModule


async def get_current_path(db: AsyncSession, student_id: int) -> LearningPath | None:
    result = await db.execute(
        select(LearningPath).where(
            LearningPath.student_id == student_id,
            LearningPath.is_current == True,
        )
    )
    return result.scalar_one_or_none()


async def get_path_by_id(db: AsyncSession, path_id: int) -> LearningPath | None:
    result = await db.execute(select(LearningPath).where(LearningPath.path_id == path_id))
    return result.scalar_one_or_none()


async def get_path_history(db: AsyncSession, student_id: int) -> list[LearningPath]:
    result = await db.execute(
        select(LearningPath)
        .where(LearningPath.student_id == student_id)
        .order_by(LearningPath.generated_at.desc())
    )
    return list(result.scalars().all())


async def archive_current_paths(db: AsyncSession, student_id: int) -> None:
    await db.execute(
        update(LearningPath)
        .where(
            LearningPath.student_id == student_id,
            LearningPath.is_current == True,
        )
        .values(is_current=False)
    )


async def create_path(db: AsyncSession, student_id: int) -> LearningPath:
    path = LearningPath(student_id=student_id, is_current=True, completion_pct=0.0)
    db.add(path)
    await db.flush()
    return path


async def bulk_insert_path_modules(db: AsyncSession, path_id: int, entries: list[dict]) -> None:
    for entry in entries:
        lpm = LearningPathModule(
            path_id=path_id,
            module_id=entry["module_id"],
            sequence_order=entry["sequence_order"],
        )
        db.add(lpm)

    await db.flush()


async def get_path_modules(db: AsyncSession, path_id: int) -> list[LearningPathModule]:
    result = await db.execute(
        select(LearningPathModule)
        .where(LearningPathModule.path_id == path_id)
        .order_by(LearningPathModule.sequence_order)
    )
    return list(result.scalars().all())


async def update_path_completion(db: AsyncSession, path_id: int, completion_pct: float) -> None:
    await db.execute(
        update(LearningPath)
        .where(LearningPath.path_id == path_id)
        .values(completion_pct=completion_pct)
    )
