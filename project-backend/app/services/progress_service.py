from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.learning_path_repository import get_current_path, get_path_modules, update_path_completion
from app.repositories.module_repository import get_module_by_id
from app.repositories.progress_repository import count_by_status, get_path_progress, upsert_progress
from app.schemas.progress import ProgressModuleStatus, ProgressSummaryResponse, ProgressUpdateResponse


async def update_module_status(
    db: AsyncSession,
    student_id: int,
    module_id: int,
    status: str,
) -> ProgressUpdateResponse:
    path = await get_current_path(db, student_id)
    if not path:
        raise HTTPException(status_code=404, detail="No active learning path found")

    path_modules = await get_path_modules(db, path.path_id)
    module_ids_in_path = {pm.module_id for pm in path_modules}
    if module_id not in module_ids_in_path:
        raise HTTPException(status_code=403, detail="Module does not belong to your active learning path")

    prog = await upsert_progress(db, student_id, module_id, path.path_id, status)
    counts = await count_by_status(db, student_id, path.path_id)
    total = sum(counts.values())
    completion_pct = round(counts["completed"] / total * 100, 2) if total > 0 else 0.0

    await update_path_completion(db, path.path_id, completion_pct)
    await db.commit()

    return ProgressUpdateResponse(
        progress_id=prog.progress_id,
        module_id=module_id,
        status=prog.status,
        updated_at=prog.updated_at,
        new_completion_pct=completion_pct,
    )


async def get_progress_summary(db: AsyncSession, student_id: int) -> ProgressSummaryResponse:
    path = await get_current_path(db, student_id)
    if not path:
        raise HTTPException(status_code=404, detail="No active learning path found")

    counts = await count_by_status(db, student_id, path.path_id)
    progress_records = await get_path_progress(db, student_id, path.path_id)

    modules: list[ProgressModuleStatus] = []
    for prog in progress_records:
        mod = await get_module_by_id(db, prog.module_id)
        if mod:
            modules.append(
                ProgressModuleStatus(
                    module_id=mod.module_id,
                    title=mod.title,
                    category=mod.category,
                    domain=mod.domain,
                    status=prog.status,
                    updated_at=prog.updated_at,
                )
            )

    total = sum(counts.values())
    return ProgressSummaryResponse(
        path_id=path.path_id,
        completion_pct=float(path.completion_pct),
        total_modules=total,
        completed=counts["completed"],
        in_progress=counts["in_progress"],
        not_started=counts["not_started"],
        modules=modules,
    )
