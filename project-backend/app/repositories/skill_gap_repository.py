from datetime import datetime, timezone

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.skill_gap import SkillGap
from app.models.skill_gap_module import SkillGapModule


async def get_skill_gap_by_student(db: AsyncSession, student_id: int) -> SkillGap | None:
    result = await db.execute(select(SkillGap).where(SkillGap.student_id == student_id))
    return result.scalar_one_or_none()


async def upsert_skill_gap(
    db: AsyncSession,
    student_id: int,
    weak_count: int,
    moderate_count: int,
    attendance_at_risk: bool,
) -> SkillGap:
    gap = await get_skill_gap_by_student(db, student_id)
    if gap:
        gap.weak_subject_count = weak_count
        gap.moderate_subject_count = moderate_count
        gap.attendance_at_risk = attendance_at_risk
        gap.generated_at = datetime.now(timezone.utc)
    else:
        gap = SkillGap(
            student_id=student_id,
            weak_subject_count=weak_count,
            moderate_subject_count=moderate_count,
            attendance_at_risk=attendance_at_risk,
        )
        db.add(gap)

    await db.flush()
    return gap


async def delete_gap_modules(db: AsyncSession, gap_id: int) -> None:
    await db.execute(delete(SkillGapModule).where(SkillGapModule.gap_id == gap_id))


async def bulk_insert_gap_modules(db: AsyncSession, gap_id: int, entries: list[dict]) -> None:
    for entry in entries:
        sgm = SkillGapModule(
            gap_id=gap_id,
            module_id=entry["module_id"],
            source_subject_code=entry["source_subject_code"],
            priority=entry.get("priority", 1),
        )
        db.add(sgm)

    await db.flush()


async def get_gap_modules(db: AsyncSession, gap_id: int) -> list[SkillGapModule]:
    result = await db.execute(
        select(SkillGapModule)
        .where(SkillGapModule.gap_id == gap_id)
        .order_by(SkillGapModule.priority)
    )
    return list(result.scalars().all())
