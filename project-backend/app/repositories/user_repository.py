from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
    result = await db.execute(select(User).where(User.user_id == user_id))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, email: str, password_hash: str, full_name: str, role: str) -> User:
    user = User(email=email, password_hash=password_hash, full_name=full_name, role=role)
    db.add(user)
    await db.flush()
    return user


async def list_users(
    db: AsyncSession,
    page: int,
    limit: int,
    role_filter: str | None = None,
) -> tuple[int, list[User]]:
    q = select(User)
    if role_filter:
        q = q.where(User.role == role_filter)

    total_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_result.scalar_one()

    q = q.offset((page - 1) * limit).limit(limit)
    result = await db.execute(q)
    return total, list(result.scalars().all())


async def deactivate_user(db: AsyncSession, user_id: int) -> User | None:
    user = await get_user_by_id(db, user_id)
    if user:
        user.is_active = False
        await db.flush()
    return user
