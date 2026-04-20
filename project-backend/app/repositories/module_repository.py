from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.module import Module


async def get_module_by_id(db: AsyncSession, module_id: int) -> Module | None:
    result = await db.execute(select(Module).where(Module.module_id == module_id))
    return result.scalar_one_or_none()


async def get_modules_by_ids(db: AsyncSession, ids: list[int]) -> list[Module]:
    result = await db.execute(select(Module).where(Module.module_id.in_(ids)))
    return list(result.scalars().all())


async def list_active_modules(db: AsyncSession) -> list[Module]:
    result = await db.execute(select(Module).where(Module.is_active == True))
    return list(result.scalars().all())
