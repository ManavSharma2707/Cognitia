from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.subject_skill_mapping import SubjectSkillMapping


async def get_mappings_by_subject(
    db: AsyncSession,
    subject_code: str,
    trigger: str,
) -> list[SubjectSkillMapping]:
    result = await db.execute(
        select(SubjectSkillMapping)
        .where(
            SubjectSkillMapping.subject_code == subject_code,
            SubjectSkillMapping.performance_level_trigger.in_([trigger, "both"]),
        )
        .order_by(SubjectSkillMapping.priority)
    )
    return list(result.scalars().all())


async def get_all_mappings(db: AsyncSession) -> list[SubjectSkillMapping]:
    result = await db.execute(select(SubjectSkillMapping))
    return list(result.scalars().all())


async def create_mapping(
    db: AsyncSession,
    subject_code: str,
    module_id: int,
    priority: int,
    performance_level_trigger: str,
) -> SubjectSkillMapping:
    mapping = SubjectSkillMapping(
        subject_code=subject_code,
        module_id=module_id,
        priority=priority,
        performance_level_trigger=performance_level_trigger,
    )
    db.add(mapping)
    await db.flush()
    return mapping


async def mapping_exists(db: AsyncSession, subject_code: str, module_id: int) -> bool:
    result = await db.execute(
        select(SubjectSkillMapping).where(
            SubjectSkillMapping.subject_code == subject_code,
            SubjectSkillMapping.module_id == module_id,
        )
    )
    return result.scalar_one_or_none() is not None
