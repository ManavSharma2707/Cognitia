from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import ModuleCategory
from app.repositories.career_track_repository import (
    get_active_tracks,
    get_track_by_domain,
    get_track_by_id,
    get_track_modules,
)
from app.repositories.learning_path_repository import (
    archive_current_paths,
    bulk_insert_path_modules,
    create_path,
    get_current_path,
    get_path_history,
    get_path_modules,
)
from app.repositories.module_repository import get_module_by_id, list_active_modules
from app.repositories.progress_repository import get_path_progress, initialize_progress_for_path
from app.repositories.skill_gap_repository import get_gap_modules, get_skill_gap_by_student
from app.repositories.student_repository import get_student_by_id
from app.schemas.career_track import CareerTrackListResponse, CareerTrackModulesResponse, CareerTrackSummary
from app.schemas.learning_path import (
    LearningPathGenerateResponse,
    LearningPathHistoryItem,
    LearningPathHistoryResponse,
    LearningPathModuleItem,
    LearningPathResponse,
)
from app.schemas.module import ModuleResponse


async def generate_learning_path(db: AsyncSession, student_id: int) -> LearningPathGenerateResponse:
    student = await get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    ordered_module_ids: list[int] = []
    seen: set[int] = set()

    def add_module(mid: int) -> None:
        if mid not in seen:
            seen.add(mid)
            ordered_module_ids.append(mid)

    gap = await get_skill_gap_by_student(db, student_id)

    if gap and gap.attendance_at_risk:
        all_mods = await list_active_modules(db)
        for module in all_mods:
            if module.category == ModuleCategory.ATTENDANCE_RECOVERY:
                add_module(module.module_id)

    if gap:
        gap_modules = await get_gap_modules(db, gap.gap_id)
        for gm in sorted(gap_modules, key=lambda x: x.priority):
            add_module(gm.module_id)

    if student.career_goal:
        track = await get_track_by_domain(db, student.career_goal)
        if track:
            track_mods = await get_track_modules(db, track.track_id)
            for tm in track_mods:
                add_module(tm.module_id)

    for interest in (student.interests or []):
        track = await get_track_by_domain(db, interest)
        if track:
            track_mods = await get_track_modules(db, track.track_id)
            for tm in track_mods:
                add_module(tm.module_id)

    if not ordered_module_ids:
        raise HTTPException(
            status_code=400,
            detail="Insufficient profile or academic data to generate a learning path.",
        )

    await archive_current_paths(db, student_id)
    path = await create_path(db, student_id)
    entries = [{"module_id": mid, "sequence_order": idx + 1} for idx, mid in enumerate(ordered_module_ids)]
    await bulk_insert_path_modules(db, path.path_id, entries)
    await initialize_progress_for_path(db, student_id, path.path_id, ordered_module_ids)
    await db.commit()

    return LearningPathGenerateResponse(
        path_id=path.path_id,
        module_count=len(ordered_module_ids),
        generated_at=path.generated_at,
        message="Learning path generated successfully.",
    )


async def get_current_learning_path(db: AsyncSession, student_id: int) -> LearningPathResponse:
    path = await get_current_path(db, student_id)
    if not path:
        raise HTTPException(status_code=404, detail="No learning path generated yet.")

    path_modules = await get_path_modules(db, path.path_id)
    progress_list = await get_path_progress(db, student_id, path.path_id)
    status_map = {p.module_id: p.status for p in progress_list}

    modules: list[LearningPathModuleItem] = []
    for pm in path_modules:
        mod = await get_module_by_id(db, pm.module_id)
        if mod:
            modules.append(
                LearningPathModuleItem(
                    module_id=mod.module_id,
                    title=mod.title,
                    category=mod.category,
                    domain=mod.domain,
                    level=mod.level,
                    estimated_hours=mod.estimated_hours,
                    status=status_map.get(mod.module_id, "not_started"),
                    sequence_order=pm.sequence_order,
                )
            )

    return LearningPathResponse(
        path_id=path.path_id,
        student_id=student_id,
        generated_at=path.generated_at,
        completion_pct=float(path.completion_pct),
        modules=modules,
    )


async def get_learning_path_history(db: AsyncSession, student_id: int) -> LearningPathHistoryResponse:
    paths = await get_path_history(db, student_id)
    items: list[LearningPathHistoryItem] = []
    for p in paths:
        path_modules = await get_path_modules(db, p.path_id)
        items.append(
            LearningPathHistoryItem(
                path_id=p.path_id,
                generated_at=p.generated_at,
                completion_pct=float(p.completion_pct),
                module_count=len(path_modules),
                is_current=p.is_current,
            )
        )
    return LearningPathHistoryResponse(paths=items)


async def get_active_career_tracks(db: AsyncSession) -> CareerTrackListResponse:
    tracks = await get_active_tracks(db)
    items: list[CareerTrackSummary] = []
    for t in tracks:
        mods = await get_track_modules(db, t.track_id)
        items.append(
            CareerTrackSummary(
                track_id=t.track_id,
                domain=t.domain,
                description=t.description,
                module_count=len(mods),
            )
        )
    return CareerTrackListResponse(tracks=items)


async def get_career_track_modules_detail(db: AsyncSession, track_id: int) -> CareerTrackModulesResponse:
    track = await get_track_by_id(db, track_id)
    if not track or not track.is_active:
        raise HTTPException(status_code=404, detail="Career track not found")

    track_mods = await get_track_modules(db, track_id)
    modules: list[ModuleResponse] = []
    for tm in track_mods:
        mod = await get_module_by_id(db, tm.module_id)
        if mod:
            modules.append(
                ModuleResponse(
                    module_id=mod.module_id,
                    title=mod.title,
                    category=mod.category,
                    domain=mod.domain,
                    level=mod.level,
                    estimated_hours=mod.estimated_hours,
                    sequence_order=tm.sequence_order,
                )
            )

    return CareerTrackModulesResponse(track_id=track.track_id, domain=track.domain, modules=modules)
