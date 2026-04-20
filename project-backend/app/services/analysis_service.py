from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import PerformanceLevel
from app.repositories.academic_repository import get_records_by_student
from app.repositories.attendance_repository import has_any_at_risk
from app.repositories.skill_gap_repository import (
    bulk_insert_gap_modules,
    delete_gap_modules,
    get_gap_modules,
    get_skill_gap_by_student,
    upsert_skill_gap,
)
from app.repositories.subject_skill_mapping_repository import get_mappings_by_subject
from app.schemas.skill_gap import SkillGapResponse, SkillGapRecalcResponse, WeakSubjectDetail


async def recalculate_skill_gap(db: AsyncSession, student_id: int) -> SkillGapRecalcResponse:
    records = await get_records_by_student(db, student_id)
    if not records:
        raise HTTPException(status_code=400, detail="No academic records found for skill gap analysis")

    weak_records = [r for r in records if r.performance_level == PerformanceLevel.WEAK]
    moderate_records = [r for r in records if r.performance_level == PerformanceLevel.MODERATE]
    attendance_at_risk = await has_any_at_risk(db, student_id)

    gap = await upsert_skill_gap(db, student_id, len(weak_records), len(moderate_records), attendance_at_risk)
    await delete_gap_modules(db, gap.gap_id)

    seen_module_ids: set[int] = set()
    entries: list[dict] = []

    for record in weak_records:
        mappings = await get_mappings_by_subject(db, record.subject_code, "weak")
        for mapping in mappings:
            if mapping.module_id not in seen_module_ids:
                seen_module_ids.add(mapping.module_id)
                entries.append(
                    {
                        "module_id": mapping.module_id,
                        "source_subject_code": record.subject_code,
                        "priority": mapping.priority,
                    }
                )

    for record in moderate_records:
        mappings = await get_mappings_by_subject(db, record.subject_code, "moderate")
        for mapping in mappings:
            if mapping.module_id not in seen_module_ids:
                seen_module_ids.add(mapping.module_id)
                entries.append(
                    {
                        "module_id": mapping.module_id,
                        "source_subject_code": record.subject_code,
                        "priority": mapping.priority,
                    }
                )

    await bulk_insert_gap_modules(db, gap.gap_id, entries)
    await db.commit()

    return SkillGapRecalcResponse(
        message="Skill gap recalculated",
        weak_subject_count=gap.weak_subject_count,
        updated_at=gap.generated_at or datetime.now(timezone.utc),
    )


async def get_skill_gap_summary(db: AsyncSession, student_id: int) -> SkillGapResponse:
    gap = await get_skill_gap_by_student(db, student_id)
    if not gap:
        raise HTTPException(status_code=404, detail="No skill gap analysis found. Add academic records first.")

    gap_modules = await get_gap_modules(db, gap.gap_id)
    records = await get_records_by_student(db, student_id)
    record_map = {r.subject_code: r for r in records}

    weak_subjects: list[WeakSubjectDetail] = []
    for gm in gap_modules:
        record = record_map.get(gm.source_subject_code)
        if record and record.performance_level == PerformanceLevel.WEAK:
            weak_subjects.append(
                WeakSubjectDetail(
                    subject_code=record.subject_code,
                    subject_name=record.subject_name,
                    score_percent=float(record.score_percent),
                )
            )

    return SkillGapResponse(
        gap_id=gap.gap_id,
        student_id=gap.student_id,
        weak_subject_count=gap.weak_subject_count,
        moderate_subject_count=gap.moderate_subject_count,
        attendance_at_risk=gap.attendance_at_risk,
        weak_subjects=weak_subjects,
        generated_at=gap.generated_at,
    )
